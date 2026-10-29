import React from 'react';
import { Product, ProductCategory } from '../types';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, ArrowUpDown, RotateCcw } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  selectedCategory: ProductCategory | 'All';
  onSelectCategory: (cat: ProductCategory | 'All') => void;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name';
  onSortChange: (sort: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name') => void;
  inStockOnly: boolean;
  onToggleInStock: () => void;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product, e: React.MouseEvent) => void;
  cartProductIds: Set<string>;
  wishlistProductIds: Set<string>;
  onToggleWishlist: (p: Product, e: React.MouseEvent) => void;
  onResetFilters: () => void;
  totalAvailable: number;
}

const CATEGORIES: (ProductCategory | 'All')[] = [
  'All',
  'Acoustics',
  'Lighting',
  'Seating',
  'Tableware',
  'Accessories'
];

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  inStockOnly,
  onToggleInStock,
  onSelectProduct,
  onAddToCart,
  cartProductIds,
  wishlistProductIds,
  onToggleWishlist,
  onResetFilters,
  totalAvailable
}) => {
  return (
    <div id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Category Tabs & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        {/* Interactive Segmented Filter Control */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === category
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {category === 'All' ? 'All Pieces' : category}
            </button>
          ))}
        </div>

        {/* Right Toolbar Controls: In Stock Toggle + Sort Select */}
        <div className="flex items-center gap-4 text-xs shrink-0">
          <label className="flex items-center gap-2 cursor-pointer select-none text-stone-600 hover:text-stone-900">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={onToggleInStock}
              className="rounded border-stone-300 text-stone-900 focus:ring-stone-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span>In Stock Only</span>
          </label>

          <div className="flex items-center gap-1.5 border-l border-stone-200 pl-4">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e: any) => onSortChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-stone-800 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Item count & active filter summary */}
      <div className="py-4 flex items-center justify-between text-xs text-stone-500">
        <span>
          Showing <span className="font-mono font-medium text-stone-900 tabular-nums">{products.length}</span> of{' '}
          <span className="font-mono font-medium text-stone-900 tabular-nums">{totalAvailable}</span> curated objects
        </span>
        {(selectedCategory !== 'All' || inStockOnly) && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Grid or Empty State or Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-stone-200" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-1/3 bg-stone-200 rounded" />
                <div className="h-4 w-3/4 bg-stone-200 rounded" />
                <div className="h-3 w-full bg-stone-200 rounded" />
                <div className="h-4 w-1/4 bg-stone-200 rounded pt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-2xl border border-stone-200/80 my-4">
          <p className="font-display text-lg font-semibold text-stone-900">No matching pieces found</p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
            Try adjusting your search criteria, clearing active category filters, or viewing all inventory items.
          </p>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
              isInCart={cartProductIds.has(product.id)}
              isWishlisted={wishlistProductIds.has(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};
