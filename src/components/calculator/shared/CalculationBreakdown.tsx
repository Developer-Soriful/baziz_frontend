import React from "react";
import { gbp } from "@/lib/utils";

export interface BreakdownRow {
  label: string;
  value: string | number;
  subValue?: string;
  isTotal?: boolean;
}

interface Props {
  title: string;
  rows: BreakdownRow[];
}

export function CalculationBreakdown({ title, rows }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="bg-surface-2 px-4 py-3 text-sm font-semibold text-text-muted">
        {title}
      </div>
      <div className="divide-y divide-border">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-4 py-3 ${
              row.isTotal ? "bg-surface-2 font-bold" : "text-sm"
            }`}
          >
            <div>
              <span className="block">{row.label}</span>
              {row.subValue && (
                <span className="text-xs text-text-muted">{row.subValue}</span>
              )}
            </div>
            <div className="text-right">
              {typeof row.value === "number" ? gbp(row.value) : row.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
