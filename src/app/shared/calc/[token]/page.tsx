"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { calculatorService, SavedCalculation } from "@/lib/services/calculator.service";
import { ROICalculator } from "@/components/calculator/roi";
import { StampDutyCalculator } from "@/components/calculator/stamp-duty";
import { PropertyFlipCalculator } from "@/components/calculator/property-flip";
import { DevelopmentAppraisalCalculator } from "@/components/calculator/development";
import { Building2 } from "lucide-react";

export default function SharedCalculationPage() {
  const params = useParams();
  const token = params.token as string;

  const [calculation, setCalculation] = useState<SavedCalculation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    calculatorService
      .getSharedCalculation(token)
      .then((calc) => {
        setCalculation(calc);
        setLoading(false);
      })
      .catch((err) => {
        setError("This shared calculation could not be found or is no longer shared publicly.");
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-sm text-text-muted">Loading shared calculation...</p>
      </div>
    );
  }

  if (error || !calculation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-text animate-in">Shared Calculation Not Found</h2>
          <p className="text-sm text-text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
          <Building2 className="h-6 w-6 text-primary animate-bounce" />
          <div>
            <h1 className="text-xl font-bold text-text">Shared Property Calculation</h1>
            <p className="text-xs text-text-muted">
              Viewing &ldquo;{calculation.name}&rdquo; &bull; Read-only mode
            </p>
          </div>
        </div>

        {calculation.notes && (
          <div className="rounded-xl border border-border bg-surface-2 p-4 text-sm text-text-muted mb-6">
            <span className="font-semibold block text-text mb-1 font-bold">Notes:</span>
            {calculation.notes}
          </div>
        )}

        {calculation.calculatorType === "roi" && (
          <ROICalculator readOnly initialInputs={calculation.inputs} />
        )}
        {calculation.calculatorType === "stamp-duty" && (
          <StampDutyCalculator readOnly initialInputs={calculation.inputs} />
        )}
        {calculation.calculatorType === "property-flip" && (
          <PropertyFlipCalculator readOnly initialInputs={calculation.inputs} />
        )}
        {calculation.calculatorType === "development" && (
          <DevelopmentAppraisalCalculator readOnly initialInputs={calculation.inputs} />
        )}
      </div>
    </div>
  );
}
