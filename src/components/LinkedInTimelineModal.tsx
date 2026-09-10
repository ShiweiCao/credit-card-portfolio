import React from 'react';
import { CreditCard } from '../types';
import { LinkedInCardTimeline } from './LinkedInCardTimeline';
import { X, Sparkles } from 'lucide-react';

interface LinkedInTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCard | null;
  onOpenProductChangeModal: (cardId: string) => void;
  onDeleteProductChange?: (cardId: string, changeId: string) => void;
}

export const LinkedInTimelineModal: React.FC<LinkedInTimelineModalProps> = ({
  isOpen,
  onClose,
  card,
  onOpenProductChangeModal,
  onDeleteProductChange,
}) => {
  if (!isOpen || !card) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-neutral-100 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 leading-tight">
                Card Experience & Evolution Timeline
              </h3>
              <p className="text-[11px] text-neutral-500">
                LinkedIn-style career progression for {card.nickname || card.currentName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6">
          <LinkedInCardTimeline
            card={card}
            onOpenProductChangeModal={(id) => {
              onClose();
              onOpenProductChangeModal(id);
            }}
            onDeleteProductChange={onDeleteProductChange}
            initiallyExpanded={true}
          />
        </div>
      </div>
    </div>
  );
};
