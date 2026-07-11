"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button, Toggle } from "@/components/ui/primitives";
import { PillTabs, FilterChips, EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { Plus, Bell, TrendingDown, Sparkles, Gavel, Trash2 } from "lucide-react";

interface AlertNotif { id: string; title: string; desc: string; time: string; icon: React.ElementType; tone: "success" | "info" | "warning"; }
interface AlertConfig { id: string; title: string; desc: string; active: boolean; type: string; location: string; }

export default function AlertsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<"Recent Alerts" | "My Alerts">("Recent Alerts");
  const [push, setPush] = useState(true);
  const [emailN, setEmailN] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", type: "Apartment", location: "" });
  const [notifs, setNotifs] = useState<AlertNotif[]>([
    { id: "1", title: "Price Drop: 15%", desc: "3 Bed Apartment, London E14. Now €425,000", time: "2h ago", icon: TrendingDown, tone: "success" },
    { id: "2", title: "New Listing Match", desc: "Studio Flat, Manchester M1. Matches your criteria.", time: "5h ago", icon: Sparkles, tone: "info" },
    { id: "3", title: "Auction Reminder", desc: "Commercial Unit, Birmingham. Ending in 4 hours.", time: "1d ago", icon: Gavel, tone: "warning" },
  ]);
  const [configs, setConfigs] = useState<AlertConfig[]>([
    { id: "c1", title: "London Investment", desc: "Apartment, London. Max: €500k", active: true, type: "Apartment", location: "London" },
    { id: "c2", title: "Manchester Studio", desc: "Studio, Manchester. Max: €200k", active: true, type: "Studio", location: "Manchester" },
    { id: "c3", title: "Birmingham Commercial", desc: "Commercial, Birmingham.", active: false, type: "Commercial", location: "Birmingham" },
  ]);
  const filteredConfigs = configs.filter((c) => filter === "all" || (filter === "active" ? c.active : !c.active));

  const create = () => { if (!form.title.trim()) return toast("Enter an alert name", "error"); setConfigs((l) => [{ id: `c${Date.now()}`, title: form.title, desc: `${form.type}, ${form.location}`, active: true, type: form.type, location: form.location }, ...l]); toast("Alert created"); setModal(false); };

  return (
    <div className="animate-in">
      <PageTitle title="Property Alerts" subtitle="Get notified about properties matching your criteria" action={<Button onClick={() => { setForm({ title: "", type: "Apartment", location: "" }); setModal(true); }}><Plus className="h-4 w-4" /> New Alert</Button>} />
      <div className="mb-5"><PillTabs value={tab} onChange={setTab} tabs={["Recent Alerts", "My Alerts"]} /></div>

      {tab === "Recent Alerts" && (<>
        <Card className="mb-4 p-5">
          <h3 className="mb-2 font-bold">Alert Preferences</h3>
          <div className="flex items-center justify-between py-2"><span className="text-sm font-semibold">Push Notifications</span><Toggle checked={push} onChange={setPush} /></div>
          <div className="flex items-center justify-between py-2"><span className="text-sm font-semibold">Email Notifications</span><Toggle checked={emailN} onChange={setEmailN} /></div>
        </Card>
        {notifs.length === 0 ? <Card><EmptyState icon={Bell} title="All Clear" message="No recent property alerts." /></Card> : (
          <div className="space-y-3">
            {notifs.map((a) => (
              <Card key={a.id} className="flex items-center gap-3 p-4">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${a.tone}/12 text-${a.tone}`} style={{ background: a.tone === "success" ? "#34c75922" : a.tone === "info" ? "#007aff22" : "#ff950022", color: a.tone === "success" ? "#34c759" : a.tone === "info" ? "#007aff" : "#ff9500" }}><a.icon className="h-5 w-5" /></span>
                <div className="flex-1"><p className="font-bold">{a.title}</p><p className="text-xs text-text-muted">{a.desc}</p><p className="mt-0.5 text-[11px] text-text-faint">{a.time}</p></div>
                <button onClick={() => setNotifs((l) => l.filter((x) => x.id !== a.id))} className="rounded-lg p-2 text-text-faint hover:bg-danger/10 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
              </Card>
            ))}
          </div>
        )}
      </>)}

      {tab === "My Alerts" && (<>
        <FilterChips value={filter} onChange={setFilter} chips={[{ value: "all", label: "All" }, { value: "active", label: "Active" }, { value: "paused", label: "Paused" }]} />
        <div className="mt-4 space-y-3">
          {filteredConfigs.map((c) => (
            <Card key={c.id} className="flex items-center gap-3 p-4">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.active ? "bg-primary/12 text-primary" : "bg-surface-2 text-text-faint"}`}><Bell className="h-5 w-5" /></span>
              <div className="flex-1"><p className="font-bold">{c.title}</p><p className="text-xs text-text-muted">{c.desc}</p></div>
              <Badge tone={c.active ? "success" : "neutral"}>{c.active ? "Active" : "Paused"}</Badge>
              <Toggle checked={c.active} onChange={() => setConfigs((l) => l.map((x) => x.id === c.id ? { ...x, active: !x.active } : x))} />
            </Card>
          ))}
        </div>
      </>)}

      <Modal open={modal} onClose={() => setModal(false)} title="New Alert" footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={create}>Create Alert</Button></>}>
        <div className="space-y-4">
          <Field label="Alert Name"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="London Investment" /></Field>
          <Field label="Property Type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{["Apartment", "Studio", "House", "Commercial", "HMO"].map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="London" /></Field>
        </div>
      </Modal>
    </div>
  );
}
