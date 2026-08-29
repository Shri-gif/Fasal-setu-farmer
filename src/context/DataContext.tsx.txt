import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import {
  Product,
  Order,
  Farmer,
  CustomerProfile,
  ProductCategory,
  BroadcastNotification,
  RealtimeEventLog,
  PlatformStats,
  OrderStatus,
} from '../types';

interface DataContextType {
  products: Product[];
  orders: Order[];
  farmers: Farmer[];
  customers: CustomerProfile[];
  categories: ProductCategory[];
  broadcasts: BroadcastNotification[];
  realtimeLogs: RealtimeEventLog[];
  stats: PlatformStats;
  isLiveConnected: boolean;
  isSyncing: boolean;
  latencyMs: number;
  lastSyncTime: Date | null;

  // Product Actions
  addProduct: (product: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  quickAdjustStock: (id: string, delta: number) => Promise<boolean>;
  toggleProductStatus: (id: string, field: 'is_active' | 'is_available') => Promise<boolean>;

  // Order Actions
  createOrder: (order: Partial<Order>) => Promise<{ success: boolean; error?: string }>;
  updateOrderStatus: (id: string | number, status: OrderStatus) => Promise<{ success: boolean; error?: string }>;
  deleteOrder: (id: string | number) => Promise<{ success: boolean; error?: string }>;

  // Farmer Actions
  addFarmer: (farmer: Partial<Farmer>) => Promise<{ success: boolean; error?: string }>;
  updateFarmer: (id: string, updates: Partial<Farmer>) => Promise<{ success: boolean; error?: string }>;
  deleteFarmer: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Category Actions
  addCategory: (category: Partial<ProductCategory>) => Promise<{ success: boolean; error?: string }>;
  updateCategory: (id: string, updates: Partial<ProductCategory>) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Broadcast Actions
  addBroadcast: (broadcast: Omit<BroadcastNotification, 'id' | 'created_at'>) => Promise<void>;
  deleteBroadcast: (id: string) => Promise<void>;
  toggleBroadcast: (id: string) => Promise<void>;

  // Utilities
  exportData: (entity: 'products' | 'orders' | 'farmers' | 'categories' | 'customers', format: 'csv' | 'json') => void;
  clearAllData: () => void;
  refreshData: () => Promise<void>;
  addRealtimeLog: (log: Omit<RealtimeEventLog, 'id' | 'timestamp'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to check if cached item is from old fake mock data
const isRealId = (id: any) => {
  if (!id) return false;
  const str = String(id);
  // Filter out hardcoded seed IDs like prod-01, f-101, 98124, bc-1
  if (['prod-01', 'prod-02', 'prod-03', 'prod-04', 'prod-05', 'prod-06', 'prod-07', 'prod-08'].includes(str)) return false;
  if (['f-101', 'f-102', 'f-103', 'f-104', 'f-105'].includes(str)) return false;
  if (['98124', '98125', '98126', '98127', '98128'].includes(str)) return false;
  if (['bc-1', 'bc-2', 'bc-3'].includes(str)) return false;
  return true;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('fasal_setu_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p) => isRealId(p.id));
        }
      }
    } catch {}
    return [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('fasal_setu_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((o) => isRealId(o.id));
        }
      }
    } catch {}
    return [];
  });

  const [farmers, setFarmers] = useState<Farmer[]>(() => {
    try {
      const saved = localStorage.getItem('fasal_setu_farmers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((f) => isRealId(f.id));
        }
      }
    } catch {}
    return [];
  });

  const [customers, setCustomers] = useState<CustomerProfile[]>([]);

  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    try {
      const saved = localStorage.getItem('fasal_setu_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([]);

  const [realtimeLogs, setRealtimeLogs] = useState<RealtimeEventLog[]>([
    {
      id: 'rt-init',
      table: 'system',
      event_type: 'SUBSCRIBE',
      timestamp: new Date().toISOString(),
      payload: { status: 'Connected to Supabase PostgreSQL real-time engine' },
      summary: 'Listening to real Supabase database events across farmers & customers',
    },
  ]);

  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Synchronize localStorage with real data
  useEffect(() => {
    localStorage.setItem('fasal_setu_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('fasal_setu_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('fasal_setu_farmers', JSON.stringify(farmers));
  }, [farmers]);

  useEffect(() => {
    localStorage.setItem('fasal_setu_categories', JSON.stringify(categories));
  }, [categories]);

  const addRealtimeLog = useCallback((log: Omit<RealtimeEventLog, 'id' | 'timestamp'>) => {
    const newLog: RealtimeEventLog = {
      id: 'rt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...log,
    };
    setRealtimeLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  }, []);

  // Fetch purely real data from Supabase
  const fetchDataFromSupabase = useCallback(async () => {
    setIsSyncing(true);
    const conn = await checkSupabaseConnection();
    setIsLiveConnected(conn.connected);
    setLatencyMs(conn.latencyMs);

    try {
      // 1. Fetch Categories
      const { data: catData, error: catErr } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      
      let currentCategories: ProductCategory[] = [];
      if (!catErr && catData) {
        currentCategories = catData.map((c) => {
          let icon = '🌱';
          const nameLower = c.name?.toLowerCase() || '';
          if (nameLower.includes('veg')) icon = '🥕';
          else if (nameLower.includes('fruit')) icon = '🍎';
          else if (nameLower.includes('grain')) icon = '🌾';
          else if (nameLower.includes('pulse')) icon = '🥣';
          else if (nameLower.includes('dairy')) icon = '🥛';
          else if (nameLower.includes('spice')) icon = '🌶️';
          return { ...c, icon };
        });
        setCategories(currentCategories);
      }

      // 2. Fetch Profiles (Users with role='farmer', 'customer', etc.)
      const { data: profilesData } = await supabase.from('profiles').select('*');
      const profileMap = new Map<string, any>();
      if (profilesData) {
        profilesData.forEach((p) => {
          profileMap.set(p.id, p);
        });
      }

      // 3. Fetch Farmers
      const { data: farmData, error: farmErr } = await supabase.from('farmers').select('*');
      if (!farmErr && farmData) {
        const enrichedFarmers: Farmer[] = farmData.map((f) => {
          const profile = f.user_id ? profileMap.get(f.user_id) : null;
          return {
            ...f,
            farmer_name: profile?.full_name || f.farm_name || 'Producer',
            contact_number: profile?.phone || '',
            is_verified: true,
          };
        });
        setFarmers(enrichedFarmers);
      } else {
        setFarmers([]);
      }

      // 4. Fetch Products
      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!prodErr && prodData) {
        const enrichedProducts: Product[] = prodData.map((p) => {
          const cat = currentCategories.find((c) => c.id === p.category_id);
          return {
            ...p,
            category_name: cat ? cat.name : 'Produce',
          };
        });
        setProducts(enrichedProducts);
      } else {
        setProducts([]);
      }

      // 5. Fetch Orders
      const { data: ordData, error: ordErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      let currentOrders: Order[] = [];
      if (!ordErr && ordData) {
        currentOrders = ordData.map((o) => {
          const prod = prodData?.find((p) => p.id === o.product_id);
          const rawQty = Number(o.quantity) || 1;
          const rawPrice = Number(o.price_per_unit) || (prod ? Number(prod.price_per_unit) : 0);
          const subtotal = rawQty * rawPrice;
          const feePercent = 10;
          const feeAmount = Math.round(subtotal * 0.10);
          const totalAmt = Number(o.total_amount) || (subtotal + feeAmount);
          const farmerEarnings = subtotal;

          return {
            ...o,
            product_name: prod ? prod.name : o.product_id ? `Produce #${o.product_id}` : 'Agricultural Produce',
            subtotal_amount: subtotal,
            platform_fee_percent: feePercent,
            platform_fee_amount: feeAmount,
            farmer_net_earnings: farmerEarnings,
            total_amount: totalAmt,
          };
        });
        setOrders(currentOrders);
      } else {
        setOrders([]);
      }

      // 6. Build Real Customers from Profiles and Orders
      const realCustomerList: CustomerProfile[] = [];
      const seenCustomerMobiles = new Set<string>();

      // From profiles table (users who signed up with role customer or general user)
      if (profilesData) {
        profilesData
          .filter((p) => p.role === 'customer' || !p.role)
          .forEach((p) => {
            const userOrders = currentOrders.filter(
              (o) => o.customer_mobile === p.phone || o.customer_name?.toLowerCase() === p.full_name?.toLowerCase()
            );
            const totalSpent = userOrders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
            if (p.phone) seenCustomerMobiles.add(p.phone);

            realCustomerList.push({
              id: p.id,
              full_name: p.full_name || 'Customer Buyer',
              phone: p.phone,
              role: 'customer',
              avatar_url: p.avatar_url,
              state: p.state,
              city: userOrders[0]?.city || '',
              delivery_address: userOrders[0]?.delivery_address || '',
              total_orders_count: userOrders.length,
              total_spent: totalSpent,
              created_at: p.created_at,
              is_active: p.is_active ?? true,
            });
          });
      }

      // Also identify unique customers who placed direct orders
      currentOrders.forEach((o) => {
        if (o.customer_mobile && !seenCustomerMobiles.has(o.customer_mobile)) {
          seenCustomerMobiles.add(o.customer_mobile);
          const userOrders = currentOrders.filter((cord) => cord.customer_mobile === o.customer_mobile);
          const totalSpent = userOrders.reduce((acc, cord) => acc + (Number(cord.total_amount) || 0), 0);

          realCustomerList.push({
            id: 'cust-' + (o.id || Math.random().toString(36).substring(2, 8)),
            full_name: o.customer_name || 'Direct Buyer',
            phone: o.customer_mobile,
            role: 'customer',
            city: o.city,
            delivery_address: o.delivery_address,
            total_orders_count: userOrders.length,
            total_spent: totalSpent,
            created_at: o.created_at,
            is_active: true,
          });
        }
      });

      setCustomers(realCustomerList);

      // 7. Fetch Notifications from Supabase
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (notifData) {
        setBroadcasts(
          notifData.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            target: 'all',
            type: (n.type as any) || 'announcement',
            is_active: true,
            created_at: n.created_at,
          }))
        );
      }

      setLastSyncTime(new Date());
    } catch (err: any) {
      console.warn('Supabase real-time sync exception:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Supabase Real-Time Subscriptions Setup
  useEffect(() => {
    fetchDataFromSupabase();

    const channel = supabase
      .channel('fasal_setu_admin_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          addRealtimeLog({
            table: 'products',
            event_type: payload.eventType as any,
            record_id: (payload.new as any)?.id || (payload.old as any)?.id,
            payload,
            summary: `Product ${payload.eventType}: ${(payload.new as any)?.name || (payload.old as any)?.id}`,
          });

          if (payload.eventType === 'INSERT' && payload.new) {
            setProducts((prev) => {
              const newProd = payload.new as Product;
              return [newProd, ...prev.filter((p) => p.id !== newProd.id)];
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setProducts((prev) =>
              prev.map((p) => (p.id === (payload.new as Product).id ? { ...p, ...(payload.new as Product) } : p))
            );
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setProducts((prev) => prev.filter((p) => p.id !== (payload.old as any).id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          addRealtimeLog({
            table: 'orders',
            event_type: payload.eventType as any,
            record_id: (payload.new as any)?.id || (payload.old as any)?.id,
            payload,
            summary: `Order ${payload.eventType} (#${(payload.new as any)?.id || (payload.old as any)?.id}) status: ${(payload.new as any)?.status || ''}`,
          });

          if (payload.eventType === 'INSERT' && payload.new) {
            setOrders((prev) => {
              const newOrd = payload.new as Order;
              return [newOrd, ...prev.filter((o) => o.id !== newOrd.id)];
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setOrders((prev) =>
              prev.map((o) => (o.id === (payload.new as Order).id ? { ...o, ...(payload.new as Order) } : o))
            );
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setOrders((prev) => prev.filter((o) => o.id !== (payload.old as any).id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'farmers' },
        (payload) => {
          addRealtimeLog({
            table: 'farmers',
            event_type: payload.eventType as any,
            record_id: (payload.new as any)?.id || (payload.old as any)?.id,
            payload,
            summary: `Farmer ${payload.eventType}: ${(payload.new as any)?.farm_name || (payload.old as any)?.id}`,
          });

          if (payload.eventType === 'INSERT' && payload.new) {
            setFarmers((prev) => [payload.new as Farmer, ...prev.filter((f) => f.id !== (payload.new as Farmer).id)]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setFarmers((prev) =>
              prev.map((f) => (f.id === (payload.new as Farmer).id ? { ...f, ...(payload.new as Farmer) } : f))
            );
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setFarmers((prev) => prev.filter((f) => f.id !== (payload.old as any).id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchDataFromSupabase();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_categories' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setCategories((prev) => [...prev, payload.new as ProductCategory]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setCategories((prev) =>
              prev.map((c) => (c.id === (payload.new as ProductCategory).id ? (payload.new as ProductCategory) : c))
            );
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setCategories((prev) => prev.filter((c) => c.id !== (payload.old as any).id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const n = payload.new as any;
            setBroadcasts((prev) => [
              {
                id: n.id,
                title: n.title,
                message: n.message,
                target: 'all',
                type: n.type || 'announcement',
                is_active: true,
                created_at: n.created_at,
              },
              ...prev,
            ]);
          }
        }
      )
      .subscribe((status) => {
        setIsLiveConnected(status === 'SUBSCRIBED');
      });

    const interval = setInterval(async () => {
      const conn = await checkSupabaseConnection();
      setIsLiveConnected(conn.connected);
      setLatencyMs(conn.latencyMs);
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchDataFromSupabase, addRealtimeLog]);

  // Product Actions (Direct Supabase CRUD)
  const addProduct = async (product: Partial<Product>) => {
    try {
      const payload = {
        name: product.name || 'Fresh Agricultural Produce',
        description: product.description || null,
        category_id: product.category_id || null,
        farmer_id: product.farmer_id || null,
        price_per_unit: Number(product.price_per_unit) || 0,
        unit: product.unit || 'kg',
        stock: Number(product.stock) || 0,
        harvest_date: product.harvest_date || new Date().toISOString().split('T')[0],
        farm_location: product.farm_location || null,
        image_url: product.image_url || null,
        is_active: product.is_active ?? true,
        is_available: product.is_available ?? true,
      };

      const { data, error } = await supabase.from('products').insert([payload]).select();

      if (error) {
        console.error('Supabase Product Insert Error:', error.message);
        return { success: false, error: error.message };
      }

      if (data && data[0]) {
        const cat = categories.find((c) => c.id === data[0].category_id);
        const newProduct: Product = {
          ...data[0],
          category_name: cat ? cat.name : 'Produce',
        };
        setProducts((prev) => [newProduct, ...prev.filter((p) => p.id !== newProduct.id)]);
      }

      addRealtimeLog({
        table: 'products',
        event_type: 'INSERT',
        record_id: data?.[0]?.id,
        payload,
        summary: `Admin added real produce: "${payload.name}" in Supabase`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error' };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const cleanUpdates: any = { ...updates, updated_at: new Date().toISOString() };
      delete cleanUpdates.category_name;
      delete cleanUpdates.farmer_name;

      const { error } = await supabase.from('products').update(cleanUpdates).eq('id', id);
      if (error) {
        console.error('Supabase Product Update Error:', error.message);
        return { success: false, error: error.message };
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
      );

      addRealtimeLog({
        table: 'products',
        event_type: 'UPDATE',
        record_id: id,
        payload: updates,
        summary: `Admin updated produce #${id} in Supabase`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error' };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error('Supabase Product Delete Error:', error.message);
        return { success: false, error: error.message };
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));

      addRealtimeLog({
        table: 'products',
        event_type: 'DELETE',
        record_id: id,
        payload: { id },
        summary: `Admin deleted produce #${id} from Supabase`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error' };
    }
  };

  const quickAdjustStock = async (id: string, delta: number) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return false;
    const newStock = Math.max(0, prod.stock + delta);
    return (await updateProduct(id, { stock: newStock, is_available: newStock > 0 })).success;
  };

  const toggleProductStatus = async (id: string, field: 'is_active' | 'is_available') => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return false;
    return (await updateProduct(id, { [field]: !prod[field] })).success;
  };

  // Order Actions (Direct Supabase CRUD)
  const createOrder = async (order: Partial<Order>) => {
    try {
      const qty = Number(order.quantity) || 1;
      const pricePerUnit = Number(order.price_per_unit) || 0;
      const subtotal = Number(order.subtotal_amount) || qty * pricePerUnit;
      const feePercent = order.platform_fee_percent ?? 10;
      const feeAmount = order.platform_fee_amount ?? Math.round(subtotal * (feePercent / 100));
      const totalAmount = Number(order.total_amount) || subtotal + feeAmount;
      const netFarmer = subtotal;

      const payload = {
        product_id: order.product_id || null,
        farmer_id: order.farmer_id || null,
        customer_name: order.customer_name || 'Direct Buyer',
        customer_mobile: order.customer_mobile || '',
        delivery_address: order.delivery_address || '',
        city: order.city || 'Lucknow',
        pincode: order.pincode || '226001',
        quantity: qty,
        price_per_unit: pricePerUnit,
        total_amount: totalAmount,
        status: (order.status as OrderStatus) || 'pending',
        notes: order.notes || null,
      };

      const { data, error } = await supabase.from('orders').insert([payload]).select();

      if (error) {
        console.error('Supabase Order Insert Error:', error.message);
        return { success: false, error: error.message };
      }

      if (data && data[0]) {
        const prod = products.find((p) => p.id === data[0].product_id);
        const newOrder: Order = {
          ...data[0],
          product_name: prod ? prod.name : 'Farm Produce',
          subtotal_amount: subtotal,
          platform_fee_percent: feePercent,
          platform_fee_amount: feeAmount,
          farmer_net_earnings: netFarmer,
          total_amount: totalAmount,
        };
        setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
      }

      addRealtimeLog({
        table: 'orders',
        event_type: 'INSERT',
        record_id: data?.[0]?.id,
        payload,
        summary: `Created order in Supabase for ${payload.customer_name} (Total: ₹${payload.total_amount} | Fee: ₹${feeAmount})`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error' };
    }
  };

  const updateOrderStatus = async (id: string | number, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Supabase Order Update Error:', error.message);
        return { success: false, error: error.message };
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status, updated_at: new Date().toISOString() } : o))
      );

      addRealtimeLog({
        table: 'orders',
        event_type: 'UPDATE',
        record_id: id,
        payload: { status },
        summary: `Updated order #${id} status to "${status.toUpperCase()}" in Supabase`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error' };
    }
  };

  const deleteOrder = async (id: string | number) => {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) {
        console.error('Supabase Order Delete Error:', error.message);
        return { success: false, error: error.message };
      }

      setOrders((prev) => prev.filter((o) => o.id !== id));

      addRealtimeLog({
        table: 'orders',
        event_type: 'DELETE',
        record_id: id,
        payload: { id },
        summary: `Removed order #${id} from Supabase`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error' };
    }
  };

  // Farmer Actions (Direct Supabase CRUD)
  const addFarmer = async (farmer: Partial<Farmer>) => {
    try {
      const payload = {
        farm_name: farmer.farm_name || 'Agro Farm Hub',
        farm_location: farmer.farm_location || null,
        district: farmer.district || 'Lucknow',
        state: farmer.state || 'Uttar Pradesh',
      };

      const { data, error } = await supabase.from('farmers').insert([payload]).select();

      if (error) {
        console.error('Supabase Farmer Insert Error:', error.message);
        return { success: false, error: error.message };
      }

      if (data && data[0]) {
        const newFarmer: Farmer = {
          ...data[0],
          farmer_name: farmer.farmer_name || data[0].farm_name,
          contact_number: farmer.contact_number || '',
          is_verified: true,
        };
        setFarmers((prev) => [newFarmer, ...prev.filter((f) => f.id !== newFarmer.id)]);
      }

      addRealtimeLog({
        table: 'farmers',
        event_type: 'INSERT',
        record_id: data?.[0]?.id,
        payload,
        summary: `Registered farmer in Supabase: ${payload.farm_name}`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error' };
    }
  };

  const updateFarmer = async (id: string, updates: Partial<Farmer>) => {
    try {
      const payload = {
        farm_name: updates.farm_name,
        farm_location: updates.farm_location,
        district: updates.district,
        state: updates.state,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('farmers').update(payload).eq('id', id);
      if (error) {
        console.error('Supabase Farmer Update Error:', error.message);
        return { success: false, error: error.message };
      }

      setFarmers((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...updates, updated_at: new Date().toISOString() } : f))
      );

      addRealtimeLog({
        table: 'farmers',
        event_type: 'UPDATE',
        record_id: id,
        payload: updates,
        summary: `Updated farmer profile #${id} in Supabase`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error' };
    }
  };

  const deleteFarmer = async (id: string) => {
    try {
      const { error } = await supabase.from('farmers').delete().eq('id', id);
      if (error) {
        console.error('Supabase Farmer Delete Error:', error.message);
        return { success: false, error: error.message };
      }

      setFarmers((prev) => prev.filter((f) => f.id !== id));

      addRealtimeLog({
        table: 'farmers',
        event_type: 'DELETE',
        record_id: id,
        payload: { id },
        summary: `Deleted farmer #${id} from Supabase`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error' };
    }
  };

  // Category Actions
  const addCategory = async (category: Partial<ProductCategory>) => {
    try {
      const payload = {
        name: category.name || 'New Category',
        description: category.description || null,
        is_active: category.is_active ?? true,
      };

      const { data, error } = await supabase.from('product_categories').insert([payload]).select();
      if (error) return { success: false, error: error.message };

      if (data && data[0]) {
        setCategories((prev) => [...prev, { ...data[0], icon: category.icon || '🌱' }]);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error' };
    }
  };

  const updateCategory = async (id: string, updates: Partial<ProductCategory>) => {
    try {
      const { error } = await supabase.from('product_categories').update(updates).eq('id', id);
      if (error) return { success: false, error: error.message };
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error' };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from('product_categories').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error' };
    }
  };

  // Broadcast Actions
  const addBroadcast = async (broadcast: Omit<BroadcastNotification, 'id' | 'created_at'>) => {
    try {
      const payload = {
        title: broadcast.title,
        message: broadcast.message,
        type: broadcast.type,
        is_read: false,
      };

      const { data, error } = await supabase.from('notifications').insert([payload]).select();
      if (!error && data && data[0]) {
        const newB: BroadcastNotification = {
          id: data[0].id,
          title: data[0].title,
          message: data[0].message,
          target: 'all',
          type: broadcast.type,
          is_active: true,
          created_at: data[0].created_at,
        };
        setBroadcasts((prev) => [newB, ...prev]);
      } else {
        const localB: BroadcastNotification = {
          id: 'bc-' + Date.now(),
          created_at: new Date().toISOString(),
          ...broadcast,
        };
        setBroadcasts((prev) => [localB, ...prev]);
      }
    } catch {
      const localB: BroadcastNotification = {
        id: 'bc-' + Date.now(),
        created_at: new Date().toISOString(),
        ...broadcast,
      };
      setBroadcasts((prev) => [localB, ...prev]);
    }
  };

  const deleteBroadcast = async (id: string) => {
    try {
      await supabase.from('notifications').delete().eq('id', id);
    } catch {}
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleBroadcast = async (id: string) => {
    setBroadcasts((prev) => prev.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b)));
  };

  // Export utility
  const exportData = (
    entity: 'products' | 'orders' | 'farmers' | 'categories' | 'customers',
    format: 'csv' | 'json'
  ) => {
    let rawData: any[] = [];
    if (entity === 'products') rawData = products;
    else if (entity === 'orders') rawData = orders;
    else if (entity === 'farmers') rawData = farmers;
    else if (entity === 'customers') rawData = customers;
    else if (entity === 'categories') rawData = categories;

    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rawData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `fasal_setu_${entity}_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      if (rawData.length === 0) return;
      const headers = Object.keys(rawData[0]);
      const csvRows = [
        headers.join(','),
        ...rawData.map((row) =>
          headers
            .map((header) => {
              const val = row[header];
              const escaped = typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
              return escaped ?? '';
            })
            .join(',')
        ),
      ];
      const csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvData);
      downloadAnchor.setAttribute('download', `fasal_setu_${entity}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  const clearAllData = () => {
    localStorage.removeItem('fasal_setu_products');
    localStorage.removeItem('fasal_setu_orders');
    localStorage.removeItem('fasal_setu_farmers');
    localStorage.removeItem('fasal_setu_categories');
    fetchDataFromSupabase();
  };

  // Computed Real Live Stats
  const stats: PlatformStats = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
    const totalPlatformRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((acc, o) => acc + (Number(o.platform_fee_amount) || Math.round((Number(o.total_amount) || 0) * 0.10)), 0);
    const totalFarmerPayouts = totalRevenue - totalPlatformRevenue;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const completedOrders = orders.filter((o) => o.status === 'delivered').length;
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.is_active && p.is_available && p.stock > 0).length;
    const outOfStockProducts = products.filter((p) => p.stock <= 0).length;
    const totalFarmers = farmers.length;
    const activeFarmers = farmers.filter((f) => f.is_verified ?? true).length;
    const totalCustomers = customers.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const fulfillmentRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100;

    return {
      totalRevenue,
      totalPlatformRevenue,
      totalFarmerPayouts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalProducts,
      activeProducts,
      outOfStockProducts,
      totalFarmers,
      activeFarmers,
      totalCustomers,
      avgOrderValue,
      fulfillmentRate,
    };
  }, [orders, products, farmers, customers]);

  return (
    <DataContext.Provider
      value={{
        products,
        orders,
        farmers,
        customers,
        categories,
        broadcasts,
        realtimeLogs,
        stats,
        isLiveConnected,
        isSyncing,
        latencyMs,
        lastSyncTime,
        addProduct,
        updateProduct,
        deleteProduct,
        quickAdjustStock,
        toggleProductStatus,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        addFarmer,
        updateFarmer,
        deleteFarmer,
        addCategory,
        updateCategory,
        deleteCategory,
        addBroadcast,
        deleteBroadcast,
        toggleBroadcast,
        exportData,
        clearAllData,
        refreshData: fetchDataFromSupabase,
        addRealtimeLog,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
