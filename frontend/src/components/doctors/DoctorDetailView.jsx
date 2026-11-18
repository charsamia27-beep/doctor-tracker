'use client';
import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, CalendarDays, Mail, Pencil, Phone, Plus, Users } from 'lucide-react';
import {
  Avatar, Button, Card, ConfirmDialog, DateRange, EmptyState, FilterBar, Pagination, SearchInput, Select, Skeleton, TableSkeleton, Tag,
} from '@/components/ui';
import { useAddPatientToDoctor, useDoctor, useDoctorPatients, useRemovePatientFromDoctor } from '@/hooks/useDoctors';
import { useUrlState } from '@/hooks/useUrlState';
import { CONDITIONS } from '@/lib/constants';
import { formatDate, formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';
import { PatientFormModal } from '@/components/patients/PatientFormModal';
import { PatientsTable } from '@/components/patients/PatientsTable';
import { PatientDrawer } from '@/components/patients/PatientDrawer';
import { DoctorFormModal } from './DoctorFormModal';

const DEFAULTS = { page: 1, limit: 10, search: '', condition: '', from: '', to: '', sort: 'admittedAt', order: 'desc' };
const FILTER_KEYS = ['search', 'condition', 'from', 'to'];

function InfoItem({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[.07] text-brand-400"><Icon className="h-4 w-4" /></span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-ink-400">{label}</div>
        <div className="truncate text-sm text-white">{children}</div>
      </div>
    </div>
  );
}

function DoctorHeader({ doctor, isLoading, onEdit, onAdd }) {
  if (isLoading) return <Skeleton className="h-56 w-full rounded-2xl" />;
  return (
    <section className="relative overflow-hidden rounded-2xl bg-navy-950 p-6 text-white ring-1 ring-white/5 sm:p-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={doctor.name} className="!h-16 !w-16 !bg-brand-500 !text-lg !text-navy-950" />
          <div>
            <Tag className="!bg-white/10 !text-brand-300">{doctor.specialization}</Tag>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl">{doctor.name}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onEdit} className="!bg-white/10 !text-white !ring-white/15 hover:!bg-white/15"><Pencil className="h-4 w-4" />Edit</Button>
          <Button variant="brand" onClick={onAdd}><Plus className="h-4 w-4" />Add patient</Button>
        </div>
      </div>
      <div className="relative mt-8 grid grid-cols-1 gap-5 border-t border-white/10 pt-6 sm:grid-cols-2 xl:grid-cols-5">
        <InfoItem icon={Building2} label="Hospital">{doctor.hospital}</InfoItem>
        <InfoItem icon={Phone} label="Phone"><a href={`tel:${doctor.phone}`} className="hover:underline">{doctor.phone}</a></InfoItem>
        <InfoItem icon={Mail} label="Email"><a href={`mailto:${doctor.email}`} className="hover:underline">{doctor.email}</a></InfoItem>
        <InfoItem icon={CalendarDays} label="Joined">{formatDate(doctor.createdAt)}</InfoItem>
        <InfoItem icon={Users} label="Patients"><span className="font-semibold tabular-nums">{formatNumber(doctor.patientCount)}</span></InfoItem>
      </div>
    </section>
  );
}

export function DoctorDetailView({ id }) {
  const { data: doctor, isLoading: doctorLoading, isError: doctorError, error } = useDoctor(id);
  const [state, setUrl, resetUrl] = useUrlState(DEFAULTS);
  const params = useMemo(() => ({ ...state }), [state]);
  const { data, isLoading, isFetching } = useDoctorPatients(id, params);
  const add = useAddPatientToDoctor(id);
  const remove = useRemovePatientFromDoctor(id, params);

  const [adding, setAdding] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(false);
  const [removing, setRemoving] = useState(null);
  const onDelete = useCallback((p) => setRemoving(p), []);
  const [openId, setOpenId] = useState(null);
  const onOpen = useCallback((p) => setOpenId(p._id), []);

  const activeCount = FILTER_KEYS.filter((k) => state[k]).length;
  const patients = data?.data ?? [];

  if (doctorError) {
    return (
      <EmptyState
        icon={Users}
        title={error.status === 404 ? 'Doctor not found' : 'Couldn’t load doctor'}
        message={error.message}
        action={<Link href="/doctors"><Button variant="secondary"><ArrowLeft className="h-4 w-4" />Back to doctors</Button></Link>}
      />
    );
  }

  return (
    <>
      <Link href="/doctors" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> All doctors
      </Link>

      <DoctorHeader doctor={doctor} isLoading={doctorLoading} onEdit={() => setEditingDoctor(true)} onAdd={() => setAdding(true)} />

      <Card className="mt-6">
        <div className="flex items-center justify-between px-4 pt-5 sm:px-5">
          <h2 className="font-semibold text-ink-900">Patients under care</h2>
          {data && <span className="text-sm text-ink-500">{formatNumber(data.pagination.total)} total</span>}
        </div>
        <FilterBar activeCount={activeCount} onReset={resetUrl}>
          <SearchInput value={state.search} onChange={(v) => setUrl({ search: v })} placeholder="Search this doctor’s patients…" className="lg:w-72" />
          <Select value={state.condition} onChange={(e) => setUrl({ condition: e.target.value })} aria-label="Condition" className="sm:w-48">
            <option value="">All conditions</option>
            {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <DateRange from={state.from} to={state.to} onChange={setUrl} label="Admitted" />
        </FilterBar>

        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={activeCount ? 'No matching patients' : 'No patients assigned yet'}
            message={activeCount ? 'Try clearing the filters.' : `Add the first patient under ${doctor?.name ?? 'this doctor'}.`}
            action={activeCount ? <Button variant="secondary" onClick={resetUrl}>Clear filters</Button> : <Button variant="brand" onClick={() => setAdding(true)}><Plus className="h-4 w-4" />Add patient</Button>}
          />
        ) : (
          <div className={cn('transition-opacity', isFetching && 'opacity-60')}>
            <PatientsTable patients={patients} sort={state.sort} order={state.order} onSort={setUrl} onDelete={onDelete} onOpen={onOpen} />
          </div>
        )}
        <Pagination pagination={data?.pagination} isFetching={isFetching} onPageChange={(page) => setUrl({ page })} onLimitChange={(limit) => setUrl({ limit })} />
      </Card>

      <PatientFormModal
        open={adding}
        onClose={() => setAdding(false)}
        pending={add.isPending}
        onSubmit={(body, opts) => add.mutate(body, opts)}
      />
      <PatientDrawer
        patientId={openId}
        initial={patients.find((p) => p._id === openId)}
        onClose={() => setOpenId(null)}
        onDelete={(p) => { setOpenId(null); setRemoving(p); }}
      />
      <DoctorFormModal open={editingDoctor} doctor={doctor} onClose={() => setEditingDoctor(false)} />
      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="Remove patient?"
        confirmLabel="Remove"
        message={<>Remove <b>{removing?.name}</b> from {doctor?.name}’s patient list? The patient record will be deleted.</>}
        onConfirm={() => { remove.mutate(removing._id); setRemoving(null); }}
      />
    </>
  );
}
