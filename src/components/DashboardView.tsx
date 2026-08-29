import React from 'react';
import { Product, Order } from '../types';
import { Plus, ArrowRight, PackageCheck, AlertCircle, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface DashboardViewProps {
  products: Product[];
  orders: Order[];
  totalEarnings: number;
  monthlyEarnings: number;
  farmerName: string;
  farmName: string;
  onNavigate: (tab: string, productId?: string) => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  orders,
  totalEarnings,
  monthlyEarnings,
  farmerName,
  farmName,
  onNavigate,
  onUpdateOrderStatus,
}) => {
  const pendingOrders = orders.filter(
    (o) => (o.order_status || o.status || '').toLowerCase() === 'pending' || (o.order_status || o.status || '').toLowerCase() === 'new'
  );
  
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const availableProductsCount = products.filter(
    (p) => p.is_available && Number(p.stock) > 0
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-semibold mb-3 border border-emerald-500/30">
            <span>🌾</span> Farmer Portal • किसान सेवा
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Namaste, {farmerName || "Farmer"}! 🙏
          </h1>
          <p className="text-emerald-100/90 text-sm leading-relaxed mb-5">
            {farmName ? `Managing ${farmName}.` : "Direct farm to table commerce."} Manage your harvest listings, fulfill customer orders, and track your daily payouts in one place.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('add-product')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-sm transition-all active:scale-95 shadow-xs"
              id="dashboard-add-product-btn"
            >
              <Plus className="w-4 h-4" />
              List New Crop / Produce
            </button>
            <button
              onClick={() => onNavigate('orders')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/15"
              id="dashboard-view-orders-btn"
            >
              View Active Orders ({pendingOrders.length})
            </button>
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute right-4 -bottom-6 text-8xl opacity-20 pointer-events-none select-none">
          🌾
        </div>
      </section>

      {/* Primary Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Products */}
        <div 
          onClick={() => onNavigate('products')}
          className="bg-white p-5 rounded-2xl border border-emerald-100/80 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Farm Produce
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              🥬
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {products.length}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-medium">
            <span>{availableProductsCount} active for sale</span>
            <span className="text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              Manage →
            </span>
          </div>
        </div>

        {/* Pending Orders */}
        <div 
          onClick={() => onNavigate('orders')}
          className="bg-white p-5 rounded-2xl border border-emerald-100/80 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              📦
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
            <span>{pendingOrders.length}</span>
            {pendingOrders.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                Action needed
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-medium">
            <span>{orders.length} total orders</span>
            <span className="text-amber-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              Review →
            </span>
          </div>
        </div>

        {/* Total Earnings */}
        <div 
          onClick={() => onNavigate('earnings')}
          className="bg-white p-5 rounded-2xl border border-emerald-100/80 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Total Earnings
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              💰
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-800 tracking-tight">
            ₹{totalEarnings.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-medium">
            <span>₹{monthlyEarnings.toLocaleString('en-IN')} this month</span>
            <span className="text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
              Analytics →
            </span>
          </div>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Quick Actions • त्वरित कार्य
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('add-product')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-xs transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg mb-3">
              ➕
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                Add Produce
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">List vegetables, grains, fruits</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('products')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-xs transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center text-lg mb-3">
              🥕
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                Inventory & Stock
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Update prices & quantities</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('orders')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-xs transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-lg mb-3">
              📦
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                Process Orders
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Dispatch & confirm delivery</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('earnings')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-xs transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg mb-3">
              💵
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                Earnings Payout
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">View settlements & history</p>
            </div>
          </button>
        </div>
      </section>

      {/* Recent Orders Section */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-base text-slate-900">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-slate-500">Live order feeds from local buyers</p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            View All ({orders.length}) →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <div className="text-4xl mb-2">📦</div>
            <h3 className="font-bold text-sm text-slate-800">No Orders Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              As soon as nearby customers purchase your products, orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => {
              const matchedProduct = products.find((p) => p.id === order.product_id);
              const productName = order.product?.name || matchedProduct?.name || 'Fresh Produce';
              const status = (order.order_status || order.status || 'pending').toLowerCase();

              return (
                <div
                  key={order.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-lg flex-shrink-0">
                      📦
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {productName}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          ({order.quantity} {matchedProduct?.unit || 'units'})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Ordered by <span className="font-medium text-slate-700">{order.customer_name}</span> • {order.city || 'Nearby'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(order.created_at).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="font-extrabold text-sm text-emerald-800">
                        ₹{Number(order.total_amount || order.subtotal || 0).toLocaleString('en-IN')}
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                          status === 'completed' || status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {status.toUpperCase()}
                      </span>
                    </div>

                    {status === 'pending' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'confirmed')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        Accept
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Farmer Advisory Tip */}
      <section className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl flex-shrink-0">
          💡
        </div>
        <div>
          <h3 className="font-bold text-sm text-amber-950">
            Kisan Salah (किसान सलाह) • Direct Selling Tip
          </h3>
          <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
            Update your daily harvest availability before 8:00 AM. Urban customers prefer buying vegetables harvested on the same morning, boosting your store visibility and rating!
          </p>
        </div>
      </section>
    </div>
  );
};
