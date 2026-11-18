'use client';
import { memo } from 'react';
import Link from 'next/link';
import { Pencil, Phone, Trash2 } from 'lucide-react';
import { Avatar, Button, ConditionBadge, SortHeader, Th } from '@/components/ui';
import { formatDate } from '@/lib/format';

function Actions({ patient, onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-1">
      {onEdit && (
        <Button variant="ghost" size="icon" onClick={() => onEdit(patient)} aria-label={`Edit ${patient.name}`}>
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={() => onDelete(patient)} aria-label={`Delete ${patient.name}`} className="hover:!bg-rose-50 hover:!text-rose-600 dark:hover:!bg-rose-500/10">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

const Row = memo(function Row({ patient, showDoctor, onEdit, onDelete, onOpen }) {
  return (
    <tr className="transition-colors hover:bg-ink-50/60">
      <td className="px-4 py-3.5">
        <button type="button" onClick={() => onOpen?.(patient)} disabled={!onOpen} className="group flex items-center gap-3 text-left">
          <Avatar name={patient.name} />
          <div className="min-w-0">
            <div className="truncate font-semibold text-ink-900 group-enabled:group-hover:text-brand-600">{patient.name}</div>
            <div className="truncate text-xs text-ink-500">{patient.diagnosis || '—'}</div>
          </div>
        </button>
      </td>
      <td className="px-4 py-3.5 text-sm text-ink-600">{patient.age} · {patient.gender[0]}</td>
      <td className="px-4 py-3.5"><ConditionBadge condition={patient.condition} /></td>
      {showDoctor && (
        <td className="px-4 py-3.5 text-sm">
          {patient.doctor ? (
            <Link href={`/doctors/${patient.doctor._id}`} className="font-medium text-ink-800 hover:text-brand-700 hover:underline">
              {patient.doctor.name}
            </Link>
          ) : '—'}
          <div className="text-xs text-ink-400">{patient.doctor?.specialization}</div>
        </td>
      )}
      <td className="px-4 py-3.5 text-sm tabular-nums text-ink-600">{patient.phone}</td>
      <td className="px-4 py-3.5 text-sm text-ink-500">{formatDate(patient.admittedAt)}</td>
      <td className="px-2 py-3.5"><Actions patient={patient} onEdit={onEdit} onDelete={onDelete} /></td>
    </tr>
  );
});

const MobileCard = memo(function MobileCard({ patient, showDoctor, onEdit, onDelete, onOpen }) {
  return (
    <li className="flex items-start gap-3 p-4">
      <Avatar name={patient.name} />
      <div className="min-w-0 flex-1" onClick={() => onOpen?.(patient)} role={onOpen ? 'button' : undefined} tabIndex={onOpen ? 0 : undefined} onKeyDown={(e) => e.key === 'Enter' && onOpen?.(patient)}>
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-ink-900">{patient.name}</span>
          <span className="shrink-0 text-xs text-ink-400">{patient.age} · {patient.gender[0]}</span>
        </div>
        <div className="mt-1.5"><ConditionBadge condition={patient.condition} /></div>
        <div className="mt-2 space-y-0.5 text-xs text-ink-500">
          {showDoctor && patient.doctor && <div>with <span className="font-medium text-ink-700">{patient.doctor.name}</span></div>}
          <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{patient.phone} · {formatDate(patient.admittedAt)}</div>
        </div>
      </div>
      <Actions patient={patient} onEdit={onEdit} onDelete={onDelete} />
    </li>
  );
});

export function PatientsTable({ patients, showDoctor = false, sort, order, onSort, onEdit, onDelete, onOpen }) {
  const sortProps = { sort, order, onSort };
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[820px]">
          <thead className="border-b border-ink-100 bg-ink-50/50">
            <tr>
              <SortHeader label="Patient" field="name" {...sortProps} />
              <SortHeader label="Age" field="age" {...sortProps} />
              <Th>Condition</Th>
              {showDoctor && <Th>Doctor</Th>}
              <Th>Phone</Th>
              <SortHeader label="Admitted" field="admittedAt" {...sortProps} />
              <th className="w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {patients.map((p) => <Row key={p._id} patient={p} showDoctor={showDoctor} onEdit={onEdit} onDelete={onDelete} onOpen={onOpen} />)}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-ink-100 md:hidden">
        {patients.map((p) => <MobileCard key={p._id} patient={p} showDoctor={showDoctor} onEdit={onEdit} onDelete={onDelete} onOpen={onOpen} />)}
      </ul>
    </>
  );
}

