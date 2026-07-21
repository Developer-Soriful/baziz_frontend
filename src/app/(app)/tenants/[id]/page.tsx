"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button, Avatar } from "@/components/ui/primitives";
import { Field, Input, Select } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { tenantTone } from "@/lib/data";
import { colorFromString } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  ShieldAlert,
  Trash2,
  User,
  Car,
  Copy,
  Send,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantService } from "@/lib/services/tenant.service";
import { propertyService } from "@/lib/services/property.service";
import { chatService } from "@/lib/services/chat.service";
import { useAuth } from "@/lib/auth";

export default function TenantDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role !== "landlord") {
      router.replace("/home");
    }
  }, [user, router]);

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: tenantService.getAll,
    enabled: !!user && user.role === "landlord",
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: propertyService.getAll,
    enabled: !!user && user.role === "landlord",
  });

  const tenant = list.find((t: any) => (t._id || t.id) === id);

  const [editModal, setEditModal] = useState(false);

  const [form, setForm] = useState({
    tenantFullName: "",
    tenantEmail: "",
    tenantPhone: "",
    propertyId: "",
    unitId: "",
    rentAmount: "",
    securityDeposit: "",
    paymentFrequency: "monthly",
    paymentDueDay: "1",
    leaseStartDate: "",
    leaseEndDate: "",
    numberOfParkingSpots: "0",
  });

  const openEdit = () => {
    if (!tenant) return;
    setForm({
      tenantFullName: tenant.tenantFullName || tenant.name || "",
      tenantEmail: tenant.tenantEmail || tenant.email || "",
      tenantPhone: tenant.tenantPhone || tenant.phone || "",
      propertyId: tenant.propertyId?._id || tenant.propertyId || "",
      unitId: tenant.unitId?._id || tenant.unitId || "",
      rentAmount: String(tenant.rentAmount || ""),
      securityDeposit: String(tenant.securityDeposit || ""),
      paymentFrequency: tenant.paymentFrequency || "monthly",
      paymentDueDay: String(tenant.paymentDueDay || "1"),
      leaseStartDate: tenant.leaseStartDate
        ? new Date(tenant.leaseStartDate).toISOString().split("T")[0]
        : "",
      leaseEndDate: tenant.leaseEndDate
        ? new Date(tenant.leaseEndDate).toISOString().split("T")[0]
        : "",
      numberOfParkingSpots: String(tenant.numberOfParkingSpots || "0"),
    });
    setEditModal(true);
  };

  const updateMutation = useMutation({
    mutationFn: (args: { id: string; data: any }) =>
      tenantService.update(args.id, args.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      toast("Tenant details updated successfully", "success");
      setEditModal(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to update tenant";
      toast(msg, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tenantService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      toast("Tenant deleted successfully", "success");
      router.push("/tenants");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to delete tenant";
      toast(msg, "error");
    },
  });

  const startChatMutation = useMutation({
    mutationFn: (data: { propertyId: string; tenantId: string }) =>
      chatService.createDirectConversation(data.propertyId, data.tenantId),
    onSuccess: (convo) => {
      router.push(`/messages/${convo.id || convo._id}`);
    },
    onError: () => toast("Failed to open chat", "error"),
  });

  const resendInviteMutation = useMutation({
    mutationFn: (leaseId: string) => tenantService.resendInvitation(leaseId),
    onSuccess: () => {
      toast("Invitation email resent successfully", "success");
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || "Failed to resend invitation";
      toast(msg, "error");
    },
  });

  const saveEdit = () => {
    if (!form.tenantFullName.trim()) return toast("Enter tenant name", "error");
    if (!form.tenantEmail.trim()) return toast("Enter tenant email", "error");
    if (!form.tenantPhone.trim()) return toast("Enter tenant phone", "error");

    const payload = {
      propertyId: form.propertyId,
      unitId: form.unitId,
      tenantFullName: form.tenantFullName,
      tenantEmail: form.tenantEmail,
      tenantPhone: form.tenantPhone,
      rentAmount: Number(form.rentAmount),
      securityDeposit: Number(form.securityDeposit || form.rentAmount),
      paymentFrequency: form.paymentFrequency,
      paymentDueDay: Number(form.paymentDueDay),
      leaseStartDate: new Date(form.leaseStartDate).toISOString(),
      leaseEndDate: new Date(form.leaseEndDate).toISOString(),
      numberOfParkingSpots: Number(form.numberOfParkingSpots),
    };

    updateMutation.mutate({ id, data: payload });
  };

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this tenant and terminate their lease agreement? This action cannot be undone."
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-text-muted">
        Loading tenant details...
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => router.push("/tenants")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tenants
        </Button>
        <Card className="p-8 text-center text-text-muted">
          Tenant record not found.
        </Card>
      </div>
    );
  }

  const name = tenant.tenantFullName || tenant.name || "Tenant";
  const email = tenant.tenantEmail || tenant.email || "—";
  const phone = tenant.tenantPhone || tenant.phone || "—";
  const status = tenant.status || "Active";
  const propertyName =
    tenant.propertyId?.propertyName || tenant.property || "Property";
  const unitNumber =
    tenant.unitId?.unitNumber || tenant.unitNumber || tenant.unit || "—";
  const rent =
    tenant.rentAmount !== undefined
      ? `£${tenant.rentAmount.toLocaleString()}`
      : tenant.rent || "—";
  const deposit =
    tenant.securityDeposit !== undefined
      ? `£${tenant.securityDeposit.toLocaleString()}`
      : "—";

  const tenantId = tenant.tenantId?._id || tenant.tenantId;
  const propertyId = tenant.propertyId?._id || tenant.propertyId;
  const hasIds = !!tenantId && !!propertyId;
  const signupLink = `${typeof window !== "undefined" ? window.location.origin : ""}/tenant/signup?leaseId=${id}`;

  const selectedProperty = properties.find(
    (p: any) => (p.id || p._id) === form.propertyId
  );
  const units = selectedProperty?.units || [];

  return (
    <div className="space-y-6 animate-in">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            className="rounded-xl p-2.5"
            onClick={() => router.push("/tenants")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar name={name} color={colorFromString(name)} size={52} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-text-main">
                  {name}
                </h1>
                <Badge tone={tenantTone(status)}>{status}</Badge>
              </div>
              <p className="text-sm text-text-muted">
                {propertyName} — Unit {unitNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {hasIds && (
            <Button
              onClick={() =>
                startChatMutation.mutate({ propertyId, tenantId })
              }
              loading={startChatMutation.isPending}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" /> Send Message
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(signupLink);
              toast("Invitation link copied to clipboard", "success");
            }}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" /> Copy Signup Link
          </Button>

          <Button
            variant="secondary"
            onClick={openEdit}
            className="flex items-center gap-2 text-info hover:text-info"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Button>

          <Button
            variant="secondary"
            onClick={handleDelete}
            loading={deleteMutation.isPending}
            className="flex items-center gap-2 text-danger hover:text-danger"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Monthly Rent</p>
            <p className="text-xl font-extrabold text-text-main">{rent}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="rounded-xl bg-info/10 p-3 text-info">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Security Deposit</p>
            <p className="text-xl font-extrabold text-text-main">{deposit}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="rounded-xl bg-warning/10 p-3 text-warning">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Payment Due</p>
            <p className="text-xl font-extrabold text-text-main">
              Day {tenant.paymentDueDay || 1}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="rounded-xl bg-success/10 p-3 text-success">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Parking Spots</p>
            <p className="text-xl font-extrabold text-text-main">
              {tenant.numberOfParkingSpots || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Personal & Contact Details */}
        <Card className="p-5 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2 border-b border-border pb-3">
            <User className="h-4 w-4 text-primary" /> Personal Information
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-text-muted">Full Name</p>
              <p className="font-semibold text-text-main">{name}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Email Address</p>
              <p className="font-semibold text-text-main flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5 text-text-muted" /> {email}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Phone Number</p>
              <p className="font-semibold text-text-main flex items-center gap-1.5 mt-0.5">
                <Phone className="h-3.5 w-3.5 text-text-muted" /> {phone}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Account Registration</p>
              <div className="mt-1">
                {tenant.tenantId ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                    <CheckCircle className="h-3.5 w-3.5" /> Registered User
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning">
                    <Clock className="h-3.5 w-3.5" /> Pending Registration
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Property & Lease Details */}
        <Card className="p-5 space-y-4 lg:col-span-2">
          <h2 className="text-base font-bold flex items-center gap-2 border-b border-border pb-3">
            <Building2 className="h-4 w-4 text-primary" /> Lease & Property Information
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-xs text-text-muted">Property Name</p>
              <p className="font-semibold text-text-main">{propertyName}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Unit Number</p>
              <p className="font-semibold text-text-main">{unitNumber}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Payment Frequency</p>
              <p className="font-semibold text-text-main capitalize">
                {tenant.paymentFrequency || "monthly"}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Payment Due Day</p>
              <p className="font-semibold text-text-main">
                Day {tenant.paymentDueDay || 1} of each month
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Lease Start Date</p>
              <p className="font-semibold text-text-main">
                {tenant.leaseStartDate
                  ? new Date(tenant.leaseStartDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Lease End Date</p>
              <p className="font-semibold text-text-main">
                {tenant.leaseEndDate
                  ? new Date(tenant.leaseEndDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          {/* Invitation / Registration details box */}
          <div className="mt-4 rounded-xl bg-surface-subtle p-4 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Tenant Signup Link
              </span>
              {!tenant.tenantId && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => resendInviteMutation.mutate(id)}
                  loading={resendInviteMutation.isPending}
                  className="text-xs"
                >
                  <Send className="h-3.5 w-3.5 mr-1" /> Resend Invite Email
                </Button>
              )}
            </div>
            <div className="rounded-lg bg-background p-2.5 border border-border flex items-center justify-between gap-2">
              <code className="text-xs text-primary truncate">{signupLink}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(signupLink);
                  toast("Link copied!", "success");
                }}
                className="text-text-muted hover:text-text-main transition p-1"
                title="Copy Link"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Tenant Details"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} loading={updateMutation.isPending}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-1">
          <Field label="Tenant Full Name">
            <Input
              value={form.tenantFullName}
              onChange={(e) =>
                setForm({ ...form, tenantFullName: e.target.value })
              }
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <Input
                value={form.tenantEmail}
                onChange={(e) =>
                  setForm({ ...form, tenantEmail: e.target.value })
                }
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.tenantPhone}
                onChange={(e) =>
                  setForm({ ...form, tenantPhone: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Select Property">
              <Select
                value={form.propertyId}
                onChange={(e) =>
                  setForm({ ...form, propertyId: e.target.value, unitId: "" })
                }
              >
                <option value="">-- Select Property --</option>
                {properties.map((p: any) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.propertyName || p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Select Unit">
              <Select
                value={form.unitId}
                onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                disabled={!form.propertyId}
              >
                <option value="">-- Select Unit --</option>
                {units.map((u: any) => (
                  <option key={u._id || u.id} value={u._id || u.id}>
                    {u.unitNumber} {u.isOccupied ? "(Occupied)" : ""}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Monthly Rent (£)">
              <Input
                type="number"
                value={form.rentAmount}
                onChange={(e) =>
                  setForm({ ...form, rentAmount: e.target.value })
                }
              />
            </Field>
            <Field label="Security Deposit (£)">
              <Input
                type="number"
                value={form.securityDeposit}
                onChange={(e) =>
                  setForm({ ...form, securityDeposit: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Payment Frequency">
              <Select
                value={form.paymentFrequency}
                onChange={(e) =>
                  setForm({ ...form, paymentFrequency: e.target.value })
                }
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </Field>
            <Field label="Payment Due Day">
              <Input
                type="number"
                value={form.paymentDueDay}
                onChange={(e) =>
                  setForm({ ...form, paymentDueDay: e.target.value })
                }
                min="1"
                max="31"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Lease Start Date">
              <Input
                type="date"
                value={form.leaseStartDate}
                onChange={(e) =>
                  setForm({ ...form, leaseStartDate: e.target.value })
                }
              />
            </Field>
            <Field label="Lease End Date">
              <Input
                type="date"
                value={form.leaseEndDate}
                onChange={(e) =>
                  setForm({ ...form, leaseEndDate: e.target.value })
                }
              />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
