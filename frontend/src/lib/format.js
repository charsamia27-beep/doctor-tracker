const dateFmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const shortFmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' });
const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'short', year: '2-digit' });
const numFmt = new Intl.NumberFormat('en-US');

export const formatDate = (d) => (d ? dateFmt.format(new Date(d)) : '—');
export const formatNumber = (n) => numFmt.format(n ?? 0);
export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export function formatBucket(date, unit) {
  const d = new Date(date);
  return unit === 'month' ? monthFmt.format(d) : shortFmt.format(d);
}

export const initials = (name = '') =>
  name.replace(/^Dr\.?\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
export function timeAgo(date) {
  const secs = Math.round((new Date(date).getTime() - Date.now()) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(secs) >= size) return rtf.format(Math.round(secs / size), unit);
  }
  return 'just now';
}
