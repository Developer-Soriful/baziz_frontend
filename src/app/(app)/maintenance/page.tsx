"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { PillTabs, SearchInput, EmptyState } from "@/components/ui/misc";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import {
  maintenanceCategories,
  maintenancePriorities,
  maintTone,
  priorityTone,
} from "@/lib/data";
import { gbp } from "@/lib/utils";
import {
  Plus,
  Wrench,
  AlertTriangle,
  Eye,
  CheckCircle2,
  PlayCircle,
  XCircle,
  Clock,
  MessageSquare,
  Building2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  maintenanceService,
  MaintenanceRequest,
} from "@/lib/services/maintenance.service";
import { propertyService } from "@/lib/services/property.service";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  Plumbing: "plumbing",
  Electrical: "electrical",
  Heating: "heating_cooling",
  Structural: "structural",
  Appliance: "appliances",
  "Pest Control": "pest_control",
  Security: "security",
  Cleaning: "cleaning",
  Other: "other",
};

const PRIORITY_MAP: Record<string, string> = {
  Low: "low",
  Normal: "medium",
  High: "high",
  Urgent: "high",
  Emergency: "emergency",
};

// Status transitions landlord can perform
const NEXT_STATUS: Record<
  string,
  { label: string; value: string; icon: any; tone: string }[]
> = {
  open: [
    {
      label: "Start Work",
      value: "in_progress",
      icon: PlayCircle,
      tone: "text-blue-400",
    },
    { label: "Close", value: "closed", icon: XCircle, tone: "text-text-muted" },
  ],
  in_progress: [
    {
      label: "Mark Resolved",
      value: "resolved",
      icon: CheckCircle2,
      tone: "text-success",
    },
    { label: "Reopen", value: "open", icon: Clock, tone: "text-warning" },
  ],
  resolved: [
    {
      label: "Close Ticket",
      value: "closed",
      icon: XCircle,
      tone: "text-text-muted",
    },
    { label: "Reopen", value: "open", icon: Clock, tone: "text-warning" },
  ],
  closed: [],
};

function statusLabel(s: string) {
  const map: Record<string, string> = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
    Pending: "Pending",
    "In Progress": "In Progress",
    Resolved: "Resolved",
    cancelled: "Cancelled",
  };
  return map[s] || s.replace(/_/g, " ");
}

// ─── Component ────────────────────────────────────────────────────────────────

const emptyForm = {
  title: "",
  property: "",
  unit: "",
  description: "",
  category: "Other",
  priority: "Normal",
  cost: 0,
};

