'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { Button, Field, Input, Modal } from '@/components/ui';
import { authService } from '@/lib/services';
import { changePasswordSchema, PASSWORD_RULES } from '@/lib/schemas';
import { applyServerErrors } from '@/lib/forms';
import { cn } from '@/lib/cn';

export function ChangePasswordModal({ open, onClose }) {
  const mutation = useMutation({ mutationFn: authService.changePassword });
  const { register, handleSubmit, reset, setError, watch, formState: { errors } } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const next = watch('newPassword');

  useEffect(() => { if (open) reset(); }, [open, reset]);

  const onSubmit = ({ currentPassword, newPassword }) =>
    mutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: (r) => { toast.success(r.message); onClose(); },
        onError: (e) => { if (!applyServerErrors(e, setError)) toast.error(e.message); },
      }
    );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Change password"
      description="All other sessions will be signed out."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button form="pw-form" type="submit" variant="brand" loading={mutation.isPending}>Update password</Button>
        </>
      }
    >
      <form id="pw-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Current password" error={errors.currentPassword?.message}>
          {(p) => <Input {...p} type="password" autoComplete="current-password" {...register('currentPassword')} />}
        </Field>
        <Field label="New password" error={errors.newPassword?.message}>
          {(p) => <Input {...p} type="password" autoComplete="new-password" {...register('newPassword')} />}
        </Field>
        <ul className="grid grid-cols-2 gap-1.5 text-xs">
          {PASSWORD_RULES.map((r) => {
            const ok = r.test(next || '');
            return (
              <li key={r.label} className={cn('flex items-center gap-1.5', ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-400')}>
                {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />} {r.label}
              </li>
            );
          })}
        </ul>
        <Field label="Confirm new password" error={errors.confirmPassword?.message}>
          {(p) => <Input {...p} type="password" autoComplete="new-password" {...register('confirmPassword')} />}
        </Field>
      </form>
    </Modal>
  );
}
