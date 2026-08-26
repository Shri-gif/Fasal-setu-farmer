/* =========================================================
   KHET2GHAR FARMER SITE
   dashboard.js
   REAL SUPABASE DASHBOARD
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

async function loadDashboard() {
    try {
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
            window.location.href = "index.html";
            return;
        }

        const {
            data: farmer,
            error: farmerError
        } = await supabase
            .from("farmers")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (farmerError) throw farmerError;

        if (!farmer) {
            console.warn(
                "Farmer profile not found. Displaying empty dashboard."
            );

            dashboardData.products = [];
            dashboardData.orders = [];
            dashboardData.earnings = 0;

            updateStats();
            displayRecentOrders();
            return;
        }

        currentFarmer = farmer;

        await Promise.all([
            loadProducts(),
            loadOrders()
        ]);

        updateStats();
        displayRecentOrders();

    } catch (error) {
        console.error(
            "Dashboard loading error:",
            error
        );
    }
}


/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

async function loadProducts() {
    try {
        if (!currentFarmer?.id) {
            dashboardData.products = [];
            return;
        }

        const {
            data,
            error
        } = await supabase
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

        if (error) throw error;

        dashboardData.products = data || [];

    } catch (error) {
        console.error(
            "Products loading error:",
            error
        );

        dashboardData.products = [];
    }
}


/* =========================================================
   LOAD ORDERS
   ========================================================= */

