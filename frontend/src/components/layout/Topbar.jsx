'use client';
import { usePathname } from 'next/navigation';
import { ChevronRight, Menu, Search } from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { titleFor } from './nav';

export function Topbar({ onMenu, onSearch }) {
  const pathname = usePathname();
  const crumbs = titleFor(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <button onClick={onMenu} className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden"><Logo compact /></div>

        <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm lg:flex">
          <span className="text-ink-400">Admin</span>
          {crumbs.map((c, i) => (
            <span key={c} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
              <span className={i === crumbs.length - 1 ? 'font-medium text-ink-900' : 'text-ink-500'}>{c}</span>
            </span>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            onClick={onSearch}
            className="flex h-9 items-center gap-2 rounded-xl bg-card px-3 text-sm text-ink-400 ring-1 ring-ink-200 transition-colors hover:text-ink-600 sm:w-64"
            aria-label="Search (Ctrl+K)"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search doctors, patients…</span>
            <kbd className="ml-auto hidden rounded-md bg-ink-100 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-ink-500 sm:inline">Ctrl K</kbd>
          </button>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
