import { useState, useMemo } from "react";

export interface DevInputs {
  // Land
  landPurchasePrice: number;
  stampDuty: number;
  legalFees: number;
  surveyFees: number;

  // Build
  constructionCost: number;
  contingencyRate: number; // %
  architectFees: number;
  planningFees: number;
  buildingControl: number;
  section106cil: number;

  // Finance
  financeCosts: number;
  durationMonths: number;

  // GDV & Sale
  gdv: number;
  salesAgentFees: number;
  salesLegalFees: number;
}

export function useDevCalculator() {
  const [inputs, setInputs] = useState<DevInputs>({
    landPurchasePrice: 500000,
    stampDuty: 15000,
    legalFees: 5000,
    surveyFees: 3000,

    constructionCost: 800000,
    contingencyRate: 10,
    architectFees: 40000,
    planningFees: 15000,
    buildingControl: 10000,
    section106cil: 0,

    financeCosts: 60000,
    durationMonths: 12,

    gdv: 1800000,
    salesAgentFees: 36000,
    salesLegalFees: 8000,
  });

  const results = useMemo(() => {
    const totalLand = inputs.landPurchasePrice + inputs.stampDuty + inputs.legalFees + inputs.surveyFees;
    
    const contingencyAmount = inputs.constructionCost * (inputs.contingencyRate / 100);
    const totalBuild = 
      inputs.constructionCost + 
      contingencyAmount + 
      inputs.architectFees + 
      inputs.planningFees + 
      inputs.buildingControl + 
      inputs.section106cil;

    const totalFinanceAndHolding = inputs.financeCosts;
    const totalSaleCosts = inputs.salesAgentFees + inputs.salesLegalFees;

    const totalCosts = totalLand + totalBuild + totalFinanceAndHolding + totalSaleCosts;
    const grossProfit = inputs.gdv - totalCosts;
    
    const profitOnGDV = inputs.gdv > 0 ? (grossProfit / inputs.gdv) * 100 : 0;
    const profitOnCost = totalCosts > 0 ? (grossProfit / totalCosts) * 100 : 0;

    return {
      totalLand,
      contingencyAmount,
      totalBuild,
      totalFinanceAndHolding,
      totalSaleCosts,
      totalCosts,
      grossProfit,
      profitOnGDV,
      profitOnCost,
    };
  }, [inputs]);

  const updateInput = <K extends keyof DevInputs>(key: K, value: DevInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return { inputs, updateInput, results };
}
