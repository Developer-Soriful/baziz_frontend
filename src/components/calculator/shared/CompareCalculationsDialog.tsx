import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/primitives";
import { useQuery } from "@tanstack/react-query";
import { calculatorService, CalculatorType, SavedCalculation } from "@/lib/services/calculator.service";
import { gbp } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  calculatorType: CalculatorType;
}

export function CompareCalculationsDialog({ open, onClose, calculatorType }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const { data: calculations = [], isLoading } = useQuery({
    queryKey: ["savedCalculations", calculatorType],
    queryFn: () => calculatorService.getSavedCalculations(calculatorType),
    enabled: open,
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const selectedCalcs = calculations.filter((c) => selectedIds.includes(c._id));

  const getComparisonFields = (): { label: string; key: string; isNumeric?: boolean }[] => {
    switch (calculatorType) {
      case "roi":
        return [
          { label: "Purchase Price", key: "inputs.purchasePrice", isNumeric: true },
          { label: "Total Investment", key: "results.totalInvestment", isNumeric: true },
          { label: "Annual Rental Income", key: "results.annualRentalIncome", isNumeric: true },
          { label: "Total Annual Expenses", key: "results.totalAnnualExpenses", isNumeric: true },
          { label: "Monthly Cash Flow", key: "results.monthlyNetIncome", isNumeric: true },
          { label: "ROI", key: "results.roi" },
        ];
      case "stamp-duty":
        return [
          { label: "Region", key: "inputs.region" },
          { label: "Property Price", key: "inputs.propertyPrice", isNumeric: true },
          { label: "Property Type", key: "inputs.propertyType" },
          { label: "Buyer Type", key: "inputs.buyerType" },
          { label: "First Time Buyer?", key: "inputs.isFirstTimeBuyer" },
          { label: "Additional Property?", key: "inputs.isSecondHome" },
          { label: "Total Tax", key: "results.tax", isNumeric: true },
        ];
      case "property-flip":
        return [
          { label: "Purchase Price", key: "inputs.purchasePrice", isNumeric: true },
          { label: "Total Costs", key: "results.totalCosts", isNumeric: true },
          { label: "Refurb Cost", key: "results.totalRefurb", isNumeric: true },
          { label: "ARV (Sale Price)", key: "inputs.arvSalePrice", isNumeric: true },
          { label: "Gross Profit", key: "results.grossProfit", isNumeric: true },
          { label: "CGT Paid", key: "results.cgtAmount", isNumeric: true },
          { label: "Net Profit", key: "results.netProfit", isNumeric: true },
          { label: "ROI", key: "results.roi" },
        ];
      case "development":
        return [
          { label: "Land Price", key: "inputs.purchasePrice", isNumeric: true },
          { label: "Total Acquisition Costs", key: "results.totalAcquisitionCosts", isNumeric: true },
          { label: "Construction Cost", key: "inputs.constructionCost", isNumeric: true },
          { label: "Total Build Cost", key: "results.totalDevelopmentCosts", isNumeric: true },
          { label: "Project Duration", key: "inputs.projectDuration" },
          { label: "GDV", key: "inputs.projectedSalePrice", isNumeric: true },
          { label: "Gross Profit", key: "results.grossProfit", isNumeric: true },
          { label: "Profit on GDV", key: "results.returnOnGDV" },
          { label: "Profit on Cost (ROC)", key: "results.returnOnCost" },
        ];
    }
  };

  const getFieldValue = (calc: SavedCalculation, keyPath: string, isNumeric?: boolean) => {
    const parts = keyPath.split(".");
    let val: any = calc;
    for (const part of parts) {
      if (val === null || val === undefined) return "-";
      val = val[part];
    }

    if (val === null || val === undefined) return "-";
    if (typeof val === "boolean") return val ? "Yes" : "No";

    if (isNumeric && typeof val === "number") {
      return gbp(Math.round(val));
    }

    if (keyPath.endsWith("roi") || keyPath.endsWith("returnOnGDV") || keyPath.endsWith("returnOnCost")) {
      return `${Number(val).toFixed(2)}%`;
    }

    return String(val);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isComparing ? "Compare Calculations" : "Select to Compare"}
      subtitle={
        isComparing
          ? "Side-by-side comparison of selected calculations"
          : "Select up to 3 calculations to compare side-by-side"
      }
      size={isComparing ? "lg" : "md"}
      footer={
        <>
          {isComparing ? (
            <Button variant="secondary" onClick={() => setIsComparing(false)}>
              Back
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsComparing(true)}
                disabled={selectedIds.length < 2}
              >
                Compare ({selectedIds.length})
              </Button>
            </>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-6 text-center text-text-muted text-sm">Loading calculations...</div>
        ) : !isComparing ? (
          calculations.length === 0 ? (
            <div className="py-6 text-center text-text-muted text-sm">
              No saved calculations found for this calculator.
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[50vh] overflow-y-auto pr-1">
              {calculations.map((calc) => (
                <label
                  key={calc._id}
                  className="flex items-center justify-between py-3 cursor-pointer select-none"
                >
                  <div className="flex-1 mr-4">
                    <h4 className="font-bold text-sm text-text">{calc.name}</h4>
                    {calc.notes && <p className="text-xs text-text-muted mt-0.5">{calc.notes}</p>}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(calc._id)}
                    onChange={() => toggleSelect(calc._id)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                </label>
              ))}
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-bold text-text-muted w-1/4">Metric</th>
                  {selectedCalcs.map((calc) => (
                    <th key={calc._id} className="py-2 px-3 text-right font-bold text-text">
                      {calc.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {getComparisonFields().map((field) => (
                  <tr key={field.key} className="hover:bg-surface-2">
                    <td className="py-2 text-left font-medium text-text-muted">{field.label}</td>
                    {selectedCalcs.map((calc) => (
                      <td key={calc._id} className="py-2 px-3 text-right font-semibold text-text">
                        {getFieldValue(calc, field.key, field.isNumeric)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
