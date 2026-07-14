import React, { useState } from "react";
import { Card } from "@/components/ui/primitives";
import { Field, Input } from "@/components/ui/form";
import { CalculationBreakdown } from "../shared/CalculationBreakdown";
import { CalculatorActions } from "../shared/CalculatorActions";
import { exportToCSV } from "../shared/calculatorExport";
import { useDevCalculator, type DevInputs } from "./useDevCalculator";
import { gbp } from "@/lib/utils";
import { SaveCalculationDialog } from "../shared/SaveCalculationDialog";
import { ShareCalculationDialog } from "../shared/ShareCalculationDialog";
import { SavedCalculationsDialog } from "../shared/SavedCalculationsDialog";
import { CompareCalculationsDialog } from "../shared/CompareCalculationsDialog";
import { SavedCalculation } from "@/lib/services/calculator.service";

export function DevelopmentAppraisalCalculator({
  readOnly,
  initialInputs,
}: {
  readOnly?: boolean;
  initialInputs?: any;
}) {
  const { inputs, setInputs, updateInput, results } = useDevCalculator(initialInputs);

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
    exportToCSV("development-appraisal", "Development Appraisal", [
      { label: "GDV", value: gbp(inputs.projectedSalePrice) },
      { label: "Total Costs", value: gbp(results.totalProjectCosts) },
      { label: "Gross Profit", value: gbp(results.grossProfit), isTotal: true },
      { label: "Profit on GDV", value: `${results.returnOnGDV.toFixed(1)}%` },
      { label: "Profit on Cost", value: `${results.returnOnCost.toFixed(1)}%` },
    ]);
  };

  const Metric = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
    <div className="rounded-xl bg-surface-2 p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="font-bold" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
    </div>
  );

  const pctOfTotal = (val: number) => {
    if (results.totalProjectCosts <= 0) return "0.0%";
    return `${((val / results.totalProjectCosts) * 100).toFixed(1)}%`;
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

      <fieldset disabled={readOnly} className="contents">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card className="p-5 border-l-4 border-l-success">
            <h3 className="mb-4 font-bold text-success">Gross Development Value (GDV)</h3>
            <div className="grid grid-cols-1 gap-3">
              <Field label="GDV (Projected Sale Price)">
                <Input
                  type="number"
                  value={inputs.projectedSalePrice}
                  onChange={(e) => updateInput("projectedSalePrice", Number(e.target.value))}
                />
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 font-bold">Acquisition & Land</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Land Purchase Price">
                <Input type="number" value={inputs.purchasePrice} onChange={(e) => updateInput("purchasePrice", Number(e.target.value))} />
              </Field>
              <Field label="Stamp Duty">
                <Input type="number" value={inputs.stampDuty} onChange={(e) => updateInput("stampDuty", Number(e.target.value))} />
              </Field>
              <Field label="Legal Costs">
                <Input type="number" value={inputs.legalCosts} onChange={(e) => updateInput("legalCosts", Number(e.target.value))} />
              </Field>
              <Field label="Survey Fees">
                <Input type="number" value={inputs.surveyFees} onChange={(e) => updateInput("surveyFees", Number(e.target.value))} />
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 font-bold">Development & Construction</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label="Construction Cost">
                <Input type="number" value={inputs.constructionCost} onChange={(e) => updateInput("constructionCost", Number(e.target.value))} />
              </Field>
              <Field label="Contingency Rate (%)">
                <Input type="number" value={inputs.contingencyRate} onChange={(e) => updateInput("contingencyRate", Number(e.target.value))} />
              </Field>
              <Field label="Architect Fees">
                <Input type="number" value={inputs.architectFees} onChange={(e) => updateInput("architectFees", Number(e.target.value))} />
              </Field>
              <Field label="Planning Costs">
                <Input type="number" value={inputs.planningCosts} onChange={(e) => updateInput("planningCosts", Number(e.target.value))} />
              </Field>
              <Field label="Building Control Fees">
                <Input type="number" value={inputs.buildingControlFees} onChange={(e) => updateInput("buildingControlFees", Number(e.target.value))} />
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 font-bold">Finance & Project</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label="Loan Amount">
                <Input type="number" value={inputs.loanAmount} onChange={(e) => updateInput("loanAmount", Number(e.target.value))} />
              </Field>
              <Field label="Finance Rate (Annual %)">
                <Input type="number" value={inputs.financeRate} onChange={(e) => updateInput("financeRate", Number(e.target.value))} />
              </Field>
              <Field label="Finance Fees (One-off)">
                <Input type="number" value={inputs.financeFees} onChange={(e) => updateInput("financeFees", Number(e.target.value))} />
              </Field>
              <Field label="Project Duration (Months)">
                <Input type="number" value={inputs.projectDuration} onChange={(e) => updateInput("projectDuration", Number(e.target.value))} />
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 font-bold">Sales Costs</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Sales Agent Fees">
                <Input type="number" value={inputs.agentFees} onChange={(e) => updateInput("agentFees", Number(e.target.value))} />
              </Field>
              <Field label="Sales Legal Costs">
                <Input type="number" value={inputs.legalSaleCosts} onChange={(e) => updateInput("legalSaleCosts", Number(e.target.value))} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-4 h-fit sticky top-6">
          <Card className="p-5 flex flex-col space-y-6">
            <div>
              <h3 className="mb-4 font-bold">Appraisal Results</h3>
              <div className={`mb-4 rounded-xl p-5 text-center ${results.grossProfit >= 0 ? "bg-success/10" : "bg-danger/10"}`}>
                <p className="text-sm text-text-muted">Gross Profit (Pre-tax)</p>
                <p className={`text-4xl font-extrabold ${results.grossProfit >= 0 ? "text-success" : "text-danger"}`}>
                  {gbp(Math.round(results.grossProfit))}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Metric label="GDV" value={gbp(inputs.projectedSalePrice)} />
                <Metric label="Total Costs" value={gbp(Math.round(results.totalProjectCosts + results.totalSaleCosts))} />
                <Metric label="Profit on GDV" value={`${results.returnOnGDV.toFixed(1)}%`} accent="#007aff" />
                <Metric label="Profit on Cost (ROC)" value={`${results.returnOnCost.toFixed(1)}%`} accent="#34c759" />
              </div>
            </div>

            <CalculationBreakdown
              title="Cost Summary"
              rows={[
                { label: "Land Acquisition", value: Math.round(results.totalAcquisitionCosts) },
                { label: "Construction & Professional Fees", value: Math.round(results.totalDevelopmentCosts) },
                { label: "Disposal / Sales Costs", value: Math.round(results.totalSaleCosts) },
                { label: "Total Project Costs", value: Math.round(results.totalProjectCosts + results.totalSaleCosts), isTotal: true },
              ]}
            />
          </Card>

          {/* Audit Breakdowns 2a & 2b */}
          <Card className="p-5">
            <h3 className="mb-4 font-bold text-text-muted text-sm">2a. Contingency Derivation</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Construction:</span>
                <span className="font-semibold">{gbp(inputs.constructionCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Contingency Rate:</span>
                <span className="font-semibold">{inputs.contingencyRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Formula:</span>
                <span className="font-mono text-xs">{inputs.constructionCost} * {inputs.contingencyRate}%</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1">
                <span>Contingency Amount:</span>
                <span className="font-bold text-primary">{gbp(Math.round(results.contingency))}</span>
              </div>
              <div className="flex justify-between text-xs text-text-muted">
                <span>% of Total Project Costs:</span>
                <span>{pctOfTotal(results.contingency)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 font-bold text-text-muted text-sm">2b. Finance Derivation</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Loan Amount:</span>
                <span className="font-semibold">{gbp(inputs.loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Finance Rate:</span>
                <span className="font-semibold">{inputs.financeRate}% annual</span>
              </div>
              <div className="flex justify-between">
                <span>Project Duration:</span>
                <span className="font-semibold">
                  {inputs.projectDuration} months ({results.durationYears.toFixed(2)} years)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Annual Interest:</span>
                <span className="font-semibold">
                  {gbp(Math.round(inputs.loanAmount * (inputs.financeRate / 100)))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Interest Over Term:</span>
                <span className="font-semibold">{gbp(Math.round(results.financeInterest))}</span>
              </div>
              <div className="flex justify-between">
                <span>One-off Finance Fees:</span>
                <span className="font-semibold">{gbp(inputs.financeFees)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1">
                <span>Total Finance Costs:</span>
                <span className="font-bold text-primary">{gbp(Math.round(results.financeCosts))}</span>
              </div>
              <div className="flex justify-between text-xs text-text-muted">
                <span>Effective Monthly Finance Cost:</span>
                <span>
                  {inputs.projectDuration > 0
                    ? gbp(Math.round(results.financeCosts / inputs.projectDuration))
                    : gbp(0)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </fieldset>

    <SaveCalculationDialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        calculatorType="development"
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
        calculatorType="development"
        onSelectCalculation={(calc) => {
          setActiveCalc(calc);
          setInputs(calc.inputs as DevInputs);
        }}
      />

      <CompareCalculationsDialog
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        calculatorType="development"
      />
    </div>
  );
}
