import { cn } from '@/lib/cn';
import { CONDITION_STYLES } from '@/lib/constants';
import { initials } from '@/lib/format';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('rounded-2xl bg-card shadow-card ring-1 ring-ink-200/70 dark:shadow-none', className)} {...props}>
      {children}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-ink-100', className)} />;
}

export function ConditionBadge({ condition }) {
  const s = CONDITION_STYLES[condition] || CONDITION_STYLES.Stable;
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', s.badge)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {condition}
    </span>
  );
}

export function Tag({ children, className }) {
  return (
    <span className={cn('inline-flex items-center whitespace-nowrap rounded-md bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700', className)}>
      {children}
    </span>
  );
}

const palette = [
  'bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200',
  'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200',
  'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
  'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200',
  'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200',
];
export function Avatar({ name, className }) {
  const idx = [...(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
  return (
    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold', palette[idx], className)}>
      {initials(name)}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-50 ring-1 ring-ink-100">
          <Icon className="h-6 w-6 text-ink-400" />
        </div>
      )}
      <h3 className="font-semibold text-ink-900">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-ink-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="mb-1 text-xs font-semibold uppercase tracking-[.14em] text-brand-600 dark:text-brand-400">{eyebrow}</div>}
        <h1 className="font-display text-2xl text-ink-900 sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
