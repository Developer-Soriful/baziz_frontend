"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button, Avatar } from "@/components/ui/primitives";
import { SearchInput, FilterChips, EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { tenantTone, type Tenant } from "@/lib/data";
import { colorFromString } from "@/lib/utils";
import { UserPlus, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantService } from "@/lib/services/tenant.service";

export default function TenantsPage() {
  const toast = useToast();
  const qc = useQueryClient();

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: tenantService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: tenantService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      toast("Tenant added", "success");
      setModal(false);
    },
    onError: () => toast("Failed to add tenant", "error"),
  });

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<
    "all" | "Active" | "Expiring" | "Overdue"
  >("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    property: "",
    rent: "",
  });

  const filtered = list.filter(
    (t: any) =>
      (!q ||
        t.name.toLowerCase().includes(q.toLowerCase()) ||
        (t.property && t.property.toLowerCase().includes(q.toLowerCase()))) &&
      (filter === "all" || t.status === filter),
  );

  const save = () => {
    if (!form.name.trim()) return toast("Enter a name", "error");
    createMutation.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone,
      property: form.property,
      rent: form.rent || "0",
      status: "Active",
    } as any);
  };

  return (
    <div className="animate-in">
      <PageTitle
        title="Current Tenants"
        subtitle="View and manage all tenants"
        action={
          <Button onClick={() => setModal(true)}>
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
          {filtered.map((t: any) => (
            <Card key={t.id || t._id} className="flex items-center gap-3 p-4">
              <Avatar name={t.name} color={colorFromString(t.name)} size={46} />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{t.name}</p>
                <p className="truncate text-xs text-text-muted">{t.property}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{t.rent}</p>
                <Badge tone={tenantTone(t.status)}>{t.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Add New Tenant"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button onClick={save} loading={createMutation.isPending}>
              Add Tenant
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Full Name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Doe"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Property">
            <Input
              value={form.property}
              onChange={(e) => setForm({ ...form, property: e.target.value })}
              placeholder="Sunset Apartments, Unit 4B"
            />
          </Field>
          <Field label="Monthly Rent">
            <Input
              value={form.rent}
              onChange={(e) => setForm({ ...form, rent: e.target.value })}
              placeholder="£1,850"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
