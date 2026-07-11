"use client";

import { PageTitle } from "@/components/page-title";
import { Card } from "@/components/ui/primitives";
import { Car, KeyRound } from "lucide-react";

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between border-b border-border py-3 last:border-0"><span className="text-sm text-text-muted">{label}</span><span className="font-bold">{value}</span></div>;
}

export default function ParkingPage() {
  return (
    <div className="animate-in mx-auto max-w-2xl">
      <PageTitle title="Parking" subtitle="Your parking spot and garage access" />
      <Card className="p-6">
        <h3 className="mb-2 flex items-center gap-2 font-bold"><Car className="h-5 w-5 text-primary" /> Your Parking Spot</h3>
        <Row label="Bay Number" value="A-12" />
        <Row label="Level" value="Underground Level 1" />
        <Row label="Vehicle" value="ABC-1234" />
      </Card>
      <Card className="mt-4 p-6 text-center">
        <h3 className="mb-3 flex items-center justify-center gap-2 font-bold"><KeyRound className="h-5 w-5 text-primary" /> Gate Number</h3>
        <p className="text-4xl font-extrabold tracking-[0.3em] text-primary">1234#</p>
        <p className="mt-2 text-sm text-text-muted">Enter this code at the garage entrance</p>
      </Card>
    </div>
  );
}
