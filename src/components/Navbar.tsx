import React from 'react';
import { RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  farmerName: string;
  isLiveConnected: boolean;
  onRefreshData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  farmerName,
  isLiveConnected,
  onRefreshData,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-emerald-100 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

        {/* Brand */}
        <div
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
          id="brand-logo-btn"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 text-xl font-bold shadow-xs group-hover:scale-105 transition-transform">
            🌱
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-extrabold text-emerald-950 tracking-tight leading-none">
                FasalSetu
              </h1>

              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                Farmer
              </span>
            </div>

            <p className="text-xs text-emerald-700 font-medium leading-tight mt-0.5">
              Khet Se Seedha Ghar Tak
            </p>
          </div>
        </div>

        {/* Action icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Sync */}
          <button
            onClick={onRefreshData}
            title="Sync with database"
            className="p-2 text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium border border-emerald-100"
          >
            <RefreshCw className="w-3.5 h-3.5" />

            <span className="hidden sm:inline">
              Sync
            </span>
          </button>

          {/* Supabase Status */}
          <div
            title={
              isLiveConnected
                ? "Connected to Supabase"
                : "Using local state fallback"
            }
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>

            <span>
              {isLiveConnected
                ? "Supabase Live"
                : "Local Store"}
            </span>
          </div>

          {/* Farmer Profile */}
          <button
            onClick={() => setCurrentTab('profile')}
            id="profile-nav-btn"
            className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-all ${
              currentTab === 'profile'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border-emerald-200'
            }`}
          >
            <span className="text-base">
              👨‍🌾
            </span>

            <span className="text-xs font-bold truncate max-w-[100px] sm:max-w-[140px]">
              {farmerName || "Farmer"}
            </span>
          </button>

        </div>
      </div>
    </header>
  );
};
