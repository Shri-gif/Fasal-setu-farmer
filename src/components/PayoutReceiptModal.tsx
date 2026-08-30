import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Download, IndianRupee, Sprout } from 'lucide-react';
import { FarmerPayout, FarmerProfile, Language } from '../types';

interface PayoutReceiptModalProps {
  payout: FarmerPayout | null;
  farmer: FarmerProfile;
  onClose: () => void;
  language: Language;
}

export const PayoutReceiptModal: React.FC<PayoutReceiptModalProps> = ({
  payout,
  farmer,
  onClose,
  language,
}) => {
  if (!payout) return null;
  const isHi = language === 'hi';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white border border-stone-200 text-stone-900 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-stone-900 font-serif">
              {isHi ? 'किसान भुगतान वाउचर / रसीद' : 'Farmer Payout Voucher'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-xs rounded-lg text-stone-800 flex items-center gap-1.5 transition-colors font-bold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isHi ? 'प्रिंट करें' : 'Print'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Content */}
        <div className="p-6 bg-white space-y-5 text-stone-800 print:bg-white print:text-black">
          {/* Logo & Stamp */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-xs">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-lg text-stone-900 font-serif">Fasal Setu (फसल सेतु)</h4>
                <p className="text-[11px] text-stone-500">Direct Kisan Mandi Settlement Protocol</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                payout.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : payout.status === 'processing'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-stone-100 text-stone-700 border border-stone-200'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                {payout.status.toUpperCase()}
              </span>
              <div className="text-[10px] text-stone-500 mt-1 font-mono">
                {new Date(payout.requested_at).toLocaleDateString('en-IN', {
                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </div>
            </div>
          </div>

          {/* Key Reference Information */}
          <div className="grid grid-cols-2 gap-3 bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs">
            <div>
              <div className="text-stone-500 font-medium">{isHi ? 'लेनदेन संदर्भ संख्या (UTR/Ref):' : 'Transaction Ref / UTR:'}</div>
              <div className="font-mono font-bold text-amber-800 mt-0.5 break-all">{payout.reference_id}</div>
            </div>
            <div>
              <div className="text-stone-500 font-medium">{isHi ? 'किसान पहचान पत्र (Kisan ID):' : 'Kisan ID:'}</div>
              <div className="font-mono font-bold text-emerald-800 mt-0.5">{farmer.kisan_id}</div>
            </div>
          </div>

          {/* Beneficiary Details */}
          <div className="space-y-1 text-xs">
            <div className="font-bold text-stone-700 uppercase tracking-wider text-[11px]">
              {isHi ? 'लाभार्थी किसान विवरण (Beneficiary Info)' : 'Beneficiary Details'}
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500">{isHi ? 'किसान का नाम:' : 'Farmer Name:'}</span>
                <span className="font-bold text-stone-900">{farmer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{isHi ? 'गाँव / जिला:' : 'Village / District:'}</span>
                <span className="text-stone-800">{farmer.village}, {farmer.district}, {farmer.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{isHi ? 'भुगतान विधि:' : 'Payout Method:'}</span>
                <span className="font-bold uppercase text-amber-800">{payout.payout_method}</span>
              </div>
              {payout.payout_method === 'upi' ? (
                <div className="flex justify-between">
                  <span className="text-stone-500">UPI ID:</span>
                  <span className="font-mono font-bold text-emerald-800">{payout.account_details.upi_id}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-stone-500">{isHi ? 'बैंक:' : 'Bank:'}</span>
                    <span className="font-semibold text-stone-900">{payout.account_details.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">{isHi ? 'खाता संख्या:' : 'Account No:'}</span>
                    <span className="font-mono font-bold text-stone-900">•••• •••• {payout.account_details.account_number?.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">IFSC Code:</span>
                    <span className="font-mono font-bold text-stone-900">{payout.account_details.ifsc_code}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Amount Breakdown Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-stone-100 text-stone-700">
                <tr>
                  <th className="p-2.5 font-bold">{isHi ? 'विवरण' : 'Particulars'}</th>
                  <th className="p-2.5 text-right font-bold">{isHi ? 'राशि' : 'Amount'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="p-2.5 text-stone-800">{isHi ? 'अनुरोधित किसान निकासी' : 'Requested Farmer Payout'}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-stone-900">₹{payout.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-stone-600">{isHi ? 'प्लेटफॉर्म निकासी शुल्क (0% सब्सिडी)' : 'Processing Fee (0% Subsidy)'}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-700">- ₹0.00</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-stone-600">{isHi ? 'TDS / वैधानिक कटौती' : 'Applicable Withholding'}</td>
                  <td className="p-2.5 text-right font-mono text-stone-500">₹0.00</td>
                </tr>
                <tr className="bg-emerald-50 text-emerald-900 font-bold">
                  <td className="p-3 text-sm">{isHi ? 'कुल प्राप्त राशि (Net Credited)' : 'Total Net Credited'}</td>
                  <td className="p-3 text-right text-base text-emerald-800 font-mono font-black">
                    ₹{payout.net_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Seal / Footer note */}
          <div className="pt-2 text-center text-[10px] text-stone-500 border-t border-stone-200 space-y-1">
            <p>This is a system-generated electronic settlement advice issued under Fasal Setu Agri-Direct Gateway.</p>
            <p className="text-emerald-700 font-bold">✓ NPCI / RBI Secured Settlement Gateway Verified</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer"
          >
            {isHi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
