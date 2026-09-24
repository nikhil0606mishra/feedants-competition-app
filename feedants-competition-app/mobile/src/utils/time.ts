export interface CountdownParts {
  days: number; hours: number; minutes: number; seconds: number;
  totalMs: number; isExpired: boolean;
}

export const pad2 = (n: number) => String(n).padStart(2, '0');

/** Pure: split the time between `now` and `target` into d/h/m/s. Clamps at zero. */
export function getCountdown(target: string | Date, now: Date): CountdownParts {
  const totalMs = Math.max(new Date(target).getTime() - now.getTime(), 0);
  const totalSeconds = Math.floor(totalMs / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    totalMs,
    isExpired: totalMs === 0,
  };
}

/** "Aug 6" */
export function formatShortDate(iso: string | Date): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** "₹1,500" */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/** "10 Aug 26" */
export function formatDateShort(iso: string | Date): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

/** "11:50 PM" */
export function formatTime(iso: string | Date): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
