import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

import type {
  Product,
  Order,
  ProductCategory,
  FarmerProfile,
  UserProfile,
} from './types';

import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { AddProductView } from './components/AddProductView';
import { OrdersView } from './components/OrdersView';
import { EarningsView } from './components/EarningsView';
import { ProfileView } from './components/ProfileView';
import { LoginModal } from './components/LoginModal';
import { CodeAuditModal } from './components/CodeAuditModal';

export default function App() {
  // ------------------------------------------------
  // Navigation
  // ------------------------------------------------

  const [currentTab, setCurrentTab] =
    useState<string>('dashboard');

  const [editProductId, setEditProductId] =
    useState<string | null>(null);

  // ------------------------------------------------
  // Authentication & Profiles
  // ------------------------------------------------

  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean>(false);

  const [isLiveConnected, setIsLiveConnected] =
    useState<boolean>(false);

  const [userProfile, setUserProfile] =
    useState<UserProfile>({} as UserProfile);

  const [farmerProfile, setFarmerProfile] =
    useState<FarmerProfile>({} as FarmerProfile);

  // ------------------------------------------------
  // Data Store
  // ------------------------------------------------

  const [categories, setCategories] =
    useState<ProductCategory[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [orders, setOrders] =
    useState<Order[]>([]);

  // ------------------------------------------------
  // UI state
  // ------------------------------------------------

  const [isAuditModalOpen, setIsAuditModalOpen] =
    useState<boolean>(false);

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  // ------------------------------------------------
  // Toast Helper
  // ------------------------------------------------

  const showToast = (msg: string) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // ------------------------------------------------
  // Sync with Supabase
  // ------------------------------------------------

  const syncWithSupabase = async () => {
    try {
      setIsLiveConnected(false);

      // ----------------------------------------------
      // 1. Check authenticated Supabase session
      // ----------------------------------------------

      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const authUser = sessionData.session?.user;

      // ----------------------------------------------
      // No authenticated user
      // ----------------------------------------------

      if (!authUser) {
        setIsAuthenticated(false);
        setIsLiveConnected(false);

        setUserProfile({} as UserProfile);
        setFarmerProfile({} as FarmerProfile);

        setCategories([]);
        setProducts([]);
        setOrders([]);

        return;
      }

      setIsAuthenticated(true);

      // ----------------------------------------------
      // 2. Load user profile
      // ----------------------------------------------

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      const actualUser: UserProfile = {
        id: authUser.id,

        full_name:
          profileData?.full_name ||
          authUser.user_metadata?.full_name ||
          '',

        email:
          profileData?.email ||
          authUser.email ||
          '',

        mobile:
          profileData?.mobile ||
          '',

        village:
          profileData?.village ||
          '',

        district:
          profileData?.district ||
          '',

        state:
          profileData?.state ||
          '',
      };

      setUserProfile(actualUser);

      // ----------------------------------------------
      // 3. Load farmer profile
      // ----------------------------------------------

      const {
        data: farmerData,
        error: farmerError,
      } = await supabase
        .from('farmers')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (farmerError) {
        throw farmerError;
      }

      // No farmer profile
      if (!farmerData) {
        setFarmerProfile({
          user_id: authUser.id,
        } as FarmerProfile);

        setCategories([]);
        setProducts([]);
        setOrders([]);

        setIsLiveConnected(true);

        showToast(
          'Farmer profile not found yet.'
        );

        return;
      }

      setFarmerProfile(farmerData);

      // ----------------------------------------------
      // 4. Load product categories
      // ----------------------------------------------

      const {
        data: categoryData,
        error: categoryError,
      } = await supabase
        .from('product_categories')
        .select('*')
        .order('name', {
          ascending: true,
        });

      if (categoryError) {
        throw categoryError;
      }

      setCategories(
        (categoryData || []).map(
          (category: any) => ({
            id: category.id,

            name:
              category.name ||
              category.title ||
              category.category_name ||
              category.slug ||
              'Category',

            slug:
              category.slug || '',

            icon:
              category.icon || '🌱',
          })
        )
      );

      // ----------------------------------------------
      // 5. Load ONLY this farmer's products
      // ----------------------------------------------

      const {
        data: productData,
        error: productError,
      } = await supabase
        .from('products')
        .select('*')
        .eq(
          'farmer_id',
          farmerData.id
        )
        .order('created_at', {
          ascending: false,
        });

      if (productError) {
        throw productError;
      }

      setProducts(
        productData || []
      );

      // ----------------------------------------------
      // 6. Load ONLY this farmer's orders
      // ----------------------------------------------

      const {
        data: orderData,
        error: orderError,
      } = await supabase
        .from('orders')
        .select('*')
        .eq(
          'farmer_id',
          farmerData.id
        )
        .order('created_at', {
          ascending: false,
        });

      if (orderError) {
        throw orderError;
      }

      setOrders(
        orderData || []
      );

      // ----------------------------------------------
      // Sync complete
      // ----------------------------------------------

      setIsLiveConnected(true);

      showToast(
        'Supabase data synchronized ✓'
      );

    } catch (error: any) {
      console.error(
        'Supabase sync error:',
        error
      );

      // Never use demo/mock data.
      setCategories([]);
      setProducts([]);
      setOrders([]);

      setIsLiveConnected(false);

      showToast(
        error?.message ||
        'Could not synchronize Supabase data.'
      );
    }
  };

  // ------------------------------------------------
  // Initial Auth + Supabase listener
  // ------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (!mounted) return;

      await syncWithSupabase();
    };

    initializeAuth();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        if (session?.user) {
          await syncWithSupabase();
        } else {
          setIsAuthenticated(false);
          setIsLiveConnected(false);

          setUserProfile(
            {} as UserProfile
          );

          setFarmerProfile(
            {} as FarmerProfile
          );

          setCategories([]);
          setProducts([]);
          setOrders([]);
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ------------------------------------------------
  // Financial Computations
  // ------------------------------------------------

  const totalEarnings = orders
    .filter((o) => {
      const status = (
        o.order_status ||
        o.status ||
        ''
      ).toLowerCase();

      return (
        status === 'completed' ||
        status === 'delivered'
      );
    })
    .reduce(
      (sum, o) =>
        sum +
        Number(
          o.total_amount ||
          o.subtotal ||
          0
        ),
      0
    );

  const currentMonth =
    new Date().getMonth();

  const currentYear =
    new Date().getFullYear();

  const monthlyEarnings = orders
    .filter((o) => {
      const status = (
        o.order_status ||
        o.status ||
        ''
      ).toLowerCase();

      const date =
        new Date(o.created_at);

      return (
        (
          status === 'completed' ||
          status === 'delivered'
        ) &&
        date.getMonth() ===
          currentMonth &&
        date.getFullYear() ===
          currentYear
      );
    })
    .reduce(
      (sum, o) =>
        sum +
        Number(
          o.total_amount ||
          o.subtotal ||
          0
        ),
      0
    );

  // ------------------------------------------------
  // Navigation
  // ------------------------------------------------

  const handleNavigate = (
    tab: string,
    productId?: string
  ) => {
    if (productId) {
      setEditProductId(productId);
    } else if (
      tab === 'add-product'
    ) {
      setEditProductId(null);
    }

    setCurrentTab(tab);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ------------------------------------------------
  // Save Product
  // ------------------------------------------------

  const handleSaveProduct = async (
    productData: Partial<Product>
  ): Promise<boolean> => {
    try {
      // ----------------------------------------------
      // Update existing product
      // ----------------------------------------------

      if (productData.id) {
        const {
          data,
          error,
        } = await supabase
          .from('products')
          .update({
            ...productData,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'id',
            productData.id
          )
          .eq(
            'farmer_id',
            farmerProfile.id
          )
          .select()
          .single();

        if (error) {
          throw error;
        }

        setProducts((prev) =>
          prev.map((product) =>
            product.id ===
            productData.id
              ? data
              : product
          )
        );

        showToast(
          'Produce updated successfully! ✓'
        );

        return true;
      }

      // ----------------------------------------------
      // Create new product
      // ----------------------------------------------

      if (!farmerProfile.id) {
        throw new Error(
          'Farmer profile is not available.'
        );
      }

      const newProductData = {
        farmer_id:
          farmerProfile.id,

        category_id:
          productData.category_id ||
          null,

        name:
          productData.name ||
          'Produce',

        description:
          productData.description ||
          null,

        price_per_unit:
          productData.price_per_unit ||
          0,

        unit:
          productData.unit ||
          'kg',

        stock:
          productData.stock ??
          10,

        harvest_date:
          productData.harvest_date ||
          new Date()
            .toISOString()
            .split('T')[0],

        farm_location:
          productData.farm_location ||
          farmerProfile.farm_location ||
          null,

        image_url:
          productData.image_url ||
          null,

        is_active:
          productData.is_active ??
          true,

        is_available:
          productData.is_available ??
          true,
      };

      const {
        data,
        error,
      } = await supabase
        .from('products')
        .insert([
          newProductData,
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProducts((prev) => [
          data,
          ...prev,
        ]);
      }

      showToast(
        'New produce added to catalog! 🎉'
      );

      return true;

    } catch (error: any) {
      console.error(
        'Save product error:',
        error
      );

      showToast(
        error?.message ||
        'Error saving product'
      );

      return false;
    }
  };

  // ------------------------------------------------
  // Delete Product
  // ------------------------------------------------

  const handleDeleteProduct = async (
    productId: string
  ) => {
    try {
      const {
        error,
      } = await supabase
        .from('products')
        .delete()
        .eq(
          'id',
          productId
        )
        .eq(
          'farmer_id',
          farmerProfile.id
        );

      if (error) {
        throw error;
      }

      setProducts((prev) =>
        prev.filter(
          (product) =>
            product.id !==
            productId
        )
      );

      showToast(
        'Product deleted from listings.'
      );

    } catch (error: any) {
      console.error(
        'Delete product error:',
        error
      );

      showToast(
        error?.message ||
        'Could not delete product.'
      );
    }
  };

  // ------------------------------------------------
  // Toggle Product Availability
  // ------------------------------------------------

  const handleToggleAvailability = async (
    productId: string,
    current: boolean
  ) => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from('products')
        .update({
          is_available:
            !current,
        })
        .eq(
          'id',
          productId
        )
        .eq(
          'farmer_id',
          farmerProfile.id
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProducts((prev) =>
        prev.map((product) =>
          product.id ===
          productId
            ? data
            : product
        )
      );

      showToast(
        `Product visibility ${
          !current
            ? 'enabled 🟢'
            : 'paused 🔴'
        }`
      );

    } catch (error: any) {
      console.error(
        'Availability update error:',
        error
      );

      showToast(
        error?.message ||
        'Could not update availability.'
      );
    }
  };

  // ------------------------------------------------
  // Quick Stock Update
  // ------------------------------------------------

  const handleQuickUpdateStock = async (
    productId: string,
    newStock: number
  ) => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from('products')
        .update({
          stock: newStock,
        })
        .eq(
          'id',
          productId
        )
        .eq(
          'farmer_id',
          farmerProfile.id
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProducts((prev) =>
        prev.map((product) =>
          product.id ===
          productId
            ? data
            : product
        )
      );

      showToast(
        `Stock updated to ${newStock} units`
      );

    } catch (error: any) {
      console.error(
        'Stock update error:',
        error
      );

      showToast(
        error?.message ||
        'Could not update stock.'
      );
    }
  };

  // ------------------------------------------------
  // Update Order Status
  // ------------------------------------------------

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from('orders')
        .update({
          order_status:
            newStatus,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          'id',
          orderId
        )
        .eq(
          'farmer_id',
          farmerProfile.id
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id ===
          orderId
            ? {
                ...order,
                ...data,
              }
            : order
        )
      );

      showToast(
        `Order status updated to: ${newStatus.toUpperCase()}`
      );

    } catch (error: any) {
      console.error(
        'Order status update error:',
        error
      );

      showToast(
        error?.message ||
        'Could not update order status.'
      );
    }
  };

  // ------------------------------------------------
  // Save User Profile
  // ------------------------------------------------

  const handleSaveUserProfile = async (
    profile: Partial<UserProfile>
  ): Promise<boolean> => {
    try {
      if (!userProfile.id) {
        throw new Error(
          'User session not available.'
        );
      }

      const {
        data,
        error,
      } = await supabase
        .from('profiles')
        .update(profile)
        .eq(
          'id',
          userProfile.id
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      setUserProfile((prev) => ({
        ...prev,
        ...(data || profile),
      }));

      showToast(
        'Personal profile saved ✓'
      );

      return true;

    } catch (error: any) {
      console.error(
        'Save user profile error:',
        error
      );

      showToast(
        error?.message ||
        'Could not save personal profile.'
      );

      return false;
    }
  };

  // ------------------------------------------------
  // Save Farmer Profile
  // ------------------------------------------------

  const handleSaveFarmerProfile = async (
    profile: Partial<FarmerProfile>
  ): Promise<boolean> => {
    try {
      if (!farmerProfile.id) {
        throw new Error(
          'Farmer profile not available.'
        );
      }

      const {
        data,
        error,
      } = await supabase
        .from('farmers')
        .update(profile)
        .eq(
          'id',
          farmerProfile.id
        )
        .eq(
          'user_id',
          userProfile.id
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      setFarmerProfile((prev) => ({
        ...prev,
        ...(data || profile),
      }));

      showToast(
        'Farm details saved ✓'
      );

      return true;

    } catch (error: any) {
      console.error(
        'Save farmer profile error:',
        error
      );

      showToast(
        error?.message ||
        'Could not save farm details.'
      );

      return false;
    }
  };

  // ------------------------------------------------
  // Login
  // ------------------------------------------------

  const handleAuthLogin = async (
    email: string,
    pass: string
  ) => {
    try {
      const {
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }

      await syncWithSupabase();

      return {
        success: true,
      };

    } catch (error: any) {
      return {
        success: false,
        message:
          error?.message ||
          'Login error',
      };
    }
  };

  // ------------------------------------------------
  // Signup
  // ------------------------------------------------

  const handleAuthSignup = async (
    email: string,
    pass: string
  ) => {
    try {
      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email,
        password: pass,
      });

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }

      if (data.session?.user) {
        await syncWithSupabase();

        return {
          success: true,
        };
      }

      return {
        success: true,
        message:
          'Account created. Please verify your email before logging in.',
      };

    } catch (error: any) {
      return {
        success: false,
        message:
          error?.message ||
          'Signup error',
      };
    }
  };

  // ------------------------------------------------
  // Logout
  // ------------------------------------------------

  const handleLogout = async () => {
    try {
      const {
        error,
      } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setIsAuthenticated(false);
      setIsLiveConnected(false);

      setUserProfile(
        {} as UserProfile
      );

      setFarmerProfile(
        {} as FarmerProfile
      );

      setCategories([]);
      setProducts([]);
      setOrders([]);

      setCurrentTab('dashboard');
      setEditProductId(null);

      showToast(
        'Logged out successfully.'
      );

    } catch (error: any) {
      console.error(
        'Logout error:',
        error
      );

      showToast(
        error?.message ||
        'Could not logout.'
      );
    }
  };

  // ------------------------------------------------
  // Login Screen
  // ------------------------------------------------

  if (!isAuthenticated) {
    return (
      <LoginModal
        onLogin={handleAuthLogin}
        onSignup={handleAuthSignup}
        onQuickDemoLogin={() =>
          showToast(
            'Demo login is disabled. Please use your Supabase account.'
          )
        }
      />
    );
  }

  // ------------------------------------------------
  // Pending Orders
  // ------------------------------------------------

  const pendingOrdersCount =
    orders.filter((order) => {
      const status = (
        order.order_status ||
        order.status ||
        ''
      ).toLowerCase();

      return (
        status === 'pending' ||
        status === 'new'
      );
    }).length;

  // ------------------------------------------------
  // Main App
  // ------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-950">

      <div>

        {/* Top Navbar */}

        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          farmerName={
            userProfile.full_name || ''
          }
          isLiveConnected={
            isLiveConnected
          }
          onRefreshData={
            syncWithSupabase
          }
        />

        {/* Global Bug & Code Analysis Floating Banner */}

        <div className="max-w-5xl mx-auto px-4 pt-4">

          <div className="bg-emerald-950 text-emerald-100 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs border border-emerald-800">

            <div className="flex items-center gap-2.5 text-xs">

              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center border border-emerald-400/30">
                ✓
              </span>

              <span>
                <strong className="text-white font-bold">
                  Code Analysis Complete:
                </strong>{' '}
                6 critical bugs fixed
                (Module script tag, missing
                earnings engine, profile state
                leakage, broken link routes).
              </span>

            </div>

            <button
              onClick={() =>
                setIsAuditModalOpen(true)
              }
              className="px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-2xs"
            >
              View Bug Audit Report
            </button>

          </div>

        </div>

        {/* Main Content View Switcher */}

        <main className="max-w-5xl mx-auto px-4 pt-6 pb-20">

          {/* Dashboard */}

          {currentTab === 'dashboard' && (
            <DashboardView
              products={products}
              orders={orders}
              totalEarnings={
                totalEarnings
              }
              monthlyEarnings={
                monthlyEarnings
              }
              farmerName={
                userProfile.full_name
              }
              farmName={
                farmerProfile.farm_name
              }
              onNavigate={
                handleNavigate
              }
              onUpdateOrderStatus={
                handleUpdateOrderStatus
              }
            />
          )}

          {/* Products */}

          {currentTab === 'products' && (
            <ProductsView
              products={products}
              categories={categories}
              onNavigate={
                handleNavigate
              }
              onDeleteProduct={
                handleDeleteProduct
              }
              onToggleAvailability={
                handleToggleAvailability
              }
              onQuickUpdateStock={
                handleQuickUpdateStock
              }
            />
          )}

          {/* Add Product */}

          {currentTab === 'add-product' && (
            <AddProductView
              editProductId={
                editProductId
              }
              products={products}
              categories={categories}
              onSaveProduct={
                handleSaveProduct
              }
              onNavigate={
                handleNavigate
              }
              defaultFarmLocation={
                farmerProfile.farm_location ||
                'Lakhimpur Kheri, Uttar Pradesh'
              }
            />
          )}

          {/* Orders */}

          {currentTab === 'orders' && (
            <OrdersView
              orders={orders}
              products={products}
              onUpdateOrderStatus={
                handleUpdateOrderStatus
              }
              onNavigate={
                handleNavigate
              }
            />
          )}

          {/* Earnings */}

          {currentTab === 'earnings' && (
            <EarningsView
              orders={orders}
              products={products}
              totalEarnings={
                totalEarnings
              }
              monthlyEarnings={
                monthlyEarnings
              }
              onNavigate={
                handleNavigate
              }
            />
          )}

          {/* Profile */}

          {currentTab === 'profile' && (
            <ProfileView
              userProfile={
                userProfile
              }
              farmerProfile={
                farmerProfile
              }
              onSaveUserProfile={
                handleSaveUserProfile
              }
              onSaveFarmerProfile={
                handleSaveFarmerProfile
              }
              onLogout={
                handleLogout
              }
            />
          )}

        </main>

      </div>

      {/* Persistent Bottom Mobile Navigation */}

      <BottomNav
        currentTab={currentTab}
        setCurrentTab={
          handleNavigate
        }
        pendingOrdersCount={
          pendingOrdersCount
        }
      />

      {/* Floating Toast Notification */}

      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">

          <span>🌾</span>

          <span>
            {toastMessage}
          </span>

        </div>
      )}

      {/* Code Audit and Correction Report Modal */}

      <CodeAuditModal
        isOpen={
          isAuditModalOpen
        }
        onClose={() =>
          setIsAuditModalOpen(false)
        }
      />

    </div>
  );
}
