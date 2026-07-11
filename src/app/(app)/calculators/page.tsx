"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card } from "@/components/ui/primitives";
import { PillTabs } from "@/components/ui/misc";
import { Field, Input, Select } from "@/components/ui/form";
import { gbp } from "@/lib/utils";
import { Receipt, TrendingUp, Home, Building } from "lucide-react";

const n = (v: string) => parseFloat(v) || 0;

export default function CalculatorsPage() {
  const [tab, setTab] = useState<"ROI" | "Stamp Duty" | "Flip" | "Development">("ROI");
  return (
    <div className="animate-in mx-auto max-w-4xl">
      <PageTitle title="Financial Calculators" subtitle="Analyze property deals and ROI" />
      <div className="mb-5"><PillTabs value={tab} onChange={setTab} tabs={["ROI", "Stamp Duty", "Flip", "Development"]} /></div>
      {tab === "ROI" && <ROICalc />}
      {tab === "Stamp Duty" && <StampDutyCalc />}
      {tab === "Flip" && <FlipCalc />}
      {tab === "Development" && <DevCalc />}
    </div>
  );
}

function Metric({ label, value, big, accent }: { label: string; value: string; big?: boolean; accent?: string }) {
  return <div className="rounded-xl bg-surface-2 p-4"><p className="text-xs text-text-muted">{label}</p><p className={big ? "text-2xl font-extrabold" : "font-bold"} style={accent ? { color: accent } : undefined}>{value}</p></div>;
}

