/* =========================================================
   KHET2GHAR FARMER
   earnings.js
   REAL SUPABASE EARNINGS
   ========================================================= */

import { supabase } from "./supabase.js";


let allEarnings = [];
let currentFarmer = null;


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            currentFarmer =
                await getCurrentFarmer();

            await loadEarnings();

            setupEarningsSearch();
            setupEarningsFilter();

        } catch (error) {

            console.error(
                "Earnings page error:",
                error
            );

            showEarningsError(
                error?.message ||
                "Unable to load earnings."
            );
        }
    }
);


/* =========================================================
   GET CURRENT FARMER
   ========================================================= */

async function getCurrentFarmer() {

    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();


    if (userError) {
        throw userError;
    }


    if (!user) {

        window.location.replace(
            "index.html"
        );

        throw new Error(
            "Please login first."
        );
    }


    const {
        data: farmer,
        error: farmerError
    } = await supabase
        .from("farmers")
        .select("*")
        .eq(
            "user_id",
            user.id
        )
        .maybeSingle();


    if (farmerError) {
        throw farmerError;
    }


    if (!farmer) {
        throw new Error(
            "Farmer profile not found."
        );
    }


    return farmer;
}


/* =========================================================
   LOAD EARNINGS
   ========================================================= */

async function loadEarnings() {

    if (!currentFarmer?.id) {
        throw new Error(
            "Farmer ID not found."
        );
    }


    const {
        data: orders,
        error
    } = await supabase
        .from("orders")
        .select(`
            id,
            consumer_id,
            customer_name,
            customer_mobile,
            farmer_id,
            product_id,
            quantity,
            price_per_unit,
            subtotal,
            delivery_fee,
            discount,
            total_amount,
            payment_status,
            order_status,
            status,
            created_at,
            updated_at
        `)
        .eq(
            "farmer_id",
            currentFarmer.id
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Earnings orders error:",
            error
        );

        throw error;
    }


    /*
     * Earnings only come from completed
     * / delivered orders.
     */

    allEarnings =
        (orders || [])
            .filter(
                isCompletedOrder
            );


    /*
     * Load product names.
     *
     * Failure here must NOT destroy
     * earnings data.
     */

    const productIds =
        [
            ...new Set(
                allEarnings
                    .map(
                        order =>
                            order.product_id
                    )
                    .filter(Boolean)
            )
        ];


    if (productIds.length > 0) {

        try {

            const {
                data: products,
                error: productsError
            } = await supabase
                .from("products")
                .select(`
                    id,
                    name,
                    unit
                `)
                .in(
                    "id",
                    productIds
                );


            if (productsError) {

                console.error(
                    "Earnings product error:",
                    productsError
                );

            } else {

                const productMap =
                    new Map(
                        (products || []).map(
                            product => [
                                String(product.id),
                                product
                            ]
                        )
                    );


                allEarnings =
                    allEarnings.map(
                        order => ({
                            ...order,

                            product:
                                productMap.get(
                                    String(
                                        order.product_id
                                    )
                                ) || null
                        })
                    );
            }

        } catch (error) {

            console.error(
                "Product lookup failed:",
                error
            );
        }
    }


    updateEarningsSummary();

    renderEarnings(
        allEarnings
    );
}


/* =========================================================
   CHECK COMPLETED ORDER
   ========================================================= */

function isCompletedOrder(order) {

    const status =
        String(
            order?.order_status ||
            order?.status ||
            ""
        )
            .trim()
            .toLowerCase();


    return (
        status === "completed" ||
        status === "delivered"
    );
}


/* =========================================================
   GET ORDER AMOUNT
   ========================================================= */

function getOrderAmount(order) {

    const total =
        Number(
            order?.total_amount
        );


    if (
        Number.isFinite(total) &&
        total >= 0
    ) {
        return total;
    }


    const subtotal =
        Number(
            order?.subtotal
        );


    if (
        Number.isFinite(subtotal) &&
        subtotal >= 0
    ) {
        return subtotal;
    }


    const price =
        Number(
            order?.price_per_unit
        );


    const quantity =
        Number(
            order?.quantity || 1
        );


    const calculated =
        price * quantity;


    return Number.isFinite(
        calculated
    )
        ? calculated
        : 0;
}


