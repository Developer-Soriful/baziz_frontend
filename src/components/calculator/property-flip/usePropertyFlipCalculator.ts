import { useState, useMemo } from "react";

export interface PropertyFlipInputs {
  // Purchase
  purchasePrice: number;
  stampDuty: number;
  legalFees: number;
  surveyFees: number;

  // Refurb
  materialsCost: number;
  contingencyRate: number; // %
  labourCost: number;
  otherCosts: number;

  // Finance
  loanAmount: number;
  interestRate: number; // annual %
  durationMonths: number;
  arrangementFees: number;

  // Sale
  arvSalePrice: number;
  agentFees: number;
  saleLegalFees: number;

  // Tax
  isBusinessFlip: boolean;
  cgtBand: "basic" | "higher" | "additional";
  annualExemption: number;
}

export function usePropertyFlipCalculator() {
  const [inputs, setInputs] = useState<PropertyFlipInputs>({
    purchasePrice: 200000,
    stampDuty: 6000,
    legalFees: 1500,
    surveyFees: 500,

    materialsCost: 30000,
    contingencyRate: 15,
    labourCost: 20000,
    otherCosts: 2000,

    loanAmount: 150000,
    interestRate: 6.5,
    durationMonths: 6,
    arrangementFees: 1500,

    arvSalePrice: 320000,
    agentFees: 3500,
    saleLegalFees: 1200,

    isBusinessFlip: false,
    cgtBand: "higher",
    annualExemption: 3000,
  });

  const results = useMemo(() => {
    // 1. Refurb costs
    const contingencyAmount = inputs.materialsCost * (inputs.contingencyRate / 100);
    const totalRefurb = inputs.materialsCost + contingencyAmount + inputs.labourCost + inputs.otherCosts;

    // 2. Finance costs
    const financeInterest = inputs.loanAmount * (inputs.interestRate / 100) * (inputs.durationMonths / 12);
    const totalFinance = financeInterest + inputs.arrangementFees;

    // 3. Purchase & Sale costs
    const totalPurchase = inputs.purchasePrice + inputs.stampDuty + inputs.legalFees + inputs.surveyFees;
    const totalSaleCosts = inputs.agentFees + inputs.saleLegalFees;

    // 4. Overall Totals
    const totalCosts = totalPurchase + totalRefurb + totalFinance + totalSaleCosts;
    const grossProfit = inputs.arvSalePrice - totalCosts;

    // 5. Capital Gains Tax (CGT)
    let cgtAmount = 0;
    if (!inputs.isBusinessFlip) {
      const taxableGain = Math.max(0, grossProfit - inputs.annualExemption);
      const cgtRate = inputs.cgtBand === "basic" ? 0.18 : 0.28; // 'additional' also pays 28% for residential property
      cgtAmount = taxableGain * cgtRate;
    }

    const netProfit = grossProfit - cgtAmount;
    const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
    const profitMargin = inputs.arvSalePrice > 0 ? (netProfit / inputs.arvSalePrice) * 100 : 0;

    return {
      contingencyAmount,
      totalRefurb,
      financeInterest,
      totalFinance,
      totalPurchase,
      totalSaleCosts,
      totalCosts,
      grossProfit,
      cgtAmount,
      netProfit,
      roi,
      profitMargin,
    };
  }, [inputs]);

  const updateInput = <K extends keyof PropertyFlipInputs>(key: K, value: PropertyFlipInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return { inputs, updateInput, results };
}
