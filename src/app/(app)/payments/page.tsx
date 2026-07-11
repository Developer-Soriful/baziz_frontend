"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { FilterChips, EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { paymentTone } from "@/lib/data";
import { CreditCard, Wallet, CheckCircle2, Clock, AlertTriangle, Smartphone } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService, Payment } from "@/lib/services/payment.service";

export default function PaymentsPage() {
  const { user } = useAuth();
  if (user?.role === "tenant") return <TenantPayments />;
  return <LandlordPayments />;
}

function LandlordPayments() {
  const toast = useToast();
  
  const { data: list = [], isLoading } = useQuery({
    queryKey: ["payments-all"],
    queryFn: paymentService.getAll,
  });

  const [filter, setFilter] = useState<"all" | "Paid" | "Pending" | "Overdue">("all");
  const filtered = list.filter((p: any) => filter === "all" || p.status === filter);
  const num = (s: string | number) => typeof s === "number" ? s : parseFloat(s.replace(/[£,]/g, ""));
  const collected = list.filter((p: any) => p.status === "Paid").reduce((s: number, p: any) => s + num(p.amount), 0);

  return (
    <div className="animate-in">
      <PageTitle title="Payments" subtitle="Track and manage your payments" action={<Button onClick={() => toast("Report generated")}>Export Report</Button>} />
      <div className="mb-5 grid grid-cols-3 gap-4">
        <Card className="p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/12 text-success"><CheckCircle2 className="h-5 w-5" /></span><p className="mt-2 text-xl font-extrabold">£{collected.toLocaleString()}</p><p className="text-xs text-text-muted">Collected</p></Card>
        <Card className="p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/12 text-warning"><Clock className="h-5 w-5" /></span><p className="mt-2 text-xl font-extrabold">£0.00</p><p className="text-xs text-text-muted">Pending</p></Card>
        <Card className="p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger/12 text-danger"><AlertTriangle className="h-5 w-5" /></span><p className="mt-2 text-xl font-extrabold">£0.00</p><p className="text-xs text-text-muted">Overdue</p></Card>
      </div>
      <FilterChips value={filter} onChange={setFilter} chips={[{ value: "all", label: "All" }, { value: "Paid", label: "Paid" }, { value: "Pending", label: "Pending" }, { value: "Overdue", label: "Overdue" }]} />
      
      {isLoading ? (
        <Card className="mt-4 p-8 text-center text-text-muted">Loading payments...</Card>
      ) : filtered.length === 0 ? (
        <Card className="mt-4"><EmptyState icon={Wallet} title="No payments found" /></Card>
      ) : (
        <Card className="mt-4 divide-y divide-border">
          {filtered.map((p: any) => (
            <div key={p.id || p._id} className="flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Wallet className="h-4 w-4" /></span>
              <div className="flex-1"><p className="font-semibold">{p.tenant}</p><p className="text-xs text-text-muted">{p.property} · {new Date(p.date || Date.now()).toLocaleDateString("en-GB")}</p></div>
              <span className="font-bold">{typeof p.amount === 'number' ? `£${p.amount}` : p.amount}</span>
              <Badge tone={paymentTone(p.status)}>{p.status}</Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function TenantPayments() {
  const toast = useToast();
  const qc = useQueryClient();
  const [pay, setPay] = useState(false);

  const { data: tenantPayments = [], isLoading } = useQuery({
    queryKey: ["payments-tenant"],
    queryFn: paymentService.getMyPayments,
  });

  const payMutation = useMutation({
    mutationFn: (data: any) => paymentService.pay(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments-tenant"] });
      toast("Payment successful!");
      setPay(false);
    },
    onError: () => {
      toast("Payment failed", "error");
    }
  });

  return (
    <div className="animate-in">
      <PageTitle title="Payments" subtitle="Pay rent and view your history" />
      <div className="overflow-hidden rounded-2xl p-6 text-white" style={{ background: "linear-gradient(120deg,#008577,#00574b)" }}>
        <p className="text-sm text-white/80">Monthly Rent · Due 1st of each month</p>
        <p className="mt-1 text-4xl font-extrabold">£1,850.00</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={() => setPay(true)} className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary">Pay with Card</button>
          <button onClick={() => toast("Payment successful with Apple Pay")} className="flex items-center gap-1.5 rounded-xl bg-black px-5 py-2.5 text-sm font-bold text-white"><Smartphone className="h-4 w-4" /> Apple Pay</button>
        </div>
      </div>
      <Card className="mt-4 flex items-center justify-between p-4"><div><p className="font-semibold">Auto-Pay</p><p className="text-xs text-text-muted">Currently disabled</p></div><Button size="sm" variant="secondary" onClick={() => toast("Auto-Pay settings saved")}>Set up</Button></Card>
      <div className="mt-5 rounded-xl bg-warning/10 p-4"><p className="text-sm font-semibold text-warning">Upcoming: Rent Payment · Due in 5 days · £1,850.00</p></div>
      <h3 className="mb-3 mt-6 font-bold">Payment History</h3>
      {isLoading ? (
        <Card className="p-8 text-center text-text-muted">Loading history...</Card>
      ) : tenantPayments.length === 0 ? (
        <Card><EmptyState icon={Wallet} title="No history found" /></Card>
      ) : (
        <Card className="divide-y divide-border">
          {tenantPayments.map((p: any) => (
            <div key={p.id || p._id} className="flex items-center gap-3 p-4"><CheckCircle2 className="h-5 w-5 text-success" /><div className="flex-1"><p className="font-semibold">{p.property || "Rent"}</p><p className="text-xs text-text-muted">{new Date(p.date || Date.now()).toLocaleDateString("en-GB")}</p></div><span className="font-bold">{typeof p.amount === 'number' ? `£${p.amount}` : p.amount}</span><Badge tone="success">Paid</Badge></div>
          ))}
        </Card>
      )}
      <Modal open={pay} onClose={() => setPay(false)} title="Card Payment" subtitle="Amount Due £1,850.00" footer={<><Button variant="secondary" onClick={() => setPay(false)}>Cancel</Button><Button onClick={() => payMutation.mutate({ amount: 1850, paymentMethodId: "pm_card_visa" })} loading={payMutation.isPending}>Pay £1,850.00</Button></>}>
        <div className="space-y-4">
          <Field label="Card Number"><Input placeholder="4242 4242 4242 4242" /></Field>
          <div className="grid grid-cols-3 gap-3"><Field label="MM/YY"><Input placeholder="12/28" /></Field><Field label="CVC"><Input placeholder="123" /></Field><Field label="ZIP"><Input placeholder="SW1A" /></Field></div>
          <p className="text-center text-xs text-text-faint">🔒 Secured by Stripe</p>
        </div>
      </Modal>
    </div>
  );
}
