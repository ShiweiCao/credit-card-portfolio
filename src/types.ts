export type Bank =
  | 'Chase'
  | 'American Express'
  | 'Citi'
  | 'Capital One'
  | 'Bank of America'
  | 'Discover'
  | 'Wells Fargo'
  | 'U.S. Bank'
  | 'Barclays'
  | 'Other';

export type CardType = 'personal' | 'business';

export type CardNetwork = 'Visa' | 'Mastercard' | 'American Express' | 'Discover' | 'Other';

export type ChangeType = 'downgrade' | 'upgrade' | 'lateral';

export interface ProductChange {
  id: string;
  cardId: string;
  date: string; // YYYY-MM-DD
  fromProductName: string;
  toProductName: string;
  fromAnnualFee: number;
  toAnnualFee: number;
  changeType: ChangeType;
  notes?: string;
}

export interface CreditCard {
  id: string;
  bank: Bank;
  originalName: string;      // Card name when first opened
  currentName: string;       // Current card product name (updates after product change)
  nickname?: string;         // Optional display name for the card
  openDate: string;          // YYYY-MM-DD
  annualFee: number;         // Current annual fee in USD
  cardType: CardType;        // Personal or Business (crucial for Chase 5/24)
  network: CardNetwork;
  status: 'active' | 'closed';
  closedDate?: string;
  creditLimit?: number;
  feeRenewalDate?: string;   // Optional custom renewal date; if unset, anniversary of openDate
  productChanges: ProductChange[];
  notes?: string;
  cardColor?: string;
  imageUrl?: string;
}

export interface CatalogCard {
  id: string;
  name: string;
  bank: Bank;
  annualFee: number;
  cardType: CardType;
  network: CardNetwork;
  imageUrl?: string;
  cardColor: string;
  aliases?: string[];
  eligibleDowngrades?: string[];
  perksSummary?: string;
}

export interface UpcomingFeeItem {
  card: CreditCard;
  nextRenewalDate: string; // YYYY-MM-DD
  daysUntil: number;
  amount: number;
  status: 'due-soon' | 'upcoming' | 'later';
}

export interface BankRuleCheckResult {
  ruleName: string;
  bank: Bank;
  passed: boolean;
  status: 'eligible' | 'warning' | 'ineligible';
  title: string;
  description: string;
  details?: string;
  actionRecommendation?: string;
  nextEligibleDate?: string;
}

export interface FiveTwentyFourStatus {
  count: number;
  max: number;
  isEligible: boolean;
  cardsCounted: Array<{
    card: CreditCard;
    openDate: string;
    dropOffDate: string; // when it falls off 5/24
    daysUntilDropOff: number;
  }>;
  nextSlotOpeningDate?: string;
}
