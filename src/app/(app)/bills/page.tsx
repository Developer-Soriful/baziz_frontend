"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { billTone } from "@/lib/data";
import { gbp } from "@/lib/utils";
import {
  Droplet,
  Zap,
  Flame,
  Landmark,
  Phone,
  Globe,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billService, MonthlyBill } from "@/lib/services/bill.service";

const icons: Record<string, React.ElementType> = {
  water: Droplet,
  electricity: Zap,
  gas: Flame,
  council_tax: Landmark,
  broadband: Globe,
  other: FileText,
};

const billTypeLabels: Record<string, string> = {
  water: "Water",
  electricity: "Electricity",
  gas: "Gas",
  council_tax: "Council Tax",
  broadband: "Broadband",
  other: "Other",
};

function formatDueDate(dueDay: number) {
  const d = new Date();
  d.setDate(dueDay);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function calculateSummary(bills: MonthlyBill[]) {
  const total = bills.reduce((s, b) => s + b.monthlyAmount, 0);
  const paid = bills.filter((b) => b.paymentStatus === "paid").length;
  const pending = bills.filter((b) => b.paymentStatus === "pending").length;
  return { total, paid, pending };
}

export default function BillsPage() {
  const { user } = useAuth();

  if (user?.role === "tenant") return <TenantBills />;
  return <LandlordBills />;
}

//Tenant Bills

function TenantBills() {
  const toast = useToast();
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    billType: "water",
    supplier: "",
    accountReference: "",
    monthlyAmount: "",
    dueDay: "1",
    supplierPhone: "",
    supplierWebsite: "",
  });

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ["monthly-bills"],
    queryFn: billService.getAll,
  });

  const addMutation = useMutation({
    mutationFn: billService.addBill,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["monthly-bills"] });
      toast("Bill added successfully", "success");
      setModal(false);
      setForm({
        billType: "water",
        supplier: "",
        accountReference: "",
        monthlyAmount: "",
        dueDay: "1",
        supplierPhone: "",
        supplierWebsite: "",
      });
    },
    onError: (err: any) =>
      toast(err?.response?.data?.message || "Failed to add bill", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: billService.deleteBill,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["monthly-bills"] });
      toast("Bill deleted", "success");
    },
    onError: () => toast("Failed to delete bill", "error"),
  });

  const save = () => {
    if (!form.supplier || !form.accountReference || !form.monthlyAmount) {
      return toast("Please fill in required fields", "error");
    }

    const amount = Number(form.monthlyAmount);
    if (isNaN(amount) || amount <= 0) {
      return toast("Monthly amount must be a positive number", "error");
    }

    let website = form.supplierWebsite.trim();
    if (website && !/^https?:\/\//i.test(website)) {
      website = `https://${website}`;
    }
    
    addMutation.mutate({
      billType: form.billType as any,
      supplier: form.supplier,
      accountReference: form.accountReference,
      monthlyAmount: amount,
      dueDay: Number(form.dueDay),
      supplierPhone: form.supplierPhone || undefined,
      supplierWebsite: website || undefined,
    });
  };

  const { total, paid, pending } = calculateSummary(bills);

  return (
    <div className="animate-in">
      <PageTitle
        title="Monthly Bills"
        subtitle="Manage your utilities & suppliers"
        action={
          <Button onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" /> Add Bill
          </Button>
        }
      />

      <div
        className="overflow-hidden rounded-2xl p-6 text-white mb-6"
        style={{ background: "linear-gradient(120deg,#008577,#00574b)" }}
      >
        <p className="text-sm text-white/80">Estimated Monthly Total</p>
        <p className="text-4xl font-extrabold">
          {gbp(total, { decimals: true })}
        </p>
        <div className="mt-4 flex gap-3 text-xs font-semibold">
          <span className="rounded-full bg-white/15 px-3 py-1">
            {paid} Paid
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1">
            {pending} Pending
          </span>
        </div>
      </div>

      <h3 className="mb-3 font-bold">Your Bills ({bills.length})</h3>

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-text-muted">
            Loading bills...
          </div>
        </Card>
      ) : bills.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No Bills Found"
            message="You don't have any monthly bills yet. Add one to start tracking."
            action={<Button onClick={() => setModal(true)}>Add Bill</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {bills.map((b) => {
            const Icon = icons[b.billType] ?? FileText;
            const label = billTypeLabels[b.billType] || b.billType;

            return (
              <Card key={b._id} className="p-4 relative group">
                <div className="absolute right-4 top-4 hidden group-hover:block">
                  <button
                    onClick={() => deleteMutation.mutate(b._id)}
                    className="rounded-lg p-2 text-text-faint hover:bg-danger/10 hover:text-danger"
                    title="Delete Bill"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1 pr-10">
                    <p className="font-bold capitalize">{label}</p>
                    <p className="text-xs text-text-muted">
                      {b.supplier} · {b.accountReference}
                    </p>
                  </div>
                  <Badge
                    tone={billTone(
                      b.paymentStatus === "paid"
                        ? "Paid"
                        : b.paymentStatus === "overdue"
                          ? "Overdue"
                          : "Pending",
                    )}
                  >
                    {b.paymentStatus}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="text-text-muted">
                    Due approx. {formatDueDate(b.dueDay)}
                  </span>
                  <span className="font-bold">
                    {gbp(b.monthlyAmount, { decimals: true })}
                  </span>
                </div>

                {(b.supplierPhone || b.supplierWebsite) && (
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-muted">
                    {b.supplierPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {b.supplierPhone}
                      </span>
                    )}
                    {b.supplierWebsite && (
                      <a
                        href={
                          b.supplierWebsite.startsWith("http")
                            ? b.supplierWebsite
                            : `https://${b.supplierWebsite}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Globe className="h-3.5 w-3.5" /> {b.supplierWebsite}
                      </a>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Add Monthly Bill"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button loading={addMutation.isPending} onClick={save}>
              Save Bill
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bill Type">
              <Select
                value={form.billType}
                onChange={(e) => setForm({ ...form, billType: e.target.value })}
              >
                {Object.entries(billTypeLabels).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Monthly Amount (£)">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.monthlyAmount}
                onChange={(e) =>
                  setForm({ ...form, monthlyAmount: e.target.value })
                }
                placeholder="45.50"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Supplier Name">
              <Input
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="e.g. Thames Water"
              />
            </Field>
            <Field label="Account Reference">
              <Input
                value={form.accountReference}
                onChange={(e) =>
                  setForm({ ...form, accountReference: e.target.value })
                }
                placeholder="e.g. 123456789"
              />
            </Field>
          </div>

          <Field label="Due Day (1-31)">
            <Input
              type="number"
              min="1"
              max="31"
              value={form.dueDay}
              onChange={(e) => setForm({ ...form, dueDay: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Supplier Phone (Optional)">
              <Input
                value={form.supplierPhone}
                onChange={(e) =>
                  setForm({ ...form, supplierPhone: e.target.value })
                }
                placeholder="0800 123 4567"
              />
            </Field>
            <Field label="Supplier Website (Optional)">
              <Input
                value={form.supplierWebsite}
                onChange={(e) =>
                  setForm({ ...form, supplierWebsite: e.target.value })
                }
                placeholder="www.example.com"
              />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Landlord Bills ──────────────────────────────────────────────────────────

function LandlordBills() {
  const toast = useToast();
  const qc = useQueryClient();

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ["monthly-bills"],
    queryFn: billService.getAll,
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "paid" | "pending" | "overdue";
    }) => billService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["monthly-bills"] });
      toast("Status updated", "success");
    },
    onError: () => toast("Failed to update status", "error"),
  });

  const { total, paid, pending } = calculateSummary(bills);

  return (
    <div className="animate-in">
      <PageTitle
        title="Monthly Bills"
        subtitle="Track utilities across your properties"
      />

      <div
        className="overflow-hidden rounded-2xl p-6 text-white mb-6"
        style={{ background: "linear-gradient(120deg,#008577,#00574b)" }}
      >
        <p className="text-sm text-white/80">Total Tenant Bills</p>
        <p className="text-4xl font-extrabold">
          {gbp(total, { decimals: true })}
        </p>
        <div className="mt-4 flex gap-3 text-xs font-semibold">
          <span className="rounded-full bg-white/15 px-3 py-1">
            {paid} Paid
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1">
            {pending} Pending
          </span>
        </div>
      </div>

      <h3 className="mb-3 font-bold">Tenant Bills ({bills.length})</h3>

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-text-muted">
            Loading bills...
          </div>
        </Card>
      ) : bills.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No Bills Found"
            message="Your tenants haven't added any monthly bills yet."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {bills.map((b) => {
            const Icon = icons[b.billType] ?? FileText;
            const label = billTypeLabels[b.billType] || b.billType;

            return (
              <Card key={b._id} className="p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="font-bold capitalize">{label}</p>
                    <p className="text-xs text-text-muted">
                      {b.supplier} · {b.accountReference}
                    </p>
                  </div>

                  {/* Status Dropdown for Landlord */}
                  <Select
                    value={b.paymentStatus}
                    onChange={(e) =>
                      statusMutation.mutate({
                        id: b._id,
                        status: e.target.value as any,
                      })
                    }
                    className={`h-8 py-0 pl-3 pr-8 text-xs font-semibold rounded-full border-0 ${
                      b.paymentStatus === "paid"
                        ? "bg-success/10 text-success"
                        : b.paymentStatus === "overdue"
                          ? "bg-danger/10 text-danger"
                          : "bg-warning/10 text-warning"
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </Select>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="text-text-muted">
                    Due approx. {formatDueDate(b.dueDay)}
                  </span>
                  <span className="font-bold">
                    {gbp(b.monthlyAmount, { decimals: true })}
                  </span>
                </div>

                {(b.supplierPhone || b.supplierWebsite) && (
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-muted">
                    {b.supplierPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {b.supplierPhone}
                      </span>
                    )}
                    {b.supplierWebsite && (
                      <a
                        href={
                          b.supplierWebsite.startsWith("http")
                            ? b.supplierWebsite
                            : `https://${b.supplierWebsite}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Globe className="h-3.5 w-3.5" /> {b.supplierWebsite}
                      </a>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
