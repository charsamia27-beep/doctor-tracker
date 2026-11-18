import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from './Button';

/** Wrapper that lays out search + filters responsively and shows a reset action when anything is active. */
export function FilterBar({ children, activeCount = 0, onReset }) {
  return (
    <div className="flex flex-col gap-3 border-b border-ink-100 p-4 sm:p-5 lg:flex-row lg:flex-wrap lg:items-center">
      {children}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onReset} className="lg:ml-auto">
          <X className="h-3.5 w-3.5" /> Clear {activeCount} filter{activeCount > 1 ? 's' : ''}
        </Button>
      )}
    </div>
  );
}

export function FilterLabel() {
  return (
    <span className="hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400 xl:flex">
      <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
    </span>
  );
}
