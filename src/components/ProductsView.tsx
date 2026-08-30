import React, { useState } from 'react';
import { Plus, Search, Filter, Trash2, Edit3, CheckCircle2, AlertCircle, Eye, Calculator, IndianRupee, Layers } from 'lucide-react';
import { Product, PlatformSetting, Language } from '../types';
import { PRODUCT_CATEGORIES } from '../data/mockData';

interface ProductsViewProps {
  products: Product[];
  platformSetting: PlatformSetting;
  onAddNew: () => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  language: Language;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  platformSetting,
  onAddNew,
  onEdit,
  onDelete,
  language,
}) => {
  const isHi = language === 'hi';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.title_hi && p.title_hi.includes(searchTerm)) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif tracking-tight flex items-center gap-2">
            <span>{isHi ? 'मेरी फसलें और उत्पाद सूची' : 'My Listed Crops & Products'}</span>
            <span className="text-xs font-sans bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              {products.length} {isHi ? 'फसलें' : 'Crops'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {isHi ? 'सुपाबेस 10% शुल्क और GST के साथ पारदर्शी बाजार मूल्य' : 'Live pricing with Supabase 10% platform fee & GST transparency'}
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>{isHi ? 'नई फसल जोड़ें (Add Product)' : 'List New Crop'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isHi ? 'फसल का नाम या श्रेणी खोजें (उदा. गेहूं, सरसों, चना)...' : 'Search crop name, variety, category...'}
            className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {isHi ? 'सभी श्रेणियां' : 'All Categories'}
          </button>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {isHi ? cat.name_hi.split(' ')[0] : cat.name_en.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500 space-y-3">
          <Layers className="w-10 h-10 mx-auto text-stone-400" />
          <h3 className="text-base font-bold text-stone-800">
            {isHi ? 'कोई फसल सूची नहीं मिली' : 'No crops found matching criteria'}
          </h3>
          <p className="text-xs max-w-sm mx-auto">
            {isHi ? 'नया उत्पाद जोड़ने के लिए ऊपर "नई फसल जोड़ें" बटन दबाएं।' : 'Click "List New Crop" to add your harvested produce.'}
          </p>
          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isHi ? 'पहली फसल जोड़ें' : 'Add First Crop'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-stone-200 hover:border-emerald-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Crop Image & Badges */}
                <div className="relative h-44 bg-stone-100 overflow-hidden">
                  <img
                    src={prod.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
                  
                  {/* Top Quality Badge */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="bg-white/95 backdrop-blur-xs text-amber-800 border border-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md shadow-xs">
                      Grade: {prod.quality_grade}
                    </span>
                    <span className="bg-emerald-800/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                      {isHi ? 'स्टॉक' : 'Stock'}: {prod.quantity_available} {prod.unit}
                    </span>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => onEdit(prod)}
                      className="p-1.5 bg-white/90 hover:bg-white text-stone-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                      title={isHi ? 'संशोधन करें' : 'Edit'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(prod.id)}
                      className="p-1.5 bg-white/90 hover:bg-rose-50 text-rose-600 rounded-lg shadow-xs transition-colors cursor-pointer"
                      title={isHi ? 'हटाएं' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Category Pill on bottom of image */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[11px] font-bold text-white bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-md">
                      {prod.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-stone-900 line-clamp-1">
                      {isHi && prod.title_hi ? prod.title_hi : prod.title}
                    </h3>
                    {prod.title_hi && prod.title !== prod.title_hi && (
                      <p className="text-xs text-stone-500 line-clamp-1">{prod.title}</p>
                    )}
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">{prod.description}</p>
                  </div>

                  {/* PRICE BREAKDOWN TICKET (Supabase 10% + GST) */}
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-600 font-medium">{isHi ? 'आपकी तय कीमत (मूल):' : 'Farmer Base Price:'}</span>
                      <span className="font-bold text-emerald-700 font-mono text-sm">
                        ₹{prod.farmer_base_price.toLocaleString('en-IN')} / {prod.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span className="flex items-center gap-1 font-medium">
                        <span className="text-amber-800">+ 10% Fee (Supabase):</span>
                      </span>
                      <span className="text-amber-700 font-mono font-bold">
                        +₹{prod.platform_fee_amount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span className="text-blue-800 font-medium">+ GST ({prod.gst_rate}%):</span>
                      <span className="text-blue-700 font-mono font-bold">
                        +₹{prod.gst_amount}
                      </span>
                    </div>

                    <div className="border-t border-stone-200 pt-1.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-700">{isHi ? 'खरीदार मूल्य:' : 'Buyer Price:'}</span>
                      <span className="text-base font-extrabold text-stone-900 font-mono">
                        ₹{prod.final_buyer_price.toLocaleString('en-IN')} <span className="text-xs font-normal text-stone-500">/{prod.unit}</span>
                      </span>
                    </div>
                  </div>

                  {/* Location & Min Order */}
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                    <span>{isHi ? 'न्यूनतम ऑर्डर:' : 'Min Order:'} {prod.min_order_qty} {prod.unit}</span>
                    <span>📍 {prod.location}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Guarantee Banner */}
              <div className="p-3 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isHi ? 'किसान को मिलेंगे:' : 'Farmer Net Share:'}
                </span>
                <span className="font-extrabold text-emerald-700 font-mono">
                  ₹{prod.farmer_base_price.toLocaleString('en-IN')} / {prod.unit} (100%)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
