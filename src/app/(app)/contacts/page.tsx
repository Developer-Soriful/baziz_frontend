"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Button } from "@/components/ui/primitives";
import { SearchInput, EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { contacts as seed, type Contact } from "@/lib/data";
import { colorFromString } from "@/lib/utils";
import { Plus, User, Phone, Mail, Contact as ContactIcon } from "lucide-react";

const professions = ["Plumber", "Electrician", "Builder", "Carpenter", "Gardener", "Cleaner", "HVAC Technician", "Roofer", "Locksmith", "Pest Control"];

export default function ContactsPage() {
  const toast = useToast();
  const [list, setList] = useState<Contact[]>(() => [...seed]);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ company: "", person: "", phone: "", email: "", badge: "Plumber", notes: "" });
  const filtered = list.filter((c) => !q || [c.company, c.person, c.badge].some((v) => v.toLowerCase().includes(q.toLowerCase())));
  const save = () => { if (!form.company.trim()) return toast("Enter a company", "error"); setList((l) => [{ id: `c${Date.now()}`, ...form, added: new Date().toLocaleDateString("en-GB") }, ...l]); toast("Contact added"); setModal(false); };

  return (
    <div className="animate-in">
      <PageTitle title="Contacts" subtitle="Manage your maintenance contacts" action={<Button onClick={() => { setForm({ company: "", person: "", phone: "", email: "", badge: "Plumber", notes: "" }); setModal(true); }}><Plus className="h-4 w-4" /> Add Contact</Button>} />
      <SearchInput value={q} onChange={setQ} placeholder="Search contacts..." className="mb-5 max-w-md" />
      {filtered.length === 0 ? <Card><EmptyState icon={ContactIcon} title="No contacts found" /></Card> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => { const color = colorFromString(c.badge); return (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between"><h3 className="font-bold">{c.company}</h3><span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: `${color}1a`, color }}>{c.badge}</span></div>
              <div className="mt-3 space-y-1.5 text-sm text-text-muted">
                <p className="flex items-center gap-2"><User className="h-4 w-4" /> {c.person}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {c.phone}</p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {c.email}</p>
              </div>
              {c.notes && <div className="mt-3 rounded-lg bg-surface-2 p-3 text-xs text-text-muted">{c.notes}</div>}
            </Card>
          ); })}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Add New Contact" footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save}>Add Contact</Button></>}>
        <div className="space-y-4">
          <Field label="Company"><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Swift Plumbing Ltd" /></Field>
          <Field label="Contact Person"><Input value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })} placeholder="John Swift" /></Field>
          <div className="grid grid-cols-2 gap-4"><Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field><Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field></div>
          <Field label="Profession"><Select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}>{professions.map((p) => <option key={p}>{p}</option>)}</Select></Field>
          <Field label="Notes"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}
