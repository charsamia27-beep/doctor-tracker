import { memo } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';

const TONES = {
  teal: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  navy: 'bg-slate-100 text-navy-800 dark:bg-white/10 dark:text-slate-200',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
};

export const StatCard = memo(function StatCard({ label, value, icon: Icon, hint, trend, tone = 'teal', loading }) {
  return (
    <Card className="group relative overflow-hidden p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', TONES[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        )}
        <span className="text-sm font-medium text-ink-500">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="mt-4 h-8 w-24" />
      ) : (
        <div className="mt-4 flex items-end gap-2">
          <span className="font-display text-[2rem] leading-none tabular-nums text-ink-900">{value}</span>
          {typeof trend === 'number' && (
            <span
              className={cn(
                'mb-0.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold',
                trend >= 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
              )}
            >
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend >= 0 ? '+' : '−'}{Math.abs(trend)}%
            </span>
          )}
        </div>
      )}
      {hint && <p className="mt-2 truncate text-xs text-ink-500">{loading ? ' ' : hint}</p>}
    </Card>
  );
});
