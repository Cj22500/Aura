import React from 'react';
import { Plus, Check, Star, Heart } from 'lucide-react';
import { Product } from '../types';
import { ProductArtwork } from './ProductArtwork';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  isInCart: boolean;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  isInCart,
  isWishlisted,
  onToggleWishlist
}) => {
  return (
    <article
      onClick={() => onSelect(product)}
      className="group relative bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Visual Artwork Container */}
      <div className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden">
        <ProductArtwork type={product.imageType} aspectRatio="4:3" />

        {/* Quiet status marker (unboxed subtle flag) */}
        {product.isNew && (
          <span className="absolute top-3 left-3 text-[11px] font-semibold tracking-wider uppercase text-stone-900 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-sm shadow-2xs">
            New
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => onToggleWishlist(product, e)}
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-3 right-3 p-1.5 rounded-full transition-all cursor-pointer shadow-2xs z-10 ${
            isWishlisted
              ? 'bg-white text-rose-600 shadow-xs'
              : 'bg-white/80 text-stone-400 hover:text-stone-900 hover:bg-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 transition-transform active:scale-125 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Quick Add overlay button */}
        <div className="absolute bottom-3 right-3 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => onAddToCart(product, e)}
            disabled={!product.inStock}
            title={product.inStock ? 'Add to shopping bag' : 'Out of stock'}
            className={`p-2.5 rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer ${
              !product.inStock
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : isInCart
                ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            {isInCart ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Card Information */}
      <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
        <div>
          {/* Metadata line: Category · Rating · Stock */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-0.5 font-mono text-[11px] text-stone-700">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500 inline" />
              {product.rating.toFixed(1)}
            </span>
            <span aria-hidden="true">·</span>
            <span className={product.stock <= 5 ? 'text-amber-700 font-medium' : 'text-stone-500'}>
              {product.stock === 0 ? 'Backorder' : product.stock <= 5 ? `${product.stock} left` : 'In stock'}
            </span>
          </div>

          <h3 className="text-base font-semibold text-stone-900 group-hover:text-amber-900 transition-colors mt-1 line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price and SKU line */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base font-bold text-stone-900 tabular-nums">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="font-mono text-xs text-stone-400 line-through tabular-nums">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <span className="font-mono text-[10px] text-stone-400 uppercase tracking-wider">
            {product.sku}
          </span>
        </div>
      </div>
    </article>
  );
};
