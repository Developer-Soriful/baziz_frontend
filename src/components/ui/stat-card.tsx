"use client";

import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "#008577",
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
  trend?: { value: string; up: boolean };
}) {
  return (
    <div className="card group relative overflow-hidden p-5">
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.08] transition-transform group-hover:scale-125"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: `${accent}1a`, color: accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold",
              trend.up ? "bg-success/12 text-success" : "bg-danger/12 text-danger"
            )}
          >
            {trend.up ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-text-faint">{sub}</p>}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
