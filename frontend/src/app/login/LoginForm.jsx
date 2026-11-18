'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button, Field, Input } from '@/components/ui';
import { useLogin } from '@/hooks/useAuth';
import { loginSchema } from '@/lib/schemas';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useLogin();
  const [show, setShow] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values) =>
    login.mutate(values, {
      onSuccess: () => {
        const next = params.get('next');
        // Only allow internal redirects (prevents open-redirect via ?next=https://evil.com).
        router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard');
        router.refresh();
      },
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
      {login.error && (
        <div role="alert" aria-live="assertive" className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          <Lock className="h-4 w-4 shrink-0" /> {login.error.message}
        </div>
      )}
      <Field label="Email" error={errors.email?.message}>
        {(p) => <Input {...p} type="email" autoComplete="email" placeholder="admin@doctortracker.com" {...register('email')} />}
      </Field>
      <Field label="Password" error={errors.password?.message}>
        {(p) => (
          <div className="relative">
            <Input {...p} type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" className="pr-10" {...register('password')} />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-400 hover:text-ink-700" aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        )}
      </Field>
      <Button type="submit" variant="brand" className="w-full" size="md" loading={login.isPending}>Sign in</Button>
      {process.env.NODE_ENV !== 'production' && (
        <p className="rounded-lg bg-ink-100 px-3 py-2 text-center text-xs text-ink-500">
          Demo (dev only): admin@doctortracker.com · Admin@12345
        </p>
      )}
    </form>
  );
}
