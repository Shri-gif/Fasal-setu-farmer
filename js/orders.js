/* =========================================================
   KHET2GHAR FARMER
   orders.js
   Farmer Orders with interactive dispatch transitions
   ========================================================= */

import { supabase } from "./supabase.js";
import { formatRupees, showEmptyState, escapeHTML, showToast } from "./app.js";

let allOrders = [];
let currentFarmer = null;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadFarmerOrders();
        setupOrderSearch();
        setupOrderFilter();
    } catch (error) {
        console.error("Orders page error:", error);
        showOrdersError(error.message || "Unable to load orders.");
    }
});

async function getCurrentFarmer() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    if (!user) {
        window.location.replace("index.html");
        throw new Error("Please login first.");
    }

    const { data: farmer, error: farmerError } = await supabase
        .from("farmers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    if (farmerError) throw farmerError;
    if (!farmer) throw new Error("Farmer profile not found.");

    return farmer;
}

async function loadFarmerOrders() {
    const farmer = await getCurrentFarmer();
    currentFarmer = farmer;

    const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("farmer_id", farmer.id)
        .order("created_at", { ascending: false });

    if (ordersError) throw ordersError;

    if (!orders || orders.length === 0) {
        allOrders = [];
        updateOrderSummary();
        showEmptyOrders();
        return;
    }

    const productIds = [...new Set(orders.map(o => o.product_id).filter(Boolean))];
    let productMap = new Map();

    if (productIds.length > 0) {
        const { data: products } = await supabase
            .from("products")
            .select("id, name, image_url, unit, farm_location")
            .in("id", productIds);

        if (products) {
            products.forEach(p => productMap.set(p.id, p));
        }
    }

    allOrders = orders.map(order => ({
        ...order,
        product: productMap.get(order.product_id) || null
    }));

    updateOrderSummary();
    renderOrders(allOrders);
}

function updateOrderSummary() {
    const total = allOrders.length;
    const pending = allOrders.filter(o => {
        const s = String(o.order_status || o.status || "").toLowerCase();
        return s === "pending" || s === "new";
    }).length;

    const completed = allOrders.filter(o => {
        const s = String(o.order_status || o.status || "").toLowerCase();
        return s === "completed" || s === "delivered";
    }).length;

    const totalEl = document.getElementById("totalOrders");
    const pendingEl = document.getElementById("pendingOrders");
    const completedEl = document.getElementById("completedOrders");

    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (completedEl) completedEl.textContent = completed;
}

