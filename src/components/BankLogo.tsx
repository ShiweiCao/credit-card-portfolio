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
            viewBox="0 0 200 120"
            className={`${dimensions.icon} transition-transform`}
            aria-label="Citi Logo"
          >
            {/* Iconic Citi red umbrella arc */}
            <path
              d="M139.648.783a78.4 78.4 0 0 1 36.198 8.763 78.5 78.5 0 0 1 28.089 24.488H186.07a62.5 62.5 0 0 0-21.012-15.3 62.36 62.36 0 0 0-50.819 0 62.45 62.45 0 0 0-21.012 15.3H75.362A78.5 78.5 0 0 1 103.45 9.546 78.4 78.4 0 0 1 139.648.783"
              fill={isWhite ? 'currentColor' : '#ED1B2D'}
            />
            {/* CITI text letterform */}
            <path
              d="M.948 79.967c0-20.994 17.162-37.338 39.528-37.338 12.942 0 24.758 5.777 31.51 14.513l-9.706 9.721a27.8 27.8 0 0 0-9.61-7.833 27.8 27.8 0 0 0-12.053-2.875c-13.364 0-24.055 10.004-24.055 23.812 0 13.948 10.691 23.952 24.055 23.952a28.1 28.1 0 0 0 12.484-2.943 28.15 28.15 0 0 0 9.883-8.188l9.565 9.44c-6.47 9.159-18.85 15.217-32.073 15.217-22.366 0-39.528-16.344-39.528-37.478M85.21 45.165h15.333v69.744H85.21zm43.889 0h15.333v69.744H129.1z"
              fill={isWhite ? 'currentColor' : '#002D72'}
            />
          </svg>
        );

      case 'Capital One':
        return (
          <svg
            viewBox="0 0 120 70"
            className={`${dimensions.icon} transition-transform`}
            aria-label="Capital One Logo"
          >
            {/* Iconic Capital One red swoosh */}
            <path
              d="M12 28 C 45 6, 92 10, 115 36 C 92 24, 52 20, 26 34 Z"
              fill={isWhite ? 'currentColor' : '#D03027'}
            />
            {/* Capital One C1 monogram badge */}
            <text
              x="12"
              y="60"
              fontSize="34"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontStyle="italic"
              fill={isWhite ? 'currentColor' : '#004879'}
            >
              C1
            </text>
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
