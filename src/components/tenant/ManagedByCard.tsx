"use client";

import React from "react";
import { useOwnership } from "../../contexts/OwnershipContext";
import { Building2, Mail } from "lucide-react";
import { Card } from "../ui/primitives";

interface ManagedByCardProps {
  propertyId?: string;
  landlordName?: string;
}

export function ManagedByCard({ propertyId, landlordName }: ManagedByCardProps) {
  const { propertyToEntity } = useOwnership();
  
  if (!propertyId) return null;

  const entity = propertyToEntity.get(propertyId);

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: entity?.color || "#00574b" }}
        >
          <Building2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs text-text-muted">Managed by</p>
          <p className="font-bold text-text">
            {entity ? entity.name : landlordName || "Your Landlord"}
          </p>
        </div>
      </div>
      
      {entity?.contactEmail && (
        <div className="flex items-center gap-2 text-sm text-text-muted mt-1">
          <Mail className="h-4 w-4" />
          <a href={`mailto:${entity.contactEmail}`} className="hover:underline">
            {entity.contactEmail}
          </a>
        </div>
      )}
    </Card>
  );
}
