/* =========================================================
   KHET2GHAR FARMER SITE
   dashboard.js
   REAL SUPABASE DASHBOARD
   ORDERS + EARNINGS FIX
   ========================================================= */

import { supabase } from "./supabase.js";
import { formatRupees, showEmptyState, escapeHTML } from "./app.js";

let dashboardData = {
    products: [],
    orders: [],
    earnings: 0
};

let currentFarmer = null;

document.addEventListener("DOMContentLoaded", async () => {
    await loadDashboard();
});


/* =========================================================
   LOAD DASHBOARD
   ========================================================= */

async function loadDashboard() {
    try {
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();

        if (userError) {
            throw userError;
        }

        if (!user) {
            window.location.href = "index.html";
            return;
        }

        /* -----------------------------------------------
           FIND FARMER PROFILE
        ------------------------------------------------ */

        const { data: farmer, error: farmerError } = await supabase
            .from("farmers")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (farmerError) {
            throw farmerError;
        }

        if (!farmer) {
            console.warn("Farmer profile not found.");
            return;
        }

        currentFarmer = farmer;

        /* -----------------------------------------------
           LOAD PRODUCTS FIRST
           Orders depend on farmer's products
        ------------------------------------------------ */

        await loadProducts();

        /* -----------------------------------------------
           LOAD ORDERS
        ------------------------------------------------ */

        await loadOrders();

        /* -----------------------------------------------
           UPDATE DASHBOARD
        ------------------------------------------------ */

        updateStats();
        displayRecentOrders();

    } catch (error) {
        console.error("Dashboard loading error:", error);
    }
}


/* =========================================================
   LOAD FARMER PRODUCTS
   ========================================================= */

async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from("products")
            .select(`
                id,
                farmer_id,
                name,
                price_per_unit,
                stock,
                is_active,
                is_available,
                created_at
            `)
            .eq("farmer_id", currentFarmer.id);

        if (error) {
            throw error;
        }

        dashboardData.products = data || [];

    } catch (error) {
        console.error("Products loading error:", error);
        dashboardData.products = [];
    }
}


/* =========================================================
   LOAD FARMER ORDERS
   ========================================================= */

async function loadOrders() {
    try {
        if (!currentFarmer) {
            dashboardData.orders = [];
            dashboardData.earnings = 0;
            return;
        }

        let allOrders = [];

        /* -------------------------------------------------
           METHOD 1
           Try direct farmer_id relationship
        ------------------------------------------------- */

        try {
            const {
                data: farmerOrders,
                error: farmerOrdersError
            } = await supabase
                .from("orders")
                .select("*")
                .eq("farmer_id", currentFarmer.id)
                .order("created_at", { ascending: false });

            if (!farmerOrdersError && Array.isArray(farmerOrders)) {
                allOrders.push(...farmerOrders);
            }
        } catch (error) {
            console.warn(
                "Direct farmer_id order loading failed:",
                error
            );
        }


        /* -------------------------------------------------
           METHOD 2
           Find orders through farmer's products

           farmer
              ↓
           products.farmer_id
              ↓
           products.id
              ↓
           orders.product_id
        ------------------------------------------------- */

        const productIds = (dashboardData.products || [])
            .map(product => product.id)
            .filter(Boolean);


        if (productIds.length > 0) {

            try {
                const {
                    data: productOrders,
                    error: productOrdersError
                } = await supabase
                    .from("orders")
                    .select("*")
                    .in("product_id", productIds)
                    .order("created_at", { ascending: false });

                if (!productOrdersError && Array.isArray(productOrders)) {
                    allOrders.push(...productOrders);
                }

            } catch (error) {
                console.warn(
                    "Product based order loading failed:",
                    error
                );
            }
        }


        /* -------------------------------------------------
           REMOVE DUPLICATE ORDERS

           Same order may be returned by both queries.
        ------------------------------------------------- */

        const uniqueOrders = [];
        const orderIds = new Set();

        allOrders.forEach(order => {

            const id =
                order.id ||
                order.order_id ||
                `${order.created_at || ""}-${order.product_id || ""}-${order.total_amount || order.amount || ""}`;

            if (!orderIds.has(id)) {
                orderIds.add(id);
                uniqueOrders.push(order);
            }
        });


        /* -------------------------------------------------
           SORT NEWEST FIRST
        ------------------------------------------------- */

        uniqueOrders.sort((a, b) => {

            const dateA = new Date(
                a.created_at ||
                a.date ||
                a.order_date ||
                0
            ).getTime();

            const dateB = new Date(
                b.created_at ||
                b.date ||
                b.order_date ||
                0
            ).getTime();

            return dateB - dateA;
        });


        dashboardData.orders = uniqueOrders;

        /* -------------------------------------------------
           CALCULATE EARNINGS FROM LOADED ORDERS
        ------------------------------------------------- */

        dashboardData.earnings =
            calculateEarnings(dashboardData.orders);


        console.log(
            "Farmer orders loaded:",
            dashboardData.orders
        );

        console.log(
            "Farmer earnings:",
            dashboardData.earnings
        );

    } catch (error) {

        console.error(
            "Orders loading error:",
            error
        );

        dashboardData.orders = [];
        dashboardData.earnings = 0;
    }
}


/* =========================================================
   CALCULATE EARNINGS
   ========================================================= */

