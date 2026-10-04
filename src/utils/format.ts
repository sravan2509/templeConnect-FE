export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString([], { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Adds https:// to bare website links so they can be opened. */
export function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
