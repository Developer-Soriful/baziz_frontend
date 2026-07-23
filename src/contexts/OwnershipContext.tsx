"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ownershipEntityService, OwnershipEntity } from "../lib/services/ownershipEntityService";
import { useAuth } from "../lib/auth";

interface OwnershipContextValue {
  entities: OwnershipEntity[];
  selectedEntityId: string;
  setSelectedEntityId: (id: string) => void;
  selectedEntity: OwnershipEntity | null;
  propertyToEntity: Map<string, OwnershipEntity>;
  getEntityForProperty: (propertyId: string) => OwnershipEntity | undefined;
  isPropertyInScope: (propertyId: string) => boolean;
  isLoading: boolean;
}

const OwnershipContext = createContext<OwnershipContextValue | undefined>(undefined);

export function OwnershipProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ["ownership-entities"],
    queryFn: ownershipEntityService.getAll,
    enabled: isLandlord, // Only fetch for landlords
  });

  const [selectedEntityId, setEntityIdState] = useState<string>("all");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("app.ownership.selectedEntity.v1");
      if (stored) {
        setEntityIdState(stored);
      }
    }
  }, []);

  const setSelectedEntityId = (id: string) => {
    setEntityIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("app.ownership.selectedEntity.v1", id);
    }
  };

  const selectedEntity = useMemo(() => {
    if (selectedEntityId === "all") return null;
    return entities.find((e: OwnershipEntity) => (e.id || e._id) === selectedEntityId) || null;
  }, [entities, selectedEntityId]);

  const propertyToEntity = useMemo(() => {
    const map = new Map<string, OwnershipEntity>();
    entities.forEach((entity: OwnershipEntity) => {
      if (entity.properties && Array.isArray(entity.properties)) {
        entity.properties.forEach((prop: any) => {
          const propId = typeof prop === "string" ? prop : prop._id || prop.id;
          if (propId) map.set(propId, entity);
        });
      }
    });
    return map;
  }, [entities]);

  const getEntityForProperty = (propertyId: string) => {
    return propertyToEntity.get(propertyId);
  };

  const isPropertyInScope = (propertyId: string) => {
    if (selectedEntityId === "all") return true;
    const entityForProp = propertyToEntity.get(propertyId);
    if (!entityForProp) return false; // If property has no entity and we are not in "all", it's out of scope
    return (entityForProp.id || entityForProp._id) === selectedEntityId;
  };

  const value: OwnershipContextValue = {
    entities,
    selectedEntityId,
    setSelectedEntityId,
    selectedEntity,
    propertyToEntity,
    getEntityForProperty,
    isPropertyInScope,
    isLoading,
  };

  return <OwnershipContext.Provider value={value}>{children}</OwnershipContext.Provider>;
}

export function useOwnership() {
  const context = useContext(OwnershipContext);
  if (context === undefined) {
    throw new Error("useOwnership must be used within an OwnershipProvider");
  }
  return context;
}
