"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { forwardRef } from "react";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      {label && (
        <span className="mb-1.5 block text-[13px] font-semibold text-text-muted">
          {label}
        </span>
      )}
      {children}
      {hint && <span className="mt-1 block text-xs text-text-faint">{hint}</span>}
    </label>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }
>(function Input({ className, icon, ...props }, ref) {
  if (icon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint">
          {icon}
        </span>
        <input ref={ref} className={cn("input-base pl-10", className)} {...props} />
      </div>
    );
  }
  return <input ref={ref} className={cn("input-base", className)} {...props} />;
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn("input-base resize-none", className)}
      {...props}
    />
  );
});

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn("input-base cursor-pointer appearance-none pr-9", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
    </div>
  );
}
