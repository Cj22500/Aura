import React from 'react';
import { ShoppingBag, Search, SlidersHorizontal, Package, RefreshCw, Heart } from 'lucide-react';
import { ProductCategory } from '../types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  isWishlistView?: boolean;
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
  ordersCount: number;
  activeCategory: ProductCategory | 'All';
  onSelectCategory: (cat: ProductCategory | 'All') => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onResetDb: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  isWishlistView,
  onOpenAdmin,
  onOpenOrders,
  ordersCount,
  activeCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange,
  onResetDb,
  isResetting
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAFAF9]/95 backdrop-blur-md border-b border-[#E7E5E4] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand wordmark (single text element wordmark) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectCategory('All')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="font-display text-2xl font-bold tracking-tight text-stone-900 whitespace-nowrap block">
                AURA
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500 block">
                Living & Acoustics
              </span>
            </button>
          </div>

          {/* Zone 2: 4-5 clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            {(['All', 'Acoustics', 'Lighting', 'Seating', 'Tableware'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer relative ${
                  activeCategory === cat && !isWishlistView
                    ? 'text-stone-950 font-semibold'
                    : 'hover:text-stone-900 text-stone-600'
                }`}
              >
                {cat === 'All' ? 'Complete Collection' : cat}
                {activeCategory === cat && !isWishlistView && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-stone-900" />
                )}
              </button>
            ))}

            {/* My Wishlist Tab */}
            <button
              onClick={onOpenWishlist}
              className={`transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer relative flex items-center gap-1.5 ${
                isWishlistView
                  ? 'text-stone-950 font-semibold'
                  : 'hover:text-stone-900 text-stone-600'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${wishlistCount > 0 ? 'text-rose-600 fill-rose-500' : 'text-stone-400'}`} />
              <span>My Wishlist</span>
              {wishlistCount > 0 && (
                <span className="font-mono text-[10px] bg-rose-100 text-rose-700 font-semibold px-1.5 py-0.2 rounded-full tabular-nums">
                  {wishlistCount}
                </span>
              )}
              {isWishlistView && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-stone-900" />
              )}
            </button>
          </nav>

          {/* Zone 3: Search, Admin CRUD button, Orders, Wishlist, and Cart button */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative hidden sm:block w-48 lg:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-100/80 hover:bg-stone-100 focus:bg-white border border-stone-200 focus:border-stone-400 rounded-md outline-none text-stone-900 transition-all placeholder:text-stone-400"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
                >
                  ×
                </button>
              )}
            </div>

            {/* Inventory Operations (Admin CRUD trigger) */}
            <button
              onClick={onOpenAdmin}
              title="Manage product inventory (Create, Edit, Delete CRUD)"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Manage Catalog</span>
            </button>

            {/* Orders History Trigger */}
            <button
              onClick={onOpenOrders}
              title="View placed orders"
              className="relative p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4" />
              {ordersCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-semibold text-white bg-amber-700 rounded-full tabular-nums">
                  {ordersCount}
                </span>
              )}
            </button>

            {/* Wishlist Quick Trigger */}
            <button
              onClick={onOpenWishlist}
              title="View My Wishlist"
              className="relative p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'text-rose-600 fill-rose-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-semibold text-white bg-rose-600 rounded-full tabular-nums">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="tabular-nums font-mono">{cartCount}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
