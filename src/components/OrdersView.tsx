import React, { useState } from 'react';
import { Order, Product } from '../types';
import { Search, Phone, MapPin, Calendar, Clock, CheckCircle2, AlertCircle, Truck, PackageCheck, UserCheck } from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  products: Product[];
  onUpdateOrderStatus: (orderId: string, newStatus: string) => void;
  onNavigate: (tab: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  products,
  onUpdateOrderStatus,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Metrics
  const totalCount = orders.length;
  const pendingCount = orders.filter(
    (o) => (o.order_status || o.status || '').toLowerCase() === 'pending' || (o.order_status || o.status || '').toLowerCase() === 'new'
  ).length;
  const completedCount = orders.filter(
    (o) => (o.order_status || o.status || '').toLowerCase() === 'completed' || (o.order_status || o.status || '').toLowerCase() === 'delivered'
  ).length;

  const filteredOrders = orders.filter((order) => {
    const status = (order.order_status || order.status || 'pending').toLowerCase();
    const product = order.product || productMap.get(order.product_id);
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      order.id.toLowerCase().includes(search) ||
      order.customer_name.toLowerCase().includes(search) ||
      (order.customer_mobile && order.customer_mobile.includes(search)) ||
      (product?.name && product.name.toLowerCase().includes(search)) ||
      (order.city && order.city.toLowerCase().includes(search));

    const matchesStatus =
      statusFilter === 'all' ||
      status === statusFilter ||
      (statusFilter === 'pending' && (status === 'pending' || status === 'new')) ||
      (statusFilter === 'completed' && (status === 'completed' || status === 'delivered'));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5 pb-14">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <span>📦</span> Orders Fulfillment
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Customer Orders (ग्राहकों के आर्डर)
        </h1>
        <p className="text-xs text-slate-500">
          Track harvest dispatches, update order status, and contact buyers
        </p>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Orders</span>
          <strong className="text-xl font-black text-slate-900">{totalCount}</strong>
        </div>
        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 text-center">
          <span className="text-[11px] font-semibold text-amber-800 block">🟡 Pending Action</span>
          <strong className="text-xl font-black text-amber-800">{pendingCount}</strong>
        </div>
        <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 text-center">
          <span className="text-[11px] font-semibold text-emerald-800 block">🟢 Completed</span>
          <strong className="text-xl font-black text-emerald-800">{completedCount}</strong>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, customer name, mobile, or crop..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
        >
          <option value="all">All Orders (सभी आर्डर)</option>
          <option value="pending">Pending / New</option>
          <option value="confirmed">Confirmed</option>
          <option value="packed">Packed / Ready</option>
          <option value="dispatched">Dispatched</option>
          <option value="completed">Completed / Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <div className="text-5xl mb-3">📦</div>
          <h2 className="text-base font-bold text-slate-800">No Orders Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'No customer orders matched your selected filters.'
              : 'When customers place orders for your farm produce, they will appear here.'}
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800"
          >
            Check Produce Inventory
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const product = order.product || productMap.get(order.product_id);
            const status = (order.order_status || order.status || 'pending').toLowerCase();
            const paymentStatus = (order.payment_status || 'pending').toLowerCase();
            const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <article
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[11px] font-extrabold uppercase">
                      ORDER
                    </span>
                    <strong className="text-xs font-mono font-bold text-slate-800">
                      #{order.id.slice(0, 10).toUpperCase()}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {orderDate}
                    </span>

                    {/* Status Pill */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        status === 'completed' || status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : status === 'packed'
                          ? 'bg-indigo-100 text-indigo-800'
                          : status === 'dispatched'
                          ? 'bg-purple-100 text-purple-800'
                          : status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Main Order Details Grid */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Customer and Delivery Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px] mb-1">
                        Buyer Details
                      </span>
                      <div className="font-bold text-slate-900 text-sm">
                        {order.customer_name}
                      </div>
                      {order.customer_mobile && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-600">{order.customer_mobile}</span>
                          <a
                            href={`tel:${order.customer_mobile}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100"
                          >
                            <Phone className="w-3 h-3" /> Call Buyer
                          </a>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px] mb-1">
                        Delivery Destination & Slot
                      </span>
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>
                          {order.delivery_address}
                          {order.city ? `, ${order.city}` : ''}
                          {order.pincode ? ` - ${order.pincode}` : ''}
                        </span>
                      </div>
                      {order.delivery_slot && (
                        <div className="flex items-center gap-1 text-slate-500 mt-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Slot: {order.delivery_slot}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Itemized Harvest Card */}
                  <div className="bg-slate-50 rounded-xl p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-emerald-100/70 text-emerald-900 flex items-center justify-center text-xl flex-shrink-0">
                        🥬
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          {product?.name || 'Fresh Farm Produce'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Qty: <span className="font-bold text-slate-800">{order.quantity} {product?.unit || 'kg'}</span> × ₹{order.price_per_unit} per {product?.unit || 'unit'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-slate-900">
                        ₹{Number(order.total_amount || order.subtotal || 0).toLocaleString('en-IN')}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Payment: {paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {order.notes && (
                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-amber-900 text-xs flex items-start gap-2">
                      <span className="font-bold">📝 Note:</span>
                      <span>{order.notes}</span>
                    </div>
                  )}

                  {/* Order Status Action Selector */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
                    <div className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-700" />
                      <span>Update Dispatch Lifecycle:</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {status === 'pending' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'confirmed')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                        >
                          Accept & Confirm ✓
                        </button>
                      )}
                      {status === 'confirmed' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'packed')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                        >
                          Mark as Packed 📦
                        </button>
                      )}
                      {status === 'packed' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'dispatched')}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs"
                        >
                          Mark as Dispatched 🚚
                        </button>
                      )}
                      {status === 'dispatched' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
                        >
                          Mark Delivered / Completed 🎉
                        </button>
                      )}
                      {status !== 'completed' && status !== 'cancelled' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all"
                        >
                          Reject / Cancel
                        </button>
                      )}
                      {status === 'completed' && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Order Successfully Fulfilled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
