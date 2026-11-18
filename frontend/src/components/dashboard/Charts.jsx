'use client';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { CONDITION_STYLES } from '@/lib/constants';
import { formatBucket, formatNumber } from '@/lib/format';
import { useTheme } from '@/hooks/useTheme';

// SVG presentation attributes can't read CSS variables, so pick concrete colours per theme.
function usePalette() {
  const dark = useTheme().theme === 'dark';
  return {
    axis: { fontSize: 11, fill: dark ? '#8e9eb8' : '#94a0b2' },
    label: { fontSize: 11, fill: dark ? '#ccd6e4' : '#334155' },
    grid: dark ? '#18253c' : '#eef1f5',
    cursor: dark ? 'rgba(255,255,255,.04)' : '#f4f6fa',
    primary: '#14a3a0',
    strong: dark ? '#5bdad3' : '#14233d',
    secondary: dark ? '#38bdf8' : '#0ea5e9',
  };
}

function ChartTooltip({ active, payload, label, labelFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-navy-950 px-3 py-2 text-xs text-white shadow-pop">
      {label !== undefined && <div className="mb-1 font-medium text-slate-400">{labelFormatter ? labelFormatter(label) : label}</div>}
      {payload.map((p) => (
        <div key={p.dataKey ?? p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          <span className="text-slate-300">{p.name}</span>
          <span className="ml-auto pl-3 font-semibold tabular-nums">{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function TimelineChart({ data, unit }) {
  const c = usePalette();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gPatients" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.primary} stopOpacity={0.3} />
            <stop offset="100%" stopColor={c.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gCritical" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="date" tick={c.axis} tickLine={false} axisLine={false} tickFormatter={(d) => formatBucket(d, unit)} minTickGap={24} />
        <YAxis tick={c.axis} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip labelFormatter={(d) => formatBucket(d, unit)} />} cursor={{ stroke: c.axis.fill, strokeDasharray: 4 }} />
        <Area type="monotone" dataKey="patients" name="Admissions" stroke={c.primary} strokeWidth={2.25} fill="url(#gPatients)" />
        <Area type="monotone" dataKey="critical" name="Critical" stroke="#f43f5e" strokeWidth={1.75} fill="url(#gCritical)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DoctorsBarChart({ data }) {
  const c = usePalette();
  const rows = data.map((d) => ({ ...d, short: d.name.replace(/^Dr\.?\s*/, '') }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap={6}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="short" width={118} tick={c.label} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: c.cursor }} />
        <Bar dataKey="patients" name="Patients" radius={[0, 8, 8, 0]} fill={c.strong} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ConditionDonut({ data, total }) {
  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip />} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="92%" paddingAngle={2} stroke="none">
            {data.map((d) => <Cell key={d.name} fill={CONDITION_STYLES[d.name]?.color || '#94a0b2'} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl tabular-nums text-ink-900">{formatNumber(total)}</span>
        <span className="text-[11px] uppercase tracking-wider text-ink-400">patients</span>
      </div>
    </div>
  );
}

export function SpecializationChart({ data }) {
  const c = usePalette();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="name" tick={c.axis} tickLine={false} axisLine={false} interval={0} angle={-35} textAnchor="end" height={64} />
        <YAxis tick={c.axis} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: c.cursor }} />
        <Bar dataKey="patients" name="Patients" fill={c.primary} radius={[6, 6, 0, 0]} />
        <Bar dataKey="doctors" name="Doctors" fill={c.strong} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AgeChart({ data }) {
  const c = usePalette();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="name" tick={c.axis} tickLine={false} axisLine={false} />
        <YAxis tick={c.axis} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: c.cursor }} />
        <Bar dataKey="value" name="Patients" fill={c.secondary} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
