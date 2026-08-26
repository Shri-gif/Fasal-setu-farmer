/* =========================================================
   KHET2GHAR FARMER
   orders.js
   REAL SUPABASE FARMER ORDERS
   ========================================================= */

import { supabase } from "./supabase.js";

let allOrders = [];
let currentFarmer = null;


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    try {
        currentFarmer = await getCurrentFarmer();

        await loadFarmerOrders();

        setupOrderSearch();
        setupOrderFilter();

    } catch (error) {
        console.error("Orders page error:", error);

        showOrdersError(
            error?.message || "Unable to load orders."
        );
    }
});


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
        window.location.replace("index.html");
        throw new Error("Please login first.");
    }


    const {
        data: farmer,
        error: farmerError
    } = await supabase
        .from("farmers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    if (farmerError) {
        throw farmerError;
    }

    if (!farmer) {
        throw new Error("Farmer profile not found.");
    }

    return farmer;
}


/* =========================================================
   LOAD FARMER ORDERS
   ========================================================= */

async function loadFarmerOrders() {

    if (!currentFarmer?.id) {
        throw new Error("Farmer ID not found.");
    }

    console.log(
        "Loading orders for farmer:",
        currentFarmer.id
    );


    /*
     * IMPORTANT:
     * Database structure used by this project:
     *
     * orders.farmer_id
     * orders.product_id
     * orders.customer_name
     * orders.customer_mobile
     * orders.quantity
     * orders.price_per_unit
     * orders.subtotal
     * orders.total_amount
     * orders.payment_status
     * orders.order_status
     * orders.status
     * orders.created_at
     */

    const {
        data: orders,
        error: ordersError
    } = await supabase
        .from("orders")
        .select(`
            id,
            consumer_id,
            customer_name,
            customer_mobile,
            delivery_address,
            city,
            pincode,
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
            delivery_slot,
            notes,
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


    if (ordersError) {
        console.error(
            "Supabase orders error:",
            ordersError
        );

        throw ordersError;
    }


    console.log(
        "Farmer orders loaded:",
        orders
    );


    allOrders = orders || [];


    /*
     * Load product information separately.
     *
     * If product loading fails, orders should
     * STILL remain visible.
     */

    const productIds = [
        ...new Set(
            allOrders
                .map(order => order.product_id)
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
                    image_url,
                    unit,
                    farm_location,
                    price_per_unit
                `)
                .in(
                    "id",
                    productIds
                );


            if (productsError) {
                console.error(
                    "Product loading error:",
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


                allOrders =
                    allOrders.map(order => ({
                        ...order,

                        product:
                            productMap.get(
                                String(order.product_id)
                            ) || null
                    }));
            }

        } catch (productError) {

            console.error(
                "Product lookup failed:",
                productError
            );

            /*
             * Do NOT clear orders.
             * Orders must still be displayed.
             */
        }
    }


    updateOrderSummary();

    renderOrders(allOrders);
}


/* =========================================================
   ORDER SUMMARY
   ========================================================= */

function updateOrderSummary() {

    const total =
        allOrders.length;


    const pending =
        allOrders.filter(order => {

            const status =
                getOrderStatus(order);

            return (
                status === "pending" ||
                status === "new" ||
                status === ""
            );

        }).length;


    const completed =
        allOrders.filter(order => {

            const status =
                getOrderStatus(order);

            return (
                status === "completed" ||
                status === "delivered"
            );

        }).length;


    const totalElement =
        document.getElementById(
            "totalOrders"
        );

    const pendingElement =
        document.getElementById(
            "pendingOrders"
        );

    const completedElement =
        document.getElementById(
            "completedOrders"
        );


    if (totalElement) {
        totalElement.textContent =
            total;
    }

    if (pendingElement) {
        pendingElement.textContent =
            pending;
    }

    if (completedElement) {
        completedElement.textContent =
            completed;
    }
}


/* =========================================================
   GET ORDER STATUS
   ========================================================= */

function getOrderStatus(order) {

    return String(
        order?.order_status ||
        order?.status ||
        "pending"
    )
        .trim()
        .toLowerCase();
}


/* =========================================================
   RENDER ORDERS
   ========================================================= */

