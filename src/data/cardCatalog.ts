import { CatalogCard, Bank, CardNetwork, CardType } from '../types';
import rawCatalog from './cardCatalog.json';

export const CARD_CATALOG: CatalogCard[] = rawCatalog as CatalogCard[];

/**
 * Find catalog card by exact or fuzzy name match, optionally constrained by bank
 */
export function findCatalogCard(name: string, bank?: Bank): CatalogCard | undefined {
  if (!name) return undefined;
  const clean = name.trim().toLowerCase();

  return CARD_CATALOG.find((card) => {
    if (bank && bank !== 'Other' && card.bank !== bank) {
      return false;
    }
    if (card.name.toLowerCase() === clean) return true;
    if (card.id.toLowerCase() === clean) return true;
    if (card.aliases?.some((alias) => alias.toLowerCase() === clean)) return true;
    return false;
  });
}

/**
 * Filter catalog for autocomplete suggestions
 */
export function searchCardCatalog(query: string, bankFilter?: Bank, limit: number = 8): CatalogCard[] {
  const clean = query.trim().toLowerCase();

  let pool = CARD_CATALOG;
  if (bankFilter && bankFilter !== 'Other') {
    pool = pool.filter((card) => card.bank === bankFilter);
  }

  if (!clean) {
    return pool.slice(0, limit);
  }

  return pool
    .filter((card) => {
      const matchName = card.name.toLowerCase().includes(clean);
      const matchBank = card.bank.toLowerCase().includes(clean);
      const matchAlias = card.aliases?.some((a) => a.toLowerCase().includes(clean));
      const matchPerk = card.perksSummary?.toLowerCase().includes(clean);
      return matchName || matchBank || matchAlias || matchPerk;
    })
    .slice(0, limit);
}

/**
 * Return default visual theme gradient for a bank
 */
export const BANK_GRADIENTS: Record<Bank, string> = {
  Chase: 'from-blue-900 via-indigo-950 to-slate-900',
  'American Express': 'from-amber-600 via-yellow-700 to-amber-900',
  Citi: 'from-cyan-900 via-blue-950 to-slate-900',
  'Capital One': 'from-slate-900 via-zinc-900 to-neutral-950',
  'Bank of America': 'from-red-800 via-rose-950 to-neutral-900',
  Discover: 'from-orange-700 via-amber-800 to-neutral-900',
  'Wells Fargo': 'from-stone-900 via-red-950 to-neutral-950',
  'U.S. Bank': 'from-slate-900 via-indigo-950 to-black',
  Barclays: 'from-sky-900 via-blue-950 to-slate-900',
  Other: 'from-neutral-800 to-neutral-950',
};