/* =========================================================
   UPDATE SUMMARY
   ========================================================= */

function updateEarningsSummary() {

    const total =
        allEarnings.reduce(
            (sum, order) =>
                sum +
                getOrderAmount(order),
            0
        );


    const now =
        new Date();


    const currentYear =
        now.getFullYear();


    const currentMonth =
        now.getMonth();


    const monthly =
        allEarnings
            .filter(order => {

                const date =
                    new Date(
                        order.created_at
                    );


                return (
                    !Number.isNaN(
                        date.getTime()
                    ) &&
                    date.getFullYear() ===
                        currentYear &&
                    date.getMonth() ===
                        currentMonth
                );

            })
            .reduce(
                (sum, order) =>
                    sum +
                    getOrderAmount(order),
                0
            );


    const totalElement =
        document.getElementById(
            "totalEarnings"
        );


    const monthlyElement =
        document.getElementById(
            "monthlyEarnings"
        );


    const completedElement =
        document.getElementById(
            "completedOrders"
        );


    if (totalElement) {

        totalElement.textContent =
            formatRupees(total);
    }


    if (monthlyElement) {

        monthlyElement.textContent =
            formatRupees(monthly);
    }


    if (completedElement) {

        completedElement.textContent =
            allEarnings.length;
    }
}


/* =========================================================
   RENDER EARNINGS
   ========================================================= */

function renderEarnings(
    earnings
) {

    const container =
        document.getElementById(
            "earningsContainer"
        );


    const emptyState =
        document.getElementById(
            "emptyEarnings"
        );


    if (!container) {
        return;
    }


    if (
        !earnings ||
        earnings.length === 0
    ) {

        container.style.display =
            "none";


        if (emptyState) {

            emptyState.style.display =
                "block";
        }

        return;
    }


    if (emptyState) {

        emptyState.style.display =
            "none";
    }


    container.style.display =
        "grid";


    container.innerHTML =
        earnings
            .map(
                createEarningCard
            )
            .join("");
}


/* =========================================================
   CREATE EARNING CARD
   ========================================================= */

function createEarningCard(
    order
) {

    const orderId =
        String(
            order.id || ""
        )
            .slice(0, 8)
            .toUpperCase();


    const date =
        formatDate(
            order.created_at
        );


    const product =
        order.product || {};


    const productName =
        escapeHTML(
            product.name ||
            order.product_name ||
            "Farm Produce"
        );


    const quantity =
        Number(
            order.quantity || 1
        );


    const unit =
        escapeHTML(
            product.unit || ""
        );


    const amount =
        getOrderAmount(order);


    const customer =
        escapeHTML(
            order.customer_name ||
            "Customer"
        );


    const paymentStatus =
        escapeHTML(
            order.payment_status ||
            "completed"
        );


    return `
        <article class="product-card">

            <div class="product-card-header">

                <div>

                    <span class="product-category">
                        COMPLETED SALE
                    </span>

                    <h3>
                        Order #${orderId}
                    </h3>

                </div>

                <span class="order-status status-completed">
                    Completed
                </span>

            </div>


            <div class="order-date">
                📅 ${date}
            </div>


            <div class="order-details">

                <div>

                    <span>Product</span>

                    <strong>
                        ${productName}
                    </strong>

                </div>


                <div>

                    <span>Buyer</span>

                    <strong>
                        ${customer}
                    </strong>

                </div>

            </div>


            <div class="order-items">

                <div class="order-item">

                    <div class="order-item-info">

                        <strong>
                            ${productName}
                        </strong>

                        <small>
                            ${quantity}
                            ${unit ? ` ${unit}` : ""}
                            ×
                            ${formatRupees(
                                order.price_per_unit
                            )}
                        </small>

                    </div>


                    <strong>
                        ${formatRupees(amount)}
                    </strong>

                </div>

            </div>


            <div class="order-total">

                <span>
                    Earning
                </span>

                <strong>
                    ${formatRupees(amount)}
                </strong>

            </div>


            <div class="order-notes">

                💳 Payment:
                ${capitalize(paymentStatus)}

            </div>

        </article>
    `;
}


