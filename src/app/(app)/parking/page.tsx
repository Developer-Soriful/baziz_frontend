"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Select, Input } from "@/components/ui/form";
import { Car, KeyRound, Building2, User2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantService } from "@/lib/services/tenant.service";
import { propertyService } from "@/lib/services/property.service";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="font-bold text-text">{value}</span>
    </div>
  );
}

const emptyAddForm = {
  propertyId: "",
  unitId: "",
  bayNumber: "",
  level: "Ground Floor",
  notes: "",
};

export default function ParkingPage() {
  const { user } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const isTenant = user?.role === "tenant";

  // ── Local State ──────────────────────────────────────────────────────────
  const [assignTarget, setAssignTarget] = useState<any | null>(null);
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState(emptyAddForm);

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

  const { data: tenantLeases = [] } = useQuery({
    queryKey: ["all-leases-parking"],
    queryFn: tenantService.getAll,
    enabled: !isTenant,
  });

  // Filter units belonging to the selected property in the add form
  const selectedPropertyInAdd = (properties as any[]).find(
    (p: any) => (p._id || p.id) === addForm.propertyId
  );
  const availableUnitsForAdd = selectedPropertyInAdd?.units || [];

  // ── Mutations ─────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: ({
      propertyId,
      unitId,
      payload,
    }: {
      propertyId: string;
      unitId: string;
      payload: { action: "add"; parkingBays: Array<{ bayNumber: string; level?: string; notes?: string }> };
    }) => tenantService.updateParkingBays(propertyId, unitId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties-parking"] });
      toast("Parking space added successfully", "success");
      setAddModal(false);
      setAddForm(emptyAddForm);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to add parking space";
      toast(msg, "error");
    },
  });

  const allocateMutation = useMutation({
    mutationFn: ({
      propertyId,
      unitId,
      bayNumber,
      leaseId,
    }: {
      propertyId: string;
      unitId: string;
      bayNumber: string;
      leaseId: string;
    }) => tenantService.allocateParkingBay(propertyId, unitId, bayNumber, leaseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties-parking"] });
      toast("Parking spot assigned successfully", "success");
      setAssignTarget(null);
      setSelectedLeaseId("");
    },
    onError: () => toast("Failed to assign parking spot", "error"),
  });

  const releaseMutation = useMutation({
    mutationFn: ({
      propertyId,
      unitId,
      bayNumber,
    }: {
      propertyId: string;
      unitId: string;
      bayNumber: string;
    }) => tenantService.releaseParkingBay(propertyId, unitId, bayNumber),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties-parking"] });
      toast("Parking spot released successfully", "success");
    },
    onError: () => toast("Failed to release parking spot", "error"),
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
          propertyId: prop._id || prop.id,
          unitId: unit._id || unit.id,
          propertyName: prop.propertyName || prop.name,
          unitNumber: unit.unitNumber,
        });
      });
    });
  });

  const totalBays = portfolioBays.length;
  const occupiedBays = portfolioBays.filter((b) => b.assignedToTenant).length;
  const vacantBays = totalBays - occupiedBays;

  const handleAddSubmit = () => {
    if (!addForm.propertyId) return toast("Select a property", "error");
    if (!addForm.unitId) return toast("Select a unit", "error");
    if (!addForm.bayNumber.trim()) return toast("Enter a bay number", "error");

    addMutation.mutate({
      propertyId: addForm.propertyId,
      unitId: addForm.unitId,
      payload: {
        action: "add",
        parkingBays: [
          {
            bayNumber: addForm.bayNumber.trim(),
            level: addForm.level,
            notes: addForm.notes || undefined,
          },
        ],
      },
    });
  };

  const handleAssignSubmit = () => {
    if (!assignTarget || !selectedLeaseId) return;
    allocateMutation.mutate({
      propertyId: assignTarget.propertyId,
      unitId: assignTarget.unitId,
      bayNumber: assignTarget.bayNumber,
      leaseId: selectedLeaseId,
    });
  };

  return (
    <div className="animate-in space-y-6">
      {/* ── Page Header ── */}
      <PageTitle
        title="Parking Portfolio"
        subtitle="Manage and allocate parking spaces across your properties"
        action={
          <Button onClick={() => setAddModal(true)}>
            <Plus className="h-4 w-4" /> Add Parking Space
          </Button>
        }
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
            message="No parking bays have been set up under any of your property units yet. Click 'Add Parking Space' to create one."
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
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 text-xs font-semibold text-text-muted">
                        <User2 className="h-3.5 w-3.5" /> Assigned
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="!border-danger !text-danger"
                        loading={releaseMutation.isPending}
                        onClick={() =>
                          releaseMutation.mutate({
                            propertyId: bay.propertyId,
                            unitId: bay.unitId,
                            bayNumber: bay.bayNumber,
                          })
                        }
                      >
                        Release Spot
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-xs font-semibold text-emerald-600">
                        Available
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="!border-primary !text-primary"
                        onClick={() => setAssignTarget(bay)}
                      >
                        Assign Tenant
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ══════════════════════════════════════════════
          ADD PARKING BAY MODAL (LANDLORD)
      ══════════════════════════════════════════════ */}
      {addModal && (
        <Modal
          open={addModal}
          onClose={() => setAddModal(false)}
          title="Add Parking Space"
          footer={
            <>
              <Button variant="secondary" onClick={() => setAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSubmit} loading={addMutation.isPending}>
                Create Space
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Property">
              <Select
                value={addForm.propertyId}
                onChange={(e) => setAddForm({ ...addForm, propertyId: e.target.value, unitId: "" })}
              >
                <option value="">Select a property...</option>
                {(properties as any[]).map((p: any) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.propertyName || p.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Unit">
              <Select
                value={addForm.unitId}
                onChange={(e) => setAddForm({ ...addForm, unitId: e.target.value })}
                disabled={!addForm.propertyId}
              >
                <option value="">Select a unit...</option>
                {availableUnitsForAdd.map((u: any) => (
                  <option key={u._id || u.id} value={u._id || u.id}>
                    Unit {u.unitNumber}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Bay Number">
                <Input
                  value={addForm.bayNumber}
                  onChange={(e) => setAddForm({ ...addForm, bayNumber: e.target.value })}
                  placeholder="e.g. P101"
                />
              </Field>
              <Field label="Floor Level">
                <Input
                  value={addForm.level}
                  onChange={(e) => setAddForm({ ...addForm, level: e.target.value })}
                  placeholder="e.g. Underground / Ground"
                />
              </Field>
            </div>

            <Field label="Notes (optional)">
              <Input
                value={addForm.notes}
                onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                placeholder="e.g. Reserved for compact cars"
              />
            </Field>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════════════
          ASSIGN PARKING BAY MODAL (LANDLORD)
      ══════════════════════════════════════════════ */}
      {assignTarget && (
        <Modal
          open={!!assignTarget}
          onClose={() => setAssignTarget(null)}
          title={`Assign Bay ${assignTarget.bayNumber}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setAssignTarget(null)}>
                Cancel
              </Button>
              <Button onClick={handleAssignSubmit} loading={allocateMutation.isPending}>
                Save Assignment
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-text-muted">
              Select an active tenant lease in **{assignTarget.propertyName} (Unit {assignTarget.unitNumber})** to allocate this parking space.
            </p>
            <Field label="Active Tenant Leases">
              <Select
                value={selectedLeaseId}
                onChange={(e) => setSelectedLeaseId(e.target.value)}
              >
                <option value="">Select a lease...</option>
                {tenantLeases
                  .filter((lease: any) => {
                    const leasePropId = String(lease.propertyId?._id || lease.propertyId);
                    const targetPropId = String(assignTarget.propertyId);
                    return leasePropId === targetPropId && lease.status === "active";
                  })
                  .map((lease: any) => (
                    <option key={lease.id || lease._id} value={lease.id || lease._id}>
                      {lease.tenantFullName || lease.tenantEmail} ({lease.tenantEmail})
                    </option>
                  ))}
              </Select>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}
