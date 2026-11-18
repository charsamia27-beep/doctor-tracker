'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CornerDownLeft, Loader2, Search, Stethoscope, User } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { doctorService, patientService } from '@/lib/services';
import { qk } from '@/lib/queryKeys';
import { cn } from '@/lib/cn';
import { NAV } from './nav';

/** Ctrl/⌘+K: jump to any page, doctor or patient. Uses the same indexed prefix-search endpoints. */
export function CommandPalette({ open, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [term, setTerm] = useState('');
  const [active, setActive] = useState(0);
  const q = useDebounce(term.trim(), 200);

  const { data, isFetching } = useQuery({
    queryKey: qk.search(q),
    queryFn: async ({ signal }) => {
      const [d, p] = await Promise.all([
        doctorService.list({ search: q, limit: 5, page: 1 }, signal),
        patientService.list({ search: q, limit: 5, page: 1 }, signal),
      ]);
      return { doctors: d.data, patients: p.data };
    },
    enabled: open && q.length >= 2,
    staleTime: 30_000,
  });

  const items = useMemo(() => {
    const lower = term.trim().toLowerCase();
    const pages = NAV.filter((n) => !lower || n.label.toLowerCase().includes(lower)).map((n) => ({
      key: n.href, group: 'Pages', label: n.label, icon: n.icon, href: n.href,
    }));
    const doctors = (q.length >= 2 ? data?.doctors ?? [] : []).map((d) => ({
      key: d._id, group: 'Doctors', label: d.name, sub: `${d.specialization} · ${d.hospital}`, icon: Stethoscope, href: `/doctors/${d._id}`,
    }));
    const patients = (q.length >= 2 ? data?.patients ?? [] : []).map((p) => ({
      key: p._id, group: 'Patients', label: p.name, sub: `${p.condition} · ${p.doctor?.name ?? ''}`, icon: User, href: `/patients?view=${p._id}`,
    }));
    return [...pages, ...doctors, ...patients];
  }, [term, q, data]);

  useEffect(() => {
    if (open) {
      setTerm('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);
  useEffect(() => setActive(0), [items.length]);

  if (!open || typeof document === 'undefined') return null;

  const go = (item) => {
    if (!item) return;
    onClose();
    router.push(item.href);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(items[active]); }
    else if (e.key === 'Escape') onClose();
  };

  let lastGroup = null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 animate-fade-in bg-navy-950/50 backdrop-blur-[2px]" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Search" className="relative w-full max-w-xl animate-pop-in overflow-hidden rounded-2xl bg-card shadow-pop ring-1 ring-ink-200">
        <div className="flex items-center gap-3 border-b border-ink-100 px-4">
          {isFetching ? <Loader2 className="h-4 w-4 animate-spin text-ink-400" /> : <Search className="h-4 w-4 text-ink-400" />}
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search doctors, patients or pages…"
            className="h-14 flex-1 bg-transparent text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={items[active] ? `pi-${items[active].key}` : undefined}
          />
          <kbd className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-500">ESC</kbd>
        </div>

        <ul id="palette-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {items.length === 0 && (
            <li className="px-3 py-10 text-center text-sm text-ink-500">
              {q.length >= 2 && !isFetching ? `No results for “${q}”` : 'Type at least 2 characters to search records'}
            </li>
          )}
          {items.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            const Icon = item.icon;
            return (
              <li key={item.key} role="presentation">
                {header && <div className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">{header}</div>}
                <div
                  id={`pi-${item.key}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(item)}
                  className={cn('flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5', i === active ? 'bg-brand-50 dark:bg-brand-500/10' : '')}
                >
                  <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', i === active ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-500')}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink-900">{item.label}</div>
                    {item.sub && <div className="truncate text-xs text-ink-500">{item.sub}</div>}
                  </div>
                  {i === active && <CornerDownLeft className="h-4 w-4 text-ink-400" />}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-4 border-t border-ink-100 px-4 py-2.5 text-[11px] text-ink-400">
          <span><kbd className="font-semibold">↑↓</kbd> navigate</span>
          <span><kbd className="font-semibold">↵</kbd> open</span>
          <span><kbd className="font-semibold">esc</kbd> close</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
