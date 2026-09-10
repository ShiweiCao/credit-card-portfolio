// Utility functions for dates and card renewal calculations

export function getTodayDate(): Date {
  return new Date();
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const d = new Date(year, month, day);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatMonthDay(dateString?: string): string {
  if (!dateString) return 'N/A';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const d = new Date(year, month, day);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the next annual fee renewal date for an active card.
 * If feeRenewalDate is specified, use its month and day.
 * Otherwise, use the openDate's month and day.
 */
export function getNextRenewalDate(openDateStr: string, customRenewalStr?: string): string {
  const today = getTodayDate();
  const baseDateStr = customRenewalStr || openDateStr;
  const parts = baseDateStr.split('-');
  if (parts.length !== 3) return baseDateStr;

  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  // Check this year
  const currentYear = today.getFullYear();
  let candidate = new Date(currentYear, month, day);

  // Set today to midnight for pure day comparison
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // If candidate is in the past, the next renewal is next year
  if (candidate < todayMidnight) {
    candidate = new Date(currentYear + 1, month, day);
  }

  return toDateString(candidate);
}

/**
 * Calculates how many days until a given date string (YYYY-MM-DD)
 */
export function getDaysUntil(dateStr: string): number {
  const today = getTodayDate();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const parts = dateStr.split('-');
  if (parts.length !== 3) return 0;
  const target = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10)
  );

  const diffTime = target.getTime() - todayMidnight.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns whether a date is within the past X months from today
 */
export function isWithinPastMonths(dateStr: string, months: number): boolean {
  const today = getTodayDate();
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;

  const cardDate = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10)
  );

  const cutoff = new Date(today.getFullYear(), today.getMonth() - months, today.getDate());
  return cardDate >= cutoff && cardDate <= today;
}

/**
 * Returns whether a date is within the past X days from today
 */
export function isWithinPastDays(dateStr: string, days: number): boolean {
  const today = getTodayDate();
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;

  const cardDate = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10)
  );

  const cutoff = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
  return cardDate >= cutoff && cardDate <= today;
}

/**
 * Returns the exact drop-off date for Chase 5/24.
 * Rule: Card opened on YYYY-MM-DD drops off 24 months later.
 * In practice for Chase: it either drops off 24 calendar months + 1 day, or 1st day of month 25.
 * We provide the conservative date (1st of month 25) and exact 24m date.
 */
export function getChase524DropOffDate(openDateStr: string): string {
  const parts = openDateStr.split('-');
  if (parts.length !== 3) return openDateStr;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);

  // 24 months later
  // Most data points show Chase 5/24 clears on the 1st day of the 25th month
  const dropOff = new Date(year + 2, month + 1, 1);
  return toDateString(dropOff);
}

export function getExact24MonthDate(openDateStr: string): string {
  const parts = openDateStr.split('-');
  if (parts.length !== 3) return openDateStr;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const dropOff = new Date(year + 2, month, day);
  return toDateString(dropOff);
}

/**
 * Get count of months between two dates
 */
export function getMonthsBetween(d1Str: string, d2Str: string): number {
  const p1 = d1Str.split('-').map(Number);
  const p2 = d2Str.split('-').map(Number);
  return (p2[0] - p1[0]) * 12 + (p2[1] - p1[1]);
}

/**
 * Formats a date string (YYYY-MM-DD) into Month Year (e.g., "Apr 2024")
 */
export function formatMonthYear(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Calculates duration between two dates in LinkedIn style (e.g. "2 yrs 5 mos", "1 yr", "8 mos")
 */
export function formatLinkedInDuration(startDateStr: string, endDateStr?: string): string {
  const startParts = startDateStr.split('-').map(Number);
  if (startParts.length !== 3) return '';

  let endYear: number;
  let endMonth: number;
  let endDay: number;

  if (endDateStr) {
    const endParts = endDateStr.split('-').map(Number);
    if (endParts.length !== 3) return '';
    endYear = endParts[0];
    endMonth = endParts[1];
    endDay = endParts[2];
  } else {
    const today = getTodayDate();
    endYear = today.getFullYear();
    endMonth = today.getMonth() + 1;
    endDay = today.getDate();
  }

  // Calculate difference in months
  let totalMonths = (endYear - startParts[0]) * 12 + (endMonth - startParts[1]);
  // Adjust if end day is before start day
  if (endDay < startParts[2]) {
    totalMonths = Math.max(0, totalMonths - 1);
  }

  if (totalMonths <= 0) {
    return '1 mo';
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  }
  if (months > 0 || years === 0) {
    parts.push(`${months} mo${months !== 1 ? 's' : ''}`);
  }

  return parts.join(' ');
}

/**
 * Formats a LinkedIn-style date line:
 * e.g. "Apr 2025 – Present · 1 yr 5 mos"
 * or "Apr 2024 – Apr 2025 · 1 yr"
 */
export function getLinkedInDateRange(
  startDateStr: string,
  endDateStr?: string,
  isPresent: boolean = false
): string {
  const start = formatMonthYear(startDateStr);
  const end = isPresent || !endDateStr ? 'Present' : formatMonthYear(endDateStr);
  const duration = formatLinkedInDuration(startDateStr, isPresent ? undefined : endDateStr);

  return `${start} – ${end} · ${duration}`;
}

