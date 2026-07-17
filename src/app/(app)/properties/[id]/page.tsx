"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { PillTabs, EmptyState } from "@/components/ui/misc";
import { SimpleBar, DonutPie } from "@/components/charts";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { gbp } from "@/lib/utils";
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  TrendingUp,
  MessageSquare,
  Home,
  Plus,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { propertyService } from "@/lib/services/property.service";
import { chatService } from "@/lib/services/chat.service";
import { useAuth } from "@/lib/auth";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"Details" | "Units" | "Tenants" | "Expenses" | "ROI">(
    "Details",
  );

  const [unitModal, setUnitModal] = useState(false);
  const [unitForm, setUnitForm] = useState({
    unitNumber: "",
    floor: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    rentAmount: "",
    notes: "",
  });

  const { data: realProperty, isLoading: isPropertyLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyService.getById(id),
    enabled: !!id,
  });

  const { data: dbTenants = [], isLoading: isLoadingTenants } = useQuery({
    queryKey: ["property-tenants", id],
    queryFn: () => propertyService.getCurrentTenants(id),
    enabled: !!id,
  });

  const { data: dbExpenses = [] } = useQuery({
    queryKey: ["property-expenses", id],
    queryFn: () => propertyService.getExpenses(id),
    enabled: !!id && (tab === "Expenses" || tab === "ROI"),
  });

  const { data: dbExpensesReport } = useQuery({
    queryKey: ["property-expenses-report", id],
    queryFn: () => propertyService.getExpensesReport(id, "category"),
    enabled: !!id && (tab === "Expenses" || tab === "ROI"),
  });

  const startChatMutation = useMutation({
    mutationFn: (data: { propertyId: string; tenantId: string }) =>
      chatService.createDirectConversation(data.propertyId, data.tenantId),
    onSuccess: (convo) => {
      router.push(`/messages/${convo.id || convo._id}`);
    },
    onError: () => toast("Failed to open chat", "error"),
  });

  const addUnitMutation = useMutation({
    mutationFn: (data: any) => propertyService.addUnit(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property", id] });
      toast("Unit added successfully", "success");
      setUnitModal(false);
      setUnitForm({
        unitNumber: "",
        floor: "",
        bedrooms: "",
        bathrooms: "",
        squareFeet: "",
        rentAmount: "",
        notes: "",
      });
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Failed to add unit";
      toast(msg, "error");
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: (unitId: string) => propertyService.deleteUnit(id, unitId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property", id] });
      toast("Unit deleted successfully", "success");
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Failed to delete unit";
      toast(msg, "error");
    },
  });

  if (isPropertyLoading) {
    return (
      <div className="p-8 text-center text-text-muted">
        Loading property details...
      </div>
    );
  }

  if (!realProperty) {
    return (
      <div className="p-8 text-center text-text-muted">Property not found</div>
    );
  }

  const displayTitle = realProperty.propertyName || "Property";
  const displayAddress = realProperty.address?.streetAddress
    ? `${realProperty.address.streetAddress}, ${realProperty.address.city || ""}`
    : realProperty.streetAddress
      ? `${realProperty.streetAddress}, ${realProperty.city || ""}`
      : "Address not set";

  const displayType = realProperty.propertyType || "flat_apartment";
  const displayValue = realProperty.purchasePrice
    ? `£${realProperty.purchasePrice.toLocaleString()}`
    : "—";

  const displayImage = realProperty.propertyImage || realProperty.image;
  const isOccupied = realProperty.units?.some((u: any) => u.isOccupied);
  const statusLabel = isOccupied ? "Occupied" : "Vacant";

  // Financial specs
  const annualRent =
    (realProperty.units || []).reduce(
      (acc: number, u: any) => acc + (u.rentAmount || 0),
      0,
    ) * 12;
  const purchasePriceVal = realProperty.purchasePrice || 0;
  const computedYield =
    purchasePriceVal > 0
      ? ((annualRent / purchasePriceVal) * 100).toFixed(2) + "%"
      : "—";
  const monthlyRentVal = (realProperty.units || []).reduce(
    (acc: number, u: any) => acc + (u.rentAmount || 0),
    0,
  );

  const realDetails: [string, string][] = [
    ["Rental Yield", computedYield],
    [
      "Monthly Rent",
      monthlyRentVal > 0 ? gbp(monthlyRentVal, { decimals: true }) : "—",
    ],
    ["Purchase Cost", purchasePriceVal > 0 ? gbp(purchasePriceVal) : "—"],
    [
      "Purchase Date",
      realProperty.purchaseDate
        ? new Date(realProperty.purchaseDate).toLocaleDateString("en-GB")
        : "—",
    ],
    [
      "Tenure",
      realProperty.tenure ? realProperty.tenure.replace("_", " ") : "—",
    ],
    [
      "Mortgage",
      realProperty.monthlyMortgagePayment
        ? gbp(realProperty.monthlyMortgagePayment)
        : "—",
    ],
    [
      "% Management Fees",
      realProperty.managementFeePercentage
        ? `${realProperty.managementFeePercentage}%`
        : "—",
    ],
    [
      "Property Type",
      realProperty.propertyType
        ? realProperty.propertyType.replace("_", " ")
        : "—",
    ],
    [
      "Size",
      realProperty.squareFeet ? `${realProperty.squareFeet} sq ft` : "—",
    ],
    [
      "Bedrooms",
      (
        realProperty.bedrooms ||
        (realProperty.units || []).reduce(
          (a: number, u: any) => a + (u.bedrooms || 0),
          0,
        ) ||
        "—"
      ).toString(),
    ],
    [
      "Bathrooms",
      (
        realProperty.bathrooms ||
        (realProperty.units || []).reduce(
          (a: number, u: any) => a + (u.bathrooms || 0),
          0,
        ) ||
        "—"
      ).toString(),
    ],
    [
      "Ownership",
      realProperty.ownershipPercentage
        ? `${realProperty.ownershipPercentage}%`
        : "—",
    ],
  ];

  const getCertStatus = (expiryDateStr: string | null | undefined) => {
    if (!expiryDateStr)
      return { status: "Not Provided", tone: "neutral" as const };
    const date = new Date(expiryDateStr);
    const isExpired = date.getTime() < Date.now();
    return {
      status: isExpired ? "Expired" : "Valid",
      tone: isExpired ? ("danger" as const) : ("success" as const),
    };
  };

  const formattedCerts = [
    {
      name: "Gas Safety Certificate (CP12)",
      date: realProperty.gasSafetyExpiry
        ? new Date(realProperty.gasSafetyExpiry).toLocaleDateString("en-GB")
        : "—",
      ...getCertStatus(realProperty.gasSafetyExpiry),
    },
    {
      name: "Electrical Safety (EICR)",
      date: realProperty.electricalSafetyExpiry
        ? new Date(realProperty.electricalSafetyExpiry).toLocaleDateString(
            "en-GB",
          )
        : "—",
      ...getCertStatus(realProperty.electricalSafetyExpiry),
    },
    {
      name: "Smoke Alarm Check",
      date: realProperty.smokeAlarmExpiry
        ? new Date(realProperty.smokeAlarmExpiry).toLocaleDateString("en-GB")
        : "—",
      ...getCertStatus(realProperty.smokeAlarmExpiry),
    },
    ...(realProperty.propertyType === "hmo"
      ? [
          {
            name: "HMO Licence",
            date: realProperty.hmoLicenceExpiry
              ? new Date(realProperty.hmoLicenceExpiry).toLocaleDateString(
                  "en-GB",
                )
              : "—",
            ...getCertStatus(realProperty.hmoLicenceExpiry),
          },
        ]
      : []),
  ];

  const managerName = realProperty.agentName || user?.name || "Landlord (Self-Managed)";

  const agencyName =
    realProperty.companyAgencyName || (realProperty.agentName ? "Independent Agent" : "Self-Managed");

  const managerPhone = realProperty.agentPhone || (user as any)?.phone || "—";

  const managerEmail = realProperty.agentEmail || user?.email || "—";

  const categoryColors: Record<string, string> = {
    repairs: "#008577",
    utilities: "#10b981",
    taxes: "#fbbf24",
    insurance: "#f87171",
    maintenance: "#818cf8",
    management: "#7c3aed",
    other: "#06b6d4",
  };

  const chartData =
    dbExpensesReport?.breakdown && dbExpensesReport.breakdown.length > 0
      ? dbExpensesReport.breakdown.map((b: any) => ({
          name: b.category,
          value: b.amount,
          color: categoryColors[b.category.toLowerCase()] || "#818cf8",
        }))
      : [];

  const totalExpensesAmount = dbExpensesReport?.totalAmount || 0;

  // ROI calculations
  const annualExpenses = dbExpensesReport?.totalAmount || 0;
  const noi = annualRent - annualExpenses;
  const capRate =
    purchasePriceVal > 0
      ? ((noi / purchasePriceVal) * 100).toFixed(2) + "%"
      : "—";

  const downPayment = purchasePriceVal * 0.25;
  const purchaseCosts = purchasePriceVal * 0.05;
  const totalInvested = downPayment + purchaseCosts;
  const annualMortgage = (realProperty.monthlyMortgagePayment || 0) * 12;
  const annualCashFlow = noi - annualMortgage;
  const cashOnCash =
    totalInvested > 0 && annualMortgage > 0
      ? ((annualCashFlow / totalInvested) * 100).toFixed(2) + "%"
      : "—";

  const realRoiMetrics = [
    ["Gross Yield", computedYield],
    ["Cap Rate", capRate],
    ["Cash-on-Cash", cashOnCash],
    ["Net Op. Income", noi !== 0 ? gbp(noi, { decimals: false }) : "—"],
  ];

  const roiPieData =
    dbExpensesReport?.breakdown && dbExpensesReport.breakdown.length > 0
      ? dbExpensesReport.breakdown.map((b: any) => ({
          name: b.category,
          value: b.amount,
          color: categoryColors[b.category.toLowerCase()] || "#818cf8",
        }))
      : [];

  return (
    <div className="animate-in">
      <PageTitle
        title={displayTitle}
        subtitle={displayAddress}
        back="/properties"
      />
      <Card className="overflow-hidden">
        {displayImage ? (
          <img
            src={displayImage}
            alt={displayTitle}
            className="h-52 w-full object-cover sm:h-64"
          />
        ) : (
          <div className="flex h-52 w-full flex-col items-center justify-center bg-surface-2 text-text-muted sm:h-64">
            <Home className="h-10 w-10 mb-2 opacity-40" />
            <span className="text-sm font-semibold">No Image Uploaded</span>
          </div>
        )}
        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold">{displayTitle}</h2>
              <p className="text-sm text-text-muted capitalize">
                {displayType.replace("_", " ")} · {displayAddress}
              </p>
            </div>
            <Badge tone={isOccupied ? "success" : "warning"}>
              {statusLabel}
            </Badge>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-surface-2 p-3 text-center">
              <p className="text-lg font-extrabold text-info">{displayValue}</p>
              <p className="text-xs text-text-muted">Value</p>
            </div>
            <div className="rounded-xl bg-surface-2 p-3 text-center">
              <p className="text-lg font-extrabold text-violet">
                {computedYield}
              </p>
              <p className="text-xs text-text-muted">Yield</p>
            </div>
            <div className="rounded-xl bg-surface-2 p-3 text-center">
              <p className="text-lg font-extrabold text-success">
                {realProperty.units?.length || 0}
              </p>
              <p className="text-xs text-text-muted">Units</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-4">
        <PillTabs
          value={tab}
          onChange={setTab}
          tabs={["Details", "Units", "Tenants", "Expenses", "ROI"]}
        />
      </div>

      {tab === "Details" && (
        <div className="mt-4 space-y-4">
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              {realDetails.map(([k, v]) => (
                <div key={k} className="rounded-lg bg-surface-2 p-3">
                  <p className="text-xs text-text-muted">{k}</p>
                  <p className="font-bold">{v}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 font-bold">
              <ShieldCheck className="h-4 w-4 text-primary" /> Safety
              Certificates
            </h3>
            <div className="divide-y divide-border">
              {formattedCerts.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-text-muted">{c.date}</p>
                  </div>
                  <Badge tone={c.tone}>{c.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-2 font-bold">Managed By</h3>
            <p className="text-sm">
              {managerName} · {agencyName}
            </p>
            <p className="text-sm text-text-muted">
              {managerEmail} · {managerPhone}
            </p>
          </Card>
        </div>
      )}

      {tab === "Units" && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Units List</h3>
            <Button size="sm" onClick={() => setUnitModal(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add Unit
            </Button>
          </div>
          {realProperty.units?.length === 0 ? (
            <Card>
              <EmptyState
                icon={Home}
                title="No units found"
                message="Add a unit to this property to start managing leases."
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(realProperty.units || []).map((unit: any) => (
                <Card key={unit._id} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-lg">Unit {unit.unitNumber}</h4>
                      <Badge tone={unit.isOccupied ? "success" : "neutral"}>
                        {unit.isOccupied ? "Occupied" : "Vacant"}
                      </Badge>
                    </div>
                    {unit.floor && <p className="text-xs text-text-muted mt-0.5">Floor: {unit.floor}</p>}
                    
                    <div className="mt-3 space-y-1 text-sm text-text-muted">
                      <p>Rent: <span className="font-semibold text-text">{unit.rentAmount ? gbp(unit.rentAmount) : "—"}</span></p>
                      <p>Specs: <span className="font-semibold text-text">{unit.bedrooms || 0} Bed · {unit.bathrooms || 0} Bath</span></p>
                      {unit.squareFeet && <p>Size: <span className="font-semibold text-text">{unit.squareFeet} sq ft</span></p>}
                    </div>
                  </div>
                  
                  {!unit.isOccupied && (
                    <div className="mt-4 pt-3 border-t border-border flex justify-end">
                      <button
                        onClick={() => deleteUnitMutation.mutate(unit._id)}
                        disabled={deleteUnitMutation.isPending}
                        className="flex items-center gap-1 text-xs font-semibold text-danger hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Unit
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "Tenants" && (
        <div className="mt-4 space-y-3">
          {dbTenants.length === 0 ? (
            <Card>
              <EmptyState
                icon={User}
                title="No active tenants found"
                message="Invite your first tenant in the Tenants section to enable tracking."
              />
            </Card>
          ) : (
            dbTenants.map((t: any) => {
              const unitNumber = t.unit?.unitNumber || t.unit || "—";
              const rentFormatted =
                typeof t.rent === "object" && t.rent?.label
                  ? t.rent.label
                  : gbp(t.rent, { decimals: true }) + "/mo";
              const hasChatSupport = !!t.tenantId;

              return (
                <Card key={t.name} className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{t.name}</h3>
                    {hasChatSupport ? (
                      <button
                        onClick={() =>
                          startChatMutation.mutate({
                            propertyId: id,
                            tenantId: t.tenantId,
                          })
                        }
                        disabled={startChatMutation.isPending}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Message
                      </button>
                    ) : (
                      <Link
                        href="/messages"
                        className="flex items-center gap-1 text-xs font-semibold text-primary"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Message
                      </Link>
                    )}
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-text-muted">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> {t.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> {t.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Unit {unitNumber}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm text-text-muted">Rent</span>
                    <span className="font-bold">{rentFormatted}</span>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {tab === "Expenses" && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-3 font-bold">Expenses by Category</h3>
            {chartData.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-sm text-text-muted">
                No expense categories logged yet
              </div>
            ) : (
              <div className="h-56">
                <SimpleBar data={chartData} formatter={(v) => `£${v}`} />
              </div>
            )}
            <p className="mt-3 text-right text-sm">
              Total:{" "}
              <span className="font-extrabold">{gbp(totalExpensesAmount)}</span>
            </p>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 font-bold">Recent Expenses</h3>
            {dbExpenses.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-sm text-text-muted">
                No recent expenses logged
              </div>
            ) : (
              <div className="divide-y divide-border">
                {dbExpenses.map((e: any) => (
                  <div
                    key={e._id || e.description}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold">{e.description}</p>
                      <p className="text-xs text-text-muted capitalize">
                        {e.category} ·{" "}
                        {new Date(e.date).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <span className="font-bold text-danger">
                      {gbp(e.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "ROI" && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-3 font-bold">ROI Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              {realRoiMetrics.map(([k, v]) => (
                <div key={k} className="rounded-xl bg-surface-2 p-4">
                  <p className="text-xs text-text-muted">{k}</p>
                  <p className="flex items-center gap-1 text-lg font-extrabold text-primary">
                    <TrendingUp className="h-4 w-4" />
                    {v}
                  </p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 font-bold">Expense Breakdown</h3>
            {roiPieData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-text-muted">
                No expense breakdown data
              </div>
            ) : (
              <>
                <div className="h-48">
                  <DonutPie data={roiPieData} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
                  {roiPieData.map((r: any) => (
                    <span key={r.name} className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: r.color }}
                      />
                      {r.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      <Modal
        open={unitModal}
        onClose={() => setUnitModal(false)}
        title="Add Unit"
        footer={
          <>
            <Button variant="secondary" onClick={() => setUnitModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!unitForm.unitNumber.trim()) {
                  return toast("Unit number is required", "error");
                }
                addUnitMutation.mutate({
                  unitNumber: unitForm.unitNumber,
                  floor: unitForm.floor || undefined,
                  bedrooms: unitForm.bedrooms ? Number(unitForm.bedrooms) : undefined,
                  bathrooms: unitForm.bathrooms ? Number(unitForm.bathrooms) : undefined,
                  squareFeet: unitForm.squareFeet ? Number(unitForm.squareFeet) : undefined,
                  rentAmount: unitForm.rentAmount ? Number(unitForm.rentAmount) : undefined,
                  notes: unitForm.notes || undefined,
                });
              }}
              loading={addUnitMutation.isPending}
            >
              Add Unit
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Unit Number (e.g. Flat 1, Suite A)">
            <Input
              value={unitForm.unitNumber}
              onChange={(e) => setUnitForm({ ...unitForm, unitNumber: e.target.value })}
              placeholder="Flat 1"
            />
          </Field>
          <Field label="Floor (e.g. Ground, 1st)">
            <Input
              value={unitForm.floor}
              onChange={(e) => setUnitForm({ ...unitForm, floor: e.target.value })}
              placeholder="Ground Floor"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bedrooms">
              <Input
                type="number"
                value={unitForm.bedrooms}
                onChange={(e) => setUnitForm({ ...unitForm, bedrooms: e.target.value })}
                placeholder="1"
              />
            </Field>
            <Field label="Bathrooms">
              <Input
                type="number"
                value={unitForm.bathrooms}
                onChange={(e) => setUnitForm({ ...unitForm, bathrooms: e.target.value })}
                placeholder="1"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Square Feet">
              <Input
                type="number"
                value={unitForm.squareFeet}
                onChange={(e) => setUnitForm({ ...unitForm, squareFeet: e.target.value })}
                placeholder="550"
              />
            </Field>
            <Field label="Expected Rent (£ / mo)">
              <Input
                type="number"
                value={unitForm.rentAmount}
                onChange={(e) => setUnitForm({ ...unitForm, rentAmount: e.target.value })}
                placeholder="1200"
              />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea
              value={unitForm.notes}
              onChange={(e) => setUnitForm({ ...unitForm, notes: e.target.value })}
              placeholder="Any specific detail about this unit..."
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
