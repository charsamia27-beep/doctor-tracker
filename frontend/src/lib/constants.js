export const SPECIALIZATIONS = [
  'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics',
  'Psychiatry', 'Oncology', 'Gynecology', 'ENT', 'General Medicine',
];
export const CONDITIONS = ['Stable', 'Recovering', 'Under Observation', 'Critical'];
export const GENDERS = ['Male', 'Female', 'Other'];

export const CONDITION_STYLES = {
  Stable: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/25', dot: 'bg-emerald-500', color: '#10b981' },
  Recovering: { badge: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/25', dot: 'bg-sky-500', color: '#0ea5e9' },
  'Under Observation': { badge: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/25', dot: 'bg-amber-500', color: '#f59e0b' },
  Critical: { badge: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25', dot: 'bg-rose-500', color: '#f43f5e' },
};

export const PAGE_SIZES = [10, 20, 50];
