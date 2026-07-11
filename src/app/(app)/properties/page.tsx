"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, MapPin, TrendingUp } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { SearchInput, FilterChips, EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyService } from "@/lib/services/property.service";

export default function PropertiesPage() {
  const toast = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  // Landlord-only page — tenants don't have a properties portfolio.
  useEffect(() => {
    if (user && user.role !== "landlord") router.replace("/home");
  }, [user, router]);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: propertyService.getAll,
    enabled: !!user && user.role === "landlord",
  });

  const createMutation = useMutation({
    mutationFn: propertyService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      toast("Property added", "success");
      setModal(false);
    },
    onError: () => toast("Failed to add property", "error"),
  });

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "Occupied" | "Vacant">("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "Apartment",
    address: "",
    price: "",
    value: "",
  });

  const filtered = properties.filter(
    (p: any) =>
      (!q ||
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.address.toLowerCase().includes(q.toLowerCase())) &&
      (filter === "all" || p.status === filter),
  );

  const save = () => {
    if (!form.name.trim()) return toast("Enter a property name", "error");
    createMutation.mutate({
      name: form.name,
      type: form.type,
      address: form.address,
      price: form.price || "0",
      value: form.value || "0",
      status: "Vacant",
    } as any);
  };

  if (!user || user.role !== "landlord") return null;

  return (
    <div className="animate-in">
      <PageTitle
        title="Properties"
        subtitle="Track and manage all your properties"
        action={
          <Button onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search properties..."
          className="sm:max-w-xs"
        />
        <FilterChips
          value={filter}
          onChange={setFilter}
          chips={[
            { value: "all", label: "All" },
            { value: "Occupied", label: "Occupied" },
            { value: "Vacant", label: "Vacant" },
          ]}
        />
      </div>

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-text-muted">
            Loading properties...
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={MapPin}
            title="No properties found"
            message="Try adjusting your search or filters."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p: any) => (
            <Link
              key={p.id || p._id}
              href={`/properties/${p.id || p._id}`}
              className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-float"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={
                    p.image ||
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800"
                  }
                  alt={p.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <span className="absolute left-3 top-3">
                  <Badge tone={p.status === "Occupied" ? "success" : "warning"}>
                    {p.status}
                  </Badge>
                </span>
                <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-sm font-bold text-white backdrop-blur">
                  {p.value}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold group-hover:text-primary">{p.name}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                  <MapPin className="h-3.5 w-3.5" /> {p.address}
                </p>
                <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border pt-3 text-center text-xs">
                  <div>
                    <p className="font-bold">{p.type}</p>
                    <p className="text-text-faint">Type</p>
                  </div>
                  <div>
                    <p className="font-bold">{p.size || "—"}</p>
                    <p className="text-text-faint">Size</p>
                  </div>
                  <div>
                    <p className="flex items-center justify-center gap-0.5 font-bold text-success">
                      <TrendingUp className="h-3 w-3" />
                      {p.yield || "0%"}
                    </p>
                    <p className="text-text-faint">Yield</p>
                  </div>
                  <div>
                    <p className="font-bold">
                      {(p.tenants || "").split(" ")[0] || "0"}
                    </p>
                    <p className="text-text-faint">Tenants</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Add Property"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button onClick={save} loading={createMutation.isPending}>
              Add Property
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Property Name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Sunset Apartments"
            />
          </Field>
          <Field label="Type">
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {["Apartment", "Studio", "Condo", "House", "Commercial"].map(
                (s) => (
                  <option key={s}>{s}</option>
                ),
              )}
            </Select>
          </Field>
          <Field label="Address">
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Main St, Anytown"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rent">
              <Input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="£1,850/mo"
              />
            </Field>
            <Field label="Value">
              <Input
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="£500,000"
              />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
