"use client";

import { useEffect, useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { FilterChips, EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { paymentTone } from "@/lib/data";
import {
  CreditCard,
  Wallet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Smartphone,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "@/lib/services/payment.service";
import { tenantService } from "@/lib/services/tenant.service";
import { useRouter } from "next/navigation";

export default function PaymentsPage() {
  const { user } = useAuth();
  if (user?.role === "tenant") return <TenantPayments />;
  return <LandlordPayments />;
}

function LandlordPayments() {
  const toast = useToast();
  const qc = useQueryClient();

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["payments-all"],
    queryFn: paymentService.getAll,
  });

  const generateBillsMutation = useMutation({
    mutationFn: paymentService.generateBills,
    onSuccess: (res: any) => {
      toast(res.message || "Monthly bills generated successfully!", "success");
      qc.invalidateQueries({ queryKey: ["payments-all"] });
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to generate bills";
      toast(msg, "error");
    },
  });

  const [filter, setFilter] = useState<"all" | "Paid" | "Pending" | "Overdue">(
    "all",
  );
  const filtered = list.filter(
    (p: any) =>
      filter === "all" ||
      (p.status || "").toLowerCase() === filter.toLowerCase(),
  );
  const num = (s: string | number) =>
    typeof s === "number" ? s : parseFloat(s.replace(/[£,]/g, ""));

  const collected = list
    .filter((p: any) => (p.status || "").toLowerCase() === "paid")
    .reduce((s: number, p: any) => s + num(p.amount), 0);

  const pending = list
    .filter((p: any) => (p.status || "").toLowerCase() === "pending")
    .reduce((s: number, p: any) => s + num(p.amount), 0);

  const overdue = list
    .filter((p: any) => (p.status || "").toLowerCase() === "overdue")
    .reduce((s: number, p: any) => s + num(p.amount), 0);

  return (
    <div className="animate-in">
      <PageTitle
        title="Payments"
        subtitle="Track and manage your payments"
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => generateBillsMutation.mutate()}
              loading={generateBillsMutation.isPending}
            >
              Generate Bills
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast("Report generated")}
            >
              Export Report
            </Button>
          </div>
        }
      />
      <div className="mb-5 grid grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/12 text-success">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <p className="mt-2 text-xl font-extrabold">
            £
            {collected.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-text-muted">Collected</p>
        </Card>
        <Card className="p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/12 text-warning">
            <Clock className="h-5 w-5" />
          </span>
          <p className="mt-2 text-xl font-extrabold">
            £
            {pending.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-text-muted">Pending</p>
        </Card>
        <Card className="p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger/12 text-danger">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <p className="mt-2 text-xl font-extrabold">
            £
            {overdue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-text-muted">Overdue</p>
        </Card>
      </div>
      <FilterChips
        value={filter}
        onChange={setFilter}
        chips={[
          { value: "all", label: "All" },
          { value: "Paid", label: "Paid" },
          { value: "Pending", label: "Pending" },
          { value: "Overdue", label: "Overdue" },
        ]}
      />

      {isLoading ? (
        <Card className="mt-4 p-8 text-center text-text-muted">
          Loading payments...
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="mt-4">
          <EmptyState icon={Wallet} title="No payments found" />
        </Card>
      ) : (
        <Card className="mt-4 divide-y divide-border">
          {filtered.map((p: any) => (
            <div key={p.id || p._id} className="flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Wallet className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="font-semibold">
                  {p.tenant?.name || p.tenant || "Unknown Tenant"}
                </p>
                <p className="text-xs text-text-muted">
                  {p.property?.name || p.property || "Unknown Property"} ·{" "}
                  {new Date(
                    p.date || p.dueDate || Date.now(),
                  ).toLocaleDateString("en-GB")}
                </p>
              </div>
              <span className="font-bold">
                {typeof p.amount === "number" ? `£${p.amount}` : p.amount}
              </span>
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
  const [isFetchingSecret, setIsFetchingSecret] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast("Payment completed successfully!", "success");
      qc.invalidateQueries({ queryKey: ["payments-tenant"] });
      qc.invalidateQueries({ queryKey: ["tenant-dashboard"] });
      window.history.replaceState({}, "", "/payments");
    }
  }, [toast, qc]);

  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["tenant-dashboard"],
    queryFn: tenantService.getDashboard,
    enabled: !!user && user.role === "tenant",
    refetchOnMount: "always",
    staleTime: 0,
  });

  const { data: tenantPayments = [], isLoading: isPaymentsLoading } = useQuery({
    queryKey: ["payments-tenant"],
    queryFn: paymentService.getMyPayments,
    enabled: !!user && user.role === "tenant",
    refetchOnMount: "always",
    staleTime: 0,
  });

  const isLoading = isDashboardLoading || isPaymentsLoading;
  const upcomingRent = dashboard?.upcoming || dashboard?.upcomingRent;
  console.log("Tenant Payments Page - dashboard data:", dashboard);
  console.log("Tenant Payments Page - upcomingRent:", upcomingRent);
  const formatAmount = (amount?: number, currency = "£") =>
    amount ? `${currency}${amount.toLocaleString()}` : "N/A";

  const getUpcomingDisplayDate = () => {
    if (!upcomingRent) return "";
    const isPaid = upcomingRent.status?.toLowerCase() === "paid";
    const dateObj = new Date(upcomingRent.dueDate);
    if (isPaid) {
      dateObj.setMonth(dateObj.getMonth() + 1);
    }
    return dateObj.toLocaleDateString("en-GB");
  };

  const handleStartPayment = async () => {
    const paymentId =
      upcomingRent?.rentPaymentId ||
      upcomingRent?.paymentId ||
      upcomingRent?.id ||
      upcomingRent?._id;
    if (!paymentId) return;

    router.push(
      `/payments/checkout/${paymentId}?amount=${upcomingRent.amount}`,
    );
  };

  if (!isDashboardLoading && !dashboard) {
    return (
      <div className="animate-in">
        <PageTitle title="Payments" subtitle="Pay rent and view your history" />
        <Card className="mt-4 p-8 text-center">
          <EmptyState
            icon={AlertTriangle}
            title="No Active Lease Found"
            message="You currently do not have an active lease agreement linked to your account. Please contact your landlord to set up your lease."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <PageTitle title="Payments" subtitle="Pay rent and view your history" />

      <div
        className="overflow-hidden rounded-2xl p-6 text-white"
        style={{ background: "linear-gradient(120deg,#008577,#00574b)" }}
      >
        <p className="text-sm text-white/80">
          {upcomingRent && upcomingRent.status?.toLowerCase() !== "paid"
            ? `Monthly Rent · Due ${new Date(upcomingRent.dueDate).toLocaleDateString("en-GB")}`
            : "Monthly Rent"}
        </p>
        <p className="mt-1 text-4xl font-extrabold">
          {upcomingRent && upcomingRent.status?.toLowerCase() !== "paid"
            ? formatAmount(upcomingRent.amount)
            : dashboard?.currentRent?.amount
              ? formatAmount(dashboard.currentRent.amount)
              : "No Rent Due"}
        </p>
        <p className="mt-1 text-xs text-white/70">
          {upcomingRent?.status?.toLowerCase() === "paid"
            ? "You are all caught up! The rent invoice for this period has been paid."
            : !upcomingRent &&
              "You are all caught up! There are no pending invoices to pay."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            onClick={handleStartPayment}
            disabled={
              !upcomingRent ||
              upcomingRent.status?.toLowerCase() === "paid" ||
              isFetchingSecret
            }
            loading={isFetchingSecret}
            variant="secondary"
            className="rounded-xl px-5 py-2.5 text-sm font-bold bg-white text-primary hover:bg-white/95 disabled:opacity-50"
          >
            {upcomingRent
              ? upcomingRent.status?.toLowerCase() === "paid"
                ? "Paid"
                : "Pay with Card"
              : "No Due Balance"}
          </Button>
        </div>
      </div>

      {upcomingRent && (
        <div className="mt-5 rounded-xl bg-warning/10 p-4">
          <p className="text-sm font-semibold text-warning">
            Upcoming: Rent Payment · Due {getUpcomingDisplayDate()} ·{" "}
            {formatAmount(upcomingRent.amount)}
          </p>
        </div>
      )}

      <h3 className="mb-3 mt-6 font-bold">Payment History</h3>
      {isLoading ? (
        <Card className="p-8 text-center text-text-muted">
          Loading history...
        </Card>
      ) : tenantPayments.length === 0 ? (
        <Card>
          <EmptyState icon={Wallet} title="No history found" />
        </Card>
      ) : (
        <Card className="divide-y divide-border">
          {tenantPayments.map((p: any) => (
            <div key={p.id || p._id} className="flex items-center gap-3 p-4">
              <CheckCircle2
                className={`h-5 w-5 ${p.status === "Paid" ? "text-success" : "text-warning"}`}
              />
              <div className="flex-1">
                <p className="font-semibold">{p.title || "Rent Payment"}</p>
                <p className="text-xs text-text-muted">
                  {p.paidAt
                    ? new Date(p.paidAt).toLocaleDateString("en-GB")
                    : "Pending"}
                </p>
              </div>
              <span className="font-bold">
                {formatAmount(p.amount, p.currency)}
              </span>
              <Badge tone={paymentTone(p.status)}>{p.status}</Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
