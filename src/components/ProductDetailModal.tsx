import React, { useState, useEffect } from 'react';
import { X, Check, Star, Minus, Plus, Shield, Truck, Sparkles, Heart } from 'lucide-react';
import { Product } from '../types';
import { ProductArtwork } from './ProductArtwork';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  currentCartQty: number;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  currentCartQty,
  isWishlisted,
  onToggleWishlist
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setIsAdded(false);
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const maxSelectable = Math.max(0, product.stock - currentCartQty);

  const handleAdd = () => {
    if (quantity <= 0 || maxSelectable <= 0) return;
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-stone-400 hover:text-stone-900 bg-white/80 hover:bg-white rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Product Artwork Display */}
        <div className="md:w-1/2 bg-stone-100 flex flex-col justify-center relative border-b md:border-b-0 md:border-r border-stone-200">
          <ProductArtwork type={product.imageType} aspectRatio="1:1" className="w-full h-full" />
          <div className="p-4 bg-white/60 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500">
            <span className="font-mono uppercase tracking-wider">{product.sku}</span>
            <span>Artisanal Specimen</span>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category · Rating */}
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="font-medium text-stone-900 uppercase tracking-wider">{product.category}</span>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1 font-mono text-stone-700">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="font-bold">{product.rating.toFixed(1)}</span>
                <span className="text-stone-400">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
              {product.name}
            </h2>

            {/* Price & Stock */}
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xl font-bold text-stone-900 tabular-nums">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="font-mono text-sm text-stone-400 line-through tabular-nums">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xs ml-auto">
                {product.stock > 0 ? (
                  <span className="text-emerald-700 font-medium">
                    {product.stock} in stock
                  </span>
                ) : (
                  <span className="text-amber-800 font-medium">Sold Out</span>
                )}
              </span>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed pt-2">
              {product.description}
            </p>

            {/* Architectural Specs List */}
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <p className="text-xs font-semibold text-stone-800 uppercase tracking-wider">Specifications</p>
              <ul className="text-xs text-stone-600 space-y-1.5">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-700 font-bold">·</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Materials & Dimensions Table */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-xs">
              <div>
                <span className="text-stone-400 block text-[11px]">Dimensions</span>
                <span className="font-medium text-stone-800">{product.dimensions}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Materials</span>
                <span className="font-medium text-stone-800">{product.materials}</span>
              </div>
            </div>
          </div>

          {/* Purchase Actions */}
          <div className="pt-6 border-t border-stone-200 space-y-4">
            <div className="flex items-center gap-4">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || maxSelectable <= 0}
                  className="p-2.5 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-mono text-sm font-semibold tabular-nums text-stone-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxSelectable, q + 1))}
                  disabled={quantity >= maxSelectable || maxSelectable <= 0}
                  className="p-2.5 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart Primary Button */}
              <button
                onClick={handleAdd}
                disabled={product.stock === 0 || maxSelectable <= 0}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                  product.stock === 0 || maxSelectable <= 0
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : isAdded
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <span>
                    {product.stock === 0
                      ? 'Out of Stock'
                      : maxSelectable === 0
                      ? 'Max in Cart'
                      : `Add to Bag — $${(product.price * quantity).toFixed(2)}`}
                  </span>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => onToggleWishlist(product)}
                title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                  isWishlisted
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-stone-300 bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Heart className={`w-5 h-5 transition-transform active:scale-125 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

            {/* Trust Assurances */}
            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-stone-400" /> Free insured freight over $150
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-stone-400" /> 30-day studio trial
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
