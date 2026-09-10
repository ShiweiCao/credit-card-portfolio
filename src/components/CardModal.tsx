import React, { useState, useEffect } from 'react';
import { CreditCard, Bank, CardType, CardNetwork, CatalogCard } from '../types';
import { X, CreditCard as CardIcon, HelpCircle, Sparkles, ImageIcon, CheckCircle2 } from 'lucide-react';
import { toDateString, getTodayDate } from '../utils/dateUtils';
import { BankLogo } from './BankLogo';
import { CardAutocompleteInput } from './CardAutocompleteInput';
import { CardVisual } from './CardVisual';
import { BANK_GRADIENTS } from '../data/cardCatalog';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: CreditCard) => void;
  cardToEdit?: CreditCard | null;
}

const BANKS: Bank[] = [
  'Chase',
  'American Express',
  'Citi',
  'Capital One',
  'Bank of America',
  'Discover',
  'Wells Fargo',
  'U.S. Bank',
  'Barclays',
  'Other',
];

const POPULAR_CARDS_BY_BANK: Record<Bank, string[]> = {
  Chase: [
    'Chase Sapphire Preferred',
    'Chase Sapphire Reserve',
    'Chase Freedom Unlimited',
    'Chase Freedom Flex',
    'Chase Ink Business Preferred',
    'Chase Ink Business Cash',
    'Chase Ink Business Unlimited',
    'United Explorer Card',
    'World of Hyatt Card',
    'Southwest Rapid Rewards Priority',
  ],
  'American Express': [
    'American Express Gold Card',
    'The Platinum Card from American Express',
    'American Express Green Card',
    'Blue Cash Preferred',
    'Blue Cash Everyday',
    'Delta SkyMiles Gold',
    'Hilton Honors Surpass',
    'The Business Platinum Card',
    'American Express Business Gold Card',
    'Blue Business Plus',
  ],
  Citi: [
    'Citi Strata Premier',
    'Citi Custom Cash',
    'Citi Double Cash',
    'Citi Rewards+',
    'Citi / AAdvantage Platinum Select',
  ],
  'Capital One': [
    'Capital One Venture X',
    'Capital One Venture Rewards',
    'Capital One SavorOne',
    'Capital One Quicksilver',
    'Capital One Spark Cash Plus',
  ],
  'Bank of America': [
    'Bank of America Customized Cash Rewards',
    'Bank of America Premium Rewards',
    'Bank of America Travel Rewards',
    'Alaska Airlines Visa Signature',
  ],
  Discover: ['Discover it Cash Back', 'Discover it Miles', 'Discover it Chrome'],
  'Wells Fargo': ['Wells Fargo Autograph Journey', 'Wells Fargo Active Cash', 'Wells Fargo Attune'],
  'U.S. Bank': ['U.S. Bank Altitude Reserve', 'U.S. Bank Altitude Connect', 'U.S. Bank Cash+'],
  Barclays: ['AAdvantage Aviator Red', 'JetBlue Plus Card', 'Wyndham Rewards Earner Plus'],
  Other: ['Custom Card'],
};