export default function MaintenancePage() {
  const toast = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const isTenant = user?.role === "tenant";

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: list = [], isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: maintenanceService.getAll,
  });

  const { data: landlordProperties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: propertyService.getAll,
    enabled: !isTenant,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: maintenanceService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      toast(isTenant ? "Request submitted!" : "Work order created", "success");
      setCreateModal(false);
      setForm(emptyForm);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        "Failed to submit";
      toast(msg, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      maintenanceService.updateStatus(id, status),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      // Also refresh the detail view
      setDetailItem((prev: any) =>
        prev ? { ...prev, status: vars.status } : prev,
      );
      toast("Status updated", "success");
    },
    onError: () => toast("Failed to update status", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: maintenanceService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      setDetailItem(null);
      toast("Ticket cancelled", "success");
    },
  });

  // ── Local state ───────────────────────────────────────────────────────────
  const [tab, setTab] = useState<"Scheduled" | "Active" | "History">(
    "Scheduled",
  );
  const [q, setQ] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [detailItem, setDetailItem] = useState<any | null>(null);
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  // Derive units from selected property (must be after form state)
  const selectedProperty = (landlordProperties as any[]).find(
    (p: any) => (p._id || p.id) === form.property,
  );
  const availableUnits: any[] = selectedProperty?.units || [];

  // ── Filtering ─────────────────────────────────────────────────────────────
  const inBucket = (t: any) =>
    tab === "Scheduled"
      ? t.status === "open" || t.status === "Pending"
      : tab === "Active"
        ? t.status === "in_progress" || t.status === "In Progress"
        : t.status === "resolved" ||
          t.status === "closed" ||
          t.status === "Resolved" ||
          t.status === "cancelled";

  const filtered = (list as any[]).filter(
    (t) =>
      inBucket(t) && (!q || t.title.toLowerCase().includes(q.toLowerCase())),
  );

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleCreate = () => {
    if (!form.title.trim()) return toast("Enter a title", "error");
    if (!form.description.trim()) return toast("Enter a description", "error");

    const payload: any = {
      title: form.title,
      description: form.description,
      category: CATEGORY_MAP[form.category] || "other",
      priority: PRIORITY_MAP[form.priority] || "medium",
    };

    if (!isTenant) {
      if (!form.property) return toast("Select a property", "error");
      payload.propertyId = form.property;
      payload.cost = form.cost || 0;
      if (form.unit) payload.unitId = form.unit;
    }

    createMutation.mutate(payload);
  };

  const handleStatusChange = (id: string, status: string) => {
    updateMutation.mutate({ id, status });
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-in">
      {/* ── Header ── */}
      <PageTitle
        title="Maintenance"
        subtitle={
          isTenant
            ? "Report and track your issues"
            : "Manage maintenance & work orders"
        }
        action={
          <Button
            onClick={() => {
              setForm(emptyForm);
              setCreateModal(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {isTenant ? "Report Issue" : "New Work Order"}
          </Button>
        }
      />

      {/* ── Emergency banner (tenant only) ── */}
      {isTenant && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-danger/8 p-4">
          <AlertTriangle className="h-5 w-5 text-danger" />
          <div>
            <p className="text-sm font-bold text-danger">Emergency Contact</p>
            <p className="text-xs text-text-muted">
              24/7 Emergency Line: (555) 123-4567
            </p>
          </div>
        </div>
      )}

      {/* ── Tabs + Search ── */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <PillTabs
          value={tab}
          onChange={setTab}
          tabs={["Scheduled", "Active", "History"]}
        />
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search tickets..."
          className="sm:ml-auto sm:max-w-xs"
        />
      </div>

      {/* ── Ticket list ── */}
      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-text-muted">
            Loading tickets…
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wrench}
            title="Nothing here"
            message="No matching tickets."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((t: any) => {
            const id = t._id || t.id;
            const isResolved = [
              "resolved",
              "closed",
              "Resolved",
              "cancelled",
            ].includes(t.status);
            const nextActions = !isTenant ? NEXT_STATUS[t.status] || [] : [];

            return (
              <Card key={id} className="p-5">
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold">{t.title}</h3>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {t.category?.replace(/_/g, " ")} ·{" "}
                      {new Date(
                        t.createdAt || t.date || Date.now(),
                      ).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={priorityTone(t.priority)}>
                      {t.priority?.replace(/_/g, " ")}
                    </Badge>
                    <Badge tone={maintTone(t.status)}>
                      {statusLabel(t.status)}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-2 text-sm text-text-muted line-clamp-2">
                  {t.description || "No description provided"}
                </p>

                {/* Footer row */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <div className="flex items-center gap-3 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {t.propertyId?.propertyName ||
                        t.propertyId?.name ||
                        t.property?.propertyName ||
                        t.property?.name ||
                        "Property"}
                    </span>
                    {t.cost > 0 && (
                      <span className="font-semibold text-text">
                        {gbp(t.cost)}
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {/* View details */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDetailItem(t)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>

                    {/* Status pipeline buttons (landlord only) */}
                    {nextActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={action.value}
                          size="sm"
                          variant="outline"
                          className={action.tone}
                          loading={updateMutation.isPending}
                          onClick={() => handleStatusChange(id, action.value)}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {action.label}
                        </Button>
                      );
                    })}

                    {/* Cancel / tenant cancel */}
                    {!isResolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="!border-danger !text-danger"
                        onClick={() => setCancelTarget(t)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          CREATE / WORK ORDER MODAL
      ══════════════════════════════════════════════ */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title={isTenant ? "Report an Issue" : "Create Work Order"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={createMutation.isPending}>
              Submit
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={
                isTenant ? "Leaky kitchen sink" : "Annual boiler service"
              }
            />
          </Field>

          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder={
                isTenant
                  ? "Describe the issue in detail"
                  : "Describe the work required"
              }
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {maintenanceCategories.map((c, i) => (
                  <option key={`cat-${i}`} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Priority">
              <Select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {maintenancePriorities.map((p, i) => (
                  <option key={`pri-${i}`} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {/* Landlord-only fields */}
          {!isTenant && (
            <>
              <Field label="Property">
                <Select
                  value={form.property}
                  onChange={(e) =>
                    setForm({ ...form, property: e.target.value, unit: "" })
                  }
                >
                  <option value="">Select a property</option>
                  {(landlordProperties as any[]).map((p: any, i) => (
                    <option key={p._id || p.id || i} value={p._id || p.id}>
                      {p.propertyName || p.name}
                    </option>
                  ))}
                </Select>
              </Field>

              {availableUnits.length > 0 && (
                <Field
                  label="Unit (optional)"
                  hint="Select a unit to also notify the tenant in that unit"
                >
                  <Select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  >
                    <option value="">All units / General</option>
                    {availableUnits.map((u: any, i) => (
                      <option key={u._id || i} value={u._id}>
                        Unit {u.unitNumber}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              <Field label="Estimated Cost (£)">
                <Input
                  type="number"
                  value={form.cost || ""}
                  onChange={(e) => setForm({ ...form, cost: +e.target.value })}
                  placeholder="0.00"
                />
              </Field>
            </>
          )}
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════
          DETAIL VIEW MODAL
      ══════════════════════════════════════════════ */}
      {detailItem && (
        <Modal
          open={!!detailItem}
          onClose={() => setDetailItem(null)}
          title="Ticket Details"
          footer={
            <Button variant="secondary" onClick={() => setDetailItem(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              <Badge tone={maintTone(detailItem.status)}>
                {statusLabel(detailItem.status)}
              </Badge>
              <Badge tone={priorityTone(detailItem.priority)}>
                {detailItem.priority?.replace(/_/g, " ")}
              </Badge>
              {detailItem.category && (
                <Badge tone="neutral">
                  {detailItem.category?.replace(/_/g, " ")}
                </Badge>
              )}
            </div>

            {/* Title + description */}
            <div>
              <h3 className="text-lg font-bold">{detailItem.title}</h3>
              <p className="mt-1 text-sm text-text-muted">
                {detailItem.description}
              </p>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-surface-2 p-4 text-sm">
              <div>
                <p className="text-xs text-text-faint">Property</p>
                <p className="font-medium">
                  {detailItem.propertyId?.propertyName ||
                    detailItem.propertyId?.name ||
                    detailItem.property?.propertyName ||
                    detailItem.property?.name ||
                    "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-faint">Submitted</p>
                <p className="font-medium">
                  {new Date(
                    detailItem.createdAt || detailItem.date || Date.now(),
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              {detailItem.cost > 0 && (
                <div>
                  <p className="text-xs text-text-faint">Est. Cost</p>
                  <p className="font-medium">{gbp(detailItem.cost)}</p>
                </div>
              )}
            </div>

            {/* Status pipeline actions (landlord only) */}
            {!isTenant && NEXT_STATUS[detailItem.status]?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">
                  Update Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {NEXT_STATUS[detailItem.status].map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.value}
                        size="sm"
                        variant="outline"
                        className={action.tone}
                        loading={updateMutation.isPending}
                        onClick={() => {
                          handleStatusChange(
                            detailItem._id || detailItem.id,
                            action.value,
                          );
                        }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {action.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tenant: read-only status info */}
            {isTenant && (
              <div className="flex items-center gap-2 rounded-lg bg-surface-2 p-3 text-sm">
                <MessageSquare className="h-4 w-4 text-text-muted" />
                <span className="text-text-muted">
                  {detailItem.status === "open" &&
                    "Your request has been received and is awaiting action."}
                  {detailItem.status === "in_progress" &&
                    "Work is currently in progress on this request."}
                  {detailItem.status === "resolved" &&
                    "This issue has been resolved. Please confirm if satisfied."}
                  {detailItem.status === "closed" &&
                    "This ticket has been closed."}
                </span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════════════
          CANCEL CONFIRM DIALOG
      ══════════════════════════════════════════════ */}
      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (cancelTarget) {
            const id = cancelTarget._id || cancelTarget.id;
            if (isTenant) {
              deleteMutation.mutate(id);
            } else {
              updateMutation.mutate({ id, status: "closed" });
            }
            setCancelTarget(null);
          }
        }}
        title="Cancel Maintenance?"
        message="This request will be marked as cancelled."
        confirmLabel="Yes, cancel"
        danger
        loading={deleteMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
