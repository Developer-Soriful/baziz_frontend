"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Button } from "@/components/ui/primitives";
import { PillTabs, FilterChips, EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Plus, Check, CircleCheck } from "lucide-react";

interface Task { id: string; title: string; property: string; priority: "High" | "Medium" | "Low" | "Completed"; due: string; bucket: "Today" | "Upcoming" | "Completed"; done: boolean; }
const seed: Task[] = [
  { id: "t1", title: "Gas Safety Inspection", property: "Sunset Heights, Apt 4B", priority: "High", due: "10:00 AM", bucket: "Today", done: false },
  { id: "t2", title: "Repair Leaking Tap", property: "Oakridge Estate, Unit 12", priority: "Medium", due: "02:00 PM", bucket: "Today", done: false },
  { id: "t3", title: "Collect Rent Arrears", property: "Pineview Manor, Room 3", priority: "High", due: "04:00 PM", bucket: "Today", done: false },
  { id: "t4", title: "Property Viewing", property: "Riverfront Plaza, Apt 9A", priority: "Low", due: "Tomorrow", bucket: "Upcoming", done: false },
  { id: "t5", title: "Inventory Check", property: "Lakeside Villas, No. 7", priority: "Low", due: "Next Monday", bucket: "Upcoming", done: false },
  { id: "t6", title: "Smoke Alarm Check", property: "Cedar Grove, Unit 5", priority: "Completed", due: "Completed Yesterday", bucket: "Completed", done: true },
];
const priColor = (p: string) => p === "High" ? "#ff3b30" : p === "Medium" ? "#ff9500" : p === "Completed" ? "#34c759" : "#007aff";

export default function TasksPage() {
  const toast = useToast();
  const [list, setList] = useState<Task[]>(seed);
  const [tab, setTab] = useState<Task["bucket"]>("Today");
  const [pri, setPri] = useState<"all" | "High" | "Medium" | "Low">("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", property: "General", priority: "Medium" as Task["priority"], due: "" });
  const filtered = list.filter((t) => t.bucket === tab && (pri === "all" || t.priority === pri));
  const toggle = (id: string) => setList((l) => l.map((t) => t.id === id ? { ...t, done: !t.done, bucket: !t.done ? "Completed" : "Today", priority: !t.done ? "Completed" : "Medium" } : t));
  const save = () => { if (!form.title.trim()) return toast("Enter a title", "error"); setList((l) => [{ id: `t${Date.now()}`, title: form.title, property: form.property, priority: form.priority, due: form.due, bucket: "Today", done: false }, ...l]); toast("Task added"); setModal(false); };

  return (
    <div className="animate-in">
      <PageTitle title="Tasks" subtitle="Manage your to-do list" action={<Button onClick={() => { setForm({ title: "", property: "General", priority: "Medium", due: "" }); setModal(true); }}><Plus className="h-4 w-4" /> Add Task</Button>} />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PillTabs value={tab} onChange={setTab} tabs={["Today", "Upcoming", "Completed"]} />
        <FilterChips value={pri} onChange={setPri} chips={[{ value: "all", label: "All" }, { value: "High", label: "High" }, { value: "Medium", label: "Medium" }, { value: "Low", label: "Low" }]} />
      </div>
      <Card>
        {filtered.length === 0 ? <EmptyState icon={CircleCheck} title="No tasks" message="You're all caught up!" /> : (
          <div className="divide-y divide-border">
            {filtered.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-4">
                <button onClick={() => toggle(t.id)} className={cn("flex h-6 w-6 items-center justify-center rounded-full border-2 transition", t.done ? "border-success bg-success text-white" : "border-border-strong hover:border-primary")}>{t.done && <Check className="h-3.5 w-3.5" />}</button>
                <div className="flex-1"><p className={cn("font-semibold", t.done && "text-text-faint line-through")}>{t.title}</p><p className="text-xs text-text-muted">{t.property}</p></div>
                <div className="text-right"><p className="text-xs font-bold" style={{ color: priColor(t.priority) }}>{t.priority}</p><p className="text-xs text-text-faint">{t.due}</p></div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Task" footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save}>Add Task</Button></>}>
        <div className="space-y-4">
          <Field label="Task Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Gas Safety Inspection" /></Field>
          <div className="grid grid-cols-2 gap-4"><Field label="Priority"><Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Task["priority"] })}>{["High", "Medium", "Low"].map((s) => <option key={s}>{s}</option>)}</Select></Field><Field label="Due"><Input value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} placeholder="10:00 AM" /></Field></div>
        </div>
      </Modal>
    </div>
  );
}
