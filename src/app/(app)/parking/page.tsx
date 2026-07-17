"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { EmptyState, PillTabs } from "@/components/ui/misc";
import { Car, KeyRound, Building2, User2, ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { tenantService } from "@/lib/services/tenant.service";
import { propertyService } from "@/lib/services/property.service";
import { useAuth } from "@/lib/auth";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="font-bold text-text">{value}</span>
    </div>
  );
}

export default function ParkingPage() {
  const { user } = useAuth();
  const isTenant = user?.role === "tenant";

  // ── Tenant Query ─────────────────────────────────────────────────────────
  const { data: myLease, isLoading: isTenantLoading } = useQuery({
    queryKey: ["tenant-lease"],
    queryFn: tenantService.getMyLease,
    enabled: isTenant,
  });

  // ── Landlord Query ────────────────────────────────────────────────────────
  const { data: properties = [], isLoading: isLandlordLoading } = useQuery({
    queryKey: ["properties-parking"],
    queryFn: propertyService.getAll,
    enabled: !isTenant,
  });

  const isLoading = isTenant ? isTenantLoading : isLandlordLoading;

  if (isLoading) {
    return (
      <div className="animate-in mx-auto max-w-2xl text-center text-text-muted mt-20">
        Loading parking details...
      </div>
    );
  }

  // ── Render Tenant View ───────────────────────────────────────────────────
  if (isTenant) {
    const bays = myLease?.unit?.parkingBays || [];
    const gateCode = myLease?.property?.metadata?.gateCode || "CONTACT OFFICE";

    return (
      <div className="animate-in max-w-3xl mx-auto space-y-6">
        <PageTitle
          title="Parking"
          subtitle="Your personal parking spot and garage access codes"
        />

        {bays.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={Car}
              title="No Parking Assigned"
              message="You do not have any parking bays assigned to your lease agreement."
            />
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {bays.map((bay: any, idx: number) => (
                <Card key={bay._id || idx} className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-lg">
                    <Car className="h-5 w-5 text-primary" /> Spot #{bay.bayNumber}
                  </h3>
                  <Row label="Bay Status" value={bay.assignedToTenant ? "Assigned & Active" : "Vacant"} />
                  <Row label="Level" value={bay.level || "Ground Floor"} />
                  <Row label="Notes / Terms" value={bay.notes || "Standard parking usage"} />
                </Card>
              ))}
            </div>

            {/* Garage/Gate Access Card */}
            <Card className="p-6 flex flex-col justify-between border-primary/20 bg-primary/5">
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-bold text-lg text-primary">
                  <KeyRound className="h-5 w-5" /> Garage Entrance
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Please use the gate access code below at the keypad to enter the garage. Keep this code secure.
                </p>
              </div>
              <div className="my-6 text-center">
                <p className="text-4xl font-black tracking-[0.25em] text-primary">
                  {gateCode}
                </p>
              </div>
              <p className="text-xs text-text-faint text-center">
                If the code is not working, please contact the landlord support immediately.
              </p>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // ── Render Landlord View ─────────────────────────────────────────────────
  // Flatten all parking bays from landlord properties
  const portfolioBays: any[] = [];
  properties.forEach((prop: any) => {
    prop.units?.forEach((unit: any) => {
      unit.parkingBays?.forEach((bay: any) => {
        portfolioBays.push({
          ...bay,
          propertyName: prop.propertyName || prop.name,
          unitNumber: unit.unitNumber,
        });
      });
    });
  });

  const totalBays = portfolioBays.length;
  const occupiedBays = portfolioBays.filter((b) => b.assignedToTenant).length;
  const vacantBays = totalBays - occupiedBays;

  return (
    <div className="animate-in space-y-6">
      <PageTitle
        title="Parking Portfolio"
        subtitle="Manage and allocate parking spaces across your properties"
      />

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-surface-2">
          <p className="text-xs text-text-muted font-medium">Total Parking Bays</p>
          <p className="text-2xl font-extrabold mt-1">{totalBays}</p>
        </Card>
        <Card className="p-4 border-emerald-500/20 bg-emerald-500/5">
          <p className="text-xs text-emerald-600 font-medium">Vacant Spaces</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{vacantBays}</p>
        </Card>
        <Card className="p-4 border-primary/20 bg-primary/5">
          <p className="text-xs text-primary font-medium">Assigned Bays</p>
          <p className="text-2xl font-extrabold text-primary mt-1">{occupiedBays}</p>
        </Card>
      </div>

      {totalBays === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={Car}
            title="No Parking Spaces Configured"
            message="No parking bays have been set up under any of your property units yet. You can add them during unit creation."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-border bg-surface-2 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" /> Active Bays Allocation
            </h3>
            <span className="text-xs text-text-muted font-medium">
              Showing {portfolioBays.length} spaces
            </span>
          </div>

          <div className="divide-y divide-border">
            {portfolioBays.map((bay: any, idx: number) => (
              <div
                key={bay._id || idx}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-2/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-lg text-text">
                      Bay {bay.bayNumber}
                    </span>
                    <Badge tone={bay.assignedToTenant ? "primary" : "success"}>
                      {bay.assignedToTenant ? "Assigned" : "Vacant"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {bay.propertyName} (Unit {bay.unitNumber})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  {bay.notes && (
                    <span className="text-text-muted italic max-w-xs truncate">
                      "{bay.notes}"
                    </span>
                  )}
                  {bay.assignedToTenant ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 text-xs font-semibold text-text-muted">
                      <User2 className="h-3.5 w-3.5" /> Assigned to tenant
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-xs font-semibold text-emerald-600">
                      Available for Lease
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
