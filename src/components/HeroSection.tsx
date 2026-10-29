import React from 'react';
import { ArrowDown, Volume2, ShieldCheck, Sparkles } from 'lucide-react';
import { ProductArtwork } from './ProductArtwork';

interface HeroSectionProps {
  onExploreClick: () => void;
  onFeaturedClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onFeaturedClick
}) => {
  return (
    <section className="relative overflow-hidden border-b border-[#E7E5E4] bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Headline & Proof */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500 uppercase tracking-widest">
              <span>Studio Master Collection</span>
              <span aria-hidden="true">·</span>
              <span>Copenhagen & Oslo</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.1] [text-wrap:balance]">
              Acoustic Purity & Sculptural Living.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
              Everyday objects engineered at the intersection of studio-grade acoustic performance and minimal Nordic architecture. Built from solid FSC-certified white oak, Kvadrat virgin wool, and spun brass.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                <span>Explore Catalog</span>
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={onFeaturedClick}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                <span>Flagship Studio Monitor</span>
              </button>
            </div>

            {/* Adjacent Quantitative Proof Strip */}
            <div className="pt-8 border-t border-stone-200 grid grid-cols-3 gap-6 text-stone-800">
              <div>
                <p className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-stone-900">42 Hz</p>
                <p className="text-xs text-stone-500 mt-1">Studio Acoustic Floor</p>
              </div>
              <div>
                <p className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-stone-900">100%</p>
                <p className="text-xs text-stone-500 mt-1">FSC European Oak</p>
              </div>
              <div>
                <p className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-stone-900">5-Year</p>
                <p className="text-xs text-stone-500 mt-1">Craftsman Warranty</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Anchor */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-stone-100">
              <ProductArtwork type="speaker" aspectRatio="4:3" className="w-full" />
              
              {/* Quiet caption */}
              <div className="p-4 bg-white/95 backdrop-blur-sm border-t border-stone-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-stone-900">Onyx & Wool Studio Monitor</p>
                  <p className="text-xs text-stone-500">60W RMS Discrete Class-D</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-stone-900 tabular-nums">$480.00</p>
                  <span className="text-[11px] text-emerald-700 font-medium">In Stock</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
