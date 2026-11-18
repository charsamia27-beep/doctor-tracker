'use client';
import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { controlClass } from './Field';
import { cn } from '@/lib/cn';

/**
 * Local state for instant typing feedback; the parent only hears about the
 * debounced value, so we fire one request per pause instead of per keystroke.
 */
export function SearchInput({ value, onChange, placeholder = 'Search…', className }) {
  const [text, setText] = useState(value || '');
  const debounced = useDebounce(text, 350);

  // Sync from outside (e.g. "Clear filters") without clobbering text the user is still typing.
  useEffect(() => {
    if ((value || '') !== debounced.trim()) setText(value || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  useEffect(() => {
    if (debounced.trim() !== (value || '')) onChange(debounced.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(controlClass, 'h-10 pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden')}
      />
      {text && (
        <button
          type="button"
          onClick={() => setText('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
