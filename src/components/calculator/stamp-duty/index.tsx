import { useState } from "react";
import { Card, Button } from "@/components/ui/primitives";
import { Field, Input, Select } from "@/components/ui/form";
import { CalculationBreakdown, type BreakdownRow } from "../shared/CalculationBreakdown";
import { CalculatorActions } from "../shared/CalculatorActions";
import { exportToCSV } from "../shared/calculatorExport";
import { useStampDutyCalculator, type StampDutyInputs } from "./useStampDutyCalculator";
import { gbp } from "@/lib/utils";
import { SaveCalculationDialog } from "../shared/SaveCalculationDialog";
import { ShareCalculationDialog } from "../shared/ShareCalculationDialog";
import { SavedCalculationsDialog } from "../shared/SavedCalculationsDialog";
import { CompareCalculationsDialog } from "../shared/CompareCalculationsDialog";
import { SavedCalculation } from "@/lib/services/calculator.service";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Settings } from "lucide-react";

export function StampDutyCalculator({
  readOnly,
  initialInputs,
}: {
  readOnly?: boolean;
  initialInputs?: any;
}) {
  const { inputs, setInputs, updateInput, results, isLoading } = useStampDutyCalculator(initialInputs);
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  const [saveOpen, setSaveOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [activeCalc, setActiveCalc] = useState<SavedCalculation | null>(null);

  const handleShare = () => {
    if (!activeCalc) {
      alert("Please save this calculation first before sharing.");
      return;
    }
    setShareOpen(true);
  };

  const handleExport = () => {
    const rows: BreakdownRow[] = results.rows.map((r) => ({
      label: r.band,
      value: gbp(Math.round(r.tax)),
      subValue: `${(r.rate * 100).toFixed(1)}% on ${gbp(r.taxable)}`,
    }));
    rows.push({
      label: "Total Tax",
      value: gbp(Math.round(results.tax)),
      isTotal: true,
    });
    exportToCSV("stamp-duty", "Stamp Duty Calculation", rows);
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <CalculatorActions
          onSave={() => setSaveOpen(true)}
          onLoad={() => setLoadOpen(true)}
          onCompare={() => setCompareOpen(true)}
          onShare={handleShare}
          onExport={handleExport}
        />
      )}

      {!readOnly && isLandlord && (
        <div className="flex justify-end -mt-2 mb-2 animate-fade-in">
          <Link href="/admin/stamp-duty">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Manage Tax Rates (Admin)
            </Button>
          </Link>
        </div>
      )}

      <fieldset disabled={readOnly} className="contents">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 font-bold">Property Details</h3>
          <div className="space-y-4">
            <Field label="Property Price (£)">
              <Input
                type="number"
                value={inputs.propertyPrice}
                onChange={(e) =>
                  updateInput("propertyPrice", Number(e.target.value))
                }
              />
            </Field>

            <Field label="Region">
              <Select
                value={inputs.region}
                onChange={(e) => updateInput("region", e.target.value as any)}
              >
                <option value="england-ni">England & NI</option>
                <option value="wales">Wales</option>
                <option value="scotland">Scotland</option>
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Property Type">
                <Select
                  value={inputs.propertyType}
                  onChange={(e) =>
                    updateInput("propertyType", e.target.value as any)
                  }
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </Select>
              </Field>

              <Field label="Buyer Type">
                <Select
                  value={inputs.buyerType}
                  onChange={(e) =>
                    updateInput("buyerType", e.target.value as any)
                  }
                >
                  <option value="personal">Personal</option>
                  <option value="company">Company</option>
                </Select>
              </Field>
            </div>

            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={inputs.isFirstTimeBuyer}
                  disabled={
                    inputs.buyerType === "company" ||
                    inputs.propertyType === "commercial"
                  }
                  onChange={(e) =>
                    updateInput("isFirstTimeBuyer", e.target.checked)
                  }
                  className="h-4 w-4 rounded accent-primary disabled:opacity-50"
                />
                First-time Buyer
              </label>

              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={inputs.isSecondHome}
                  onChange={(e) =>
                    updateInput("isSecondHome", e.target.checked)
                  }
                  className="h-4 w-4 rounded accent-primary"
                />
                Additional Property
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col">
          <h3 className="mb-4 font-bold">Tax Breakdown</h3>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-text-muted">
              Loading tax rates...
            </div>
          ) : (
            <>
              <div className="mb-6 rounded-xl bg-primary/8 p-6 text-center">
                <p className="text-sm font-medium text-text-muted mb-1">
                  Total Stamp Duty Due
                </p>
                <p className="text-4xl font-extrabold text-primary">
                  {gbp(Math.round(results.tax))}
                </p>
              </div>

              <CalculationBreakdown
                title="Tax Calculation"
                rows={[
                  ...results.rows.map((r) => ({
                    label: r.isSurcharge ? r.band : `Band: ${r.band}`,
                    value: Math.round(r.tax),
                    subValue: `${(r.rate * 100).toFixed(1)}% on ${gbp(r.taxable)}`,
                  })),
                ]}
              />
            </>
          )}
        </Card>
      </div>
    </fieldset>

      <SaveCalculationDialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        calculatorType="stamp-duty"
        inputs={inputs}
        results={results}
        onSaveSuccess={(calc) => setActiveCalc(calc)}
      />

      <ShareCalculationDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        calculation={activeCalc}
      />

      <SavedCalculationsDialog
        open={loadOpen}
        onClose={() => setLoadOpen(false)}
        calculatorType="stamp-duty"
        onSelectCalculation={(calc) => {
          setActiveCalc(calc);
          setInputs(calc.inputs as StampDutyInputs);
        }}
      />

      <CompareCalculationsDialog
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        calculatorType="stamp-duty"
      />
    </div>
  );
}
