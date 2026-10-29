import React from 'react';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { ProductArtwork } from './ProductArtwork';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onClearWishlist: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onAddAllToCart: () => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onClearWishlist,
  onAddToCart,
  onAddAllToCart,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-500" />
            <h2 className="font-display text-lg font-bold text-stone-900">My Wishlist</h2>
            <span className="text-xs font-mono text-stone-500 tabular-nums">
              ({wishlistProducts.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {wishlistProducts.length > 0 && (
              <button
                onClick={onClearWishlist}
                className="text-xs text-stone-400 hover:text-stone-700 transition-colors cursor-pointer mr-1"
                title="Clear all saved pieces"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-900 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                <Heart className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-stone-800">Your wishlist is empty</p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                Explore our curated acoustic and living collection and click the heart icon on any piece to save it here.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
              >
                Discover Collection
              </button>
            </div>
          ) : (
            wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="flex gap-4 p-3 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 transition-colors"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="w-20 h-20 rounded-lg overflow-hidden bg-stone-200 shrink-0 cursor-pointer"
                >
                  <ProductArtwork type={product.imageType} aspectRatio="1:1" />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        onClick={() => {
                          onSelectProduct(product);
                          onClose();
                        }}
                        className="text-xs font-semibold text-stone-900 truncate hover:text-amber-900 cursor-pointer"
                      >
                        {product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveFromWishlist(product.id)}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                      <span>{product.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className={product.stock > 0 ? 'text-emerald-700' : 'text-amber-700'}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>

                  {/* Price & Move to Bag button */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-mono text-xs font-bold text-stone-900 tabular-nums">
                      ${product.price.toFixed(2)}
                    </span>

                    <button
                      onClick={() => onAddToCart(product, 1)}
                      disabled={!product.inStock}
                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:text-stone-500 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {wishlistProducts.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50/70 space-y-3">
            <button
              onClick={onAddAllToCart}
              className="w-full py-3 px-4 rounded-lg font-semibold text-sm text-white bg-stone-900 hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Move All Available to Bag</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
