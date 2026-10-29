import React from 'react';
import { ProductImageType } from '../types';

interface ProductArtworkProps {
  type: ProductImageType;
  className?: string;
  aspectRatio?: '4:3' | '16:9' | '1:1';
}

export const ProductArtwork: React.FC<ProductArtworkProps> = ({
  type,
  className = '',
  aspectRatio = '4:3'
}) => {
  const aspectClass =
    aspectRatio === '16:9' ? 'aspect-[16/9]' : aspectRatio === '1:1' ? 'aspect-square' : 'aspect-[4/3]';

  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-b from-[#F5F5F4] to-[#ECEAE8] flex items-center justify-center select-none ${aspectClass} ${className}`}
    >
      {/* Subtle architectural ambient backdrop lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.7),transparent_70%)] pointer-events-none" />

      {type === 'speaker' && (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full p-4 transition-transform duration-500 hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="200" cy="255" rx="100" ry="12" fill="#1C1917" fillOpacity="0.08" />
          {/* Walnut plinth */}
          <path d="M110 230 L290 230 L280 252 L120 252 Z" fill="#78350F" />
          <path d="M120 252 L280 252 L275 258 L125 258 Z" fill="#451A03" />
          {/* Speaker body cabinet */}
          <rect x="125" y="65" width="150" height="165" rx="16" fill="#292524" />
          {/* Acoustic Wool Grille */}
          <rect x="133" y="73" width="134" height="149" rx="12" fill="#38332E" />
          {/* Wool weave texture simulation */}
          <g opacity="0.15" stroke="#FFFFFF" strokeWidth="0.75">
            {Array.from({ length: 18 }).map((_, i) => (
              <line key={`h-${i}`} x1="135" y1={80 + i * 8} x2="265" y2={80 + i * 8} />
            ))}
          </g>
          {/* Tweeter dome */}
          <circle cx="200" cy="110" r="18" fill="#1C1917" stroke="#78350F" strokeWidth="2" />
          <circle cx="200" cy="110" r="10" fill="#44403C" />
          <circle cx="197" cy="107" r="3" fill="#FFFFFF" fillOpacity="0.4" />
          {/* Kevlar mid-woofer */}
          <circle cx="200" cy="175" r="34" fill="#1C1917" stroke="#92400E" strokeWidth="3" />
          <circle cx="200" cy="175" r="26" fill="#262626" />
          <circle cx="200" cy="175" r="12" fill="#78350F" />
          <circle cx="200" cy="175" r="6" fill="#1C1917" />
          {/* Brushed brass badge */}
          <rect x="188" y="212" width="24" height="4" rx="2" fill="#D97706" />
        </svg>
      )}

      {type === 'lamp' && (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full p-4 transition-transform duration-500 hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Warm soft light glow cone */}
          <path d="M200 120 L80 290 L320 290 Z" fill="url(#lampGlow)" opacity="0.35" />
          <defs>
            <radialGradient id="lampGlow" cx="50%" cy="0%" r="90%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="200" cy="275" rx="80" ry="10" fill="#1C1917" fillOpacity="0.05" />
          {/* Brass suspension cord */}
          <line x1="200" y1="20" x2="200" y2="105" stroke="#78350F" strokeWidth="3" strokeDasharray="3 3" />
          {/* Ceiling mount canopy */}
          <path d="M185 20 L215 20 L210 28 L190 28 Z" fill="#D97706" />
          {/* Brass shade collar */}
          <rect x="188" y="100" width="24" height="14" rx="3" fill="#D97706" />
          <rect x="192" y="112" width="16" height="6" fill="#B45309" />
          {/* Fluted frosted glass shade */}
          <path
            d="M200 118 C150 120 120 160 120 200 C120 215 140 220 200 220 C260 220 280 215 280 200 C280 160 250 120 200 118 Z"
            fill="#F5F5F4"
            fillOpacity="0.9"
            stroke="#D6D3D1"
            strokeWidth="1.5"
          />
          {/* Fluted glass ribbing lines */}
          <g opacity="0.3" stroke="#A8A29E" strokeWidth="1">
            <line x1="160" y1="135" x2="155" y2="215" />
            <line x1="180" y1="125" x2="178" y2="219" />
            <line x1="200" y1="120" x2="200" y2="220" />
            <line x1="220" y1="125" x2="222" y2="219" />
            <line x1="240" y1="135" x2="245" y2="215" />
          </g>
          {/* Internal filament glow bulb */}
          <circle cx="200" cy="180" r="14" fill="#F59E0B" fillOpacity="0.6" />
          <circle cx="200" cy="180" r="6" fill="#FEF3C7" />
        </svg>
      )}

      {type === 'chair' && (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full p-4 transition-transform duration-500 hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="200" cy="265" rx="110" ry="14" fill="#1C1917" fillOpacity="0.08" />
          {/* Solid oak legs back */}
          <line x1="145" y1="190" x2="130" y2="260" stroke="#78350F" strokeWidth="8" strokeLinecap="round" />
          <line x1="255" y1="190" x2="270" y2="260" stroke="#78350F" strokeWidth="8" strokeLinecap="round" />
          {/* Boucle backrest cushion */}
          <rect x="135" y="70" width="130" height="95" rx="30" fill="#E7E5E4" stroke="#D6D3D1" strokeWidth="2" />
          {/* Bouclé texture spots */}
          <g opacity="0.25" fill="#78716C">
            <circle cx="160" cy="95" r="2" />
            <circle cx="180" cy="85" r="1.5" />
            <circle cx="210" cy="90" r="2" />
            <circle cx="235" cy="100" r="2" />
            <circle cx="170" cy="120" r="2.5" />
            <circle cx="200" cy="125" r="2" />
            <circle cx="225" cy="120" r="2" />
          </g>
          {/* Sculpted solid oak armrests */}
          <path d="M120 145 C120 135 130 130 150 135 L170 140" stroke="#92400E" strokeWidth="10" strokeLinecap="round" />
          <path d="M280 145 C280 135 270 130 250 135 L230 140" stroke="#92400E" strokeWidth="10" strokeLinecap="round" />
          {/* Thick boucle seat cushion */}
          <rect x="120" y="160" width="160" height="50" rx="20" fill="#F5F5F4" stroke="#D6D3D1" strokeWidth="2" />
          {/* Front oak legs */}
          <line x1="140" y1="205" x2="135" y2="265" stroke="#B45309" strokeWidth="9" strokeLinecap="round" />
          <line x1="260" y1="205" x2="265" y2="265" stroke="#B45309" strokeWidth="9" strokeLinecap="round" />
        </svg>
      )}

      {type === 'carafe' && (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full p-4 transition-transform duration-500 hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="180" cy="255" rx="45" ry="8" fill="#1C1917" fillOpacity="0.08" />
          <ellipse cx="255" cy="255" rx="30" ry="6" fill="#1C1917" fillOpacity="0.07" />
          {/* Ceramic Carafe Body */}
          <path
            d="M165 70 C165 65 170 60 180 60 C185 60 190 62 195 65 L195 90 C195 105 215 130 215 180 C215 230 205 250 180 250 C155 250 145 230 145 180 C145 130 165 105 165 90 Z"
            fill="#D6D3D1"
            stroke="#A8A29E"
            strokeWidth="1.5"
          />
          {/* Stoneware speckles */}
          <g opacity="0.3" fill="#78350F">
            <circle cx="175" cy="150" r="1.5" />
            <circle cx="185" cy="170" r="1" />
            <circle cx="165" cy="190" r="1.5" />
            <circle cx="190" cy="210" r="1.2" />
            <circle cx="175" cy="230" r="1" />
          </g>
          {/* Raw terracotta foot rim */}
          <path d="M152 240 C160 252 200 252 208 240 L205 250 C195 252 165 252 155 250 Z" fill="#B45309" />
          {/* Companion Tumbler Cup */}
          <path
            d="M235 180 L275 180 L270 250 L240 250 Z"
            fill="#E7E5E4"
            stroke="#A8A29E"
            strokeWidth="1.5"
          />
          <path d="M240 242 L270 242 L268 250 L242 250 Z" fill="#B45309" />
        </svg>
      )}

      {type === 'headphones' && (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full p-4 transition-transform duration-500 hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="200" cy="255" rx="80" ry="10" fill="#1C1917" fillOpacity="0.08" />
          {/* Spring steel headband */}
          <path
            d="M125 170 C125 90 145 55 200 55 C255 55 275 90 275 170"
            stroke="#57534E"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Leather stitched comfort pad */}
          <path
            d="M150 90 C165 70 200 65 200 65 C200 65 235 70 250 90"
            stroke="#292524"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Aluminum gimbal brackets */}
          <rect x="118" y="160" width="14" height="24" rx="4" fill="#A8A29E" />
          <rect x="268" y="160" width="14" height="24" rx="4" fill="#A8A29E" />
          {/* Solid walnut earcups */}
          <ellipse cx="125" cy="200" rx="30" ry="38" fill="#78350F" stroke="#451A03" strokeWidth="2" />
          <ellipse cx="275" cy="200" rx="30" ry="38" fill="#78350F" stroke="#451A03" strokeWidth="2" />
          {/* Open back stainless steel mesh */}
          <circle cx="125" cy="200" r="16" fill="#1C1917" />
          <circle cx="275" cy="200" r="16" fill="#1C1917" />
          {/* Lambskin memory foam ear pads */}
          <rect x="135" y="170" width="14" height="60" rx="6" fill="#1C1917" />
          <rect x="251" y="170" width="14" height="60" rx="6" fill="#1C1917" />
        </svg>
      )}

      {type === 'desk' && (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full p-4 transition-transform duration-500 hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="200" cy="245" rx="130" ry="12" fill="#1C1917" fillOpacity="0.08" />
          {/* Anodized tray body */}
          <path
            d="M80 160 L320 160 L310 230 L90 230 Z"
            fill="#57534E"
            stroke="#44403C"
            strokeWidth="2"
          />
          {/* CNC milled instrument wells */}
          <rect x="100" y="175" width="190" height="18" rx="6" fill="#292524" />
          <rect x="100" y="200" width="110" height="18" rx="6" fill="#292524" />
          <circle cx="260" cy="209" r="12" fill="#292524" />
          {/* Metallic highlight bevel */}
          <line x1="85" y1="162" x2="315" y2="162" stroke="#A8A29E" strokeWidth="1.5" />
          {/* Subtle cork bottom layer */}
          <rect x="94" y="230" width="212" height="6" rx="2" fill="#B45309" />
        </svg>
      )}

      {type === 'vase' && (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full p-4 transition-transform duration-500 hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="200" cy="260" rx="50" ry="8" fill="#1C1917" fillOpacity="0.08" />
          {/* Fluted Ceramic Vase Body */}
          <path
            d="M175 60 L225 60 C220 110 245 160 245 220 C245 255 225 255 200 255 C175 255 155 255 155 220 C155 160 180 110 175 60 Z"
            fill="#E7E5E4"
            stroke="#D6D3D1"
            strokeWidth="1.5"
          />
          {/* Vertical sculptural flutes */}
          <g opacity="0.4" stroke="#A8A29E" strokeWidth="1.5">
            <path d="M185 62 C180 110 190 160 180 252" />
            <path d="M200 60 C200 110 200 160 200 255" />
            <path d="M215 62 C220 110 210 160 220 252" />
          </g>
          {/* Elegant dried botanical stem */}
          <path d="M200 65 Q195 20 230 10" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="230" cy="10" rx="6" ry="3" fill="#B45309" />
          <ellipse cx="218" cy="26" rx="5" ry="2.5" fill="#B45309" />
        </svg>
      )}

      {type === 'clock' && (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full p-4 transition-transform duration-500 hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="200" cy="260" rx="75" ry="10" fill="#1C1917" fillOpacity="0.06" />
          {/* Spun brass outer dial */}
          <circle cx="200" cy="150" r="90" fill="#D97706" stroke="#B45309" strokeWidth="3" />
          <circle cx="200" cy="150" r="82" fill="#F59E0B" />
          {/* Subtle concentric spun metal rings */}
          <circle cx="200" cy="150" r="60" stroke="#D97706" strokeWidth="1" opacity="0.4" />
          <circle cx="200" cy="150" r="40" stroke="#D97706" strokeWidth="1" opacity="0.4" />
          {/* Hour tick marks at 12, 3, 6, 9 */}
          <line x1="200" y1="74" x2="200" y2="82" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="276" y1="150" x2="268" y2="150" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="200" y1="226" x2="200" y2="218" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="124" y1="150" x2="132" y2="150" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          {/* Solid walnut hour hand */}
          <line x1="200" y1="150" x2="200" y2="105" stroke="#451A03" strokeWidth="5" strokeLinecap="round" />
          {/* Solid walnut minute hand */}
          <line x1="200" y1="150" x2="245" y2="150" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />
          {/* Central brass cap */}
          <circle cx="200" cy="150" r="6" fill="#78350F" />
          <circle cx="200" cy="150" r="2" fill="#FEF3C7" />
        </svg>
      )}
    </div>
  );
};
