import React, { useState } from 'react';
import { 
  Database, 
  Table, 
  Key, 
  RefreshCw, 
  CheckCircle2, 
  Code, 
  Copy, 
  ExternalLink, 
  Sliders, 
  Save, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { PlatformSetting, FarmerPayout, Product, Order, SupabaseConfig, Language } from '../types';

interface SupabaseTablesViewProps {
  platformSetting: PlatformSetting;
  payouts: FarmerPayout[];
  products: Product[];
  orders: Order[];
  onUpdateFee: (newFee: number, feeType: 'percentage' | 'flat') => Promise<void>;
  supabaseConfig: SupabaseConfig;
  onSaveSupabaseConfig: (config: SupabaseConfig) => void;
  language: Language;
}

export const SupabaseTablesView: React.FC<SupabaseTablesViewProps> = ({
  platformSetting,
  payouts,
  products,
  orders,
  onUpdateFee,
  supabaseConfig,
  onSaveSupabaseConfig,
  language,
}) => {
  const isHi = language === 'hi';

  const [activeTable, setActiveTable] = useState<string>('platform_settings');
  const [feeInput, setFeeInput] = useState<number>(platformSetting.platform_fee);
  const [feeType, setFeeType] = useState<'percentage' | 'flat'>(platformSetting.platform_fee_type);
  const [isSavingFee, setIsSavingFee] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Supabase connection credentials
  const [apiUrl, setApiUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [connMsg, setConnMsg] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const tableList = [
    { id: 'platform_settings', name: 'platform_settings', count: 1, active: true, tag: '10% Fee' },
    { id: 'farmer_payouts', name: 'farmer_payouts', count: payouts.length, active: true, tag: 'Withdrawals' },
    { id: 'products', name: 'products', count: products.length, active: true },
    { id: 'orders', name: 'orders', count: orders.length, active: true },
    { id: 'payments', name: 'payments', count: orders.length, active: false },
    { id: 'farmers', name: 'farmers', count: 1, active: false },
    { id: 'farmer_documents', name: 'farmer_documents', count: 2, active: false },
    { id: 'deliveries', name: 'deliveries', count: 4, active: false },
    { id: 'subscriptions', name: 'subscriptions', count: 0, active: false },
    { id: 'support_tickets', name: 'support_tickets', count: 1, active: false },
  ];

  const handleFeeSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFee(true);
    await onUpdateFee(Number(feeInput) || 10, feeType);
    setIsSavingFee(false);
    setSaveSuccessMsg(isHi ? `प्लेटफॉर्म शुल्क ${feeInput}% पर अपडेट कर दिया गया!` : `Platform fee updated to ${feeInput}% in Supabase table!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSupabaseConfig({
      url: apiUrl.trim(),
      anonKey: anonKey.trim(),
      isConnected: Boolean(apiUrl.trim() && anonKey.trim()),
    });
    setConnMsg(isHi ? 'सुपाबेस क्रेडेंशियल सुरक्षित रूप से सहेजे गए!' : 'Supabase credentials saved successfully!');
    setTimeout(() => setConnMsg(''), 4000);
  };

  const sqlSchemaCode = `-- ==========================================
-- FASAL SETU - SUPABASE SCHEMA MIGRATION
-- 10% Platform Fee & Farmer Payouts Tables
-- ==========================================

-- 1. Table: platform_settings (Platform Fee 10%)
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id SERIAL PRIMARY KEY,
    platform_fee NUMERIC(5,2) NOT NULL DEFAULT 10.00,
    platform_fee_type TEXT NOT NULL DEFAULT 'percentage',
    min_payout_amount NUMERIC(10,2) DEFAULT 100.00,
    gst_enabled BOOLEAN DEFAULT true,
    default_gst_rate NUMERIC(5,2) DEFAULT 5.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default 10% Platform Fee Setting
INSERT INTO public.platform_settings (id, platform_fee, platform_fee_type, min_payout_amount)
VALUES (1, 10.00, 'percentage', 100.00)
ON CONFLICT (id) DO UPDATE 
SET platform_fee = EXCLUDED.platform_fee,
    platform_fee_type = EXCLUDED.platform_fee_type;

-- 2. Table: farmer_payouts (Farmer Payment & Withdrawal System)
CREATE TABLE IF NOT EXISTS public.farmer_payouts (
    id TEXT PRIMARY KEY,
    farmer_id TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    platform_charges NUMERIC(10,2) DEFAULT 0.00,
    net_amount NUMERIC(12,2) NOT NULL,
    payout_method TEXT NOT NULL, -- 'upi' | 'bank_transfer' | 'imps'
    account_details JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing', -- 'pending' | 'processing' | 'completed' | 'failed'
    reference_id TEXT NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- 3. Table: products (with auto-calculated Platform fee & GST)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    farmer_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    title TEXT NOT NULL,
    title_hi TEXT,
    description TEXT,
    category TEXT NOT NULL,
    farmer_base_price NUMERIC(12,2) NOT NULL,
    platform_fee_percentage NUMERIC(5,2) DEFAULT 10.00,
    platform_fee_amount NUMERIC(10,2) NOT NULL,
    gst_rate NUMERIC(5,2) DEFAULT 5.00,
    gst_amount NUMERIC(10,2) NOT NULL,
    final_buyer_price NUMERIC(12,2) NOT NULL,
    quantity_available NUMERIC(10,2) NOT NULL,
    unit TEXT NOT NULL,
    min_order_qty NUMERIC(10,2) DEFAULT 1,
    quality_grade TEXT DEFAULT 'A',
    images JSONB,
    is_active BOOLEAN DEFAULT true,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read platform_settings" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Allow farmers read/insert payouts" ON public.farmer_payouts FOR ALL USING (true);
CREATE POLICY "Allow public read products" ON public.products FOR ALL USING (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchemaCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header matching user's Supabase dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-black">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif tracking-tight">
                Supabase Table Editor & Live Sync
              </h1>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                schema: public
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {isHi ? 'सुपाबेस तालिकाएं: platform_settings (10% शुल्क), farmer_payouts (निकासी), products' : 'Tables: platform_settings (10% fee), farmer_payouts (withdrawals), products & orders'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 ${
            supabaseConfig.isConnected
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-stone-100 text-stone-700 border-stone-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${supabaseConfig.isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-emerald-600'}`} />
            <span>{supabaseConfig.isConnected ? 'Connected to Cloud' : 'Local State Engine'}</span>
          </span>
        </div>
      </div>

      {/* Main Supabase IDE layout: Left Table Navigator, Right Live Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Sidebar: Schema Tables */}
        <div className="lg:col-span-3 bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-2">
          <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
            <span>Public Tables</span>
            <span className="text-[10px] text-stone-500 font-bold">{tableList.length}</span>
          </div>

          <div className="space-y-1">
            {tableList.map((tbl) => (
              <button
                key={tbl.id}
                onClick={() => setActiveTable(tbl.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                  activeTable === tbl.id
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Table className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{tbl.name}</span>
                </div>
                {tbl.tag && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    activeTable === tbl.id ? 'bg-emerald-800 text-white' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {tbl.tag}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right 9 Cols: Active Table View & Controls */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Active Table: platform_settings (10% fee) */}
          {activeTable === 'platform_settings' && (
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-stone-900 font-mono">public.platform_settings</h2>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                      Row ID: 1
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    {isHi ? 'हर उत्पाद पर 10% प्लेटफॉर्म शुल्क को नियंत्रित करने वाली मुख्य तालिका' : 'Controls the 10% platform fee added to each product price'}
                  </p>
                </div>

                <div className="text-xs font-mono text-stone-500">
                  Updated: {new Date(platformSetting.updated_at || Date.now()).toLocaleTimeString()}
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Data Rows Table */}
              <div className="border border-stone-200 rounded-xl overflow-x-auto text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-stone-50 text-stone-700 border-b border-stone-200">
                    <tr>
                      <th className="p-3 text-stone-500 font-bold">id (int4)</th>
                      <th className="p-3 text-amber-800 font-bold">platform_fee (numeric)</th>
                      <th className="p-3 text-blue-800 font-bold">platform_fee_type (text)</th>
                      <th className="p-3 text-emerald-800 font-bold">min_payout_amount</th>
                      <th className="p-3 text-stone-500 font-bold">updated_at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white">
                    <tr className="hover:bg-stone-50">
                      <td className="p-3 text-stone-500">{platformSetting.id}</td>
                      <td className="p-3 text-amber-800 font-bold text-sm bg-amber-50">
                        {platformSetting.platform_fee}.00%
                      </td>
                      <td className="p-3 text-blue-800 font-bold">{platformSetting.platform_fee_type}</td>
                      <td className="p-3 text-emerald-800 font-bold">₹{platformSetting.min_payout_amount}</td>
                      <td className="p-3 text-stone-500 text-[11px]">{platformSetting.updated_at}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Edit Platform Fee Interactive Form */}
              <form onSubmit={handleFeeSave} className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span>{isHi ? 'प्लेटफॉर्म शुल्क समायोजित करें (Live Adjust Fee Rate):' : 'Adjust Live Platform Fee Rate:'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {isHi ? 'प्लेटफॉर्म शुल्क (Percentage %)' : 'Platform Fee (%)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={feeInput}
                        onChange={(e) => setFeeInput(Number(e.target.value))}
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm font-bold text-amber-800 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <span className="absolute right-3 top-2 text-stone-400 font-bold">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {isHi ? 'शुल्क का प्रकार (Fee Type)' : 'Fee Type'}
                    </label>
                    <select
                      value={feeType}
                      onChange={(e) => setFeeType(e.target.value as any)}
                      className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 font-mono"
                    >
                      <option value="percentage">percentage (%)</option>
                      <option value="flat">flat (₹)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isSavingFee}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isHi ? 'Supabase में सेव करें' : 'Update Supabase Fee'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-stone-500">
                  {isHi ? '★ जैसे ही आप शुल्क बदलते हैं, सभी उत्पाद कीमतों में प्लेटफॉर्म शुल्क अपने आप तदनुसार बदल जाएगा।' : '★ Changing this fee updates the live price engine and product calculations in real-time across the portal.'}
                </p>
              </form>
            </div>
          )}

          {/* Active Table: farmer_payouts (Withdrawals) */}
          {activeTable === 'farmer_payouts' && (
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <h2 className="text-base font-bold text-stone-900 font-mono">public.farmer_payouts</h2>
                  <p className="text-xs text-stone-500">
                    {isHi ? 'किसानों के निकासी अनुरोध और बैंक/UPI सेटलमेंट रिकॉर्ड' : 'Farmer withdrawal requests, status, UTR numbers and destination accounts'}
                  </p>
                </div>
                <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg font-mono font-bold">
                  {payouts.length} rows
                </span>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-x-auto text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-stone-50 text-stone-700 border-b border-stone-200">
                    <tr>
                      <th className="p-3 font-bold">id</th>
                      <th className="p-3 font-bold">amount</th>
                      <th className="p-3 font-bold">method</th>
                      <th className="p-3 font-bold">reference_id</th>
                      <th className="p-3 font-bold">status</th>
                      <th className="p-3 font-bold">requested_at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white">
                    {payouts.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50">
                        <td className="p-3 text-stone-500">{p.id}</td>
                        <td className="p-3 text-emerald-800 font-bold">₹{p.amount.toLocaleString('en-IN')}</td>
                        <td className="p-3 uppercase text-amber-800 font-bold">{p.payout_method}</td>
                        <td className="p-3 text-stone-700 text-[11px]">{p.reference_id}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-stone-500 text-[11px]">{new Date(p.requested_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Active Table: products */}
          {activeTable === 'products' && (
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <h2 className="text-base font-bold text-stone-900 font-mono">public.products</h2>
                  <p className="text-xs text-stone-500">
                    {isHi ? 'फसल उत्पाद तालिका (10% शुल्क + GST गणना)' : 'Products table with farmer base price, 10% fee amount and GST'}
                  </p>
                </div>
                <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg font-mono font-bold">
                  {products.length} products
                </span>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-x-auto text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-stone-50 text-stone-700 border-b border-stone-200">
                    <tr>
                      <th className="p-3 font-bold">title</th>
                      <th className="p-3 text-right font-bold">base_price</th>
                      <th className="p-3 text-right font-bold">fee_10%</th>
                      <th className="p-3 text-right font-bold">gst</th>
                      <th className="p-3 text-right font-bold">buyer_price</th>
                      <th className="p-3 text-right font-bold">stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50">
                        <td className="p-3 font-sans font-bold text-stone-900">{p.title}</td>
                        <td className="p-3 text-right text-emerald-800 font-bold">₹{p.farmer_base_price}</td>
                        <td className="p-3 text-right text-amber-800 font-bold">+₹{p.platform_fee_amount}</td>
                        <td className="p-3 text-right text-blue-800 font-bold">+₹{p.gst_amount}</td>
                        <td className="p-3 text-right text-stone-900 font-black">₹{p.final_buyer_price}</td>
                        <td className="p-3 text-right text-stone-600 font-semibold">{p.quantity_available} {p.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Active Table: orders / other */}
          {(activeTable === 'orders' || activeTable === 'payments' || activeTable === 'farmers' || activeTable === 'farmer_documents' || activeTable === 'deliveries' || activeTable === 'subscriptions' || activeTable === 'support_tickets') && (
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h2 className="text-base font-bold text-stone-900 font-mono">public.{activeTable}</h2>
                <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg font-mono font-bold">
                  Active
                </span>
              </div>
              <div className="border border-stone-200 rounded-xl overflow-x-auto text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-stone-50 text-stone-700 border-b border-stone-200">
                    <tr>
                      <th className="p-3 font-bold">order_id</th>
                      <th className="p-3 font-bold">buyer_name</th>
                      <th className="p-3 text-right font-bold">base_amt</th>
                      <th className="p-3 text-right font-bold">fee_10%</th>
                      <th className="p-3 text-right font-bold">grand_total</th>
                      <th className="p-3 font-bold">status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-stone-50">
                        <td className="p-3 text-emerald-800 font-bold">{o.order_number}</td>
                        <td className="p-3 text-stone-900 font-sans font-bold">{o.buyer_name}</td>
                        <td className="p-3 text-right text-emerald-800 font-bold">₹{o.total_base_amount}</td>
                        <td className="p-3 text-right text-amber-800 font-bold">₹{o.total_platform_fee}</td>
                        <td className="p-3 text-right text-stone-900 font-bold">₹{o.grand_total}</td>
                        <td className="p-3 uppercase text-stone-600 font-semibold">{o.order_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Connect Live Supabase Project & SQL Schema Generator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Live Connection Config */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <Key className="w-4 h-4" />
                <h3 className="font-bold text-sm text-stone-900">
                  {isHi ? 'लाइव Supabase कनेक्ट करें' : 'Connect Live Supabase Project'}
                </h3>
              </div>

              {connMsg && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{connMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveConnection} className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-stone-600 mb-1 font-bold">Project URL</label>
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-bold">Anon Public Key</label>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {isHi ? 'क्रेडेंशियल सहेजें' : 'Save & Sync Connection'}
                </button>
              </form>
            </div>

            {/* SQL Migration Script Copy Box */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Code className="w-4 h-4" />
                    <h3 className="font-bold text-sm text-stone-900">
                      {isHi ? 'Supabase SQL माइग्रेशन स्क्रिप्ट' : 'Supabase SQL Migration'}
                    </h3>
                  </div>
                  <button
                    onClick={copySql}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-xs rounded text-stone-800 flex items-center gap-1 font-mono font-bold cursor-pointer"
                  >
                    {copiedSql ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-stone-500 mb-2">
                  {isHi ? 'अपने Supabase SQL Editor में चलाएं जिससे 10% platform_settings और farmer_payouts तालिकाएं तुरंत बन जाएं।' : 'Run this in Supabase SQL editor to create all required tables.'}
                </p>
                <div className="bg-stone-900 p-2.5 rounded-lg border border-stone-800 max-h-28 overflow-y-auto font-mono text-[10px] text-emerald-300 scrollbar-thin">
                  <pre>{sqlSchemaCode}</pre>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
