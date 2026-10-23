import React, { useState, useEffect } from 'react';
import { CreditCard, ProductChange } from '../types';
import { X, ArrowRightLeft, TrendingDown, TrendingUp, Sparkles, CircleX } from 'lucide-react';
import { toDateString, getTodayDate } from '../utils/dateUtils';
import { CardVisual } from './CardVisual';
import { findCatalogCard } from '../data/cardCatalog';
import { getCardArtworkUrl } from '../utils/cardArtwork';
import { CardAutocompleteInput } from './CardAutocompleteInput';

interface ProductChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CreditCard[];
  selectedCardId?: string;
  productChangeToEdit?: ProductChange | null;
  onSaveProductChange: (cardId: string, change: ProductChange) => void;
  onUpdateProductChange: (cardId: string, change: ProductChange) => void;
  onCloseCard: (cardId: string, closedDate: string, notes: string) => void;
}

export const ProductChangeModal: React.FC<ProductChangeModalProps> = ({
  isOpen,
  onClose,
  cards,
  selectedCardId,
  productChangeToEdit,
  onSaveProductChange,
  onUpdateProductChange,
  onCloseCard,
}) => {
  const activeCards = cards.filter((c) => c.status === 'active');
  const [cardId, setCardId] = useState<string>('');
  const [toProductName, setToProductName] = useState('');
  const [changeDate, setChangeDate] = useState(toDateString(getTodayDate()));
  const [toAnnualFee, setToAnnualFee] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<'switch' | 'close'>('switch');
  const isClosing = action === 'close' && !productChangeToEdit;

  const isEditing = Boolean(productChangeToEdit);
  const selectedCard = (isEditing ? cards : activeCards).find((c) => c.id === cardId);
  const selectedProductCatalog = selectedCard && (selectedCard.productChanges || []).length > 0
    ? findCatalogCard(selectedCard.currentName, selectedCard.bank)
    : undefined;

  useEffect(() => {
    if (!isOpen) return;
    setAction('switch');
    setCardId(productChangeToEdit?.cardId || cards.find((c) => c.id === selectedCardId && c.status === 'active')?.id || cards.find((c) => c.status === 'active')?.id || '');
    setToProductName(productChangeToEdit?.toProductName || '');
    setChangeDate(productChangeToEdit?.date || toDateString(getTodayDate()));
    setToAnnualFee(productChangeToEdit?.toAnnualFee || 0);
    setNotes(productChangeToEdit?.notes || '');
  }, [isOpen, productChangeToEdit, selectedCardId]);

  useEffect(() => {
    if (selectedCard && !productChangeToEdit) {
      // If current annual fee is > 0, default to 0 for downgrade
      if (selectedCard.annualFee > 0) {
        setToAnnualFee(0);
      } else {
        setToAnnualFee(selectedCard.annualFee);
      }
    }
  }, [selectedCard, productChangeToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    if (isClosing) {
      if (!changeDate || changeDate < earliestCloseDate || changeDate > toDateString(getTodayDate())) return;
      onCloseCard(selectedCard.id, changeDate, notes.trim());
      onClose();
      return;
    }
    if (!toProductName.trim()) return;

    const change: ProductChange = {
      id: productChangeToEdit?.id || `pc-${Date.now()}`,
      cardId: productChangeToEdit?.cardId || selectedCard.id,
      date: changeDate,
      fromProductName: productChangeToEdit?.fromProductName || selectedCard.currentName,
      toProductName: toProductName.trim(),
      fromAnnualFee: productChangeToEdit?.fromAnnualFee ?? selectedCard.annualFee,
      toAnnualFee: Number(toAnnualFee) || 0,
      notes: notes.trim() || undefined,
    };

    if (productChangeToEdit) {
      onUpdateProductChange(selectedCard.id, change);
    } else {
      onSaveProductChange(selectedCard.id, change);
    }
    // Reset and close
    setToProductName('');
    setNotes('');
    onClose();
  };

  const earliestCloseDate = selectedCard ? [selectedCard.openDate, ...(selectedCard.productChanges || []).map((change) => change.date)].sort().at(-1)! : '';

  const feeDifference = selectedCard ? Number(toAnnualFee) - selectedCard.annualFee : 0;

  return (
    <div
      id="product-change-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        id="product-change-modal-container"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl h-[min(820px,calc(100dvh-2rem))] flex flex-col overflow-hidden border border-neutral-200"
      >
        {/* Header */}
        <div className="flex shrink-0 min-h-24 items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isClosing ? 'bg-red-50 text-red-700' : 'bg-indigo-900 text-white'}`}>
              {isClosing ? <CircleX className="w-5 h-5" /> : <ArrowRightLeft className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                {isEditing ? 'Edit Card Product Change' : isClosing ? 'Close Card Account' : 'Record Card Product Change (Switch)'}
              </h2>
              <p className="text-xs text-neutral-500">
                {isEditing ? 'Update this switch.' : isClosing ? 'Close the card. Keep its history.' : 'Change products. Keep your account.'}
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
        <form onSubmit={handleSubmit} className="p-6 flex flex-1 min-h-0 flex-col gap-5">
          {!isEditing && (
            <div className="relative shrink-0 grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1" aria-label="Account action">
              <div
                aria-hidden="true"
                className={`absolute inset-y-1 left-1 w-[calc(50%-6px)] rounded-lg shadow-sm transition-all duration-200 ease-out motion-reduce:transition-none ${isClosing ? 'bg-red-50' : 'bg-white'}`}
                style={{ transform: isClosing ? 'translateX(calc(100% + 4px))' : 'translateX(0)' }}
              />
              {(['switch', 'close'] as const).map((mode) => (
                <button key={mode} type="button" aria-pressed={action === mode} onClick={() => setAction(mode)} className={`relative z-10 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${action === mode ? mode === 'close' ? 'text-red-700' : 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}>
                  {mode === 'switch' ? 'Switch' : 'Close'}
                </button>
              ))}
            </div>
          )}
          <div key={isClosing ? 'close' : 'switch'} className="flex-1 min-h-0 overflow-y-auto space-y-5 account-action-fields p-1 -m-1">
          {/* Card to switch */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              {isClosing ? 'Select Card to Close *' : 'Select Existing Card to Switch *'}
            </label>
            <select
              id="pc-card-select"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              disabled={isEditing}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              required
            >
              {(isEditing ? cards : activeCards).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.bank} — {c.nickname || c.currentName} (${c.annualFee}/yr)
                </option>
              ))}
            </select>
          </div>

          {/* Current Card Overview Banner */}
          {selectedCard && !isClosing && (
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <CardVisual
                  variant="thumb"
                  name={selectedCard.nickname || selectedCard.currentName}
                  bank={selectedCard.bank}
                  network={selectedProductCatalog?.network || selectedCard.network}
                  imageUrl={getCardArtworkUrl(selectedCard)}
                  cardColor={selectedProductCatalog?.cardColor || selectedCard.cardColor}
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
          {!isClosing && <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Switched To (New Product Name) *
            </label>
            <CardAutocompleteInput
              id="pc-new-product-name"
              value={toProductName}
              onChange={setToProductName}
              onSelectCard={(catalogCard) => {
                setToProductName(catalogCard.name);
                setToAnnualFee(catalogCard.annualFee);
              }}
              bankFilter={selectedCard?.bank}
              placeholder="e.g. Chase Freedom Unlimited, Chase Freedom Flex"
              required
            />
            <p className="mt-1 text-[11px] text-neutral-500">
              Choose a catalog card to fill its annual fee automatically, or enter a custom product name.
            </p>
          </div>}

          {/* Date & New Fee */}
          <div className={`grid grid-cols-1 ${isClosing ? '' : 'sm:grid-cols-2'} gap-4`}>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                {isClosing ? 'Closed Date *' : 'Date of Product Change *'}
              </label>
              <input
                id="pc-change-date"
                type="date"
                min={isClosing ? earliestCloseDate : undefined}
                max={isClosing ? toDateString(getTodayDate()) : undefined}
                value={changeDate}
                onChange={(e) => setChangeDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                required
              />
            </div>

            {!isClosing && <div>
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
            </div>}
          </div>

          {/* Fee Impact Display */}
          {selectedCard && !isClosing && (
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
              className="w-full px-3.5 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
          </div>

          </div>

          {/* Action Buttons */}
          <div className="shrink-0 pt-3 border-t border-neutral-100 flex items-center justify-end gap-3">
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
              disabled={!selectedCard}
              className={`px-6 py-2.5 rounded-xl text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${isClosing ? 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600' : 'bg-indigo-900 hover:bg-indigo-800 focus-visible:outline-indigo-900'} focus-visible:outline-2 focus-visible:outline-offset-2`}
            >
              {isEditing ? 'Save Product Change' : isClosing ? 'Confirm Closure' : 'Confirm Product Change'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
