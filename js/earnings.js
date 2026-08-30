/* =========================================================
   KHET2GHAR FARMER SITE
   earnings.js
   Farmer Earnings & Financials
   ========================================================= */

import { supabase } from "./supabase.js";
import { formatRupees, showEmptyState, escapeHTML } from "./app.js";

let allOrders = [];
let currentFarmer = null;

document.addEventListener("DOMContentLoaded", async () => {
    await loadEarnings();
    setupSearch();
    setupFilter();
});

async function loadEarnings() {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!user) {
            window.location.href = "index.html";
            return;
        }

        const { data: farmer, error: farmerError } = await supabase
            .from("farmers")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (farmerError) throw farmerError;
        if (!farmer) return;

        currentFarmer = farmer;

        const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .select("*")
            .eq("farmer_id", farmer.id)
            .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        allOrders = orders || [];
        updateEarningsSummary();
        renderTransactions(getCompletedOrders(allOrders));
    } catch (err) {
        console.error("Earnings load error:", err);
    }
}

function getCompletedOrders(orders) {
    return orders.filter(o => {
        const s = String(o.order_status || o.status || "").toLowerCase();
        return s === "completed" || s === "delivered" || s === "confirmed" || s === "dispatched";
    });
}

function updateEarningsSummary() {
    const totalEarningsEl = document.getElementById("totalEarnings");
    const monthlyEarningsEl = document.getElementById("monthlyEarnings");
    const completedOrdersEl = document.getElementById("completedOrders");

    const completed = getCompletedOrders(allOrders);

    const total = completed.reduce((sum, o) => {
        return sum + Number(o.total_amount ?? o.subtotal ?? o.amount ?? 0);
    }, 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTotal = completed
        .filter(o => {
            const d = new Date(o.created_at || o.date || 0);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, o) => sum + Number(o.total_amount ?? o.subtotal ?? o.amount ?? 0), 0);

    if (totalEarningsEl) totalEarningsEl.textContent = formatRupees(total);
    if (monthlyEarningsEl) monthlyEarningsEl.textContent = formatRupees(monthlyTotal);
    if (completedOrdersEl) completedOrdersEl.textContent = completed.length;
}

function renderTransactions(transactions) {
    const container = document.getElementById("earningsContainer");
    const emptyState = document.getElementById("emptyEarnings");

    if (!container) return;

    if (!transactions || transactions.length === 0) {
        container.style.display = "none";
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (emptyState) emptyState.style.display = "none";
    container.style.display = "grid";

    container.innerHTML = transactions.map(order => {
        const amount = Number(order.total_amount ?? order.subtotal ?? order.amount ?? 0);
        const productName = order.product_name || order.product?.name || "Farm Produce";
        const customerName = order.customer_name || "Customer";
        const dateStr = order.created_at
            ? new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
              })
            : "Recent";

        return `
            <article class="product-card" style="padding: 18px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                    <div>
                        <span class="product-category">SALE COMPLETED</span>
                        <h3 style="margin-top:5px;">${escapeHTML(productName)}</h3>
                        <p style="font-size:12px; color:var(--text-light); margin-top:2px;">
                            Buyer: ${escapeHTML(customerName)}
                        </p>
                    </div>
                    <div style="text-align:right;">
                        <strong style="font-size:18px; color:var(--green);">${formatRupees(amount)}</strong>
                        <span style="display:block; font-size:11px; color:var(--text-light);">${dateStr}</span>
                    </div>
                </div>
                <div style="font-size:11px; color:var(--text-light); border-top:1px solid var(--border); padding-top:8px; display:flex; justify-content:space-between;">
                    <span>Order #${escapeHTML(String(order.id || "").slice(0, 8).toUpperCase())}</span>
                    <span style="color:var(--green); font-weight:bold;">✓ Settled</span>
                </div>
            </article>
        `;
    }).join("");
}

function setupSearch() {
    const searchInput = document.getElementById("earningSearch");
    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }
}

function setupFilter() {
    const filterSelect = document.getElementById("earningFilter");
    if (filterSelect) {
        filterSelect.addEventListener("change", applyFilters);
    }
}

function applyFilters() {
    const searchInput = document.getElementById("earningSearch");
    const filterSelect = document.getElementById("earningFilter");

    const search = searchInput?.value?.trim().toLowerCase() || "";
    const filterVal = filterSelect?.value || "all";

    const completed = getCompletedOrders(allOrders);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const filtered = completed.filter(order => {
        const orderTime = new Date(order.created_at || order.date || 0).getTime();
        const productName = String(order.product_name || order.product?.name || "").toLowerCase();
        const customerName = String(order.customer_name || "").toLowerCase();
        const orderId = String(order.id || "").toLowerCase();

        const matchesSearch = !search || productName.includes(search) || customerName.includes(search) || orderId.includes(search);

        let matchesTime = true;
        if (filterVal === "today") matchesTime = orderTime >= todayStart;
        else if (filterVal === "week") matchesTime = orderTime >= weekStart;
        else if (filterVal === "month") matchesTime = orderTime >= monthStart;

        return matchesSearch && matchesTime;
    });

    renderTransactions(filtered);
}
