'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Activity, AlertTriangle, ArrowUpRight, Stethoscope, Users } from 'lucide-react';
import { PageHeader, Skeleton } from '@/components/ui';
import { useStats } from '@/hooks/useStats';
import { useAuditLogs } from '@/hooks/useAudit';
import { useMe } from '@/hooks/useAuth';
import { useUrlState } from '@/hooks/useUrlState';
import { CONDITION_STYLES } from '@/lib/constants';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';
import { StatCard } from './StatCard';
import { ChartCard } from './ChartCard';
import { ActivityFeed } from './ActivityFeed';

// Recharts is ~100 kB; load it client-side only, after the shell has painted.
const chartLoading = () => <Skeleton className="h-full w-full rounded-xl" />;
const TimelineChart = dynamic(() => import('./Charts').then((m) => m.TimelineChart), { ssr: false, loading: chartLoading });
const DoctorsBarChart = dynamic(() => import('./Charts').then((m) => m.DoctorsBarChart), { ssr: false, loading: chartLoading });
const ConditionDonut = dynamic(() => import('./Charts').then((m) => m.ConditionDonut), { ssr: false, loading: chartLoading });
const SpecializationChart = dynamic(() => import('./Charts').then((m) => m.SpecializationChart), { ssr: false, loading: chartLoading });
const AgeChart = dynamic(() => import('./Charts').then((m) => m.AgeChart), { ssr: false, loading: chartLoading });

const RANGES = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '12m', label: '12M' },
];
const RANGE_TEXT = { '7d': 'last 7 days', '30d': 'last 30 days', '90d': 'last 90 days', '12m': 'last 12 months' };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function RangeTabs({ value, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-card p-1 shadow-card ring-1 ring-ink-200/70" role="tablist" aria-label="Date range">
      {RANGES.map((r) => (
        <button
          key={r.value}
          role="tab"
          aria-selected={value === r.value}
          onClick={() => onChange(r.value)}
          className={cn('rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors',
            value === r.value ? 'bg-brand-600 text-white shadow-sm' : 'text-ink-500 hover:text-ink-900')}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

export function DashboardView() {
  const [{ range }, setUrl] = useUrlState({ range: '30d' });
  const { data, isLoading, isFetching } = useStats(range);
  const { data: activity, isLoading: activityLoading } = useAuditLogs({ page: 1, limit: 6 });
  const { data: me } = useMe();
  const t = data?.totals;
  const [allDoctors, setAllDoctors] = useState(false);
  const perDoctor = data ? (allDoctors ? data.patientsPerDoctor : data.patientsPerDoctor.slice(0, 8)) : [];

  return (
    <>
      <PageHeader
        eyebrow={`${greeting()}${me?.name ? `, ${me.name.split(' ')[0]}` : ''}`}
        title="Dashboard"
        description={`Clinical activity for the ${RANGE_TEXT[range]}.`}
        actions={<RangeTabs value={range} onChange={(v) => setUrl({ range: v })} />}
      />

      <div className={cn('grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-4', isFetching && !isLoading && 'opacity-70')}>
        <StatCard tone="navy" label="Total doctors" icon={Stethoscope} loading={isLoading} value={formatNumber(t?.doctors)} hint={`${t?.avgPatientsPerDoctor ?? 0} patients per doctor on average`} />
        <StatCard tone="teal" label="Total patients" icon={Users} loading={isLoading} value={formatNumber(t?.patients)} hint="Across all doctors" />
        <StatCard tone="sky" label="New admissions" icon={Activity} loading={isLoading} value={formatNumber(t?.newPatients)} trend={t?.newPatientsGrowth} hint="vs. previous period" />
        <StatCard tone="rose" label="Critical patients" icon={AlertTriangle} loading={isLoading} value={formatNumber(t?.critical)} hint={t?.patients ? `${((t.critical / t.patients) * 100).toFixed(1)}% of all patients` : ' '} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Admissions over time"
          subtitle={`Grouped by ${data?.unit ?? 'day'} · ${RANGE_TEXT[range]}`}
          loading={isLoading}
          action={
            <div className="flex gap-3 text-xs text-ink-500">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-500" />Admissions</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" />Critical</span>
            </div>
          }
        >
          {data && <TimelineChart data={data.timeline} unit={data.unit} />}
        </ChartCard>

        <ChartCard title="Patient condition" subtitle="All-time distribution" loading={isLoading} bodyClass="h-auto min-h-72">
          {data && (
            <div className="flex flex-col items-center gap-5 sm:flex-row xl:flex-col">
              <div className="h-44 w-44 shrink-0"><ConditionDonut data={data.byCondition} total={t.patients} /></div>
              <ul className="w-full space-y-2.5">
                {data.byCondition.map((c) => (
                  <li key={c.name} className="flex items-center gap-2.5 text-sm">
                    <span className={cn('h-2.5 w-2.5 rounded-full', CONDITION_STYLES[c.name].dot)} />
                    <Link href={`/patients?condition=${encodeURIComponent(c.name)}`} className="text-ink-600 hover:text-ink-900 hover:underline">{c.name}</Link>
                    <span className="ml-auto font-semibold tabular-nums text-ink-900">{formatNumber(c.value)}</span>
                    <span className="w-10 text-right text-xs tabular-nums text-ink-400">{t.patients ? Math.round((c.value / t.patients) * 100) : 0}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard
          title="Patients per doctor"
          subtitle={allDoctors ? `All ${perDoctor.length} doctors by caseload` : 'Top 8 by caseload'}
          loading={isLoading}
          bodyClass="h-80 overflow-y-auto pr-1"
          action={
            <button
              onClick={() => setAllDoctors((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              {allDoctors ? 'Show top 8' : 'Show all'} <ArrowUpRight className="h-3 w-3" />
            </button>
          }
        >
          {data && (
            <div style={{ height: Math.max(300, perDoctor.length * 34) }}>
              <DoctorsBarChart data={perDoctor} />
            </div>
          )}
        </ChartCard>
        <ChartCard title="By specialization" subtitle="Doctors and their patients" loading={isLoading} bodyClass="h-80">
          {data && <SpecializationChart data={data.bySpecialization} />}
        </ChartCard>
        <ChartCard
          title="Recent activity"
          subtitle="Latest changes across the portal"
          bodyClass="h-80 overflow-y-auto pr-1"
          className="lg:col-span-2 xl:col-span-1"
          action={<Link href="/activity" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">View log <ArrowUpRight className="h-3 w-3" /></Link>}
        >
          <ActivityFeed logs={activity?.data} loading={activityLoading} />
        </ChartCard>
      </div>

      <div className="mt-4">
        <ChartCard title="Age distribution" subtitle={data?.byGender?.map((g) => `${g.name} ${formatNumber(g.value)}`).join(' · ')} loading={isLoading} bodyClass="h-64">
          {data && <AgeChart data={data.byAge} />}
        </ChartCard>
      </div>
    </>
  );
}
