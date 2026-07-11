"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { complaints as seed, complaintTone, type Complaint } from "@/lib/data";
import { Plus, MessageSquareWarning, User, MapPin, Calendar } from "lucide-react";

const categories = ["Property Condition", "Noise", "Neighbour Dispute", "Billing", "Communication", "Other"];
const urgTone = { High: "danger", Medium: "warning", Low: "success" } as const;

export default function ComplaintsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const isTenant = user?.role === "tenant";
  const [list, setList] = useState<Complaint[]>(() => [...seed]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ category: "Property Condition", title: "", description: "", urgency: "Medium" as Complaint["urgency"] });

  const setStatus = (id: string, status: Complaint["status"]) => { setList((l) => l.map((c) => c.id === id ? { ...c, status } : c)); toast(`Marked as ${status}`); };
  const save = () => { if (!form.title.trim()) return toast("Enter a title", "error"); setList((l) => [{ id: `c${Date.now()}`, tenant: "You", property: "Sunset Apartments, Unit 4B", ...form, status: "Open", date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) }, ...l]); toast("Complaint submitted"); setModal(false); };

  return (
    <div className="animate-in">
      <PageTitle title={isTenant ? "My Complaints" : "Tenant Complaints"} subtitle={isTenant ? "Submit and track your complaints" : "Review and resolve tenant complaints"} action={isTenant && <Button onClick={() => { setForm({ category: "Property Condition", title: "", description: "", urgency: "Medium" }); setModal(true); }}><Plus className="h-4 w-4" /> New Complaint</Button>} />
      {list.length === 0 ? <Card><EmptyState icon={MessageSquareWarning} title="No complaints" message={isTenant ? "You have not submitted any complaints yet." : "Tenant complaints will appear here."} /></Card> : (
        <div className="space-y-4">
          {list.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2"><Badge tone="neutral">{c.category}</Badge><Badge tone={urgTone[c.urgency]}>{c.urgency} urgency</Badge></div>
                <div className="flex items-center gap-2"><Badge tone={complaintTone(c.status)}>{c.status}</Badge>{!isTenant && c.status !== "Resolved" && <Button size="sm" onClick={() => setStatus(c.id, c.status === "Open" ? "In Review" : "Resolved")}>{c.status === "Open" ? "Review" : "Resolve"}</Button>}</div>
              </div>
              <h3 className="mt-3 font-bold">{c.title}</h3>
              <p className="mt-1 text-sm text-text-muted">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-text-muted">
                {!isTenant && <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {c.tenant}</span>}
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {c.property}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {c.date}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="New Complaint" footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save}>Submit Complaint</Button></>}>
        <div className="space-y-4">
          <Field label="Category"><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mould in bathroom ceiling" /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue" /></Field>
          <Field label="Urgency"><Select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value as Complaint["urgency"] })}>{["Low", "Medium", "High"].map((s) => <option key={s}>{s}</option>)}</Select></Field>
        </div>
      </Modal>
    </div>
  );
}
