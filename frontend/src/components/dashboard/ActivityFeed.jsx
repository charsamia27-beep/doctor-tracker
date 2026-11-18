'use client';
import { memo } from 'react';
import { KeyRound, LogIn, LogOut, Pencil, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/cn';

export const ACTION_META = {
  create: { icon: Plus, cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300', label: 'Created' },
  update: { icon: Pencil, cls: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300', label: 'Updated' },
  delete: { icon: Trash2, cls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300', label: 'Deleted' },
  login: { icon: LogIn, cls: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300', label: 'Signed in' },
  logout: { icon: LogOut, cls: 'bg-ink-100 text-ink-500', label: 'Signed out' },
  login_failed: { icon: ShieldAlert, cls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300', label: 'Failed sign-in' },
  account_locked: { icon: ShieldAlert, cls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300', label: 'Account locked' },
  password_change: { icon: KeyRound, cls: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300', label: 'Password changed' },
};

export const ActivityItem = memo(function ActivityItem({ log, last }) {
  const meta = ACTION_META[log.action] || ACTION_META.update;
  const Icon = meta.icon;
  return (
    <li className="relative flex gap-3 pb-5">
      {!last && <span className="absolute left-4 top-9 h-[calc(100%-2.25rem)] w-px bg-ink-200" aria-hidden />}
      <span className={cn('relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full', meta.cls)}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm text-ink-800">{log.summary || meta.label}</p>
        <p className="mt-0.5 truncate text-xs text-ink-500">
          {log.actorEmail ?? 'system'} · <time dateTime={log.createdAt} title={new Date(log.createdAt).toLocaleString()}>{timeAgo(log.createdAt)}</time>
        </p>
      </div>
    </li>
  );
});

export function ActivityFeed({ logs, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3"><Skeleton className="h-8 w-8 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-3/4" /><Skeleton className="h-3 w-1/3" /></div></div>
        ))}
      </div>
    );
  }
  if (!logs?.length) return <p className="py-8 text-center text-sm text-ink-500">No activity yet.</p>;
  return <ul>{logs.map((l, i) => <ActivityItem key={l._id} log={l} last={i === logs.length - 1} />)}</ul>;
}
