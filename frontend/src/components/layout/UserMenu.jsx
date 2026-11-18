'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, KeyRound, LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { useLogout, useMe } from '@/hooks/useAuth';
import { ChangePasswordModal } from './ChangePasswordModal';

export function UserMenu() {
  const { data: user } = useMe();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const item = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-ink-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={user?.name || 'Admin'} className="!h-8 !w-8" />
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold leading-tight text-ink-900">{user?.name ?? '…'}</span>
          <span className="block text-xs leading-tight text-ink-500">Administrator</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:block" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-2 w-64 animate-pop-in rounded-xl bg-card p-1.5 shadow-pop ring-1 ring-ink-200">
          <div className="border-b border-ink-100 px-3 pb-2.5 pt-1.5">
            <div className="truncate text-sm font-semibold text-ink-900">{user?.name}</div>
            <div className="truncate text-xs text-ink-500">{user?.email}</div>
          </div>
          <div className="pt-1.5">
            <button role="menuitem" className={`${item} text-ink-700 hover:bg-ink-100`} onClick={() => { setOpen(false); setPwOpen(true); }}>
              <KeyRound className="h-4 w-4 text-ink-400" /> Change password
            </button>
            <button role="menuitem" className={`${item} text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10`} onClick={() => logout.mutate()} disabled={logout.isPending}>
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      )}
      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  );
}
