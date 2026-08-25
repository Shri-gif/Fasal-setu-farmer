import React, { useState } from 'react';
import { Product, ProductCategory } from '../types';
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, AlertTriangle, MapPin, Package, RefreshCw } from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  categories: ProductCategory[];
  onNavigate: (tab: string, productId?: string) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleAvailability: (productId: string, current: boolean) => void;
  onQuickUpdateStock: (productId: string, newStock: number) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  onNavigate,
  onDeleteProduct,
  onToggleAvailability,
  onQuickUpdateStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Metrics
  const totalCount = products.length;
  const availableCount = products.filter((p) => p.is_available && Number(p.stock) > 0).length;
  const outOfStockCount = products.filter((p) => !p.is_available || Number(p.stock) <= 0).length;

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.farm_location && product.farm_location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      product.category_id === selectedCategory ||
      (selectedCategory === 'vegetables' && product.category_id.includes('veg')) ||
      (selectedCategory === 'fruits' && product.category_id.includes('fruit')) ||
      (selectedCategory === 'grains' && product.category_id.includes('grain'));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <span>🥕</span> Produce Catalog
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Farm Products (मेरी फसलें)
          </h1>
          <p className="text-xs text-slate-500">
            Control your pricing, inventory stock, and customer availability
          </p>
        </div>

        <button
          onClick={() => onNavigate('add-product')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-xs active:scale-95 transition-all"
          id="products-add-btn"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Items</span>
          <strong className="text-xl font-black text-slate-900">{totalCount}</strong>
        </div>
        <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 text-center">
          <span className="text-[11px] font-semibold text-emerald-800 block">🟢 Available</span>
          <strong className="text-xl font-black text-emerald-800">{availableCount}</strong>
        </div>
        <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200 text-center">
          <span className="text-[11px] font-semibold text-rose-800 block">🔴 Out of Stock</span>
          <strong className="text-xl font-black text-rose-800">{outOfStockCount}</strong>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by produce name, location, or variety..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
        >
          <option value="all">All Categories (सभी श्रेणियां)</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon || '🌱'} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <div className="text-5xl mb-3">🌱</div>
          <h2 className="text-base font-bold text-slate-800">No Products Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || selectedCategory !== 'all'
              ? 'No produce matched your search filters. Try clearing the search query.'
              : 'You have not listed any farm products yet. Start listing to receive customer orders.'}
          </p>
          <button
            onClick={() => onNavigate('add-product')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.map((product) => {
            const categoryName = categoryMap.get(product.category_id) || 'Produce';
            const isAvailable = product.is_available && Number(product.stock) > 0;

            return (
              <article
                key={product.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                  isAvailable ? 'border-slate-200/80 shadow-xs' : 'border-slate-200 bg-slate-50/50 opacity-90'
                }`}
              >
                <div>
                  {/* Image / Fallback Header */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden flex items-center justify-center">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-6xl select-none">🌾</span>
                    )}

                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-emerald-900 shadow-xs backdrop-blur border border-emerald-100">
                        {categoryName}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <button
                        onClick={() => onToggleAvailability(product.id, product.is_available)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs backdrop-blur transition-all flex items-center gap-1 ${
                          isAvailable
                            ? 'bg-emerald-600/90 text-white'
                            : 'bg-rose-600/90 text-white'
                        }`}
                        title="Toggle customer visibility"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        {isAvailable ? 'Available' : 'Paused / Sold Out'}
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {product.name}
                      </h3>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-black text-emerald-800">
                          ₹{Number(product.price_per_unit).toLocaleString('en-IN')}
                        </div>
                        <span className="text-[11px] text-slate-500">per {product.unit}</span>
                      </div>
                    </div>

                    {product.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    )}

                    {product.farm_location && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2">
                        <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{product.farm_location}</span>
                      </div>
                    )}

                    {/* Stock quick controller */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-slate-500" />
                        Stock in hand:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onQuickUpdateStock(product.id, Math.max(0, Number(product.stock) - 5))}
                          className="w-6 h-6 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                          title="Decrease 5 units"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-900 min-w-[40px] text-center">
                          {product.stock} {product.unit}
                        </span>
                        <button
                          onClick={() => onQuickUpdateStock(product.id, Number(product.stock) + 10)}
                          className="w-6 h-6 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                          title="Add 10 units"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 pt-0 flex gap-2">
                  <button
                    onClick={() => onNavigate('add-product', product.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Produce</span>
                  </button>

                  {deleteConfirmId === product.id ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          onDeleteProduct(product.id);
                          setDeleteConfirmId(null);
                        }}
                        className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="py-2 px-2.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(product.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
