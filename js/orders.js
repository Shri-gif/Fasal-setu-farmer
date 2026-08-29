// ==========================================
// FASAL SETU FARMER - ORDERS & SLIP LOGIC
// ==========================================

let currentFarmerOrders = [];

// Fetch and render orders for the logged-in farmer
async function loadFarmerOrders() {
  const farmerId = localStorage.getItem('farmer_id') || 'farmer_1';
  const ordersTableBody = document.getElementById('orders-table-body');
  const loadingIndicator = document.getElementById('orders-loading');

  try {
    if (loadingIndicator) loadingIndicator.style.display = 'block';

    // Supabase query to get orders for this farmer
    const { data: orders, error } = await supabaseClient
      .from('orders')
      .select('*, products(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    currentFarmerOrders = orders || [];
    renderOrdersList(currentFarmerOrders);
  } catch (err) {
    console.error('Error loading farmer orders:', err);
    if (ordersTableBody) {
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-6 text-red-400">
            ऑर्डर्स लोड करने में त्रुटि: ${err.message}
          </td>
        </tr>
      `;
    }
  } finally {
    if (loadingIndicator) loadingIndicator.style.display = 'none';
  }
}

// Render Orders Table
function renderOrdersList(orders) {
  const container = document.getElementById('orders-table-body');
  if (!container) return;

  if (!orders || orders.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-12 text-slate-400">
          <div class="empty-state">
            <p class="text-lg font-semibold">अभी कोई आर्डर प्राप्त नहीं हुआ है।</p>
            <p class="text-xs text-slate-500">जब ग्राहक आपके उत्पाद का आर्डर करेंगे, वह यहाँ दिखाई देगा।</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = orders.map((order) => {
    const qty = Number(order.quantity) || 1;
    const unitPrice = Number(order.price_per_unit) || (order.products ? order.products.price_per_unit : 0);
    
    // 10% Platform Fee Calculation
    const baseSubtotal = qty * unitPrice;
    const platformFee = Math.round(baseSubtotal * 0.10);
    const totalAmount = Number(order.total_amount) || (baseSubtotal + platformFee);
    const farmerNetEarnings = baseSubtotal;

    return `
      <tr class="hover:bg-slate-800/50 border-b border-slate-800 transition-colors">
        <td class="py-3.5 px-4 font-mono font-bold text-emerald-400">#${order.id}</td>
        <td class="py-3.5 px-4">
          <p class="font-bold text-white">${order.customer_name || 'ग्राहक'}</p>
          <p class="text-xs text-slate-400 font-mono">${order.customer_mobile || 'N/A'}</p>
        </td>
        <td class="py-3.5 px-4">
          <p class="font-medium text-slate-200">${order.products ? order.products.name : (order.product_name || 'फसल उत्पाद')}</p>
          <p class="text-xs text-slate-400">${qty} units @ ₹${unitPrice}/unit</p>
        </td>
        <td class="py-3.5 px-4">
          <p class="text-xs text-slate-300">${order.city || 'Lucknow'}</p>
          <p class="text-[10px] text-slate-500 truncate max-w-[140px]">${order.delivery_address || 'Home Delivery'}</p>
        </td>
        <td class="py-3.5 px-4">
          <div class="text-xs">
            <p class="font-bold text-emerald-400 text-sm">₹${totalAmount}</p>
            <p class="text-[10px] text-slate-400">फसल: ₹${baseSubtotal} + 10% शुल्क: ₹${platformFee}</p>
            <p class="text-[10px] text-teal-300 font-semibold">किसान आय: ₹${farmerNetEarnings}</p>
          </div>
        </td>
        <td class="py-3.5 px-4">
          <span class="status-badge status-${order.status || 'pending'} px-2 py-0.5 rounded-full text-xs font-bold uppercase">
            ${order.status || 'pending'}
          </span>
        </td>
        <td class="py-3.5 px-4 text-right">
          <button onclick="openOrderSlipModal('${order.id}')" class="btn-slip px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm">
            📄 View Slip & Invoice
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Open and Generate 10% Platform Fee Order Slip Modal
function openOrderSlipModal(orderId) {
  const order = currentFarmerOrders.find(o => String(o.id) === String(orderId));
  if (!order) return;

  const qty = Number(order.quantity) || 1;
  const unitPrice = Number(order.price_per_unit) || (order.products ? order.products.price_per_unit : 0);
  
  // 10% PLATFORM FEE CALCULATION
  const baseSubtotal = qty * unitPrice;
  const platformFee = Math.round(baseSubtotal * 0.10); // 10% Fee
  const totalAmount = Number(order.total_amount) || (baseSubtotal + platformFee);
  const farmerEarnings = baseSubtotal;

  const modalContainer = document.getElementById('order-slip-modal-container') || createModalContainer();

  const cleanPhone = (order.customer_mobile || '').replace(/[^0-9]/g, '');
  const waBillText = `*🌾 FASAL SETU - OFFICIAL ORDER SLIP & INVOICE 🌾*
----------------------------------------
*Order ID:* #${order.id}
*Date:* ${new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
*Status:* ${(order.status || 'CONFIRMED').toUpperCase()}

*Customer Name:* ${order.customer_name}
*Customer Mobile:* ${order.customer_mobile}
*Delivery Address:* ${order.delivery_address}, ${order.city} - ${order.pincode}

----------------------------------------
*ITEM & RATE BREAKDOWN:*
• Produce: ${order.products ? order.products.name : (order.product_name || 'Farm Fresh Produce')}
• Quantity: ${qty} units @ ₹${unitPrice}/unit
• Base Produce Amount: ₹${baseSubtotal}

*PLATFORM CHARGES:*
• 10% Fasal Setu Platform & Mandi Service Fee: ₹${platformFee}
• Direct Farmer Delivery: ₹0 (FREE)
----------------------------------------
*TOTAL PAYABLE BY BUYER:* ₹${totalAmount}
*FARMER NET RECEIVABLE PAYOUT:* ₹${farmerEarnings}
----------------------------------------
Empowering Indian Farmers through Direct Mandi Access!`;

  const waLink = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(waBillText)}`;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" id="order-slip-backdrop">
      <div class="relative w-full max-w-2xl rounded-3xl bg-[#11151c] border border-slate-800 shadow-2xl overflow-hidden text-slate-200 max-h-[92vh] flex flex-col">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-950 via-[#11151c] to-teal-950 px-6 py-4 flex items-center justify-between border-b border-emerald-500/20">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">🌾</span>
            <div>
              <h2 class="text-lg font-bold text-white">Fasal Setu Official Order Slip</h2>
              <p class="text-xs text-emerald-400">Invoice: FS-ORD-${order.id}</p>
            </div>
          </div>
          <button onclick="closeOrderSlipModal()" class="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center">✕</button>
        </div>

        <!-- Slip Content (Printable Area) -->
        <div class="p-6 overflow-y-auto space-y-5" id="printable-area">
          
          <!-- Order Header Stamp -->
          <div class="p-4 rounded-2xl bg-[#0c1017] border border-slate-800 flex justify-between items-center">
            <div>
              <h3 class="text-base font-extrabold text-white">FASAL SETU FARMER CONNECT</h3>
              <p class="text-xs text-slate-400">Direct Producer to Consumer Portal</p>
            </div>
            <div class="text-right">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                10% Platform Fee Included
              </span>
            </div>
          </div>

          <!-- Customer & Delivery -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div class="p-4 rounded-2xl bg-[#0c1017] border border-slate-800">
              <p class="font-bold text-emerald-400 mb-1">ग्राहक विवरण (Customer Details):</p>
              <p class="font-bold text-white text-sm">${order.customer_name}</p>
              <p class="font-mono text-slate-300 mt-1">📞 ${order.customer_mobile}</p>
            </div>
            <div class="p-4 rounded-2xl bg-[#0c1017] border border-slate-800">
              <p class="font-bold text-emerald-400 mb-1">डिलीवरी पता (Delivery Address):</p>
              <p class="text-slate-200">${order.delivery_address || 'Home Delivery'}</p>
              <p class="font-bold text-white mt-1">${order.city || 'Lucknow'} - ${order.pincode || '226001'}</p>
            </div>
          </div>

          <!-- Produce & 10% Fee Breakdown Table -->
          <div class="rounded-2xl border border-slate-800 bg-[#0c1017] overflow-hidden">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th class="p-3">उत्पाद (Produce)</th>
                  <th class="p-3 text-center">मात्रा (Qty)</th>
                  <th class="p-3 text-right">दर (Rate)</th>
                  <th class="p-3 text-right">मूल राशि (Base)</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-slate-800/80">
                  <td class="p-3 font-bold text-white">
                    ${order.products ? order.products.name : (order.product_name || 'Farm Fresh Produce')}
                  </td>
                  <td class="p-3 text-center font-bold text-white">${qty}</td>
                  <td class="p-3 text-right font-mono text-slate-300">₹${unitPrice}</td>
                  <td class="p-3 text-right font-mono font-bold text-white">₹${baseSubtotal}</td>
                </tr>
              </tbody>
            </table>

            <!-- Detailed Charge Line Items -->
            <div class="p-4 space-y-2 text-xs border-t border-slate-800">
              <div class="flex justify-between text-slate-300">
                <span>फसल मूल राशि (Produce Base Total):</span>
                <span class="font-mono font-bold">₹${baseSubtotal}</span>
              </div>

              <!-- 10% PLATFORM FEE ITEM -->
              <div class="flex justify-between text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 font-bold">
                <span class="flex items-center gap-1">
                  <span>⚡</span> 10% फ़सल सेतु प्लेटफ़ॉर्म एवं सेवा शुल्क (Platform Fee):
                </span>
                <span class="font-mono">+ ₹${platformFee}</span>
              </div>

              <div class="flex justify-between text-slate-400">
                <span>फार्म डिलीवरी व हैंडलिंग (Delivery & Logistics):</span>
                <span class="text-emerald-400 font-bold">FREE (₹0)</span>
              </div>

              <hr class="border-slate-800 my-2" />

              <!-- Total Payable -->
              <div class="flex justify-between items-center text-sm font-black bg-[#11151c] p-3 rounded-xl border border-slate-800">
                <span class="text-white">कुल देय राशि (Total Payable Amount):</span>
                <span class="text-xl text-emerald-400 font-mono">₹${totalAmount}</span>
              </div>

              <!-- Farmer Net Payout -->
              <div class="flex justify-between items-center text-xs text-slate-300 px-3 py-1.5 bg-slate-900/80 rounded-lg">
                <span>🌾 किसान शुद्ध भुगतान (Farmer Net Payout):</span>
                <span class="font-mono font-bold text-white">₹${farmerEarnings}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Footer -->
        <div class="bg-[#0c1017] px-6 py-4 border-t border-slate-800 flex justify-between items-center">
          <div class="flex space-x-2">
            <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center space-x-1.5">
              <span>🖨️ Print Slip</span>
            </button>
            <a href="${waLink}" target="_blank" class="px-4 py-2 rounded-xl bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 text-xs font-bold border border-[#25D366]/40 flex items-center space-x-1.5">
              <span>💬 WhatsApp Slip</span>
            </a>
          </div>
          <button onclick="closeOrderSlipModal()" class="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">
            बंद करें (Close)
          </button>
        </div>

      </div>
    </div>
  `;
}

function createModalContainer() {
  const div = document.createElement('div');
  div.id = 'order-slip-modal-container';
  document.body.appendChild(div);
  return div;
}

function closeOrderSlipModal() {
  const container = document.getElementById('order-slip-modal-container');
  if (container) container.innerHTML = '';
}

// Load on page ready
document.addEventListener('DOMContentLoaded', loadFarmerOrders);