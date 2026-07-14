import { useState } from "react";
import { Card } from "@/components/ui/primitives";
import { Field, Input } from "@/components/ui/form";
import { CalculationBreakdown } from "../shared/CalculationBreakdown";
import { CalculatorActions } from "../shared/CalculatorActions";
import { exportToCSV } from "../shared/calculatorExport";
import { useROICalculator, type ROIInputs } from "./useROICalculator";
import { gbp } from "@/lib/utils";
import { SaveCalculationDialog } from "../shared/SaveCalculationDialog";
import { ShareCalculationDialog } from "../shared/ShareCalculationDialog";
import { SavedCalculationsDialog } from "../shared/SavedCalculationsDialog";
import { CompareCalculationsDialog } from "../shared/CompareCalculationsDialog";
import { SavedCalculation } from "@/lib/services/calculator.service";

export function ROICalculator({
  readOnly,
  initialInputs,
}: {
  readOnly?: boolean;
  initialInputs?: any;
}) {
  const { inputs, setInputs, updateInput, results } =
    useROICalculator(initialInputs);

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
    exportToCSV("roi-calculator", "ROI Calculation", [
      { label: "Total Investment", value: gbp(results.totalInvestment) },
      { label: "Annual Rental Income", value: gbp(results.annualRentalIncome) },
      {
        label: "Total Annual Expenses",
        value: gbp(results.totalAnnualExpenses),
      },
      { label: "Net Annual Income", value: gbp(results.netAnnualIncome) },
      { label: "Monthly Cash Flow", value: gbp(results.monthlyNetIncome) },
      {
        label: "Return on Investment (ROI)",
        value: `${results.roi.toFixed(2)}%`,
        isTotal: true,
      },
    ]);
  };

  const Metric = ({
    label,
    value,
    big,
    accent,
  }: {
    label: string;
    value: string;
    big?: boolean;
    accent?: string;
  }) => (
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

      <fieldset disabled={readOnly} className="contents">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-4 font-bold">Property (One-off costs)</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Field label="Purchase Price">
                <Input
                  type="number"
                  value={inputs.purchasePrice}
                  onChange={(e) =>
                    updateInput("purchasePrice", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Stamp Duty">
                <Input
                  type="number"
                  value={inputs.stampDuty}
                  onChange={(e) =>
                    updateInput("stampDuty", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Legal Fees">
                <Input
                  type="number"
                  value={inputs.legalFees}
                  onChange={(e) =>
                    updateInput("legalFees", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Agent Fees">
                <Input
                  type="number"
                  value={inputs.agentFees}
                  onChange={(e) =>
                    updateInput("agentFees", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Refurb Costs">
                <Input
                  type="number"
                  value={inputs.refurbCosts}
                  onChange={(e) =>
                    updateInput("refurbCosts", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Other Costs">
                <Input
                  type="number"
                  value={inputs.otherCosts}
                  onChange={(e) =>
                    updateInput("otherCosts", Number(e.target.value))
                  }
                />
              </Field>
            </div>

            <h3 className="mb-4 font-bold">Rental (Recurring)</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Field label="Monthly Rent">
                <Input
                  type="number"
                  value={inputs.monthlyRent}
                  onChange={(e) =>
                    updateInput("monthlyRent", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Monthly Mortgage">
                <Input
                  type="number"
                  value={inputs.monthlyMortgagePayment}
                  onChange={(e) =>
                    updateInput(
                      "monthlyMortgagePayment",
                      Number(e.target.value),
                    )
                  }
                />
              </Field>
              <Field label="Management Fee (%)">
                <Input
                  type="number"
                  value={inputs.managementFeePercent}
                  onChange={(e) =>
                    updateInput("managementFeePercent", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Annual Repairs">
                <Input
                  type="number"
                  value={inputs.annualRepairs}
                  onChange={(e) =>
                    updateInput("annualRepairs", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Annual Maintenance">
                <Input
                  type="number"
                  value={inputs.annualMaintenance}
                  onChange={(e) =>
                    updateInput("annualMaintenance", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Annual Insurance">
                <Input
                  type="number"
                  value={inputs.annualInsurance}
                  onChange={(e) =>
                    updateInput("annualInsurance", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Annual Other">
                <Input
                  type="number"
                  value={inputs.annualOtherCosts}
                  onChange={(e) =>
                    updateInput("annualOtherCosts", Number(e.target.value))
                  }
                />
              </Field>
            </div>

            <h3 className="mb-4 font-bold text-text-muted">
              Unwired (Dead fields)
            </h3>
            <div className="grid grid-cols-3 gap-3 opacity-50">
              <Field label="Loan Term">
                <Input
                  type="number"
                  value={inputs.loanTermYears}
                  onChange={(e) =>
                    updateInput("loanTermYears", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Interest (%)">
                <Input
                  type="number"
                  value={inputs.interestRate}
                  onChange={(e) =>
                    updateInput("interestRate", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Down Payment">
                <Input
                  type="number"
                  value={inputs.downPayment}
                  onChange={(e) =>
                    updateInput("downPayment", Number(e.target.value))
                  }
                />
              </Field>
            </div>
          </Card>

          <Card className="p-5 flex flex-col space-y-6">
            <div>
              <h3 className="mb-4 font-bold">Results</h3>
              <div className="mb-4 rounded-xl bg-primary/8 p-5 text-center">
                <p className="text-sm text-text-muted">Return on Investment</p>
                <p className="text-4xl font-extrabold text-primary">
                  {results.roi.toFixed(2)}%
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Metric
                  label="Total Investment"
                  value={gbp(results.totalInvestment)}
                />
                <Metric
                  label="Annual Rent"
                  value={gbp(results.annualRentalIncome)}
                />
                <Metric
                  label="Total Annual Expenses"
                  value={gbp(Math.round(results.totalAnnualExpenses))}
                  accent="#ff3b30"
                />
                <Metric
                  label="Net Annual Income"
                  value={gbp(Math.round(results.netAnnualIncome))}
                  accent="#34c759"
                />
                <Metric
                  label="Monthly Cash Flow"
                  value={gbp(Math.round(results.monthlyNetIncome))}
                  big
                  accent="#007aff"
                />
              </div>
            </div>

            <CalculationBreakdown
              title="Expenses Breakdown"
              rows={[
                {
                  label: "Mortgage (Annual)",
                  value: inputs.monthlyMortgagePayment * 12,
                },
                {
                  label: "Management Fees",
                  value: results.annualManagementFees,
                },
                { label: "Repairs", value: inputs.annualRepairs },
                { label: "Maintenance", value: inputs.annualMaintenance },
                { label: "Insurance", value: inputs.annualInsurance },
                { label: "Other", value: inputs.annualOtherCosts },
                {
                  label: "Total Annual Expenses",
                  value: results.totalAnnualExpenses,
                  isTotal: true,
                },
              ]}
            />
          </Card>
        </div>
      </fieldset>

      <SaveCalculationDialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        calculatorType="roi"
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
        calculatorType="roi"
        onSelectCalculation={(calc) => {
          setActiveCalc(calc);
          setInputs(calc.inputs as ROIInputs);
        }}
      />

      <CompareCalculationsDialog
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        calculatorType="roi"
      />
    </div>
  );
}