function renderOrders(orders) {
    const container = document.getElementById("ordersContainer");
    const emptyState = document.getElementById("emptyOrders");

    if (!container) return;

    if (!orders || orders.length === 0) {
        container.style.display = "none";
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (emptyState) emptyState.style.display = "none";
    container.style.display = "grid";
    container.innerHTML = orders.map(order => createOrderCard(order)).join("");
}

function createOrderCard(order) {
    const status = String(order.order_status || order.status || "pending").toLowerCase();
    const paymentStatus = String(order.payment_status || "pending").toLowerCase();
    const date = formatDate(order.created_at);
    const product = order.product || {};
    const productName = escapeHTML(product.name || order.product_name || "Farm Produce");
    const quantity = Number(order.quantity || 1);
    const unit = escapeHTML(product.unit || "kg");
    const unitPrice = formatRupees(order.price_per_unit || 0);
    const totalAmount = formatRupees(order.total_amount || order.subtotal || 0);

    const customerName = escapeHTML(order.customer_name || "Customer");
    const customerMobile = escapeHTML(order.customer_mobile || "");
    const deliveryAddress = escapeHTML(order.delivery_address || "");

    return `
        <article class="product-card order-card" style="padding: 16px;">
            <div class="product-card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span class="product-category">ORDER</span>
                    <h3 style="margin-top:4px;">#${escapeHTML(String(order.id || "").slice(0, 8).toUpperCase())}</h3>
                </div>
                <span class="order-status ${getStatusClass(status)}">
                    ${formatStatus(status)}
                </span>
            </div>

            <div class="order-date" style="font-size:11px; color:var(--text-light); margin: 6px 0;">
                📅 ${date}
            </div>

            <div class="order-details" style="font-size:13px; margin: 10px 0; border-top: 1px solid var(--border); padding-top: 8px;">
                <div><strong>Customer:</strong> ${customerName} ${customerMobile ? `(${customerMobile})` : ""}</div>
                ${deliveryAddress ? `<div><strong>Address:</strong> 📍 ${deliveryAddress}</div>` : ""}
            </div>

            <div class="order-items" style="background:var(--green-light); padding:10px; border-radius:10px; margin: 8px 0;">
                <div style="display:flex; justify-content:space-between;">
                    <span><strong>${productName}</strong> (${quantity} ${unit} × ${unitPrice})</span>
                    <strong>${totalAmount}</strong>
                </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:8px; border-top:1px solid var(--border);">
                <span style="font-size:12px; color:var(--text-light);">Payment: <strong>${capitalize(paymentStatus)}</strong></span>
                <div>
                    ${status === "pending" ? `<button class="primary-btn" onclick="updateOrderStatus('${order.id}', 'confirmed')" style="padding:6px 12px; font-size:12px;">Accept Order ✓</button>` : ""}
                    ${status === "confirmed" ? `<button class="primary-btn" onclick="updateOrderStatus('${order.id}', 'completed')" style="padding:6px 12px; font-size:12px;">Mark Completed 🎉</button>` : ""}
                </div>
            </div>
        </article>
    `;
}

window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        const { error } = await supabase
            .from("orders")
            .update({ order_status: newStatus, status: newStatus, updated_at: new Date().toISOString() })
            .eq("id", orderId);

        if (error) throw error;

        showToast(`Order status updated to ${newStatus.toUpperCase()}`);
        await loadFarmerOrders();
    } catch (e) {
        console.error("Update error:", e);
        showToast(e.message || "Failed to update order");
    }
};

function setupOrderSearch() {
    const input = document.getElementById("orderSearch");
    if (input) input.addEventListener("input", applyFilters);
}

function setupOrderFilter() {
    const filter = document.getElementById("orderFilter");
    if (filter) filter.addEventListener("change", applyFilters);
}

function applyFilters() {
    const search = document.getElementById("orderSearch")?.value?.trim().toLowerCase() || "";
    const filterVal = document.getElementById("orderFilter")?.value?.toLowerCase() || "all";

    const filtered = allOrders.filter(order => {
        const status = String(order.order_status || order.status || "").toLowerCase();
        const searchTarget = (String(order.id) + " " + String(order.customer_name) + " " + String(order.product?.name || "")).toLowerCase();
        const matchesSearch = !search || searchTarget.includes(search);
        const matchesFilter = filterVal === "all" || status === filterVal;
        return matchesSearch && matchesFilter;
    });

    renderOrders(filtered);
}

function showEmptyOrders() {
    const container = document.getElementById("ordersContainer");
    const emptyState = document.getElementById("emptyOrders");
    if (container) container.style.display = "none";
    if (emptyState) emptyState.style.display = "block";
}

function showOrdersError(message) {
    const emptyState = document.getElementById("emptyOrders");
    if (emptyState) {
        emptyState.style.display = "block";
        emptyState.innerHTML = `
            <div class="empty-icon">⚠️</div>
            <h2>Unable to Load Orders</h2>
            <p>${escapeHTML(message)}</p>
            <button class="primary-btn" onclick="location.reload()">Try Again</button>
        `;
    }
}

function formatDate(dateValue) {
    if (!dateValue) return "Recent";
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? "Recent" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusClass(status) {
    switch (String(status).toLowerCase()) {
        case "new":
        case "pending": return "pending";
        case "confirmed": return "confirmed";
        case "completed":
        case "delivered": return "completed";
        case "cancelled": return "cancelled";
        default: return "pending";
    }
}

function formatStatus(status) {
    if (!status) return "Pending";
    return capitalize(String(status));
}
