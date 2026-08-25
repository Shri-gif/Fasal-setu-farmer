import { supabase } from "./supabase.js";
import { showToast } from "./app.js";

const form = document.getElementById("productForm");
const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");
const productUnit = document.getElementById("productUnit");
const productStock = document.getElementById("productStock");
const harvestDate = document.getElementById("harvestDate");
const farmLocation = document.getElementById("farmLocation");
const imageUrl = document.getElementById("imageUrl");
const isAvailable = document.getElementById("isAvailable");
const saveProductBtn = document.getElementById("saveProductBtn");
const formMessage = document.getElementById("formMessage");
const pageTitle = document.getElementById("pageTitle");

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");
let editingProduct = null;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await checkLogin();
        await loadCategories();
        if (productId) {
            await loadProduct(productId);
        }
    } catch (error) {
        console.error(error);
        showMessage(error.message || "Something went wrong.", "error");
    }
});

async function checkLogin() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        window.location.href = "index.html";
        throw new Error("Please login first.");
    }
}

async function loadCategories() {
    if (!productCategory) return;
    const { data, error } = await supabase.from("product_categories").select("*");
    if (error || !data || data.length === 0) {
        productCategory.innerHTML = `
            <option value="vegetables">Vegetables (सब्जियां)</option>
            <option value="fruits">Fruits (फल)</option>
            <option value="grains">Grains & Cereals (अनाज)</option>
            <option value="pulses">Pulses & Dal (दालें)</option>
            <option value="spices">Spices (मसाले)</option>
        `;
        return;
    }

    productCategory.innerHTML = `<option value="">Select Category</option>`;
    data.forEach(category => {
        const name = category.name || category.title || category.category_name || category.slug || "Category";
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = name;
        productCategory.appendChild(option);
    });
}

async function getCurrentFarmer() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please login first.");

    const { data: farmer } = await supabase.from("farmers").select("*").eq("user_id", user.id).maybeSingle();
    if (farmer) return farmer;

    const { data: newFarmer, error } = await supabase
        .from("farmers")
        .insert({
            user_id: user.id,
            farm_name: user.user_metadata?.farm_name || "My Farm",
            farm_location: user.user_metadata?.farm_location || null,
            verification_status: "pending"
        })
        .select()
        .single();

    if (error) throw error;
    return newFarmer;
}

async function loadProduct(id) {
    const farmer = await getCurrentFarmer();
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("farmer_id", farmer.id)
        .maybeSingle();

    if (error || !data) throw new Error("Product not found or access denied.");

    editingProduct = data;
    if (pageTitle) pageTitle.textContent = "Edit Produce ✏️";
    if (saveProductBtn) saveProductBtn.innerHTML = `Update Produce <span>→</span>`;

    if (productName) productName.value = data.name || "";
    if (productCategory) productCategory.value = data.category_id || "";
    if (productDescription) productDescription.value = data.description || "";
    if (productPrice) productPrice.value = data.price_per_unit ?? "";
    if (productUnit) productUnit.value = data.unit || "kg";
    if (productStock) productStock.value = data.stock ?? 0;
    if (harvestDate) harvestDate.value = data.harvest_date || "";
    if (farmLocation) farmLocation.value = data.farm_location || "";
    if (imageUrl) imageUrl.value = data.image_url || "";
    if (isAvailable) isAvailable.checked = data.is_available !== false;
}

if (form) {
    form.addEventListener("submit", async event => {
        event.preventDefault();
        try {
            setButtonLoading(true);
            const farmer = await getCurrentFarmer();

            const name = productName.value.trim();
            const categoryId = productCategory.value;
            const description = productDescription.value.trim();
            const price = Number(productPrice.value);
            const unit = productUnit.value;
            const stock = Number(productStock.value);
            const harvest = harvestDate.value || null;
            const location = farmLocation.value.trim();
            const image = imageUrl.value.trim() || null;
            const available = isAvailable.checked;

            if (!name) throw new Error("Please enter product name.");
            if (!categoryId) throw new Error("Please select a category.");
            if (Number.isNaN(price) || price < 0) throw new Error("Please enter a valid price.");
            if (Number.isNaN(stock) || stock < 0) throw new Error("Please enter a valid stock.");

            const productData = {
                farmer_id: farmer.id,
                category_id: categoryId,
                name: name,
                description: description || null,
                price_per_unit: price,
                unit: unit,
                harvest_date: harvest,
                image_url: image,
                is_active: true,
                is_available: available,
                stock: stock,
                farm_location: location || null
            };

            if (editingProduct) {
                const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id);
                if (error) throw error;
                showMessage("Produce updated successfully! ✅", "success");
            } else {
                const { error } = await supabase.from("products").insert(productData);
                if (error) throw error;
                showMessage("Produce added successfully! 🎉", "success");
            }

            setTimeout(() => {
                window.location.href = "products.html";
            }, 800);
        } catch (error) {
            console.error("Save error:", error);
            showMessage(error.message || "Could not save product.", "error");
        } finally {
            setButtonLoading(false);
        }
    });
}

function showMessage(message, type) {
    if (!formMessage) return;
    formMessage.style.display = "block";
    formMessage.textContent = message;
    formMessage.style.background = type === "success" ? "#e8f7ed" : "#fdebea";
    formMessage.style.color = type === "success" ? "#16803c" : "#b52d29";
}

function setButtonLoading(loading) {
    if (!saveProductBtn) return;
    saveProductBtn.disabled = loading;
    saveProductBtn.style.opacity = loading ? "0.7" : "1";
    saveProductBtn.innerHTML = loading
        ? "Saving..."
        : editingProduct
        ? `Update Produce <span>→</span>`
        : `Add Produce <span>→</span>`;
}
