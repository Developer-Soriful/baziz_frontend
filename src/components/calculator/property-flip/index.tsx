import React from "react";
import { Card } from "@/components/ui/primitives";
import { Field, Input, Select } from "@/components/ui/form";
import { CalculationBreakdown } from "../shared/CalculationBreakdown";
import { CalculatorActions } from "../shared/CalculatorActions";
import { exportToCSV } from "../shared/calculatorExport";
import { usePropertyFlipCalculator } from "./usePropertyFlipCalculator";
import { gbp } from "@/lib/utils";

export function PropertyFlipCalculator() {
  const { inputs, updateInput, results } = usePropertyFlipCalculator();

  const handleSave = () => {
    alert("Save logic pending");
  };

  const handleShare = () => {
    alert("Share logic pending");
  };

  const handleExport = () => {
    exportToCSV("property-flip", "Property Flip Calculation", [
      { label: "Total Costs", value: gbp(results.totalCosts) },
      { label: "Gross Profit", value: gbp(results.grossProfit) },
      { label: "CGT Paid", value: gbp(results.cgtAmount) },
      { label: "Net Profit", value: gbp(results.netProfit), isTotal: true },
      { label: "ROI", value: `${results.roi.toFixed(1)}%` },
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
          <Card className="p-5">
            <h3 className="mb-4 font-bold">Purchase & Sale (£)</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label="Purchase Price"><Input type="number" value={inputs.purchasePrice} onChange={(e) => updateInput("purchasePrice", Number(e.target.value))} /></Field>
              <Field label="Stamp Duty"><Input type="number" value={inputs.stampDuty} onChange={(e) => updateInput("stampDuty", Number(e.target.value))} /></Field>
              <Field label="Legal Fees"><Input type="number" value={inputs.legalFees} onChange={(e) => updateInput("legalFees", Number(e.target.value))} /></Field>
              <Field label="Survey Fees"><Input type="number" value={inputs.surveyFees} onChange={(e) => updateInput("surveyFees", Number(e.target.value))} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ARV (Sale Price)"><Input type="number" value={inputs.arvSalePrice} onChange={(e) => updateInput("arvSalePrice", Number(e.target.value))} /></Field>
              <Field label="Agent Fees"><Input type="number" value={inputs.agentFees} onChange={(e) => updateInput("agentFees", Number(e.target.value))} /></Field>
              <Field label="Sale Legal Fees"><Input type="number" value={inputs.saleLegalFees} onChange={(e) => updateInput("saleLegalFees", Number(e.target.value))} /></Field>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 font-bold">Refurb & Finance</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label="Materials"><Input type="number" value={inputs.materialsCost} onChange={(e) => updateInput("materialsCost", Number(e.target.value))} /></Field>
              <Field label="Contingency (%)"><Input type="number" value={inputs.contingencyRate} onChange={(e) => updateInput("contingencyRate", Number(e.target.value))} /></Field>
              <Field label="Labour"><Input type="number" value={inputs.labourCost} onChange={(e) => updateInput("labourCost", Number(e.target.value))} /></Field>
              <Field label="Other Costs"><Input type="number" value={inputs.otherCosts} onChange={(e) => updateInput("otherCosts", Number(e.target.value))} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Loan Amount"><Input type="number" value={inputs.loanAmount} onChange={(e) => updateInput("loanAmount", Number(e.target.value))} /></Field>
              <Field label="Interest Rate (Annual %)"><Input type="number" value={inputs.interestRate} onChange={(e) => updateInput("interestRate", Number(e.target.value))} /></Field>
              <Field label="Duration (Months)"><Input type="number" value={inputs.durationMonths} onChange={(e) => updateInput("durationMonths", Number(e.target.value))} /></Field>
              <Field label="Arrangement Fees"><Input type="number" value={inputs.arrangementFees} onChange={(e) => updateInput("arrangementFees", Number(e.target.value))} /></Field>
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-l-primary">
            <h3 className="mb-4 font-bold">Tax & Structure</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={inputs.isBusinessFlip} onChange={(e) => updateInput("isBusinessFlip", e.target.checked)} className="h-4 w-4 rounded accent-primary" />
                Flip via Limited Company (Exempt from personal CGT)
              </label>

              {!inputs.isBusinessFlip && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Field label="CGT Tax Band">
                    <Select value={inputs.cgtBand} onChange={(e) => updateInput("cgtBand", e.target.value as any)}>
                      <option value="basic">Basic Rate (18%)</option>
                      <option value="higher">Higher/Additional (28%)</option>
                    </Select>
                  </Field>
                  <Field label="Annual Exemption (£)">
                    <Input type="number" value={inputs.annualExemption} onChange={(e) => updateInput("annualExemption", Number(e.target.value))} />
                  </Field>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-5 flex flex-col space-y-6">
          <div>
            <h3 className="mb-4 font-bold">Results</h3>
            <div className={`mb-4 rounded-xl p-5 text-center ${results.netProfit >= 0 ? "bg-success/10" : "bg-danger/10"}`}>
              <p className="text-sm text-text-muted">Net Profit</p>
              <p className={`text-4xl font-extrabold ${results.netProfit >= 0 ? "text-success" : "text-danger"}`}>
                {gbp(Math.round(results.netProfit))}
              </p>
              <p className="text-sm font-semibold mt-1">ROI {results.roi.toFixed(1)}%</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Total Project Costs" value={gbp(Math.round(results.totalCosts))} />
              <Metric label="Gross Profit (Pre-tax)" value={gbp(Math.round(results.grossProfit))} />
              <Metric label="CGT Paid" value={gbp(Math.round(results.cgtAmount))} accent={results.cgtAmount > 0 ? "#ff3b30" : undefined} />
              <Metric label="Profit Margin" value={`${results.profitMargin.toFixed(1)}%`} accent="#007aff" />
            </div>
          </div>

          <CalculationBreakdown
            title="Cost Derivation"
            rows={[
              { label: "Purchase Costs", value: Math.round(results.totalPurchase) },
              { label: "Refurbishment (incl. Contingency)", value: Math.round(results.totalRefurb), subValue: `Contingency: ${gbp(results.contingencyAmount)}` },
              { label: "Finance Costs", value: Math.round(results.totalFinance), subValue: `Interest: ${gbp(Math.round(results.financeInterest))} / Fees: ${gbp(inputs.arrangementFees)}` },
              { label: "Sale Costs", value: Math.round(results.totalSaleCosts) },
              { label: "Total Project Costs", value: Math.round(results.totalCosts), isTotal: true },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
