import React from 'react';
import { Sprout, Wallet, ArrowDownToLine, Database, Package, ShoppingBag, User, ShieldCheck, RefreshCw, IndianRupee } from 'lucide-react';
import { Language, PlatformSetting, FarmerProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  platformSetting: PlatformSetting;
  farmer: FarmerProfile;
  onOpenWithdraw: () => void;
  isSupabaseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  platformSetting,
  farmer,
  onOpenWithdraw,
  isSupabaseConnected,
}) => {
  const isHi = language === 'hi';

  const navItems = [
    { id: 'dashboard', label: isHi ? 'डैशबोर्ड' : 'Dashboard', icon: Sprout },
    { id: 'products', label: isHi ? 'फसल व उत्पाद' : 'Products & Crops', icon: Package },
    { id: 'orders', label: isHi ? 'ऑर्डर व बिक्री' : 'Orders & Mandi', icon: ShoppingBag },
    { id: 'earnings', label: isHi ? 'कमाई व निकासी' : 'Earnings & Payouts', icon: Wallet, highlight: true },
    { id: 'supabase', label: isHi ? 'सुपाबेस डेटाबेस' : 'Supabase Studio', icon: Database },
    { id: 'profile', label: isHi ? 'किसान प्रोफ़ाइल' : 'Profile & KYC', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 text-stone-900 shadow-xs">
      {/* Top Banner with Platform Fee & Status */}
      <div className="bg-emerald-900 px-4 py-1.5 text-xs text-emerald-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold bg-emerald-800 text-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            {isHi ? 'प्रमाणित किसान पोर्टल' : 'Verified Kisan Portal'}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-emerald-100">
            <span className="text-emerald-200 font-semibold">{isHi ? 'सुपाबेस प्लेटफॉर्म शुल्क:' : 'Supabase Platform Fee:'}</span>
            <span className="bg-amber-400 text-stone-950 font-black px-1.5 py-0.2 rounded text-[11px]">
              {platformSetting.platform_fee}% ({platformSetting.platform_fee_type})
            </span>
            <span className="text-emerald-200 text-[11px] ml-1">
              {isHi ? '• किसान को 100% मूल मूल्य प्राप्त होता है' : '• Farmer gets 100% of base price'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-300 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-emerald-100">
              Supabase: <strong className="text-white">{isSupabaseConnected ? 'Live Cloud' : 'Active (Synced)'}</strong>
            </span>
          </div>

          <div className="flex items-center border border-emerald-700 rounded overflow-hidden">
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 text-xs transition-colors ${language === 'hi' ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-emerald-800 text-emerald-200 hover:text-white'}`}
              title="हिन्दी"
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 text-xs transition-colors ${language === 'en' ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-emerald-800 text-emerald-200 hover:text-white'}`}
              title="English"
            >
              ENG
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-md text-white font-bold">
              <Sprout className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-stone-900 font-serif">
                  Fasal Setu
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {isHi ? 'किसान पोर्टल' : 'Farmer'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                {isHi ? 'फसल बेचें • तुरंत निकासी' : 'Direct Mandi & Payouts'}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                  {item.id === 'supabase' && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isActive ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                      10% Fee
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Wallet Balance & Withdraw Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div 
              onClick={() => setActiveTab('earnings')}
              className="bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl px-3 py-1.5 cursor-pointer transition-all flex items-center gap-2.5"
              title={isHi ? 'निकासी हेतु उपलब्ध राशि' : 'Available for withdrawal'}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div className="text-right">
                <div className="text-[10px] text-emerald-800 font-semibold leading-tight">
                  {isHi ? 'वॉलेट शेष' : 'Wallet Balance'}
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-emerald-950 leading-tight font-mono">
                  ₹{farmer.wallet_balance.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenWithdraw}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span className="whitespace-nowrap">{isHi ? 'पैसे निकालें' : 'Withdraw'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Scrollable Row */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-stone-200 gap-1.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-700 bg-stone-100 hover:bg-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
