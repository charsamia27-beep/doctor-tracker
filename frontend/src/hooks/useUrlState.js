'use client';
import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Keeps list state (page, filters, search, sort) in the URL so views are
 * shareable, survive refresh and work with the back button.
 * Any change other than `page` itself resets pagination to 1.
 */
export function useUrlState(defaults) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();

  const state = useMemo(() => {
    const out = { ...defaults };
    const sp = new URLSearchParams(qs);
    for (const key of Object.keys(defaults)) {
      const v = sp.get(key);
      if (v !== null) out[key] = typeof defaults[key] === 'number' ? Number(v) || defaults[key] : v;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  const setState = useCallback(
    (updates) => {
      const sp = new URLSearchParams(qs);
      const resetsPage = Object.keys(updates).some((k) => k !== 'page');
      for (const [k, v] of Object.entries(updates)) {
        if (v === undefined || v === null || v === '' || v === defaults[k]) sp.delete(k);
        else sp.set(k, String(v));
      }
      if (resetsPage && !('page' in updates)) sp.delete('page');
      const next = sp.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [qs, pathname, router]
  );

  const reset = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  return [state, setState, reset];
}
