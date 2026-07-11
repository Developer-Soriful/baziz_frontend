"use client";

import { cn, initials } from "@/lib/utils";
import type { StatusTone } from "@/lib/data";
import { forwardRef } from "react";

/* ---------------- Button ---------------- */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-600 shadow-[var(--shadow-glow)] hover:shadow-lg",
  secondary: "bg-surface-2 text-text hover:bg-border border border-border",
  ghost: "text-text-muted hover:bg-surface-2 hover:text-text",
  danger: "bg-danger text-white hover:brightness-95 shadow-sm",
  outline: "border border-border-strong text-text hover:border-primary hover:text-primary bg-surface",
};
const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-[13px] gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
};

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
  }
>(function Button(
  { className, variant = "primary", size = "md", loading, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  );
});

/* ---------------- Card ---------------- */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card", className)} {...props} />;
}

/* ---------------- Status Badge ---------------- */
const toneStyles: Record<StatusTone, string> = {
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/12 text-danger",
  info: "bg-info/12 text-info",
  primary: "bg-primary/12 text-primary",
  neutral: "bg-neutral/15 text-neutral",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  dot,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        toneStyles[tone],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ---------------- Avatar ---------------- */
export function Avatar({
  name,
  color,
  size = 40,
  className,
}: {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color ?? "#008577",
        fontSize: size * 0.38,
      }}
    >
      {initials(name)}
    </span>
  );
}

/* ---------------- Toggle / Switch ---------------- */
export function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-primary" : "bg-border-strong"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

/* ---------------- Progress bar ---------------- */
export function Progress({
  value,
  className,
  color = "var(--color-primary)",
}: {
  value: number;
  className?: string;
  color?: string;
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-border", className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}
