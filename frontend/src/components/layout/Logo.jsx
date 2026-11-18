export function Logo({ light = false, compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-[0_4px_14px_-4px_rgba(20,163,160,.6)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 12h4l2.5-6 5 12L17 12h4" />
        </svg>
      </span>
      {!compact && (
        <span className={`text-[17px] font-semibold tracking-tight ${light ? 'text-white' : 'text-ink-900'}`}>
          Doctor<span className={light ? 'text-brand-300' : 'text-brand-600 dark:text-brand-400'}>Tracker</span>
        </span>
      )}
    </div>
  );
}
