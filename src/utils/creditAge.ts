import { CreditCard } from '../types';
import { toDateString } from './dateUtils';

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return toDateString(date) === value ? date : null;
}

// Estimate normal reporting retention; actual bureau removal dates can differ.
export function getCreditAccountAges(cards: CreditCard[], today: Date): number[] {
  const todayString = toDateString(today);
  return cards.flatMap((card) => {
    const opened = parseDate(card.openDate);
    if (card.cardType !== 'personal' || !opened || card.openDate > todayString) return [];

    if (card.status === 'closed') {
      const closed = parseDate(card.closedDate || '');
      // Without a usable closure date, retention cannot be estimated.
      if (!closed || card.closedDate! < card.openDate || card.closedDate! > todayString) return [];
      const removalYear = closed.getFullYear() + 10;
      const removalMonth = closed.getMonth();
      const removalDay = Math.min(closed.getDate(), new Date(removalYear, removalMonth + 1, 0).getDate());
      const removal = new Date(removalYear, removalMonth, removalDay);
      if (todayString >= toDateString(removal)) return [];
    }

    const months = (today.getFullYear() - opened.getFullYear()) * 12 + today.getMonth() - opened.getMonth();
    return [Math.max(0, months - (today.getDate() < opened.getDate() ? 1 : 0))];
  });
}
