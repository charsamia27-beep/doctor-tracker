'use client';
import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PAGE_SIZES } from '@/lib/constants';
import { formatNumber } from '@/lib/format';

/** Windowed page list: 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= total - 2) [total - 1, total - 2, total - 3].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['…', p] : [p]));
}

export const Pagination = memo(function Pagination({ pagination, onPageChange, onLimitChange, isFetching }) {
  if (!pagination) return null;
  const { page, limit, total, totalPages } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const btn = 'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors';

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-ink-100 px-4 py-3 sm:flex-row sm:px-6">
      <div className="flex items-center gap-3 text-sm text-ink-500">
        <span>
          <span className="font-medium text-ink-800">{formatNumber(from)}–{formatNumber(to)}</span> of{' '}
          <span className="font-medium text-ink-800">{formatNumber(total)}</span>
        </span>
        {onLimitChange && (
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="h-8 rounded-lg border-0 bg-ink-50 py-0 pl-2 pr-7 text-xs text-ink-700 ring-1 ring-ink-200 focus:ring-2 focus:ring-brand-500"
            aria-label="Rows per page"
          >
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} / page</option>)}
          </select>
        )}
        {isFetching && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" aria-label="Loading" />}
      </div>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button className={cn(btn, 'text-ink-600 hover:bg-ink-100 disabled:opacity-40')} disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageWindow(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="px-1 text-ink-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(btn, p === page ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-ink-100', 'hidden sm:flex', p === page && '!flex')}
            >
              {p}
            </button>
          )
        )}
        <button className={cn(btn, 'text-ink-600 hover:bg-ink-100 disabled:opacity-40')} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
});
