import React, { useState } from 'react';
import {
  X,
  Printer,
  MessageSquare,
  Phone,
  CheckCircle,
  Truck,
  Package,
  Clock,
  MapPin,
  User,
  AlertCircle,
  Share2,
  Receipt,
  Percent,
  Sparkles,
  Copy,
  Check,
  Building2,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useData } from '../context/DataContext';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, order }) => {
  const { updateOrderStatus } = useData();
  const [status, setStatus] = useState<OrderStatus>(order?.status || 'pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedSlip, setCopiedSlip] = useState(false);

  if (!isOpen || !order) return null;

  // Price calculations with 10% Platform Fee
  const quantity = Number(order.quantity) || 1;
  const unitPrice = Number(order.price_per_unit) || 0;
  
  // Calculate produce base subtotal
  const baseSubtotal = Number(order.subtotal_amount) || (quantity * unitPrice);
  
  // 10% Platform fee calculation
  const feePercent = order.platform_fee_percent || 10;
  const platformFee = Number(order.platform_fee_amount) || Math.round(baseSubtotal * (feePercent / 100));
  
  // Total payable by buyer
  const totalAmount = Number(order.total_amount) || (baseSubtotal + platformFee);
  
  // Farmer net receivable earnings
  const farmerEarnings = Number(order.farmer_net_earnings) || baseSubtotal;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setStatus(newStatus);
    setIsUpdating(true);
    await updateOrderStatus(order.id, newStatus);
    setIsUpdating(false);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const cleanPhone = (order.customer_mobile || '').replace(/[^0-9]/g, '');
  const waBillText = `*🌾 FASAL SETU - OFFICIAL ORDER SLIP & INVOICE 🌾*
----------------------------------------
*Order ID:* #${order.id}
*Date:* ${new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
*Status:* ${order.status.toUpperCase()}

*Customer:* ${order.customer_name}
*Phone:* ${order.customer_mobile}
*Delivery Address:* ${order.delivery_address}, ${order.city} - ${order.pincode}

----------------------------------------
*ITEM DETAILS:*
• Produce: ${order.product_name || 'Farm Fresh Produce'}
• Quantity: ${quantity} unit(s) @ ₹${unitPrice}/unit
• Base Produce Amount: ₹${baseSubtotal}

*FEE & CHARGES BREAKDOWN:*
• 10% Platform & Service Fee: ₹${platformFee}
• Direct Farmer Delivery: ₹0 (FREE)
----------------------------------------
*TOTAL PAYABLE AMOUNT:* ₹${totalAmount}
*FARMER NET PAYOUT:* ₹${farmerEarnings}
----------------------------------------
Thank you for empowering Indian farmers with direct mandi connectivity!`;

  const waLink = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(waBillText)}`;

  const handleCopySlip = () => {
    navigator.clipboard.writeText(waBillText);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4" id="modal-order-backdrop">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#11151c] shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[94vh] flex flex-col text-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#11151c] to-teal-950 px-6 py-4 text-white flex items-center justify-between shrink-0 border-b border-emerald-500/20">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Receipt className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Order Slip & Invoice #{order.id}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.status === 'delivered'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : order.status === 'dispatched'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : order.status === 'confirmed'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : order.status === 'cancelled'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3 w-3 text-slate-500" />
                <span>
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recent Order'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Order Bill Area */}
        <div className="p-6 overflow-y-auto space-y-5" id="printable-order-bill">
          
          {/* Fast Status Pipeline Actions (Hidden in Print) */}
          <div className="p-3.5 rounded-2xl bg-[#0c1017] border border-slate-800 print:hidden">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Fulfillment Pipeline Status
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold">
                Click any stage to update live
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {(['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'] as OrderStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  disabled={isUpdating}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold capitalize transition-all border ${
                    order.status === st
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                      : 'bg-[#11151c] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* OFFICIAL ORDER SLIP CARD */}
          <div className="rounded-3xl bg-[#0c1017] border border-slate-800 p-5 space-y-5 shadow-inner">
            
            {/* Slip Header with Stamp */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-lg shadow-sm">
                  🌾
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">FASAL SETU</h3>
                  <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
                    Official Farm-Direct Order Slip & Tax Invoice
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs font-mono font-bold text-slate-300">Invoice: FS-ORD-{order.id}</p>
                <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-semibold mt-0.5">
                  <Percent className="h-3 w-3" />
                  <span>10% Platform Fee Applied</span>
                </div>
              </div>
            </div>

            {/* Customer & Delivery Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#11151c] border border-slate-800/80">
                <div className="flex items-center space-x-1.5 text-slate-300 font-bold mb-1.5">
                  <User className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Billed To (Customer Details)</span>
                </div>
                <p className="text-sm font-bold text-white">{order.customer_name}</p>
                <p className="text-xs text-slate-300 font-mono mt-0.5 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-emerald-400" />
                  {order.customer_mobile}
                </p>

                <div className="mt-2.5 flex items-center space-x-2 print:hidden">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 text-[11px] font-semibold hover:bg-[#25D366]/30 transition-colors"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>WhatsApp Slip</span>
                  </a>
                  <a
                    href={`tel:${order.customer_mobile}`}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold hover:bg-slate-700 transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    <span>Call</span>
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#11151c] border border-slate-800/80">
                <div className="flex items-center space-x-1.5 text-slate-300 font-bold mb-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Delivery Destination</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {order.delivery_address || 'Home Delivery'}
                </p>
                <p className="text-xs font-bold text-white mt-1">
                  {order.city} - {order.pincode}
                </p>
                {order.notes && (
                  <div className="mt-2 text-[10px] p-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    <span className="font-bold">Note:</span> {order.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Produce & Detailed Fee Breakdown Table */}
            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-[#11151c]">
              <div className="bg-slate-900/90 px-4 py-2.5 text-[11px] font-bold text-slate-400 grid grid-cols-12 border-b border-slate-800">
                <span className="col-span-6">Produce Item & Description</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Unit Price</span>
                <span className="col-span-2 text-right">Base Total</span>
              </div>

              <div className="p-4 space-y-4">
                {/* Produce Row */}
                <div className="grid grid-cols-12 items-center text-xs">
                  <div className="col-span-6">
                    <h4 className="text-sm font-bold text-white">
                      {order.product_name || 'Farm Fresh Produce'}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Direct Farm Sourced • Grade A Fresh Harvest
                    </p>
                    {order.farmer_id && (
                      <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                        Farmer Partner ID: {order.farmer_id}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 text-center font-bold text-white">
                    {quantity}
                  </div>
                  <div className="col-span-2 text-right font-mono text-slate-300">
                    ₹{unitPrice}
                  </div>
                  <div className="col-span-2 text-right font-mono font-bold text-white">
                    ₹{baseSubtotal}
                  </div>
                </div>

                {/* Subtotal & Fee Line Items */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  {/* 1. Base Produce Subtotal */}
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Produce Base Subtotal (मूल फसल मूल्य)</span>
                    <span className="font-mono font-semibold text-white">₹{baseSubtotal}</span>
                  </div>

                  {/* 2. 10% Platform Fee */}
                  <div className="flex items-center justify-between text-emerald-400 bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/15">
                    <div className="flex items-center space-x-1.5">
                      <Percent className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="font-semibold">
                        Fasal Setu Platform & Mandi Service Fee ({feePercent}%)
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-300">+ ₹{platformFee}</span>
                  </div>

                  {/* 3. Delivery / Logistics Fee */}
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Direct Farm Delivery & Handling</span>
                    <span className="text-emerald-400 font-bold text-[11px]">FREE (₹0)</span>
                  </div>
                </div>

                {/* Totals & Farmer Net Settlement */}
                <div className="pt-3 border-t-2 border-slate-800 space-y-2">
                  <div className="flex items-center justify-between bg-[#0c1017] p-3 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-bold block">
                        Total Payable Amount
                      </span>
                      <span className="text-[10px] text-slate-500">
                        (Produce Value + 10% Platform Fee)
                      </span>
                    </div>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      ₹{totalAmount}
                    </span>
                  </div>

                  {/* Farmer Net Payout Box */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs">
                    <span className="text-slate-400 flex items-center gap-1 font-medium">
                      <span>🌾</span>
                      <span>Farmer Net Direct Settlement (किसान भुगतान)</span>
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      ₹{farmerEarnings}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slip Footer Notes */}
            <div className="text-[10px] text-slate-500 text-center space-y-1 pt-2 border-t border-slate-900">
              <p>🌱 Fasal Setu connects consumers and local farmers with direct transparency and fair price assurance.</p>
              <p>For support, orders, or inquiries, WhatsApp us or visit https://fasal-setu.org</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#0c1017] px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrintReceipt}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#11151c] border border-slate-800 text-slate-300 text-xs font-semibold hover:border-slate-700 transition-colors shadow-2xs"
              id="btn-print-order"
            >
              <Printer className="h-3.5 w-3.5 text-emerald-400" />
              <span>Print Order Slip</span>
            </button>

            <button
              type="button"
              onClick={handleCopySlip}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#11151c] border border-slate-800 text-slate-300 text-xs font-semibold hover:border-slate-700 transition-colors"
              id="btn-copy-slip"
            >
              {copiedSlip ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              <span>{copiedSlip ? 'Slip Copied!' : 'Copy Slip Text'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors border border-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