function calculateEarnings(orders) {

    if (!Array.isArray(orders)) {
        return 0;
    }

    return orders
        .filter(order => {

            const status = String(
                order.status ||
                order.order_status ||
                ""
            ).toLowerCase().trim();

            return (
                status === "completed" ||
                status === "delivered"
            );

        })
        .reduce((total, order) => {

            const amount = Number(
                order.total_amount ??
                order.amount ??
                order.total ??
                order.price ??
                order.order_total ??
                0
            );

            return total +
                (Number.isFinite(amount) ? amount : 0);

        }, 0);
}


/* =========================================================
   UPDATE DASHBOARD STATS
   ========================================================= */

function updateStats() {

    const totalProducts =
        document.getElementById("totalProducts");

    const newOrders =
        document.getElementById("newOrders");

    const totalEarnings =
        document.getElementById("totalEarnings");


    /* -----------------------------------------------
       PRODUCTS
    ------------------------------------------------ */

    if (totalProducts) {
        totalProducts.textContent =
            dashboardData.products.length;
    }


    /* -----------------------------------------------
       PENDING / NEW ORDERS
    ------------------------------------------------ */

    if (newOrders) {

        const pendingOrders =
            dashboardData.orders.filter(order => {

                const status = String(
                    order.status ||
                    order.order_status ||
                    ""
                ).toLowerCase().trim();

                return (
                    status === "new" ||
                    status === "pending"
                );

            }).length;

        newOrders.textContent = pendingOrders;
    }


    /* -----------------------------------------------
       EARNINGS
    ------------------------------------------------ */

    if (totalEarnings) {

        totalEarnings.textContent =
            formatRupees(
                dashboardData.earnings
            );
    }
}


/* =========================================================
   DISPLAY RECENT ORDERS
   ========================================================= */

function displayRecentOrders() {

    const container =
        document.getElementById("recentOrders");

    if (!container) {
        return;
    }


    /* -----------------------------------------------
       EMPTY STATE
    ------------------------------------------------ */

    if (
        !dashboardData.orders ||
        dashboardData.orders.length === 0
    ) {

        showEmptyState(
            "recentOrders",
            "📦",
            "No orders yet",
            "Your customer orders will appear here."
        );

        return;
    }


    /* -----------------------------------------------
       GET LATEST 5 ORDERS
    ------------------------------------------------ */

    const recentOrders =
        [...dashboardData.orders]
            .sort((a, b) => {

                const dateA = new Date(
                    a.created_at ||
                    a.date ||
                    a.order_date ||
                    0
                ).getTime();

                const dateB = new Date(
                    b.created_at ||
                    b.date ||
                    b.order_date ||
                    0
                ).getTime();

                return dateB - dateA;

            })
            .slice(0, 5);


    container.innerHTML = "";


    /* -----------------------------------------------
       RENDER ORDERS
    ------------------------------------------------ */

    recentOrders.forEach(order => {

        const orderElement =
            document.createElement("div");

        orderElement.className =
            "recent-order";


        /* -------------------------------------------
           PRODUCT NAME
        -------------------------------------------- */

        const productName =
            order.product_name ||
            order.product ||
            order.name ||
            "Product Order";


        /* -------------------------------------------
           CUSTOMER NAME
        -------------------------------------------- */

        const customerName =
            order.customer_name ||
            order.customer ||
            order.customerName ||
            "Customer";


        /* -------------------------------------------
           AMOUNT
        -------------------------------------------- */

        const amount =
            Number(
                order.total_amount ??
                order.amount ??
                order.total ??
                order.price ??
                order.order_total ??
                0
            );


        /* -------------------------------------------
           STATUS
        -------------------------------------------- */

        const orderStatus =
            order.order_status ||
            order.status ||
            "pending";


        /* -------------------------------------------
           HTML
        -------------------------------------------- */

        orderElement.innerHTML = `
            <div class="order-icon">
                📦
            </div>

            <div class="order-info">
                <h3>
                    ${escapeHTML(productName)}
                </h3>

                <p>
                    ${escapeHTML(customerName)}
                </p>
            </div>

            <div class="order-right">

                <strong>
                    ${formatRupees(amount)}
                </strong>

                <span class="order-status ${getStatusClass(orderStatus)}">
                    ${formatStatus(orderStatus)}
                </span>

            </div>
        `;


        container.appendChild(orderElement);
    });
}


/* =========================================================
   ORDER STATUS CLASS
   ========================================================= */

function getStatusClass(status) {

    if (!status) {
        return "pending";
    }

    switch (
        String(status)
            .toLowerCase()
            .trim()
    ) {

        case "new":
            return "new";

        case "pending":
            return "pending";

        case "confirmed":
            return "confirmed";

        case "completed":
        case "delivered":
            return "completed";

        case "cancelled":
        case "canceled":
            return "cancelled";

        case "shipped":
        case "in_transit":
        case "in transit":
            return "confirmed";

        default:
            return "pending";
    }
}


/* =========================================================
   FORMAT STATUS
   ========================================================= */

function formatStatus(status) {

    if (!status) {
        return "Pending";
    }

    const text =
        String(status)
            .replace(/_/g, " ")
            .trim();

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}


/* =========================================================
   GLOBAL
   ========================================================= */

window.loadDashboard = loadDashboard;

export {
    loadDashboard
};
