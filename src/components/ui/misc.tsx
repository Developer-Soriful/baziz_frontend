"use client";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

/* ---------------- Pill Tabs ---------------- */
export function PillTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: readonly T[] | { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  const items = tabs.map((t) =>
    typeof t === "string" ? { value: t, label: t } : t
  );
  return (
    <div
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1",
        className
      )}
    >
      {items.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all",
            value === t.value
              ? "bg-primary text-white shadow-sm"
              : "text-text-muted hover:text-text"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Filter Chips ---------------- */
export function FilterChips<T extends string>({
  chips,
  value,
  onChange,
}: {
  chips: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all",
            value === c.value
              ? "border-primary bg-primary text-white"
              : "border-border-strong bg-surface text-text-muted hover:border-primary hover:text-primary"
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Search Input ---------------- */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base pl-10"
      />
    </div>
  );
}

/* ---------------- Empty State ---------------- */
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: React.ElementType;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-text-faint">
        <Icon className="h-8 w-8" />
      </div>
      <div>
        <h4 className="text-base font-bold">{title}</h4>
        {message && <p className="mt-1 max-w-sm text-sm text-text-muted">{message}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------- Skeleton ---------------- */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("shimmer rounded-lg bg-surface-2", className)} />
  );
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3 p-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
