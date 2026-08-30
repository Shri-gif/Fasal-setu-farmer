import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { AddProductModal } from './components/AddProductModal';
import { OrdersView } from './components/OrdersView';
import { EarningsWithdrawView } from './components/EarningsWithdrawView';
import { SupabaseTablesView } from './components/SupabaseTablesView';
import { ProfileView } from './components/ProfileView';
import { WithdrawModal } from './components/WithdrawModal';
import { 
  Language, 
  PlatformSetting, 
  FarmerProfile, 
  Product, 
  Order, 
  FarmerPayout, 
  SupabaseConfig,
  OrderStatus 
} from './types';
import { 
  fetchPlatformSettings, 
  updatePlatformSettings, 
  fetchProducts, 
  saveProduct, 
  deleteProduct, 
  fetchOrders, 
  updateOrderStatus, 
  fetchFarmerPayouts, 
  createFarmerPayoutRequest,
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  calculateProductPrices
} from './supabase';

const FARMER_KEY = 'fasal_setu_farmer_profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [language, setLanguage] = useState<Language>('hi');
  
  const [platformSetting, setPlatformSetting] = useState<PlatformSetting>({
    id: 1,
    platform_fee: 10.00,
    platform_fee_type: 'percentage',
    min_payout_amount: 100,
    gst_enabled: true,
    default_gst_rate: 5,
  });

  const [farmer, setFarmer] = useState<FarmerProfile>(() => {
    const saved = localStorage.getItem(FARMER_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_FARMER_PROFILE;
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payouts, setPayouts] = useState<FarmerPayout[]>([]);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());

  // Modal States
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Initialize data from Supabase / local storage
  useEffect(() => {
    async function loadData() {
      const settings = await fetchPlatformSettings();
      setPlatformSetting(settings);

      const prods = await fetchProducts();
      setProducts(prods);

      const ords = await fetchOrders();
      setOrders(ords);

      const pays = await fetchFarmerPayouts(farmer.id);
      setPayouts(pays);
    }
    loadData();
  }, [farmer.id]);

  // Persist farmer profile
  useEffect(() => {
    localStorage.setItem(FARMER_KEY, JSON.stringify(farmer));
  }, [farmer]);

  // Handle Withdrawal Request (Core payment system)
  const handleRequestPayout = async (payoutData: Omit<FarmerPayout, 'id' | 'requested_at' | 'status' | 'reference_id'>) => {
    const newPayout = await createFarmerPayoutRequest(payoutData);
    
    // Update local farmer wallet state
    setFarmer(prev => ({
      ...prev,
      wallet_balance: Math.max(0, prev.wallet_balance - payoutData.amount),
      pending_payout_balance: prev.pending_payout_balance + payoutData.amount,
    }));

    // Update payouts state
    setPayouts(prev => [newPayout, ...prev]);

    // Simulate instant bank/UPI settlement update after 5 seconds
    setTimeout(() => {
      setPayouts(current => 
        current.map(p => {
          if (p.id === newPayout.id) {
            return {
              ...p,
              status: 'completed',
              processed_at: new Date().toISOString(),
            };
          }
          return p;
        })
      );

      setFarmer(prev => ({
        ...prev,
        pending_payout_balance: Math.max(0, prev.pending_payout_balance - payoutData.amount),
        total_withdrawn: prev.total_withdrawn + payoutData.amount,
      }));
    }, 6000);
  };

  // Handle Product Save (with live 10% platform fee and GST recalculation)
  const handleSaveProduct = async (product: Product) => {
    const updatedList = await saveProduct(product);
    setProducts(updatedList);
  };

  // Handle Product Delete
  const handleDeleteProduct = async (productId: string) => {
    const updatedList = await deleteProduct(productId);
    setProducts(updatedList);
  };

  // Handle Order Status Progression
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updatedOrders = await updateOrderStatus(orderId, status);
    setOrders(updatedOrders);

    // If order was delivered, release money into Farmer's Wallet Balance!
    if (status === 'delivered') {
      const deliveredOrder = orders.find(o => o.id === orderId);
      if (deliveredOrder && deliveredOrder.payment_status !== 'released_to_wallet') {
        const netEarnings = deliveredOrder.farmer_net_earnings;
        setFarmer(prev => ({
          ...prev,
          wallet_balance: prev.wallet_balance + netEarnings,
          lifetime_earnings: prev.lifetime_earnings + netEarnings,
        }));
      }
    }
  };

  // Handle Supabase Platform Fee Adjustment (e.g. 10% fee updated)
  const handleUpdateFee = async (newFee: number, feeType: 'percentage' | 'flat') => {
    const updatedSetting = await updatePlatformSettings({
      platform_fee: newFee,
      platform_fee_type: feeType,
    });
    setPlatformSetting(updatedSetting);

    // Recalculate prices across all existing products so database stays consistent
    const recalculated = products.map(prod => {
      const calc = calculateProductPrices(prod.farmer_base_price, newFee, prod.gst_rate);
      return {
        ...prod,
        platform_fee_percentage: newFee,
        platform_fee_amount: calc.platformFeeAmount,
        gst_amount: calc.gstAmount,
        final_buyer_price: calc.finalBuyerPrice,
      };
    });

    for (const p of recalculated) {
      await saveProduct(p);
    }
    setProducts(recalculated);
  };

  // Handle Bank Account update
  const handleUpdateBankDetails = (newDetails: FarmerProfile['bank_account']) => {
    setFarmer(prev => ({
      ...prev,
      bank_account: newDetails,
    }));
  };

  // Handle Profile update
  const handleUpdateProfile = (updated: FarmerProfile) => {
    setFarmer(updated);
  };

  // Handle Supabase Config save
  const handleSaveSupabaseConfig = (config: SupabaseConfig) => {
    saveSupabaseConfig(config);
    setSupabaseConfig(config);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        platformSetting={platformSetting}
        farmer={farmer}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
        isSupabaseConnected={supabaseConfig.isConnected}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {activeTab === 'dashboard' && (
          <DashboardView
            farmer={farmer}
            platformSetting={platformSetting}
            products={products}
            orders={orders}
            payouts={payouts}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onAddNewProduct={() => {
              setEditingProduct(null);
              setIsAddProductOpen(true);
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
            language={language}
          />
        )}

        {activeTab === 'products' && (
          <ProductsView
            products={products}
            platformSetting={platformSetting}
            onAddNew={() => {
              setEditingProduct(null);
              setIsAddProductOpen(true);
            }}
            onEdit={(prod) => {
              setEditingProduct(prod);
              setIsAddProductOpen(true);
            }}
            onDelete={handleDeleteProduct}
            language={language}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            language={language}
          />
        )}

        {activeTab === 'earnings' && (
          <EarningsWithdrawView
            farmer={farmer}
            payouts={payouts}
            orders={orders}
            platformSetting={platformSetting}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onUpdateBankDetails={handleUpdateBankDetails}
            language={language}
          />
        )}

        {activeTab === 'supabase' && (
          <SupabaseTablesView
            platformSetting={platformSetting}
            payouts={payouts}
            products={products}
            orders={orders}
            onUpdateFee={handleUpdateFee}
            supabaseConfig={supabaseConfig}
            onSaveSupabaseConfig={handleSaveSupabaseConfig}
            language={language}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            farmer={farmer}
            onUpdateProfile={handleUpdateProfile}
            language={language}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Fasal Setu (फसल सेतु) • 100% Kisan Direct Agri Gateway</p>
          <div className="flex items-center gap-4 text-stone-600 font-medium">
            <span>Supabase 10% Platform Fee</span>
            <span>•</span>
            <span>GST Tax Calculated</span>
            <span>•</span>
            <span>Direct Payouts (Bank/UPI)</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        farmer={farmer}
        platformSetting={platformSetting}
        onRequestPayout={handleRequestPayout}
        language={language}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => {
          setIsAddProductOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        platformSetting={platformSetting}
        farmerId={farmer.id}
        language={language}
      />

    </div>
  );
}
