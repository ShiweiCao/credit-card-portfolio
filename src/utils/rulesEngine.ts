import { CreditCard, FiveTwentyFourStatus, BankRuleCheckResult, Bank } from '../types';
import { isWithinPastMonths, getChase524DropOffDate, getDaysUntil, getTodayDate, formatDate, toDateString } from './dateUtils';

/**
 * Calculates Chase 5/24 status.
 * Counts personal cards opened in the past 24 months.
 * Note: Most business cards (Chase, Amex, Citi, Bank of America) DO NOT report
 * to personal credit bureaus and thus DO NOT count towards 5/24.
 * Capital One Spark Cash and Discover business cards traditionally do report.
 */
export function calculateChase524(cards: CreditCard[]): FiveTwentyFourStatus {
  const cardsCounted: FiveTwentyFourStatus['cardsCounted'] = [];

  cards.forEach((card) => {
    // Check if opened within past 24 months
    if (!isWithinPastMonths(card.openDate, 24)) return;

    // Check if it reports to personal credit bureaus
    let countsTowards524 = false;
    if (card.cardType === 'personal') {
      countsTowards524 = true;
    } else if (card.cardType === 'business') {
      // Capital One Spark cards (except Spark Cash Plus) and Discover biz traditionally report
      if (card.bank === 'Capital One' && !card.currentName.toLowerCase().includes('plus')) {
        countsTowards524 = true;
      } else if (card.bank === 'Discover') {
        countsTowards524 = true;
      }
    }

    if (countsTowards524) {
      const dropOffDate = getChase524DropOffDate(card.openDate);
      const daysUntil = getDaysUntil(dropOffDate);
      cardsCounted.push({
        card,
        openDate: card.openDate,
        dropOffDate,
        daysUntilDropOff: Math.max(0, daysUntil),
      });
    }
  });

  // Sort by drop-off date ascending (soonest drop off first)
  cardsCounted.sort((a, b) => a.dropOffDate.localeCompare(b.dropOffDate));

  const count = cardsCounted.length;
  const isEligible = count < 5;
  const nextSlotOpeningDate = cardsCounted.length > 0 ? cardsCounted[0].dropOffDate : undefined;

  return {
    count,
    max: 5,
    isEligible,
    cardsCounted,
    nextSlotOpeningDate,
  };
}

/**
 * Analyzes bank-by-bank rules and application restrictions based on user's portfolio
 */
