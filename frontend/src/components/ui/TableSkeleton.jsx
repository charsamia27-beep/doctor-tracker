import { Skeleton } from './Misc';

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="divide-y divide-ink-100" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-1/3" /><Skeleton className="h-3 w-1/4" /></div>
          <Skeleton className="hidden h-6 w-20 md:block" />
          <Skeleton className="hidden h-6 w-28 md:block" />
        </div>
      ))}
    </div>
  );
}
