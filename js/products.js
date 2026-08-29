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


    productSearch?.addEventListener(
        "input",
        applyFilters
    );


    categoryFilter?.addEventListener(
        "change",
        applyFilters
    );

});


/*
-----------------------------------------
LOAD CATEGORIES
-----------------------------------------
*/

async function loadCategories() {

    if (!categoryFilter) return;


    try {

        const {
            data,
            error
        } = await supabase
            .from("product_categories")
            .select("*")
            .order("name", {
                ascending: true
            });


        if (error) {

            console.warn(
                "Categories load error:",
                error
            );

        }


        categoryMap.clear();


        categoryFilter.innerHTML = `
            <option value="all">
                All Categories (सभी श्रेणियां)
            </option>
        `;


        if (
            data &&
            data.length > 0
        ) {

            data.forEach(category => {

                const name =
                    category.name ||
                    category.title ||
                    category.category_name ||
                    category.slug ||
                    "Category";


                categoryMap.set(
                    String(category.id),
                    name
                );


                const option =
                    document.createElement("option");


                option.value =
                    category.id;


                option.textContent =
                    name;


                categoryFilter.appendChild(
                    option
                );

            });

        }

    } catch (error) {

        console.warn(
            "Categories note:",
            error
        );

    }

}


/*
-----------------------------------------
LOAD FARMER PRODUCTS
-----------------------------------------
*/

async function loadProducts() {

    try {

        const {
            data: {
                user
            },
            error: authError
        } = await supabase
            .auth
            .getUser();


        if (
            authError ||
            !user
        ) {

            window.location.href =
                "index.html";

            return;

        }


        const {
            data: farmer,
            error: farmerError
        } = await supabase
            .from("farmers")
            .select("id")
            .eq(
                "user_id",
                user.id
            )
            .maybeSingle();


        if (farmerError) {

            throw farmerError;

        }


        if (!farmer) {

            allProducts = [];

            updateSummary(
                allProducts
            );

            renderProducts(
                allProducts
            );

            return;

        }


        const {
            data,
            error
        } = await supabase
            .from("products")
            .select("*")
            .eq(
                "farmer_id",
                farmer.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            throw error;

        }


        allProducts =
            data || [];


        updateSummary(
            allProducts
        );


        applyFilters();

    } catch (error) {

        console.error(
            "Products error:",
            error
        );


        showToast(
            error.message ||
            "Could not load products."
        );

    }

}


/*
-----------------------------------------
UPDATE SUMMARY
-----------------------------------------
*/

function updateSummary(products) {

    const total =
        products.length;


    const available =
        products.filter(product => {

            return (
                product.is_available !== false &&
                Number(product.stock || 0) > 0
            );

        }).length;


    const outOfStock =
        products.filter(product => {

            return (
                product.is_available === false ||
                Number(product.stock || 0) <= 0
            );

        }).length;


    if (totalProducts) {

        totalProducts.textContent =
            total;

    }


    if (availableProducts) {

        availableProducts.textContent =
            available;

    }


    if (outOfStockProducts) {

        outOfStockProducts.textContent =
            outOfStock;

    }

}


/*
-----------------------------------------
APPLY SEARCH + CATEGORY FILTER
-----------------------------------------
*/

