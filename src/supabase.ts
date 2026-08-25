import { createClient } from '@supabase/supabase-js';
import type { ProductCategory, Product, Order, FarmerProfile, UserProfile } from './types';

export const SUPABASE_URL = "https://iyurbpfsvqzmdyaqinqi.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5dXJicGZzdnF6bWR5YXFpbnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjkyODUsImV4cCI6MjEwMjkwNTI4NX0.QiHk-cjLDETbK385RqW3R40A3ePpTn1B0XgN4FOJs2Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

    
    
