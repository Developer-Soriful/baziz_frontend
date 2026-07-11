"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { PillTabs, SearchInput, EmptyState } from "@/components/ui/misc";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { maintenanceCategories, maintenancePriorities, maintTone, priorityTone, properties, type MaintenanceTicket } from "@/lib/data";
import { gbp } from "@/lib/utils";
import { Plus, Wrench, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { maintenanceService, MaintenanceRequest } from "@/lib/services/maintenance.service";

const empty: Omit<MaintenanceRequest, "id" | "_id"> = { title: "", property: "", status: "Pending", date: "", priority: "Normal" };

export default function MaintenancePage() {
  const toast = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const isTenant = user?.role === "tenant";

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: maintenanceService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: maintenanceService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      toast(isTenant ? "Request submitted successfully!" : "Maintenance created", "success");
      setModal(false);
    },
    onError: () => toast("Failed to submit request", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MaintenanceRequest> }) => maintenanceService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      toast("Ticket updated", "success");
    },
  });

  const [tab, setTab] = useState<"Scheduled" | "Active" | "History">("Scheduled");
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  
  // Using 'any' for form temporarily to map UI fields to backend model
  const [form, setForm] = useState<any>({ ...empty, description: "", category: "Other", cost: 0 });
  const [cancel, setCancel] = useState<any | null>(null);

  const bucket = (t: any) => tab === "Scheduled" ? t.status === "Pending" : tab === "Active" ? t.status === "In Progress" : t.status === "Resolved" || t.status === "cancelled";
  const filtered = list.filter((t: any) => bucket(t) && (!q || t.title.toLowerCase().includes(q.toLowerCase())));

  const save = () => {
    if (!form.title.trim()) return toast("Enter a title", "error");
    createMutation.mutate({
      title: form.title,
      property: form.property || "General",
      priority: form.priority,
      status: "Pending",
      date: new Date().toISOString()
    });
  };

  return (
    <div className="animate-in">
      <PageTitle title="Maintenance" subtitle={isTenant ? "Report and track issues" : "Manage all maintenance activities"} action={<Button onClick={() => { setForm({ ...empty, description: "", category: "Other", cost: 0 }); setModal(true); }}><Plus className="h-4 w-4" /> {isTenant ? "Report Issue" : "New Ticket"}</Button>} />
      {isTenant && <div className="mb-4 flex items-center gap-3 rounded-xl bg-danger/8 p-4"><AlertTriangle className="h-5 w-5 text-danger" /><div><p className="text-sm font-bold text-danger">Emergency Contact</p><p className="text-xs text-text-muted">24/7 Emergency Line: (555) 123-4567</p></div></div>}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <PillTabs value={tab} onChange={setTab} tabs={["Scheduled", "Active", "History"]} />
        <SearchInput value={q} onChange={setQ} placeholder="Search tickets..." className="sm:ml-auto sm:max-w-xs" />
      </div>
      {isLoading ? (
        <Card><div className="p-8 text-center text-text-muted">Loading tickets...</div></Card>
      ) : filtered.length === 0 ? <Card><EmptyState icon={Wrench} title="Nothing here" message="No matching tickets." /></Card> : (
        <div className="space-y-4">
          {filtered.map((t: any) => (
            <Card key={t.id || t._id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold">{t.title}</h3>
                <div className="flex gap-2"><Badge tone={priorityTone(t.priority)}>{t.priority}</Badge><Badge tone={maintTone(t.status)}>{t.status}</Badge></div>
              </div>
              <p className="mt-1 text-sm text-text-muted">{t.description || "No description provided"}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm">
                <span className="text-text-muted">{t.property} · {new Date(t.date || Date.now()).toLocaleDateString("en-GB")}</span>
                <div className="flex items-center gap-3"><span className="font-bold">{gbp(t.cost || 0)}</span>{t.status !== "Resolved" && t.status !== "cancelled" && <Button size="sm" variant="outline" className="!border-danger !text-danger" onClick={() => setCancel(t)}>Cancel</Button>}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title={isTenant ? "Report an Issue" : "New Maintenance Ticket"} footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save} loading={createMutation.isPending}>Submit</Button></>}>
        <div className="space-y-4">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Leaky kitchen sink" /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category"><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{maintenanceCategories.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Priority"><Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{maintenancePriorities.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          </div>
          {!isTenant && <div className="grid grid-cols-2 gap-4"><Field label="Property"><Select value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })}><option value="">Select</option>{properties.map((p) => <option key={p.id}>{p.name}</option>)}</Select></Field><Field label="Est. Cost (£)"><Input type="number" value={form.cost || ""} onChange={(e) => setForm({ ...form, cost: +e.target.value })} placeholder="0" /></Field></div>}
        </div>
      </Modal>
      <ConfirmDialog open={!!cancel} onClose={() => setCancel(null)} onConfirm={() => { if (cancel) { updateMutation.mutate({ id: cancel.id || cancel._id, data: { status: "Resolved" } /* mapping cancelled to resolved for backend */ }); setCancel(null); } }} title="Cancel Maintenance?" message="This request will be marked as cancelled." confirmLabel="Yes, cancel" danger />
    </div>
  );
}
