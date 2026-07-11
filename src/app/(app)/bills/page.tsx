"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge } from "@/components/ui/primitives";
import { tenantBills as seed, billTone, type Bill } from "@/lib/data";
import { gbp } from "@/lib/utils";
import { Droplet, Zap, Flame, Landmark, Phone, Globe } from "lucide-react";

const icons: Record<string, React.ElementType> = { Water: Droplet, Electricity: Zap, Gas: Flame, "Council Tax": Landmark };

export default function BillsPage() {
  const [list, setList] = useState<Bill[]>(() => [...seed]);
  const total = list.reduce((s, b) => s + b.amount, 0);
  const paid = list.filter((b) => b.status === "Paid").length;
  const pending = list.filter((b) => b.status === "Pending").length;
  const cycle = (id: string) => setList((l) => l.map((b) => b.id === id ? { ...b, status: b.status === "Paid" ? "Pending" : "Paid" } : b));

  return (
    <div className="animate-in mx-auto max-w-3xl">
      <PageTitle title="Monthly Bills" subtitle="Track your utilities & suppliers" />
      <div className="overflow-hidden rounded-2xl p-6 text-white" style={{ background: "linear-gradient(120deg,#008577,#00574b)" }}>
        <p className="text-sm text-white/80">Estimated Monthly Total</p>
        <p className="text-4xl font-extrabold">{gbp(total, { decimals: true })}</p>
        <div className="mt-4 flex gap-3 text-xs font-semibold">
          <span className="rounded-full bg-white/15 px-3 py-1">{paid} Paid</span>
          <span className="rounded-full bg-white/15 px-3 py-1">{pending} Pending</span>
        </div>
      </div>
      <h3 className="mb-3 mt-6 font-bold">Your Bills ({list.length})</h3>
      <div className="space-y-3">
        {list.map((b) => { const Icon = icons[b.type] ?? Droplet; return (
          <Card key={b.id} className="p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${b.color}1a`, color: b.color }}><Icon className="h-5 w-5" /></span>
              <div className="flex-1"><p className="font-bold">{b.type}</p><p className="text-xs text-text-muted">{b.supplier} · Ref: {b.ref}</p></div>
              <button onClick={() => cycle(b.id)}><Badge tone={billTone(b.status)}>{b.status}</Badge></button>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
              <span className="text-text-muted">Due {b.dueDay} each month</span>
              <span className="font-bold">{gbp(b.amount, { decimals: true })}/mo</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {b.phone}</span>
              <span className="flex items-center gap-1 text-primary"><Globe className="h-3.5 w-3.5" /> {b.website}</span>
            </div>
          </Card>
        ); })}
      </div>
    </div>
  );
}