function applyFilters() {

    const search =
        String(
            productSearch?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const selectedCategory =
        String(
            categoryFilter?.value ||
            "all"
        );


    const filteredProducts =
        allProducts.filter(product => {

            const name =
                String(
                    product.name ||
                    ""
                )
                .toLowerCase();


            const description =
                String(
                    product.description ||
                    ""
                )
                .toLowerCase();


            const location =
                String(
                    product.farm_location ||
                    ""
                )
                .toLowerCase();


            const matchesSearch =
                !search ||
                name.includes(search) ||
                description.includes(search) ||
                location.includes(search);


            const matchesCategory =
                selectedCategory === "all" ||
                String(
                    product.category_id
                ) === selectedCategory;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    renderProducts(
        filteredProducts
    );

}


/*
-----------------------------------------
RENDER PRODUCTS
-----------------------------------------
*/

function renderProducts(products) {

    if (!productsContainer) {

        return;

    }


    if (
        !products ||
        products.length === 0
    ) {

        productsContainer.style.display =
            "none";


        if (emptyProducts) {

            emptyProducts.style.display =
                "block";

        }

        return;

    }


    if (emptyProducts) {

        emptyProducts.style.display =
            "none";

    }


    productsContainer.style.display =
        "grid";


    productsContainer.innerHTML =
        products
            .map(product => {

                return createProductCard(
                    product
                );

            })
            .join("");

}


/*
-----------------------------------------
CREATE PRODUCT CARD
-----------------------------------------
*/

function createProductCard(product) {

    const category =
        categoryMap.get(
            String(
                product.category_id
            )
        ) ||
        "Produce";


    /*
    FARMER PANEL PRICE

    Farmer ne jo original price dala hai
    wahi yahan dikhaya jayega.

    Example:

    price_per_unit = ₹60
    platform_fee = ₹6
    customer_price = ₹66

    Farmer panel = ₹60
    Customer website = ₹66
    */


    const farmerPrice =
        Number(
            product.price_per_unit || 0
        );


    const platformFee =
        Number(
            product.platform_fee || 0
        );


    const customerPrice =
        Number(
            product.customer_price ||
            (
                farmerPrice +
                platformFee
            )
        );


    const price =
        formatRupees(
            farmerPrice
        );


    const unit =
        escapeHTML(
            product.unit || "kg"
        );


    const stock =
        Number(
            product.stock || 0
        );


    const available =
        product.is_available !== false &&
        stock > 0;


    const safeName =
        escapeHTML(
            product.name ||
            "Produce"
        );


    const safeCategory =
        escapeHTML(
            category
        );


    const safeImageUrl =
        product.image_url
            ? escapeHTML(
                product.image_url
            )
            : "";


    return `

        <article class="product-card">

            ${
                safeImageUrl
                    ? `
                        <img
                            src="${safeImageUrl}"
                            alt="${safeName}"
                            class="product-image"
                            loading="lazy"
                        >
                    `
                    : `
                        <div
                            class="product-image"
                            style="
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:45px;
                            "
                        >
                            🌾
                        </div>
                    `
            }


            <div class="product-content">


                <span class="product-category">
                    ${safeCategory}
                </span>


                <h3>
                    ${safeName}
                </h3>


                <!--
                Farmer's original price.
                Platform fee customer website me
                final price ke andar include hogi.
                -->

                <div class="product-price">

                    ${price}

                    <span
                        style="
                            font-size:12px;
                            color:var(--text-light);
                            font-weight:normal;
                        "
                    >
                        / ${unit}
                    </span>

                </div>


                <div class="product-meta">

                    <span>
                        📦 Stock:
                        ${stock}
                        ${unit}
                    </span>


                    <span>
                        ${
                            available
                                ? "🟢 Available"
                                : "🔴 Sold Out"
                        }
                    </span>

                </div>


                <div
                    style="
                        display:flex;
                        gap:8px;
                        margin-top:14px;
                    "
                >

                    <button
                        class="primary-btn"
                        onclick="editProduct('${product.id}')"
                        style="
                            flex:1;
                            padding:8px;
                            font-size:12px;
                        "
                    >
                        ✏️ Edit
                    </button>


                    <button
                        onclick="deleteProduct('${product.id}')"
                        style="
                            padding:8px 12px;
                            border:1px solid #fbcaca;
                            border-radius:10px;
                            background:#fff5f5;
                            color:#c53030;
                            cursor:pointer;
                        "
                    >
                        🗑️
                    </button>

                </div>


            </div>

        </article>

    `;

}


/*
-----------------------------------------
EDIT PRODUCT
-----------------------------------------
*/

window.editProduct =
    function (id) {

        window.location.href =
            `add-product.html?id=${encodeURIComponent(id)}`;

    };


/*
-----------------------------------------
DELETE PRODUCT
-----------------------------------------
*/

window.deleteProduct =
    async function (id) {

        const confirmed =
            confirm(
                "Are you sure you want to delete this product?"
            );


        if (!confirmed) {

            return;

        }


        try {

            const {
                error
            } = await supabase
                .from("products")
                .delete()
                .eq(
                    "id",
                    id
                );


            if (error) {

                throw error;

            }


            showToast(
                "Product deleted."
            );


            await loadProducts();

        } catch (error) {

            console.error(
                "Delete product error:",
                error
            );


            showToast(
                error.message ||
                "Failed to delete product."
            );

        }

    };
