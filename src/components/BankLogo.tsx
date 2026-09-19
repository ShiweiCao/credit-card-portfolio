import React from 'react';
import { Bank, CardNetwork } from '../types';
import {
  siChase,
  siAmericanexpress,
  siBankofamerica,
  siDiscover,
  siWellsfargo,
  siBarclays,
  siVisa,
  siMastercard,
} from 'simple-icons';
import { Building2 } from 'lucide-react';

interface BankLogoProps {
  bank: Bank | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'badge' | 'pill' | 'white';
  className?: string;
  showName?: boolean;
}

export const BANK_COLORS: Record<
  string,
  {
    primary: string;
    bg: string;
    text: string;
    border: string;
    accentGradient: string;
  }
> = {
  Chase: {
    primary: '#1170CF',
    bg: '#eff6ff',
    text: '#1e40af',
    border: '#bfdbfe',
    accentGradient: 'from-blue-600 to-indigo-800',
  },
  'American Express': {
    primary: '#002663',
    bg: '#f0f9ff',
    text: '#0369a1',
    border: '#bae6fd',
    accentGradient: 'from-sky-700 to-blue-900',
  },
  Citi: {
    primary: '#002D72',
    bg: '#f0f7ff',
    text: '#1d4ed8',
    border: '#bfdbfe',
    accentGradient: 'from-blue-700 via-sky-800 to-blue-950',
  },
  'Capital One': {
    primary: '#004879',
    bg: '#f8fafc',
    text: '#0f172a',
    border: '#cbd5e1',
    accentGradient: 'from-slate-800 via-blue-950 to-indigo-950',
  },
  'Bank of America': {
    primary: '#E31837',
    bg: '#fef2f2',
    text: '#b91c1c',
    border: '#fecaca',
    accentGradient: 'from-red-600 via-blue-800 to-blue-950',
  },
  Discover: {
    primary: '#FF6000',
    bg: '#fff7ed',
    text: '#c2410c',
    border: '#fed7aa',
    accentGradient: 'from-orange-500 to-amber-700',
  },
  'Wells Fargo': {
    primary: '#D71E28',
    bg: '#fef2f2',
    text: '#991b1b',
    border: '#fecaca',
    accentGradient: 'from-red-700 via-red-800 to-neutral-900',
  },
  'U.S. Bank': {
    primary: '#0C2340',
    bg: '#f1f5f9',
    text: '#0f172a',
    border: '#cbd5e1',
    accentGradient: 'from-blue-900 via-slate-900 to-indigo-950',
  },
  Barclays: {
    primary: '#00AEEF',
    bg: '#ecfeff',
    text: '#0e7490',
    border: '#a5f3fc',
    accentGradient: 'from-cyan-600 to-blue-800',
  },
  Other: {
    primary: '#525252',
    bg: '#f5f5f5',
    text: '#404040',
    border: '#e5e5e5',
    accentGradient: 'from-neutral-700 to-neutral-900',
  },
};

const SIZE_MAP = {
  xs: { box: 'w-4 h-4', icon: 'w-3 h-3', text: 'text-[10px]' },
  sm: { box: 'w-6 h-6', icon: 'w-4 h-4', text: 'text-xs' },
  md: { box: 'w-8 h-8', icon: 'w-5 h-5', text: 'text-sm' },
  lg: { box: 'w-10 h-10', icon: 'w-6 h-6', text: 'text-base' },
  xl: { box: 'w-14 h-14', icon: 'w-8 h-8', text: 'text-lg' },
};

