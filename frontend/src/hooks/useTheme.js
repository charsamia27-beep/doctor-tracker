'use client';
import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'dt-theme';
const listeners = new Set();

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
const getSnapshot = () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
const getServerSnapshot = () => 'light';

/** Tiny theme store backed by the <html> class + localStorage (no extra dependency). */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setTheme = useCallback((next) => {
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage may be unavailable (private mode) */
    }
    listeners.forEach((l) => l());
  }, []);
  const toggle = useCallback(() => setTheme(getSnapshot() === 'dark' ? 'light' : 'dark'), [setTheme]);
  return { theme, setTheme, toggle };
}
