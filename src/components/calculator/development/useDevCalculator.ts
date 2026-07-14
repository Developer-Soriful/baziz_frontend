import { useState, useMemo } from "react";

export interface DevInputs {
  // Acquisition
  purchasePrice: number;
  stampDuty: number;
  legalCosts: number;
  surveyFees: number;

  // Development
  constructionCost: number;
  contingencyRate: number; // %
  architectFees: number;
  planningCosts: number;
  buildingControlFees: number;
  loanAmount: number;
  financeRate: number; // annual %
  financeFees: number; // one-off £

  // Project
  projectDuration: number; // months

  // Sale
  projectedSalePrice: number; // GDV
  agentFees: number;
  legalSaleCosts: number;
}

export function useDevCalculator(initialInputs?: DevInputs) {
  const [inputs, setInputs] = useState<DevInputs>(
    initialInputs || {
      purchasePrice: 0,
      stampDuty: 0,
      legalCosts: 0,
      surveyFees: 0,

      constructionCost: 0,
      contingencyRate: 0,
      architectFees: 0,
      planningCosts: 0,
      buildingControlFees: 0,
      loanAmount: 0,
      financeRate: 0,
      financeFees: 0,

      projectDuration: 0,

      projectedSalePrice: 0,
      agentFees: 0,
      legalSaleCosts: 0,
    }
  );

  const results = useMemo(() => {
    const totalAcquisitionCosts =
      inputs.purchasePrice + inputs.stampDuty + inputs.legalCosts + inputs.surveyFees;

    const contingency = inputs.constructionCost * (inputs.contingencyRate / 100);
    
    const durationYears = Math.max(inputs.projectDuration, 0) / 12;
    const financeInterest = inputs.loanAmount * (inputs.financeRate / 100) * durationYears;
    const financeCosts = financeInterest + inputs.financeFees;

    const totalDevelopmentCosts =
      inputs.constructionCost +
      contingency +
      inputs.architectFees +
      inputs.planningCosts +
      inputs.buildingControlFees +
      financeCosts;

    const totalProjectCosts = totalAcquisitionCosts + totalDevelopmentCosts;
    const totalSaleCosts = inputs.agentFees + inputs.legalSaleCosts;
    const netProceeds = inputs.projectedSalePrice - totalSaleCosts;
    
    const grossProfit = netProceeds - totalProjectCosts;

    const profitMargin = totalProjectCosts > 0 ? (grossProfit / totalProjectCosts) * 100 : 0;
    const returnOnCost = profitMargin;
    const returnOnGDV = inputs.projectedSalePrice > 0 ? (grossProfit / inputs.projectedSalePrice) * 100 : 0;
    const costPerMonth = inputs.projectDuration > 0 ? totalProjectCosts / inputs.projectDuration : 0;

    return {
      totalAcquisitionCosts,
      contingency,
      durationYears,
      financeInterest,
      financeCosts,
      totalDevelopmentCosts,
      totalProjectCosts,
      totalSaleCosts,
      netProceeds,
      grossProfit,
      profitMargin,
      returnOnCost,
      returnOnGDV,
      costPerMonth,
    };
  }, [inputs]);

  const updateInput = <K extends keyof DevInputs>(key: K, value: DevInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return { inputs, setInputs, updateInput, results };
}
