import React, { useState, useEffect } from 'react';
import { CreditCard, ProductChange, FiveTwentyFourStatus } from './types';
import { INITIAL_CARDS, SAMPLE_CARDS } from './data/initialCards';
import { findCatalogCard } from './data/cardCatalog';
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
import { OriginalProductModal } from './components/OriginalProductModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { APP_STORAGE_KEY, exportToGist, GistSyncError, importFromGist } from './utils/gistSync';

const STORAGE_KEY = APP_STORAGE_KEY;

// Remove the retired product-change classification from existing local and imported data.
const normalizeCards = (records: CreditCard[]): CreditCard[] =>
  records.map((card) => ({
    ...card,
    productChanges: (card.productChanges || []).map((change) => {
      const { changeType: _retiredChangeType, ...productChange } = change as ProductChange & {
        changeType?: unknown;
      };
      return productChange;
    }),
  }));

export default function App() {
  const [cards, setCards] = useState<CreditCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeCards(parsed as CreditCard[]);
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
  const [productChangeToEdit, setProductChangeToEdit] = useState<ProductChange | null>(null);
  const [cardForTimelineModal, setCardForTimelineModal] = useState<CreditCard | null>(null);
  const [cardForOriginalProductEdit, setCardForOriginalProductEdit] = useState<CreditCard | null>(null);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);

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
          const destinationProduct = findCatalogCard(change.toProductName, card.bank);
          return {
            ...card,
            currentName: change.toProductName,
            annualFee: change.toAnnualFee,
            network: destinationProduct?.network || card.network,
            cardColor: destinationProduct?.cardColor || card.cardColor,
            customImageUrl: undefined,
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
          const latestChange = [...updatedChanges].sort((a, b) => b.date.localeCompare(a.date))[0];
          const currentName = latestChange ? latestChange.toProductName : card.originalName;
          const currentProduct = findCatalogCard(currentName, card.bank);
          return {
            ...card,
            currentName,
            annualFee: latestChange ? latestChange.toAnnualFee : card.annualFee,
            network: currentProduct?.network || card.network,
            cardColor: currentProduct?.cardColor || card.cardColor,
            productChanges: updatedChanges,
          };
        }
        return card;
      })
    );
    showToast('Product change record removed', 'info');
  };

  // Edit an existing product change and keep later changes linked to the updated product.
  const handleUpdateProductChange = (cardId: string, updatedChange: ProductChange) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;

        const chronologicalChanges = (card.productChanges || [])
          .map((change) => (change.id === updatedChange.id ? updatedChange : change))
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((change, index, changes) =>
            index === 0
              ? change
              : {
                  ...change,
                  fromProductName: changes[index - 1].toProductName,
                  fromAnnualFee: changes[index - 1].toAnnualFee,
                }
          );
        const latestChange = chronologicalChanges[chronologicalChanges.length - 1];
        const currentProduct = findCatalogCard(latestChange.toProductName, card.bank);

        return {
          ...card,
          currentName: latestChange.toProductName,
          annualFee: latestChange.toAnnualFee,
          network: currentProduct?.network || card.network,
          cardColor: currentProduct?.cardColor || card.cardColor,
          customImageUrl: latestChange.id === updatedChange.id ? undefined : card.customImageUrl,
          productChanges: chronologicalChanges,
        };
      })
    );
    showToast(`Updated product change to "${updatedChange.toProductName}"`);
  };

  const handleSaveOriginalProduct = (cardId: string, originalName: string, originalAnnualFee: number) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;

        const chronologicalChanges = [...(card.productChanges || [])].sort((a, b) =>
          a.date.localeCompare(b.date)
        );
        const firstChange = chronologicalChanges[0];

        if (firstChange) {
          return {
            ...card,
            originalName,
            productChanges: card.productChanges.map((change) =>
              change.id === firstChange.id
                ? { ...change, fromProductName: originalName, fromAnnualFee: originalAnnualFee }
                : change
            ),
          };
        }

        const originalProduct = findCatalogCard(originalName, card.bank);
        return {
          ...card,
          originalName,
          currentName: originalName,
          annualFee: originalAnnualFee,
          network: originalProduct?.network || card.network,
          cardColor: originalProduct?.cardColor || card.cardColor,
        };
      })
    );
    setCardForOriginalProductEdit(null);
    showToast(`Updated original product to "${originalName}"`);
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

  const handleOpenProductChange = (cardId?: string, change?: ProductChange) => {
    setSelectedCardIdForPC(cardId);
    setProductChangeToEdit(change || null);
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
          setCards(normalizeCards(parsed as CreditCard[]));
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
      setCards(SAMPLE_CARDS);
      showToast('Portfolio reset to sample data');
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Clear all portfolio data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      setCards([]);
      showToast('All portfolio data cleared', 'info');
    }
  };

  const handleCloudExport = async () => {
    try {
      const result = await exportToGist();
      showToast(result.created ? `Cloud backup created (Gist ${result.gistId})` : 'Cloud backup updated');
    } catch (error) {
      showToast(error instanceof GistSyncError ? error.message : 'Cloud export failed. Please try again.', 'error');
    }
  };

  const handleCloudImport = async () => {
    try {
      const importedCards = await importFromGist();
      setCards(normalizeCards(importedCards as CreditCard[]));
      showToast(`Restored ${importedCards.length} cards from cloud`);
    } catch (error) {
      showToast(error instanceof GistSyncError ? error.message : 'Cloud import failed. Please try again.', 'error');
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
        onClearAllData={handleClearAllData}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div key={activeTab} className="tab-content-enter">
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
            onEditProductChange={(cardId, change) => handleOpenProductChange(cardId, change)}
            onDeleteProductChange={handleDeleteProductChange}
            onEditOriginalProduct={setCardForOriginalProductEdit}
          />
        )}

        {activeTab === 'rules' && <EligibilityTracker cards={cards} />}
        </div>
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

      <OriginalProductModal
        isOpen={!!cardForOriginalProductEdit}
        card={cardForOriginalProductEdit}
        onClose={() => setCardForOriginalProductEdit(null)}
        onSave={handleSaveOriginalProduct}
      />

      <ProductChangeModal
        isOpen={isPCModalOpen}
        onClose={() => setIsPCModalOpen(false)}
        cards={cards}
        selectedCardId={selectedCardIdForPC}
        productChangeToEdit={productChangeToEdit}
        onSaveProductChange={handleSaveProductChange}
        onUpdateProductChange={handleUpdateProductChange}
      />

      <LinkedInTimelineModal
        isOpen={!!cardForTimelineModal}
        onClose={() => setCardForTimelineModal(null)}
        card={cardForTimelineModal}
        onOpenProductChangeModal={(cardId) => {
          handleOpenProductChange(cardId);
        }}
        onEditProductChange={(cardId, change) => {
          handleOpenProductChange(cardId, change);
        }}
        onDeleteProductChange={handleDeleteProductChange}
        onEditOriginalProduct={setCardForOriginalProductEdit}
      />

      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        onExport={handleCloudExport}
        onImport={handleCloudImport}
      />
    </div>
  );
}
