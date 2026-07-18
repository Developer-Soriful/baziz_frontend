"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button, Avatar } from "@/components/ui/primitives";
import { SearchInput, FilterChips, EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { tenantTone, type Tenant } from "@/lib/data";
import { colorFromString } from "@/lib/utils";
import { UserPlus, Users, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantService } from "@/lib/services/tenant.service";
import { chatService } from "@/lib/services/chat.service";
import { propertyService } from "@/lib/services/property.service";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

export default function TenantsPage() {
  const toast = useToast();
  const router = useRouter();
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

  const [invitedLink, setInvitedLink] = useState<string | null>(null);
  const [editingLeaseId, setEditingLeaseId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: tenantService.create,
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      toast("Tenant invitation sent", "success");
      setModal(false);
      const leaseId = res.data?.leaseId || res.leaseId;
      if (leaseId) {
        setInvitedLink(`${window.location.origin}/tenant/signup?leaseId=${leaseId}`);
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || "Failed to invite tenant";
      toast(msg, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (args: { id: string; data: any }) => tenantService.update(args.id, args.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      toast("Tenant details updated successfully", "success");
      setModal(false);
      setEditingLeaseId(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to update tenant";
      toast(msg, "error");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: tenantService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      toast("Tenant deleted successfully", "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to delete tenant";
      toast(msg, "error");
    }
  });

  const startChatMutation = useMutation({
    mutationFn: (data: { propertyId: string; tenantId: string }) =>
      chatService.createDirectConversation(data.propertyId, data.tenantId),
    onSuccess: (convo) => {
      router.push(`/messages/${convo.id || convo._id}`);
    },
    onError: () => toast("Failed to open chat", "error"),
  });

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<
    "all" | "Active" | "Expiring" | "Overdue"
  >("all");
  const [modal, setModal] = useState(false);
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
    leaseStartDate: new Date().toISOString().split("T")[0],
    leaseEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
    numberOfParkingSpots: "0",
  });

  const filtered = list.filter((t: any) => {
    const name = (t.tenantFullName || t.name || "").toLowerCase();
    const property = (t.propertyId?.propertyName || t.property || "").toLowerCase();
    const matchesQuery = !q || name.includes(q.toLowerCase()) || property.includes(q.toLowerCase());
    
    const tStatus = (t.status || "").toLowerCase();
    let matchesFilter = filter === "all";
    if (filter === "Active") {
      matchesFilter = tStatus === "active" || tStatus === "accepted";
    } else if (filter === "Expiring") {
      matchesFilter = tStatus === "expiring";
    } else if (filter === "Overdue") {
      matchesFilter = tStatus === "overdue";
    }
    
    return matchesQuery && matchesFilter;
  });
  const startEdit = (t: any) => {
    setEditingLeaseId(t._id || t.id);
    setForm({
      tenantFullName: t.tenantFullName || "",
      tenantEmail: t.tenantEmail || "",
      tenantPhone: t.tenantPhone || "",
      propertyId: t.propertyId?._id || t.propertyId || "",
      unitId: t.unitId || "",
      rentAmount: String(t.rentAmount || ""),
      securityDeposit: String(t.securityDeposit || ""),
      paymentFrequency: t.paymentFrequency || "monthly",
      paymentDueDay: String(t.paymentDueDay || "1"),
      leaseStartDate: t.leaseStartDate ? new Date(t.leaseStartDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      leaseEndDate: t.leaseEndDate ? new Date(t.leaseEndDate).toISOString().split("T")[0] : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      numberOfParkingSpots: String(t.numberOfParkingSpots || "0"),
    });
    setModal(true);
  };

  const startDelete = (leaseId: string) => {
    if (confirm("Are you sure you want to delete this tenant and terminate their lease agreement? This action cannot be undone.")) {
      deleteMutation.mutate(leaseId);
    }
  };
  const save = () => {
    if (!form.tenantFullName.trim()) return toast("Enter tenant full name", "error");
    if (!form.tenantEmail.trim()) return toast("Enter tenant email", "error");
    if (!form.tenantPhone.trim()) return toast("Enter tenant phone", "error");
    if (!form.propertyId) return toast("Select a property", "error");
    if (!form.unitId) return toast("Select a unit", "error");
    if (!form.rentAmount) return toast("Enter rent amount", "error");

    const payload = {
      propertyId: form.propertyId,
      unitId: form.unitId,
      tenantFullName: form.tenantFullName,
      tenantEmail: form.tenantEmail,
      tenantPhone: form.tenantPhone,
      rentAmount: Number(form.rentAmount),
      securityDeposit: Number(form.securityDeposit || form.rentAmount),
      paymentFrequency: form.paymentFrequency as any,
      paymentDueDay: Number(form.paymentDueDay),
      leaseStartDate: new Date(form.leaseStartDate).toISOString(),
      leaseEndDate: new Date(form.leaseEndDate).toISOString(),
      numberOfParkingSpots: Number(form.numberOfParkingSpots),
      parkingBayNumbers: [],
    } as any;

    if (editingLeaseId) {
      updateMutation.mutate({ id: editingLeaseId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const selectedProperty = properties.find((p: any) => (p.id || p._id) === form.propertyId);
  const units = selectedProperty?.units || [];

  if (!user || user.role !== "landlord") return null;

  return (
    <div className="animate-in">
      <PageTitle
        title="Current Tenants"
        subtitle="View and manage all tenants"
        action={
          <Button onClick={() => {
            setEditingLeaseId(null);
            setForm({
              tenantFullName: "",
              tenantEmail: "",
              tenantPhone: "",
              propertyId: "",
              unitId: "",
              rentAmount: "",
              securityDeposit: "",
              paymentFrequency: "monthly",
              paymentDueDay: "1",
              leaseStartDate: new Date().toISOString().split("T")[0],
              leaseEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
              numberOfParkingSpots: "0",
            });
            setModal(true);
          }}>
            <UserPlus className="h-4 w-4" /> Add Tenant
          </Button>
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search tenants..."
          className="sm:max-w-xs"
        />
        <FilterChips
          value={filter}
          onChange={setFilter}
          chips={[
            { value: "all", label: "All" },
            { value: "Active", label: "Active" },
            { value: "Expiring", label: "Expiring" },
            { value: "Overdue", label: "Overdue" },
          ]}
        />
      </div>
      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-text-muted">
            Loading tenants...
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={Users} title="No tenants found" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((t: any) => {
            const name = t.tenantFullName || t.name || "Tenant";
            const propertyName = t.propertyId?.propertyName || t.property || "Property";
            const rent = t.rentAmount !== undefined ? `£${t.rentAmount.toLocaleString()}` : t.rent;
            const status = t.status || "Active";
            const tenantId = t.tenantId?._id || t.tenantId;
            const propertyId = t.propertyId?._id || t.propertyId;
            const hasIds = !!tenantId && !!propertyId;

            return (
              <Card key={t.id || t._id} className="flex items-center gap-3 p-4">
                <Avatar name={name} color={colorFromString(name)} size={46} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{name}</p>
                  <p className="truncate text-xs text-text-muted">{propertyName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">{rent}</p>
                    <Badge tone={tenantTone(status)}>{status}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasIds && (
                      <button
                        onClick={() => startChatMutation.mutate({ propertyId, tenantId })}
                        disabled={startChatMutation.isPending}
                        className="rounded-xl bg-primary/10 p-2.5 text-primary hover:bg-primary/20 transition disabled:opacity-50"
                        title="Send Message"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(t)}
                      className="rounded-xl bg-info/10 p-2.5 text-info hover:bg-info/20 transition"
                      title="Edit Tenant"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => startDelete(t.id || t._id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-xl bg-danger/10 p-2.5 text-danger hover:bg-danger/20 transition disabled:opacity-50"
                      title="Delete Tenant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editingLeaseId ? "Edit Tenant Details" : "Invite New Tenant"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button onClick={save} loading={editingLeaseId ? updateMutation.isPending : createMutation.isPending}>
              {editingLeaseId ? "Save Changes" : "Send Invitation"}
            </Button>
          </>
        }
      >
        <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-1">
          <Field label="Tenant Full Name">
            <Input
              value={form.tenantFullName}
              onChange={(e) => setForm({ ...form, tenantFullName: e.target.value })}
              placeholder="Jane Doe"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <Input
                value={form.tenantEmail}
                onChange={(e) => setForm({ ...form, tenantEmail: e.target.value })}
                placeholder="jane@example.com"
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.tenantPhone}
                onChange={(e) => setForm({ ...form, tenantPhone: e.target.value })}
                placeholder="+44 7700 900000"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Select Property">
              <Select
                value={form.propertyId}
                onChange={(e) => setForm({ ...form, propertyId: e.target.value, unitId: "" })}
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
                onChange={(e) => setForm({ ...form, rentAmount: e.target.value })}
                placeholder="1850"
              />
            </Field>
            <Field label="Security Deposit (£)">
              <Input
                type="number"
                value={form.securityDeposit}
                onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })}
                placeholder="1850"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Payment Frequency">
              <Select
                value={form.paymentFrequency}
                onChange={(e) => setForm({ ...form, paymentFrequency: e.target.value })}
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
                onChange={(e) => setForm({ ...form, paymentDueDay: e.target.value })}
                placeholder="1"
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
                onChange={(e) => setForm({ ...form, leaseStartDate: e.target.value })}
              />
            </Field>
            <Field label="Lease End Date">
              <Input
                type="date"
                value={form.leaseEndDate}
                onChange={(e) => setForm({ ...form, leaseEndDate: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!invitedLink}
        onClose={() => setInvitedLink(null)}
        title="Tenant Invitation Created"
        footer={
          <Button onClick={() => setInvitedLink(null)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            The tenant invitation was created successfully! Share the registration link below with your tenant so they can sign up under this lease agreement:
          </p>
          <div className="rounded-xl bg-primary/5 p-3 border border-primary/10">
            <code className="text-xs break-all block text-primary select-all">
              {invitedLink}
            </code>
          </div>
          <Button
            variant="secondary"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              if (invitedLink) {
                navigator.clipboard.writeText(invitedLink);
                toast("Invitation link copied to clipboard!", "success");
              }
            }}
          >
            Copy Link
          </Button>
        </div>
      </Modal>
    </div>
  );
}
