import { Card, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';

export function ChartCard({ title, subtitle, action, children, className, bodyClass = 'h-72', loading }) {
  return (
    <Card className={cn('flex flex-col p-5 sm:p-6', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-ink-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={cn('relative', bodyClass)}>{loading ? <Skeleton className="h-full w-full rounded-xl" /> : children}</div>
    </Card>
  );
}
