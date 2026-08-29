// ==========================================
// FASAL SETU FARMER - ADD PRODUCT WITH 10% FEE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const priceInput = document.getElementById('product-price');
  const unitInput = document.getElementById('product-unit');
  const previewBox = document.getElementById('price-fee-preview');

  // Real-time calculation of 10% platform fee on input
  if (priceInput) {
    priceInput.addEventListener('input', calculateFeePreview);
  }

  const addProductForm = document.getElementById('add-product-form');
  if (addProductForm) {
    addProductForm.addEventListener('submit', handleAddProductSubmit);
  }
});

function calculateFeePreview() {
  const priceInput = document.getElementById('product-price');
  const previewBox = document.getElementById('price-fee-preview');
  if (!priceInput || !previewBox) return;

  const farmerBasePrice = parseFloat(priceInput.value) || 0;
  const platformFee = Math.round(farmerBasePrice * 0.10); // 10% Fee
  const finalBuyerPrice = farmerBasePrice + platformFee;

  previewBox.innerHTML = `
    <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5 mt-2">
      <div class="flex justify-between text-slate-300">
        <span>आपका मूल्य (Farmer Net Rate):</span>
        <span class="font-bold text-white font-mono">₹${farmerBasePrice}</span>
      </div>
      <div class="flex justify-between text-emerald-400 font-medium">
        <span>+ 10% फ़सल सेतु सेवा शुल्क (Platform Fee):</span>
        <span class="font-bold font-mono">+ ₹${platformFee}</span>
      </div>
      <hr class="border-slate-800"/>
      <div class="flex justify-between text-white font-bold">
        <span>ग्राहक हेतु अंतिम मूल्य (Buyer Listing Price):</span>
        <span class="text-sm text-emerald-400 font-mono">₹${finalBuyerPrice}</span>
      </div>
    </div>
  `;
}

async function handleAddProductSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('btn-submit-product');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const pricePerUnit = parseFloat(document.getElementById('product-price').value) || 0;
    const unit = document.getElementById('product-unit').value || 'kg';
    const stock = parseFloat(document.getElementById('product-stock').value) || 10;
    const description = document.getElementById('product-description').value || '';
    const imageUrl = document.getElementById('product-image-url')?.value || '';
    const farmerId = localStorage.getItem('farmer_id') || 'farmer_1';

    // 10% Platform fee calculation
    const platformFee = Math.round(pricePerUnit * 0.10);
    const buyerDisplayPrice = pricePerUnit + platformFee;

    const payload = {
      name,
      category,
      price_per_unit: pricePerUnit, // Base price received by farmer
      platform_fee_percent: 10,
      platform_fee_amount: platformFee,
      buyer_price: buyerDisplayPrice, // Price with 10% fee
      unit,
      stock,
      description,
      image_url: imageUrl,
      farmer_id: farmerId,
      status: 'active',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient.from('products').insert([payload]);
    if (error) throw error;

    alert('✅ उत्पाद 10% प्लेटफ़ॉर्म शुल्क संरचना के साथ सफलतापूर्वक सूचीबद्ध हो गया!');
    window.location.href = 'dashboard.html';
  } catch (err) {
    alert('त्रुटि: ' + err.message);
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}