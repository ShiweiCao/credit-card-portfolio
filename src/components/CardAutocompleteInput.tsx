import React, { useState, useRef, useEffect } from 'react';
import { CatalogCard, Bank } from '../types';
import { searchCardCatalog, CARD_CATALOG } from '../data/cardCatalog';
import { BankLogo, NetworkLogo } from './BankLogo';
import { CardVisual } from './CardVisual';
import { Search, Sparkles, X, ChevronDown, Check } from 'lucide-react';

interface CardAutocompleteInputProps {
  id?: string;
  value: string;
  bankFilter?: Bank;
  onChange: (val: string) => void;
  onSelectCard: (card: CatalogCard) => void;
  placeholder?: string;
  required?: boolean;
}

export const CardAutocompleteInput: React.FC<CardAutocompleteInputProps> = ({
  id = 'card-autocomplete-input',
  value,
  bankFilter,
  onChange,
  onSelectCard,
  placeholder = 'Search catalog (e.g. Sapphire, Gold, Venture X, Bilt)...',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIssuerTab, setSelectedIssuerTab] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync tab with bankFilter if provided
  useEffect(() => {
    if (bankFilter && bankFilter !== 'Other') {
      setSelectedIssuerTab(bankFilter);
    } else {
      setSelectedIssuerTab('all');
    }
  }, [bankFilter]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter catalog
  const filteredCards = React.useMemo(() => {
    let pool = CARD_CATALOG;
    if (selectedIssuerTab !== 'all') {
      pool = pool.filter((c) => c.bank === selectedIssuerTab);
    }
    const cleanQuery = value.trim().toLowerCase();
    if (!cleanQuery) {
      return pool.slice(0, 10);
    }
    return pool
      .filter((card) => {
        const matchName = card.name.toLowerCase().includes(cleanQuery);
        const matchBank = card.bank.toLowerCase().includes(cleanQuery);
        const matchAlias = card.aliases?.some((a) => a.toLowerCase().includes(cleanQuery));
        const matchPerk = card.perksSummary?.toLowerCase().includes(cleanQuery);
        return matchName || matchBank || matchAlias || matchPerk;
      })
      .slice(0, 12);
  }, [value, selectedIssuerTab]);

  const handleSelect = (card: CatalogCard) => {
    onSelectCard(card);
    setIsOpen(false);
  };

  const issuersList = ['all', 'Chase', 'American Express', 'Citi', 'Capital One', 'Bank of America', 'Wells Fargo', 'U.S. Bank', 'Discover', 'Barclays'];

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-neutral-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full pl-10 pr-16 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all shadow-2xs font-medium"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-60 bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden animate-in fade-in duration-100">
          {/* Header & Quick Filter Issuer Pills */}
          <div className="p-2.5 border-b border-neutral-100 bg-neutral-50/80">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Select from Card Catalog (Auto-prefills fee, type, network & image)
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {filteredCards.length} result{filteredCards.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Issuer Quick Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {issuersList.map((iss) => (
                <button
                  key={iss}
                  type="button"
                  onClick={() => setSelectedIssuerTab(iss)}
                  className={`px-2 py-0.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    selectedIssuerTab === iss
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'bg-white text-neutral-600 hover:bg-neutral-200/60 border border-neutral-200/60'
                  }`}
                >
                  {iss === 'all' ? 'All Banks' : iss}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100/80">
            {filteredCards.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500 space-y-1">
                <p className="font-semibold text-neutral-700">No matching cards found in catalog</p>
                <p>You can still type and create this as a custom card manually.</p>
              </div>
            ) : (
              filteredCards.map((card) => {
                const isSelected = value.trim().toLowerCase() === card.name.toLowerCase();

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleSelect(card)}
                    className={`w-full text-left p-3 hover:bg-neutral-50 flex items-center justify-between gap-3 transition-colors group ${
                      isSelected ? 'bg-amber-50/60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Mini Card Artwork Thumbnail */}
                      <CardVisual
                        name={card.name}
                        bank={card.bank}
                        network={card.network}
                        imageUrl={card.imageUrl}
                        cardColor={card.cardColor}
                        variant="thumb"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-neutral-900 group-hover:text-black truncate">
                            {card.name}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500 flex-wrap">
                          <span className="font-medium text-neutral-700">{card.bank}</span>
                          <span>•</span>
                          <span
                            className={`px-1.5 py-0.2 rounded font-medium ${
                              card.cardType === 'business'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {card.cardType}
                          </span>
                          <span>•</span>
                          <span className="text-neutral-600">{card.network}</span>
                          {card.perksSummary && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[240px] text-neutral-400">
                                {card.perksSummary}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Annual Fee Badge */}
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-1 rounded-lg text-xs font-bold bg-neutral-100 text-neutral-900 group-hover:bg-neutral-200">
                        {card.annualFee > 0 ? `$${card.annualFee}/yr` : '$0 Fee'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer custom option */}
          <div className="p-2 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-[11px] text-neutral-500 px-3">
            <span>Don't see your card? Type custom name freely</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-neutral-700 font-medium hover:underline"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
