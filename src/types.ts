export type OrderStatus = 'new' | 'pending' | 'confirmed' | 'packed' | 'dispatched' | 'completed' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'cod' | 'failed' | 'refunded';

export interface ProductCategory {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
}

export interface FarmerProfile {
  id: string;
  user_id: string;
  farm_name: string;
  farm_location?: string | null;
  farm_size?: string | null;
  farming_type?: string | null;
  district?: string | null;
  state?: string | null;
  verification_status?: 'pending' | 'verified' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  mobile?: string;
  village?: string;
  district?: string;
  state?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  farmer_id: string;
  category_id: string;
  name: string;
  description?: string | null;
  price_per_unit: number;
  platform_fee?: number | null;
  platform_fee_type?: string | null;
  platform_fee_value?: number | null;
  customer_price?: number | null;
  unit: string;
  stock: number;
  harvest_date?: string | null;
  farm_location?: string | null;
  image_url?: string | null;
  is_active: boolean;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  farmer_id: string;
  consumer_id?: string | null;
  customer_name: string;
  customer_mobile: string;
  delivery_address: string;
  city?: string;
  pincode?: string;
  product_id: string;
  quantity: number;
  price_per_unit: number;
  subtotal: number;
  delivery_fee?: number;
  discount?: number;
  total_amount: number;
  payment_status: PaymentStatus | string;
  order_status: OrderStatus | string;
  status?: OrderStatus | string;
  delivery_slot?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  product?: Partial<Product> | null;
}
