import React, { useState } from 'react';
import { CreditCard, ProductChange, Bank } from '../types';
import { CardVisual } from './CardVisual';
import { BankLogo } from './BankLogo';
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
  Sparkles,
  ShieldCheck,
  Building2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface LinkedInCardTimelineProps {
  card: CreditCard;
  onOpenProductChangeModal: (cardId: string) => void;
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
  onDeleteProductChange,
  initiallyExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  const branding = BANK_BRANDING[card.bank] || BANK_BRANDING.Other;
  const totalAccountDuration = formatLinkedInDuration(card.openDate, card.closedDate);
  const hasHistory = (card.productChanges || []).length > 0;

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
              network={card.network}
              imageUrl={card.imageUrl}
              cardColor={card.cardColor}
              className="w-16 h-10 shadow-xs shrink-0"
            />

            {/* Bank & Overall Tenure Details */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">
                  {branding.displayName}
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

        {/* 2. "What this card used to be" Clarity Callout */}
        {hasHistory && (
          <div className="mt-4 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-neutral-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Card Evolution:
              </span>
              <span className="font-medium text-neutral-500 line-through">
                {card.originalName} (${stages[0].annualFee}/yr)
              </span>
              <span className="text-neutral-400 font-bold">➔</span>
              <span className="font-bold text-neutral-900 bg-white px-2.5 py-0.5 rounded-md border border-neutral-200 text-indigo-950" title={card.currentName}>
                {card.nickname || card.currentName} (${card.annualFee}/yr)
              </span>
            </div>

            <div className="text-neutral-500 text-[11px] flex items-center gap-1.5 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Credit age & credit line remain continuous</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. The Connected Vertical Timeline (LinkedIn Experience Roles) */}
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

              return (
                <div key={stage.id} className="relative group">
                  {/* Timeline Node Bullet */}
                  <div className="absolute -left-[23px] sm:-left-[27px] top-1 z-10">
                    {stage.isPresent ? (
                      // Active Present Node: Pulsing emerald / solid ring
                      <div className="w-5 h-5 rounded-full bg-emerald-600 border-2 border-white ring-4 ring-emerald-100 flex items-center justify-center shadow-2xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    ) : stage.isOriginal ? (
                      // Original Foundation Node
                      <div className="w-5 h-5 rounded-full bg-neutral-800 border-2 border-white ring-4 ring-neutral-100 flex items-center justify-center shadow-2xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    ) : (
                      // Intermediate Role Node
                      <div className="w-5 h-5 rounded-full bg-white border-2 border-indigo-600 ring-4 ring-indigo-50 flex items-center justify-center shadow-2xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      </div>
                    )}
                  </div>

                  {/* Role Content Block */}
                  <div className="space-y-2">
                    {/* Role Title & Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                          {stage.productName}
                        </h4>

                        {/* Status Pills */}
                        {stage.isPresent && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                            Present Product
                          </span>
                        )}

                        {stage.isOriginal && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-neutral-100 text-neutral-700">
                            Original Account Product
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

                      {/* If intermediate product change, allow delete button */}
                      {!stage.isOriginal && onDeleteProductChange && (
                        <button
                          onClick={() => onDeleteProductChange(card.id, stage.id)}
                          className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 text-xs flex items-center gap-1 transition-opacity self-start"
                          title="Remove this product change entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete entry</span>
                        </button>
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

                    {/* Notes & Strategic Context (LinkedIn style role description) */}
                    {Boolean(stage.notes && stage.notes.trim().length > 0) && (
                      <div className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-100 leading-relaxed">
                        <span className="font-semibold text-neutral-800 mr-1">
                          {stage.isPresent
                            ? 'Current Product Notes:'
                            : stage.isOriginal
                            ? 'Opening Strategy:'
                            : 'Switch Strategy:'}
                        </span>
                        {stage.notes.trim()}
                      </div>
                    )}

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