async function loadOrders() {
    try {
        if (!currentFarmer?.id) {
            dashboardData.orders = [];
            dashboardData.earnings = 0;
            return;
        }

        /*
         * ---------------------------------------------------
         * STEP 1
         * Get all products belonging to the logged-in farmer.
         *
         * This gives us the product IDs that belong to this
         * farmer.
         * ---------------------------------------------------
         */

        const {
            data: farmerProducts,
            error: farmerProductsError
        } = await supabase
            .from("products")
            .select("id")
            .eq("farmer_id", currentFarmer.id);

        if (farmerProductsError) {
            throw farmerProductsError;
        }

        const productIds = (farmerProducts || [])
            .map(product => product.id)
            .filter(Boolean);


        /*
         * ---------------------------------------------------
         * STEP 2
         * First try the normal farmer_id relationship.
         *
         * New orders should contain farmer_id.
         * ---------------------------------------------------
         */

        let orders = [];

        const {
            data: farmerOrders,
            error: farmerOrdersError
        } = await supabase
            .from("orders")
            .select("*")
            .eq("farmer_id", currentFarmer.id)
            .order("created_at", {
                ascending: false
            });

        if (!farmerOrdersError) {
            orders = farmerOrders || [];
        } else {
            console.warn(
                "Orders by farmer_id failed:",
                farmerOrdersError
            );
        }


        /*
         * ---------------------------------------------------
         * STEP 3
         * Fallback:
         *
         * Some existing orders may have product_id correctly
         * stored but farmer_id missing/incorrect.
         *
         * In that case load orders using this farmer's
         * product IDs.
         * ---------------------------------------------------
         */

        if (orders.length === 0 && productIds.length > 0) {

            const {
                data: productOrders,
                error: productOrdersError
            } = await supabase
                .from("orders")
                .select("*")
                .in("product_id", productIds)
                .order("created_at", {
                    ascending: false
                });

            if (!productOrdersError) {
                orders = productOrders || [];
            } else {
                console.warn(
                    "Orders by product_id failed:",
                    productOrdersError
                );
            }
        }


        /*
         * ---------------------------------------------------
         * STEP 4
         * Remove duplicate orders.
         *
         * This is important when fallback data overlaps with
         * already-loaded orders.
         * ---------------------------------------------------
         */

        const uniqueOrders = [];
        const seenOrderIds = new Set();

        for (const order of orders) {

            const orderId = String(
                order.id ||
                order.order_id ||
                `${order.product_id}-${order.created_at}`
            );

            if (!seenOrderIds.has(orderId)) {
                seenOrderIds.add(orderId);
                uniqueOrders.push(order);
            }
        }

        orders = uniqueOrders;


        /*
         * ---------------------------------------------------
         * STEP 5
         * Load product details for the orders.
         *
         * This allows the dashboard to display the actual
         * product name when product_name is not directly
         * stored in the orders table.
         * ---------------------------------------------------
         */

        if (orders.length > 0 && productIds.length > 0) {

            const orderProductIds = [
                ...new Set(
                    orders
                        .map(order => order.product_id)
                        .filter(Boolean)
                        .map(id => String(id))
                )
            ];

            if (orderProductIds.length > 0) {

                const {
                    data: products,
                    error: productsError
                } = await supabase
                    .from("products")
                    .select(`
                        id,
                        name,
                        price_per_unit,
                        unit
                    `)
                    .in("id", orderProductIds);

                if (!productsError && products) {

                    const productMap = new Map();

                    products.forEach(product => {
                        productMap.set(
                            String(product.id),
                            product
                        );
                    });

                    orders = orders.map(order => {

                        const product =
                            productMap.get(
                                String(order.product_id)
                            );

                        return {
                            ...order,

                            product: product || null,

                            product_name:
                                order.product_name ||
                                product?.name ||
                                order.product ||
                                order.name ||
                                "Farm Produce"
                        };
                    });
                }
            }
        }


        /*
         * ---------------------------------------------------
         * STEP 6
         * Save final orders into dashboard state.
         * ---------------------------------------------------
         */

        dashboardData.orders = orders;

        dashboardData.earnings =
            calculateEarnings(
                dashboardData.orders
            );


        console.log(
            "Farmer orders loaded:",
            dashboardData.orders
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
            ).toLowerCase();

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
                0
            );

            return total +
                (
                    Number.isFinite(amount)
                        ? amount
                        : 0
                );

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


    if (totalProducts) {

        totalProducts.textContent =
            dashboardData.products.length;
    }


    if (newOrders) {

        const pendingOrders =
            dashboardData.orders.filter(order => {

                const status = String(
                    order.status ||
                    order.order_status ||
                    ""
                ).toLowerCase();

                return (
                    status === "new" ||
                    status === "pending"
                );
            }).length;

        newOrders.textContent =
            pendingOrders;
    }


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

    if (!container) return;


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


    const recentOrders =
        [...dashboardData.orders]
            .sort((a, b) => {

                return (
                    new Date(
                        b.created_at ||
                        b.date ||
                        0
                    ).getTime()
                    -
                    new Date(
                        a.created_at ||
                        a.date ||
                        0
                    ).getTime()
                );

            })
            .slice(0, 5);


    container.innerHTML = "";


    recentOrders.forEach(order => {

        const orderElement =
            document.createElement("div");

        orderElement.className =
            "recent-order";


        const productName =
            order.product_name ||
            order.product ||
            order.name ||
            "Product Order";


        const customerName =
            order.customer_name ||
            order.customer ||
            "Customer";


        const amount = Number(
            order.total_amount ??
            order.amount ??
            order.total ??
            order.price ??
            0
        );


        const orderStatus =
            order.order_status ||
            order.status ||
            "pending";


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

                <span
                    class="order-status ${getStatusClass(orderStatus)}"
                >
                    ${formatStatus(orderStatus)}
                </span>

            </div>

        `;


        container.appendChild(
            orderElement
        );
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
        String(status).toLowerCase()
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
            return "cancelled";

        default:
            return "pending";
    }
}


/* =========================================================
   FORMAT ORDER STATUS
   ========================================================= */

function formatStatus(status) {

    if (!status) {
        return "Pending";
    }

    const text =
        String(status);

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}


/* =========================================================
   GLOBAL EXPORT
   ========================================================= */

window.loadDashboard =
    loadDashboard;

export {
    loadDashboard
};
