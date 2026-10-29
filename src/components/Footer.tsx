import React from 'react';
import { ProductCategory } from '../types';

interface FooterProps {
  onSelectCategory: (cat: ProductCategory | 'All') => void;
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenAdmin,
  onOpenOrders,
}) => {
  return (
    <footer className="border-t border-stone-200 bg-white text-xs text-stone-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <span className="font-display text-xl font-bold tracking-tight text-stone-900 block">
              AURA
            </span>
            <p className="text-stone-500 text-xs leading-relaxed max-w-xs">
              Architectural acoustic sound systems and sculptural homeware designed for mindful living.
            </p>
            <div className="text-[11px] text-stone-400">
              <span>Studio: Copenhagen, Denmark</span>
            </div>
          </div>

          {/* Collection Col */}
          <div className="space-y-2">
            <h4 className="font-semibold text-stone-900 uppercase text-[11px] tracking-wider">
              Curated Collections
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onSelectCategory('All')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Complete Collection
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Acoustics')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Acoustic Systems
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Lighting')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Architectural Lighting
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Seating')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Sculptural Seating
                </button>
              </li>
            </ul>
          </div>

          {/* Operations & Store */}
          <div className="space-y-2">
            <h4 className="font-semibold text-stone-900 uppercase text-[11px] tracking-wider">
              Store Operations
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={onOpenOrders}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Order History & Invoices
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Manage Inventory (Admin CRUD)
                </button>
              </li>
              <li>
                <span className="text-stone-400">Complimentary Freight over $150</span>
              </li>
              <li>
                <span className="text-stone-400">30-Day Studio Trial</span>
              </li>
            </ul>
          </div>

          {/* Technical Specs Col */}
          <div className="space-y-2">
            <h4 className="font-semibold text-stone-900 uppercase text-[11px] tracking-wider">
              Engineering Profile
            </h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Full-Stack Junior Developer Portfolio Showcase. Engineered with React 19, TypeScript, REST API interceptors, schema validation, and real-time network telemetry.
            </p>
            <div className="pt-2 text-[11px] text-stone-400 font-mono">
              <span>Stack: React 19 · Vite · Tailwind v4</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-400">
          <p>© {new Date().getFullYear()} Aura Living & Acoustics. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>REST API v1.0</span>
            <span aria-hidden="true">·</span>
            <span>WCAG AA Accessible</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Pill Typography</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
