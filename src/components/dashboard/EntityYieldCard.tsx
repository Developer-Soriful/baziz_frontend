"use client";

import { useState } from "react";
import { cn, gbp } from "@/lib/utils";
import { Card } from "@/components/ui/primitives";
import { Info, HelpCircle } from "lucide-react";

interface EntityYieldCardProps {
  properties: any[];
}

export function EntityYieldCard({ properties }: EntityYieldCardProps) {
  type YieldMode = "gross" | "net-initial";
  const [yieldMode, setYieldMode] = useState<YieldMode>("gross");
  const isNet = yieldMode === "net-initial";

  // Group properties by ownershipEntity
  const groups: Record<string, any[]> = {};
  for (const p of properties) {
    const entityName = p.ownership?.ownershipEntity || p.ownershipEntity || "Personal Portfolio";
    if (!groups[entityName]) {
      groups[entityName] = [];
    }
    groups[entityName].push(p);
  }

  // Calculate yield for each property
  const getPropertyYieldDetails = (p: any) => {
    const units = p.units || [];
    const monthlyRent = units.reduce((acc: number, u: any) => acc + (u.rentAmount || 0), 0);
    const annualRent = monthlyRent * 12;

    const purchasePrice = p.purchasePrice || p.purchase?.purchasePrice || 0;
    
    const comp = p.compliance || {};
    const addCosts = p.additionalCosts || {};
    const stampDuty = addCosts.stampDutyLandTax || p.stampDutyLandTax || 0;
    const legalCosts = addCosts.legalFees || p.legalFees || 0;
    const agentFees = addCosts.agentFees || p.agentFees || 0;
    const refurbishmentCost = addCosts.initialRefurbishment || p.initialRefurbishment || 0;

    const extras = stampDuty + legalCosts + agentFees + refurbishmentCost;
    const totalAcquisitionCost = purchasePrice + extras;

    const gross = purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0;
    const netInitial = totalAcquisitionCost > 0 ? (annualRent / totalAcquisitionCost) * 100 : 0;

    return {
      gross,
      netInitial,
      purchasePrice,
      totalAcquisitionCost,
      extras,
    };
  };

  // Aggregate per entity
  const entities = Object.entries(groups).map(([name, props]) => {
    const details = props.map(getPropertyYieldDetails);
    
    // Average yield: simple arithmetic mean of per-property yield in the selected mode
    const averageGross = details.reduce((sum, d) => sum + d.gross, 0) / details.length;
    const averageNetInitial = details.reduce((sum, d) => sum + d.netInitial, 0) / details.length;
    
    const sumPurchasePrice = details.reduce((sum, d) => sum + d.purchasePrice, 0);
    const sumAcquisitionCost = details.reduce((sum, d) => sum + d.totalAcquisitionCost, 0);
    const sumExtras = details.reduce((sum, d) => sum + d.extras, 0);

    const averageYield = isNet ? averageNetInitial : averageGross;
    const totalCost = isNet ? sumAcquisitionCost : sumPurchasePrice;

    return {
      name,
      count: props.length,
      averageYield,
      totalCost,
      hasExtras: sumExtras > 0,
    };
  });

  // Sort by averageYield descending
  entities.sort((a, b) => b.averageYield - a.averageYield);

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-1.5">
            Yield by Ownership
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-text-faint cursor-pointer hover:text-text" />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-60 -translate-x-1/2 rounded-lg border border-border bg-surface p-2 text-xs text-text shadow-float opacity-0 transition group-hover:opacity-100 font-normal">
                {isNet
                  ? "Average Net Initial Yield (arithmetic mean of Net Initial yields) and total acquisition cost."
                  : "Average Gross Yield (arithmetic mean of Gross yields) and total purchase price."}
              </div>
            </div>
          </h3>

          <div className="flex rounded-md bg-surface-2 p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setYieldMode("gross")}
              className={cn(
                "px-2.5 py-1 font-semibold rounded transition",
                yieldMode === "gross" ? "bg-surface text-text shadow-sm" : "text-text-muted hover:text-text"
              )}
            >
              Gross
            </button>
            <button
              type="button"
              onClick={() => setYieldMode("net-initial")}
              className={cn(
                "px-2.5 py-1 font-semibold rounded transition",
                yieldMode === "net-initial" ? "bg-surface text-text shadow-sm" : "text-text-muted hover:text-text"
              )}
            >
              Net Initial
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {entities.length === 0 ? (
            <p className="text-xs text-text-faint text-center py-4">No properties found</p>
          ) : (
            entities.map((ent) => (
              <div key={ent.name} className="flex flex-col border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    <span className="font-medium text-text">{ent.name}</span>
                    <span className="text-text-faint text-xs ml-1.5">· {ent.count} properties</span>
                  </span>
                  <span className="font-extrabold text-primary">{ent.averageYield.toFixed(2)}%</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-text-faint">
                  <span>Denominator: {gbp(ent.totalCost)}</span>
                  {isNet && !ent.hasExtras && (
                    <span className="text-warning-deep flex items-center gap-0.5">
                      <Info className="h-3 w-3" /> No acquisition costs
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
