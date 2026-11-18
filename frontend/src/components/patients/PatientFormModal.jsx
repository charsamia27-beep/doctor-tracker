'use client';
import { useEffect, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Select, Textarea } from '@/components/ui';
import { useDoctorOptions } from '@/hooks/useDoctors';
import { CONDITIONS, GENDERS } from '@/lib/constants';
import { patientSchema } from '@/lib/schemas';
import { applyServerErrors } from '@/lib/forms';
import { toInputDate } from '@/lib/format';

const today = () => new Date().toISOString().slice(0, 10);
const empty = () => ({ name: '', age: '', gender: '', phone: '', email: '', condition: 'Stable', diagnosis: '', admittedAt: today(), doctor: '' });

/**
 * Used in two places:
 *  - Patients page: create/edit, with a doctor picker (`showDoctor`)
 *  - Doctor detail page: add under a fixed doctor (`onSubmit` supplied by parent)
 */
export function PatientFormModal({ open, onClose, patient, showDoctor = false, onSubmit, pending }) {
  const isEdit = !!patient?._id;
  const { data: doctors, isLoading: doctorsLoading } = useDoctorOptions(open && showDoctor);

  const schema = useMemo(
    () => (showDoctor ? patientSchema.extend({ doctor: z.string().min(1, 'Choose a doctor') }) : patientSchema),
    [showDoctor]
  );
  const { register, handleSubmit, reset, setError, setValue, getValues, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: empty(),
  });

  // Options arrive async: re-apply the selected doctor once they exist in the DOM.
  useEffect(() => {
    if (doctors) setValue('doctor', getValues('doctor'));
  }, [doctors, setValue, getValues]);

  useEffect(() => {
    if (!open) return;
    reset(
      patient
        ? { ...empty(), ...patient, email: patient.email || '', diagnosis: patient.diagnosis || '', admittedAt: toInputDate(patient.admittedAt), doctor: patient.doctor?._id || patient.doctor || '' }
        : empty()
    );
  }, [open, patient, reset]);

  const submit = (values) => {
    const body = { ...values, email: values.email || undefined, diagnosis: values.diagnosis || undefined };
    if (!showDoctor) delete body.doctor;
    onSubmit(body, {
      onSuccess: onClose,
      onError: (e) => { if (!applyServerErrors(e, setError)) toast.error(e.message); },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit patient' : 'Add a patient'}
      description={isEdit ? 'Update the patient record.' : 'Register a new patient record.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button form="patient-form" type="submit" variant="brand" loading={pending} disabled={isEdit && !isDirty}>
            {isEdit ? 'Save changes' : 'Add patient'}
          </Button>
        </>
      }
    >
      <form id="patient-form" onSubmit={handleSubmit(submit)} className="grid grid-cols-1 gap-4 sm:grid-cols-6" noValidate>
        <Field label="Full name" error={errors.name?.message} className="sm:col-span-4">
          {(p) => <Input {...p} placeholder="Rahim Uddin" {...register('name')} />}
        </Field>
        <Field label="Age" error={errors.age?.message} className="sm:col-span-2">
          {(p) => <Input {...p} type="number" inputMode="numeric" min={0} max={130} {...register('age')} />}
        </Field>
        <Field label="Gender" error={errors.gender?.message} className="sm:col-span-2">
          {(p) => (
            <Select {...p} {...register('gender')}>
              <option value="" disabled>Select…</option>
              {GENDERS.map((g) => <option key={g}>{g}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Phone" error={errors.phone?.message} className="sm:col-span-2">
          {(p) => <Input {...p} type="tel" placeholder="+8801XXXXXXXXX" {...register('phone')} />}
        </Field>
        <Field label="Email (optional)" error={errors.email?.message} className="sm:col-span-2">
          {(p) => <Input {...p} type="email" {...register('email')} />}
        </Field>
        <Field label="Condition" error={errors.condition?.message} className="sm:col-span-3">
          {(p) => (
            <Select {...p} {...register('condition')}>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Admission date" error={errors.admittedAt?.message} className="sm:col-span-3">
          {(p) => <Input {...p} type="date" max={today()} {...register('admittedAt')} />}
        </Field>
        {showDoctor && (
          <Field label="Assigned doctor" error={errors.doctor?.message} className="sm:col-span-6">
            {(p) => (
              <Select {...p} disabled={doctorsLoading} {...register('doctor')}>
                <option value="" disabled>{doctorsLoading ? 'Loading doctors…' : 'Select a doctor…'}</option>
                {doctors?.map((d) => <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>)}
              </Select>
            )}
          </Field>
        )}
        <Field label="Diagnosis / notes" error={errors.diagnosis?.message} className="sm:col-span-6">
          {(p) => <Textarea {...p} placeholder="e.g. Hypertension, follow-up in 2 weeks" {...register('diagnosis')} />}
        </Field>
      </form>
    </Modal>
  );
}