const BANK_COLORS: Record<Bank, string> = {
  Chase: 'from-blue-700 to-indigo-900',
  'American Express': 'from-amber-600 to-yellow-800',
  Citi: 'from-cyan-700 to-blue-900',
  'Capital One': 'from-slate-700 to-slate-900',
  'Bank of America': 'from-red-700 to-rose-900',
  Discover: 'from-orange-600 to-amber-700',
  'Wells Fargo': 'from-red-800 to-amber-900',
  'U.S. Bank': 'from-indigo-800 to-blue-950',
  Barclays: 'from-sky-700 to-cyan-900',
  Other: 'from-neutral-700 to-neutral-900',
};

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  cardToEdit,
}) => {
  const [bank, setBank] = useState<Bank>('Chase');
  const [cardName, setCardName] = useState('');
  const [nickname, setNickname] = useState('');
  const [openDate, setOpenDate] = useState(toDateString(getTodayDate()));
  const [annualFee, setAnnualFee] = useState<number>(0);
  const [cardType, setCardType] = useState<CardType>('personal');
  const [network, setNetwork] = useState<CardNetwork>('Visa');
  const [status, setStatus] = useState<'active' | 'closed'>('active');
  const [creditLimit, setCreditLimit] = useState<string>('');
  const [feeRenewalDate, setFeeRenewalDate] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [cardColor, setCardColor] = useState('');
  const [prefillNotice, setPrefillNotice] = useState<string | null>(null);
  const [showImageSettings, setShowImageSettings] = useState(false);

  useEffect(() => {
    if (cardToEdit) {
      setBank(cardToEdit.bank);
      setCardName(cardToEdit.currentName);
      setNickname(cardToEdit.nickname || '');
      setOpenDate(cardToEdit.openDate);
      setAnnualFee(cardToEdit.annualFee);
      setCardType(cardToEdit.cardType);
      setNetwork(cardToEdit.network);
      setStatus(cardToEdit.status);
      setCreditLimit(cardToEdit.creditLimit ? String(cardToEdit.creditLimit) : '');
      setFeeRenewalDate(cardToEdit.feeRenewalDate || cardToEdit.openDate);
      setNotes(cardToEdit.notes || '');
      setImageUrl(cardToEdit.imageUrl || '');
      setCardColor(cardToEdit.cardColor || '');
      setPrefillNotice(null);
    } else {
      // Reset form
      setBank('Chase');
      setCardName('');
      setNickname('');
      setOpenDate(toDateString(getTodayDate()));
      setAnnualFee(0);
      setCardType('personal');
      setNetwork('Visa');
      setStatus('active');
      setCreditLimit('');
      setFeeRenewalDate('');
      setNotes('');
      setImageUrl('');
      setCardColor('');
      setPrefillNotice(null);
    }
  }, [cardToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSelectCatalogCard = (catalogCard: CatalogCard) => {
    setCardName(catalogCard.name);
    setBank(catalogCard.bank);
    setAnnualFee(catalogCard.annualFee);
    setCardType(catalogCard.cardType);
    setNetwork(catalogCard.network);
    setImageUrl(catalogCard.imageUrl || '');
    setCardColor(catalogCard.cardColor || BANK_GRADIENTS[catalogCard.bank] || 'from-neutral-700 to-neutral-900');
    setPrefillNotice(`✨ Auto-prefilled from catalog: ${catalogCard.bank} • $${catalogCard.annualFee}/yr • ${catalogCard.cardType}`);
    setTimeout(() => {
      setPrefillNotice(null);
    }, 4500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) return;

    const newCard: CreditCard = {
      id: cardToEdit ? cardToEdit.id : `card-${Date.now()}`,
      bank,
      originalName: cardToEdit ? cardToEdit.originalName : cardName.trim(),
      currentName: cardName.trim(),
      nickname: nickname.trim() || undefined,
      openDate,
      annualFee: Number(annualFee) || 0,
      cardType,
      network,
      status,
      creditLimit: creditLimit ? Number(creditLimit) : undefined,
      feeRenewalDate: feeRenewalDate || openDate,
      productChanges: cardToEdit ? cardToEdit.productChanges : [],
      notes: notes.trim() || undefined,
      cardColor: cardColor || cardToEdit?.cardColor || BANK_GRADIENTS[bank] || 'from-neutral-700 to-neutral-900',
      imageUrl: imageUrl.trim() || undefined,
    };

    onSave(newCard);
    onClose();
  };

  const handleBankChange = (newBank: Bank) => {
    setBank(newBank);
    // Suggest network
    if (newBank === 'American Express') setNetwork('American Express');
    else if (newBank === 'Discover') setNetwork('Discover');
  };

  return (
    <div
      id="card-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        id="card-modal-container"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-neutral-200 my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <BankLogo bank={bank} size="md" variant="badge" />
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                {cardToEdit ? 'Edit Credit Card' : 'Add New Credit Card'}
              </h2>
              <p className="text-xs text-neutral-500">
                Track open date, annual fees, and 5/24 status
              </p>
            </div>
          </div>
          <button
            id="card-modal-close-btn"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Prefill Notification Banner */}
          {prefillNotice && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium animate-in fade-in duration-200">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="flex-1">{prefillNotice}</span>
              <button
                type="button"
                onClick={() => setPrefillNotice(null)}
                className="text-emerald-600 hover:text-emerald-900 text-xs font-semibold px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Live Card Artwork Preview */}
          <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="shrink-0">
              <CardVisual
                name={cardName || 'New Card'}
                bank={bank}
                annualFee={annualFee}
                cardType={cardType}
                network={network}
                imageUrl={imageUrl}
                cardColor={cardColor}
                variant="compact"
              />
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-neutral-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Card Artwork & Catalog Match</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Type in the search field below to instantly pick from 20+ preset cards with prefilled annual fee, network, and official card artwork.
              </p>
              <button
                type="button"
                onClick={() => setShowImageSettings(!showImageSettings)}
                className="mt-1.5 text-[11px] font-medium text-neutral-600 hover:text-neutral-900 underline underline-offset-2 flex items-center gap-1 mx-auto sm:mx-0"
              >
                <ImageIcon className="w-3 h-3" />
                {showImageSettings ? 'Hide custom image settings' : 'Customize image URL / local file path'}
              </button>
            </div>
          </div>

          {/* Custom Image URL Settings (Collapsible) */}
          {showImageSettings && (
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-neutral-700">
                  Card Artwork Image URL or Path
                </label>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-[11px] text-red-600 hover:text-red-700"
                  >
                    Clear Image
                  </button>
                )}
              </div>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="e.g. /cards/sapphire.png or https://...image.png"
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs font-mono text-neutral-900 focus:ring-2 focus:ring-neutral-900"
              />
              <p className="text-[11px] text-neutral-500">
                Tip: You can store images locally in your app's public folder (e.g. <code>/cards/my-card.png</code>) or use an image CDN URL. If left empty, a stylish color gradient is used.
              </p>
            </div>
          )}

          {/* Bank & Card Name (Autocomplete) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Bank / Issuer *
                </label>
                <BankLogo bank={bank} size="xs" variant="pill" />
              </div>
              <select
                id="card-input-bank"
                value={bank}
                onChange={(e) => handleBankChange(e.target.value as Bank)}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                required
              >
                {BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <CardAutocompleteInput
                value={cardName}
                onChange={(val) => setCardName(val)}
                onSelectCard={handleSelectCatalogCard}
                selectedBank={bank}
                placeholder="Search card catalog e.g. Sapphire, Gold..."
              />
            </div>
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Nickname (Optional)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. My Daily Driver, Player 2's Gold..."
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Custom name for display purposes only.
            </p>
          </div>

          {/* Open Date & Annual Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Account Open Date *
              </label>
              <input
                id="card-input-opendate"
                type="date"
                value={openDate}
                onChange={(e) => setOpenDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                required
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Used to determine Chase 5/24 window & annual fee anniversary.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Annual Fee (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">
                  $
                </span>
                <input
                  id="card-input-annualfee"
                  type="number"
                  min="0"
                  step="1"
                  value={annualFee}
                  onChange={(e) => setAnnualFee(Number(e.target.value))}
                  placeholder="0"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Enter 0 if card has no annual fee.
              </p>
            </div>
          </div>

          {/* Card Type (Personal vs Business) & Payment Network */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Card Type *
                </label>
                <div className="group relative flex items-center">
                  <HelpCircle className="w-3.5 h-3.5 text-neutral-400 cursor-pointer" />
                  <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-56 p-2 bg-neutral-900 text-white text-[11px] rounded-lg shadow-lg z-20">
                    Personal cards count towards Chase 5/24. Most business cards (Chase, Amex, Citi) do not report to personal credit.
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="card-type-personal-btn"
                  onClick={() => setCardType('personal')}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border text-center transition-all ${
                    cardType === 'personal'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  Personal
                </button>
                <button
                  type="button"
                  id="card-type-business-btn"
                  onClick={() => setCardType('business')}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border text-center transition-all ${
                    cardType === 'business'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  Business
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Payment Network
              </label>
              <select
                id="card-input-network"
                value={network}
                onChange={(e) => setNetwork(e.target.value as CardNetwork)}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              >
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="American Express">American Express</option>
                <option value="Discover">Discover</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Status & Credit Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Account Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="card-status-active-btn"
                  onClick={() => setStatus('active')}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border text-center transition-all ${
                    status === 'active'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  id="card-status-closed-btn"
                  onClick={() => setStatus('closed')}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border text-center transition-all ${
                    status === 'closed'
                      ? 'bg-neutral-800 text-white border-neutral-800 shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  Closed
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Credit Limit (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">
                  $
                </span>
                <input
                  id="card-input-creditlimit"
                  type="number"
                  min="0"
                  step="100"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Notes & Strategy (Optional)
            </label>
            <textarea
              id="card-input-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Main dining card, 4x points; retention offer reminder in September."
              className="w-full px-3.5 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              id="card-modal-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              id="card-modal-submit-btn"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm"
            >
              {cardToEdit ? 'Save Changes' : 'Add Credit Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
