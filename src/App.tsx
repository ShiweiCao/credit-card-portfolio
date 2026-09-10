import React, { useState, useEffect } from 'react';
import { CreditCard, ProductChange, FiveTwentyFourStatus } from './types';
import { INITIAL_CARDS } from './data/initialCards';
import { calculateChase524 } from './utils/rulesEngine';
import { getNextRenewalDate, getDaysUntil } from './utils/dateUtils';
import { Navbar } from './components/Navbar';
import { CardList } from './components/CardList';
import { CardModal } from './components/CardModal';
import { ProductChangeModal } from './components/ProductChangeModal';
import { AnnualFeeSummary } from './components/AnnualFeeSummary';
import { ProductChangeHistory } from './components/ProductChangeHistory';
import { EligibilityTracker } from './components/EligibilityTracker';
import { LinkedInTimelineModal } from './components/LinkedInTimelineModal';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const STORAGE_KEY = 'credit_card_tracker_portfolio_v1';

export default function App() {
  const [cards, setCards] = useState<CreditCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_CARDS;
  });

  const [activeTab, setActiveTab] = useState<'cards' | 'fees' | 'history' | 'rules'>('cards');

  // Modal States
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<CreditCard | null>(null);

  const [isPCModalOpen, setIsPCModalOpen] = useState(false);
  const [selectedCardIdForPC, setSelectedCardIdForPC] = useState<string | undefined>(undefined);
  const [cardForTimelineModal, setCardForTimelineModal] = useState<CreditCard | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch {
      // Handle quota error
    }
  }, [cards]);

  // Derived metrics
  const activeCards = cards.filter((c) => c.status === 'active');
  const totalAnnualFee = activeCards.reduce((sum, c) => sum + (c.annualFee || 0), 0);
  const fiveTwentyFour: FiveTwentyFourStatus = calculateChase524(cards);

  const urgentFeeCount = activeCards.filter((c) => {
    if (c.annualFee <= 0) return false;
    const nextRenewal = getNextRenewalDate(c.openDate, c.feeRenewalDate);
    const days = getDaysUntil(nextRenewal);
    return days <= 30;
  }).length;

  // Add / Edit Card
  const handleSaveCard = (savedCard: CreditCard) => {
    setCards((prev) => {
      const exists = prev.some((c) => c.id === savedCard.id);
      if (exists) {
        return prev.map((c) => (c.id === savedCard.id ? savedCard : c));
      } else {
        return [savedCard, ...prev];
      }
    });
    showToast(
      cardToEdit
        ? `Updated card "${savedCard.currentName}"`
        : `Added new card "${savedCard.currentName}"`
    );
  };

  // Delete Card
  const handleDeleteCard = (cardId: string) => {
    const cardToDelete = cards.find((c) => c.id === cardId);
    if (!cardToDelete) return;

    if (window.confirm(`Are you sure you want to remove "${cardToDelete.currentName}"?`)) {
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      showToast(`Removed "${cardToDelete.currentName}" from portfolio`, 'info');
    }
  };

  // Record Product Change (Switch)
  const handleSaveProductChange = (cardId: string, change: ProductChange) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          return {
            ...card,
            currentName: change.toProductName,
            annualFee: change.toAnnualFee,
            productChanges: [change, ...(card.productChanges || [])],
          };
        }
        return card;
      })
    );
    showToast(
      `Product change recorded! Switched to "${change.toProductName}" (New fee: $${change.toAnnualFee}/yr)`
    );
  };

  // Delete Product Change
  const handleDeleteProductChange = (cardId: string, changeId: string) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          const updatedChanges = (card.productChanges || []).filter((pc) => pc.id !== changeId);
          // If we deleted the latest product change, revert currentName to previous or original
          const latestChange = updatedChanges[0];
          return {
            ...card,
            currentName: latestChange ? latestChange.toProductName : card.originalName,
            annualFee: latestChange ? latestChange.toAnnualFee : card.annualFee,
            productChanges: updatedChanges,
          };
        }
        return card;
      })
    );
    showToast('Product change record removed', 'info');
  };

  // Open modals
  const handleOpenAddCard = () => {
    setCardToEdit(null);
    setIsCardModalOpen(true);
  };

  const handleOpenEditCard = (card: CreditCard) => {
    setCardToEdit(card);
    setIsCardModalOpen(true);
  };

  const handleOpenProductChange = (cardId?: string) => {
    setSelectedCardIdForPC(cardId);
    setIsPCModalOpen(true);
  };

  // Export JSON
  const handleExportData = () => {
    const dataStr = JSON.stringify(cards, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `credit-card-portfolio-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Portfolio exported to JSON');
  };

  // Import JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setCards(parsed);
          showToast(`Successfully imported ${parsed.length} cards`);
        } else {
          showToast('Invalid portfolio JSON file format', 'error');
        }
      } catch {
        showToast('Failed to parse JSON file', 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // Reset to initial sample
  const handleResetData = () => {
    if (window.confirm('Reset portfolio to sample credit cards and product changes?')) {
      setCards(INITIAL_CARDS);
      showToast('Portfolio reset to sample data');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      {/* Toast alert */}
      {toast && (
        <div
          id="app-toast-alert"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-medium transition-all ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : toast.type === 'info'
              ? 'bg-neutral-900 text-white border-neutral-800'
              : 'bg-emerald-900 text-white border-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-300" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 p-1 text-white/70 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cards={cards}
        fiveTwentyFour={fiveTwentyFour}
        totalAnnualFee={totalAnnualFee}
        urgentFeeCount={urgentFeeCount}
        onAddCard={handleOpenAddCard}
        onOpenProductChange={() => handleOpenProductChange()}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'cards' && (
          <CardList
            cards={cards}
            onAddCard={handleOpenAddCard}
            onEditCard={handleOpenEditCard}
            onDeleteCard={handleDeleteCard}
            onOpenProductChange={handleOpenProductChange}
            onViewProductChangeHistory={() => setActiveTab('history')}
            onViewLinkedInTimeline={(card) => setCardForTimelineModal(card)}
          />
        )}

        {activeTab === 'fees' && (
          <AnnualFeeSummary
            cards={cards}
            onOpenProductChange={(cardId) => handleOpenProductChange(cardId)}
          />
        )}

        {activeTab === 'history' && (
          <ProductChangeHistory
            cards={cards}
            onOpenProductChangeModal={(cardId) => handleOpenProductChange(cardId)}
            onDeleteProductChange={handleDeleteProductChange}
          />
        )}

        {activeTab === 'rules' && <EligibilityTracker cards={cards} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-neutral-500">
          Credit Card Portfolio & 5/24 Tracker • Tracking bank application rules, annual fee renewal dates, and card product switch lineages.
        </div>
      </footer>

      {/* Modals */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSave={handleSaveCard}
        cardToEdit={cardToEdit}
      />

      <ProductChangeModal
        isOpen={isPCModalOpen}
        onClose={() => setIsPCModalOpen(false)}
        cards={cards}
        selectedCardId={selectedCardIdForPC}
        onSaveProductChange={handleSaveProductChange}
      />

      <LinkedInTimelineModal
        isOpen={!!cardForTimelineModal}
        onClose={() => setCardForTimelineModal(null)}
        card={cardForTimelineModal}
        onOpenProductChangeModal={(cardId) => {
          handleOpenProductChange(cardId);
        }}
        onDeleteProductChange={handleDeleteProductChange}
      />
    </div>
  );
}
