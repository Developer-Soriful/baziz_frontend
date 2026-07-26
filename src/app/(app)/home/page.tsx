"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Card, Badge, Progress } from "@/components/ui/primitives";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/lib/services/dashboard.service";
import { tenantService } from "@/lib/services/tenant.service";
import { maintenanceService } from "@/lib/services/maintenance.service";
import { taskService } from "@/lib/services/task.service";
import { RevenueChart } from "@/components/charts";
import { MapPanel } from "@/components/map-panel";
import { useMemo } from "react";
import { propertyService } from "@/lib/services/property.service";
import {
  portfolioStats,
  revenueByMonth,
  analyticsBars,
  upcomingSchedule,
  propertyMatches,
  recentPayments,
  propertyPins,
} from "@/lib/data";
import {
  Wallet,
  CheckCircle2,
  ArrowUpRight,
  Wrench,
  MessageSquare,
  FileText,
  Car,
  Receipt,
  AlertTriangle,
  Home as HomeIcon,
  Calendar,
  MapPin,
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  if (user?.role === "tenant") return <TenantHome />;
  return <LandlordHome />;
}

function LandlordHome() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getStats,
    enabled: !!user && user.role === "landlord",
  });

  const { data: taskResponse } = useQuery({
    queryKey: ["dashboard-tasks"],
    queryFn: () => taskService.getAll(),
    enabled: !!user && user.role === "landlord",
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: propertyService.getAll,
    enabled: !!user && user.role === "landlord",
  });

  const scheduleItems = useMemo(() => {
    if (!taskResponse?.tasks || taskResponse.tasks.length === 0) {
      return upcomingSchedule;
    }
    const items = taskResponse.tasks
      .filter((t: any) => t.status !== "completed")
      .map((t: any) => {
        const isToday =
          new Date(t.dueDate).toDateString() === new Date().toDateString();
        const timeStr = isToday
          ? "Today"
          : new Date(t.dueDate).toLocaleDateString("en-GB");

        return {
          title: t.title,
          sub: t.property?.propertyName || "General Task",
          time: timeStr,
          tone:
            t.priority === "high"
              ? ("danger" as const)
              : t.priority === "medium"
                ? ("warning" as const)
                : ("primary" as const),
          dueDate: new Date(t.dueDate),
        };
      });

    items.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    return items.slice(0, 3);
  }, [taskResponse]);

  const realPortfolio = stats?.portfolioStats || portfolioStats;
  const realRevenue = stats?.revenueByMonth || revenueByMonth;
  const realRecent = stats?.recentPayments || recentPayments;
  return (
    <div className="animate-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">Good day,</p>
          <h1 className="text-2xl font-extrabold">{user?.name} 👋</h1>
        </div>
      </div>
      {/* Portfolio overview */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {realPortfolio.map((s: any) => (
          <Card key={s.label} className="p-5">
            <div
              className="h-9 w-9 rounded-xl"
              style={{ background: `${s.accent}1a` }}
            />
            <p className="mt-3 text-sm text-text-muted">{s.label}</p>
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs text-text-faint">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">Financial Tracking</h3>
              <p className="text-xs text-text-muted">Revenue vs expenses</p>
            </div>
            <div className="flex gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber" />
                Expenses
              </span>
            </div>
          </div>
          <div className="h-60">
            <RevenueChart data={realRevenue} />
          </div>
        </Card>
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h3 className="mb-4 font-bold">Portfolio Analytics</h3>
            <div className="space-y-4">
              {analyticsBars.map((r) => (
                <div key={r.label}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-text-muted">{r.label}</span>
                    <span className="font-bold">
                      {r.display ?? `${r.value}%`}
                    </span>
                  </div>
                  <Progress value={r.value} color={r.color} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="mb-4 font-bold">Upcoming Schedule</h3>
          <div className="space-y-3">
            {scheduleItems.map((s) => (
              <div key={s.title} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{
                    background:
                      s.tone === "warning"
                        ? "#ff950022"
                        : s.tone === "danger"
                          ? "#ff3b3022"
                          : "#007aff22",
                    color:
                      s.tone === "warning"
                        ? "#ff9500"
                        : s.tone === "danger"
                          ? "#ff3b30"
                          : "#007aff",
                  }}
                >
                  {s.tone === "warning" ? (
                    <Wrench className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-text-muted">{s.sub}</p>
                </div>
                <span className="text-xs font-semibold text-primary">
                  {s.time}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold">New Matches</h3>
            <Link
              href="/marketplace"
              className="text-xs font-semibold text-primary"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {propertyMatches.map((m) => (
              <div key={m.title} className="flex items-center gap-3">
                <img
                  src={m.image}
                  alt={m.title}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.title}</p>
                  <p className="truncate text-xs text-text-muted">
                    {m.location}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary">
                  {m.price}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold">Property Map</h3>
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <MapPin className="h-3.5 w-3.5" /> {propertyPins.length}
            </span>
          </div>
          <MapPanel pins={propertyPins} />
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold">Recent Payments</h3>
          <Link
            href="/payments"
            className="flex items-center gap-1 text-xs font-semibold text-primary"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {realRecent.map((p: any) => (
            <div key={p.name} className="flex items-center gap-3 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Wallet className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-text-muted">{p.date}</p>
              </div>
              <span className="text-sm font-bold">{p.amount}</span>
              <Badge tone="success">Paid</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TenantHome() {
  const { user } = useAuth();

  const { data: myLease, isLoading: isLeaseLoading } = useQuery({
    queryKey: ["tenant-lease"],
    queryFn: tenantService.getMyLease,
    enabled: !!user && user.role === "tenant",
  });

  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["tenant-dashboard"],
    queryFn: tenantService.getDashboard,
    enabled: !!user && user.role === "tenant",
  });

  const { data: requests, isLoading: isMaintenanceLoading } = useQuery({
    queryKey: ["maintenance-requests"],
    queryFn: maintenanceService.getAll,
    enabled: !!user && user.role === "tenant",
  });

  const quick = [
    {
      label: "Report Issue",
      href: "/maintenance",
      icon: Wrench,
      color: "#008577",
    },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageSquare,
      color: "#007aff",
    },
    {
      label: "Announcements",
      href: "/documents",
      icon: FileText,
      color: "#7c3aed",
    },
    { label: "Parking", href: "/parking", icon: Car, color: "#10b981" },
    { label: "Bills", href: "/bills", icon: Receipt, color: "#f59e0b" },
    {
      label: "Complaint",
      href: "/complaints",
      icon: AlertTriangle,
      color: "#ff3b30",
    },
  ];

  const formatAmount = (amount?: number, currency = "£") =>
    amount ? `${currency}${amount.toLocaleString()}` : "0";

  const latestMaintenance = requests?.[0];

  return (
    <div className="animate-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">Good morning,</p>
          <h1 className="text-2xl font-extrabold">Welcome home 🏡</h1>
        </div>
      </div>

      {/* Your Home hero */}
      <div
        className="overflow-hidden rounded-2xl p-6 text-white"
        style={{ background: "linear-gradient(120deg,#008577,#00574b)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HomeIcon className="h-5 w-5" />
            <span className="font-bold">Your Home</span>
          </div>
          <Badge tone="neutral" className="!bg-white/20 !text-white">
            {myLease?.unit?.unitNumber || "No Unit"}
          </Badge>
        </div>
        <p className="mt-3 text-sm text-white/80">
          {myLease?.property?.propertyName || "Loading..."}
        </p>
        <p className="mt-4 text-xs text-white/70">Monthly Rent</p>
        <p className="text-3xl font-extrabold">
          {formatAmount(myLease?.rentAmount, myLease?.currency)}
        </p>
        <p className="text-xs text-white/70">Due on 1st of every month</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/payments"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary"
          >
            Pay Rent
          </Link>
          <span className="flex items-center gap-1.5 text-xs text-white/80">
            <Calendar className="h-4 w-4" /> Lease ends:{" "}
            {myLease?.leaseEnd
              ? new Date(myLease.leaseEnd).toLocaleDateString("en-GB")
              : "0"}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-white/80">
            <CheckCircle2 className="h-4 w-4" /> Status:{" "}
            {myLease?.status === "active" ? "Active" : myLease?.status || "0"}
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {quick.map((q) => (
          <Link
            key={q.label}
            href={q.href}
            className="card flex flex-col items-center gap-2 p-5 transition hover:-translate-y-0.5 hover:shadow-float"
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: `${q.color}1a`, color: q.color }}
            >
              <q.icon className="h-6 w-6" />
            </span>
            <span className="text-sm font-semibold">{q.label}</span>
          </Link>
        ))}
      </div>

      {/* Upcoming maintenance */}
      {latestMaintenance && (
        <Card className="p-5">
          <h3 className="mb-3 font-bold">Upcoming Maintenance</h3>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/12 text-warning">
              <Wrench className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold">
                {latestMaintenance.title ||
                  latestMaintenance.issueDescription ||
                  "Maintenance Request"}
              </p>
              <p className="text-xs text-text-muted">
                Status: {latestMaintenance.status}
              </p>
            </div>
            <Link
              href="/maintenance"
              className="rounded-lg border border-border-strong px-3 py-1.5 text-xs font-semibold hover:border-primary"
            >
              View
            </Link>
          </div>
        </Card>
      )}

      {/* Recent payments */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold">Recent Payments</h3>
          <Link href="/payments" className="text-xs font-semibold text-primary">
            View all
          </Link>
        </div>
        <div className="divide-y divide-border">
          {dashboard?.recentPayments?.length ? (
            dashboard.recentPayments.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 py-3">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {p.title || "Rent Payment"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {p.paidAt
                      ? new Date(p.paidAt).toLocaleDateString("en-GB")
                      : ""}
                  </p>
                </div>
                <span className="text-sm font-bold">
                  {formatAmount(p.amount, p.currency)}
                </span>
                <Badge tone="success">Paid</Badge>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-text-muted">
              No recent payments found.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