export function evaluateBankRules(cards: CreditCard[]): BankRuleCheckResult[] {
  const results: BankRuleCheckResult[] = [];
  const fiveTwentyFour = calculateChase524(cards);
  const activeCards = cards.filter((c) => c.status === 'active');
  const today = getTodayDate();

  // 1. Chase 5/24
  if (fiveTwentyFour.count >= 5) {
    results.push({
      ruleName: 'Chase 5/24 Rule',
      bank: 'Chase',
      passed: false,
      status: 'ineligible',
      title: 'Over 5/24 (Ineligible for Chase Cards)',
      description: `You have opened ${fiveTwentyFour.count} personal credit cards in the past 24 months. Chase will automatically decline applications for new cards.`,
      details: `Next slot will open on ${formatDate(fiveTwentyFour.nextSlotOpeningDate)} when your ${fiveTwentyFour.cardsCounted[0]?.card.currentName} drops off.`,
      actionRecommendation: 'Hold off on applying for Chase personal and business cards until your count falls below 5/24. Consider business cards from Amex or Citi in the meantime.',
      nextEligibleDate: fiveTwentyFour.nextSlotOpeningDate,
    });
  } else if (fiveTwentyFour.count === 4) {
    results.push({
      ruleName: 'Chase 5/24 Rule',
      bank: 'Chase',
      passed: true,
      status: 'warning',
      title: `At 4/24 (1 Slot Remaining!)`,
      description: `You are at 4/24 with only 1 slot remaining before reaching the 5/24 limit.`,
      details: `If you plan to get both a Chase personal card and Chase business card, apply for the business card FIRST (as Chase biz cards require under 5/24, but do not add to your 5/24 count).`,
      actionRecommendation: 'Prioritize high-value Chase cards before taking a slot with another bank!',
    });
  } else {
    results.push({
      ruleName: 'Chase 5/24 Rule',
      bank: 'Chase',
      passed: true,
      status: 'eligible',
      title: `Under 5/24 (${fiveTwentyFour.count}/24 - ${5 - fiveTwentyFour.count} Slots Available)`,
      description: `You are eligible for Chase credit card approvals under the 5/24 rule.`,
      actionRecommendation: 'You are in prime position to apply for Chase Sapphire, Ink Business, or Freedom cards.',
    });
  }

  // 2. Chase 2/30 Velocity Rule (Max 2 cards in 30 days)
  const chaseCardsLast30Days = cards.filter(
    (c) => c.bank === 'Chase' && isWithinPastMonths(c.openDate, 1)
  );
  if (chaseCardsLast30Days.length >= 2) {
    results.push({
      ruleName: 'Chase 2/30 Rule',
      bank: 'Chase',
      passed: false,
      status: 'ineligible',
      title: 'Chase 2/30 Velocity Triggered',
      description: `You opened ${chaseCardsLast30Days.length} Chase cards in the last 30 days. Chase strictly limits approvals to 2 cards per 30 days.`,
      actionRecommendation: 'Wait at least 30 days from your last Chase approval before applying again.',
    });
  } else if (chaseCardsLast30Days.length === 1) {
    results.push({
      ruleName: 'Chase 2/30 Rule',
      bank: 'Chase',
      passed: true,
      status: 'warning',
      title: 'Chase 2/30 (1 Approval in 30 Days)',
      description: `You opened 1 Chase card recently (${chaseCardsLast30Days[0].currentName}). You have 1 remaining approval slot this 30-day window.`,
      actionRecommendation: 'Space out applications by at least 1-2 weeks to avoid fraud flags.',
    });
  }

  // 3. Chase Sapphire One-Card & 48-Month Rule
  const activeSapphire = activeCards.find((c) =>
    c.bank === 'Chase' && (c.currentName.toLowerCase().includes('sapphire') || c.originalName.toLowerCase().includes('sapphire') && !c.productChanges.length)
  );
  const allSapphireCards = cards.filter((c) =>
    c.bank === 'Chase' && (c.currentName.toLowerCase().includes('sapphire') || c.originalName.toLowerCase().includes('sapphire'))
  );
  // Check if any sapphire bonus opened in past 48 months
  const recentSapphire = allSapphireCards.find((c) => isWithinPastMonths(c.openDate, 48));

  if (activeSapphire) {
    results.push({
      ruleName: 'Chase Sapphire "One Card" Rule',
      bank: 'Chase',
      passed: false,
      status: 'warning',
      title: 'Active Sapphire Card Held',
      description: `You currently hold an active Sapphire card (${activeSapphire.currentName}). Chase strictly prohibits holding both Sapphire Preferred and Sapphire Reserve simultaneously.`,
      actionRecommendation: 'To apply for a new Sapphire welcome bonus, product change (downgrade) your current Sapphire to a Freedom card first (if it has been >48 months since your last bonus).',
    });
  }
  if (recentSapphire) {
    results.push({
      ruleName: 'Chase Sapphire 48-Month Bonus Rule',
      bank: 'Chase',
      passed: false,
      status: 'ineligible',
      title: 'Sapphire 48-Month Clock Active',
      description: `You opened ${recentSapphire.currentName} on ${formatDate(recentSapphire.openDate)}. Chase restricts new Sapphire welcome bonuses to once every 48 months.`,
      details: `Eligible for a new Sapphire welcome bonus 48 months after bonus received.`,
      actionRecommendation: 'Target Ink Business or hotel/airline cards instead while the 48-month clock ticks down.',
    });
  }

  // 4. American Express 5 Credit Card Limit
  // Note: Amex limits users to 5 credit cards (revolving). Charge cards (Platinum, Gold, Green) typically don't count towards this 5-card limit!
  const amexRevolvingCards = activeCards.filter(
    (c) =>
      c.bank === 'American Express' &&
      !['platinum', 'gold', 'green'].some((charge) => c.currentName.toLowerCase().includes(charge))
  );
  if (amexRevolvingCards.length >= 5) {
    results.push({
      ruleName: 'Amex 5 Credit Card Limit',
      bank: 'American Express',
      passed: false,
      status: 'ineligible',
      title: 'Amex 5 Credit Card Cap Reached',
      description: `You currently hold ${amexRevolvingCards.length} active American Express credit cards (revolving). Amex caps individuals at 5 credit cards.`,
      actionRecommendation: 'You must close an existing Amex credit card before Amex will approve another revolving credit card.',
    });
  } else {
    results.push({
      ruleName: 'Amex 5 Credit Card Limit',
      bank: 'American Express',
      passed: true,
      status: 'eligible',
      title: `Amex 5 Credit Card Cap (${amexRevolvingCards.length}/5)`,
      description: `You hold ${amexRevolvingCards.length} active Amex revolving credit cards out of the 5 allowed limit. (Charge cards like Gold/Platinum do not count).`,
      actionRecommendation: `${5 - amexRevolvingCards.length} revolving slots available.`,
    });
  }

  // 5. Amex 2/90 Velocity Rule (Max 2 credit cards in 90 days)
  const amexRecentCreditCards = cards.filter(
    (c) =>
      c.bank === 'American Express' &&
      isWithinPastMonths(c.openDate, 3) &&
      !['platinum', 'gold', 'green'].some((charge) => c.currentName.toLowerCase().includes(charge))
  );
  if (amexRecentCreditCards.length >= 2) {
    results.push({
      ruleName: 'Amex 2/90 Velocity Rule',
      bank: 'American Express',
      passed: false,
      status: 'ineligible',
      title: 'Amex 2/90 Rule Triggered',
      description: `You opened ${amexRecentCreditCards.length} Amex credit cards in the past 90 days. Amex permits a maximum of 2 credit cards every 90 days.`,
      actionRecommendation: 'Wait until 90 days have elapsed from your first card in this window before applying.',
    });
  }

  // 6. Capital One 1/6 Rule & 2-Card Cap
  const capOneActivePersonal = activeCards.filter((c) => c.bank === 'Capital One' && c.cardType === 'personal');
  const capOneRecent = cards.filter((c) => c.bank === 'Capital One' && isWithinPastMonths(c.openDate, 6));

  if (capOneRecent.length >= 1) {
    results.push({
      ruleName: 'Capital One 1/6 Rule',
      bank: 'Capital One',
      passed: false,
      status: 'ineligible',
      title: 'Capital One 1/6 Restriction Active',
      description: `You opened a Capital One card (${capOneRecent[0].currentName}) within the past 6 months. Capital One strictly allows only 1 card approval per 6 months.`,
      actionRecommendation: 'Wait until 6 full months have passed from your last Capital One approval.',
    });
  }
  if (capOneActivePersonal.length >= 2) {
    results.push({
      ruleName: 'Capital One 2-Personal Card Limit',
      bank: 'Capital One',
      passed: false,
      status: 'warning',
      title: 'Capital One 2-Card Personal Limit Reached',
      description: `You have ${capOneActivePersonal.length} active personal Capital One cards. Capital One enforces a limit of 2 personal cards for most customers.`,
      actionRecommendation: 'Consider Capital One business cards (e.g. Spark) or close an unused card before applying for a new personal card.',
    });
  }

  // 7. Citi 8/65 Rule (Max 1 card per 8 days, max 2 per 65 days)
  const citiCards = cards.filter((c) => c.bank === 'Citi');
  const citiLast8Days = citiCards.filter((c) => {
    const days = getDaysUntil(c.openDate);
    return days >= -8 && days <= 0;
  });
  const citiLast65Days = citiCards.filter((c) => {
    const days = getDaysUntil(c.openDate);
    return days >= -65 && days <= 0;
  });

  if (citiLast8Days.length >= 1) {
    results.push({
      ruleName: 'Citi 8/65 Rule',
      bank: 'Citi',
      passed: false,
      status: 'ineligible',
      title: 'Citi 8-Day Rule Triggered',
      description: `Citi strictly limits applications to 1 card every 8 days.`,
      actionRecommendation: 'Wait at least 8 days between Citi card applications.',
    });
  } else if (citiLast65Days.length >= 2) {
    results.push({
      ruleName: 'Citi 8/65 Rule',
      bank: 'Citi',
      passed: false,
      status: 'ineligible',
      title: 'Citi 65-Day Rule Triggered',
      description: `You have opened 2 Citi cards in the last 65 days. Citi permits at most 2 applications per 65 days.`,
      actionRecommendation: 'Wait until 65 days pass before submitting your next Citi application.',
    });
  } else {
    results.push({
      ruleName: 'Citi 8/65 Rule',
      bank: 'Citi',
      passed: true,
      status: 'eligible',
      title: 'Citi 8/65 Velocity Clear',
      description: `You are clear under Citi's 8/65 velocity guidelines.`,
    });
  }

  // 8. Bank of America 2/3/4 Rule
  // Max 2 cards per 2 months, 3 cards per 12 months, 4 cards per 24 months
  const bofaCards = cards.filter((c) => c.bank === 'Bank of America');
  const bofa2m = bofaCards.filter((c) => isWithinPastMonths(c.openDate, 2)).length;
  const bofa12m = bofaCards.filter((c) => isWithinPastMonths(c.openDate, 12)).length;
  const bofa24m = bofaCards.filter((c) => isWithinPastMonths(c.openDate, 24)).length;

  if (bofa2m >= 2 || bofa12m >= 3 || bofa24m >= 4) {
    results.push({
      ruleName: 'Bank of America 2/3/4 Rule',
      bank: 'Bank of America',
      passed: false,
      status: 'ineligible',
      title: 'BofA 2/3/4 Rule Limit Reached',
      description: `You have opened ${bofa2m} cards in 2 months, ${bofa12m} in 12 months, or ${bofa24m} in 24 months with Bank of America.`,
      actionRecommendation: 'Wait until velocity limits reset before applying for BofA cards.',
    });
  } else {
    results.push({
      ruleName: 'Bank of America 2/3/4 Rule',
      bank: 'Bank of America',
      passed: true,
      status: 'eligible',
      title: `BofA 2/3/4 Status (${bofa2m}/2 in 2m, ${bofa12m}/3 in 12m, ${bofa24m}/4 in 24m)`,
      description: 'Your application velocity is within Bank of America limits.',
    });
  }

  return results;
}
