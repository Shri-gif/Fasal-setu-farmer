import React from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Tractor,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Layers,
  Sparkles,
  ExternalLink,
  DollarSign,
  Users,
  Activity,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { FARMER_PORTAL_URL, CUSTOMER_PORTAL_URL } from '../lib/supabase';
import { Order, Product } from '../types';

interface DashboardViewProps {
  onOpenAddProduct: () => void;
  onOpenOrder: (order: Order) => void;
  onOpenProduct: (product: Product) => void;
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddProduct,
  onOpenOrder,
  onOpenProduct,
  setActiveTab,
}) => {
  const { stats, orders, products, farmers, updateOrderStatus, realtimeLogs } = useData();

  const recentOrders = orders.slice(0, 5);
  const lowStockItems = products.filter((p) => p.stock <= 15).slice(0, 4);

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* Top Banner with Portal Quick Switch & Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-[#11151c] to-teal-950/80 p-6 text-white border border-emerald-500/30 shadow-xl shadow-black/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="h-3 w-3" />
                Live Control Center
              </span>
              <span className="text-xs text-slate-400">Supabase Realtime Synced</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1 text-white">
              Fasal Setu Operations Console
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Centralized administration managing farm-direct product listings, customer fulfillment pipelines, and real-time farmer data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenAddProduct}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/60 transition-all"
              id="btn-dash-add-product"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Add Farm Produce</span>
            </button>

            <button
              onClick={() => setActiveTab('site-previews')}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/80 transition-all"
              id="btn-dash-site-previews"
            >
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>View Both Live Portals</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-[#11151c] border border-slate-800 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Merchandise Value</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white">
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              {stats.totalOrders} total orders processed
            </p>
          </div>
        </div>

        {/* 10% Platform Revenue */}
        <div className="p-5 rounded-2xl bg-[#11151c] border border-emerald-500/30 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">10% Platform Commission</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 border border-emerald-500/30">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-emerald-400">
              ₹{stats.totalPlatformRevenue.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Net Farmer: ₹{stats.totalFarmerPayouts.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="p-5 rounded-2xl bg-[#11151c] border border-slate-800 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white">{stats.pendingOrders}</h3>
            <p className="text-[11px] text-amber-400 font-medium mt-0.5">
              {stats.pendingOrders > 0 ? 'Requires immediate dispatch' : 'All orders fulfilled'}
            </p>
          </div>
        </div>

        {/* Farmer Network */}
        <div className="p-5 rounded-2xl bg-[#11151c] border border-slate-800 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Farmers</span>
            <div className="h-9 w-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
              <Tractor className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white">{stats.totalFarmers}</h3>
            <p className="text-[11px] text-teal-400 font-medium mt-0.5">
              {stats.activeFarmers} verified producers ({stats.activeProducts} active items)
            </p>
          </div>
        </div>
      </div>

      {/* Dual Portal Quick Control Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Farmer Portal Card */}
        <div className="p-5 rounded-3xl bg-[#11151c] border border-amber-500/30 relative overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                Farmer Side
              </span>
              <h3 className="text-base font-bold text-white mt-2">Farmer Portal Controller</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Control farmer stock levels, direct farm pricing, harvest dates, and active listings displayed to customers.
              </p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-xs shrink-0">
              <Tractor className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('farmers')}
              className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1"
            >
              <span>Manage Produce Listings ({products.length})</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <a
              href={FARMER_PORTAL_URL}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Launch Site</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Customer Portal Card */}
        <div className="p-5 rounded-3xl bg-[#11151c] border border-emerald-500/30 relative overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                Customer Side
              </span>
              <h3 className="text-base font-bold text-white mt-2">Customer Orders & Logistics</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Track incoming customer grocery orders, mark dispatch status, print GST invoices, and notify customers on WhatsApp.
              </p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-xs shrink-0">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('customers')}
              className="text-xs font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1"
            >
              <span>Manage Orders Pipeline ({orders.length})</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <a
              href={CUSTOMER_PORTAL_URL}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Launch Site</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Pipeline (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-[#11151c] border border-slate-800 p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Customer Orders</h3>
              <p className="text-xs text-slate-400">Live order intake from Fasal Setu Customer portal</p>
            </div>
            <button
              onClick={() => setActiveTab('customers')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All ({orders.length})</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Produce Item</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No customer orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#161c28]/60 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-200">#{order.id}</td>
                      <td className="py-3">
                        <p className="font-semibold text-white">{order.customer_name}</p>
                        <p className="text-[10px] text-slate-500">{order.city}</p>
                      </td>
                      <td className="py-3 font-medium text-slate-300 max-w-[150px] truncate">
                        {order.product_name || 'Farm Produce'} ({order.quantity}x)
                      </td>
                      <td className="py-3 font-bold text-white">₹{order.total_amount}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            order.status === 'delivered'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : order.status === 'dispatched'
                              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                              : order.status === 'confirmed'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : order.status === 'cancelled'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onOpenOrder(order)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 hover:text-emerald-300 text-slate-300 border border-slate-700 font-semibold text-[11px] transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Activity Ticker & Stock Alerts (1 col) */}
        <div className="space-y-4">
          {/* Stock Alerts */}
          <div className="rounded-3xl bg-[#11151c] border border-slate-800 p-5 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Produce Stock Alerts
              </h3>
              <button
                onClick={() => setActiveTab('farmers')}
                className="text-[11px] font-semibold text-emerald-400 hover:underline"
              >
                Catalog
              </button>
            </div>

            <div className="space-y-2">
              {lowStockItems.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">All inventory levels healthy.</p>
              ) : (
                lowStockItems.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => onOpenProduct(prod)}
                    className="p-2.5 rounded-2xl bg-[#0c1017] hover:bg-[#161c28] border border-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {prod.image_url ? (
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="h-8 w-8 rounded-lg object-cover border border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                          🌱
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{prod.name}</p>
                        <p className="text-[10px] text-slate-500">₹{prod.price_per_unit}/{prod.unit}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 shrink-0">
                      {prod.stock} {prod.unit} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Real-time Event Feed */}
          <div className="rounded-3xl bg-[#11151c] border border-slate-800 p-5 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-emerald-400" />
                Live Database Stream
              </h3>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Supabase
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {realtimeLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="p-2 rounded-xl bg-[#0c1017] border border-slate-800 text-left text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                    <span className="font-mono font-semibold uppercase text-emerald-400">{log.table}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-300 leading-tight">{log.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
