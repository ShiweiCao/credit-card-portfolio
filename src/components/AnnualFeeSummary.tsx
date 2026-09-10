import React, { useState } from 'react';
import { CreditCard, UpcomingFeeItem } from '../types';
import { getNextRenewalDate, getDaysUntil, formatDate, formatMonthDay } from '../utils/dateUtils';
import { CardVisual } from './CardVisual';
import { BankLogo } from './BankLogo';
import {
  DollarSign,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  HelpCircle,
  Building2,
} from 'lucide-react';

interface AnnualFeeSummaryProps {
  cards: CreditCard[];
  onOpenProductChange: (cardId?: string) => void;
}

export const AnnualFeeSummary: React.FC<AnnualFeeSummaryProps> = ({
  cards,
  onOpenProductChange,
}) => {
  const [filterWindow, setFilterWindow] = useState<'30' | '60' | '90' | 'all'>('all');

  const activeCards = cards.filter((c) => c.status === 'active');

  // Sum up all annual fees for active cards
  const totalAnnualFee = activeCards.reduce((sum, card) => sum + (card.annualFee || 0), 0);
  const monthlyAverage = totalAnnualFee / 12;

  // Breakdown by bank
  const feesByBank: Record<string, { total: number; count: number; feeCards: number }> = {};
  activeCards.forEach((c) => {
    if (!feesByBank[c.bank]) {
      feesByBank[c.bank] = { total: 0, count: 0, feeCards: 0 };
    }
    feesByBank[c.bank].total += c.annualFee || 0;
    feesByBank[c.bank].count += 1;
    if (c.annualFee > 0) {
      feesByBank[c.bank].feeCards += 1;
    }
  });

  // Calculate upcoming fee items for all active cards with fee > 0
  const upcomingFees: UpcomingFeeItem[] = activeCards
    .filter((c) => c.annualFee > 0)
    .map((c) => {
      const nextRenewalDate = getNextRenewalDate(c.openDate, c.feeRenewalDate);
      const daysUntil = getDaysUntil(nextRenewalDate);
      let status: UpcomingFeeItem['status'] = 'later';
      if (daysUntil <= 30) status = 'due-soon';
      else if (daysUntil <= 60) status = 'upcoming';

      return {
        card: c,
        nextRenewalDate,
        daysUntil,
        amount: c.annualFee,
        status,
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  // Filtered upcoming fees
  const filteredUpcoming = upcomingFees.filter((item) => {
    if (filterWindow === '30') return item.daysUntil <= 30;
    if (filterWindow === '60') return item.daysUntil <= 60;
    if (filterWindow === '90') return item.daysUntil <= 90;
    return true;
  });

  const dueSoonCount = upcomingFees.filter((f) => f.daysUntil <= 30).length;

  // Month by month distribution (0 = Jan, 11 = Dec)
  const monthlyDistribution = Array(12).fill(0);
  upcomingFees.forEach((f) => {
    const monthIndex = parseInt(f.nextRenewalDate.split('-')[1], 10) - 1;
    monthlyDistribution[monthIndex] += f.amount;
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maxMonthFee = Math.max(...monthlyDistribution, 1);

  return (
    <div className="space-y-6" id="annual-fee-summary-view">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sum Up */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Total Annual Fees
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-neutral-900">
              ${totalAnnualFee.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500 font-medium">/ year</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Across {activeCards.length} active cards ({upcomingFees.length} with fee)
          </p>
        </div>

        {/* Monthly Average */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Monthly Average
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-neutral-900">
              ${Math.round(monthlyAverage).toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500 font-medium">/ month</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Amortized cost of maintaining your portfolio
          </p>
        </div>

        {/* Imminent Renewals (< 30 Days) */}
        <div
          className={`rounded-2xl p-5 border shadow-xs transition-colors ${
            dueSoonCount > 0
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Due in Next 30 Days
            </span>
            <div
              className={`p-2 rounded-xl ${
                dueSoonCount > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold tracking-tight ${
                dueSoonCount > 0 ? 'text-amber-950' : 'text-neutral-900'
              }`}
            >
              {dueSoonCount}
            </span>
            <span className="text-xs text-neutral-500 font-medium">
              card{dueSoonCount !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            {dueSoonCount > 0
              ? 'Evaluate retention offer or downgrade soon'
              : 'No immediate fees due in the next 30 days'}
          </p>
        </div>

        {/* No-fee Ratio */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              $0 Annual Fee Cards
            </span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-neutral-900">
              {activeCards.filter((c) => c.annualFee === 0).length}
            </span>
            <span className="text-xs text-neutral-500 font-medium">
              / {activeCards.length} cards
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Keep indefinitely to preserve credit age
          </p>
        </div>
      </div>

      {/* 12-Month Fee Distribution Bar Schedule */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-600" />
              12-Month Annual Fee Schedule
            </h3>
            <p className="text-xs text-neutral-500">
              Visualizing which months incur membership fees across the calendar year
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 self-start sm:self-auto">
            Annual Total: ${totalAnnualFee}
          </span>
        </div>

        {/* Monthly Bars */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-2">
          {monthNames.map((month, idx) => {
            const amount = monthlyDistribution[idx];
            const heightPercent = maxMonthFee > 0 ? (amount / maxMonthFee) * 100 : 0;
            const hasFee = amount > 0;

            return (
              <div key={month} className="flex flex-col items-center">
                <div className="h-24 w-full flex items-end justify-center bg-neutral-50 rounded-lg p-1 relative group">
                  {hasFee ? (
                    <div
                      style={{ height: `${Math.max(15, heightPercent)}%` }}
                      className="w-full rounded-md bg-indigo-600 transition-all group-hover:bg-indigo-700"
                    />
                  ) : (
                    <div className="w-full h-1 bg-neutral-200 rounded-full" />
                  )}

                  {/* Tooltip on hover */}
                  {hasFee && (
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 p-2 bg-neutral-900 text-white text-[11px] rounded-md whitespace-nowrap shadow-md">
                      {month}: ${amount}
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-medium text-neutral-600 mt-1.5">
                  {month}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {amount > 0 ? `$${amount}` : '$0'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Fee Reminders & Action Board */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-600" />
              Annual Fee Date Reminders & Action Alerts
            </h3>
            <p className="text-xs text-neutral-500">
              Never get surprised by an annual fee. Plan retention calls or product changes before renewal.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl self-start sm:self-auto text-xs">
            <button
              onClick={() => setFilterWindow('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterWindow === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All ({upcomingFees.length})
            </button>
            <button
              onClick={() => setFilterWindow('30')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterWindow === '30'
                  ? 'bg-white text-amber-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Next 30 Days ({upcomingFees.filter((f) => f.daysUntil <= 30).length})
            </button>
            <button
              onClick={() => setFilterWindow('60')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterWindow === '60'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Next 60 Days
            </button>
            <button
              onClick={() => setFilterWindow('90')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterWindow === '90'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Next 90 Days
            </button>
          </div>
        </div>

        {/* Retention Policy Helper Box */}
        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-3 text-xs text-blue-950">
          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">Pro-Tip for Card Annual Fee Renewal:</span>
            <p className="text-blue-900/90 leading-relaxed">
              Most major issuers (like Chase and Amex) provide a <strong>30-day grace period</strong> after the annual fee posts to your statement. You can call customer service to request a <strong>retention bonus offer</strong> (spending credit or bonus points to offset the fee), or <strong>product change (downgrade)</strong> to a $0 annual fee card to receive a 100% refund of the annual fee while keeping your account history and credit line intact!
            </p>
          </div>
        </div>

        {/* List of upcoming fees */}
        {filteredUpcoming.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 text-sm">
            No annual fees scheduled in this timeframe.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUpcoming.map((item) => {
              const isUrgent = item.daysUntil <= 30;

              return (
                <div
                  key={item.card.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isUrgent
                      ? 'bg-amber-50/40 border-amber-300/80 shadow-xs'
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <CardVisual
                      variant="thumb"
                      name={item.card.nickname || item.card.currentName}
                      bank={item.card.bank}
                      network={item.card.network}
                      imageUrl={item.card.imageUrl}
                      cardColor={item.card.cardColor}
                      className="mt-0.5"
                    />

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-neutral-900" title={item.card.currentName}>
                          {item.card.nickname || item.card.currentName}
                        </h4>
                        <BankLogo bank={item.card.bank} size="xs" variant="pill" />
                        {item.card.cardType === 'business' && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-indigo-50 text-indigo-700">
                            Business
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500">
                        <span>
                          Renewal Date: <strong>{formatDate(item.nextRenewalDate)}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Opened: {formatMonthDay(item.card.openDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Amount, countdown badge, action button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                    <div className="text-right">
                      <span className="text-lg font-bold text-neutral-900 block">
                        ${item.amount}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block ${
                          item.daysUntil <= 15
                            ? 'bg-red-100 text-red-800 animate-pulse'
                            : item.daysUntil <= 30
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {item.daysUntil === 0
                          ? 'Due today!'
                          : `Due in ${item.daysUntil} day${item.daysUntil !== 1 ? 's' : ''}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenProductChange(item.card.id)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 transition-colors shadow-xs"
                      title="Switch / Product Change to a no-fee or alternate card"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Switch / Downgrade</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Breakdown By Bank */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
        <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-neutral-600" />
          Annual Fee Breakdown by Bank / Issuer
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(feesByBank).map(([bankName, data]) => {
            const percentage = totalAnnualFee > 0 ? (data.total / totalAnnualFee) * 100 : 0;
            return (
              <div
                key={bankName}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BankLogo bank={bankName} size="xs" variant="badge" />
                    <span className="font-semibold text-sm text-neutral-900">{bankName}</span>
                  </div>
                  <span className="font-bold text-sm text-neutral-900">${data.total}/yr</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span>{data.count} card{data.count !== 1 ? 's' : ''} ({data.feeCards} fee-bearing)</span>
                  <span>{Math.round(percentage)}% of total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
