import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  PackageCheck, 
  AlertCircle, 
  Phone, 
  MapPin, 
  IndianRupee,
  FileText,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { Order, OrderStatus, Language } from '../types';

interface OrdersViewProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  language: Language;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onUpdateStatus,
  language,
}) => {
  const isHi = language === 'hi';

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch = ord.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.items.some(i => i.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || ord.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          label: isHi ? 'सफलतापूर्वक डिलीवर' : 'Delivered (Wallet Credited)',
          icon: CheckCircle2,
        };
      case 'shipped':
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          label: isHi ? 'रास्ते में / डिस्पैच' : 'Shipped & In-Transit',
          icon: Truck,
        };
      case 'confirmed':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          label: isHi ? 'स्वीकृत / पैकिंग जारी' : 'Confirmed & Packing',
          icon: PackageCheck,
        };
      case 'pending':
      default:
        return {
          bg: 'bg-stone-100 text-stone-700 border-stone-300',
          label: isHi ? 'नया ऑर्डर (लंबित)' : 'New Pending Order',
          icon: Clock,
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif tracking-tight flex items-center gap-2">
            <span>{isHi ? 'ऑर्डर और मंडी बिक्री' : 'Orders & Mandi Sales'}</span>
            <span className="text-xs font-sans bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              {orders.length} {isHi ? 'कुल ऑर्डर' : 'Orders'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {isHi ? 'डिलीवरी होते ही 100% किसान कमाई आपके वॉलेट में उपलब्ध हो जाती है' : '100% Farmer net proceeds are credited directly to wallet on delivery'}
          </p>
        </div>

        {/* Quick status tabs */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
          {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st === 'all' ? (isHi ? 'सभी' : 'All') : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500 space-y-3">
          <ShoppingBag className="w-10 h-10 mx-auto text-stone-400" />
          <h3 className="text-base font-bold text-stone-800">{isHi ? 'कोई ऑर्डर नहीं मिला' : 'No orders found'}</h3>
          <p className="text-xs">{isHi ? 'चयनित फ़िल्टर के अनुसार कोई ऑर्डर मौजूद नहीं है।' : 'No orders match the selected filter.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.order_status);
            const BadgeIcon = badge.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="bg-white border border-stone-200 hover:border-emerald-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
                {/* Order Summary Bar */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Order ID & Buyer */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-emerald-800 text-sm">
                        {order.order_number}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${badge.bg}`}>
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-700 pt-1">
                      <span className="font-bold text-stone-900">{order.buyer_name}</span>
                      <span className="text-stone-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        {order.buyer_phone}
                      </span>
                      <span className="text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {order.buyer_location}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Items Snippet */}
                  <div className="text-xs text-stone-700">
                    <div className="text-stone-500 text-[11px] uppercase font-bold tracking-wider">
                      {isHi ? 'उत्पाद:' : 'Items:'}
                    </div>
                    {order.items.map((it, idx) => (
                      <div key={idx} className="font-bold text-stone-900">
                        {it.product_name} • {it.quantity} {it.unit}
                      </div>
                    ))}
                  </div>

                  {/* Right: Net Farmer Earnings & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-stone-100">
                    <div className="text-left lg:text-right">
                      <div className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">
                        {isHi ? 'आपकी कुल कमाई (Net):' : 'Farmer Net Share:'}
                      </div>
                      <div className="text-lg font-black text-emerald-700 font-mono">
                        ₹{order.farmer_net_earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {isHi ? 'खरीदार कुल:' : 'Buyer Grand Total:'} ₹{order.grand_total.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="flex items-center gap-2">
                      {order.order_status === 'pending' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'confirmed')}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          {isHi ? 'ऑर्डर स्वीकारें' : 'Accept Order'}
                        </button>
                      )}
                      {order.order_status === 'confirmed' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'shipped')}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{isHi ? 'डिस्पैच करें' : 'Mark Shipped'}</span>
                        </button>
                      )}
                      {order.order_status === 'shipped' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'delivered')}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isHi ? 'डिलीवर हुआ (वॉलेट में जमा)' : 'Confirm Delivery'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer"
                        title={isHi ? 'विस्तृत बिल देखें' : 'View Breakdown'}
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Invoice & Tax Breakdown Drawer */}
                {isExpanded && (
                  <div className="bg-stone-50 border-t border-stone-200 p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between text-xs text-stone-600">
                      <span className="font-bold uppercase tracking-wider text-emerald-800">
                        {isHi ? 'पारदर्शी बिल व कर विवरण (Supabase 10% Fee + GST)' : 'Itemized Billing & Tax Breakdown (10% Fee + GST)'}
                      </span>
                      <span>Payment Method: <strong className="uppercase text-stone-900">{order.payment_method}</strong></span>
                    </div>

                    <div className="border border-stone-200 rounded-xl overflow-hidden text-xs bg-white">
                      <table className="w-full text-left">
                        <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                          <tr>
                            <th className="p-3">Item</th>
                            <th className="p-3 text-right">Farmer Base Rate</th>
                            <th className="p-3 text-right">Platform Fee (10%)</th>
                            <th className="p-3 text-right">GST Tax</th>
                            <th className="p-3 text-right">Buyer Final Price</th>
                            <th className="p-3 text-right">Farmer Net</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {order.items.map((it, i) => (
                            <tr key={i} className="text-stone-700">
                              <td className="p-3">
                                <div className="font-bold text-stone-900">{it.product_name}</div>
                                <div className="text-stone-500 text-[11px]">{it.quantity} {it.unit}</div>
                              </td>
                              <td className="p-3 text-right font-mono">₹{it.farmer_base_price} / {it.unit}</td>
                              <td className="p-3 text-right font-mono text-amber-800 font-bold">+₹{it.platform_fee_amount} / {it.unit}</td>
                              <td className="p-3 text-right font-mono text-blue-800 font-bold">+₹{it.gst_amount} / {it.unit}</td>
                              <td className="p-3 text-right font-mono font-bold text-stone-900">₹{it.final_price} / {it.unit}</td>
                              <td className="p-3 text-right font-mono font-black text-emerald-700">₹{it.farmer_base_price * it.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-stone-50 font-bold border-t border-stone-200 text-stone-800">
                          <tr>
                            <td colSpan={3} className="p-3">Total Order Breakdown</td>
                            <td className="p-3 text-right text-blue-800 font-mono">GST: ₹{order.total_gst}</td>
                            <td className="p-3 text-right text-stone-900 font-mono">Buyer Paid: ₹{order.grand_total}</td>
                            <td className="p-3 text-right text-emerald-800 text-sm font-mono font-black">
                              Net Farmer: ₹{order.farmer_net_earnings}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>
                          {order.payment_status === 'released_to_wallet'
                            ? (isHi ? 'भुगतान सीधे आपके वॉलेट में क्रेडिट हो चुका है। आप इसे तुरंत निकाल सकते हैं।' : 'Payment released to your wallet balance. Ready for instant withdrawal.')
                            : (isHi ? 'भुगतान सुरक्षित एस्क्रो में है, डिलीवर होने पर तुरंत वॉलेट में क्रेडिट होगा।' : 'Payment held in escrow, automatically credited to your wallet balance upon delivery.')}
                        </span>
                      </div>
                      <span className="font-mono font-bold uppercase text-[11px] text-emerald-900 bg-emerald-200/80 px-2.5 py-1 rounded-md border border-emerald-300">
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
