import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Search,
  ExternalLink,
  Plus,
  MessageSquare,
  Phone,
  Download,
  Eye,
  Users,
} from 'lucide-react';

import { useData } from '../context/DataContext';
import { CUSTOMER_PORTAL_URL, supabase } from '../lib/supabase';
import { Order, OrderStatus } from '../types';

interface CustomerControlViewProps {
  onOpenOrder: (order: Order) => void;
  onOpenCreateOrder: () => void;
}

export const CustomerControlView: React.FC<CustomerControlViewProps> = ({
  onOpenOrder,
  onOpenCreateOrder,
}) => {
  const {
    orders,
    customers,
    updateOrderStatus,
    exportData,
  } = useData();

  const [activeMainTab, setActiveMainTab] = useState<'orders' | 'customers'>('orders');
  const [statusTab, setStatusTab] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Platform fee fetched from Supabase platform_settings table
  const [platformFee, setPlatformFee] = useState(0);

  useEffect(() => {
    const loadPlatformFee = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('platform_fee_amount')
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Failed to load platform fee:', error);
          return;
        }

        if (data) {
          setPlatformFee(Number(data.platform_fee_amount) || 0);
        }
      } catch (error) {
        console.error('Platform fee loading error:', error);
      }
    };

    loadPlatformFee();
  }, []);

  // Calculate pricing for display
  const getOrderPricing = (order: Order) => {
    const quantity = Number(order.quantity) || 0;
    const pricePerUnit = Number(order.price_per_unit) || 0;

    const produceAmount =
      Number(order.subtotal_amount) || quantity * pricePerUnit;

    const fee = platformFee;

    const total = produceAmount + fee;

    return {
      produceAmount,
      fee,
      total,
    };
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      statusTab === 'all' || o.status === statusTab;

    const search = searchQuery.toLowerCase();

    const matchesSearch =
      String(o.id).includes(searchQuery) ||
      (o.customer_name || '').toLowerCase().includes(search) ||
      (o.customer_mobile || '').includes(searchQuery) ||
      (o.product_name || '').toLowerCase().includes(search) ||
      (o.city || '').toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  });

  // Filtered customers
  const filteredCustomers = customers.filter((c) => {
    const search = searchQuery.toLowerCase();

    return (
      (c.full_name || '').toLowerCase().includes(search) ||
      (c.phone || '').includes(searchQuery) ||
      (c.city || '').toLowerCase().includes(search) ||
      (c.state || '').toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

      case 'dispatched':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';

      case 'confirmed':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';

      case 'cancelled':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';

      default:
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
    }
  };

  const getNextStatus = (
    current: OrderStatus
  ): OrderStatus | null => {
    if (current === 'pending') return 'confirmed';
    if (current === 'confirmed') return 'dispatched';
    if (current === 'dispatched') return 'delivered';

    return null;
  };

  const getNextStatusLabel = (
    current: OrderStatus
  ): string => {
    if (current === 'pending') return 'Confirm Order';
    if (current === 'confirmed') return 'Dispatch Item';
    if (current === 'dispatched') return 'Mark Delivered';

    return '';
  };

  return (
    <div
      className="space-y-6"
      id="customer-control-view"
    >
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/80 via-[#11151c] to-teal-950/80 p-6 text-white border border-emerald-500/30 shadow-xl shadow-black/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <ShoppingBag className="h-6 w-6 text-emerald-400" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  Customer Site Control
                </span>

                <span className="text-xs text-slate-400 font-mono">
                  https://shri-gif.github.io/Fasal-setu-customer-/
                </span>
              </div>

              <h1 className="text-xl font-bold tracking-tight mt-1 text-white">
                Customer Orders & Direct Fulfillment Pipeline
              </h1>

              <p className="text-xs text-slate-300 mt-0.5">
                Real-time Supabase sync for buyer orders, delivery fulfillment statuses, customer accounts, and WhatsApp notifications.
              </p>

              <p className="text-[11px] text-emerald-400 mt-2 font-semibold">
                Platform Fee: ₹{platformFee.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <a
              href={CUSTOMER_PORTAL_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs shadow-xs hover:bg-slate-700 transition-colors"
              id="btn-customer-live-link"
            >
              <span>Open Customer Portal</span>
              <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
            </a>

            <button
              onClick={onOpenCreateOrder}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs shadow-emerald-950 transition-colors"
              id="btn-create-manual-order"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Create Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveMainTab('orders')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMainTab === 'orders'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 bg-[#11151c] border border-slate-800'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>
            Customer Orders ({orders.length})
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('customers')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMainTab === 'customers'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 bg-[#11151c] border border-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>
            Registered Buyers ({customers.length})
          </span>
        </button>
      </div>

      {activeMainTab === 'orders' ? (
        <>
          {/* Toolbar */}
          <div className="bg-[#11151c] rounded-3xl p-4 border border-slate-800 shadow-lg shadow-black/20 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">

              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0c1017] rounded-2xl border border-slate-800">
                {(
                  [
                    {
                      id: 'all',
                      label: 'All Orders',
                      count: orders.length,
                    },
                    {
                      id: 'pending',
                      label: 'Pending',
                      count: orders.filter(
                        (o) => o.status === 'pending'
                      ).length,
                    },
                    {
                      id: 'confirmed',
                      label: 'Confirmed',
                      count: orders.filter(
                        (o) => o.status === 'confirmed'
                      ).length,
                    },
                    {
                      id: 'dispatched',
                      label: 'Dispatched',
                      count: orders.filter(
                        (o) => o.status === 'dispatched'
                      ).length,
                    },
                    {
                      id: 'delivered',
                      label: 'Delivered',
                      count: orders.filter(
                        (o) => o.status === 'delivered'
                      ).length,
                    },
                    {
                      id: 'cancelled',
                      label: 'Cancelled',
                      count: orders.filter(
                        (o) => o.status === 'cancelled'
                      ).length,
                    },
                  ] as {
                    id: 'all' | OrderStatus;
                    label: string;
                    count: number;
                  }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusTab(tab.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      statusTab === tab.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>

                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        statusTab === tab.id
                          ? 'bg-slate-950 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Export / View */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    exportData('orders', 'csv')
                  }
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-slate-400" />
                  <span>Export CSV</span>
                </button>

                <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                      viewMode === 'table'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Table
                  </button>

                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                      viewMode === 'kanban'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Kanban
                  </button>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search by order ID, customer name, mobile number, produce item, city..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0c1017] border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* TABLE VIEW */}
          {viewMode === 'table' ? (
            <div className="bg-[#11151c] rounded-3xl border border-slate-800 shadow-lg shadow-black/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0c1017] border-b border-slate-800 text-slate-400 font-bold">
                    <tr>
                      <th className="py-3.5 px-4">
                        Order ID & Date
                      </th>

                      <th className="py-3.5 px-4">
                        Customer
                      </th>

                      <th className="py-3.5 px-4">
                        Produce Details
                      </th>

                      <th className="py-3.5 px-4">
                        Delivery Location
                      </th>

                      <th className="py-3.5 px-4">
                        Amount
                      </th>

                      <th className="py-3.5 px-4">
                        Status
                      </th>

                      <th className="py-3.5 px-4 text-right">
                        Fulfillment Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-16 text-center text-slate-500"
                        >
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <ShoppingBag className="h-8 w-8 text-slate-600" />

                            <p className="text-sm font-semibold text-slate-400">
                              No real customer orders recorded in Supabase yet.
                            </p>

                            <p className="text-xs text-slate-500 max-w-md">
                              When customers place orders via the Customer Portal, they will instantly appear here over live WebSocket subscriptions.
                            </p>

                            <button
                              onClick={onOpenCreateOrder}
                              className="mt-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-bold transition-colors flex items-center space-x-1.5"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>
                                Create First Supabase Order
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const nextStatus =
                          getNextStatus(order.status);

                        const pricing =
                          getOrderPricing(order);

                        const cleanPhone = (
                          order.customer_mobile || ''
                        ).replace(/[^0-9]/g, '');

                        const waLink =
                          `https://wa.me/${
                            cleanPhone.startsWith('91')
                              ? cleanPhone
                              : '91' + cleanPhone
                          }?text=${encodeURIComponent(
                            `Namaste ${order.customer_name}, Greetings from Fasal Setu! Your order #${order.id} for "${order.product_name}" is currently ${order.status.toUpperCase()}. 🌾`
                          )}`;

                        return (
                          <tr
                            key={order.id}
                            className="hover:bg-[#161c28]/60 transition-colors"
                          >
                            {/* Order */}
                            <td className="py-3.5 px-4">
                              <p className="font-mono font-bold text-slate-200">
                                #{order.id}
                              </p>

                              <p className="text-[10px] text-slate-500">
                                {order.created_at
                                  ? new Date(
                                      order.created_at
                                    ).toLocaleDateString(
                                      'en-IN',
                                      {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      }
                                    )
                                  : 'Recent'}
                              </p>
                            </td>

                            {/* Customer */}
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-white">
                                {order.customer_name}
                              </p>

                              <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <Phone className="h-2.5 w-2.5 text-emerald-400" />
                                {order.customer_mobile}
                              </p>
                            </td>

                            {/* Produce */}
                            <td className="py-3.5 px-4">
                              <p className="font-medium text-slate-200">
                                {order.product_name ||
                                  'Farm Produce'}
                              </p>

                              <p className="text-[10px] text-slate-500">
                                {order.quantity} units @ ₹
                                {order.price_per_unit}
                                /unit
                              </p>
                            </td>

                            {/* Location */}
                            <td className="py-3.5 px-4">
                              <p className="text-slate-300">
                                {order.city || 'Lucknow'}
                              </p>

                              <p className="text-[10px] text-slate-500 truncate max-w-[150px]">
                                {order.delivery_address ||
                                  'Home Delivery'}
                              </p>
                            </td>

                            {/* Amount */}
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-emerald-400 text-sm">
                                ₹
                                {pricing.total.toLocaleString(
                                  'en-IN'
                                )}
                              </p>

                              <p className="text-[10px] text-slate-400">
                                Produce: ₹
                                {pricing.produceAmount.toLocaleString(
                                  'en-IN'
                                )}
                                {' + '}
                                Fee: ₹
                                {pricing.fee.toLocaleString(
                                  'en-IN'
                                )}
                              </p>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                {nextStatus && (
                                  <button
                                    onClick={() =>
                                      updateOrderStatus(
                                        order.id,
                                        nextStatus
                                      )
                                    }
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shadow-xs"
                                  >
                                    {getNextStatusLabel(
                                      order.status
                                    )}
                                  </button>
                                )}

                                {cleanPhone && (
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 border border-[#25D366]/40 transition-colors"
                                    title="WhatsApp Notify"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                  </a>
                                )}

                                <button
                                  onClick={() =>
                                    onOpenOrder(order)
                                  }
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                                  title="View Invoice & Details"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* KANBAN */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(
                [
                  'pending',
                  'confirmed',
                  'dispatched',
                  'delivered',
                ] as OrderStatus[]
              ).map((stage) => {
                const stageOrders = orders.filter(
                  (o) => o.status === stage
                );

                return (
                  <div
                    key={stage}
                    className="bg-[#11151c] rounded-3xl p-4 border border-slate-800 shadow-lg shadow-black/20 flex flex-col"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            stage === 'pending'
                              ? 'bg-yellow-400'
                              : stage === 'confirmed'
                              ? 'bg-amber-400'
                              : stage === 'dispatched'
                              ? 'bg-blue-400'
                              : 'bg-emerald-400'
                          }`}
                        />

                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          {stage}
                        </h4>
                      </div>

                      <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                        {stageOrders.length}
                      </span>
                    </div>

                    <div className="space-y-2.5 overflow-y-auto max-h-[500px] flex-1">
                      {stageOrders.length === 0 ? (
                        <p className="text-[11px] text-slate-600 text-center py-6">
                          No orders in {stage}
                        </p>
                      ) : (
                        stageOrders.map((ord) => {
                          const pricing =
                            getOrderPricing(ord);

                          return (
                            <div
                              key={ord.id}
                              onClick={() =>
                                onOpenOrder(ord)
                              }
                              className="p-3 rounded-2xl bg-[#0c1017] hover:bg-[#161c28] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-xs text-slate-200">
                                  #{ord.id}
                                </span>

                                <span className="font-bold text-xs text-emerald-400">
                                  ₹
                                  {pricing.total.toLocaleString(
                                    'en-IN'
                                  )}
                                </span>
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-white">
                                  {ord.customer_name}
                                </p>

                                <p className="text-[10px] text-slate-400">
                                  {ord.product_name ||
                                    'Farm Produce'}
                                </p>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                                <span>
                                  {ord.city}
                                </span>

                                <span>
                                  {ord.quantity} units
                                </span>
                              </div>

                              <div className="text-[10px] text-slate-500">
                                Produce ₹
                                {pricing.produceAmount.toLocaleString(
                                  'en-IN'
                                )}
                                {' + Fee ₹'}
                                {pricing.fee.toLocaleString(
                                  'en-IN'
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* CUSTOMERS */
        <div className="space-y-4">
          <div className="bg-[#11151c] rounded-3xl p-4 border border-slate-800 shadow-lg shadow-black/20 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search registered buyers by name, phone number, city, or state..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0c1017] border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 font-medium"
              />
            </div>

            <button
              onClick={() =>
                exportData('customers', 'csv')
              }
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span>Export Buyers CSV</span>
            </button>
          </div>

          <div className="bg-[#11151c] rounded-3xl border border-slate-800 shadow-lg shadow-black/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0c1017] border-b border-slate-800 text-slate-400 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">
                      Customer Name
                    </th>

                    <th className="py-3.5 px-4">
                      Contact Phone
                    </th>

                    <th className="py-3.5 px-4">
                      Location / State
                    </th>

                    <th className="py-3.5 px-4">
                      Total Orders
                    </th>

                    <th className="py-3.5 px-4">
                      Gross Purchases
                    </th>

                    <th className="py-3.5 px-4">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center text-slate-500"
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Users className="h-8 w-8 text-slate-600" />

                          <p className="text-sm font-semibold text-slate-400">
                            No registered buyers in Supabase yet.
                          </p>

                          <p className="text-xs text-slate-500 max-w-md">
                            When users sign up or place orders on the Fasal Setu Customer Portal, their buyer profiles will automatically sync here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => {
                      const cleanPhone = (
                        cust.phone || ''
                      ).replace(/[^0-9]/g, '');

                      const waLink = cleanPhone
                        ? `https://wa.me/${
                            cleanPhone.startsWith('91')
                              ? cleanPhone
                              : '91' + cleanPhone
                          }`
                        : '#';

                      return (
                        <tr
                          key={cust.id}
                          className="hover:bg-[#161c28]/60 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2.5">
                              <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                                {cust.full_name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  'C'}
                              </div>

                              <div>
                                <p className="font-semibold text-white">
                                  {cust.full_name}
                                </p>

                                <p className="text-[10px] text-slate-500">
                                  ID:{' '}
                                  {cust.id.slice(0, 8)}
                                  ...
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {cust.phone ? (
                              <div className="flex items-center space-x-1.5">
                                <span>
                                  {cust.phone}
                                </span>

                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#25D366] hover:underline text-[10px]"
                                >
                                  WhatsApp
                                </a>
                              </div>
                            ) : (
                              <span className="text-slate-600">
                                N/A
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-slate-300">
                            <p>
                              {cust.city ||
                                cust.state ||
                                'India'}
                            </p>

                            {cust.delivery_address && (
                              <p className="text-[10px] text-slate-500 truncate max-w-[150px]">
                                {cust.delivery_address}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-bold text-white">
                            {cust.total_orders_count ||
                              0}{' '}
                            orders
                          </td>

                          <td className="py-3.5 px-4 font-bold text-emerald-400">
                            ₹
                            {(
                              cust.total_spent || 0
                            ).toLocaleString('en-IN')}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              Active Buyer
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
