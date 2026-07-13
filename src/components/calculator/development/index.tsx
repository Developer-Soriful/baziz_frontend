import React from "react";
import { Card } from "@/components/ui/primitives";
import { Field, Input } from "@/components/ui/form";
import { CalculationBreakdown } from "../shared/CalculationBreakdown";
import { CalculatorActions } from "../shared/CalculatorActions";
import { exportToCSV } from "../shared/calculatorExport";
import { useDevCalculator } from "./useDevCalculator";
import { gbp } from "@/lib/utils";

export function DevelopmentAppraisalCalculator() {
  const { inputs, updateInput, results } = useDevCalculator();

  const handleSave = () => {
    alert("Save logic pending");
  };

  const handleShare = () => {
    alert("Share logic pending");
  };

  const handleExport = () => {
    exportToCSV("development-appraisal", "Development Appraisal", [
      { label: "GDV", value: gbp(inputs.gdv) },
      { label: "Total Costs", value: gbp(results.totalCosts) },
      { label: "Gross Profit", value: gbp(results.grossProfit), isTotal: true },
      { label: "Profit on GDV", value: `${results.profitOnGDV.toFixed(1)}%` },
      { label: "Profit on Cost", value: `${results.profitOnCost.toFixed(1)}%` },
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

  return (
    <div className="space-y-6">
      <CalculatorActions onSave={handleSave} onShare={handleShare} onExport={handleExport} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card className="p-5 border-l-4 border-l-success">
            <h3 className="mb-4 font-bold">Gross Development Value (GDV)</h3>
            <div className="grid grid-cols-1 gap-3">
              <Field label="GDV (Estimated Sale Value)">
                <Input type="number" value={inputs.gdv} onChange={(e) => updateInput("gdv", Number(e.target.value))} />
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 font-bold">Land & Acquisition</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Land Price"><Input type="number" value={inputs.landPurchasePrice} onChange={(e) => updateInput("landPurchasePrice", Number(e.target.value))} /></Field>
              <Field label="Stamp Duty"><Input type="number" value={inputs.stampDuty} onChange={(e) => updateInput("stampDuty", Number(e.target.value))} /></Field>
              <Field label="Legal Fees"><Input type="number" value={inputs.legalFees} onChange={(e) => updateInput("legalFees", Number(e.target.value))} /></Field>
              <Field label="Survey Fees"><Input type="number" value={inputs.surveyFees} onChange={(e) => updateInput("surveyFees", Number(e.target.value))} /></Field>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 font-bold">Construction & Build</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label="Construction Cost"><Input type="number" value={inputs.constructionCost} onChange={(e) => updateInput("constructionCost", Number(e.target.value))} /></Field>
              <Field label="Contingency (%)"><Input type="number" value={inputs.contingencyRate} onChange={(e) => updateInput("contingencyRate", Number(e.target.value))} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Architect Fees"><Input type="number" value={inputs.architectFees} onChange={(e) => updateInput("architectFees", Number(e.target.value))} /></Field>
              <Field label="Planning Fees"><Input type="number" value={inputs.planningFees} onChange={(e) => updateInput("planningFees", Number(e.target.value))} /></Field>
              <Field label="Building Control"><Input type="number" value={inputs.buildingControl} onChange={(e) => updateInput("buildingControl", Number(e.target.value))} /></Field>
              <Field label="Section 106 / CIL"><Input type="number" value={inputs.section106cil} onChange={(e) => updateInput("section106cil", Number(e.target.value))} /></Field>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 font-bold">Finance & Sales</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label="Finance Costs"><Input type="number" value={inputs.financeCosts} onChange={(e) => updateInput("financeCosts", Number(e.target.value))} /></Field>
              <Field label="Duration (Months)"><Input type="number" value={inputs.durationMonths} onChange={(e) => updateInput("durationMonths", Number(e.target.value))} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Sales Agent Fees"><Input type="number" value={inputs.salesAgentFees} onChange={(e) => updateInput("salesAgentFees", Number(e.target.value))} /></Field>
              <Field label="Sales Legal Fees"><Input type="number" value={inputs.salesLegalFees} onChange={(e) => updateInput("salesLegalFees", Number(e.target.value))} /></Field>
            </div>
          </Card>
        </div>

        <Card className="p-5 flex flex-col space-y-6 h-fit sticky top-6">
          <div>
            <h3 className="mb-4 font-bold">Appraisal Results</h3>
            <div className={`mb-4 rounded-xl p-5 text-center ${results.grossProfit >= 0 ? "bg-success/10" : "bg-danger/10"}`}>
              <p className="text-sm text-text-muted">Gross Profit (Pre-tax)</p>
              <p className={`text-4xl font-extrabold ${results.grossProfit >= 0 ? "text-success" : "text-danger"}`}>
                {gbp(Math.round(results.grossProfit))}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="GDV" value={gbp(inputs.gdv)} />
              <Metric label="Total Costs" value={gbp(Math.round(results.totalCosts))} />
              <Metric label="Profit on GDV" value={`${results.profitOnGDV.toFixed(1)}%`} accent="#007aff" />
              <Metric label="Profit on Cost" value={`${results.profitOnCost.toFixed(1)}%`} accent="#34c759" />
            </div>
          </div>

          <CalculationBreakdown
            title="Cost Summary"
            rows={[
              { label: "Land Acquisition", value: Math.round(results.totalLand) },
              { label: "Construction & Pro Fees", value: Math.round(results.totalBuild), subValue: `Includes ${gbp(results.contingencyAmount)} contingency` },
              { label: "Finance & Holding", value: Math.round(results.totalFinanceAndHolding) },
              { label: "Sales & Disposal", value: Math.round(results.totalSaleCosts) },
              { label: "Total Project Costs", value: Math.round(results.totalCosts), isTotal: true },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
