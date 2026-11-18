'use client';
import { Button } from '@/components/ui';

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h2 className="font-display text-2xl">Something went wrong</h2>
      <p className="max-w-md text-sm text-ink-500">{error?.message || 'An unexpected error occurred.'}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
