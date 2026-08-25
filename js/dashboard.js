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

        if (!farmer) {
            console.warn("Farmer profile not found. Displaying empty dashboard.");
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
        console.error("Dashboard loading error:", error);
    }
}

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

        if (error) throw error;
        dashboardData.products = data || [];
    } catch (error) {
        console.error("Products loading error:", error);
        dashboardData.products = [];
    }
}

async function loadOrders() {
    try {
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("farmer_id", currentFarmer.id)
            .order("created_at", { ascending: false });

        if (error) throw error;
        dashboardData.orders = data || [];
        dashboardData.earnings = calculateEarnings(dashboardData.orders);
    } catch (error) {
        console.error("Orders loading error:", error);
        dashboardData.orders = [];
        dashboardData.earnings = 0;
    }
}

function calculateEarnings(orders) {
    if (!Array.isArray(orders)) return 0;
    return orders
        .filter(order => {
            const status = String(order.status || order.order_status || "").toLowerCase();
            return status === "completed" || status === "delivered";
        })
        .reduce((total, order) => {
            const amount = Number(order.total_amount ?? order.amount ?? order.total ?? order.price ?? 0);
            return total + (Number.isFinite(amount) ? amount : 0);
        }, 0);
}

function updateStats() {
    const totalProducts = document.getElementById("totalProducts");
    const newOrders = document.getElementById("newOrders");
    const totalEarnings = document.getElementById("totalEarnings");

    if (totalProducts) {
        totalProducts.textContent = dashboardData.products.length;
    }

    if (newOrders) {
        const pendingOrders = dashboardData.orders.filter(order => {
            const status = String(order.status || order.order_status || "").toLowerCase();
            return status === "new" || status === "pending";
        }).length;
        newOrders.textContent = pendingOrders;
    }

    if (totalEarnings) {
        totalEarnings.textContent = formatRupees(dashboardData.earnings);
    }
}

function displayRecentOrders() {
    const container = document.getElementById("recentOrders");
    if (!container) return;

    if (!dashboardData.orders || dashboardData.orders.length === 0) {
        showEmptyState("recentOrders", "📦", "No orders yet", "Your customer orders will appear here.");
        return;
    }

    const recentOrders = [...dashboardData.orders]
        .sort((a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime())
        .slice(0, 5);

    container.innerHTML = "";

    recentOrders.forEach(order => {
        const orderElement = document.createElement("div");
        orderElement.className = "recent-order";

        const productName = order.product_name || order.product || order.name || "Product Order";
        const customerName = order.customer_name || order.customer || "Customer";
        const amount = Number(order.total_amount ?? order.amount ?? order.total ?? order.price ?? 0);
        const orderStatus = order.order_status || order.status || "pending";

        orderElement.innerHTML = `
            <div class="order-icon">📦</div>
            <div class="order-info">
                <h3>${escapeHTML(productName)}</h3>
                <p>${escapeHTML(customerName)}</p>
            </div>
            <div class="order-right">
                <strong>${formatRupees(amount)}</strong>
                <span class="order-status ${getStatusClass(orderStatus)}">
                    ${formatStatus(orderStatus)}
                </span>
            </div>
        `;
        container.appendChild(orderElement);
    });
}

function getStatusClass(status) {
    if (!status) return "pending";
    switch (String(status).toLowerCase()) {
        case "new": return "new";
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
    const text = String(status);
    return text.charAt(0).toUpperCase() + text.slice(1);
}

window.loadDashboard = loadDashboard;
export { loadDashboard };