/* =========================================================
   SEARCH
   ========================================================= */

function setupEarningsSearch() {

    const input =
        document.getElementById(
            "earningSearch"
        );


    input?.addEventListener(
        "input",
        applyEarningsFilters
    );
}


/* =========================================================
   FILTER
   ========================================================= */

function setupEarningsFilter() {

    const filter =
        document.getElementById(
            "earningFilter"
        );


    filter?.addEventListener(
        "change",
        applyEarningsFilters
    );
}


/* =========================================================
   APPLY SEARCH + DATE FILTER
   ========================================================= */

function applyEarningsFilters() {

    const search =
        document
            .getElementById(
                "earningSearch"
            )
            ?.value
            ?.trim()
            .toLowerCase() || "";


    const filter =
        document
            .getElementById(
                "earningFilter"
            )
            ?.value
            ?.toLowerCase() ||
        "all";


    const filtered =
        allEarnings.filter(
            order => {

                const orderId =
                    String(
                        order.id || ""
                    ).toLowerCase();


                const productName =
                    String(
                        order.product?.name ||
                        order.product_name ||
                        ""
                    ).toLowerCase();


                const customerName =
                    String(
                        order.customer_name ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    orderId.includes(
                        search
                    ) ||
                    productName.includes(
                        search
                    ) ||
                    customerName.includes(
                        search
                    );


                const matchesDate =
                    matchesDateFilter(
                        order,
                        filter
                    );


                return (
                    matchesSearch &&
                    matchesDate
                );
            }
        );


    renderEarnings(
        filtered
    );
}


/* =========================================================
   DATE FILTER
   ========================================================= */

function matchesDateFilter(
    order,
    filter
) {

    if (filter === "all") {
        return true;
    }


    const orderDate =
        new Date(
            order.created_at
        );


    if (
        Number.isNaN(
            orderDate.getTime()
        )
    ) {
        return false;
    }


    const now =
        new Date();


    if (filter === "today") {

        return (
            orderDate.getFullYear() ===
                now.getFullYear() &&
            orderDate.getMonth() ===
                now.getMonth() &&
            orderDate.getDate() ===
                now.getDate()
        );
    }


    if (filter === "month") {

        return (
            orderDate.getFullYear() ===
                now.getFullYear() &&
            orderDate.getMonth() ===
                now.getMonth()
        );
    }


    if (filter === "week") {

        const start =
            new Date(now);


        const day =
            start.getDay();


        const diff =
            day === 0
                ? 6
                : day - 1;


        start.setDate(
            start.getDate() - diff
        );


        start.setHours(
            0,
            0,
            0,
            0
        );


        const end =
            new Date(start);


        end.setDate(
            end.getDate() + 7
        );


        return (
            orderDate >= start &&
            orderDate < end
        );
    }


    return true;
}


/* =========================================================
   ERROR STATE
   ========================================================= */

function showEarningsError(
    message
) {

    const container =
        document.getElementById(
            "earningsContainer"
        );


    const emptyState =
        document.getElementById(
            "emptyEarnings"
        );


    if (container) {

        container.style.display =
            "none";
    }


    if (emptyState) {

        emptyState.style.display =
            "block";


        emptyState.innerHTML = `
            <div class="empty-icon">
                ⚠️
            </div>

            <h2>
                Unable to Load Earnings
            </h2>

            <p>
                ${escapeHTML(message)}
            </p>

            <button
                class="primary-btn"
                onclick="location.reload()"
            >
                Try Again
            </button>
        `;
    }
}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(
    dateValue
) {

    if (!dateValue) {
        return "Unknown date";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Unknown date";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   RUPEE FORMAT
   ========================================================= */

function formatRupees(
    amount
) {

    const value =
        Number(amount) || 0;


    return (
        "₹" +
        value.toLocaleString(
            "en-IN"
        )
    );
}


/* =========================================================
   CAPITALIZE
   ========================================================= */

function capitalize(
    value
) {

    if (!value) {
        return "";
    }


    const text =
        String(value);


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   GLOBAL REFRESH
   ========================================================= */

window.loadEarnings =
    loadEarnings;
