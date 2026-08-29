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


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    try {

        await checkLogin();

        await loadCategories();

        if (productId) {
            await loadProduct(productId);
        }

    } catch (error) {

        console.error("Page load error:", error);

        showMessage(
            error.message || "Something went wrong.",
            "error"
        );

    }

});


/* =========================================================
   LOGIN CHECK
========================================================= */

async function checkLogin() {

    const {
        data: { user },
        error
    } = await supabase.auth.getUser();

    if (error || !user) {

        window.location.href = "index.html";

        throw new Error(
            "Please login first."
        );

    }

    return user;

}


/* =========================================================
   LOAD CATEGORIES
========================================================= */

async function loadCategories() {

    if (!productCategory) return;

    const {
        data,
        error
    } = await supabase
        .from("product_categories")
        .select("*");

    /*
    If category table cannot be loaded,
    use default categories.
    */

    if (
        error ||
        !data ||
        data.length === 0
    ) {

        console.warn(
            "Could not load categories. Using default categories."
        );

        productCategory.innerHTML = `

            <option value="vegetables">
                Vegetables (सब्जियां)
            </option>

            <option value="fruits">
                Fruits (फल)
            </option>

            <option value="grains">
                Grains & Cereals (अनाज)
            </option>

            <option value="pulses">
                Pulses & Dal (दालें)
            </option>

            <option value="spices">
                Spices (मसाले)
            </option>

        `;

        return;

    }


    productCategory.innerHTML =
        `<option value="">Select Category</option>`;


    data.forEach(category => {

        const name =
            category.name ||
            category.title ||
            category.category_name ||
            category.slug ||
            "Category";


        const option =
            document.createElement("option");


        option.value =
            category.id;


        option.textContent =
            name;


        productCategory.appendChild(option);

    });

}


/* =========================================================
   GET CURRENT FARMER
========================================================= */

