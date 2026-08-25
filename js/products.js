import { supabase } from "./supabase.js";
import { formatRupees, escapeHTML, showToast } from "./app.js";

const productsContainer = document.getElementById("productsContainer");
const emptyProducts = document.getElementById("emptyProducts");
const totalProducts = document.getElementById("totalProducts");
const availableProducts = document.getElementById("availableProducts");
const outOfStockProducts = document.getElementById("outOfStockProducts");
const productSearch = document.getElementById("productSearch");
const categoryFilter = document.getElementById("categoryFilter");

let allProducts = [];
let categoryMap = new Map();

document.addEventListener("DOMContentLoaded", async () => {
    await loadCategories();
    await loadProducts();
    productSearch?.addEventListener("input", applyFilters);
    categoryFilter?.addEventListener("change", applyFilters);
});

async function loadCategories() {
    if (!categoryFilter) return;
    try {
        const { data } = await supabase.from("product_categories").select("*");
        categoryMap.clear();

        categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
        if (data && data.length > 0) {
            data.forEach(category => {
                const name = category.name || category.title || category.category_name || category.slug || "Category";
                categoryMap.set(category.id, name);
                const opt = document.createElement("option");
                opt.value = category.id;
                opt.textContent = name;
                categoryFilter.appendChild(opt);
            });
        }
    } catch (e) {
        console.warn("Categories note:", e);
    }
}

async function loadProducts() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = "index.html";
            return;
        }

        const { data: farmer } = await supabase.from("farmers").select("id").eq("user_id", user.id).maybeSingle();
        if (!farmer) {
            allProducts = [];
            renderProducts([]);
            return;
        }

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("farmer_id", farmer.id)
            .order("created_at", { ascending: false });

        if (error) throw error;
        allProducts = data || [];
        updateSummary(allProducts);
        applyFilters();
    } catch (e) {
        console.error("Products error:", e);
    }
}

function updateSummary(products) {
    const total = products.length;
    const available = products.filter(p => p.is_available && Number(p.stock) > 0).length;
    const outOfStock = products.filter(p => !p.is_available || Number(p.stock) <= 0).length;

    if (totalProducts) totalProducts.textContent = total;
    if (availableProducts) availableProducts.textContent = available;
    if (outOfStockProducts) outOfStockProducts.textContent = outOfStock;
}

function applyFilters() {
    const search = (productSearch?.value || "").trim().toLowerCase();
    const selectedCategory = categoryFilter?.value || "all";

    const filtered = allProducts.filter(p => {
        const name = String(p.name || "").toLowerCase();
        const desc = String(p.description || "").toLowerCase();
        const matchesSearch = !search || name.includes(search) || desc.includes(search);
        const matchesCat = selectedCategory === "all" || String(p.category_id) === String(selectedCategory);
        return matchesSearch && matchesCat;
    });

    renderProducts(filtered);
}

function renderProducts(products) {
    if (!productsContainer || !emptyProducts) return;

    if (!products || products.length === 0) {
        productsContainer.style.display = "none";
        emptyProducts.style.display = "block";
        return;
    }

    emptyProducts.style.display = "none";
    productsContainer.style.display = "grid";
    productsContainer.innerHTML = products.map(product => createProductCard(product)).join("");
}

function createProductCard(product) {
    const category = categoryMap.get(product.category_id) || "Produce";
    const price = formatRupees(product.price_per_unit);
    const unit = escapeHTML(product.unit || "kg");
    const stock = Number(product.stock || 0);
    const available = product.is_available && stock > 0;
    const safeName = escapeHTML(product.name || "Produce");

    return `
        <article class="product-card">
            ${product.image_url ? `<img src="${escapeHTML(product.image_url)}" alt="${safeName}" class="product-image" loading="lazy">` : `<div class="product-image" style="display:flex;align-items:center;justify-content:center;font-size:45px;">🌾</div>`}
            <div class="product-content">
                <span class="product-category">${escapeHTML(category)}</span>
                <h3>${safeName}</h3>
                <div class="product-price">${price} <span style="font-size:12px;color:var(--text-light);font-weight:normal;">/ ${unit}</span></div>
                <div class="product-meta">
                    <span>📦 Stock: ${stock} ${unit}</span>
                    <span>${available ? "🟢 Available" : "🔴 Sold Out"}</span>
                </div>
                <div style="display:flex;gap:8px;margin-top:14px;">
                    <button class="primary-btn" onclick="editProduct('${product.id}')" style="flex:1;padding:8px;font-size:12px;">✏️ Edit</button>
                    <button onclick="deleteProduct('${product.id}')" style="padding:8px 12px;border:1px solid #fbcaca;border-radius:10px;background:#fff5f5;color:#c53030;cursor:pointer;">🗑️</button>
                </div>
            </div>
        </article>
    `;
}

window.editProduct = function(id) {
    window.location.href = `add-product.html?id=${encodeURIComponent(id)}`;
};

window.deleteProduct = async function(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        showToast("Product deleted.");
        await loadProducts();
    } catch (e) {
        showToast(e.message || "Failed to delete");
    }
};
