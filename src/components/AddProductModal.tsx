import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2, Calculator, Info, Image as ImageIcon } from 'lucide-react';
import { Product, PlatformSetting, Language } from '../types';
import { PRODUCT_CATEGORIES } from '../data/mockData';
import { calculateProductPrices } from '../supabase';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  editingProduct?: Product | null;
  platformSetting: PlatformSetting;
  farmerId: string;
  language: Language;
}

const SAMPLE_CROP_IMAGES: { [key: string]: string[] } = {
  grains: [
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  ],
  oilseeds: [
    'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
  ],
  pulses: [
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=600&q=80',
  ],
  vegetables: [
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
  ],
  dairy_honey: [
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80',
  ],
  spices: [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  ],
  fruits: [
    'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80',
  ]
};

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  platformSetting,
  farmerId,
  language,
}) => {
  const isHi = language === 'hi';

  const [categoryId, setCategoryId] = useState('grains');
  const [title, setTitle] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [description, setDescription] = useState('');
  const [farmerBasePrice, setFarmerBasePrice] = useState<number | ''>(2500);
  const [gstRate, setGstRate] = useState<number>(5);
  const [quantity, setQuantity] = useState<number | ''>(50);
  const [unit, setUnit] = useState('quintal');
  const [minOrderQty, setMinOrderQty] = useState<number | ''>(1);
  const [qualityGrade, setQualityGrade] = useState<'A' | 'B' | 'Organic' | 'Standard'>('A');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().slice(0, 10));
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState('Kanpur, Uttar Pradesh');

  useEffect(() => {
    if (editingProduct) {
      setCategoryId(editingProduct.category_id || 'grains');
      setTitle(editingProduct.title);
      setTitleHi(editingProduct.title_hi || '');
      setDescription(editingProduct.description);
      setFarmerBasePrice(editingProduct.farmer_base_price);
      setGstRate(editingProduct.gst_rate);
      setQuantity(editingProduct.quantity_available);
      setUnit(editingProduct.unit);
      setMinOrderQty(editingProduct.min_order_qty);
      setQualityGrade(editingProduct.quality_grade);
      setHarvestDate(editingProduct.harvest_date);
      setImageUrl(editingProduct.images?.[0] || '');
      setLocation(editingProduct.location);
    } else {
      // Reset form
      setCategoryId('grains');
      setTitle('');
      setTitleHi('');
      setDescription('');
      setFarmerBasePrice(2500);
      setGstRate(5);
      setQuantity(50);
      setUnit('quintal');
      setMinOrderQty(1);
      setQualityGrade('A');
      setHarvestDate(new Date().toISOString().slice(0, 10));
      setImageUrl(SAMPLE_CROP_IMAGES.grains[0]);
      setLocation('Kanpur, Uttar Pradesh');
    }
  }, [editingProduct, isOpen]);

  // When category changes, auto-update GST rate and default unit
  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId);
    const cat = PRODUCT_CATEGORIES.find(c => c.id === catId);
    if (cat) {
      setGstRate(cat.gst_rate);
      setUnit(cat.unit);
      const sampleImg = SAMPLE_CROP_IMAGES[catId]?.[0] || SAMPLE_CROP_IMAGES.grains[0];
      setImageUrl(sampleImg);
    }
  };

  // Price calculations using Supabase Platform Fee
  const priceCalculations = calculateProductPrices(
    Number(farmerBasePrice) || 0,
    platformSetting.platform_fee,
    gstRate
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const catObj = PRODUCT_CATEGORIES.find(c => c.id === categoryId);
    const fallbackImage = SAMPLE_CROP_IMAGES[categoryId]?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80';

    const newProduct: Product = {
      id: editingProduct?.id || `prod_${Date.now()}`,
      farmer_id: farmerId,
      category_id: categoryId,
      title: title.trim(),
      title_hi: titleHi.trim() || title.trim(),
      description: description.trim() || 'Direct from farm fresh harvest.',
      category: catObj?.name_en || 'Crops',
      farmer_base_price: priceCalculations.farmerBasePrice,
      platform_fee_percentage: platformSetting.platform_fee,
      platform_fee_amount: priceCalculations.platformFeeAmount,
      gst_rate: priceCalculations.gstRate,
      gst_amount: priceCalculations.gstAmount,
      final_buyer_price: priceCalculations.finalBuyerPrice,
      quantity_available: Number(quantity) || 1,
      unit,
      min_order_qty: Number(minOrderQty) || 1,
      harvest_date: harvestDate,
      quality_grade: qualityGrade,
      images: [imageUrl || fallbackImage],
      is_active: true,
      location,
      created_at: editingProduct?.created_at || new Date().toISOString(),
    };

    onSave(newProduct);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white border border-stone-200 text-stone-900 rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shadow-xs font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-serif">
                {editingProduct 
                  ? (isHi ? 'फसल सूची में बदलाव करें' : 'Edit Crop Listing')
                  : (isHi ? 'नई फसल / उत्पाद जोड़ें' : 'List New Crop / Product')}
              </h2>
              <p className="text-xs text-stone-500">
                {isHi ? 'सुपाबेस 10% शुल्क और GST का स्वचालित पारदर्शी मूल्य निर्धारण' : 'Automatic Supabase 10% Platform Fee & GST Pricing'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              {isHi ? 'श्रेणी (Category)' : 'Product Category'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all flex flex-col justify-between cursor-pointer ${
                    categoryId === cat.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <span className="font-bold block truncate">{isHi ? cat.name_hi : cat.name_en}</span>
                  <span className="text-[10px] text-stone-500 mt-1">
                    GST: {cat.gst_rate}% • {cat.unit}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Titles & Quality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isHi ? 'फसल का नाम (अंग्रेज़ी में)' : 'Crop Title (English)'} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sharbati Gold Wheat 100% Pure"
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isHi ? 'फसल का नाम (हिन्दी में)' : 'Crop Title (Hindi)'}
              </label>
              <input
                type="text"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                placeholder="उदा. शरबती गेहूं सुपर क्वालिटी"
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* DYNAMIC PRICING ENGINE - CORE REQUIREMENT */}
          <div className="bg-stone-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <h3 className="text-sm font-bold text-emerald-900">
                  {isHi ? 'स्मार्ट मूल्य और कर कैलकुलेटर (Supabase 10% + GST)' : 'Smart Pricing & Tax Engine (Supabase 10% + GST)'}
                </h3>
              </div>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                {isHi ? 'पारदर्शी फॉर्मूला' : 'Transparent Formula'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {/* Farmer Base Price Input */}
              <div className="bg-white border border-emerald-300 rounded-xl p-3 shadow-xs">
                <label className="block text-xs font-bold text-emerald-800 mb-1">
                  {isHi ? '1. आपकी तय कीमत (मूल भाव)' : '1. Your Base Price (You Get)'} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-500 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={farmerBasePrice}
                    onChange={(e) => setFarmerBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-7 pr-3 py-2 text-base font-extrabold text-emerald-800 focus:outline-none focus:border-emerald-500"
                    placeholder="2500"
                  />
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  प्रति {unit} (Per {unit})
                </p>
              </div>

              {/* Platform Fee Display (Fetched from Supabase Platform Settings: 10%) */}
              <div className="bg-white border border-amber-300 rounded-xl p-3 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-amber-800">
                    {isHi ? '2. सुपाबेस प्लेटफॉर्म शुल्क' : '2. Supabase Platform Fee'}
                  </label>
                  <span className="text-xs bg-amber-100 text-amber-800 border border-amber-200 font-bold px-1.5 rounded">
                    {platformSetting.platform_fee}%
                  </span>
                </div>
                <div className="text-base font-extrabold text-amber-800 py-2">
                  + ₹{priceCalculations.platformFeeAmount.toFixed(2)}
                </div>
                <p className="text-[10px] text-stone-500">
                  {isHi ? 'तकनीक, वेयरहाउस और भुगतान सुरक्षा' : 'Tech, security & mandi logistics'}
                </p>
              </div>

              {/* GST Rate Selector */}
              <div className="bg-white border border-blue-300 rounded-xl p-3 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-blue-800">
                    {isHi ? '3. वस्तु एवं सेवा कर (GST)' : '3. GST Slab Rate'}
                  </label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="bg-stone-50 border border-stone-300 text-blue-900 text-xs rounded px-1.5 py-0.5 font-bold"
                  >
                    <option value={0}>0% (कच्ची सब्जियां/फल)</option>
                    <option value={5}>5% (गेहूं, दालें, सरसों)</option>
                    <option value={12}>12% (गुड़, प्रोसेस्ड)</option>
                    <option value={18}>18% (विशेष उत्पाद)</option>
                  </select>
                </div>
                <div className="text-base font-extrabold text-blue-800 py-2">
                  + ₹{priceCalculations.gstAmount.toFixed(2)}
                </div>
                <p className="text-[10px] text-stone-500">
                  {isHi ? 'सरकारी कर चालान नियमानुसार' : 'Calculated on taxable subtotal'}
                </p>
              </div>
            </div>

            {/* LIVE FINAL PRICE TICKET & FARMER GUARANTEE */}
            <div className="bg-white border border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div>
                <div className="text-xs text-stone-500 uppercase tracking-wider font-bold">
                  {isHi ? 'खरीदार को दिखने वाला कुल मूल्य (Total Buyer Price)' : 'Customer / Buyer Listing Price'}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 flex items-baseline gap-1.5">
                  <span>₹{priceCalculations.finalBuyerPrice.toLocaleString('en-IN')}</span>
                  <span className="text-xs font-normal text-stone-500">/ {unit}</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  ₹{priceCalculations.farmerBasePrice} (मूल) + ₹{priceCalculations.platformFeeAmount} (10% शुल्क) + ₹{priceCalculations.gstAmount} (GST)
                </div>
              </div>

              <div className="w-full sm:w-auto bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-center sm:text-right">
                <span className="text-[11px] font-bold text-emerald-800 flex items-center justify-center sm:justify-end gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isHi ? 'किसान को पूरा भुगतान मिलेगा:' : 'Farmer Net Payout (100%):'}
                </span>
                <span className="text-xl font-black text-emerald-800 block">
                  ₹{priceCalculations.farmerReceives.toLocaleString('en-IN')} / {unit}
                </span>
                <span className="text-[10px] text-emerald-700">
                  {isHi ? 'बिना किसी हिडन कटौती के' : 'Zero hidden cuts from base price'}
                </span>
              </div>
            </div>
          </div>

          {/* Stock, Unit, Min Order, Grade */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isHi ? 'कुल उपलब्ध मात्रा' : 'Available Stock'} *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isHi ? 'मापक इकाई' : 'Unit'}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-emerald-500"
              >
                <option value="quintal">क्विंटल (Quintal - 100kg)</option>
                <option value="kg">किलोग्राम (Kg)</option>
                <option value="ton">टन (Ton)</option>
                <option value="crate">क्रेट (Crate)</option>
                <option value="litre">लीटर (Litre)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isHi ? 'न्यूनतम ऑर्डर' : 'Min Order Qty'}
              </label>
              <input
                type="number"
                min="1"
                value={minOrderQty}
                onChange={(e) => setMinOrderQty(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isHi ? 'गुणवत्ता ग्रेड' : 'Quality Grade'}
              </label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value as any)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-emerald-500"
              >
                <option value="A">Grade A (प्रीमियम)</option>
                <option value="Organic">Organic (जैविक प्रमाणित)</option>
                <option value="Standard">Standard (सामान्य)</option>
                <option value="B">Grade B (औद्योगिक)</option>
              </select>
            </div>
          </div>

          {/* Harvest Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isHi ? 'कटाई / तैयार होने की तारीख' : 'Harvest Date'}
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isHi ? 'खेत / वेयरहाउस का स्थान' : 'Storage / Farm Location'}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bithoor, Kanpur (UP)"
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {isHi ? 'फसल / उत्पाद का विवरण' : 'Description & Variety Details'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isHi ? 'फसल की गुणवत्ता, नमी की मात्रा, जैविक प्रमाणन आदि लिखें...' : 'Mention moisture level, packing type, certifications...'}
              className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Photo Selection / URL */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {isHi ? 'फसल की तस्वीर (Select or Enter Image URL)' : 'Crop Image'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-500"
              />
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="w-10 h-10 rounded-lg object-cover border border-stone-300" 
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              )}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-sm font-bold transition-colors cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingProduct ? (isHi ? 'अपडेट सेव करें' : 'Save Changes') : (isHi ? 'फसल लाइव लिस्ट करें' : 'Publish Crop Listing')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
