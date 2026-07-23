"use client";

import React from "react";
import { useOwnership } from "../../contexts/OwnershipContext";

interface OwnershipBadgeProps {
  entityId?: string;
  className?: string;
}

export function OwnershipBadge({ entityId, className = "" }: OwnershipBadgeProps) {
  const { entities } = useOwnership();
  
  if (!entityId) return null;

  const entity = entities.find(e => (e.id || e._id) === entityId);
  if (!entity) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-bg-alt px-2 py-0.5 text-xs font-medium text-text-muted ${className}`}>
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: entity.color || "#00574b" }}
      />
      {entity.name}
    </span>
  );
}
