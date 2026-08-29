// ==========================================
// FASAL SETU FARMER - EARNINGS & 10% FEE BREAKDOWN
// ==========================================

async function loadFarmerEarnings() {
  try {
    const { data: orders, error } = await supabaseClient
      .from('orders')
      .select('*')
      .neq('status', 'cancelled');

    if (error) throw error;

    let totalGrossSales = 0;
    let totalPlatformFee = 0;
    let totalFarmerNetEarnings = 0;
    let completedOrdersCount = 0;

    (orders || []).forEach((ord) => {
      const qty = Number(ord.quantity) || 1;
      const unitPrice = Number(ord.price_per_unit) || 0;
      const baseSubtotal = qty * unitPrice;
      const fee = Math.round(baseSubtotal * 0.10);
      const total = Number(ord.total_amount) || (baseSubtotal + fee);

      totalGrossSales += total;
      totalPlatformFee += fee;
      totalFarmerNetEarnings += baseSubtotal;

      if (ord.status === 'delivered') {
        completedOrdersCount++;
      }
    });

    // Update UI Elements
    const grossEl = document.getElementById('total-gross-revenue');
    const feeEl = document.getElementById('total-platform-fee');
    const netEl = document.getElementById('farmer-net-earnings');
    const ordersCountEl = document.getElementById('total-orders-count');

    if (grossEl) grossEl.innerText = `₹${totalGrossSales.toLocaleString('en-IN')}`;
    if (feeEl) feeEl.innerText = `₹${totalPlatformFee.toLocaleString('en-IN')}`;
    if (netEl) netEl.innerText = `₹${totalFarmerNetEarnings.toLocaleString('en-IN')}`;
    if (ordersCountEl) ordersCountEl.innerText = orders.length;

  } catch (err) {
    console.error('Error calculating farmer earnings:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadFarmerEarnings);