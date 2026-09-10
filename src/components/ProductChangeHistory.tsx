import React, { useState } from 'react';
import { CreditCard, ProductChange, Bank } from '../types';
import { formatDate } from '../utils/dateUtils';
import { LinkedInCardTimeline } from './LinkedInCardTimeline';
import { BankLogo } from './BankLogo';
import {
  ArrowRightLeft,
  TrendingDown,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Building2,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  ListFilter,
  Milestone,
} from 'lucide-react';

interface ProductChangeHistoryProps {
  cards: CreditCard[];
  onOpenProductChangeModal: (cardId?: string) => void;
  onDeleteProductChange: (cardId: string, changeId: string) => void;
  selectedCardId?: string;
}

export const ProductChangeHistory: React.FC<ProductChangeHistoryProps> = ({
  cards,
  onOpenProductChangeModal,
  onDeleteProductChange,
  selectedCardId,
}) => {
  const [viewMode, setViewMode] = useState<'linkedin' | 'log'>('linkedin');
  const [cardScope, setCardScope] = useState<'with-history' | 'all'>('with-history');
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Flatten all product changes across all cards with card metadata
  const allChanges: Array<{
    change: ProductChange;
    card: CreditCard;
  }> = [];

  cards.forEach((card) => {
    (card.productChanges || []).forEach((change) => {
      allChanges.push({
        change,
        card,
      });
    });
  });

  // Sort chronologically descending (newest switch first)
  allChanges.sort((a, b) => b.change.date.localeCompare(a.change.date));

  // Calculate total fee saved across downgrades
  let totalSaved = 0;
  allChanges.forEach(({ change }) => {
    const diff = change.toAnnualFee - change.fromAnnualFee;
    if (diff < 0) totalSaved += Math.abs(diff);
  });

  // Cards with at least one product change
  const cardsWithChanges = cards.filter((c) => (c.productChanges || []).length > 0);

  // Filter cards for the LinkedIn timeline view
  const timelineCards = cards.filter((card) => {
    // Scope filter
    if (cardScope === 'with-history' && (!card.productChanges || card.productChanges.length === 0)) {
      return false;
    }

    // Bank filter
    if (selectedBankFilter !== 'all' && card.bank !== selectedBankFilter) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchesCurrent = card.currentName.toLowerCase().includes(q) || (card.nickname && card.nickname.toLowerCase().includes(q));
      const matchesOriginal = card.originalName.toLowerCase().includes(q);
      const matchesBank = card.bank.toLowerCase().includes(q);
      const matchesPast = (card.productChanges || []).some(
        (pc) =>
          pc.fromProductName.toLowerCase().includes(q) ||
          pc.toProductName.toLowerCase().includes(q) ||
          (pc.notes && pc.notes.toLowerCase().includes(q))
      );
      return matchesCurrent || matchesOriginal || matchesBank || matchesPast;
    }

    return true;
  });

  // Filter raw switch events for Log view
  const filteredChanges = allChanges.filter((item) => {
    if (selectedBankFilter !== 'all' && item.card.bank !== selectedBankFilter) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.card.bank.toLowerCase().includes(q) ||
        item.change.fromProductName.toLowerCase().includes(q) ||
        item.change.toProductName.toLowerCase().includes(q) ||
        (item.change.notes && item.change.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6" id="product-change-history-view">
      {/* 1. Top Banner & Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Switches */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Switches Recorded
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-neutral-900">
              {allChanges.length}
            </span>
            <span className="text-xs text-neutral-500 font-medium">product changes</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Across {cardsWithChanges.length} transformed card account{cardsWithChanges.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Net Fees Saved */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Annual Fees Eliminated
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-700">
              ${totalSaved}
            </span>
            <span className="text-xs text-neutral-500 font-medium">/ year saved</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Saved via strategic fee-free downgrades while keeping cards alive
          </p>
        </div>

        {/* Credit History Preserved */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Credit Bureau Age
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900">
              100% Preserved
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Account open dates & credit lines remain unbroken across all switches
          </p>
        </div>
      </div>

      {/* 2. Controls Toolbar & View Switcher */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Milestone className="w-5 h-5 text-indigo-700" />
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                Card Experience & Evolution Timelines
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              LinkedIn-style career progression for your credit cards — clearly showing what each card used to be, duration held, and fee transitions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs font-semibold">
              <button
                id="view-mode-linkedin"
                onClick={() => setViewMode('linkedin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'linkedin'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>LinkedIn Timeline</span>
              </button>

              <button
                id="view-mode-log"
                onClick={() => setViewMode('log')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'log'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5 text-neutral-500" />
                <span>Switch Log ({allChanges.length})</span>
              </button>
            </div>

            <button
              id="record-switch-btn-history-view"
              onClick={() => onOpenProductChangeModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Switch</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by past/current product or bank..."
              className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Scope Filter for LinkedIn View */}
            {viewMode === 'linkedin' && (
              <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setCardScope('with-history')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    cardScope === 'with-history'
                      ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Switched Cards ({cardsWithChanges.length})
                </button>
                <button
                  onClick={() => setCardScope('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    cardScope === 'all'
                      ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  All Accounts ({cards.length})
                </button>
              </div>
            )}

            {/* Bank Select */}
            <select
              value={selectedBankFilter}
              onChange={(e) => setSelectedBankFilter(e.target.value)}
              className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              <option value="all">All Banks</option>
              {Array.from(new Set(cards.map((c) => c.bank))).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Main Content: Either LinkedIn Timeline OR Switch Log */}
      {viewMode === 'linkedin' ? (
        <div className="space-y-6">
          {timelineCards.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-800">
                  {cardScope === 'with-history'
                    ? 'No Switched Cards Match Your Filters'
                    : 'No Accounts Found'}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {cardScope === 'with-history'
                    ? 'Switch to "All Accounts" to view timelines for every credit line, or record your first card product switch.'
                    : 'Try clearing your search or bank filter.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                {cardScope === 'with-history' && (
                  <button
                    onClick={() => setCardScope('all')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                  >
                    View All Accounts
                  </button>
                )}
                <button
                  onClick={() => onOpenProductChangeModal()}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-medium hover:bg-neutral-800 transition-colors"
                >
                  Record Card Switch
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {timelineCards.map((card) => (
                <LinkedInCardTimeline
                  key={card.id}
                  card={card}
                  onOpenProductChangeModal={onOpenProductChangeModal}
                  onDeleteProductChange={onDeleteProductChange}
                  initiallyExpanded={true}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Flat Switch Log View */
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-neutral-600" />
              Individual Product Switch Transactions
            </h3>
            <span className="text-xs text-neutral-500">
              Showing {filteredChanges.length} of {allChanges.length} entries
            </span>
          </div>

          {filteredChanges.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 text-xs">
              No matching switch transactions found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChanges.map(({ change, card }) => {
                const feeDiff = change.toAnnualFee - change.fromAnnualFee;
                const isDowngrade = change.changeType === 'downgrade' || feeDiff < 0;
                const isUpgrade = change.changeType === 'upgrade' || feeDiff > 0;

                return (
                  <div
                    key={change.id}
                    className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <BankLogo bank={card.bank} size="xs" variant="pill" />
                        <span className="text-sm font-bold text-neutral-900 ml-1 mr-2">
                          {card.nickname || card.currentName}
                        </span>
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Switch Date: <strong>{formatDate(change.date)}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                            isDowngrade
                              ? 'bg-emerald-100 text-emerald-800'
                              : isUpgrade
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {change.changeType}
                        </span>

                        <button
                          onClick={() => onDeleteProductChange(card.id, change.id)}
                          className="p-1 text-neutral-400 hover:text-red-600 rounded-md transition-colors"
                          title="Delete product change log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-white border border-neutral-200/80">
                      <div className="flex-1">
                        <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                          Previous Product (Used to be)
                        </span>
                        <span className="text-sm font-semibold text-neutral-900 block">
                          {change.fromProductName}
                        </span>
                        <span className="text-xs text-neutral-500">
                          Annual Fee: ${change.fromAnnualFee}/yr
                        </span>
                      </div>

                      <div className="flex items-center gap-2 justify-center py-1 sm:py-0">
                        <div className="p-1.5 rounded-full bg-neutral-100 text-neutral-600">
                          <ArrowRightLeft className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                            feeDiff < 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : feeDiff > 0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {feeDiff < 0
                            ? `-$${Math.abs(feeDiff)}/yr`
                            : feeDiff > 0
                            ? `+$${feeDiff}/yr`
                            : '$0 diff'}
                        </span>
                      </div>

                      <div className="flex-1 sm:text-right">
                        <span className="text-[10px] uppercase font-semibold text-indigo-600 block">
                          Transformed To (Now)
                        </span>
                        <span className="text-sm font-semibold text-indigo-950 block">
                          {change.toProductName}
                        </span>
                        <span className="text-xs text-neutral-600">
                          New Fee: <strong>${change.toAnnualFee}/yr</strong>
                        </span>
                      </div>
                    </div>

                    {Boolean(change.notes && change.notes.trim().length > 0) && (
                      <div className="text-xs text-neutral-600 bg-white p-2.5 rounded-lg border border-neutral-200/50">
                        <span className="font-semibold text-neutral-700 mr-1">Notes:</span>
                        {change.notes.trim()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Strategic Guide: How Product Changes & Credit Lines Work */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 text-white shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">
            How Credit Card Product Changes Work (The "LinkedIn Role Switch" Strategy)
          </h3>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
          When you product change (PC) a card instead of closing it, major banks (Chase, Amex, Citi, Capital One) keep your original credit line open and maintain your account age without triggering a hard pull.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="font-bold text-white block mb-1">1. Same Credit Line</span>
            <span className="text-neutral-300">
              Your existing credit limit is transferred 100% to the new card product, preventing score drops from limit loss.
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="font-bold text-white block mb-1">2. Same Account Age</span>
            <span className="text-neutral-300">
              Credit bureaus retain your initial open date, lengthening your average age of accounts (AAoA) forever.
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="font-bold text-white block mb-1">3. 5/24 Neutral</span>
            <span className="text-neutral-300">
              Product changes do NOT count as a new account under Chase 5/24, because no new credit account was created.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
