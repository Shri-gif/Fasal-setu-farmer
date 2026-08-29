import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../types';
import { supabase } from '../supabase';
import { ArrowLeft, Save, Sparkles, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface AddProductViewProps {
  editProductId?: string | null;
  products: Product[];
  categories: ProductCategory[];
  onSaveProduct: (productData: Partial<Product>) => Promise<boolean>;
  onNavigate: (tab: string) => void;
  defaultFarmLocation: string;
}

const POPULAR_PRESETS = [
  { name: 'Fresh Desi Tomato (देसी टमाटर)', cat: 'cat-veg', unit: 'kg', price: 35, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80' },
  { name: 'Red Onions (लाल प्याज)', cat: 'cat-veg', unit: 'kg', price: 30, img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80' },
  { name: 'Farm Fresh Potatoes (आलू)', cat: 'cat-veg', unit: 'kg', price: 25, img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sharbati Wheat (शरबती गेहूं)', cat: 'cat-grain', unit: 'kg', price: 42, img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80' },
  { name: 'Pure Mustard Oil / Seeds (सरसों)', cat: 'cat-spice', unit: 'litre', price: 160, img: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80' },
];

export const AddProductView: React.FC<AddProductViewProps> = ({
  editProductId,
  products,
  categories,
  onSaveProduct,
  onNavigate,
  defaultFarmLocation,
}) => {
  const existingProduct = editProductId ? products.find((p) => p.id === editProductId) : null;

  const [name, setName] = useState(existingProduct?.name || '');
  const [categoryId, setCategoryId] = useState(existingProduct?.category_id || categories[0]?.id || '');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const getInitialFarmerPrice = (product: Product | null) => {
    if (!product) return '';
    if (product.customer_price != null && product.platform_fee != null) {
      return String(Number(product.customer_price) - Number(product.platform_fee));
    }
    return String(product.price_per_unit);
  };

  const [price, setPrice] = useState<string>(getInitialFarmerPrice(existingProduct));
  const [platformFeeType, setPlatformFeeType] = useState<'percentage' | 'fixed'>('percentage');
  const [platformFeeValue, setPlatformFeeValue] = useState(0);
  const [unit, setUnit] = useState(existingProduct?.unit || 'kg');
  const [stock, setStock] = useState<string>(existingProduct ? String(existingProduct.stock) : '50');
  const [harvestDate, setHarvestDate] = useState(
    existingProduct?.harvest_date || new Date().toISOString().split('T')[0]
  );
  const [farmLocation, setFarmLocation] = useState(
    existingProduct?.farm_location || defaultFarmLocation || 'Lakhimpur Kheri, Uttar Pradesh'
  );
  const [imageUrl, setImageUrl] = useState(existingProduct?.image_url || '');
  const [isAvailable, setIsAvailable] = useState(existingProduct ? existingProduct.is_available : true);

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setCategoryId(existingProduct.category_id);
      setDescription(existingProduct.description || '');
      setPrice(getInitialFarmerPrice(existingProduct));
      setUnit(existingProduct.unit || 'kg');
      setStock(String(existingProduct.stock));
      setHarvestDate(existingProduct.harvest_date || new Date().toISOString().split('T')[0]);
      setFarmLocation(existingProduct.farm_location || defaultFarmLocation);
      setImageUrl(existingProduct.image_url || '');
      setIsAvailable(existingProduct.is_available);
    }
  }, [existingProduct, defaultFarmLocation]);

  useEffect(() => {
    let cancelled = false;

    const loadPlatformFee = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('platform_fee, platform_fee_type')
          .eq('id', 1)
          .maybeSingle();

        if (error) throw error;

        if (!cancelled && data) {
          const value = Number(data.platform_fee ?? 0);
          const type = String(data.platform_fee_type ?? 'percentage').toLowerCase();
          setPlatformFeeValue(Number.isFinite(value) ? value : 0);
          setPlatformFeeType(type === 'fixed' || type === 'fixed_amount' || type === 'fixed amount' ? 'fixed' : 'percentage');
        }
      } catch (error) {
        console.warn('Platform fee could not be loaded:', error);
        if (!cancelled) {
          setPlatformFeeValue(0);
          setPlatformFeeType('percentage');
        }
      }
    };

    loadPlatformFee();

    return () => {
      cancelled = true;
    };
  }, []);

  const farmerPrice = Number(price) || 0;
  const calculatedPlatformFee = platformFeeType === 'fixed'
    ? platformFeeValue
    : (farmerPrice * platformFeeValue) / 100;
  const totalProductPrice = Math.round((farmerPrice + calculatedPlatformFee + Number.EPSILON) * 100) / 100;

  const handleApplyPreset = (preset: typeof POPULAR_PRESETS[0]) => {
    setName(preset.name);
    if (categories.some((c) => c.id === preset.cat)) {
      setCategoryId(preset.cat);
    }
    setUnit(preset.unit);
    setPrice(String(preset.price));
    if (!imageUrl) {
      setImageUrl(preset.img);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (!name.trim()) {
      setFormError('Please enter the crop / product name.');
      return;
    }

    if (!categoryId) {
      setFormError('Please select a valid crop category.');
      return;
    }

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError('Please provide a valid price per unit (greater than 0).');
      return;
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      setFormError('Please enter a valid stock quantity (0 or greater).');
      return;
    }

    setIsSaving(true);

    try {
      const payload: Partial<Product> = {
        ...(existingProduct ? { id: existingProduct.id } : {}),
        name: name.trim(),
        category_id: categoryId,
        description: description.trim() || null,
        // Send the farmer's base price to App.tsx.
        // App.tsx applies the latest platform fee and saves the final price.
        price_per_unit: parsedPrice,
        unit: unit,
        stock: parsedStock,
        harvest_date: harvestDate || null,
        farm_location: farmLocation.trim() || null,
        image_url: imageUrl.trim() || null,
        is_available: isAvailable,
        is_active: true,
      };

      const success = await onSaveProduct(payload);

      if (success) {
        setSuccessMessage(
          existingProduct
            ? 'Produce updated successfully! Redirecting...'
            : 'New produce listed successfully! Redirecting...'
        );
        setTimeout(() => {
          onNavigate('products');
        }, 800);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-14">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => onNavigate('products')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </button>

        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          {existingProduct ? '✏️ Edit Mode' : '🌱 New Listing'}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {existingProduct ? 'Update Produce Details' : 'List Farm Produce (फसल जोड़ें)'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide harvest details, packaging unit, and prices for direct customer delivery
          </p>
        </div>

        {/* Popular Presets Shortcut */}
        {!existingProduct && (
          <div className="mb-6 p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
            <span className="text-[11px] font-bold text-emerald-900 block mb-2">
              ⚡ Quick Fill Popular Indian Harvests:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 border border-emerald-200 text-[11px] font-medium text-emerald-950 transition-colors shadow-2xs"
                >
                  {preset.name.split('(')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error / Success Feedback */}
        {formError && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" id="productForm">
          {/* Produce Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Produce Name (फसल का नाम) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fresh Organic Tomatoes (देसी टमाटर)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Category (श्रेणी) *
            </label>
            <select
              value={categoryId}
              required
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon || '🌱'} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Description & Quality Notes (विवरण)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell buyers about farming method, freshness, aroma, or specialty..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            ></textarea>
          </div>

          {/* Price and Unit Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Price (मूल्य ₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 40"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Selling Unit (इकाई) *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
              >
                <option value="kg">kg (किलोग्राम)</option>
                <option value="gram">gram (ग्राम)</option>
                <option value="quintal">quintal (क्विंटल)</option>
                <option value="piece">piece (नग / प्रति फल)</option>
                <option value="dozen">dozen (दर्जन)</option>
                <option value="litre">litre (लीटर)</option>
                <option value="box">box / crate (पेटी / टोकरा)</option>
              </select>
            </div>
          </div>

          {/* Final Customer Price */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-700">Your Product Price</span>
              <span className="font-bold text-slate-900">₹{farmerPrice.toLocaleString('en-IN')} / {unit}</span>
            </div>
            <div className="flex items-center justify-between gap-3 mt-2 text-sm">
              <span className="font-semibold text-slate-700">Platform Fee ({platformFeeType === 'percentage' ? `${platformFeeValue}%` : 'fixed'})</span>
              <span className="font-bold text-slate-900">+ ₹{calculatedPlatformFee.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center justify-between gap-3">
              <span className="font-black text-emerald-900">Total Customer Price</span>
              <span className="text-xl font-black text-emerald-800">₹{totalProductPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })} / {unit}</span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-2">This final price will be shown to customers.</p>
          </div>

          {/* Stock and Harvest Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Available Stock ({unit}) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="e.g. 100"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Harvest Date (कटाई की तारीख)
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Farm Location */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Farm Location (खेत का पता / जिला)
            </label>
            <input
              type="text"
              value={farmLocation}
              onChange={(e) => setFarmLocation(e.target.value)}
              placeholder="e.g. Lakhimpur Kheri, Uttar Pradesh"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Image URL & Live Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Produce Image URL (तस्वीर लिंक)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/tomato.jpg"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {imageUrl && (
              <div className="mt-2.5 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-14 h-14 object-cover rounded-lg bg-slate-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80';
                  }}
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Image Preview</span>
                  <span className="text-[11px] text-emerald-700">Valid URL preview attached</span>
                </div>
              </div>
            )}
          </div>

          {/* Visibility Toggle */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
              <div>
                <strong className="text-xs font-bold text-emerald-950 block">
                  Publish to Customer Marketplace (उपलब्ध है)
                </strong>
                <span className="text-[11px] text-emerald-800/80">
                  When checked, customers in your radius can discover and order this harvest.
                </span>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-black text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            id="saveProductBtn"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSaving
                ? 'Saving Produce...'
                : existingProduct
                ? 'Update Produce →'
                : 'List Produce for Sale →'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
