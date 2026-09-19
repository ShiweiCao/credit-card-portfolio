import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard, CatalogCard } from '../types';
import { X, Pencil, Info } from 'lucide-react';
import { CardAutocompleteInput } from './CardAutocompleteInput';
import { findCatalogCard } from '../data/cardCatalog';
import { CardVisual } from './CardVisual';

interface OriginalProductModalProps {
  card: CreditCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardId: string, originalName: string, originalAnnualFee: number) => void;
}

export const OriginalProductModal: React.FC<OriginalProductModalProps> = ({
  card,
  isOpen,
  onClose,
  onSave,
}) => {
  const firstChange = useMemo(
    () => [...(card?.productChanges || [])].sort((a, b) => a.date.localeCompare(b.date))[0],
    [card]
  );
  const [name, setName] = useState('');
  const [annualFee, setAnnualFee] = useState(0);

  useEffect(() => {
    if (card && isOpen) {
      setName(card.originalName);
      setAnnualFee(firstChange?.fromAnnualFee ?? card.annualFee);
    }
  }, [card, firstChange, isOpen]);

  if (!isOpen || !card) return null;

  const preview = findCatalogCard(name, card.bank);
  const handleSelect = (catalogCard: CatalogCard) => {
    setName(catalogCard.name);
    setAnnualFee(catalogCard.annualFee);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Edit Original Product</h2>
              <p className="text-xs text-neutral-500">Update the account’s opening product in its timeline.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="space-y-5 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) onSave(card.id, name.trim(), Math.max(0, Number(annualFee) || 0));
          }}
        >
          <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-950">
            <Info className="h-4 w-4 shrink-0 text-indigo-600" />
            <span>This changes the starting point only; your current product and later switches stay intact.</span>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <CardVisual
              variant="thumb"
              name={name || 'Original product'}
              bank={card.bank}
              network={preview?.network || card.network}
              imageUrl={preview?.imageUrl}
              cardColor={preview?.cardColor || card.cardColor}
              className="h-14 w-[88px]"
              preserveArtworkEdges
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Original issuer</p>
              <p className="mt-0.5 text-sm font-semibold text-neutral-900">{card.bank}</p>
            </div>
          </div>

          <div>
            <label htmlFor="original-product-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Original card name *
            </label>
            <CardAutocompleteInput
              value={name}
              onChange={setName}
              onSelectCard={handleSelect}
              bankFilter={card.bank}
              placeholder="Search the card catalog..."
              required
            />
          </div>

          <div>
            <label htmlFor="original-product-fee" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Original annual fee (USD) *
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-neutral-500">$</span>
              <input
                id="original-product-fee"
                type="number"
                min="0"
                step="1"
                value={annualFee}
                onChange={(event) => setAnnualFee(Number(event.target.value))}
                className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-8 pr-3.5 text-sm font-medium text-neutral-900 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
              Save Original Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
