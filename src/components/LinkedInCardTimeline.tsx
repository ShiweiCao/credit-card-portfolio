import React, { useState } from 'react';
import { CreditCard, ProductChange, Bank } from '../types';
import { CardVisual } from './CardVisual';
import { BankLogo } from './BankLogo';
import { findCatalogCard } from '../data/cardCatalog';
import {
  formatDate,
  formatMonthYear,
  formatLinkedInDuration,
  getLinkedInDateRange,
} from '../utils/dateUtils';
import {
  CreditCard as CardIcon,
  ArrowRightLeft,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Building2,
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
} from 'lucide-react';

interface LinkedInCardTimelineProps {
  card: CreditCard;
  onOpenProductChangeModal: (cardId: string) => void;
  onEditProductChange?: (cardId: string, change: ProductChange) => void;
  onDeleteProductChange?: (cardId: string, changeId: string) => void;
  initiallyExpanded?: boolean;
}

// Brand theme styling for major banks
const BANK_BRANDING: Record<
  string,
  {
    bgGradient: string;
    textColor: string;
    borderAccent: string;
    badgeBg: string;
    badgeText: string;
    displayName: string;
  }
> = {
  Chase: {
    bgGradient: 'from-blue-700 via-blue-800 to-indigo-900',
    textColor: 'text-blue-700',
    borderAccent: 'border-blue-200',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    displayName: 'JPMorgan Chase Bank',
  },
  'American Express': {
    bgGradient: 'from-cyan-800 via-blue-900 to-slate-900',
    textColor: 'text-sky-700',
    borderAccent: 'border-sky-200',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800',
    displayName: 'American Express National Bank',
  },
  'Capital One': {
    bgGradient: 'from-slate-800 via-blue-950 to-indigo-950',
    textColor: 'text-slate-800',
    borderAccent: 'border-slate-300',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    displayName: 'Capital One Bank',
  },
  Citi: {
    bgGradient: 'from-blue-800 via-sky-900 to-blue-950',
    textColor: 'text-blue-700',
    borderAccent: 'border-blue-200',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    displayName: 'Citibank, N.A.',
  },
  'Bank of America': {
    bgGradient: 'from-red-700 via-blue-900 to-blue-950',
    textColor: 'text-red-700',
    borderAccent: 'border-red-200',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-800',
    displayName: 'Bank of America',
  },
  Discover: {
    bgGradient: 'from-amber-600 via-orange-600 to-orange-800',
    textColor: 'text-orange-700',
    borderAccent: 'border-orange-200',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    displayName: 'Discover Bank',
  },
  'Wells Fargo': {
    bgGradient: 'from-red-800 via-red-900 to-neutral-900',
    textColor: 'text-red-800',
    borderAccent: 'border-red-200',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-900',
    displayName: 'Wells Fargo Bank',
  },
  'U.S. Bank': {
    bgGradient: 'from-blue-900 via-slate-900 to-indigo-950',
    textColor: 'text-blue-900',
    borderAccent: 'border-blue-200',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-900',
    displayName: 'U.S. Bank National Association',
  },
  Barclays: {
    bgGradient: 'from-cyan-700 via-blue-800 to-blue-900',
    textColor: 'text-cyan-800',
    borderAccent: 'border-cyan-200',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-900',
    displayName: 'Barclays Bank Delaware',
  },
  Other: {
    bgGradient: 'from-neutral-800 to-neutral-900',
    textColor: 'text-neutral-800',
    borderAccent: 'border-neutral-200',
    badgeBg: 'bg-neutral-100',
    badgeText: 'text-neutral-800',
    displayName: 'Credit Issuer',
  },
};

