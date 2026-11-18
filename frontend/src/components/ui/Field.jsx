import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export const controlClass =
  'block w-full rounded-xl border-0 bg-card text-sm text-ink-900 ring-1 ring-inset ring-ink-200 ' +
  'placeholder:text-ink-400 transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-500 ' +
  'disabled:bg-ink-50 disabled:text-ink-400';

/** Label + control + error message with correct aria wiring. */
export function Field({ label, error, hint, children, className }) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-ink-500">
          {label}
        </label>
      )}
      {children({ id, 'aria-invalid': !!error || undefined, 'aria-describedby': error ? errorId : undefined })}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(controlClass, 'h-10 px-3.5', props['aria-invalid'] && 'ring-rose-400 focus:ring-rose-500', className)}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={3}
      className={cn(controlClass, 'px-3.5 py-2.5', props['aria-invalid'] && 'ring-rose-400', className)}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          controlClass,
          'h-10 appearance-none pl-3.5 pr-9',
          props['aria-invalid'] && 'ring-rose-400',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
    </div>
  );
});
