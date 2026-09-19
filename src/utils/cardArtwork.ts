import { CreditCard } from '../types';
import { findCatalogCard } from '../data/cardCatalog';

/**
 * Resolves artwork consistently across the app:
 * user override → current catalog artwork → legacy saved artwork → component fallback.
 */
export const getCardArtworkUrl = (card: CreditCard, productName = card.currentName) => {
  const catalogCard = findCatalogCard(productName, card.bank);
  return card.customImageUrl || catalogCard?.imageUrl || card.imageUrl;
};
