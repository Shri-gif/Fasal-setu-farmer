export interface Product {
  id: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  farmer_id?: string | null;
  price_per_unit: number;
  unit: string;
  stock: number;
  harvest_date?: string | null;
  farm_location?: string | null;
  image_url?: string | null;
  is_active: boolean;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
  // UI computed
  category_name?: string;
  farmer_name?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';

export interface Order {
  id: string | number;
  product_id?: string | null;
  farmer_id?: string | null;
  product_name?: string;
  customer_name: string;
  customer_mobile: string;
  delivery_address: string;
  city: string;
  pincode: string;
  quantity: number;
  price_per_unit: number;
  subtotal_amount?: number;
  platform_fee_percent?: number;
  platform_fee_amount?: number;
  farmer_net_earnings?: number;
  total_amount: number;
  status: OrderStatus;
  payment_status?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  is_active: boolean;
  created_at?: string;
  icon?: string;
  product_count?: number;
}

export interface Farmer {
  id: string;
  user_id?: string | null;
  farm_name: string;
  farm_location?: string | null;
  farming_type?: string | null;
  farm_size?: string | null;
  district?: string | null;
  state?: string | null;
  rating?: number | null;
  created_at?: string;
  updated_at?: string;
  // UI extra fields populated from profiles / orders
  farmer_name?: string;
  contact_number?: string;
  is_verified?: boolean;
  active_products_count?: number;
  total_sales_amount?: number;
}

export interface CustomerProfile {
  id: string;
  full_name: string;
  phone?: string | null;
  role?: string;
  avatar_url?: string | null;
  state?: string | null;
  city?: string | null;
  delivery_address?: string | null;
  total_orders_count?: number;
  total_spent?: number;
  created_at?: string;
  is_active?: boolean;
}

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'Super Admin' | 'Catalog Manager' | 'Operations Admin' | 'Logistics Manager';
  avatar_url?: string;
  last_login?: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  target: 'all' | 'farmers' | 'customers';
  type: 'announcement' | 'mandi_rate' | 'weather' | 'promo';
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export interface RealtimeEventLog {
  id: string;
  table: string;
  event_type: 'INSERT' | 'UPDATE' | 'DELETE' | 'SUBSCRIBE';
  record_id?: string | number;
  timestamp: string;
  payload: any;
  summary: string;
}

export interface PlatformStats {
  totalRevenue: number;
  totalPlatformRevenue: number;
  totalFarmerPayouts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  totalFarmers: number;
  activeFarmers: number;
  totalCustomers: number;
  avgOrderValue: number;
  fulfillmentRate: number;
}
