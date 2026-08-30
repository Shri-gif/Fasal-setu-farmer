// ==========================================
// FASAL SETU FARMER - ADD PRODUCT
// Dynamic Platform Fee from site_settings
// ==========================================

let platformSettings = {
  platform_fee: 0,
  platform_fee_type: "percentage"
};

document.addEventListener("DOMContentLoaded", async () => {
  await loadPlatformSettings();

  const priceInput = document.getElementById("product-price");

  if (priceInput) {
    priceInput.addEventListener("input", calculateFeePreview);
  }

  const addProductForm = document.getElementById("add-product-form");

  if (addProductForm) {
    addProductForm.addEventListener("submit", handleAddProductSubmit);
  }

  calculateFeePreview();
});

// ==========================================
// LOAD PLATFORM SETTINGS FROM SUPABASE
// ==========================================

async function getPlatformSettings() {
  const { data, error } = await supabaseClient
    .from("site_settings")
    .select("platform_fee, platform_fee_type")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("Platform settings error:", error);
    throw error;
  }

  return data;
}

async function loadPlatformSettings() {
  try {
    const data = await getPlatformSettings();

    if (!data) {
      console.warn("Platform fee settings are not configured.");
      return;
    }

    platformSettings = {
      platform_fee: Number(data.platform_fee) || 0,
      platform_fee_type: data.platform_fee_type || "percentage"
    };

    console.log("Platform settings loaded:", platformSettings);

  } catch (error) {
    console.error("Could not load platform settings:", error);
  }
}

// ==========================================
// CALCULATE PLATFORM FEE
// ==========================================

function getFeeCalculation(basePrice) {
  const price = Number(basePrice) || 0;
  const fee = Number(platformSettings.platform_fee) || 0;
  const feeType = platformSettings.platform_fee_type || "percentage";

  let platformFee = 0;

  if (feeType === "percentage") {
    platformFee = price * (fee / 100);
  } else {
    platformFee = fee;
  }

  platformFee = Math.round(platformFee * 100) / 100;

  return {
    farmerPrice: price,
    feeValue: fee,
    feeType,
    platformFee,
    customerPrice: price + platformFee
  };
}

// ==========================================
// LIVE PRICE PREVIEW
// ==========================================

function calculateFeePreview() {
  const priceInput = document.getElementById("product-price");
  const previewBox = document.getElementById("price-fee-preview");

  if (!priceInput || !previewBox) return;

  const farmerBasePrice = parseFloat(priceInput.value) || 0;

  const {
    feeValue,
    feeType,
    platformFee,
    customerPrice
  } = getFeeCalculation(farmerBasePrice);

  const feeLabel =
    feeType === "percentage"
      ? `${feeValue}%`
      : `₹${feeValue}`;

  previewBox.innerHTML = `
    <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5 mt-2">

      <div class="flex justify-between text-slate-300">
        <span>आपका मूल्य (Farmer Rate):</span>
        <span class="font-bold text-white font-mono">
          ₹${farmerBasePrice}
        </span>
      </div>

      <div class="flex justify-between text-emerald-400 font-medium">
        <span>+ ${feeLabel} फ़सल सेतु सेवा शुल्क:</span>
        <span class="font-bold font-mono">
          + ₹${platformFee}
        </span>
      </div>

      <hr class="border-slate-800"/>

      <div class="flex justify-between text-white font-bold">
        <span>ग्राहक हेतु अंतिम मूल्य:</span>
        <span class="text-sm text-emerald-400 font-mono">
          ₹${customerPrice}
        </span>
      </div>

    </div>
  `;
}

// ==========================================
// ADD PRODUCT
// ==========================================

async function handleAddProductSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById("btn-submit-product");

  if (submitBtn) {
    submitBtn.disabled = true;
  }

  try {
    // Always load latest settings before saving
    await loadPlatformSettings();

    const name = document.getElementById("product-name").value;
    const category = document.getElementById("product-category").value;

    const pricePerUnit =
      parseFloat(document.getElementById("product-price").value) || 0;

    const unit =
      document.getElementById("product-unit").value || "kg";

    const stock =
      parseFloat(document.getElementById("product-stock").value) || 10;

    const description =
      document.getElementById("product-description").value || "";

    const imageUrl =
      document.getElementById("product-image-url")?.value || "";

    const farmerId =
      localStorage.getItem("farmer_id") || "farmer_1";

    // Dynamic fee calculation
    const {
      feeValue,
      feeType,
      platformFee,
      customerPrice
    } = getFeeCalculation(pricePerUnit);

    const payload = {
      name,
      category,

      // Farmer's actual base price
      price_per_unit: pricePerUnit,

      // Dynamic platform fee
      platform_fee_percent:
        feeType === "percentage" ? feeValue : 0,

      platform_fee_amount: platformFee,

      // Final customer price
      buyer_price: customerPrice,

      unit,
      stock,
      description,
      image_url: imageUrl,
      farmer_id: farmerId,
      status: "active",
      created_at: new Date().toISOString()
    };

    const { error } = await supabaseClient
      .from("products")
      .insert([payload]);

    if (error) throw error;

    alert(
      `✅ उत्पाद सफलतापूर्वक सूचीबद्ध हो गया!

Farmer Rate: ₹${pricePerUnit}
Platform Fee: ₹${platformFee}
Customer Price: ₹${customerPrice}`
    );

    window.location.href = "dashboard.html";

  } catch (err) {
    console.error(err);

    alert(
      "त्रुटि: " +
      (err.message || "Product could not be listed.")
    );

  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
    }
  }
}
