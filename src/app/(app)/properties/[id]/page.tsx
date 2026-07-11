"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { PillTabs } from "@/components/ui/misc";
import { SimpleBar, DonutPie } from "@/components/charts";
import { properties } from "@/lib/data";
import { gbp } from "@/lib/utils";
import { ShieldCheck, User, Mail, Phone, TrendingUp, MessageSquare } from "lucide-react";

const details: [string, string][] = [
  ["% Rental Yield", "13.25%"], ["Monthly Rent", "£5,550.00"], ["Purchase Cost", "£500,000"], ["Purchase Date", "1/1/2020"],
  ["Tenure", "Freehold"], ["Mortgage", "£1,500.00"], ["% Management Fees", "10%"], ["Property Type", "Apartment"],
  ["Size", "1200 sq ft"], ["Bedrooms", "2"], ["Bathrooms", "2"], ["Ownership", "60%"],
];
const certs = [
  { name: "Gas Safety Certificate (CP12)", date: "15 Jan 2025", status: "Expired", tone: "danger" as const },
  { name: "Electrical Safety (EICR)", date: "20 Jan 2027", status: "Valid", tone: "success" as const },
  { name: "Smoke Alarm Check", date: "15 Mar 2025", status: "Expired", tone: "danger" as const },
  { name: "CO Alarm Check", date: "15 Mar 2025", status: "Expired", tone: "danger" as const },
];
const expenses = [
  { cat: "Repairs", desc: "Fixed leaking roof", date: "18 Mar 2025", amount: 850, color: "#008577" },
  { cat: "Utilities", desc: "Water bill", date: "28 Feb 2025", amount: 350, color: "#10b981" },
  { cat: "Taxes", desc: "Property tax payment", date: "20 Jan 2025", amount: 1200, color: "#fbbf24" },
  { cat: "Insurance", desc: "Monthly insurance premium", date: "5 Jan 2025", amount: 600, color: "#f87171" },
  { cat: "Maintenance", desc: "Regular garden maintenance", date: "10 Dec 2024", amount: 450, color: "#818cf8" },
];
const roiPie = [
  { name: "Mortgage", value: 10800, color: "#007aff" }, { name: "Tax", value: 1440, color: "#10b981" },
  { name: "Insurance", value: 720, color: "#f59e0b" }, { name: "Maintenance", value: 1080, color: "#ef4444" },
  { name: "Management", value: 3996, color: "#7c3aed" }, { name: "Utilities", value: 720, color: "#ec4899" }, { name: "Other", value: 360, color: "#06b6d4" },
];

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const p = properties.find((x) => x.id === id) ?? properties[0];
  const [tab, setTab] = useState<"Details" | "Tenants" | "Expenses" | "ROI">("Details");

  return (
    <div className="animate-in">
      <PageTitle title={p.name} subtitle={p.address} back="/properties" />
      <Card className="overflow-hidden">
        <img src={p.image} alt={p.name} className="h-52 w-full object-cover sm:h-64" />
        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold">{p.name}</h2>
              <p className="text-sm text-text-muted">{p.type} · {p.address}</p>
            </div>
            <Badge tone="primary">Owned by Personal Portfolio (60%)</Badge>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-surface-2 p-3 text-center"><p className="text-lg font-extrabold text-info">{p.value}</p><p className="text-xs text-text-muted">Value</p></div>
            <div className="rounded-xl bg-surface-2 p-3 text-center"><p className="text-lg font-extrabold text-violet">{p.yield}</p><p className="text-xs text-text-muted">Yield</p></div>
            <div className="rounded-xl bg-surface-2 p-3 text-center"><p className="text-lg font-extrabold text-success">{p.status}</p><p className="text-xs text-text-muted">Status</p></div>
          </div>
        </div>
      </Card>

      <div className="mt-4"><PillTabs value={tab} onChange={setTab} tabs={["Details", "Tenants", "Expenses", "ROI"]} /></div>

      {tab === "Details" && (
        <div className="mt-4 space-y-4">
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              {details.map(([k, v]) => (<div key={k} className="rounded-lg bg-surface-2 p-3"><p className="text-xs text-text-muted">{k}</p><p className="font-bold">{v}</p></div>))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4 text-primary" /> Safety Certificates</h3>
            <div className="divide-y divide-border">
              {certs.map((c) => (<div key={c.name} className="flex items-center justify-between py-2.5"><div><p className="text-sm font-semibold">{c.name}</p><p className="text-xs text-text-muted">{c.date}</p></div><Badge tone={c.tone}>{c.status}</Badge></div>))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-2 font-bold">Managed By</h3>
            <p className="text-sm">John Smith · Levin Property Management Ltd</p>
            <p className="text-sm text-text-muted">john.smith@levinproperties.com · +44 20 7123 4567</p>
          </Card>
        </div>
      )}

      {tab === "Tenants" && (
        <div className="mt-4 space-y-3">
          {[{ name: "John Smith", email: "john.tenant@example.com", phone: "123-456-7890", unit: "1A", rent: 1500 }, { name: "Sarah Johnson", email: "sarah.j@example.com", phone: "321-654-0987", unit: "2B", rent: 1200 }].map((t) => (
            <Card key={t.name} className="p-5">
              <div className="flex items-center justify-between"><h3 className="font-bold">{t.name}</h3><Link href="/messages" className="flex items-center gap-1 text-xs font-semibold text-primary"><MessageSquare className="h-3.5 w-3.5" /> Message</Link></div>
              <div className="mt-2 space-y-1 text-sm text-text-muted">
                <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {t.email}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {t.phone}</p>
                <p className="flex items-center gap-2"><User className="h-4 w-4" /> Unit {t.unit}</p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3"><span className="text-sm text-text-muted">Rent</span><span className="font-bold">{gbp(t.rent, { decimals: true })}/mo</span></div>
            </Card>
          ))}
        </div>
      )}

      {tab === "Expenses" && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-3 font-bold">Expenses by Category</h3>
            <div className="h-56"><SimpleBar data={expenses.map((e) => ({ name: e.cat, value: e.amount, color: e.color }))} formatter={(v) => `£${v}`} /></div>
            <p className="mt-3 text-right text-sm">Total: <span className="font-extrabold">{gbp(3450)}</span></p>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 font-bold">Recent Expenses</h3>
            <div className="divide-y divide-border">
              {expenses.map((e) => (<div key={e.desc} className="flex items-center justify-between py-2.5"><div><p className="text-sm font-semibold">{e.desc}</p><p className="text-xs text-text-muted">{e.cat} · {e.date}</p></div><span className="font-bold text-danger">{gbp(e.amount)}</span></div>))}
            </div>
          </Card>
        </div>
      )}

      {tab === "ROI" && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-3 font-bold">ROI Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              {[["Gross Yield", "13.32%"], ["Cap Rate", "6.95%"], ["Cash-on-Cash", "33.09%"], ["Net Op. Income", "£20,844"]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-surface-2 p-4"><p className="text-xs text-text-muted">{k}</p><p className="flex items-center gap-1 text-lg font-extrabold text-primary"><TrendingUp className="h-4 w-4" />{v}</p></div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 font-bold">Expense Breakdown</h3>
            <div className="h-48"><DonutPie data={roiPie} /></div>
            <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs">{roiPie.map((r) => (<span key={r.name} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />{r.name}</span>))}</div>
          </Card>
        </div>
      )}
    </div>
  );
}