function ROICalc() {
  const [f, setF] = useState({ price: "300000", stamp: "6000", legal: "1500", agent: "0", refurb: "5000", other: "0", rent: "1850", mortgage: "800", mgmt: "10", repairs: "600", maint: "500", insurance: "400", otherAnnual: "0" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const totalInvestment = n(f.price) + n(f.stamp) + n(f.legal) + n(f.agent) + n(f.refurb) + n(f.other);
  const annualRent = n(f.rent) * 12;
  const mgmtFees = annualRent * (n(f.mgmt) / 100);
  const totalExp = n(f.mortgage) * 12 + mgmtFees + n(f.repairs) + n(f.maint) + n(f.insurance) + n(f.otherAnnual);
  const net = annualRent - totalExp;
  const roi = totalInvestment > 0 ? (net / totalInvestment) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <h3 className="mb-3 font-bold">Investment Details (£)</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Purchase Price"><Input value={f.price} onChange={set("price")} /></Field>
          <Field label="Stamp Duty"><Input value={f.stamp} onChange={set("stamp")} /></Field>
          <Field label="Legal Fees"><Input value={f.legal} onChange={set("legal")} /></Field>
          <Field label="Refurb Costs"><Input value={f.refurb} onChange={set("refurb")} /></Field>
        </div>
        <h3 className="mb-3 mt-5 font-bold">Income & Expenses (£)</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Monthly Rent"><Input value={f.rent} onChange={set("rent")} /></Field>
          <Field label="Monthly Mortgage"><Input value={f.mortgage} onChange={set("mortgage")} /></Field>
          <Field label="Management Fee (%)"><Input value={f.mgmt} onChange={set("mgmt")} /></Field>
          <Field label="Annual Repairs"><Input value={f.repairs} onChange={set("repairs")} /></Field>
          <Field label="Annual Maintenance"><Input value={f.maint} onChange={set("maint")} /></Field>
          <Field label="Annual Insurance"><Input value={f.insurance} onChange={set("insurance")} /></Field>
        </div>
      </Card>
      <Card className="p-5">
        <h3 className="mb-3 font-bold">Results</h3>
        <div className="mb-4 rounded-xl bg-primary/8 p-5 text-center"><p className="text-sm text-text-muted">Return on Investment</p><p className="text-4xl font-extrabold text-primary">{roi.toFixed(2)}%</p></div>
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Total Investment" value={gbp(totalInvestment)} />
          <Metric label="Annual Rent" value={gbp(annualRent)} />
          <Metric label="Total Annual Expenses" value={gbp(Math.round(totalExp))} accent="#ff3b30" />
          <Metric label="Net Annual Income" value={gbp(Math.round(net))} accent="#34c759" />
          <Metric label="Monthly Cash Flow" value={gbp(Math.round(net / 12))} big accent="#007aff" />
        </div>
      </Card>
    </div>
  );
}

function StampDutyCalc() {
  const [price, setPrice] = useState("300000");
  const [region, setRegion] = useState("England & NI");
  const [additional, setAdditional] = useState(false);
  const p = n(price);
  const bandsFor = () => {
    if (region === "Scotland") return [[0, 145000, 0], [145000, 250000, 0.02], [250000, 325000, 0.05], [325000, 750000, 0.1], [750000, Infinity, 0.12]];
    if (region === "Wales") return [[0, 225000, 0], [225000, 400000, 0.06], [400000, 750000, 0.075], [750000, 1500000, 0.1], [1500000, Infinity, 0.12]];
    return [[0, 250000, 0], [250000, 925000, 0.05], [925000, 1500000, 0.1], [1500000, Infinity, 0.12]];
  };
  const surcharge = region === "Scotland" ? 0.06 : region === "Wales" ? 0.04 : 0.03;
  const rows = bandsFor().filter(([from]) => p > from).map(([from, to, rate]) => {
    const taxable = Math.min(p, to) - from;
    return { band: `${gbp(from)} – ${to === Infinity ? "+" : gbp(to)}`, rate: `${(rate * 100).toFixed(1)}%`, taxable, tax: taxable * rate };
  });
  let tax = rows.reduce((s, r) => s + r.tax, 0);
  if (additional) tax += p * surcharge;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <h3 className="mb-3 font-bold">Details</h3>
        <div className="space-y-4">
          <Field label="Property Price (£)"><Input value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
          <Field label="Region"><Select value={region} onChange={(e) => setRegion(e.target.value)}>{["England & NI", "Wales", "Scotland"].map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={additional} onChange={(e) => setAdditional(e.target.checked)} className="h-4 w-4 rounded accent-primary" /> Additional property (+{(surcharge * 100).toFixed(0)}% surcharge)</label>
        </div>
      </Card>
      <Card className="p-5">
        <h3 className="mb-3 font-bold">Stamp Duty Due</h3>
        <div className="mb-4 rounded-xl bg-primary/8 p-5 text-center"><p className="text-4xl font-extrabold text-primary">{gbp(Math.round(tax))}</p></div>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm"><thead><tr className="bg-surface-2 text-left text-xs text-text-muted"><th className="px-3 py-2">Band</th><th className="px-3 py-2">Rate</th><th className="px-3 py-2 text-right">Tax</th></tr></thead>
            <tbody className="divide-y divide-border">{rows.map((r, i) => <tr key={i}><td className="px-3 py-2">{r.band}</td><td className="px-3 py-2">{r.rate}</td><td className="px-3 py-2 text-right font-semibold">{gbp(Math.round(r.tax))}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function FlipCalc() {
  const [f, setF] = useState({ purchase: "200000", arv: "300000", materials: "40000", permits: "2000", contingency: "15", stamp: "6000", legal: "2500", survey: "1000", sellAgent: "4500", sellLegal: "1500", councilTax: "150", insurance: "80", utilities: "200", duration: "6", loan: "160000", rate: "6.5", arrangement: "2000" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const contingencyAmt = n(f.materials) * (n(f.contingency) / 100);
  const purchaseCosts = n(f.purchase) + n(f.stamp) + n(f.legal) + n(f.survey);
  const renoCosts = n(f.materials) + n(f.permits) + contingencyAmt;
  const running = (n(f.councilTax) + n(f.insurance) + n(f.utilities)) * n(f.duration);
  const interest = n(f.loan) * (n(f.rate) / 100) * (n(f.duration) / 12);
  const finance = interest + n(f.arrangement);
  const selling = n(f.sellAgent) + n(f.sellLegal);
  const total = purchaseCosts + renoCosts + running + finance + selling;
  const netProfit = n(f.arv) - total;
  const roi = total > 0 ? (netProfit / total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <h3 className="mb-3 font-bold">Project Inputs (£)</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Purchase Price"><Input value={f.purchase} onChange={set("purchase")} /></Field>
          <Field label="After Repair Value"><Input value={f.arv} onChange={set("arv")} /></Field>
          <Field label="Materials & Labor"><Input value={f.materials} onChange={set("materials")} /></Field>
          <Field label="Contingency (%)"><Input value={f.contingency} onChange={set("contingency")} /></Field>
          <Field label="Loan Amount"><Input value={f.loan} onChange={set("loan")} /></Field>
          <Field label="Interest Rate (%)"><Input value={f.rate} onChange={set("rate")} /></Field>
          <Field label="Duration (months)"><Input value={f.duration} onChange={set("duration")} /></Field>
          <Field label="Selling Agent Fees"><Input value={f.sellAgent} onChange={set("sellAgent")} /></Field>
        </div>
      </Card>
      <Card className="p-5">
        <h3 className="mb-3 font-bold">Results</h3>
        <div className={`mb-4 rounded-xl p-5 text-center ${netProfit >= 0 ? "bg-success/10" : "bg-danger/10"}`}><p className="text-sm text-text-muted">Net Profit</p><p className={`text-3xl font-extrabold ${netProfit >= 0 ? "text-success" : "text-danger"}`}>{gbp(Math.round(netProfit))}</p><p className="text-sm font-semibold">ROI {roi.toFixed(1)}%</p></div>
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Total Project Costs" value={gbp(Math.round(total))} />
          <Metric label="Renovation" value={gbp(Math.round(renoCosts))} />
          <Metric label="Finance Costs" value={gbp(Math.round(finance))} />
          <Metric label="Profit Margin" value={`${(n(f.arv) > 0 ? (netProfit / n(f.arv)) * 100 : 0).toFixed(1)}%`} />
        </div>
      </Card>
    </div>
  );
}

function DevCalc() {
  const [f, setF] = useState({ purchase: "500000", stamp: "15000", legal: "5000", survey: "3000", construction: "800000", contingency: "80000", architect: "40000", planning: "15000", building: "10000", finance: "60000", duration: "12", sale: "1800000", agent: "36000", legalSale: "8000" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const acquisition = n(f.purchase) + n(f.stamp) + n(f.legal) + n(f.survey);
  const development = n(f.construction) + n(f.contingency) + n(f.architect) + n(f.planning) + n(f.building) + n(f.finance);
  const totalCost = acquisition + development;
  const netSale = n(f.sale) - n(f.agent) - n(f.legalSale);
  const profit = netSale - totalCost;
  const margin = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const gdv = n(f.sale) > 0 ? (profit / n(f.sale)) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <h3 className="mb-3 font-bold">Appraisal Inputs (£)</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Purchase Price"><Input value={f.purchase} onChange={set("purchase")} /></Field>
          <Field label="Construction Cost"><Input value={f.construction} onChange={set("construction")} /></Field>
          <Field label="Contingency"><Input value={f.contingency} onChange={set("contingency")} /></Field>
          <Field label="Architect Fees"><Input value={f.architect} onChange={set("architect")} /></Field>
          <Field label="Finance Costs"><Input value={f.finance} onChange={set("finance")} /></Field>
          <Field label="Projected Sale"><Input value={f.sale} onChange={set("sale")} /></Field>
          <Field label="Agent Fees"><Input value={f.agent} onChange={set("agent")} /></Field>
          <Field label="Duration (months)"><Input value={f.duration} onChange={set("duration")} /></Field>
        </div>
      </Card>
      <Card className="p-5">
        <h3 className="mb-3 font-bold">Results</h3>
        <div className={`mb-4 rounded-xl p-5 text-center ${profit >= 0 ? "bg-success/10" : "bg-danger/10"}`}><p className="text-sm text-text-muted">Profit / Loss</p><p className={`text-3xl font-extrabold ${profit >= 0 ? "text-success" : "text-danger"}`}>{gbp(Math.round(profit))}</p></div>
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Total Project Cost" value={gbp(Math.round(totalCost))} />
          <Metric label="Net Sale Proceeds" value={gbp(Math.round(netSale))} />
          <Metric label="Profit Margin" value={`${margin.toFixed(1)}%`} accent="#007aff" />
          <Metric label="Return on GDV" value={`${gdv.toFixed(1)}%`} accent="#7c3aed" />
        </div>
      </Card>
    </div>
  );
}
