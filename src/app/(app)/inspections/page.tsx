"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { PillTabs, EmptyState } from "@/components/ui/misc";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService, Task, TaskPriority, TaskStatus } from "@/lib/services/task.service";
import { propertyService } from "@/lib/services/property.service";
import { CalendarCheck, User, MapPin, Calendar, Plus, Trash2, Edit3, CheckCircle2 } from "lucide-react";

const priorityColors = {
  low: "neutral",
  medium: "warning",
  high: "danger",
} as const;

const statusColors = {
  pending: "info",
  "in-progress": "warning",
  completed: "success",
} as const;

const emptyForm = {
  title: "",
  description: "",
  propertyId: "",
  priority: "medium" as TaskPriority,
  dueDate: "",
  status: "pending" as TaskStatus,
};

export default function InspectionsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const isTenant = user?.role === "tenant";

  // ── Local State ──────────────────────────────────────────────────────────
  const [tab, setTab] = useState<"All" | "Scheduled" | "Completed">("All");
  const [createModal, setCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [newDate, setNewDate] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: taskResponse, isLoading } = useQuery({
    queryKey: ["inspections", tab],
    queryFn: () =>
      taskService.getAll({
        category: "inspection",
        status: tab === "Scheduled" ? "pending" : tab === "Completed" ? "completed" : undefined,
      }),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["properties-inspections"],
    queryFn: propertyService.getAll,
    enabled: !isTenant,
  });

  const list = taskResponse?.tasks || [];

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: taskService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspections"] });
      toast("Inspection scheduled successfully", "success");
      setCreateModal(false);
      setForm(emptyForm);
    },
    onError: () => toast("Failed to schedule inspection", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      taskService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspections"] });
      toast("Inspection updated successfully", "success");
      setRescheduleTarget(null);
      setEditTarget(null);
      setNewDate("");
    },
    onError: () => toast("Failed to update inspection", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspections"] });
      toast("Inspection cancelled", "success");
      setDeleteTarget(null);
    },
    onError: () => toast("Failed to cancel inspection", "error"),
  });

  const completeMutation = useMutation({
    mutationFn: taskService.complete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspections"] });
      toast("Inspection marked as completed", "success");
    },
    onError: () => toast("Failed to update status", "error"),
  });

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleCreate = () => {
    if (!form.title.trim()) return toast("Enter a title", "error");
    if (!form.dueDate) return toast("Select a date", "error");
    if (!isTenant && !form.propertyId) return toast("Select a property", "error");

    createMutation.mutate({
      title: form.title,
      description: form.description,
      propertyId: form.propertyId || null,
      priority: form.priority,
      category: "inspection",
      status: "pending",
      dueDate: new Date(form.dueDate).toISOString(),
    });
  };

  const handleEdit = () => {
    if (!editTarget) return;
    if (!editForm.title.trim()) return toast("Enter a title", "error");
    if (!editForm.dueDate) return toast("Select a date", "error");

    updateMutation.mutate({
      id: editTarget.id,
      payload: {
        title: editForm.title,
        description: editForm.description,
        propertyId: editForm.propertyId || null,
        priority: editForm.priority,
        status: editForm.status,
        dueDate: new Date(editForm.dueDate).toISOString(),
      },
    });
  };

  const handleReschedule = () => {
    if (!rescheduleTarget || !newDate) return;
    updateMutation.mutate({
      id: rescheduleTarget.id,
      payload: { dueDate: new Date(newDate).toISOString() },
    });
  };

  return (
    <div className="animate-in space-y-6">
      {/* ── Page Header ── */}
      <PageTitle
        title="Inspections"
        subtitle={isTenant ? "View property inspections scheduled by your landlord" : "Schedule and manage property inspections"}
        action={
          !isTenant && (
            <Button onClick={() => setCreateModal(true)}>
              <Plus className="h-4 w-4" /> Schedule Inspection
            </Button>
          )
        }
      />

      {/* ── Filter Tabs ── */}
      <div className="mb-5">
        <PillTabs
          value={tab}
          onChange={setTab}
          tabs={["All", "Scheduled", "Completed"]}
        />
      </div>

      {/* ── List view ── */}
      {isLoading ? (
        <Card className="p-8 text-center text-text-muted">Loading inspections...</Card>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarCheck}
            title="No Inspections"
            message={isTenant ? "You do not have any inspections scheduled." : "No inspections found."}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {list.map((i: Task) => (
            <Card key={i.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <Badge tone={priorityColors[i.priority]}>{i.priority}</Badge>
                  <Badge tone={statusColors[i.status]}>{i.status}</Badge>
                </div>
                <h3 className="mt-3 font-bold text-lg">{i.title}</h3>
                {i.description && <p className="mt-1 text-sm text-text-muted">{i.description}</p>}
                
                <div className="mt-4 space-y-2 text-sm text-text-muted border-t border-border pt-3">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {i.property?.propertyName || "General Property"}
                  </p>
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Assignee: {i.assignee?.name || "Unassigned"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Date: {new Date(i.dueDate).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>

              {/* Landlord-only Actions */}
              {!isTenant && (
                <div className="mt-4 flex gap-2 border-t border-border pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setEditTarget(i);
                      setEditForm({
                        title: i.title,
                        description: i.description || "",
                        propertyId: i.property?.id || "",
                        priority: i.priority,
                        dueDate: i.dueDate ? i.dueDate.split("T")[0] : "",
                        status: i.status,
                      });
                    }}
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  {i.status !== "completed" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 !bg-emerald-500/10 !text-emerald-600 border-none"
                      onClick={() => completeMutation.mutate(i.id)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Complete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="!border-danger !text-danger"
                    onClick={() => setDeleteTarget(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          SCHEDULE INSPECTION MODAL (LANDLORD)
      ══════════════════════════════════════════════ */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Schedule Inspection"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={createMutation.isPending}>
              Schedule
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Inspection Title">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Routine Inspection Q3"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide detail instructions for tenant"
            />
          </Field>
          <Field label="Property">
            <Select
              value={form.propertyId}
              onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
            >
              <option value="">Select property</option>
              {(properties as any[]).map((p: any) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.propertyName || p.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Priority">
              <Select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </Field>
            <Field label="Inspection Date">
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════
          EDIT INSPECTION MODAL (LANDLORD)
      ══════════════════════════════════════════════ */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Inspection"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} loading={updateMutation.isPending}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Inspection Title">
            <Input
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </Field>
          <Field label="Property">
            <Select
              value={editForm.propertyId}
              onChange={(e) => setEditForm({ ...editForm, propertyId: e.target.value })}
            >
              <option value="">Select property</option>
              {(properties as any[]).map((p: any) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.propertyName || p.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Priority">
              <Select
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
            </Field>
            <Field label="Date">
              <Input
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════
          CANCEL CONFIRM DIALOG
      ══════════════════════════════════════════════ */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
        title="Cancel Inspection?"
        message="This inspection will be permanently deleted and removed from tenant records."
        confirmLabel="Yes, Cancel"
        danger
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