export const BankLogo: React.FC<BankLogoProps> = ({
  bank,
  size = 'md',
  variant = 'badge',
  className = '',
  showName = false,
}) => {
  const dimensions = SIZE_MAP[size];
  const colorScheme = BANK_COLORS[bank] || BANK_COLORS.Other;
  const isWhite = variant === 'white';

  // Render authentic vector graphic per bank
  const renderSvg = () => {
    switch (bank) {
      case 'Chase':
        return (
          <svg
            viewBox="0 0 24 24"
            className={`${dimensions.icon} transition-transform`}
            fill={isWhite ? 'currentColor' : colorScheme.primary}
            aria-label="Chase Logo"
          >
            <path d={siChase.path} />
          </svg>
        );

      case 'American Express':
        return (
          <svg
            viewBox="0 0 24 24"
            className={`${dimensions.icon} transition-transform`}
            fill={isWhite ? 'currentColor' : colorScheme.primary}
            aria-label="American Express Logo"
          >
            <path d={siAmericanexpress.path} />
          </svg>
        );

      case 'Bank of America':
        return (
          <svg
            viewBox="0 0 24 24"
            className={`${dimensions.icon} transition-transform`}
            fill={isWhite ? 'currentColor' : colorScheme.primary}
            aria-label="Bank of America Logo"
          >
            <path d={siBankofamerica.path} />
          </svg>
        );

      case 'Discover':
        return (
          <svg
            viewBox="0 0 24 24"
            className={`${dimensions.icon} transition-transform`}
            fill={isWhite ? 'currentColor' : colorScheme.primary}
            aria-label="Discover Logo"
          >
            <path d={siDiscover.path} />
          </svg>
        );

      case 'Wells Fargo':
        return (
          <svg
            viewBox="0 0 24 24"
            className={`${dimensions.icon} transition-transform`}
            fill={isWhite ? 'currentColor' : colorScheme.primary}
            aria-label="Wells Fargo Logo"
          >
            <path d={siWellsfargo.path} />
          </svg>
        );

      case 'Barclays':
        return (
          <svg
            viewBox="0 0 24 24"
            className={`${dimensions.icon} transition-transform`}
            fill={isWhite ? 'currentColor' : colorScheme.primary}
            aria-label="Barclays Logo"
          >
            <path d={siBarclays.path} />
          </svg>
        );

      case 'Citi':
        return (
          <svg
            viewBox="0 0 64 64"
            className="w-6 h-4 transition-transform"
            aria-label="Citi Logo"
          >
            <path
              d="M22.8 30.7l-.1-.1c-2.3-2.8-5.2-4.2-8.7-4.2-3.7 0-6.7 1.1-9.1 3.3C2.3 32.1 1 35.2 1 39.2c0 4 1.3 7.1 3.9 9.5 2.4 2.2 5.4 3.3 9.1 3.3 3.5 0 6.4-1.4 8.7-4.2l.1-.1-2.9-3.5-.1.1c-1.9 1.8-3.9 2.8-6 2.8-2.2 0-4.1-.8-5.5-2.3-1.5-1.5-2.2-3.4-2.2-5.7 0-2.3.7-4.2 2.2-5.7 1.5-1.5 3.3-2.2 5.5-2.2 2.1 0 4.1 1 6 2.8l.1.1 2.9-3.5z"
              fill={isWhite ? 'currentColor' : '#32357F'}
              fillRule="evenodd"
              clipRule="evenodd"
            />
            <path
              d="M26 27h5v25h-5zM35 27v4h5v14.4c0 1.9.3 3.5 1.4 4.6 1 1.2 2.3 1.8 4 1.8 1.7 0 3.2-.3 4.5-1.1l.1-.1 1.1-4.7-.3.2c-1.4.8-2.4 1.2-3.6 1.2-1.6 0-2.2-.9-2.2-2.8V31h5v-4h-5v-7.9l-5 2.7V27zM55 27h5v25h-5z"
              fill={isWhite ? 'currentColor' : '#002D72'}
              fillRule="evenodd"
              clipRule="evenodd"
            />
            <path
              d="M28.2 22.8c2-2 4.2-3.6 6.8-4.7 2.4-1.1 5-1.6 7.7-1.6 2.7 0 5.3.5 7.8 1.6 2.5 1.1 4.7 2.7 6.7 4.8l.1.2H63l-.2-.4c-2.3-3.2-5.3-5.9-8.9-7.7C50.3 13 46.6 12 42.7 12c-3.9 0-7.7.9-11.3 2.8-3.6 1.9-6.6 4.5-8.9 7.8l-.2.4h5.8l.1-.2z"
              fill="#EA2230"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        );

      case 'Capital One':
        return (
          <svg
            viewBox="0 0 64 64"
            className="w-6 h-4 transition-transform"
            fill="#d03027"
            aria-label="Capital One Logo"
          >
            <path
              d="M37.603 39.37c-3.93 2.783-8.568 5.697-13.56 8.755l-.197.114c-.067.047-.083.14-.036.207s.14.083.207.036l.166-.088 14-7.52a.48.48 0 0 1 .078-.04 6.21 6.21 0 0 1-.648-1.462zm25.7-20.8C57.13 11.75 17.4 17.876.506 21.566l-.394.083c-.083.016-.135.093-.12.17.016.083.093.135.17.12l.4-.078c13.995-2.493 43.105-5.945 49.367.264 1.913 1.897 1.457 4.333-.762 7.215 1.192.767 2.042 1.975 2.426 3.483C60.25 27.08 66.06 21.6 63.313 18.56z"
            />
            <path
              d="M37.593 39.38s9.815-7.704 11.575-10.04 0 0 0 0l3.8 1.387-1.373 2.096s-9.53 5.968-13.342 8.008 0 0 0 0l-1.33-.087z"
            />
          </svg>
        );

      case 'U.S. Bank':
        return (
          <svg
            viewBox="0 0 100 100"
            className={`${dimensions.icon} transition-transform`}
            aria-label="U.S. Bank Logo"
          >
            {/* Navy Shield Background */}
            <rect
              x="5"
              y="5"
              width="90"
              height="90"
              rx="18"
              fill={isWhite ? 'currentColor' : '#0C2340'}
            />
            {/* Red Accent Bar */}
            <rect
              x="18"
              y="22"
              width="24"
              height="20"
              rx="3"
              fill={isWhite ? '#0C2340' : '#D22730'}
            />
            {/* Three White Stripes */}
            <rect
              x="18"
              y="50"
              width="64"
              height="8"
              rx="3"
              fill={isWhite ? '#0C2340' : '#FFFFFF'}
            />
            <rect
              x="18"
              y="64"
              width="64"
              height="8"
              rx="3"
              fill={isWhite ? '#0C2340' : '#FFFFFF'}
            />
            <rect
              x="48"
              y="28"
              width="34"
              height="8"
              rx="3"
              fill={isWhite ? '#0C2340' : '#FFFFFF'}
            />
          </svg>
        );

      default:
        return (
          <Building2
            className={`${dimensions.icon} ${
              isWhite ? 'text-white' : 'text-neutral-600'
            }`}
          />
        );
    }
  };

  if (variant === 'icon') {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
      >
        {renderSvg()}
      </span>
    );
  }

  if (variant === 'white') {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
      >
        {renderSvg()}
      </span>
    );
  }

  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${className}`}
        style={{
          backgroundColor: colorScheme.bg,
          color: colorScheme.text,
          borderColor: colorScheme.border,
        }}
      >
        <span className="shrink-0">{renderSvg()}</span>
        <span className="truncate">{bank}</span>
      </span>
    );
  }

  // Default 'badge': Square rounded container with crisp white or tinted canvas
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`${dimensions.box} rounded-xl flex items-center justify-center shrink-0 shadow-2xs border transition-all bg-white`}
        style={{
          borderColor: colorScheme.border,
        }}
      >
        {renderSvg()}
      </div>
      {showName && (
        <span
          className={`font-semibold text-neutral-800 ${dimensions.text} truncate`}
        >
          {bank}
        </span>
      )}
    </div>
  );
};

// Payment network logo helper for Visa, Mastercard, Amex, Discover
export const NetworkLogo: React.FC<{
  network: CardNetwork | string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  variant?: 'badge' | 'icon' | 'white';
}> = ({ network, size = 'sm', className = '', variant = 'badge' }) => {
  const isWhite = variant === 'white';
  const sizeClasses = {
    xs: 'h-3 text-[10px]',
    sm: 'h-4 text-xs',
    md: 'h-5 text-sm',
  }[size];

  const renderNetworkSvg = () => {
    switch (network) {
      case 'Visa':
        return (
          <svg
            viewBox="0 0 24 24"
            className={`${sizeClasses} w-auto`}
            fill={isWhite ? 'currentColor' : '#1A1F71'}
            aria-label="Visa"
          >
            <path d={siVisa.path} />
          </svg>
        );
      case 'Mastercard':
        return (
          <svg
            viewBox="0 0 24 24"
            className={`${sizeClasses} w-auto`}
            fill={isWhite ? 'currentColor' : '#EB001B'}
            aria-label="Mastercard"
          >
            <path d={siMastercard.path} />
          </svg>
        );
      case 'American Express':
        return (
          <svg
            viewBox="0 0 24 24"
            className={`${sizeClasses} w-auto`}
            fill={isWhite ? 'currentColor' : '#002663'}
            aria-label="Amex"
          >
            <path d={siAmericanexpress.path} />
          </svg>
        );
      case 'Discover':
        return (
          <svg
            viewBox="0 0 24 24"
            className={`${sizeClasses} w-auto`}
            fill={isWhite ? 'currentColor' : '#FF6000'}
            aria-label="Discover"
          >
            <path d={siDiscover.path} />
          </svg>
        );
      default:
        return <span className="font-bold text-[10px] uppercase tracking-wider">{network}</span>;
    }
  };

  if (variant === 'icon' || variant === 'white') {
    return (
      <span className={`inline-flex items-center shrink-0 ${className}`}>
        {renderNetworkSvg()}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-md bg-white/90 shadow-2xs border border-neutral-200 shrink-0 ${className}`}
    >
      {renderNetworkSvg()}
    </span>
  );
};
