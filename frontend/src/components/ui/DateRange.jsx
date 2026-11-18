'use client';
import { controlClass } from './Field';
import { cn } from '@/lib/cn';

export function DateRange({ from, to, onChange, label = 'Date' }) {
  const cls = cn(controlClass, 'h-10 px-3 text-ink-700');
  return (
    <div className="flex items-center gap-2" role="group" aria-label={`${label} range`}>
      <input type="date" value={from || ''} max={to || undefined} onChange={(e) => onChange({ from: e.target.value })} className={cls} aria-label={`${label} from`} />
      <span className="text-ink-400">–</span>
      <input type="date" value={to || ''} min={from || undefined} onChange={(e) => onChange({ to: e.target.value })} className={cls} aria-label={`${label} to`} />
    </div>
  );
}
