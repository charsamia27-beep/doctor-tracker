import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="font-display text-7xl text-ink-300">404</p>
      <h1 className="text-lg font-semibold">This page doesn’t exist</h1>
      <Link href="/dashboard" className="text-sm font-medium text-brand-700 hover:underline">Back to dashboard</Link>
    </div>
  );
}
