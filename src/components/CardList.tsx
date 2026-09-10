import React, { useState } from 'react';
import { CreditCard, Bank, CardType } from '../types';
import { formatDate, getNextRenewalDate, getDaysUntil, isWithinPastMonths, isWithinPastDays } from '../utils/dateUtils';
import { CardVisual } from './CardVisual';
import { BankLogo, NetworkLogo } from './BankLogo';
import {
  CreditCard as CardIcon,
  Search,
  Plus,
  ArrowRightLeft,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  ShieldAlert,
  CheckCircle2,
  History,
  Building2,
  Filter,
} from 'lucide-react';

interface CardListProps {
  cards: CreditCard[];
  onAddCard: () => void;
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (cardId: string) => void;
  onOpenProductChange: (cardId: string) => void;
  onViewProductChangeHistory: () => void;
  onViewLinkedInTimeline?: (card: CreditCard) => void;
}

export const CardList: React.FC<CardListProps> = ({
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onOpenProductChange,
  onViewProductChangeHistory,
  onViewLinkedInTimeline,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');

  const filteredCards = cards.filter((card) => {
    // Search
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (card.nickname && card.nickname.toLowerCase().includes(searchLower)) ||
      card.currentName.toLowerCase().includes(searchLower) ||
      card.originalName.toLowerCase().includes(searchLower) ||
      card.bank.toLowerCase().includes(searchLower) ||
      (card.notes && card.notes.toLowerCase().includes(searchLower));

    // Bank
    const matchesBank = selectedBank === 'all' || card.bank === selectedBank;

    // Type
    const matchesType = selectedType === 'all' || card.cardType === selectedType;

    // Status
    const matchesStatus = selectedStatus === 'all' || card.status === selectedStatus;

    return matchesSearch && matchesBank && matchesType && matchesStatus;
  });

  const allBanks = Array.from(new Set(cards.map((c) => c.bank)));

  return (
    <div className="space-y-6" id="card-list-view">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="card-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cards by name, bank, or notes..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="add-card-toolbar-btn"
              onClick={onAddCard}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Card</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 text-xs">
          <span className="text-neutral-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* Bank Select */}
          <select
            id="filter-bank-select"
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="all">All Banks ({cards.length})</option>
            {allBanks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Type Select */}
          <select
            id="filter-type-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="all">Personal & Business</option>
            <option value="personal">Personal Cards Only</option>
            <option value="business">Business Cards Only</option>
          </select>

          {/* Status Select */}
          <select
            id="filter-status-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="active">Active Cards</option>
            <option value="closed">Closed Cards</option>
            <option value="all">All Statuses</option>
          </select>

          {(searchTerm || selectedBank !== 'all' || selectedType !== 'all' || selectedStatus !== 'active') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBank('all');
                setSelectedType('all');
                setSelectedStatus('active');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-neutral-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <CardIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900">No cards matched your criteria</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search terms or filters, or add a new card to your portfolio.
          </p>
          <button
            onClick={onAddCard}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-medium hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Card</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCards.map((card) => {
            const hasProductChange = (card.productChanges || []).length > 0;
            const nextRenewal = getNextRenewalDate(card.openDate, card.feeRenewalDate);
            const daysUntilFee = getDaysUntil(nextRenewal);
            const countsFor524 = card.cardType === 'personal' && isWithinPastMonths(card.openDate, 24);

            let bofaBadge = null;
            if (card.bank === 'Bank of America') {
              if (isWithinPastMonths(card.openDate, 2)) {
                bofaBadge = { label: 'BofA 2/2', color: 'bg-red-50 text-red-900 border-red-200/80', iconColor: 'text-red-700' };
              } else if (isWithinPastMonths(card.openDate, 12)) {
                bofaBadge = { label: 'BofA 3/12', color: 'bg-orange-50 text-orange-900 border-orange-200/80', iconColor: 'text-orange-700' };
              } else if (isWithinPastMonths(card.openDate, 24)) {
                bofaBadge = { label: 'BofA 4/24', color: 'bg-yellow-50 text-yellow-900 border-yellow-200/80', iconColor: 'text-yellow-700' };
              }
            }

            let citiBadge = null;
            if (card.bank === 'Citi') {
              if (isWithinPastDays(card.openDate, 8)) {
                citiBadge = { label: 'Citi 8-Day', color: 'bg-blue-50 text-blue-900 border-blue-200/80', iconColor: 'text-blue-700' };
              } else if (isWithinPastDays(card.openDate, 65)) {
                citiBadge = { label: 'Citi 65-Day', color: 'bg-cyan-50 text-cyan-900 border-cyan-200/80', iconColor: 'text-cyan-700' };
              }
            }

            return (
              <div
                key={card.id}
                id={`card-item-${card.id}`}
                className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  card.status === 'closed'
                    ? 'border-neutral-200 opacity-75'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {/* Visual Card Top Header */}
                <div className={`p-4 bg-gradient-to-r ${card.cardColor || 'from-neutral-800 to-neutral-950'} text-white relative overflow-hidden`}>
                  {card.imageUrl && (
                    <div className="absolute -right-4 -bottom-4 w-32 h-20 opacity-15 pointer-events-none rotate-6">
                      <img
                        src={card.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BankLogo bank={card.bank} size="xs" variant="white" />
                      <span className="text-xs font-semibold tracking-wider uppercase opacity-95">
                        {card.bank}
                      </span>
                    </div>
                    <NetworkLogo network={card.network} size="xs" variant="badge" />
                  </div>

                  <div className="relative z-10 mt-3 flex items-center gap-3">
                    <CardVisual
                      variant="thumb"
                      name={card.nickname || card.currentName}
                      bank={card.bank}
                      network={card.network}
                      imageUrl={card.imageUrl}
                      cardColor={card.cardColor}
                      className="w-12 h-8"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold tracking-tight truncate" title={card.nickname || card.currentName}>
                        {card.nickname || card.currentName}
                      </h3>
                      <div className="text-[11px] text-white/70 truncate leading-none mt-0.5 min-h-[14px]" title={card.nickname ? card.currentName : undefined}>
                        {card.nickname ? card.currentName : '\u00A0'}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-4 flex items-center justify-between text-xs text-white/90 pt-2 border-t border-white/15">
                    <span>Opened: {formatDate(card.openDate)}</span>
                    <span className="font-bold text-sm">
                      {card.annualFee > 0 ? `$${card.annualFee}/yr` : '$0 Fee'}
                    </span>
                  </div>
                </div>

                {/* Card Body Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white text-xs">
                  {/* Velocity Badges */}
                  {(countsFor524 || bofaBadge || citiBadge) && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {countsFor524 && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-xs bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs"
                          title="Counts towards Chase 5/24 rule"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>5/24</span>
                        </span>
                      )}
                      {bofaBadge && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-xs border shadow-2xs ${bofaBadge.color}`}
                          title={`Counts towards ${bofaBadge.label} rule`}
                        >
                          <ShieldAlert className={`w-3.5 h-3.5 shrink-0 ${bofaBadge.iconColor}`} />
                          <span>{bofaBadge.label}</span>
                        </span>
                      )}
                      {citiBadge && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-xs border shadow-2xs ${citiBadge.color}`}
                          title={`Counts towards ${citiBadge.label} rule`}
                        >
                          <ShieldAlert className={`w-3.5 h-3.5 shrink-0 ${citiBadge.iconColor}`} />
                          <span>{citiBadge.label}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Renewal reminder */}
                  {card.status === 'active' && card.annualFee > 0 && (
                    <div
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
                        daysUntilFee <= 30
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950 font-medium'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Fee Renewal: {formatDate(nextRenewal)}</span>
                      </div>
                      <span
                        className={`font-semibold ${
                          daysUntilFee <= 30 ? 'text-amber-800' : 'text-neutral-700'
                        }`}
                      >
                        {daysUntilFee <= 0 ? 'Due now' : `In ${daysUntilFee} days`}
                      </span>
                    </div>
                  )}

                  {/* Notes (only shown if there is real content) */}
                  {Boolean(card.notes && card.notes.trim().length > 0) && (
                    <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed italic">
                      "{card.notes!.trim()}"
                    </p>
                  )}

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Switch / PC button */}
                      <button
                        type="button"
                        onClick={() => onOpenProductChange(card.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-800 transition-colors"
                        title="Switch product (e.g. downgrade/upgrade)"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Switch</span>
                      </button>

                      {/* LinkedIn Timeline button */}
                      <button
                        type="button"
                        onClick={() =>
                          onViewLinkedInTimeline
                            ? onViewLinkedInTimeline(card)
                            : onViewProductChangeHistory()
                        }
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          hasProductChange
                            ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                            : 'border border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                        }`}
                        title="View LinkedIn-style career progression timeline for this card"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Timeline</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditCard(card)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                        title="Edit card details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteCard(card.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-neutral-100 transition-colors"
                        title="Delete card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
