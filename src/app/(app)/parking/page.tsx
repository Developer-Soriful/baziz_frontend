"use client";

import { PageTitle } from "@/components/page-title";
import { Card } from "@/components/ui/primitives";
import { Car, KeyRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { tenantService } from "@/lib/services/tenant.service";
import { EmptyState } from "@/components/ui/misc";

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between border-b border-border py-3 last:border-0"><span className="text-sm text-text-muted">{label}</span><span className="font-bold">{value}</span></div>;
}

export default function ParkingPage() {
  const { data: myLease, isLoading } = useQuery({
    queryKey: ["tenant-lease"],
    queryFn: tenantService.getMyLease,
  });

  if (isLoading) {
    return <div className="animate-in mx-auto max-w-2xl text-center text-text-muted mt-10">Loading parking details...</div>;
  }

  const bays = myLease?.unit?.parkingBays || [];
  const gateCode = myLease?.property?.metadata?.gateCode || "CONTACT OFFICE";

  return (
    <div className="animate-in mx-auto max-w-2xl">
      <PageTitle title="Parking" subtitle="Your parking spot and garage access" />
      
      {bays.length === 0 ? (
        <Card className="mt-4"><EmptyState icon={Car} title="No Parking Assigned" message="You do not have any parking bays assigned to your lease." /></Card>
      ) : (
        bays.map((bay, idx) => (
          <Card key={bay._id || idx} className="p-6 mb-4">
            <h3 className="mb-2 flex items-center gap-2 font-bold"><Car className="h-5 w-5 text-primary" /> Your Parking Spot</h3>
            <Row label="Bay Number" value={bay.bayNumber} />
            <Row label="Level" value={bay.level || "N/A"} />
            <Row label="Vehicle" value={bay.assignedVehicle || "Not Assigned"} />
          </Card>
        ))
      )}

      {bays.length > 0 && (
        <Card className="mt-4 p-6 text-center">
          <h3 className="mb-3 flex items-center justify-center gap-2 font-bold"><KeyRound className="h-5 w-5 text-primary" /> Gate Number</h3>
          <p className="text-4xl font-extrabold tracking-[0.3em] text-primary">{gateCode}</p>
          <p className="mt-2 text-sm text-text-muted">Enter this code at the garage entrance</p>
        </Card>
      )}
    </div>
  );
}
