'use client';
import { useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card, EmptyState, PageHeader, Pagination, Select, TableSkeleton } from '@/components/ui';
import { ACTION_META } from '@/components/dashboard/ActivityFeed';
import { useAuditLogs } from '@/hooks/useAudit';
import { useUrlState } from '@/hooks/useUrlState';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/cn';

const DEFAULTS = { page: 1, limit: 20, entity: '', action: '' };

export function ActivityView() {
  const [state, setUrl] = useUrlState(DEFAULTS);
  const params = useMemo(() => ({ ...state }), [state]);
  const { data, isLoading, isFetching } = useAuditLogs(params);
  const logs = data?.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Activity log"
        description="An append-only audit trail of every sign-in and data change. Entries are kept for 180 days."
      />
      <Card>
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 sm:flex-row sm:p-5">
          <Select value={state.entity} onChange={(e) => setUrl({ entity: e.target.value })} aria-label="Record type" className="sm:w-44">
            <option value="">All records</option>
            <option value="doctor">Doctors</option>
            <option value="patient">Patients</option>
            <option value="auth">Authentication</option>
          </Select>
          <Select value={state.action} onChange={(e) => setUrl({ action: e.target.value })} aria-label="Action" className="sm:w-52">
            <option value="">All actions</option>
            {Object.entries(ACTION_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : logs.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No activity found" message="Try a different filter." />
        ) : (
          <ul className={cn('divide-y divide-ink-100 transition-opacity', isFetching && 'opacity-60')}>
            {logs.map((log) => {
              const meta = ACTION_META[log.action] || ACTION_META.update;
              const Icon = meta.icon;
              return (
                <li key={log._id} className="flex items-start gap-4 px-4 py-4 sm:px-6">
                  <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full', meta.cls)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-medium text-ink-900">{log.summary || meta.label}</span>
                      <span className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[11px] font-medium capitalize text-ink-600">{log.entity}</span>
                    </div>
                    <div className="mt-1 text-xs text-ink-500">
                      {log.actorEmail ?? 'system'}
                      {log.changedFields?.length > 0 && <> · changed <span className="font-medium text-ink-700">{log.changedFields.join(', ')}</span></>}
                    </div>
                  </div>
                  <time className="shrink-0 text-xs text-ink-500" dateTime={log.createdAt} title={new Date(log.createdAt).toLocaleString()}>
                    {timeAgo(log.createdAt)}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination pagination={data?.pagination} isFetching={isFetching} onPageChange={(page) => setUrl({ page })} />
      </Card>
    </>
  );
}
