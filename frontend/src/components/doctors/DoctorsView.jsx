'use client';
import { memo, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { Mail, Pencil, Phone, Plus, Stethoscope, Trash2 } from 'lucide-react';
import {
  Avatar, Button, Card, ConfirmDialog, DateRange, EmptyState, FilterBar, PageHeader, Pagination,
  SearchInput, Select, SortHeader, TableSkeleton, Tag, Th,
} from '@/components/ui';
import { useDeleteDoctor, useDoctorMeta, useDoctors } from '@/hooks/useDoctors';
import { useUrlState } from '@/hooks/useUrlState';
import { SPECIALIZATIONS } from '@/lib/constants';
import { formatDate, formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';
import { DoctorFormModal } from './DoctorFormModal';

const DEFAULTS = { page: 1, limit: 10, search: '', specialization: '', hospital: '', from: '', to: '', sort: 'createdAt', order: 'desc' };
const FILTER_KEYS = ['search', 'specialization', 'hospital', 'from', 'to'];

function RowActions({ doctor, onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={() => onEdit(doctor)} aria-label={`Edit ${doctor.name}`} title="Edit">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete(doctor)} aria-label={`Delete ${doctor.name}`} title="Delete" className="hover:!bg-rose-50 hover:!text-rose-600 dark:hover:!bg-rose-500/10">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// memo: rows only re-render when their own doctor object changes.
const DoctorRow = memo(function DoctorRow({ doctor, onEdit, onDelete }) {
  return (
    <tr className="group transition-colors hover:bg-ink-50/60">
      <td className="px-4 py-3.5">
        <Link href={`/doctors/${doctor._id}`} className="flex items-center gap-3">
          <Avatar name={doctor.name} />
          <div className="min-w-0">
            <div className="truncate font-semibold text-ink-900 group-hover:text-brand-700">{doctor.name}</div>
            <div className="truncate text-xs text-ink-500">{doctor.email}</div>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3.5"><Tag>{doctor.specialization}</Tag></td>
      <td className="px-4 py-3.5 text-sm text-ink-700">{doctor.hospital}</td>
      <td className="px-4 py-3.5 text-sm tabular-nums text-ink-600">{doctor.phone}</td>
      <td className="px-4 py-3.5">
        <Link href={`/doctors/${doctor._id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1 text-sm font-semibold tabular-nums text-brand-800 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300">
          {formatNumber(doctor.patientCount)}
        </Link>
      </td>
      <td className="px-4 py-3.5 text-sm text-ink-500">{formatDate(doctor.createdAt)}</td>
      <td className="px-2 py-3.5 text-right"><RowActions doctor={doctor} onEdit={onEdit} onDelete={onDelete} /></td>
    </tr>
  );
});

const DoctorCard = memo(function DoctorCard({ doctor, onEdit, onDelete }) {
  return (
    <li className="flex items-start gap-3 p-4">
      <Avatar name={doctor.name} />
      <Link href={`/doctors/${doctor._id}`} className="min-w-0 flex-1">
        <div className="truncate font-semibold text-ink-900">{doctor.name}</div>
        <div className="mt-0.5 truncate text-xs text-ink-500">{doctor.hospital}</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Tag>{doctor.specialization}</Tag>
          <span className="text-xs font-semibold text-brand-700">{formatNumber(doctor.patientCount)} patients</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{doctor.phone}</span>
          <span className="inline-flex items-center gap-1 truncate"><Mail className="h-3 w-3" />{doctor.email}</span>
        </div>
      </Link>
      <RowActions doctor={doctor} onEdit={onEdit} onDelete={onDelete} />
    </li>
  );
});

export function DoctorsView() {
  const [state, setUrl, resetUrl] = useUrlState(DEFAULTS);
  const params = useMemo(() => ({ ...state }), [state]);
  const { data, isLoading, isFetching, isError, error, refetch } = useDoctors(params);
  const { data: meta } = useDoctorMeta();
  const del = useDeleteDoctor();

  const [editing, setEditing] = useState(null); // null = closed, {} = new, doctor = edit
  const [deleting, setDeleting] = useState(null);

  const onEdit = useCallback((d) => setEditing(d), []);
  const onDelete = useCallback((d) => setDeleting(d), []);
  const activeCount = FILTER_KEYS.filter((k) => state[k]).length;
  const doctors = data?.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Doctors"
        description={data ? `${formatNumber(data.pagination.total)} doctor${data.pagination.total === 1 ? '' : 's'} ${activeCount ? 'match your filters' : 'registered'}` : 'Manage your clinical roster.'}
        actions={<Button variant="brand" onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add doctor</Button>}
      />

      <Card>
        <FilterBar activeCount={activeCount} onReset={resetUrl}>
          <SearchInput value={state.search} onChange={(v) => setUrl({ search: v })} placeholder="Search name, email or phone…" className="lg:w-72" />
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <Select value={state.specialization} onChange={(e) => setUrl({ specialization: e.target.value })} aria-label="Specialization" className="sm:w-44">
              <option value="">All specializations</option>
              {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
            </Select>
            <Select value={state.hospital} onChange={(e) => setUrl({ hospital: e.target.value })} aria-label="Hospital" className="sm:w-48">
              <option value="">All hospitals</option>
              {meta?.hospitals?.map((h) => <option key={h}>{h}</option>)}
            </Select>
          </div>
          <DateRange from={state.from} to={state.to} onChange={setUrl} label="Joined" />
        </FilterBar>

        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <EmptyState icon={Stethoscope} title="Couldn’t load doctors" message={error.message} action={<Button variant="secondary" onClick={() => refetch()}>Retry</Button>} />
        ) : doctors.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title={activeCount ? 'No doctors match these filters' : 'No doctors yet'}
            message={activeCount ? 'Try a different search term or clear the filters.' : 'Add your first doctor to get started.'}
            action={activeCount ? <Button variant="secondary" onClick={resetUrl}>Clear filters</Button> : <Button variant="brand" onClick={() => setEditing({})}><Plus className="h-4 w-4" />Add doctor</Button>}
          />
        ) : (
          <div className={cn('transition-opacity', isFetching && 'opacity-60')}>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px]">
                <thead className="border-b border-ink-100 bg-ink-50/50">
                  <tr>
                    <SortHeader label="Doctor" field="name" {...state} onSort={setUrl} />
                    <Th>Specialization</Th>
                    <Th>Hospital</Th>
                    <Th>Phone</Th>
                    <SortHeader label="Patients" field="patientCount" {...state} onSort={setUrl} />
                    <SortHeader label="Joined" field="createdAt" {...state} onSort={setUrl} />
                    <th className="w-24" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {doctors.map((d) => <DoctorRow key={d._id} doctor={d} onEdit={onEdit} onDelete={onDelete} />)}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <ul className="divide-y divide-ink-100 md:hidden">
              {doctors.map((d) => <DoctorCard key={d._id} doctor={d} onEdit={onEdit} onDelete={onDelete} />)}
            </ul>
          </div>
        )}

        <Pagination
          pagination={data?.pagination}
          isFetching={isFetching}
          onPageChange={(page) => setUrl({ page })}
          onLimitChange={(limit) => setUrl({ limit })}
        />
      </Card>

      <DoctorFormModal open={!!editing} doctor={editing?._id ? editing : null} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        loading={del.isPending}
        title="Delete doctor?"
        message={<>This permanently removes <b>{deleting?.name}</b> and their <b>{deleting?.patientCount ?? 0}</b> patient record(s). This cannot be undone.</>}
        onConfirm={() => del.mutate(deleting._id, { onSuccess: () => setDeleting(null) })}
      />
    </>
  );
}
