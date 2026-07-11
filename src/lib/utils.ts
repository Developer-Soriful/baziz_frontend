import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function gbp(value: number, opts: { decimals?: boolean } = {}) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  }).format(value);
}

export function gbpCompact(value: number) {
  if (Math.abs(value) >= 1_000_000) return `£${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (Math.abs(value) >= 1_000) return `£${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `£${value}`;
}

export function num(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
}

export function pct(value: number, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

export function colorFromString(str: string) {
  const palette = ["#008577", "#7c3aed", "#0ea5e9", "#f59e0b", "#ec4899", "#10b981", "#6366f1", "#f43f5e"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
