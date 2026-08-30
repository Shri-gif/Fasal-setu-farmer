import React from 'react';
import { 
  Sprout, 
  Wallet, 
  ArrowDownToLine, 
  Plus, 
  ShoppingBag, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight,
  Database,
  Layers,
  IndianRupee,
  BadgePercent
} from 'lucide-react';
import { FarmerProfile, PlatformSetting, Product, Order, FarmerPayout, Language } from '../types';

interface DashboardViewProps {
  farmer: FarmerProfile;
  platformSetting: PlatformSetting;
  products: Product[];
  orders: Order[];
  payouts: FarmerPayout[];
  onOpenWithdraw: () => void;
  onAddNewProduct: () => void;
  onNavigateTab: (tab: string) => void;
  language: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  farmer,
  platformSetting,
  products,
  orders,
  payouts,
  onOpenWithdraw,
  onAddNewProduct,
  onNavigateTab,
  language,
}) => {
  const isHi = language === 'hi';

  const pendingOrders = orders.filter(o => o.order_status === 'pending' || o.order_status === 'confirmed');
  const deliveredOrders = orders.filter(o => o.order_status === 'delivered');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Kisan Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-950/60 text-emerald-200 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                {isHi ? 'प्रमाणित किसान (Aadhaar KYC Verified)' : 'Verified Kisan ID'}
              </span>
              <span className="font-mono text-xs text-emerald-100 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700/60">
                {farmer.kisan_id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white font-serif tracking-tight">
              {isHi ? 'राम राम' : 'Welcome'}, {farmer.name.split(' ')[0]} जी! 🌾
            </h1>
            
            <p className="text-sm sm:text-base text-emerald-50 max-w-xl leading-relaxed font-normal">
              {isHi
                ? `आपके गाँव ${farmer.village} (${farmer.district}) से सीधे खरीदारों को फसल बेचें। 10% सुपाबेस प्लेटफॉर्म शुल्क और GST अलग से जोड़ा गया है।`
                : `Sell direct from your ${farmer.total_land_acres}-acre farm in ${farmer.village}. 10% Supabase platform fee & GST are auto-billed to buyers.`}
            </p>
          </div>

          {/* Direct Actions in Hero */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenWithdraw}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black px-5 py-3.5 rounded-2xl text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>{isHi ? 'पैसे निकालें (₹' + farmer.wallet_balance.toLocaleString('en-IN') + ')' : 'Withdraw Cash'}</span>
            </button>

            <button
              onClick={onAddNewProduct}
              className="flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-900 font-bold px-5 py-3.5 rounded-2xl text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>{isHi ? 'नई फसल जोड़ें' : 'List New Crop'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Available Wallet Balance */}
        <div 
          onClick={() => onNavigateTab('earnings')}
          className="bg-white border border-emerald-200 hover:border-emerald-400 rounded-2xl p-5 shadow-xs hover:shadow-md cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {isHi ? 'निकासी हेतु उपलब्ध' : 'Available for Payout'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-2 font-mono">
            ₹{farmer.wallet_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 text-xs">
            <span className="text-stone-500">{isHi ? '0% निकासी शुल्क' : '0% withdrawal fee'}</span>
            <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              {isHi ? 'निकालें' : 'Withdraw'} <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Metric 2: Supabase Platform Fee (10%) & GST Status */}
        <div 
          onClick={() => onNavigateTab('supabase')}
          className="bg-white border border-amber-200 hover:border-amber-400 rounded-2xl p-5 shadow-xs hover:shadow-md cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              {isHi ? 'सुपाबेस शुल्क (Platform Fee)' : 'Platform Fee (Supabase)'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BadgePercent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-2 font-mono">
            {platformSetting.platform_fee}.00%
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 text-xs">
            <span className="text-stone-500">GST: {platformSetting.default_gst_rate}%</span>
            <span className="text-amber-800 font-bold flex items-center gap-0.5">
              {isHi ? 'तालिका देखें' : 'View Table'} <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Metric 3: Active Crop Listings */}
        <div 
          onClick={() => onNavigateTab('products')}
          className="bg-white border border-stone-200 hover:border-stone-300 rounded-2xl p-5 shadow-xs hover:shadow-md cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              {isHi ? 'सक्रिय फसल उत्पाद' : 'Active Listed Crops'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5 text-teal-700" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
            {products.length} <span className="text-sm font-normal text-stone-500">{isHi ? 'उत्पाद' : 'Items'}</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 text-xs">
            <span className="text-stone-500">{isHi ? 'मंडी में लाइव' : 'Live on Mandi'}</span>
            <span className="text-teal-700 font-bold flex items-center gap-0.5">
              {isHi ? 'सूची देखें' : 'View'} <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Metric 4: Orders in Mandi */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="bg-white border border-stone-200 hover:border-stone-300 rounded-2xl p-5 shadow-xs hover:shadow-md cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              {isHi ? 'सक्रिय मंडी ऑर्डर' : 'Mandi Orders'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5 text-blue-700" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
            {orders.length}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 text-xs">
            <span className="text-stone-500">{pendingOrders.length} {isHi ? 'लंबित' : 'Pending'}</span>
            <span className="text-blue-700 font-bold flex items-center gap-0.5">
              {isHi ? 'प्रबंधन' : 'Manage'} <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

      </div>

      {/* Pricing Flow Transparency Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-stone-900">
              {isHi ? 'फसल सेतु का 100% किसान मूल्य सुरक्षा मॉडल' : 'Fasal Setu 100% Farmer Price Protection Model'}
            </h3>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
            Zero Deduction
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs pt-1">
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5">
            <div className="font-bold text-emerald-800 text-sm">1. किसान का तय भाव</div>
            <p className="text-stone-600 text-xs mt-1">आप अपनी फसल का खुद रेट तय करते हैं (उदा. ₹2,800/क्विंटल)।</p>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5">
            <div className="font-bold text-amber-800 text-sm">2. +10% सुपाबेस शुल्क</div>
            <p className="text-stone-600 text-xs mt-1">लॉजिस्टिक्स व तकनीकी सेवाओं के लिए ग्राहक से लिया जाता है।</p>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5">
            <div className="font-bold text-blue-800 text-sm">3. + GST कर (0%/5%/12%)</div>
            <p className="text-stone-600 text-xs mt-1">सरकारी टैक्स स्लैब खरीदार बिल में पारदर्शी रूप से जुड़ता है।</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
            <div className="font-bold text-emerald-900 text-sm">4. 100% शुद्ध भुगतान</div>
            <p className="text-emerald-800 text-xs mt-1">डिलीवरी पर आपका पूरा मूल भाव (100%) आपके बैंक/UPI में आता है।</p>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Orders + Recent Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Orders Snippet */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <span>{isHi ? 'हाल के मंडी ऑर्डर' : 'Recent Mandi Orders'}</span>
            </h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-blue-700 hover:text-blue-800 font-bold"
            >
              {isHi ? 'सभी देखें →' : 'View All →'}
            </button>
          </div>

          <div className="space-y-2.5">
            {orders.slice(0, 3).map((ord) => (
              <div
                key={ord.id}
                className="bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-bold text-stone-900 text-sm">{ord.buyer_name}</div>
                  <div className="text-xs text-stone-600 mt-0.5">
                    {ord.items[0]?.product_name} ({ord.items[0]?.quantity} {ord.items[0]?.unit})
                  </div>
                  <div className="text-[11px] text-stone-400 font-mono mt-0.5">{ord.order_number}</div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-emerald-700 font-mono">
                    ₹{ord.farmer_net_earnings.toLocaleString('en-IN')}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border inline-block mt-1 ${
                    ord.order_status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {ord.order_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payouts Snippet */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5 text-amber-600" />
              <span>{isHi ? 'हाल के निकासी अनुरोध (farmer_payouts)' : 'Recent Payout Requests'}</span>
            </h3>
            <button
              onClick={() => onNavigateTab('earnings')}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold"
            >
              {isHi ? 'सभी निकासी देखें →' : 'View All →'}
            </button>
          </div>

          <div className="space-y-2.5">
            {payouts.slice(0, 3).map((pay) => (
              <div
                key={pay.id}
                className="bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <span className="uppercase text-amber-800 font-extrabold">{pay.payout_method}</span>
                    <span className="text-stone-500 font-normal">Transfer</span>
                  </div>
                  <div className="text-[11px] font-mono text-stone-500 mt-0.5">{pay.reference_id}</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    {new Date(pay.requested_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-emerald-700 font-mono">
                    +₹{pay.net_amount.toLocaleString('en-IN')}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border inline-block mt-1 ${
                    pay.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {pay.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
