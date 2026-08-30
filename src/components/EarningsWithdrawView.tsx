import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowDownToLine, 
  CheckCircle2, 
  Clock, 
  Building2, 
  QrCode, 
  TrendingUp, 
  Receipt, 
  ShieldCheck, 
  Info, 
  Download, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  IndianRupee,
  BadgePercent
} from 'lucide-react';
import { FarmerProfile, FarmerPayout, PlatformSetting, Language, Order } from '../types';
import { PayoutReceiptModal } from './PayoutReceiptModal';

interface EarningsWithdrawViewProps {
  farmer: FarmerProfile;
  payouts: FarmerPayout[];
  orders: Order[];
  platformSetting: PlatformSetting;
  onOpenWithdraw: () => void;
  onUpdateBankDetails: (details: FarmerProfile['bank_account']) => void;
  language: Language;
}

export const EarningsWithdrawView: React.FC<EarningsWithdrawViewProps> = ({
  farmer,
  payouts,
  orders,
  platformSetting,
  onOpenWithdraw,
  onUpdateBankDetails,
  language,
}) => {
  const isHi = language === 'hi';

  const [selectedPayout, setSelectedPayout] = useState<FarmerPayout | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isEditingBank, setIsEditingBank] = useState(false);

  // Form states for bank details
  const [bankForm, setBankForm] = useState(farmer.bank_account);
  const [bankSaveMsg, setBankSaveMsg] = useState('');

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBankDetails(bankForm);
    setIsEditingBank(false);
    setBankSaveMsg(isHi ? 'बैंक और UPI विवरण सफलतापूर्वक अपडेट किए गए!' : 'Bank & UPI details updated successfully!');
    setTimeout(() => setBankSaveMsg(''), 4000);
  };

  const filteredPayouts = payouts.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif tracking-tight">
                {isHi ? 'किसान भुगतान व निकासी प्रणाली' : 'Farmer Payouts & Wallet System'}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                {isHi ? 'अपनी फसल की कमाई देखें और तुरंत बैंक/UPI में पैसे ट्रांसफर करें' : 'Manage your earnings and withdraw funds directly to Bank/UPI'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenWithdraw}
          className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black px-5 py-3 rounded-xl text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <ArrowDownToLine className="w-5 h-5" />
          <span>{isHi ? 'पैसे निकालें (Withdrawal)' : 'Withdraw Cash'}</span>
        </button>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Available for Withdrawal */}
        <div className="bg-white border border-emerald-300 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {isHi ? 'निकासी हेतु उपलब्ध' : 'Available for Payout'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-2 font-mono">
            ₹{farmer.wallet_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100 text-[11px]">
            <span className="text-emerald-700 font-bold">{isHi ? 'तुरंत निकासी समर्थित' : 'Instant Withdrawal'}</span>
            <button 
              onClick={onOpenWithdraw}
              className="text-amber-800 hover:underline font-bold cursor-pointer"
            >
              {isHi ? 'ट्रांसफर करें →' : 'Transfer →'}
            </button>
          </div>
        </div>

        {/* Locked / Processing Payouts */}
        <div className="bg-white border border-amber-300 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              {isHi ? 'प्रक्रियाधीन निकासी' : 'Processing Payouts'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-2 font-mono">
            ₹{farmer.pending_payout_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>{isHi ? 'बैंक क्लीयरेंस जारी (2 घंटे में)' : 'Bank settlement in progress'}</span>
          </div>
        </div>

        {/* All-Time Settled Payouts */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              {isHi ? 'कुल प्राप्त भुगतान' : 'Total Settled Payouts'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-2 font-mono">
            ₹{farmer.total_withdrawn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
            {isHi ? 'सीधे बैंक/UPI में क्रेडिट' : 'Credited to Bank Account'}
          </div>
        </div>

        {/* Lifetime Earnings */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              {isHi ? 'जीवनकाल कुल कमाई' : 'Gross Lifetime Sales'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-2 font-mono">
            ₹{farmer.lifetime_earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
            {orders.length} {isHi ? 'मंडी ऑर्डर पूरे किए' : 'Orders completed'}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {bankSaveMsg && (
        <div className="p-3.5 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-medium">{bankSaveMsg}</span>
        </div>
      )}

      {/* Main Content Grid: Left Payouts Ledger + Right Bank Details & Pricing Math */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Payouts History (Linked to farmer_payouts table) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
            
            {/* Table Header & Status Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-100">
              <div>
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span>{isHi ? 'निकासी इतिहास (Farmer Payouts Table)' : 'Withdrawal History (farmer_payouts)'}</span>
                  <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full font-bold">
                    {payouts.length}
                  </span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isHi ? 'सुपाबेस farmer_payouts तालिका से सीधे सिंक्रोनाइज़्ड' : 'Synchronized with Supabase farmer_payouts table'}
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
                {['all', 'completed', 'processing'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                      filterStatus === st
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {st === 'all' ? (isHi ? 'सभी' : 'All') : st === 'completed' ? (isHi ? 'सफल' : 'Settled') : (isHi ? 'प्रक्रियाधीन' : 'Pending')}
                  </button>
                ))}
              </div>
            </div>

            {/* Payouts Table / List */}
            {filteredPayouts.length === 0 ? (
              <div className="py-12 text-center text-stone-500 text-xs space-y-2">
                <Receipt className="w-8 h-8 mx-auto text-stone-400" />
                <p>{isHi ? 'कोई निकासी रिकॉर्ड नहीं मिला' : 'No payout requests found'}</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 mt-2">
                {filteredPayouts.map((payout) => {
                  const isCompleted = payout.status === 'completed';
                  const isProcessing = payout.status === 'processing';

                  return (
                    <div
                      key={payout.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50 rounded-xl px-2 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isProcessing
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {payout.payout_method === 'upi' ? (
                            <QrCode className="w-5 h-5" />
                          ) : (
                            <Building2 className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-sm">
                              {payout.payout_method === 'upi' ? 'UPI Instant Payout' : `${payout.account_details.bank_name} Bank Transfer`}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : isProcessing
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}>
                              {isCompleted ? (isHi ? 'खाते में क्रेडिट' : 'Settled') : isProcessing ? (isHi ? 'प्रक्रियाधीन' : 'Processing') : 'Pending'}
                            </span>
                          </div>

                          <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>
                              {payout.payout_method === 'upi'
                                ? `UPI: ${payout.account_details.upi_id}`
                                : `A/C: ••••${payout.account_details.account_number?.slice(-4)} (${payout.account_details.ifsc_code})`}
                            </span>
                            <span className="text-stone-300">•</span>
                            <span className="font-mono text-stone-600">{payout.reference_id}</span>
                            <span className="text-stone-300">•</span>
                            <span>{new Date(payout.requested_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Amount & Receipt Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-stone-100">
                        <div className="text-left sm:text-right">
                          <div className="text-base font-black text-emerald-700 font-mono">
                            +₹{payout.net_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-stone-500 font-medium">
                            {isHi ? 'शुल्क: ₹0 (निःशुल्क)' : 'Fee: ₹0 (Free)'}
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedPayout(payout)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-xs font-bold rounded-lg text-stone-800 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-stone-600" />
                          <span>{isHi ? 'रसीद' : 'Receipt'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Transparent Settlement Logic Explanation */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 text-xs text-stone-600 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isHi ? 'फसल सेतु किसान सुरक्षा और निकासी नियम' : 'Fasal Setu Farmer Protection & Payout Guarantee'}</span>
            </div>
            <ul className="space-y-2 text-stone-600 leading-relaxed list-disc list-inside">
              <li>
                <strong>100% {isHi ? 'मूल मूल्य की गारंटी:' : 'Base Price Guarantee:'}</strong> {isHi ? 'ग्राहक से लिया जाने वाला 10% प्लेटफॉर्म शुल्क और GST अलग से जोड़ा जाता है। आपकी तय की गई पूरी कीमत आपके वॉलेट में जमा होती है।' : '10% platform fee and GST are billed additionally to the buyer. You receive 100% of your listed base price.'}
              </li>
              <li>
                <strong>{isHi ? 'शून्य निकासी शुल्क:' : 'Zero Payout Fee:'}</strong> {isHi ? 'किसान द्वारा बैंक या UPI में पैसे निकालने पर कोई कटौती (0% चार्ज) नहीं होती।' : 'Farmers enjoy ₹0 withdrawal fees for Bank and UPI transfers.'}
              </li>
              <li>
                <strong>{isHi ? 'त्वरित सेटलमेंट:' : 'Instant NPCI Settlement:'}</strong> {isHi ? 'UPI अनुरोध तुरंत और बैंक NEFT/IMPS अनुरोध 1-2 कार्य घंटों के भीतर सीधे आपके खाते में क्रेडिट होते हैं।' : 'UPI transfers are processed instantly, and IMPS/NEFT within 1-2 banking hours.'}
              </li>
            </ul>
          </div>
        </div>

        {/* Right 1 Col: Linked Bank / UPI Account & Settings */}
        <div className="space-y-4">
          
          {/* Bank & UPI Account Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-stone-900 text-sm">
                  {isHi ? 'लिंक किया गया बैंक व UPI' : 'Payout Bank & UPI Account'}
                </h3>
              </div>
              {!isEditingBank && (
                <button
                  onClick={() => setIsEditingBank(true)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                >
                  {isHi ? 'बदलें (Edit)' : 'Edit'}
                </button>
              )}
            </div>

            {!isEditingBank ? (
              <div className="space-y-3">
                {/* UPI Tile */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">
                      {isHi ? 'प्राथमिक UPI ID' : 'Primary UPI ID'}
                    </div>
                    <div className="font-mono text-xs sm:text-sm font-bold text-stone-900 mt-0.5">
                      {farmer.bank_account.upi_id || 'Not configured'}
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    {isHi ? 'सत्यापित' : 'Active'}
                  </span>
                </div>

                {/* Bank Account Tile */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">{isHi ? 'बैंक:' : 'Bank:'}</span>
                    <span className="font-bold text-stone-900">{farmer.bank_account.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">{isHi ? 'खाताधारक:' : 'Holder:'}</span>
                    <span className="font-bold text-stone-900">{farmer.bank_account.account_holder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">{isHi ? 'खाता संख्या:' : 'A/C Number:'}</span>
                    <span className="font-mono font-bold text-stone-900">•••• •••• {farmer.bank_account.account_number?.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">IFSC Code:</span>
                    <span className="font-mono font-bold text-emerald-700">{farmer.bank_account.ifsc_code}</span>
                  </div>
                </div>

                <button
                  onClick={onOpenWithdraw}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>{isHi ? 'इस खाते में पैसे निकालें' : 'Withdraw to this Account'}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleBankSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-700 mb-1 font-bold">UPI ID</label>
                  <input
                    type="text"
                    required
                    value={bankForm.upi_id || ''}
                    onChange={(e) => setBankForm({ ...bankForm, upi_id: e.target.value })}
                    placeholder="mobile@upi or name@okaxis"
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 mb-1 font-bold">{isHi ? 'खाताधारक का नाम' : 'Account Holder'}</label>
                  <input
                    type="text"
                    required
                    value={bankForm.account_holder}
                    onChange={(e) => setBankForm({ ...bankForm, account_holder: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 mb-1 font-bold">{isHi ? 'बैंक का नाम' : 'Bank Name'}</label>
                  <input
                    type="text"
                    required
                    value={bankForm.bank_name}
                    onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-700 mb-1 font-bold">{isHi ? 'खाता संख्या' : 'A/C Number'}</label>
                    <input
                      type="text"
                      required
                      value={bankForm.account_number}
                      onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 mb-1 font-bold">IFSC Code</label>
                    <input
                      type="text"
                      required
                      value={bankForm.ifsc_code}
                      onChange={(e) => setBankForm({ ...bankForm, ifsc_code: e.target.value.toUpperCase() })}
                      className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 font-mono uppercase focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingBank(false)}
                    className="flex-1 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 cursor-pointer"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                  >
                    {isHi ? 'सेव करें' : 'Save Details'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Live Supabase Platform Fee Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <BadgePercent className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-stone-900">
                {isHi ? 'सुपाबेस प्लेटफॉर्म शुल्क सेटिंग' : 'Supabase Fee Setting'}
              </h3>
            </div>
            
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-600">{isHi ? 'लागू शुल्क (Platform Fee):' : 'Active Rate:'}</span>
                <span className="font-bold text-amber-800">{platformSetting.platform_fee}% ({platformSetting.platform_fee_type})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">{isHi ? 'न्यूनतम निकासी सीमा:' : 'Min Payout Threshold:'}</span>
                <span className="font-bold text-stone-900">₹{platformSetting.min_payout_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">{isHi ? 'GST कर सक्षम:' : 'GST Tax Integration:'}</span>
                <span className="text-emerald-800 font-bold">{platformSetting.gst_enabled ? 'सक्रिय (Active)' : 'Disabled'}</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500">
              {isHi ? 'सुपाबेस तालिका platform_settings से स्वचालित डेटा।' : 'Synchronized with Supabase platform_settings table.'}
            </p>
          </div>

        </div>
      </div>

      {/* Receipt Modal */}
      {selectedPayout && (
        <PayoutReceiptModal
          payout={selectedPayout}
          farmer={farmer}
          onClose={() => setSelectedPayout(null)}
          language={language}
        />
      )}
    </div>
  );
};
