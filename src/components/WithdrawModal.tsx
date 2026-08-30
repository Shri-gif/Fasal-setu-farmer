import React, { useState } from 'react';
import { X, ArrowDownToLine, CheckCircle2, AlertCircle, Building2, QrCode, ShieldCheck, Loader2, IndianRupee } from 'lucide-react';
import { FarmerProfile, PayoutMethod, FarmerPayout, PlatformSetting, Language } from '../types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: FarmerProfile;
  platformSetting: PlatformSetting;
  onRequestPayout: (payoutData: Omit<FarmerPayout, 'id' | 'requested_at' | 'status' | 'reference_id'>) => Promise<void>;
  language: Language;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  farmer,
  platformSetting,
  onRequestPayout,
  language,
}) => {
  const isHi = language === 'hi';

  const [amount, setAmount] = useState<number | ''>('');
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successPayout, setSuccessPayout] = useState<FarmerPayout | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Editable Bank/UPI details in withdrawal modal
  const [upiId, setUpiId] = useState(farmer.bank_account.upi_id || '');
  const [accountNumber, setAccountNumber] = useState(farmer.bank_account.account_number || '');
  const [ifscCode, setIfscCode] = useState(farmer.bank_account.ifsc_code || '');
  const [bankName, setBankName] = useState(farmer.bank_account.bank_name || 'HDFC Bank');
  const [accountHolder, setAccountHolder] = useState(farmer.bank_account.account_holder || farmer.name);

  if (!isOpen) return null;

  const minPayout = platformSetting.min_payout_amount || 100;
  const numAmount = Number(amount) || 0;

  const handleQuickAmount = (val: number) => {
    setAmount(Math.min(val, farmer.wallet_balance));
    setErrorMsg('');
  };

  const handleWithdrawAll = () => {
    setAmount(farmer.wallet_balance);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (numAmount < minPayout) {
      setErrorMsg(isHi ? `न्यूनतम निकासी राशि ₹${minPayout} होनी चाहिए।` : `Minimum withdrawal amount is ₹${minPayout}.`);
      return;
    }

    if (numAmount > farmer.wallet_balance) {
      setErrorMsg(isHi ? 'आपके वॉलेट में पर्याप्त शेष राशि नहीं है।' : 'Insufficient balance in your wallet.');
      return;
    }

    if (payoutMethod === 'upi' && !upiId.includes('@')) {
      setErrorMsg(isHi ? 'कृपया मान्य UPI ID दर्ज करें (उदा. username@okaxis / phone@paytm)' : 'Please enter a valid UPI ID.');
      return;
    }

    if (payoutMethod === 'bank_transfer' && (!accountNumber || !ifscCode)) {
      setErrorMsg(isHi ? 'कृपया बैंक खाता संख्या और मान्य IFSC कोड भरें।' : 'Please provide account number and IFSC code.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onRequestPayout({
        farmer_id: farmer.id,
        amount: numAmount,
        platform_charges: 0, // ₹0 charges for farmers on Fasal Setu
        net_amount: numAmount,
        payout_method: payoutMethod,
        account_details: {
          account_holder: accountHolder,
          account_number: accountNumber,
          ifsc_code: ifscCode.toUpperCase(),
          bank_name: bankName,
          upi_id: upiId,
          account_type: 'savings',
        },
        notes: payoutMethod === 'upi' ? `Instant UPI withdrawal to ${upiId}` : `IMPS/NEFT bank transfer to ${bankName} (${accountNumber.slice(-4)})`,
      });

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Error processing payout request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white border border-stone-200 text-stone-900 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center font-bold">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif">
                {isHi ? 'पैसे निकालें (किसान भुगतान)' : 'Withdraw Farmer Payout'}
              </h2>
              <p className="text-xs text-stone-500">
                {isHi ? 'सीधे आपके बैंक खाते या UPI में त्वरित ट्रांसफर' : 'Direct transfer to your Bank or UPI account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Balance Card */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-600 font-medium">
                {isHi ? 'निकासी हेतु उपलब्ध शेष राशि' : 'Available Balance for Withdrawal'}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-mono">
                ₹{farmer.wallet_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <button
              type="button"
              onClick={handleWithdrawAll}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
            >
              {isHi ? 'पूरा निकालें' : 'Withdraw All'}
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              {isHi ? 'निकासी राशि (Amount to Withdraw in ₹)' : 'Withdrawal Amount (₹)'} *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-stone-500 font-bold text-lg">₹</span>
              <input
                type="number"
                min={minPayout}
                max={farmer.wallet_balance}
                step="any"
                required
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value === '' ? '' : Number(e.target.value));
                  setErrorMsg('');
                }}
                placeholder="उदा. 5000"
                className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-4 py-2.5 text-lg font-bold text-stone-900 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-2 mt-2">
              {[500, 1000, 2500, 5000, 10000].map((val) => (
                <button
                  type="button"
                  key={val}
                  disabled={val > farmer.wallet_balance}
                  onClick={() => handleQuickAmount(val)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    amount === val
                      ? 'bg-amber-400 text-stone-950 font-bold border-amber-500 shadow-xs'
                      : val > farmer.wallet_balance
                      ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                      : 'bg-stone-50 text-stone-700 border-stone-300 hover:border-stone-400'
                  }`}
                >
                  +₹{val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              {isHi ? `* न्यूनतम निकासी सीमा: ₹${minPayout} | कोई निकासी शुल्क नहीं (0%)` : `* Min payout: ₹${minPayout} | Zero withdrawal fee (0%)`}
            </p>
          </div>

          {/* Payout Method Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              {isHi ? 'भुगतान का तरीका (Payment Method)' : 'Select Payout Mode'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayoutMethod('upi')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  payoutMethod === 'upi'
                    ? 'bg-amber-50 border-amber-400 text-stone-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${payoutMethod === 'upi' ? 'bg-amber-200 text-amber-900' : 'bg-stone-200 text-stone-600'}`}>
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm block">UPI (त्वरित)</span>
                  <span className="text-[10px] text-stone-500">GPay, PhonePe, Paytm</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPayoutMethod('bank_transfer')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  payoutMethod === 'bank_transfer'
                    ? 'bg-amber-50 border-amber-400 text-stone-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${payoutMethod === 'bank_transfer' ? 'bg-amber-200 text-amber-900' : 'bg-stone-200 text-stone-600'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm block">बैंक ट्रांसफर (IMPS)</span>
                  <span className="text-[10px] text-stone-500">NEFT / RTGS / IMPS</span>
                </div>
              </button>
            </div>
          </div>

          {/* Method Specific Input Fields */}
          {payoutMethod === 'upi' ? (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                {isHi ? 'आपकी UPI ID (e.g. mobile@upi / name@okaxis)' : 'Your UPI ID'} *
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="rameshwar.kisan@okaxis"
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 font-mono focus:outline-none focus:border-emerald-500"
              />
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHi ? 'NPCI फास्ट सेटलमेंट समर्थित' : 'Verified instant NPCI routing'}</span>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isHi ? 'खाताधारक का नाम' : 'Account Holder'}
                  </label>
                  <input
                    type="text"
                    required
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isHi ? 'बैंक का नाम' : 'Bank Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isHi ? 'खाता संख्या (Account No)' : 'Account Number'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isHi ? 'IFSC कोड' : 'IFSC Code'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 font-mono uppercase focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Summary Box */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex justify-between text-stone-600">
              <span>{isHi ? 'अनुरोधित राशि:' : 'Requested Amount:'}</span>
              <span className="font-bold text-stone-900 font-mono">₹{numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>{isHi ? 'निकासी शुल्क (फसल सेतु छूट):' : 'Withdrawal Fee (Fasal Setu 0%):'}</span>
              <span className="font-bold text-emerald-700 font-mono">₹0.00</span>
            </div>
            <div className="border-t border-stone-200 pt-1.5 flex justify-between text-sm font-bold text-stone-900">
              <span>{isHi ? 'खाते में क्रेडिट होगी:' : 'Net Amount to be Credited:'}</span>
              <span className="text-emerald-800 font-mono font-black">₹{numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || numAmount <= 0}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-black shadow-xs transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isHi ? 'प्रोसेसिंग...' : 'Processing Payout...'}</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>{isHi ? 'निकासी अनुरोध भेजें' : 'Confirm & Request Payout'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
