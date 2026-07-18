"use client";

import { useState } from "react";
import { cn, gbp } from "@/lib/utils";
import { Info, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/primitives";

interface PropertyFinancialMetricsProps {
  property: any;
  tenants: any[];
}

export function PropertyFinancialMetrics({
  property,
  tenants,
}: PropertyFinancialMetricsProps) {
  type YieldMode = "gross" | "net-initial";
  const [yieldMode, setYieldMode] = useState<YieldMode>("gross");

  // Calculate annual rent based on tenants (sum t.rent) or fallback to units' rent
  const tenantsMonthlyRent = tenants.reduce((acc, t) => acc + (Number(t.rent) || 0), 0);
  const unitsMonthlyRent = (property?.units || []).reduce((acc: number, u: any) => acc + (u.rentAmount || 0), 0);
  const totalMonthlyRent = tenantsMonthlyRent || unitsMonthlyRent || 0;
  const annualRent = totalMonthlyRent * 12;

  const purchasePrice = property?.purchasePrice || property?.purchase?.purchasePrice || 0;

  // Extract additional costs
  const comp = property?.compliance || {};
  const addCosts = property?.additionalCosts || {};
  const stampDuty = addCosts.stampDutyLandTax || property?.stampDutyLandTax || 0;
  const legalCosts = addCosts.legalFees || property?.legalFees || 0;
  const agentFees = addCosts.agentFees || property?.agentFees || 0;
  const refurbishmentCost = addCosts.initialRefurbishment || property?.initialRefurbishment || 0;

  const extras = stampDuty + legalCosts + agentFees + refurbishmentCost;
  const totalAcquisitionCost = purchasePrice + extras;
  const hasAcquisitionCosts = extras > 0;

  // Yield calculations (guard divide by zero)
  const grossYield = purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0;
  const netInitialYield = totalAcquisitionCost > 0 ? (annualRent / totalAcquisitionCost) * 100 : 0;

  const isNet = yieldMode === "net-initial";
  const displayedYield = isNet ? netInitialYield : grossYield;
  const denominatorVal = isNet ? totalAcquisitionCost : purchasePrice;

  return (
    <div className="space-y-4">
      {/* Yield Overview Card */}
      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-muted flex items-center gap-1.5">
              Rental Yield
              <div className="group relative">
                <HelpCircle className="h-4 w-4 text-text-faint cursor-pointer hover:text-text transition" />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-border bg-surface p-2.5 text-xs text-text shadow-float opacity-0 transition group-hover:opacity-100">
                  <p className="font-semibold mb-1">About Rental Yield</p>
                  <p className="text-text-muted">
                    {isNet
                      ? "Net Initial Yield factors in purchase cost plus additional acquisition extras (taxes, legal fees, agent fees, refurbishments)."
                      : "Gross Yield only compares annual rental income against the headline purchase price."}
                  </p>
                </div>
              </div>
            </h3>
            <p className="mt-1 text-3xl font-extrabold text-primary">
              {displayedYield.toFixed(2)}%
            </p>
            <p className="mt-1 text-xs text-text-faint">
              {isNet ? "Net denominator" : "Gross denominator"}: {gbp(denominatorVal)}
            </p>
          </div>

          <div className="w-full sm:w-48">
            <div className="flex rounded-lg bg-surface-2 p-1">
              <button
                type="button"
                onClick={() => setYieldMode("gross")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-md transition",
                  yieldMode === "gross" ? "bg-surface text-text shadow-sm" : "text-text-muted hover:text-text"
                )}
              >
                Gross
              </button>
              <button
                type="button"
                onClick={() => setYieldMode("net-initial")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-md transition",
                  yieldMode === "net-initial" ? "bg-surface text-text shadow-sm" : "text-text-muted hover:text-text"
                )}
              >
                Net Initial
              </button>
            </div>
          </div>
        </div>

        {isNet && !hasAcquisitionCosts && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/20 p-3 text-xs text-warning-deep">
            <Info className="h-4 w-4 shrink-0" />
            <span>No acquisition costs recorded — net initial equals gross.</span>
          </div>
        )}
      </Card>

      {/* Yield Breakdown Panel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Gross Card */}
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-sm">Gross Yield</h4>
              <div className="group relative">
                <Info className="h-4 w-4 text-text-faint cursor-pointer hover:text-text" />
                <div className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-56 rounded-lg border border-border bg-surface p-2 text-xs text-text shadow-float opacity-0 transition group-hover:opacity-100">
                  Formula: (Annual Rent / Purchase Price) &times; 100
                </div>
              </div>
            </div>
            <div className="text-xs text-text-muted space-y-1">
              <p>Annual Rent: {gbp(annualRent)}</p>
              <p>Purchase Price: {gbp(purchasePrice)}</p>
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-3 flex items-center justify-between">
            <span className="text-xs text-text-faint">{gbp(annualRent)} / {gbp(purchasePrice)}</span>
            <span className="font-bold text-sm text-primary">{grossYield.toFixed(2)}%</span>
          </div>
        </Card>

        {/* Net Initial Card */}
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-sm">Net Initial Yield</h4>
              <div className="group relative">
                <Info className="h-4 w-4 text-text-faint cursor-pointer hover:text-text" />
                <div className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-56 rounded-lg border border-border bg-surface p-2 text-xs text-text shadow-float opacity-0 transition group-hover:opacity-100">
                  Formula: (Annual Rent / Total Acquisition Cost) &times; 100
                </div>
              </div>
            </div>
            <div className="text-xs text-text-muted space-y-1">
              <p>Annual Rent: {gbp(annualRent)}</p>
              <p>Total Acquisition: {gbp(totalAcquisitionCost)}</p>
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-3 flex items-center justify-between">
            <span className="text-xs text-text-faint">{gbp(annualRent)} / {gbp(totalAcquisitionCost)}</span>
            <span className="font-bold text-sm text-primary">{netInitialYield.toFixed(2)}%</span>
          </div>
        </Card>
      </div>

      {/* Costs Used Micro-table */}
      {isNet && (
        <Card className="p-4">
          <h4 className="font-bold text-sm mb-3">Costs Used for Net Initial Yield</h4>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-2 border-b border-border">
                  <th className="px-4 py-2 font-semibold text-text-muted">Item</th>
                  <th className="px-4 py-2 font-semibold text-text-muted text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2 text-text-muted">Purchase Price</td>
                  <td className="px-4 py-2 text-right font-medium">{gbp(purchasePrice)}</td>
                </tr>
                {stampDuty > 0 && (
                  <tr>
                    <td className="px-4 py-2 text-text-muted">Stamp Duty (SDLT)</td>
                    <td className="px-4 py-2 text-right font-medium">{gbp(stampDuty)}</td>
                  </tr>
                )}
                {legalCosts > 0 && (
                  <tr>
                    <td className="px-4 py-2 text-text-muted">Legal Fees</td>
                    <td className="px-4 py-2 text-right font-medium">{gbp(legalCosts)}</td>
                  </tr>
                )}
                {agentFees > 0 && (
                  <tr>
                    <td className="px-4 py-2 text-text-muted">Agent Fees</td>
                    <td className="px-4 py-2 text-right font-medium">{gbp(agentFees)}</td>
                  </tr>
                )}
                {refurbishmentCost > 0 && (
                  <tr>
                    <td className="px-4 py-2 text-text-muted">Initial Refurbishment</td>
                    <td className="px-4 py-2 text-right font-medium">{gbp(refurbishmentCost)}</td>
                  </tr>
                )}
                <tr className="bg-surface-2 font-bold border-t border-border">
                  <td className="px-4 py-2">Total Acquisition Cost</td>
                  <td className="px-4 py-2 text-right text-primary">{gbp(totalAcquisitionCost)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