export const LinkedInCardTimeline: React.FC<LinkedInCardTimelineProps> = ({
  card,
  onOpenProductChangeModal,
  onEditProductChange,
  onDeleteProductChange,
  initiallyExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  const branding = BANK_BRANDING[card.bank] || BANK_BRANDING.Other;
  const totalAccountDuration = formatLinkedInDuration(card.openDate, card.closedDate);
  const hasHistory = (card.productChanges || []).length > 0;
  const currentProductCatalog = hasHistory
    ? findCatalogCard(card.currentName, card.bank)
    : undefined;
  const currentProductImageUrl = currentProductCatalog?.imageUrl || card.imageUrl;
  const currentProductCardColor = currentProductCatalog?.cardColor || card.cardColor;
  const currentProductNetwork = currentProductCatalog?.network || card.network;

  // Chronologically sorted changes:
  // We want to reconstruct the full chronological stages from origin to present
  const sortedChanges = [...(card.productChanges || [])].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Construct stages from past to present:
  // Stage 0: Original Product (from openDate to sortedChanges[0].date or today)
  // Stage 1..N: Each subsequent product
  interface TimelineStage {
    id: string;
    productName: string;
    annualFee: number;
    startDate: string;
    endDate?: string;
    isPresent: boolean;
    isCurrent: boolean;
    duration: string;
    dateRangeText: string;
    roleTag: string;
    changeType?: 'downgrade' | 'upgrade' | 'lateral' | 'origin';
    feeDiff?: number;
    notes?: string;
    isOriginal: boolean;
  }

  const stages: TimelineStage[] = [];

  if (sortedChanges.length === 0) {
    // Single stage card (No product changes yet)
    stages.push({
      id: 'origin-stage',
      productName: card.currentName,
      annualFee: card.annualFee,
      startDate: card.openDate,
      endDate: card.closedDate,
      isPresent: card.status === 'active',
      isCurrent: true,
      duration: totalAccountDuration,
      dateRangeText: getLinkedInDateRange(
        card.openDate,
        card.closedDate,
        card.status === 'active'
      ),
      roleTag: 'Original Product · Active',
      changeType: 'origin',
      notes: card.notes || 'Original card opened. No product changes recorded.',
      isOriginal: true,
    });
  } else {
    // Multi-stage card!
    // 1. Stage 0: Original Product
    const firstChange = sortedChanges[0];
    stages.push({
      id: 'origin-stage',
      productName: card.originalName,
      annualFee: firstChange.fromAnnualFee,
      startDate: card.openDate,
      endDate: firstChange.date,
      isPresent: false,
      isCurrent: false,
      duration: formatLinkedInDuration(card.openDate, firstChange.date),
      dateRangeText: getLinkedInDateRange(card.openDate, firstChange.date, false),
      roleTag: 'Original Product',
      changeType: 'origin',
      notes:
        card.notes ||
        `Account opened as ${card.originalName}. Held for ${formatLinkedInDuration(
          card.openDate,
          firstChange.date
        )} before product change.`,
      isOriginal: true,
    });

    // 2. Intermediate stages
    for (let i = 0; i < sortedChanges.length; i++) {
      const change = sortedChanges[i];
      const nextChange = sortedChanges[i + 1];
      const isLatest = i === sortedChanges.length - 1;

      const startDate = change.date;
      const endDate = nextChange ? nextChange.date : card.closedDate;
      const isPresent = isLatest && card.status === 'active';
      const isCurrent = isLatest;
      const feeDiff = change.toAnnualFee - change.fromAnnualFee;

      let roleTag = 'Product Change';
      if (isPresent) {
        roleTag =
          change.changeType === 'downgrade'
            ? 'Current Active · Downgraded'
            : change.changeType === 'upgrade'
            ? 'Current Active · Upgraded'
            : 'Current Active Product';
      } else {
        roleTag =
          change.changeType === 'downgrade'
            ? 'Downgrade Stage'
            : change.changeType === 'upgrade'
            ? 'Upgrade Stage'
            : 'Lateral Stage';
      }

      stages.push({
        id: change.id,
        productName: change.toProductName,
        annualFee: change.toAnnualFee,
        startDate,
        endDate,
        isPresent,
        isCurrent,
        duration: formatLinkedInDuration(startDate, isPresent ? undefined : endDate),
        dateRangeText: getLinkedInDateRange(startDate, endDate, isPresent),
        roleTag,
        changeType: change.changeType,
        feeDiff,
        notes: change.notes,
        isOriginal: false,
      });
    }
  }

  // In LinkedIn Experience layout, roles are shown reverse-chronological:
  // Most recent role on top, earlier roles below it, original position at bottom.
  const reverseStages = [...stages].reverse();

  // Calculate net fee saved on this specific card
  let netFeeSaved = 0;
  if (hasHistory) {
    const originFee = stages[0].annualFee;
    const currentFee = card.annualFee;
    if (originFee > currentFee) {
      netFeeSaved = originFee - currentFee;
    }
  }

  return (
    <div
      className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden transition-all"
      id={`linkedin-card-timeline-${card.id}`}
    >
      {/* 1. Header: LinkedIn Company / Bank Block */}
      <div className="p-5 sm:p-6 border-b border-neutral-100 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Authentic Card / Bank Avatar */}
            <CardVisual
              variant="thumb"
              name={card.nickname || card.currentName}
              bank={card.bank}
              network={currentProductNetwork}
              imageUrl={currentProductImageUrl}
              cardColor={currentProductCardColor}
              className="w-16 h-10 shadow-xs shrink-0"
            />

            {/* Card & Overall Tenure Details */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">
                  {card.nickname || card.currentName}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-neutral-100 text-neutral-700">
                  {card.cardType === 'business' ? 'Business Credit' : 'Personal Line'}
                </span>
                {card.status === 'closed' ? (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-neutral-200 text-neutral-600">
                    Account Closed
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Active Account
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                <BankLogo bank={card.bank} size="xs" />
                <span>{branding.displayName}</span>
              </div>

              {/* Total Tenure (e.g. 2 yrs 5 mos) */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-700 font-semibold">
                <span>{totalAccountDuration}</span>
                <span className="text-neutral-400 font-normal">•</span>
                <span className="text-neutral-500 font-normal">
                  Account Opened {formatDate(card.openDate)}
                </span>
              </div>

              {/* Account Meta Subtitle */}
              <div className="flex items-center gap-3 text-xs text-neutral-500 flex-wrap pt-0.5">
                {card.creditLimit && (
                  <span>
                    Credit Line: <strong>${card.creditLimit.toLocaleString()}</strong>
                  </span>
                )}
                <span>•</span>
                <span>
                  Current Annual Fee: <strong>${card.annualFee}/yr</strong>
                </span>
                <span>•</span>
                <span className="text-neutral-600">
                  {hasHistory ? (
                    <span className="font-semibold text-indigo-700">
                      {card.productChanges.length} Product Change{card.productChanges.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    'Original Product'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & High-level Metrics */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {netFeeSaved > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved ${netFeeSaved}/yr</span>
              </div>
            )}

            <button
              onClick={() => onOpenProductChangeModal(card.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs"
              title="Record a product change for this card"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-600" />
              <span>Switch Card</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
              title={isExpanded ? 'Collapse timeline' : 'Expand timeline'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </div>

      {/* 2. The Connected Vertical Timeline (LinkedIn Experience Roles) */}
      {isExpanded && (
        <div className="p-5 sm:p-6 bg-white">
          <div className="relative pl-6 sm:pl-8 space-y-8">
            {/* Continuous Vertical Track Line */}
            <div className="absolute left-[11px] sm:left-[15px] top-3 bottom-3 w-[2px] bg-neutral-200" />

            {reverseStages.map((stage, idx) => {
              const isFirstInList = idx === 0; // The latest role
              const isLastInList = idx === reverseStages.length - 1; // The original opening
              const isDowngrade = stage.changeType === 'downgrade';
              const isUpgrade = stage.changeType === 'upgrade';
              const catalogProduct = findCatalogCard(stage.productName, card.bank);
              const stageImageUrl = catalogProduct?.imageUrl || card.imageUrl;
              const stageChange = card.productChanges?.find((change) => change.id === stage.id);

              return (
                <div key={stage.id} className="relative group">
                  {/* Timeline Node Bullet */}
                  <div className="absolute -left-[23px] sm:-left-[27px] top-1 z-10">
                    {stage.isCurrent && card.status === 'active' ? (
                      // Current product on an open account
                      <div
                        className="w-5 h-5 rounded-full bg-emerald-600 border-2 border-white ring-4 ring-emerald-100 shadow-2xs"
                        title="Present product (open)"
                      />
                    ) : stage.isCurrent ? (
                      // Current product on a closed account
                      <div
                        className="w-5 h-5 rounded-full bg-neutral-500 border-2 border-white ring-4 ring-neutral-100 shadow-2xs"
                        title="Present product (closed)"
                      />
                    ) : (
                      // Historical product
                      <div
                        className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white ring-4 ring-blue-50 shadow-2xs"
                        title="History product"
                      />
                    )}
                  </div>

                  {/* Role Content Block */}
                  <div className="space-y-2">
                    {/* Role Title & Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardVisual
                          variant="thumb"
                          name={stage.productName}
                          bank={card.bank}
                          network={catalogProduct?.network || card.network}
                          imageUrl={stageImageUrl}
                          cardColor={catalogProduct?.cardColor || card.cardColor}
                          className="w-12 h-7"
                        />
                        <h4 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                          {stage.productName}
                        </h4>

                        {/* Status Pills */}
                        {stage.isCurrent && card.status === 'active' && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                            Present Product (Open)
                          </span>
                        )}

                        {stage.isCurrent && card.status === 'closed' ? (
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-neutral-200 text-neutral-700">
                            Present Product (Closed)
                          </span>
                        ) : !stage.isCurrent && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-neutral-100 text-neutral-700">
                            History Product
                          </span>
                        )}

                        {isDowngrade && (
                          <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3 text-emerald-600" />
                            Fee Downgrade
                          </span>
                        )}

                        {isUpgrade && (
                          <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-purple-600" />
                            Card Upgrade
                          </span>
                        )}
                      </div>

                      {/* Product-change actions */}
                      {!stage.isOriginal && stageChange && (onEditProductChange || onDeleteProductChange) && (
                        <div className="flex items-center gap-2 self-start">
                          {onEditProductChange && (
                            <button
                              onClick={() => onEditProductChange(card.id, stageChange)}
                              className="text-neutral-400 hover:text-indigo-600 text-xs flex items-center gap-1"
                              title="Edit this product change"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                          )}
                          {onDeleteProductChange && (
                            <button
                              onClick={() => onDeleteProductChange(card.id, stage.id)}
                              className="text-neutral-400 hover:text-red-600 text-xs flex items-center gap-1"
                              title="Remove this product change entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* LinkedIn Dates Line (e.g. "Apr 2025 – Present · 1 yr 5 mos") */}
                    <div className="text-xs sm:text-sm font-medium text-neutral-600 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{stage.dateRangeText}</span>
                    </div>

                    {/* Terms & Financial Attributes */}
                    <div className="flex items-center gap-3 text-xs text-neutral-500 flex-wrap">
                      <span className="font-semibold text-neutral-800">
                        Annual Fee: ${stage.annualFee}/yr
                      </span>

                      {stage.feeDiff !== undefined && stage.feeDiff !== 0 && (
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-md ${
                            stage.feeDiff < 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {stage.feeDiff < 0
                            ? `Eliminated $${Math.abs(stage.feeDiff)}/yr`
                            : `+$${stage.feeDiff}/yr fee increase`}
                        </span>
                      )}

                      <span>•</span>
                      <span>{card.network}</span>
                    </div>

                    {/* Transition Bridge Indicator between stages */}
                    {!isLastInList && (
                      <div className="pt-2 flex items-center gap-2 text-[11px] text-neutral-400 font-medium">
                        <ArrowRightLeft className="w-3 h-3 text-neutral-400" />
                        <span>
                          {reverseStages[idx + 1].productName} held prior to this product
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
