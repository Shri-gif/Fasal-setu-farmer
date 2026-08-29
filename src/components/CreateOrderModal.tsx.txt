import React, { useState } from 'react';
import { X, ShoppingBag, Plus, User, MapPin, Phone, Package, CheckCircle2, Percent, Receipt } from 'lucide-react';
import { useData } from '../context/DataContext';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose }) => {
  const { products, createOrder } = useData();

  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('+91 ');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('Lucknow');
  const [pincode, setPincode] = useState('226001');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 1);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => String(p.id) === String(selectedProductId)) || products[0];
  const unitPrice = selectedProduct?.price_per_unit || 100;
  
  // 10% Platform Fee calculations
  const subtotal = unitPrice * quantity;
  const platformFee = Math.round(subtotal * 0.10);
  const totalAmount = subtotal + platformFee;
  const farmerNetPayout = subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedProduct) return;

    await createOrder({
      customer_name: customerName,
      customer_mobile: customerMobile,
      delivery_address: deliveryAddress,
      city,
      pincode,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      farmer_id: selectedProduct.farmer_id || null,
      quantity,
      price_per_unit: unitPrice,
      subtotal_amount: subtotal,
      platform_fee_percent: 10,
      platform_fee_amount: platformFee,
      farmer_net_earnings: farmerNetPayout,
      total_amount: totalAmount,
      status: 'confirmed',
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#11151c] shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#11151c] to-teal-950 px-6 py-4 text-white flex items-center justify-between border-b border-emerald-500/20">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Receipt className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create Order with 10% Fee</h2>
              <p className="text-xs text-slate-400">Generates instant platform invoice & slip</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-3">
            
            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Shalini Agarwal"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#0c1017] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile (WhatsApp) *</label>
                <input
                  type="text"
                  required
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#0c1017] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery Address *</label>
              <textarea
                rows={2}
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="House No, Apartment, Street name, Landmark..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#0c1017] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#0c1017] border border-slate-800 text-slate-100 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#0c1017] border border-slate-800 text-slate-100 focus:outline-hidden focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Produce Selection */}
            <div className="p-3.5 rounded-2xl bg-[#0c1017] border border-slate-800 space-y-3">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Produce Selection & Rate Breakdown
              </label>

              <div>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#11151c] border border-slate-800 text-slate-200 focus:outline-hidden focus:border-emerald-500 font-semibold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price_per_unit}/{p.unit} ({p.stock} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-xs font-semibold text-slate-300">Quantity:</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-20 px-3 py-1.5 text-xs rounded-xl bg-[#11151c] border border-slate-800 text-slate-100 font-bold"
                />
                <span className="text-xs text-slate-400">{selectedProduct?.unit || 'kg'}</span>
              </div>

              {/* Realtime 10% Fee Breakdown Preview */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs bg-[#11151c] p-2.5 rounded-xl">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Produce Base (मूल फसल राशि):</span>
                  <span className="font-mono font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    <span>10% Fasal Setu Platform Fee:</span>
                  </span>
                  <span className="font-mono font-bold">+ ₹{platformFee}</span>
                </div>
                <div className="flex items-center justify-between text-white pt-1.5 border-t border-slate-800 font-bold">
                  <span>Total Order Payable (कुल राशि):</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">₹{totalAmount}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Special Order Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Call before delivery, urgent morning slot"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#0c1017] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs shadow-emerald-950 flex items-center space-x-1"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Book Order & Generate Slip</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
