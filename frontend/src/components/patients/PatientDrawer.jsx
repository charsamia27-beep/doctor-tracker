'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Mail, Pencil, Phone, Stethoscope, Trash2, X } from 'lucide-react';
import { Avatar, Button, ConditionBadge, Skeleton } from '@/components/ui';
import { patientService } from '@/lib/services';
import { formatDate } from '@/lib/format';

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
      <div className="min-w-0">
        <div className="text-xs text-ink-500">{label}</div>
        <div className="break-words text-sm font-medium text-ink-900">{children || '—'}</div>
      </div>
    </div>
  );
}

/** Slide-over with the full patient record. Uses list data instantly, then refreshes from the API. */
export function PatientDrawer({ patientId, initial, onClose, onEdit, onDelete }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const { data: patient, isLoading, isError } = useQuery({
    queryKey: ['patients', 'detail', patientId],
    queryFn: () => patientService.get(patientId),
    select: (r) => r.data,
    enabled: !!patientId,
    initialData: initial ? { data: initial } : undefined,
    initialDataUpdatedAt: 0, // treat list data as stale → refetch in background
  });

  useEffect(() => {
    if (!patientId) return;
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => document.removeEventListener('keydown', onKey);
  }, [patientId]);

  if (!patientId || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-fade-in bg-navy-950/40" onClick={onClose} />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Patient details"
        className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in-right flex-col bg-card shadow-pop outline-none"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <span className="text-sm font-semibold text-ink-500">Patient record</span>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading && !patient ? (
            <div className="space-y-4"><Skeleton className="h-14 w-14 rounded-full" /><Skeleton className="h-6 w-2/3" /><Skeleton className="h-40 w-full" /></div>
          ) : isError || !patient ? (
            <p className="text-sm text-ink-500">This patient record could not be found. It may have been deleted.</p>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Avatar name={patient.name} className="!h-14 !w-14 !text-base" />
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold text-ink-900">{patient.name}</h2>
                  <p className="text-sm text-ink-500">{patient.age} years · {patient.gender}</p>
                </div>
              </div>
              <div className="mt-4"><ConditionBadge condition={patient.condition} /></div>

              <div className="mt-6 rounded-xl bg-ink-50 p-4 ring-1 ring-ink-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">Diagnosis / notes</div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink-800">{patient.diagnosis || 'No notes recorded.'}</p>
              </div>

              <div className="mt-4 divide-y divide-ink-100">
                <Row icon={Stethoscope} label="Assigned doctor">
                  {patient.doctor ? (
                    <Link href={`/doctors/${patient.doctor._id}`} className="hover:text-brand-600 hover:underline" onClick={onClose}>
                      {patient.doctor.name} <span className="font-normal text-ink-500">· {patient.doctor.specialization}</span>
                    </Link>
                  ) : null}
                </Row>
                <Row icon={CalendarDays} label="Admitted">{formatDate(patient.admittedAt)}</Row>
                <Row icon={Phone} label="Phone"><a href={`tel:${patient.phone}`} className="hover:underline">{patient.phone}</a></Row>
                <Row icon={Mail} label="Email">{patient.email && <a href={`mailto:${patient.email}`} className="hover:underline">{patient.email}</a>}</Row>
              </div>
            </>
          )}
        </div>

        {patient && (
          <div className="flex gap-2 border-t border-ink-100 px-6 py-4">
            {onEdit && <Button variant="secondary" className="flex-1" onClick={() => onEdit(patient)}><Pencil className="h-4 w-4" />Edit</Button>}
            {onDelete && <Button variant="danger" className="flex-1" onClick={() => onDelete(patient)}><Trash2 className="h-4 w-4" />Delete</Button>}
          </div>
        )}
      </aside>
    </div>,
    document.body
  );
}
