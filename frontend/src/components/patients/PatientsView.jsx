'use client';
import { useCallback, useMemo, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import {
  Button, Card, ConfirmDialog, DateRange, EmptyState, FilterBar, PageHeader, Pagination, SearchInput, Select, TableSkeleton,
} from '@/components/ui';
import { useDoctorOptions } from '@/hooks/useDoctors';
import { useDeletePatient, usePatients, useSavePatient } from '@/hooks/usePatients';
import { useUrlState } from '@/hooks/useUrlState';
import { CONDITIONS, CONDITION_STYLES, GENDERS } from '@/lib/constants';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';
import { PatientFormModal } from './PatientFormModal';
import { PatientsTable } from './PatientsTable';
import { PatientDrawer } from './PatientDrawer';

const DEFAULTS = { page: 1, limit: 10, search: '', condition: '', gender: '', doctor: '', from: '', to: '', sort: 'admittedAt', order: 'desc', view: '' };
const FILTER_KEYS = ['search', 'condition', 'gender', 'doctor', 'from', 'to'];

/** Quick condition chips — one-tap filtering for the most common use case. */
function ConditionChips({ value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pt-4 sm:px-5 [scrollbar-width:none]">
      {['', ...CONDITIONS].map((c) => {
        const active = value === c;
        return (
          <button
            key={c || 'all'}
            onClick={() => onChange(c)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors',
              active ? 'bg-brand-600 text-white ring-brand-600' : 'bg-card text-ink-600 ring-ink-200 hover:ring-ink-300'
            )}
          >
            {c && <span className={cn('h-1.5 w-1.5 rounded-full', CONDITION_STYLES[c].dot)} />}
            {c || 'All conditions'}
          </button>
        );
      })}
    </div>
  );
}

export function PatientsView() {
  const [state, setUrl, resetUrl] = useUrlState(DEFAULTS);
  // `view` is UI state (which record is open), not a query filter — keep it out of the list request.
  const { view, ...filters } = state;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const params = useMemo(() => filters, [JSON.stringify(filters)]);
  const { data, isLoading, isFetching, isError, error, refetch } = usePatients(params);
  const { data: doctors } = useDoctorOptions();
  const save = useSavePatient();
  const del = useDeletePatient(params);

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const onEdit = useCallback((p) => setEditing(p), []);
  const onDelete = useCallback((p) => setDeleting(p), []);
  const onOpen = useCallback((p) => setUrl({ view: p._id, page: state.page }), [setUrl, state.page]);
  const closeDrawer = useCallback(() => setUrl({ view: '', page: state.page }), [setUrl, state.page]);

  const activeCount = FILTER_KEYS.filter((k) => state[k]).length;
  const patients = data?.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Records"
        title="Patients"
        description={data ? `${formatNumber(data.pagination.total)} patient${data.pagination.total === 1 ? '' : 's'} ${activeCount ? 'match your filters' : 'on record'}` : 'All patient records.'}
        actions={<Button variant="brand" onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add patient</Button>}
      />

      <Card>
        <ConditionChips value={state.condition} onChange={(c) => setUrl({ condition: c })} />
        <FilterBar activeCount={activeCount} onReset={resetUrl}>
          <SearchInput value={state.search} onChange={(v) => setUrl({ search: v })} placeholder="Search name or phone…" className="lg:w-64" />
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <Select value={state.doctor} onChange={(e) => setUrl({ doctor: e.target.value })} aria-label="Doctor" className="sm:w-52">
              <option value="">All doctors</option>
              {doctors?.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </Select>
            <Select value={state.gender} onChange={(e) => setUrl({ gender: e.target.value })} aria-label="Gender" className="sm:w-36">
              <option value="">Any gender</option>
              {GENDERS.map((g) => <option key={g}>{g}</option>)}
            </Select>
          </div>
          <DateRange from={state.from} to={state.to} onChange={setUrl} label="Admitted" />
        </FilterBar>

        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <EmptyState icon={Users} title="Couldn’t load patients" message={error.message} action={<Button variant="secondary" onClick={() => refetch()}>Retry</Button>} />
        ) : patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={activeCount ? 'No patients match these filters' : 'No patients yet'}
            message={activeCount ? 'Try adjusting the search or filters.' : 'Patients you add will appear here.'}
            action={activeCount ? <Button variant="secondary" onClick={resetUrl}>Clear filters</Button> : null}
          />
        ) : (
          <div className={cn('transition-opacity', isFetching && 'opacity-60')}>
            <PatientsTable patients={patients} showDoctor sort={state.sort} order={state.order} onSort={setUrl} onEdit={onEdit} onDelete={onDelete} onOpen={onOpen} />
          </div>
        )}

        <Pagination pagination={data?.pagination} isFetching={isFetching} onPageChange={(page) => setUrl({ page })} onLimitChange={(limit) => setUrl({ limit })} />
      </Card>

      <PatientDrawer
        patientId={view || null}
        initial={patients.find((p) => p._id === view)}
        onClose={closeDrawer}
        onEdit={(p) => setEditing(p)}
        onDelete={(p) => setDeleting(p)}
      />
      <PatientFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        patient={editing?._id ? editing : null}
        showDoctor
        pending={save.isPending}
        onSubmit={(body, opts) => save.mutate({ id: editing?._id, ...body }, opts)}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete patient?"
        message={<>Permanently delete <b>{deleting?.name}</b>’s record? This cannot be undone.</>}
        onConfirm={() => {
          del.mutate(deleting._id);
          if (deleting._id === view) closeDrawer();
          setDeleting(null);
        }}
      />
    </>
  );
}
