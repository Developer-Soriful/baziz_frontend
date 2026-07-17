"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, MapPin, TrendingUp, Home } from "lucide-react";
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
      setImageFile(null);
    },
    onError: (err: any) => {
      const backendErrors = err.response?.data?.errors;
      const msg = Array.isArray(backendErrors) && backendErrors.length > 0
        ? backendErrors.join(", ")
        : err.response?.data?.message || err.response?.data?.error?.message || "Failed to add property";
      toast(msg, "error");
    },
  });

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "Occupied" | "Vacant">("all");
  const [modal, setModal] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    propertyName: "",
    propertyType: "flat_apartment",
    tenure: "freehold",
    streetAddress: "",
    city: "",
    postcode: "",
    purchasePrice: "",
    squareFeet: "",
    bedrooms: "",
    bathrooms: "",
    ownershipPercentage: "100",
    purchaseDate: "",
    monthlyMortgagePayment: "",
    managementFeePercentage: "",
    agentName: "",
    agentPhone: "",
    agentEmail: "",
    companyAgencyName: "",
    gasSafetyExpiry: "",
    electricalSafetyExpiry: "",
    smokeAlarmExpiry: "",
    hmoLicenceExpiry: "",
    leaseEnd: "",
  });

  const filtered = properties.filter((p: any) => {
    const name = (p.propertyName || p.name || "").toLowerCase();
    const address = p.address?.streetAddress 
      ? `${p.address.streetAddress}, ${p.address.city || ""}` 
      : p.streetAddress 
        ? `${p.streetAddress}, ${p.city || ""}`
        : p.address || "";
    const matchesQuery = !q || name.includes(q.toLowerCase()) || address.toLowerCase().includes(q.toLowerCase());
    
    // Support backend occupied status or fallback vacant
    const status = p.status || (p.units?.some((u: any) => u.isOccupied) ? "Occupied" : "Vacant");
    const matchesFilter = filter === "all" || status === filter;
    
    return matchesQuery && matchesFilter;
  });

  const save = () => {
    if (!form.propertyName.trim()) return toast("Enter a property name", "error");
    if (!form.streetAddress.trim()) return toast("Enter street address", "error");
    if (!form.city.trim()) return toast("Enter city", "error");
    if (!form.postcode.trim()) return toast("Enter postcode", "error");

    if (form.ownershipPercentage && (Number(form.ownershipPercentage) <= 0 || Number(form.ownershipPercentage) > 100)) {
      return toast("Ownership percentage must be between 0.01 and 100", "error");
    }
    if (form.managementFeePercentage && (Number(form.managementFeePercentage) < 0 || Number(form.managementFeePercentage) > 100)) {
      return toast("Management fee percentage must be between 0 and 100", "error");
    }

    const fd = new FormData();
    fd.append("propertyName", form.propertyName);
    fd.append("propertyType", form.propertyType);
    fd.append("tenure", form.tenure);
    fd.append("streetAddress", form.streetAddress);
    fd.append("city", form.city);
    fd.append("postcode", form.postcode);
    
    if (form.purchasePrice) fd.append("purchasePrice", form.purchasePrice);
    if (form.squareFeet) fd.append("squareFeet", form.squareFeet);
    if (form.bedrooms) fd.append("bedrooms", form.bedrooms);
    if (form.bathrooms) fd.append("bathrooms", form.bathrooms);
    if (form.ownershipPercentage) fd.append("ownershipPercentage", form.ownershipPercentage);
    if (form.purchaseDate) fd.append("purchaseDate", new Date(form.purchaseDate).toISOString());
    if (form.monthlyMortgagePayment) fd.append("monthlyMortgagePayment", form.monthlyMortgagePayment);
    if (form.managementFeePercentage) fd.append("managementFeePercentage", form.managementFeePercentage);
    if (form.agentName) fd.append("agentName", form.agentName);
    if (form.agentPhone) fd.append("agentPhone", form.agentPhone);
    if (form.agentEmail) fd.append("agentEmail", form.agentEmail);
    if (form.companyAgencyName) fd.append("companyAgencyName", form.companyAgencyName);
    
    if (form.gasSafetyExpiry) fd.append("gasSafetyExpiry", new Date(form.gasSafetyExpiry).toISOString());
    if (form.electricalSafetyExpiry) fd.append("electricalSafetyExpiry", new Date(form.electricalSafetyExpiry).toISOString());
    if (form.smokeAlarmExpiry) fd.append("smokeAlarmExpiry", new Date(form.smokeAlarmExpiry).toISOString());
    if (form.hmoLicenceExpiry && form.propertyType === "hmo") {
      fd.append("hmoLicenceExpiry", new Date(form.hmoLicenceExpiry).toISOString());
    }
    if (form.leaseEnd) fd.append("leaseEnd", new Date(form.leaseEnd).toISOString());

    if (imageFile) {
      fd.append("propertyImage", imageFile);
    }

    createMutation.mutate(fd);
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
          {filtered.map((p: any) => {
            const name = p.propertyName || p.name || "Property";
            const addressText = p.address?.streetAddress 
              ? `${p.address.streetAddress}, ${p.address.city || ""}` 
              : p.streetAddress 
                ? `${p.streetAddress}, ${p.city || ""}` 
                : p.address || "Address";
            const image = p.propertyImage || p.image;
            
            const isOccupied = p.units?.some((u: any) => u.isOccupied) || p.status === "Occupied";
            const statusLabel = isOccupied ? "Occupied" : "Vacant";

            const val = p.purchase?.purchasePrice 
              ? `£${p.purchase.purchasePrice.toLocaleString()}` 
              : p.purchasePrice 
                ? `£${p.purchasePrice.toLocaleString()}` 
                : p.value || "£0";
            const type = p.propertyType || p.type || "Apartment";

            return (
              <Link
                key={p.id || p._id}
                href={`/properties/${p.id || p._id}`}
                className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-float"
              >
                <div className="relative h-44 overflow-hidden">
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-surface-2 text-text-muted">
                      <Home className="h-8 w-8 mb-1.5 opacity-40" />
                      <span className="text-xs font-semibold">No Image Uploaded</span>
                    </div>
                  )}
                  <span className="absolute left-3 top-3">
                    <Badge tone={isOccupied ? "success" : "warning"}>
                      {statusLabel}
                    </Badge>
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-sm font-bold text-white backdrop-blur">
                    {val}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold group-hover:text-primary">{name}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                    <MapPin className="h-3.5 w-3.5" /> {addressText}
                  </p>
                  <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border pt-3 text-center text-xs">
                    <div>
                      <p className="font-bold capitalize">{type.replace('_', ' ')}</p>
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
                        {p.units?.length || 0}
                      </p>
                      <p className="text-text-faint">Units</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
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
        <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-1">
          <p className="text-xs font-bold text-primary border-b border-border pb-1">BASIC DETAILS</p>
          <Field label="Property Name">
            <Input
              value={form.propertyName}
              onChange={(e) => setForm({ ...form, propertyName: e.target.value })}
              placeholder="Sunset Apartments"
            />
          </Field>
          <Field label="Property Image">
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                }}
                className="block w-full text-xs text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {imageFile && (
                <span className="text-xs text-success font-semibold">Selected</span>
              )}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Property Type">
              <Select
                value={form.propertyType}
                onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
              >
                <option value="flat_apartment">Flat / Apartment</option>
                <option value="studio">Studio</option>
                <option value="detached_house">Detached House</option>
                <option value="semi_detached_house">Semi-Detached House</option>
                <option value="terraced_house">Terraced House</option>
                <option value="bungalow">Bungalow</option>
                <option value="maisonette">Maisonette</option>
                <option value="hmo">HMO</option>
                <option value="commercial">Commercial</option>
                <option value="other">Other</option>
              </Select>
            </Field>
            <Field label="Tenure">
              <Select
                value={form.tenure}
                onChange={(e) => setForm({ ...form, tenure: e.target.value })}
              >
                <option value="freehold">Freehold</option>
                <option value="leasehold">Leasehold</option>
                <option value="share_of_freehold">Share of Freehold</option>
              </Select>
            </Field>
          </div>
          <Field label="Street Address">
            <Input
              value={form.streetAddress}
              onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
              placeholder="123 Main St"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City">
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Anytown"
              />
            </Field>
            <Field label="Postcode">
              <Input
                value={form.postcode}
                onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                placeholder="E1 6AN"
              />
            </Field>
          </div>

          <p className="text-xs font-bold text-primary border-b border-border pb-1 pt-2">SPECIFICATIONS</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Square Feet">
              <Input
                type="number"
                value={form.squareFeet}
                onChange={(e) => setForm({ ...form, squareFeet: e.target.value })}
                placeholder="1200"
              />
            </Field>
            <Field label="Ownership Percentage (%)">
              <Input
                type="number"
                value={form.ownershipPercentage}
                onChange={(e) => setForm({ ...form, ownershipPercentage: e.target.value })}
                placeholder="100"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bedrooms">
              <Input
                type="number"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                placeholder="2"
              />
            </Field>
            <Field label="Bathrooms">
              <Input
                type="number"
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                placeholder="2"
              />
            </Field>
          </div>

          <p className="text-xs font-bold text-primary border-b border-border pb-1 pt-2">FINANCIALS</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Purchase Price (£)">
              <Input
                type="number"
                value={form.purchasePrice}
                onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                placeholder="500000"
              />
            </Field>
            <Field label="Purchase Date">
              <Input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Monthly Mortgage (£)">
              <Input
                type="number"
                value={form.monthlyMortgagePayment}
                onChange={(e) => setForm({ ...form, monthlyMortgagePayment: e.target.value })}
                placeholder="1500"
              />
            </Field>
            <Field label="Management Fee (%)">
              <Input
                type="number"
                value={form.managementFeePercentage}
                onChange={(e) => setForm({ ...form, managementFeePercentage: e.target.value })}
                placeholder="10"
              />
            </Field>
          </div>

          <p className="text-xs font-bold text-primary border-b border-border pb-1 pt-2">MANAGEMENT CONTACT</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Agent Name">
              <Input
                value={form.agentName}
                onChange={(e) => setForm({ ...form, agentName: e.target.value })}
                placeholder="John Smith"
              />
            </Field>
            <Field label="Agency Company">
              <Input
                value={form.companyAgencyName}
                onChange={(e) => setForm({ ...form, companyAgencyName: e.target.value })}
                placeholder="Levin Property Management"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Agent Phone">
              <Input
                value={form.agentPhone}
                onChange={(e) => setForm({ ...form, agentPhone: e.target.value })}
                placeholder="+44 20 7123 4567"
              />
            </Field>
            <Field label="Agent Email">
              <Input
                value={form.agentEmail}
                onChange={(e) => setForm({ ...form, agentEmail: e.target.value })}
                placeholder="john.smith@example.com"
              />
            </Field>
          </div>

          <p className="text-xs font-bold text-primary border-b border-border pb-1 pt-2">SAFETY & COMPLIANCE</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Gas Safety CP12 Expiry">
              <Input
                type="date"
                value={form.gasSafetyExpiry}
                onChange={(e) => setForm({ ...form, gasSafetyExpiry: e.target.value })}
              />
            </Field>
            <Field label="Electrical Safety EICR Expiry">
              <Input
                type="date"
                value={form.electricalSafetyExpiry}
                onChange={(e) => setForm({ ...form, electricalSafetyExpiry: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Smoke Alarm Check Expiry">
              <Input
                type="date"
                value={form.smokeAlarmExpiry}
                onChange={(e) => setForm({ ...form, smokeAlarmExpiry: e.target.value })}
              />
            </Field>
            <Field label="Lease End Date">
              <Input
                type="date"
                value={form.leaseEnd}
                onChange={(e) => setForm({ ...form, leaseEnd: e.target.value })}
              />
            </Field>
          </div>
          {form.propertyType === "hmo" && (
            <Field label="HMO Licence Expiry Date">
              <Input
                type="date"
                value={form.hmoLicenceExpiry}
                onChange={(e) => setForm({ ...form, hmoLicenceExpiry: e.target.value })}
              />
            </Field>
          )}
        </div>
      </Modal>
    </div>
  );
}
