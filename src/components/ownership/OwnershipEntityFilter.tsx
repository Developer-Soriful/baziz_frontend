"use client";

import { useOwnership } from "../../contexts/OwnershipContext";

interface OwnershipEntityFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function OwnershipEntityFilter({
  value,
  onChange,
  className = "",
}: OwnershipEntityFilterProps) {
  const { entities } = useOwnership();

  if (entities.length === 0) return null;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary ${className}`}
    >
      <option value="all">All Entities</option>
      {entities.map((e) => (
        <option key={e.id || e._id} value={e.id || (e._id as string)}>
          {e.name}
        </option>
      ))}
    </select>
  );
}