async function getCurrentFarmer() {

    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();


    if (authError || !user) {

        throw new Error(
            "Please login first."
        );

    }


    /*
    Find existing farmer profile
    */

    const {
        data: farmer,
        error: farmerError
    } = await supabase
        .from("farmers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();


    if (farmerError) {

        throw new Error(
            "Could not load farmer profile: " +
            farmerError.message
        );

    }


    if (farmer) {

        return farmer;

    }


    /*
    Create farmer profile if missing
    */

    const {
        data: newFarmer,
        error
    } = await supabase
        .from("farmers")
        .insert({

            user_id:
                user.id,

            farm_name:
                user.user_metadata?.farm_name ||
                "My Farm",

            farm_location:
                user.user_metadata?.farm_location ||
                null,

            verification_status:
                "pending"

        })
        .select()
        .single();


    if (error) {

        throw new Error(
            "Could not create farmer profile: " +
            error.message
        );

    }


    return newFarmer;

}


/* =========================================================
   GET PLATFORM SETTINGS
========================================================= */

async function getPlatformSettings() {

    const {
        data,
        error
    } = await supabase
        .from("platform_settings")
        .select(`
            id,
            platform_fee,
            platform_fee_type
        `)
        .eq("id", 1)
        .maybeSingle();


    if (error) {

        console.error(
            "Platform settings error:",
            error
        );

        throw new Error(
            "Could not load platform fee settings: " +
            error.message
        );

    }


    /*
    IMPORTANT:
    Do not silently continue with zero fee
    if settings row doesn't exist.
    */

    if (!data) {

        throw new Error(
            "Platform fee settings are not configured. Please configure platform fee in admin settings first."
        );

    }


    /*
    Read and validate fee
    */

    const feeValue =
        Number(data.platform_fee);


    if (
        Number.isNaN(feeValue) ||
        feeValue < 0
    ) {

        throw new Error(
            "Invalid platform fee configured in admin settings."
        );

    }


    /*
    Normalize fee type
    */

    let feeType =
        String(
            data.platform_fee_type || "percentage"
        )
        .trim()
        .toLowerCase();


    if (
        feeType === "fixed amount" ||
        feeType === "fixed_amount"
    ) {

        feeType = "fixed";

    }


    if (
        feeType !== "percentage" &&
        feeType !== "fixed"
    ) {

        throw new Error(
            "Invalid platform fee type. Use percentage or fixed."
        );

    }


    const settings = {

        id:
            data.id,

        platform_fee:
            feeValue,

        platform_fee_type:
            feeType

    };


    /*
    DEBUG
    */

    console.log(
        "✅ PLATFORM SETTINGS LOADED:",
        settings
    );


    return settings;

}


/* =========================================================
   CALCULATE PRODUCT PRICING
========================================================= */

function calculateProductPricing(
    farmerPrice,
    settings
) {

    const basePrice =
        Number(farmerPrice);


    if (
        Number.isNaN(basePrice) ||
        basePrice < 0
    ) {

        throw new Error(
            "Invalid farmer price."
        );

    }


    if (!settings) {

        throw new Error(
            "Platform fee settings are missing."
        );

    }


    const feeValue =
        Number(
            settings.platform_fee
        );


    const feeType =
        String(
            settings.platform_fee_type ||
            "percentage"
        )
        .trim()
        .toLowerCase();


    if (
        Number.isNaN(feeValue) ||
        feeValue < 0
    ) {

        throw new Error(
            "Invalid platform fee value."
        );

    }


    let platformFeeAmount = 0;


    /* -----------------------------------------
       PERCENTAGE FEE
    ----------------------------------------- */

    if (feeType === "percentage") {

        platformFeeAmount =
            basePrice *
            feeValue /
            100;

    }


    /* -----------------------------------------
       FIXED FEE
    ----------------------------------------- */

    else if (feeType === "fixed") {

        platformFeeAmount =
            feeValue;

    }


    else {

        throw new Error(
            "Unsupported platform fee type."
        );

    }


    /*
    Round platform fee to 2 decimals
    */

    platformFeeAmount =
        Math.round(
            (
                platformFeeAmount +
                Number.EPSILON
            ) * 100
        ) / 100;


    /*
    Customer price
    */

    const customerPrice =
        Math.round(
            (
                basePrice +
                platformFeeAmount +
                Number.EPSILON
            ) * 100
        ) / 100;


    const result = {

        farmerPrice:
            basePrice,

        platformFeeAmount:
            platformFeeAmount,

        customerPrice:
            customerPrice,

        feeType:
            feeType,

        feeValue:
            feeValue

    };


    /*
    DEBUG
    */

    console.log(
        "💰 CALCULATED PRODUCT PRICING:",
        result
    );


    return result;

}


/* =========================================================
   LOAD PRODUCT FOR EDITING
========================================================= */

async function loadProduct(id) {

    const farmer =
        await getCurrentFarmer();


    const {
        data,
        error
    } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("farmer_id", farmer.id)
        .maybeSingle();


    if (error) {

        throw new Error(
            "Could not load product: " +
            error.message
        );

    }


    if (!data) {

        throw new Error(
            "Product not found or access denied."
        );

    }


    editingProduct =
        data;


    /*
    Page title
    */

    if (pageTitle) {

        pageTitle.textContent =
            "Edit Produce ✏️";

    }


    /*
    Button
    */

    if (saveProductBtn) {

        saveProductBtn.innerHTML =
            `Update Produce <span>→</span>`;

    }


    /*
    Product fields
    */

    if (productName) {

        productName.value =
            data.name || "";

    }


    if (productCategory) {

        productCategory.value =
            data.category_id || "";

    }


    if (productDescription) {

        productDescription.value =
            data.description || "";

    }


    /*
    IMPORTANT:
    Farmer sees original/base price,
    NOT customer price.
    */

    if (productPrice) {

        productPrice.value =
            data.price_per_unit ?? "";

    }


    if (productUnit) {

        productUnit.value =
            data.unit || "kg";

    }


    if (productStock) {

        productStock.value =
            data.stock ?? 0;

    }


    if (harvestDate) {

        harvestDate.value =
            data.harvest_date || "";

    }


    if (farmLocation) {

        farmLocation.value =
            data.farm_location || "";

    }


    if (imageUrl) {

        imageUrl.value =
            data.image_url || "";

    }


    if (isAvailable) {

        isAvailable.checked =
            data.is_available !== false;

    }

}


/* =========================================================
   SAVE / UPDATE PRODUCT
========================================================= */

if (form) {

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            try {

                setButtonLoading(true);


                /* -----------------------------------------
                   FARMER
                ----------------------------------------- */

                const farmer =
                    await getCurrentFarmer();


                /* -----------------------------------------
                   BASIC PRODUCT DATA
                ----------------------------------------- */

                const name =
                    productName.value.trim();


                const categoryId =
                    productCategory.value;


                const description =
                    productDescription.value.trim();


                /*
                Farmer entered price
                */

                const price =
                    Number(
                        productPrice.value
                    );


                const unit =
                    productUnit.value;


                const stock =
                    Number(
                        productStock.value
                    );


                const harvest =
                    harvestDate.value ||
                    null;


                const location =
                    farmLocation.value.trim();


                const image =
                    imageUrl.value.trim() ||
                    null;


                const available =
                    isAvailable.checked;


                /* -----------------------------------------
                   VALIDATION
                ----------------------------------------- */

                if (!name) {

                    throw new Error(
                        "Please enter product name."
                    );

                }


                if (!categoryId) {

                    throw new Error(
                        "Please select a category."
                    );

                }


                if (
                    Number.isNaN(price) ||
                    price < 0
                ) {

                    throw new Error(
                        "Please enter a valid price."
                    );

                }


                if (
                    Number.isNaN(stock) ||
                    stock < 0
                ) {

                    throw new Error(
                        "Please enter a valid stock."
                    );

                }


                /* -----------------------------------------
                   LOAD PLATFORM FEE
                ----------------------------------------- */

                const platformSettings =
                    await getPlatformSettings();


                /* -----------------------------------------
                   CALCULATE PRICING
                ----------------------------------------- */

                const pricing =
                    calculateProductPricing(
                        price,
                        platformSettings
                    );


                /*
                IMPORTANT DEBUG
                */

                console.log(
                    "================================"
                );

                console.log(
                    "PRODUCT PRICE:",
                    price
                );

                console.log(
                    "PLATFORM FEE VALUE:",
                    pricing.feeValue
                );

                console.log(
                    "PLATFORM FEE TYPE:",
                    pricing.feeType
                );

                console.log(
                    "CALCULATED PLATFORM FEE:",
                    pricing.platformFeeAmount
                );

                console.log(
                    "FINAL CUSTOMER PRICE:",
                    pricing.customerPrice
                );

                console.log(
                    "================================"
                );


                /* -----------------------------------------
                   PRODUCT DATA
                ----------------------------------------- */

                const productData = {

                    farmer_id:
                        farmer.id,

                    category_id:
                        categoryId,

                    name:
                        name,

                    description:
                        description || null,


                    /*
                    -----------------------------------------
                    FARMER BASE PRICE
                    -----------------------------------------
                    */

                    price_per_unit:
                        pricing.farmerPrice,


                    /*
                    -----------------------------------------
                    ACTUAL PLATFORM FEE AMOUNT
                    -----------------------------------------
                    */

                    platform_fee:
                        pricing.platformFeeAmount,


                    /*
                    -----------------------------------------
                    PLATFORM FEE TYPE
                    -----------------------------------------
                    */

                    platform_fee_type:
                        pricing.feeType,


                    /*
                    -----------------------------------------
                    PLATFORM FEE VALUE
                    -----------------------------------------
                    Example:
                    5 = 5%
                    or
                    10 = ₹10 fixed
                    -----------------------------------------
                    */

                    platform_fee_value:
                        pricing.feeValue,


                    /*
                    -----------------------------------------
                    FINAL CUSTOMER PRICE
                    -----------------------------------------
                    */

                    customer_price:
                        pricing.customerPrice,


                    unit:
                        unit,


                    harvest_date:
                        harvest,


                    image_url:
                        image,


                    is_active:
                        true,


                    is_available:
                        available,


                    stock:
                        stock,


                    farm_location:
                        location || null

                };


                /*
                -----------------------------------------
                FINAL VALIDATION
                -----------------------------------------
                */

                if (
                    productData.platform_fee === null ||
                    productData.platform_fee === undefined
                ) {

                    throw new Error(
                        "Platform fee calculation failed."
                    );

                }


                if (
                    productData.customer_price === null ||
                    productData.customer_price === undefined
                ) {

                    throw new Error(
                        "Customer price calculation failed."
                    );

                }


                /*
                -----------------------------------------
                UPDATE EXISTING PRODUCT
                -----------------------------------------
                */

                if (editingProduct) {

                    console.log(
                        "Updating product:",
                        productData
                    );


                    const {
                        data,
                        error
                    } = await supabase
                        .from("products")
                        .update(productData)
                        .eq(
                            "id",
                            editingProduct.id
                        )
                        .eq(
                            "farmer_id",
                            farmer.id
                        )
                        .select()
                        .single();


                    if (error) {

                        throw error;

                    }


                    console.log(
                        "✅ PRODUCT UPDATED:",
                        data
                    );


                    showMessage(
                        "Produce updated successfully! Platform fee and customer price updated. ✅",
                        "success"
                    );

                }


                /*
                -----------------------------------------
                INSERT NEW PRODUCT
                -----------------------------------------
                */

                else {

                    console.log(
                        "Inserting product:",
                        productData
                    );


                    const {
                        data,
                        error
                    } = await supabase
                        .from("products")
                        .insert(
                            productData
                        )
                        .select()
                        .single();


                    if (error) {

                        throw error;

                    }


                    console.log(
                        "✅ PRODUCT INSERTED:",
                        data
                    );


                    showMessage(
                        "Produce added successfully! Platform fee applied. 🎉",
                        "success"
                    );

                }


                /*
                -----------------------------------------
                REDIRECT
                -----------------------------------------
                */

                setTimeout(() => {

                    window.location.href =
                        "products.html";

                }, 1000);


            } catch (error) {

                console.error(
                    "❌ SAVE PRODUCT ERROR:",
                    error
                );


                showMessage(
                    error.message ||
                    "Could not save product.",
                    "error"
                );

            } finally {

                setButtonLoading(false);

            }

        }
    );

}


/* =========================================================
   SHOW MESSAGE
========================================================= */

function showMessage(
    message,
    type
) {

    if (!formMessage) {

        /*
        Fallback if formMessage doesn't exist
        */

        if (type === "error") {

            console.error(message);

        } else {

            console.log(message);

        }

        return;

    }


    formMessage.style.display =
        "block";


    formMessage.textContent =
        message;


    if (type === "success") {

        formMessage.style.background =
            "#e8f7ed";

        formMessage.style.color =
            "#16803c";

    } else {

        formMessage.style.background =
            "#fdebea";

        formMessage.style.color =
            "#b52d29";

    }

}


/* =========================================================
   BUTTON LOADING
========================================================= */

function setButtonLoading(
    loading
) {

    if (!saveProductBtn) return;


    saveProductBtn.disabled =
        loading;


    saveProductBtn.style.opacity =
        loading
            ? "0.7"
            : "1";


    if (loading) {

        saveProductBtn.innerHTML =
            "Saving...";

    } else {

        saveProductBtn.innerHTML =
            editingProduct
                ? `Update Produce <span>→</span>`
                : `Add Produce <span>→</span>`;

    }

}
