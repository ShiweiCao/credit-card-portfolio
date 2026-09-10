import React, { useState } from 'react';
import { Bank, CardNetwork } from '../types';
import { BankLogo, NetworkLogo } from './BankLogo';
import { Wifi } from 'lucide-react';

interface CardVisualProps {
  name: string;
  bank: Bank;
  network?: CardNetwork;
  cardColor?: string;
  imageUrl?: string;
  variant?: 'thumb' | 'compact' | 'header' | 'hero';
  className?: string;
  showDetails?: boolean;
}

export const CardVisual: React.FC<CardVisualProps> = ({
  name,
  bank,
  network = 'Visa',
  cardColor,
  imageUrl,
  variant = 'header',
  className = '',
  showDetails = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Gradient fallback
  const bgGradient = cardColor || 'from-neutral-800 via-neutral-900 to-black';

  // Thumbnail variant (used in autocomplete dropdown and small lists)
  if (variant === 'thumb') {
    return (
      <div
        className={`relative w-12 h-7.5 rounded-md overflow-hidden shrink-0 border border-black/10 shadow-xs flex items-center justify-center select-none bg-gradient-to-br ${bgGradient} ${className}`}
      >
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-0.5 w-full h-full text-[9px] text-white">
            <BankLogo bank={bank} size="xs" variant="white" className="scale-75" />
          </div>
        )}
      </div>
    );
  }

  // Compact card preview (used in modals and summary previews)
  if (variant === 'compact') {
    return (
      <div
        className={`relative w-full aspect-[1.586/1] max-w-[280px] rounded-xl overflow-hidden shadow-md border border-white/20 select-none bg-gradient-to-br ${bgGradient} ${className}`}
      >
        {imageUrl && !imgError ? (
          <>
            <img
              src={imageUrl}
              alt={name}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center"
            />
            {/* Glossy overlay sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/15 pointer-events-none" />
          </>
        ) : (
          /* Stylized Realistic Credit Card Face */
          <div className="relative w-full h-full p-3.5 flex flex-col justify-between text-white">
            {/* Top row: Bank + Contactless wave */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BankLogo bank={bank} size="xs" variant="white" />
                <span className="text-[11px] font-bold tracking-wider uppercase opacity-90 truncate max-w-[140px]">
                  {bank}
                </span>
              </div>
              <Wifi className="w-3.5 h-3.5 rotate-90 opacity-70" />
            </div>

            {/* Middle: EMV Chip & Name */}
            <div className="my-auto py-1">
              <div className="w-7 h-5 rounded-sm bg-gradient-to-br from-amber-200 to-yellow-400 border border-yellow-600/60 shadow-2xs mb-2 opacity-90" />
              <div className="text-xs font-bold tracking-wide leading-tight truncate drop-shadow-xs">
                {name || 'Credit Card'}
              </div>
            </div>

            {/* Bottom row: Network */}
            <div className="flex items-center justify-end">
              <NetworkLogo network={network} size="xs" variant="badge" />
            </div>

            {/* Card sheen highlight */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          </div>
        )}
      </div>
    );
  }

  // Header variant (Used inside card top container in CardList)
  return (
    <div
      className={`relative w-full overflow-hidden text-white bg-gradient-to-br ${bgGradient} ${className}`}
    >
      {/* If an image is available and loaded, we can show it either as banner or background */}
      {imageUrl && !imgError && (
        <div className="absolute inset-0 z-0">
          <img
            src={imageUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
      )}

      {/* Foreground Content */}
      <div className="relative z-10 p-4">
        {/* Top bar: Bank & Network */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BankLogo bank={bank} size="xs" variant="white" />
            <span className="text-xs font-semibold tracking-wider uppercase opacity-95">
              {bank}
            </span>
          </div>
          <NetworkLogo network={network} size="xs" variant="badge" />
        </div>

        {/* Card Artwork Thumbnail + Name */}
        <div className="mt-3 flex items-center gap-3">
          {imageUrl && !imgError && (
            <div className="w-13 h-8 rounded-md overflow-hidden shrink-0 border border-white/30 shadow-md bg-black/20">
              <img
                src={imageUrl}
                alt={name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold tracking-tight truncate" title={name}>
              {name}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};
