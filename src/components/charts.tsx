"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const axisStyle = { fontSize: 11, fill: "var(--color-text-faint)" };
const gridStroke = "var(--color-border)";

function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2 text-xs shadow-float">
      {label && <p className="mb-1 font-bold">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="capitalize text-text-muted">{p.name}:</span>
          <span className="font-bold text-text">
            {formatter ? formatter(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function RevenueChart({
  data,
}: {
  data: { month: string; revenue: number; expenses: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#008577" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#008577" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="4 4" />
        <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v / 1000}k`} />
        <Tooltip content={<ChartTooltip formatter={(v: number) => `£${v.toLocaleString()}`} />} />
        <Area type="monotone" dataKey="revenue" stroke="#008577" strokeWidth={2.5} fill="url(#rev)" />
        <Area type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2.5} fill="url(#exp)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OccupancyChart({ data }: { data: { month: string; rate: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="4 4" />
        <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis domain={[70, 100]} tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
        <Tooltip content={<ChartTooltip formatter={(v: number) => `${v}%`} />} />
        <Line type="monotone" dataKey="rate" name="occupancy" stroke="#007aff" strokeWidth={2.5} dot={{ r: 3, fill: "#007aff" }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MixPie({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} stroke="none">
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SimpleBar({
  data,
  color = "#008577",
  formatter,
}: {
  data: { name: string; value: number; color?: string }[];
  color?: string;
  formatter?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="4 4" />
        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={formatter} />
        <Tooltip content={<ChartTooltip formatter={formatter} />} cursor={{ fill: "var(--color-surface-2)" }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color || color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutPie({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={82} stroke="none">
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip formatter={(v: number) => `£${v.toLocaleString()}`} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
