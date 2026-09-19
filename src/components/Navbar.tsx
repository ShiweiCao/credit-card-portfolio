import React, { useState } from 'react';
import { CreditCard, FiveTwentyFourStatus } from '../types';
import {
  CreditCard as CardIcon,
  Clock,
  Plus,
  ArrowRightLeft,
  Download,
  Upload,
  RotateCcw,
  Settings,
  Trash2,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'cards' | 'fees' | 'history' | 'rules';
  setActiveTab: (tab: 'cards' | 'fees' | 'history' | 'rules') => void;
  cards: CreditCard[];
  fiveTwentyFour: FiveTwentyFourStatus;
  totalAnnualFee: number;
  urgentFeeCount: number;
  onAddCard: () => void;
  onOpenProductChange: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
  onClearAllData: () => void;
  onOpenCloudSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cards,
  fiveTwentyFour,
  totalAnnualFee,
  urgentFeeCount,
  onAddCard,
  onOpenProductChange,
  onExportData,
  onImportData,
  onResetData,
  onClearAllData,
  onOpenCloudSync,
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeAccountCount = cards.filter((card) => card.status === 'active').length;
  const isChaseEligible = fiveTwentyFour.count < 5;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <CardIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-neutral-900 leading-tight">
                CardPortfolio
              </h1>
              <span className="text-[11px] text-neutral-500 font-medium block">
                5/24 & Annual Fee Tracker
              </span>
            </div>
          </div>

          {/* Time-sensitive annual-fee notification (Desktop) */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Urgent fee notification */}
            {urgentFeeCount > 0 && (
              <button
                onClick={() => setActiveTab('fees')}
                className="flex h-12 items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 text-white shadow-xs hover:bg-amber-600 transition-all animate-pulse"
                title={`${urgentFeeCount} annual fee renewal due in next 30 days!`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{urgentFeeCount} fee due soon</span>
              </button>
            )}
          </div>

          {/* Action buttons (Add, Switch, Backup) */}
          <div className="flex items-center gap-2">
            <button
              id="header-record-switch-btn"
              onClick={onOpenProductChange}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-600" />
              <span>Record Switch</span>
            </button>

            <button
              id="header-add-card-btn"
              onClick={onAddCard}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Card</span>
            </button>

            {/* Data options menu */}
            <div className="relative">
              <button
                id="header-data-menu-btn"
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 text-neutral-500 hover:text-neutral-800 rounded-xl hover:bg-neutral-100 transition-colors"
                title="Backup & Sample Data Options"
              >
                <Settings className="w-4 h-4" />
              </button>

              {showSettingsMenu && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-neutral-200 p-2 z-50 text-xs space-y-1"
                >
                  <button
                    onClick={() => {
                      onExportData();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 text-left transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Export Data (JSON)</span>
                  </button>

                  <label className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 text-left transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Import Data (JSON)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(event) => {
                        onImportData(event);
                        setShowSettingsMenu(false);
                      }}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => {
                      onOpenCloudSync();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 text-left transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Cloud Sync (GitHub Gist)</span>
                  </button>

                  <div className="border-t border-neutral-100 my-1"></div>

                  <button
                    onClick={() => {
                      onResetData();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-amber-700 hover:bg-amber-50 text-left transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reset Sample Portfolio</span>
                  </button>

                  <button
                    onClick={() => {
                      onClearAllData();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-700 hover:bg-rose-50 text-left transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Clear All Portfolio Data</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-neutral-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar (Desktop) */}
        <div className="hidden md:flex items-center space-x-1 py-2 border-t border-neutral-100">
          <button
            id="tab-btn-cards"
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'cards'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Cards ({activeAccountCount})
          </button>

          <button
            id="tab-btn-fees"
            onClick={() => setActiveTab('fees')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'fees'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>Annual Fee: ${totalAnnualFee.toLocaleString()}</span>
            {urgentFeeCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            )}
          </button>

          <button
            id="tab-btn-history"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>Timelines</span>
          </button>

          <button
            id="tab-btn-rules"
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title={`Chase 5/24: ${isChaseEligible ? 'eligible' : 'over limit'} (${fiveTwentyFour.count}/24)`}
          >
            <span>Apply &amp; Bonus Eligibility</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-xs ring-1 ${
              isChaseEligible
                ? activeTab === 'rules'
                  ? 'bg-emerald-400/20 text-emerald-100 ring-emerald-300/40'
                  : 'bg-emerald-100 text-emerald-800 ring-emerald-200'
                : activeTab === 'rules'
                ? 'bg-rose-400/20 text-rose-100 ring-rose-300/40'
                : 'bg-rose-100 text-rose-800 ring-rose-200'
            }`}>
              {fiveTwentyFour.count}/24
            </span>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-neutral-200 space-y-2">
            <div className="flex flex-col space-y-1 text-xs font-medium">
              <button
                onClick={() => {
                  setActiveTab('cards');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-left ${
                  activeTab === 'cards' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Cards ({activeAccountCount})
              </button>

              <button
                onClick={() => {
                  setActiveTab('fees');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-left flex items-center justify-between ${
                  activeTab === 'fees' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>Annual Fee: ${totalAnnualFee.toLocaleString()}</span>
                {urgentFeeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">
                    {urgentFeeCount} due soon
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('history');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-left ${
                  activeTab === 'history' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Timelines
              </button>

              <button
                onClick={() => {
                  setActiveTab('rules');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-left flex items-center justify-between ${
                  activeTab === 'rules' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Apply &amp; Bonus Eligibility
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-xs ${
                  isChaseEligible
                    ? activeTab === 'rules' ? 'bg-emerald-400/20 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                    : activeTab === 'rules' ? 'bg-rose-400/20 text-rose-100' : 'bg-rose-100 text-rose-800'
                }`}>
                  {fiveTwentyFour.count}/24
                </span>
              </button>

              <button
                onClick={() => {
                  onOpenProductChange();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 rounded-lg text-left text-indigo-700 hover:bg-indigo-50 font-semibold"
              >
                + Record Card Switch
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
