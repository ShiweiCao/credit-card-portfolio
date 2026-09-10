import React, { useState } from 'react';
import { CreditCard, FiveTwentyFourStatus, BankRuleCheckResult } from '../types';
import { calculateChase524, evaluateBankRules } from '../utils/rulesEngine';
import { formatDate } from '../utils/dateUtils';
import { BankLogo } from './BankLogo';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Calendar,
  Info,
  Clock,
  HelpCircle,
  Award,
  Sparkles,
  Search,
} from 'lucide-react';

interface EligibilityTrackerProps {
  cards: CreditCard[];
}

export const EligibilityTracker: React.FC<EligibilityTrackerProps> = ({ cards }) => {
  const fiveTwentyFour: FiveTwentyFourStatus = calculateChase524(cards);
  const ruleResults: BankRuleCheckResult[] = evaluateBankRules(cards);

  const [selectedBankFilter, setSelectedBankFilter] = useState<string>('all');
  const [simulatorCard, setSimulatorCard] = useState<string>('Chase Sapphire Preferred');

  // Popular cards for the interactive checker
  const SIMULATION_TARGETS = [
    { name: 'Chase Sapphire Preferred', bank: 'Chase', type: 'personal', family: 'sapphire' },
    { name: 'Chase Sapphire Reserve', bank: 'Chase', type: 'personal', family: 'sapphire' },
    { name: 'Chase Freedom Flex', bank: 'Chase', type: 'personal', family: 'freedom' },
    { name: 'Chase Ink Business Preferred', bank: 'Chase', type: 'business', family: 'ink' },
    { name: 'American Express Gold Card', bank: 'American Express', type: 'personal', family: 'amex-gold' },
    { name: 'The Platinum Card from American Express', bank: 'American Express', type: 'personal', family: 'amex-plat' },
    { name: 'Blue Business Plus Credit Card', bank: 'American Express', type: 'business', family: 'amex-bbp' },
    { name: 'Citi Strata Premier', bank: 'Citi', type: 'personal', family: 'citi-premier' },
    { name: 'Citi Custom Cash', bank: 'Citi', type: 'personal', family: 'citi-custom' },
    { name: 'Capital One Venture X', bank: 'Capital One', type: 'personal', family: 'capone-vx' },
    { name: 'Bank of America Premium Rewards', bank: 'Bank of America', type: 'personal', family: 'bofa' },
  ];

  // Evaluate simulator target card
  const selectedTarget = SIMULATION_TARGETS.find((t) => t.name === simulatorCard) || SIMULATION_TARGETS[0];

  const runSimulation = () => {
    const checks: Array<{ name: string; passed: boolean; message: string; severity: 'success' | 'warning' | 'error' }> = [];

    // 1. Chase 5/24 Check
    if (selectedTarget.bank === 'Chase') {
      if (fiveTwentyFour.count >= 5) {
        checks.push({
          name: 'Chase 5/24 Rule',
          passed: false,
          severity: 'error',
          message: `Ineligible. You are at ${fiveTwentyFour.count}/24. Chase will auto-decline all personal and business card applications.`,
        });
      } else {
        checks.push({
          name: 'Chase 5/24 Rule',
          passed: true,
          severity: 'success',
          message: `Passed! You are at ${fiveTwentyFour.count}/24 (${5 - fiveTwentyFour.count} slot${5 - fiveTwentyFour.count !== 1 ? 's' : ''} remaining).`,
        });
      }

      // Check Sapphire rules
      if (selectedTarget.family === 'sapphire') {
        const hasActiveSapphire = cards.some(
          (c) =>
            c.status === 'active' &&
            c.bank === 'Chase' &&
            (c.currentName.toLowerCase().includes('sapphire') || c.originalName.toLowerCase().includes('sapphire') && !c.productChanges.length)
        );
        if (hasActiveSapphire) {
          checks.push({
            name: 'Sapphire "One-Card" Rule',
            passed: false,
            severity: 'error',
            message: 'Ineligible. You already hold an active Sapphire card. You must downgrade it to a Freedom card first.',
          });
        }

        const sapphireCards = cards.filter(
          (c) =>
            c.bank === 'Chase' &&
            (c.currentName.toLowerCase().includes('sapphire') || c.originalName.toLowerCase().includes('sapphire'))
        );
        if (sapphireCards.length > 0) {
          checks.push({
            name: 'Sapphire 48-Month Bonus Rule',
            passed: true,
            severity: 'warning',
            message: 'Note: Ensure at least 48 months have passed since your previous Sapphire welcome bonus was credited.',
          });
        }
      }

      // Business card specific rule
      if (selectedTarget.type === 'business') {
        checks.push({
          name: '5/24 Impact on Approval',
          passed: fiveTwentyFour.count < 5,
          severity: fiveTwentyFour.count < 5 ? 'success' : 'error',
          message:
            fiveTwentyFour.count < 5
              ? 'Bonus Advantage: Chase Ink business cards require you to be under 5/24 for approval, but approval will NOT add to your 5/24 count!'
              : 'Denied: Chase business cards require under 5/24.',
        });
      }
    }

    // 2. American Express Checks
    if (selectedTarget.bank === 'American Express') {
      const heldBefore = cards.some(
        (c) =>
          c.bank === 'American Express' &&
          (c.currentName.toLowerCase().includes(selectedTarget.name.toLowerCase().split(' ')[0]) ||
            c.originalName.toLowerCase().includes(selectedTarget.name.toLowerCase().split(' ')[0]))
      );
      if (heldBefore) {
        checks.push({
          name: 'Amex Once-Per-Lifetime Rule',
          passed: false,
          severity: 'warning',
          message: 'Warning: Amex restricts welcome bonuses to once per lifetime per card product (unless targeted with NLL offer).',
        });
      }

      // Check 5 card limit
      const amexRevolving = cards.filter(
        (c) =>
          c.status === 'active' &&
          c.bank === 'American Express' &&
          !['platinum', 'gold', 'green'].some((charge) => c.currentName.toLowerCase().includes(charge))
      ).length;

      if (amexRevolving >= 5 && !['platinum', 'gold', 'green'].some((charge) => selectedTarget.name.toLowerCase().includes(charge))) {
        checks.push({
          name: 'Amex 5 Credit Card Cap',
          passed: false,
          severity: 'error',
          message: 'Cap Reached: You hold 5 active Amex revolving credit cards. You must close one before applying.',
        });
      } else {
        checks.push({
          name: 'Amex 5 Credit Card Cap',
          passed: true,
          severity: 'success',
          message: `Revolving limit clear (${amexRevolving}/5 cards held).`,
        });
      }
    }

    // 3. Capital One Check
    if (selectedTarget.bank === 'Capital One') {
      const capOnePersonal = cards.filter((c) => c.status === 'active' && c.bank === 'Capital One' && c.cardType === 'personal').length;
      if (selectedTarget.type === 'personal' && capOnePersonal >= 2) {
        checks.push({
          name: 'Capital One 2-Personal Card Rule',
          passed: false,
          severity: 'error',
          message: 'Cap Reached: Capital One typically allows a maximum of 2 personal credit cards per customer.',
        });
      } else {
        checks.push({
          name: 'Capital One 1/6 Velocity Rule',
          passed: true,
          severity: 'success',
          message: 'Ensure at least 6 months have passed since your last Capital One approval.',
        });
      }
    }

    // 4. Citi Check
    if (selectedTarget.bank === 'Citi') {
      checks.push({
        name: 'Citi 8/65 Rule',
        passed: true,
        severity: 'success',
        message: 'Must not have submitted another Citi application in the last 8 days or 2 in 65 days.',
      });
      if (selectedTarget.family === 'citi-premier') {
        checks.push({
          name: 'Citi 48-Month Premier Rule',
          passed: true,
          severity: 'warning',
          message: 'You are ineligible for the bonus if you received a ThankYou bonus for Premier/Rewards+ within 48 months.',
        });
      }
    }

    return checks;
  };

  const simulationChecks = runSimulation();
  const hasError = simulationChecks.some((c) => c.severity === 'error');
  const hasWarning = simulationChecks.some((c) => c.severity === 'warning');

  const filteredRules = ruleResults.filter((r) => {
    if (selectedBankFilter === 'all') return true;
    return r.bank === selectedBankFilter;
  });

  return (
    <div className="space-y-6" id="eligibility-tracker-view">
      {/* 5/24 Master Status Banner */}
      <div
        className={`rounded-2xl p-6 border shadow-xs transition-all ${
          fiveTwentyFour.count >= 5
            ? 'bg-rose-50/70 border-rose-200'
            : fiveTwentyFour.count === 4
            ? 'bg-amber-50/70 border-amber-200'
            : 'bg-emerald-50/70 border-emerald-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: 5/24 Gauge & Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl text-white ${
                  fiveTwentyFour.count >= 5
                    ? 'bg-rose-600'
                    : fiveTwentyFour.count === 4
                    ? 'bg-amber-600'
                    : 'bg-emerald-600'
                }`}
              >
                {fiveTwentyFour.count >= 5 ? (
                  <XCircle className="w-6 h-6" />
                ) : fiveTwentyFour.count === 4 ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Chase 5/24 Status Gauge
                </span>
                <h2 className="text-2xl font-bold text-neutral-900">
                  {fiveTwentyFour.count} / 24 —{' '}
                  {fiveTwentyFour.count >= 5
                    ? 'Over 5/24 (Restricted)'
                    : fiveTwentyFour.count === 4
                    ? '4/24 (1 Slot Left)'
                    : `${5 - fiveTwentyFour.count} Slots Available (Eligible!)`}
                </h2>
              </div>
            </div>

            <p className="text-xs text-neutral-600 max-w-2xl leading-relaxed">
              Chase rejects new card applications if you have opened <strong>5 or more personal credit cards</strong> across all banks in the past 24 months.
              {fiveTwentyFour.nextSlotOpeningDate && (
                <span className="block mt-1 font-medium text-neutral-800">
                  Next slot opens on <strong>{formatDate(fiveTwentyFour.nextSlotOpeningDate)}</strong>.
                </span>
              )}
            </p>
          </div>

          {/* Right: Slot Indicators */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((slotNumber) => {
              const isFilled = slotNumber <= fiveTwentyFour.count;
              return (
                <div
                  key={slotNumber}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`w-10 h-12 rounded-xl flex items-center justify-center font-bold text-sm border transition-all ${
                      isFilled
                        ? fiveTwentyFour.count >= 5
                          ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                          : 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-400 border-dashed border-neutral-300'
                    }`}
                  >
                    {isFilled ? slotNumber : '+'}
                  </div>
                  <span className="text-[10px] font-medium text-neutral-500">
                    Slot {slotNumber}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cards Contributing to 5/24 & Drop-Off Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-600" />
              Cards Currently Counting Toward 5/24 ({fiveTwentyFour.cardsCounted.length} Total)
            </h3>
            <p className="text-xs text-neutral-500">
              Personal cards opened in the last 24 months. Track when each slot drops off.
            </p>
          </div>

          {/* Business card note pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 text-[11px] text-neutral-700 self-start sm:self-auto">
            <Info className="w-3.5 h-3.5 text-neutral-500" />
            <span>Chase/Amex/Citi Business cards do NOT count towards 5/24!</span>
          </div>
        </div>

        {fiveTwentyFour.cardsCounted.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 text-sm">
            You currently have 0 cards counting towards 5/24! You have all 5 Chase slots available.
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {fiveTwentyFour.cardsCounted.map(({ card, openDate, dropOffDate, daysUntilDropOff }, idx) => {
              const isFirstToDrop = idx === 0;

              return (
                <div
                  key={card.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isFirstToDrop
                      ? 'bg-blue-50/40 border-blue-200 shadow-xs'
                      : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-neutral-900" title={card.currentName}>
                          {card.nickname || card.currentName}
                        </h4>
                        <BankLogo bank={card.bank} size="xs" variant="pill" />
                        {isFirstToDrop && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-blue-100 text-blue-800">
                            Next Drop-Off
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-neutral-500 mt-1 flex items-center gap-3">
                        <span>
                          Opened: <strong>{formatDate(openDate)}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Annual Fee: ${card.annualFee}/yr
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Drop-off countdown */}
                  <div className="text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                    <span className="text-xs text-neutral-500 block">
                      Drops off 5/24 on
                    </span>
                    <span className="text-sm font-semibold text-neutral-900 block">
                      {formatDate(dropOffDate)}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium inline-block mt-0.5 ${
                        daysUntilDropOff <= 60
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {daysUntilDropOff === 0
                        ? 'Clearing today!'
                        : `${daysUntilDropOff} days remaining`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive New Card & Bonus Application Simulator */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Interactive Welcome Bonus & Approval Simulator
            </h3>
            <p className="text-xs text-neutral-500">
              Select a card you want to apply for to immediately check welcome bonus eligibility & rule restrictions.
            </p>
          </div>

          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 self-start sm:self-auto">
            Live Portfolio Verification
          </span>
        </div>

        {/* Card Selector */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Target Card to Test
            </label>
            <select
              value={simulatorCard}
              onChange={(e) => setSimulatorCard(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              {SIMULATION_TARGETS.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.bank} — {t.name} ({t.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Simulation Verdict Box */}
        <div
          className={`p-5 rounded-xl border transition-all space-y-4 ${
            hasError
              ? 'bg-rose-50/60 border-rose-200'
              : hasWarning
              ? 'bg-amber-50/60 border-amber-200'
              : 'bg-emerald-50/60 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {hasError ? (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              ) : hasWarning ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <h4 className="text-sm font-bold text-neutral-900">
                Application Verdict for {selectedTarget.name}:{' '}
                {hasError
                  ? 'High Risk of Ineligibility / Denial'
                  : hasWarning
                  ? 'Eligible with Advisory Conditions'
                  : 'Fully Eligible — Strong Approval Odds'}
              </h4>
            </div>

            <BankLogo bank={selectedTarget.bank} size="xs" variant="pill" />
          </div>

          {/* Detailed rule results for this card */}
          <div className="space-y-2 pt-1">
            {simulationChecks.map((check, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs p-2.5 rounded-lg bg-white/80 border border-neutral-200/70"
              >
                {check.severity === 'error' ? (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : check.severity === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold text-neutral-900 mr-1.5">
                    {check.name}:
                  </span>
                  <span className="text-neutral-700">{check.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comprehensive Bank Rules Overview */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-neutral-600" />
              All Bank Application Rules & Velocity Guidelines
            </h3>
            <p className="text-xs text-neutral-500">
              Evaluated against your active card portfolio to protect your credit score and approvals
            </p>
          </div>

          {/* Filter by Bank */}
          <select
            value={selectedBankFilter}
            onChange={(e) => setSelectedBankFilter(e.target.value)}
            className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-700 self-start sm:self-auto focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="all">All Banks</option>
            <option value="Chase">Chase</option>
            <option value="American Express">American Express</option>
            <option value="Capital One">Capital One</option>
            <option value="Citi">Citi</option>
            <option value="Bank of America">Bank of America</option>
          </select>
        </div>

        {/* Rule cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule, idx) => {
            const isEligible = rule.status === 'eligible';
            const isWarning = rule.status === 'warning';

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                  isEligible
                    ? 'bg-neutral-50/50 border-neutral-200'
                    : isWarning
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-rose-50/40 border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BankLogo bank={rule.bank} size="xs" variant="badge" />
                    <h4 className="text-xs font-bold text-neutral-900">{rule.ruleName}</h4>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      isEligible
                        ? 'bg-emerald-100 text-emerald-800'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {rule.status}
                  </span>
                </div>

                <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                  {rule.title}: {rule.description}
                </p>

                {rule.details && (
                  <p className="text-[11px] text-neutral-500 leading-normal">
                    {rule.details}
                  </p>
                )}

                {rule.actionRecommendation && (
                  <div className="text-[11px] p-2 rounded-lg bg-white border border-neutral-200/80 text-neutral-700">
                    <span className="font-semibold text-neutral-900 mr-1">Recommendation:</span>
                    {rule.actionRecommendation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
