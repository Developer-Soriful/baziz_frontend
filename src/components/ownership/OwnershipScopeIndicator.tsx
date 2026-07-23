"use client";

import React, { useState } from "react";
import { useOwnership } from "../../contexts/OwnershipContext";
import { useAuth } from "../../lib/auth";
import { ChevronUp, Building2, Layers } from "lucide-react";
import { usePathname } from "next/navigation";
import { Modal } from "../ui/modal";

export function OwnershipScopeIndicator() {
  const { user } = useAuth();
  const { entities, selectedEntity, selectedEntityId, setSelectedEntityId } = useOwnership();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hidden on tenant routes, login, etc.
  if (
    user?.role !== "landlord" ||
    pathname?.startsWith("/tenant-") ||
    pathname === "/login" ||
    pathname === "/"
  ) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-lg shadow-black/10 ring-1 ring-border transition-all hover:bg-bg-alt active:scale-95"
        >
          {selectedEntity ? (
            <>
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: selectedEntity.color || "#00574b" }}
              />
              <span className="truncate max-w-[150px]">{selectedEntity.name}</span>
            </>
          ) : (
            <>
              <Layers className="h-4 w-4 text-primary" />
              <span>All Entities</span>
            </>
          )}
          <ChevronUp className="h-4 w-4 text-text-muted" />
        </button>
      </div>

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Select Scope">
        <div className="flex flex-col gap-2 p-4">
          <button
            onClick={() => {
              setSelectedEntityId("all");
              setIsOpen(false);
            }}
            className={`flex items-center justify-between rounded-xl p-3 text-left transition-colors ${
              selectedEntityId === "all" ? "bg-primary/10 ring-1 ring-primary" : "bg-bg-alt hover:bg-bg-alt/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <Layers className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-text">All Entities</p>
                <p className="text-xs text-text-muted">View all properties</p>
              </div>
            </div>
          </button>

          {entities.map((entity) => {
            const isSelected = selectedEntityId === (entity.id || entity._id);
            return (
              <button
                key={entity.id || entity._id}
                onClick={() => {
                  setSelectedEntityId(entity.id || entity._id as string);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between rounded-xl p-3 text-left transition-colors ${
                  isSelected ? "bg-primary/10 ring-1 ring-primary" : "bg-bg-alt hover:bg-bg-alt/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${entity.color || "#00574b"}20`, color: entity.color || "#00574b" }}
                  >
                    <Building2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-text">{entity.name}</p>
                    <p className="text-xs text-text-muted">
                      {entity.properties?.length || 0} properties
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
