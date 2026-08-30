import React from 'react';
import { LayoutDashboard, Carrot, PlusCircle, Package, IndianRupee, ShieldAlert } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pendingOrdersCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  pendingOrdersCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-emerald-100 shadow-lg">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-colors ${
            currentTab === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-emerald-600'
          }`}
          id="nav-dashboard"
        >
          <span className="text-xl">🏠</span>
          <span className="text-[11px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => setCurrentTab('products')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-colors ${
            currentTab === 'products' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-emerald-600'
          }`}
          id="nav-products"
        >
          <span className="text-xl">🥕</span>
          <span className="text-[11px] mt-0.5">Products</span>
        </button>

        {/* Center Prominent Add Button */}
        <button
          onClick={() => setCurrentTab('add-product')}
          className="w-12 h-12 -mt-5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30 text-2xl transition-all"
          title="Add New Produce"
          id="nav-add-product"
        >
          +
        </button>

        <button
          onClick={() => setCurrentTab('orders')}
          className={`relative flex flex-col items-center justify-center min-w-[56px] py-1 transition-colors ${
            currentTab === 'orders' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-emerald-600'
          }`}
          id="nav-orders"
        >
          <span className="text-xl">📦</span>
          <span className="text-[11px] mt-0.5">Orders</span>
          {pendingOrdersCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('earnings')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-colors ${
            currentTab === 'earnings' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-emerald-600'
          }`}
          id="nav-earnings"
        >
          <span className="text-xl">💰</span>
          <span className="text-[11px] mt-0.5">Earnings</span>
        </button>
      </div>
    </nav>
  );
};
