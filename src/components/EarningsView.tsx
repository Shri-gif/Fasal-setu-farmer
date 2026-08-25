import React, { useState } from 'react';
import { Order, Product } from '../types';
import { Search, IndianRupee, TrendingUp, Calendar, ArrowUpRight, Download, CheckCircle2, PackageCheck, Wallet } from 'lucide-react';

interface EarningsViewProps {
  orders: Order[];
  products: Product[];
  totalEarnings: number;
  monthlyEarnings: number;
  onNavigate: (tab: string) => void;
}

export const EarningsView: React.FC<EarningsViewProps> = ({
  orders,
  products,
  totalEarnings,
  monthlyEarnings,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Completed or Delivered orders contribute directly to earnings
  const completedOrders = orders.filter((o) => {
    const s = (o.order_status || o.status || '').toLowerCase();
    return s === 'completed' || s === 'delivered' || s === 'confirmed' || s === 'dispatched';
  });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // Filtered transactions
  const filteredTransactions = completedOrders.filter((order) => {
    const orderTime = new Date(order.created_at).getTime();
    const product = order.product || productMap.get(order.product_id);
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      order.id.toLowerCase().includes(search) ||
      order.customer_name.toLowerCase().includes(search) ||
      (product?.name && product.name.toLowerCase().includes(search));

    let matchesTime = true;
    if (timeFilter === 'today') {
      matchesTime = orderTime >= todayStart;
    } else if (timeFilter === 'week') {
      matchesTime = orderTime >= weekStart;
    } else if (timeFilter === 'month') {
      matchesTime = orderTime >= monthStart;
    }

    return matchesSearch && matchesTime;
  });

  const calculatedRevenue = filteredTransactions.reduce(
    (sum, o) => sum + Number(o.total_amount || o.subtotal || 0),
    0
  );

  const avgOrderValue =
    filteredTransactions.length > 0
      ? Math.round(calculatedRevenue / filteredTransactions.length)
      : 0;

  const handleExportCSV = () => {
    const headers = ['Order ID,Customer,Product,Quantity,Unit Price,Total Amount,Status,Date\n'];
    const rows = filteredTransactions.map((o) => {
      const prod = o.product || productMap.get(o.product_id);
      return `"${o.id}","${o.customer_name}","${prod?.name || 'Produce'}","${o.quantity}","${o.price_per_unit}","${o.total_amount}","${o.order_status}","${o.created_at}"\n`;
    });

    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `khet2ghar_earnings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <span>💰</span> Financial Dashboard
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Earnings (मेरी कुल कमाई)
          </h1>
          <p className="text-xs text-slate-500">
            Real-time revenues, bank settlements, and completed sales history
          </p>
        </div>

        {filteredTransactions.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export Statement (CSV)</span>
          </button>
        )}
      </div>

      {/* Primary Financial Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-gradient-to-br from-emerald-800 to-teal-950 text-white p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-700/60 flex items-center justify-center text-base">
              💵
            </div>
          </div>
          <div className="text-3xl font-black tracking-tight">
            ₹{totalEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-200/80 mt-1.5">
            Lifetime payouts & active sales
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              This Month
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-base">
              📅
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ₹{monthlyEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Current calendar month volume
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Order Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-base">
              📊
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ₹{avgOrderValue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            From {filteredTransactions.length} processed orders
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions by buyer name or crop..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
        >
          <option value="all">All Time (शुरुआत से)</option>
          <option value="today">Today (आज)</option>
          <option value="week">This Week (इस सप्ताह)</option>
          <option value="month">This Month (इस महीने)</option>
        </select>
      </div>

      {/* Transactions Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-base text-slate-900">
              Transaction Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredTransactions.length} completed transactions (Total: ₹{calculatedRevenue.toLocaleString('en-IN')})
            </p>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <div className="text-4xl mb-2">💰</div>
            <h3 className="font-bold text-sm text-slate-800">No Earnings In Selected Filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Complete customer orders in the Orders tab to see your revenues and payout logs here.
            </p>
            <button
              onClick={() => onNavigate('orders')}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800"
            >
              Go to Orders Hub
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((order) => {
              const product = order.product || productMap.get(order.product_id);
              const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-black text-sm">
                      ₹
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {product?.name || 'Farm Produce Order'}
                      </div>
                      <p className="text-xs text-slate-500">
                        Buyer: <span className="font-medium text-slate-700">{order.customer_name}</span> • {order.quantity} {product?.unit || 'units'}
                      </p>
                      <span className="text-[11px] text-slate-400 font-mono">
                        #{order.id.slice(0, 8).toUpperCase()} • {dateStr}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-emerald-800">
                      +₹{Number(order.total_amount || order.subtotal || 0).toLocaleString('en-IN')}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Settled
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
