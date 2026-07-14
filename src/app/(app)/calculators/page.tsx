"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { PillTabs } from "@/components/ui/misc";

import { StampDutyCalculator } from "@/components/calculator/stamp-duty";
import { ROICalculator } from "@/components/calculator/roi";
import { PropertyFlipCalculator } from "@/components/calculator/property-flip";
import { DevelopmentAppraisalCalculator } from "@/components/calculator/development";

const n = (v: string) => parseFloat(v) || 0;

export default function CalculatorsPage() {
  const [tab, setTab] = useState<"ROI" | "Stamp Duty" | "Flip" | "Development">(
    "ROI",
  );
  return (
    <div className="animate-in mx-auto max-w-4xl">
      <PageTitle
        title="Financial Calculators"
        subtitle="Analyze property deals and ROI"
      />
      <div className="mb-5">
        <PillTabs
          value={tab}
          onChange={setTab}
          tabs={["ROI", "Stamp Duty", "Flip", "Development"]}
        />
      </div>
      {tab === "ROI" && <ROICalculator />}
      {tab === "Stamp Duty" && <StampDutyCalculator />}
      {tab === "Flip" && <PropertyFlipCalculator />}
      {tab === "Development" && <DevelopmentAppraisalCalculator />}
    </div>
  );
}

function Metric({
  label,
  value,
  big,
  accent,
}: {
  label: string;
  value: string;
  big?: boolean;
  accent?: string;
}) {
  return (
    <div className="rounded-xl bg-surface-2 p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p
        className={big ? "text-2xl font-extrabold" : "font-bold"}
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