function renderOrders(orders) {

    const container =
        document.getElementById(
            "ordersContainer"
        );

    const emptyState =
        document.getElementById(
            "emptyOrders"
        );


    if (!container) {
        return;
    }


    if (
        !orders ||
        orders.length === 0
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
        orders
            .map(order =>
                createOrderCard(order)
            )
            .join("");
}


/* =========================================================
   CREATE ORDER CARD
   ========================================================= */

function createOrderCard(order) {

    const status =
        getOrderStatus(order);


    const paymentStatus =
        String(
            order.payment_status ||
            "pending"
        )
            .toLowerCase();


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


    const unitPrice =
        Number(
            order.price_per_unit ??
            product.price_per_unit ??
            0
        );


    const subtotal =
        Number(
            order.subtotal ??
            (unitPrice * quantity) ??
            0
        );


    const totalAmount =
        Number(
            order.total_amount ??
            subtotal ??
            0
        );


    const customerName =
        escapeHTML(
            order.customer_name ||
            "Customer"
        );


    const customerMobile =
        escapeHTML(
            order.customer_mobile ||
            ""
        );


    const address =
        escapeHTML(
            order.delivery_address ||
            ""
        );


    const city =
        escapeHTML(
            order.city ||
            ""
        );


    const pincode =
        escapeHTML(
            order.pincode ||
            ""
        );


    const orderId =
        String(
            order.id || ""
        )
            .slice(0, 8)
            .toUpperCase();


    return `
        <article class="product-card order-card">

            <div class="product-card-header">

                <div>

                    <span class="product-category">
                        FASAL SETU ORDER
                    </span>

                    <h3>
                        Order #${orderId}
                    </h3>

                </div>

                <span class="order-status status-${escapeHTML(status)}">
                    ${capitalize(status)}
                </span>

            </div>


            <div class="order-date">
                📅 ${date}
            </div>


            <div class="order-details">

                <div>
                    <span>Customer</span>

                    <strong>
                        ${customerName}
                    </strong>
                </div>


                <div>
                    <span>Mobile</span>

                    <strong>
                        ${customerMobile || "Not provided"}
                    </strong>
                </div>

            </div>


            ${
                address ||
                city ||
                pincode
                    ? `
                        <div class="order-notes">
                            📍
                            ${address}
                            ${city ? `, ${city}` : ""}
                            ${pincode ? ` - ${pincode}` : ""}
                        </div>
                    `
                    : ""
            }


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
                            ${formatRupees(unitPrice)}
                        </small>

                    </div>


                    <strong>
                        ${formatRupees(subtotal)}
                    </strong>

                </div>

            </div>


            <div class="order-total">

                <span>
                    Total Amount
                </span>

                <strong>
                    ${formatRupees(totalAmount)}
                </strong>

            </div>


            <div class="order-notes">

                💳 Payment:
                ${capitalize(paymentStatus)}

            </div>


            <div
                style="
                    display:flex;
                    gap:8px;
                    margin-top:14px;
                    flex-wrap:wrap;
                "
            >

                ${
                    status !== "confirmed"
                        ? `
                            <button
                                type="button"
                                class="secondary-btn"
                                onclick="updateStatus('${escapeAttribute(order.id)}','confirmed')"
                                style="flex:1;"
                            >
                                ✓ Confirm
                            </button>
                        `
                        : ""
                }


                ${
                    status !== "shipped"
                        ? `
                            <button
                                type="button"
                                class="secondary-btn"
                                onclick="updateStatus('${escapeAttribute(order.id)}','shipped')"
                                style="flex:1;"
                            >
                                🚚 Ship
                            </button>
                        `
                        : ""
                }


                ${
                    status !== "delivered" &&
                    status !== "completed" &&
                    status !== "cancelled"
                        ? `
                            <button
                                type="button"
                                class="primary-btn"
                                onclick="updateStatus('${escapeAttribute(order.id)}','delivered')"
                                style="flex:1;min-height:40px;"
                            >
                                ✅ Deliver
                            </button>
                        `
                        : ""
                }

            </div>

        </article>
    `;
}


/* =========================================================
   UPDATE ORDER STATUS
   ========================================================= */

window.updateStatus =
    async function (
        orderId,
        newStatus
    ) {

        try {

            const {
                error
            } = await supabase
                .from("orders")
                .update({
                    status: newStatus,
                    order_status: newStatus
                })
                .eq(
                    "id",
                    orderId
                )
                .eq(
                    "farmer_id",
                    currentFarmer.id
                );


            /*
             * Some databases may use only
             * one of status/order_status.
             *
             * If combined update fails,
             * try status only.
             */

            if (error) {

                console.warn(
                    "Combined status update failed:",
                    error
                );


                const {
                    error: statusError
                } = await supabase
                    .from("orders")
                    .update({
                        status: newStatus
                    })
                    .eq(
                        "id",
                        orderId
                    )
                    .eq(
                        "farmer_id",
                        currentFarmer.id
                    );


                if (statusError) {
                    throw statusError;
                }
            }


            /*
             * Update local copy immediately.
             */

            allOrders =
                allOrders.map(order => {

                    if (
                        String(order.id) ===
                        String(orderId)
                    ) {

                        return {
                            ...order,
                            status: newStatus,
                            order_status: newStatus
                        };
                    }

                    return order;
                });


            updateOrderSummary();

            applyFilters();

        } catch (error) {

            console.error(
                "Status update error:",
                error
            );

            alert(
                error?.message ||
                "Could not update order status."
            );
        }
    };


/* =========================================================
   SEARCH
   ========================================================= */

function setupOrderSearch() {

    const input =
        document.getElementById(
            "orderSearch"
        );

    input?.addEventListener(
        "input",
        applyFilters
    );
}


/* =========================================================
   FILTER
   ========================================================= */

function setupOrderFilter() {

    const filter =
        document.getElementById(
            "orderFilter"
        );

    filter?.addEventListener(
        "change",
        applyFilters
    );
}


/* =========================================================
   APPLY SEARCH + FILTER
   ========================================================= */

function applyFilters() {

    const search =
        document
            .getElementById(
                "orderSearch"
            )
            ?.value
            ?.trim()
            .toLowerCase() || "";


    const selectedStatus =
        document
            .getElementById(
                "orderFilter"
            )
            ?.value
            ?.toLowerCase() ||
        "all";


    const filtered =
        allOrders.filter(order => {

            const status =
                getOrderStatus(order);


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


            const customerMobile =
                String(
                    order.customer_mobile ||
                    ""
                ).toLowerCase();


            const matchesSearch =
                !search ||
                orderId.includes(search) ||
                productName.includes(search) ||
                customerName.includes(search) ||
                customerMobile.includes(search);


            let matchesFilter =
                selectedStatus === "all" ||
                status === selectedStatus;


            if (
                selectedStatus === "completed" &&
                (
                    status === "completed" ||
                    status === "delivered"
                )
            ) {
                matchesFilter = true;
            }


            return (
                matchesSearch &&
                matchesFilter
            );
        });


    renderOrders(filtered);
}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function showEmptyOrders() {

    const container =
        document.getElementById(
            "ordersContainer"
        );

    const emptyState =
        document.getElementById(
            "emptyOrders"
        );


    if (container) {
        container.style.display =
            "none";
    }


    if (emptyState) {
        emptyState.style.display =
            "block";
    }
}


/* =========================================================
   ERROR STATE
   ========================================================= */

function showOrdersError(message) {

    const container =
        document.getElementById(
            "ordersContainer"
        );

    const emptyState =
        document.getElementById(
            "emptyOrders"
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
                Unable to Load Orders
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

function formatDate(dateValue) {

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

function formatRupees(amount) {

    const number =
        Number(amount) || 0;


    return (
        "₹" +
        number.toLocaleString(
            "en-IN"
        )
    );
}


/* =========================================================
   CAPITALIZE
   ========================================================= */

function capitalize(value) {

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

function escapeHTML(value) {

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
   ESCAPE ATTRIBUTE
   ========================================================= */

function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


/* =========================================================
   GLOBAL REFRESH
   ========================================================= */

window.loadFarmerOrders =
    loadFarmerOrders;
