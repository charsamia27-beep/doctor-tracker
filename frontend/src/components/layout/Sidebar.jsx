'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';
import { NAV } from './nav';

export function SidebarContent({ onNavigate }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-navy-950 px-3 py-5 text-slate-300">
      <div className="px-3"><Logo light /></div>

      <div className="mt-9 px-3 text-[11px] font-semibold uppercase tracking-[.16em] text-slate-500">Menu</div>
      <nav className="mt-2 space-y-0.5" aria-label="Main">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-white/[.07] text-white' : 'text-slate-400 hover:bg-white/[.04] hover:text-white'
              )}
            >
              {active && <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-400" />}
              <Icon className={cn('h-[18px] w-[18px]', active ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300')} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl bg-white/[.04] p-4 ring-1 ring-white/[.06]">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <ShieldCheck className="h-4 w-4 text-brand-300" /> Secure session
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
          Every change is recorded in the activity log. Sessions expire after 8 hours.
        </p>
      </div>
    </div>
  );
}
