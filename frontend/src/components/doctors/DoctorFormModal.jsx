'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Select } from '@/components/ui';
import { useDoctorMeta, useSaveDoctor } from '@/hooks/useDoctors';
import { SPECIALIZATIONS } from '@/lib/constants';
import { doctorSchema } from '@/lib/schemas';
import { applyServerErrors } from '@/lib/forms';

const EMPTY = { name: '', specialization: '', hospital: '', phone: '', email: '' };

export function DoctorFormModal({ open, onClose, doctor }) {
  const isEdit = !!doctor?._id;
  const save = useSaveDoctor();
  const { data: meta } = useDoctorMeta();

  const { register, handleSubmit, reset, setError, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) reset(doctor ? { ...EMPTY, ...doctor } : EMPTY);
  }, [open, doctor, reset]);

  const onSubmit = (values) =>
    save.mutate(
      { id: doctor?._id, ...values },
      {
        onSuccess: onClose,
        onError: (e) => { if (!applyServerErrors(e, setError)) toast.error(e.message); },
      }
    );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit doctor' : 'Add a doctor'}
      description={isEdit ? 'Update this doctor’s profile.' : 'Create a new doctor profile. All fields are required.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button form="doctor-form" type="submit" variant="brand" loading={save.isPending} disabled={isEdit && !isDirty}>
            {isEdit ? 'Save changes' : 'Add doctor'}
          </Button>
        </>
      }
    >
      <form id="doctor-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <Field label="Full name" error={errors.name?.message} className="sm:col-span-2">
          {(p) => <Input {...p} placeholder="Dr. Ayesha Rahman" {...register('name')} />}
        </Field>
        <Field label="Specialization" error={errors.specialization?.message}>
          {(p) => (
            <Select {...p} {...register('specialization')}>
              <option value="" disabled>Select…</option>
              {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Hospital" error={errors.hospital?.message}>
          {(p) => (
            <>
              <Input {...p} list="hospital-options" placeholder="Square Hospital" {...register('hospital')} />
              <datalist id="hospital-options">{meta?.hospitals?.map((h) => <option key={h} value={h} />)}</datalist>
            </>
          )}
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          {(p) => <Input {...p} type="tel" placeholder="+8801XXXXXXXXX" {...register('phone')} />}
        </Field>
        <Field label="Email" error={errors.email?.message}>
          {(p) => <Input {...p} type="email" placeholder="doctor@hospital.com" {...register('email')} />}
        </Field>
      </form>
    </Modal>
  );
}
