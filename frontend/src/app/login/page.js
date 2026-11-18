import { Suspense } from 'react';
import { Activity, LockKeyhole, ShieldCheck } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { Logo } from '@/components/layout/Logo';

export const metadata = { title: 'Sign in' };

const POINTS = [
  { icon: Activity, title: 'Live clinical analytics', text: 'Admissions, conditions and caseloads at a glance.' },
  { icon: ShieldCheck, title: 'Secure by default', text: 'httpOnly sessions, CSRF protection and account lockout.' },
  { icon: LockKeyhole, title: 'Full audit trail', text: 'Every sign-in and change is recorded.' },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-navy-950 p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 right-0 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[.05] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative"><Logo light /></div>
        <div className="relative my-auto max-w-md">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            The command centre for your <span className="text-brand-300">clinical team.</span>
          </h1>
          <p className="mt-4 text-slate-400">Manage doctors and patients and spot trends early, all from one place.</p>
          <ul className="mt-10 space-y-5">
            {POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[.06] text-brand-300 ring-1 ring-white/10">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-medium text-white">{title}</div>
                  <div className="text-sm text-slate-400">{text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} Doctor Tracker · Authorised personnel only</p>
      </section>

      <section className="flex items-center justify-center bg-canvas px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden"><Logo /></div>
          <h2 className="font-display text-3xl text-ink-900">Sign in</h2>
          <p className="mt-2 text-sm text-ink-500">Welcome back! Enter your admin credentials.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
