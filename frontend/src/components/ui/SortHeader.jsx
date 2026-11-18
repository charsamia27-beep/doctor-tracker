import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Clickable column header: toggles asc/desc, or switches the sort column. */
export function SortHeader({ label, field, sort, order, onSort, className }) {
  const active = sort === field;
  const Icon = !active ? ArrowUpDown : order === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th scope="col" className={cn('px-4 py-3 text-left', className)} aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        onClick={() => onSort({ sort: field, order: active && order === 'desc' ? 'asc' : 'desc' })}
        className={cn('inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors', active ? 'text-ink-900' : 'text-ink-500 hover:text-ink-800')}
      >
        {label}
        <Icon className={cn('h-3 w-3', !active && 'opacity-50')} />
      </button>
    </th>
  );
}

export function Th({ children, className }) {
  return <th scope="col" className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500', className)}>{children}</th>;
}
