/** Format a date as an ISO date-only key (YYYY-MM-DD). */
export function dateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Shift a date by a number of UTC days, returning a new date. */
export function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** Date-only key for today shifted by a number of UTC days. */
export function relativeDateKey(days: number): string {
  return dateKey(addUtcDays(new Date(), days));
}
