'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { SidebarContent } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';

export function AppShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMenuOpen(false), [pathname]);

  // Global shortcut: Ctrl/⌘ + K opens the command palette.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:shadow-pop">
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-navy-950/60" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 animate-slide-in">
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
            <button onClick={() => setMenuOpen(false)} className="absolute right-3 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-white/10" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <Topbar onMenu={() => setMenuOpen(true)} onSearch={() => setSearchOpen(true)} />
        <main id="main" className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
