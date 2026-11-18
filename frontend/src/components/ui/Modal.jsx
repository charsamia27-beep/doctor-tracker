'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const panelRef = useRef(null);
  // Keep the latest onClose in a ref so the effect below only runs on open/close,
  // not every time the parent re-renders with a new inline callback.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // Focus the first form control (or the panel) for keyboard users.
    requestAnimationFrame(() => {
      const el = panelRef.current?.querySelector('input, select, textarea, button:not([data-close])');
      (el || panelRef.current)?.focus();
    });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prevFocus?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-navy-950/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92vh] w-full animate-pop-in flex-col rounded-t-3xl bg-card shadow-pop outline-none sm:rounded-3xl',
          size === 'sm' ? 'sm:max-w-md' : 'sm:max-w-2xl'
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
          <div>
            <h2 id="modal-title" className="font-display text-xl text-ink-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
          </div>
          <button data-close onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ink-100 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
