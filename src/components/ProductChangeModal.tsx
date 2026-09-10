import React, { useState, useEffect } from 'react';
import { CreditCard, ProductChange, ChangeType } from '../types';
import { X, ArrowRightLeft, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';
import { toDateString, getTodayDate } from '../utils/dateUtils';
import { CardVisual } from './CardVisual';
import { BankLogo } from './BankLogo';

interface ProductChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CreditCard[];
  selectedCardId?: string;
  onSaveProductChange: (cardId: string, change: ProductChange) => void;
}

export const ProductChangeModal: React.FC<ProductChangeModalProps> = ({
  isOpen,
  onClose,
  cards,
  selectedCardId,
  onSaveProductChange,
}) => {
  const activeCards = cards.filter((c) => c.status === 'active');
  const [cardId, setCardId] = useState<string>('');
  const [toProductName, setToProductName] = useState('');
  const [changeDate, setChangeDate] = useState(toDateString(getTodayDate()));
  const [toAnnualFee, setToAnnualFee] = useState<number>(0);
  const [changeType, setChangeType] = useState<ChangeType>('downgrade');
  const [notes, setNotes] = useState('');

  const selectedCard = activeCards.find((c) => c.id === cardId);

  useEffect(() => {
    if (selectedCardId && activeCards.some((c) => c.id === selectedCardId)) {
      setCardId(selectedCardId);
    } else if (activeCards.length > 0 && !cardId) {
      setCardId(activeCards[0].id);
    }
  }, [selectedCardId, activeCards, cardId]);

  useEffect(() => {
    if (selectedCard) {
      // If current annual fee is > 0, default to 0 for downgrade
      if (selectedCard.annualFee > 0) {
        setToAnnualFee(0);
        setChangeType('downgrade');
      } else {
        setToAnnualFee(selectedCard.annualFee);
        setChangeType('lateral');
      }
    }
  }, [selectedCard]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !toProductName.trim()) return;

    const change: ProductChange = {
      id: `pc-${Date.now()}`,
      cardId: selectedCard.id,
      date: changeDate,
      fromProductName: selectedCard.currentName,
      toProductName: toProductName.trim(),
      fromAnnualFee: selectedCard.annualFee,
      toAnnualFee: Number(toAnnualFee) || 0,
      changeType,
      notes: notes.trim() || undefined,
    };

    onSaveProductChange(selectedCard.id, change);
    // Reset and close
    setToProductName('');
    setNotes('');
    onClose();
  };

  const feeDifference = selectedCard ? Number(toAnnualFee) - selectedCard.annualFee : 0;

  return (
    <div
      id="product-change-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        id="product-change-modal-container"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-neutral-200 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-900 text-white">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Record Card Product Change (Switch)
              </h2>
              <p className="text-xs text-neutral-500">
                e.g. Downgrade Chase Sapphire to Chase Freedom without opening a new account
              </p>
            </div>
          </div>
          <button
            id="product-change-modal-close"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Card to switch */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Select Existing Card to Switch *
            </label>
            <select
              id="pc-card-select"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              required
            >
              {activeCards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.bank} — {c.nickname || c.currentName} (${c.annualFee}/yr)
                </option>
              ))}
            </select>
          </div>

          {/* Current Card Overview Banner */}
          {selectedCard && (
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <CardVisual
                  variant="thumb"
                  name={selectedCard.nickname || selectedCard.currentName}
                  bank={selectedCard.bank}
                  network={selectedCard.network}
                  imageUrl={selectedCard.imageUrl}
                  cardColor={selectedCard.cardColor}
                />
                <div>
                  <span className="text-neutral-500 block text-[11px]">Current Product</span>
                  <span className="font-semibold text-neutral-900 text-sm" title={selectedCard.currentName}>
                    {selectedCard.nickname || selectedCard.currentName}
                  </span>
                  <span className="text-neutral-500 block text-[11px] mt-0.5">
                    {selectedCard.bank} • Account Opened: {selectedCard.openDate}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 block text-[11px]">Current Fee</span>
                <span className="font-semibold text-neutral-900 text-sm">
                  ${selectedCard.annualFee}/yr
                </span>
              </div>
            </div>
          )}

          {/* Target New Product Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Switched To (New Product Name) *
            </label>
            <input
              id="pc-new-product-name"
              type="text"
              value={toProductName}
              onChange={(e) => setToProductName(e.target.value)}
              placeholder="e.g. Chase Freedom Unlimited, Chase Freedom Flex"
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              required
            />
            {selectedCard?.bank === 'Chase' && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] text-neutral-500 mr-1 self-center">Popular Chase PCs:</span>
                {['Chase Freedom Unlimited', 'Chase Freedom Flex', 'Chase Sapphire Preferred', 'Chase Sapphire Reserve'].map(
                  (name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setToProductName(name);
                        if (name.includes('Freedom')) setToAnnualFee(0);
                        else if (name.includes('Preferred')) setToAnnualFee(95);
                        else if (name.includes('Reserve')) setToAnnualFee(550);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                    >
                      {name}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Date & New Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Date of Product Change *
              </label>
              <input
                id="pc-change-date"
                type="date"
                value={changeDate}
                onChange={(e) => setChangeDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                New Annual Fee (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">
                  $
                </span>
                <input
                  id="pc-new-annual-fee"
                  type="number"
                  min="0"
                  value={toAnnualFee}
                  onChange={(e) => setToAnnualFee(Number(e.target.value))}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Fee Impact Display */}
          {selectedCard && (
            <div
              className={`p-3 rounded-xl flex items-center justify-between text-xs border ${
                feeDifference < 0
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : feeDifference > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-neutral-50 text-neutral-800 border-neutral-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {feeDifference < 0 ? (
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                ) : feeDifference > 0 ? (
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                ) : (
                  <Sparkles className="w-4 h-4 text-neutral-500" />
                )}
                <span>
                  Annual Fee Impact:{' '}
                  <strong>
                    ${selectedCard.annualFee} ➔ ${toAnnualFee}
                  </strong>
                </span>
              </div>
              <span className="font-semibold">
                {feeDifference < 0
                  ? `Saves $${Math.abs(feeDifference)}/year`
                  : feeDifference > 0
                  ? `Increases by $${feeDifference}/year`
                  : 'Fee unchanged ($0 diff)'}
              </span>
            </div>
          )}

          {/* Change Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Change Classification
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['downgrade', 'lateral', 'upgrade'] as ChangeType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  id={`pc-type-${type}-btn`}
                  onClick={() => setChangeType(type)}
                  className={`py-2 px-2 text-xs font-medium rounded-xl border capitalize text-center transition-all ${
                    changeType === type
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Strategy / Reason Notes (Optional)
            </label>
            <textarea
              id="pc-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Retained $12,000 credit limit and preserved credit history age while eliminating the $95 fee."
              className="w-full px-3.5 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              id="pc-modal-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              id="pc-modal-submit-btn"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition-colors shadow-sm"
            >
              Confirm Product Change
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
