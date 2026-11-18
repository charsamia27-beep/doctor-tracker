import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

const variants = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800 shadow-sm dark:bg-ink-900 dark:text-navy-950 dark:hover:bg-ink-800',
  brand: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary: 'bg-card text-ink-800 ring-1 ring-inset ring-ink-200 hover:bg-ink-50',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
};
const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  icon: 'h-9 w-9 justify-center',
};

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
