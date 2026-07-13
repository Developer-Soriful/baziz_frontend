import { useState, useMemo } from "react";

export interface ROIInputs {
  purchasePrice: number;
  stampDuty: number;
  legalFees: number;
  agentFees: number;
  refurbCosts: number;
  otherCosts: number;

  monthlyRent: number;
  monthlyMortgagePayment: number;
  managementFeePercent: number;
  annualRepairs: number;
  annualMaintenance: number;
  annualInsurance: number;
  annualOtherCosts: number;

  loanTermYears: number;
  interestRate: number;
  downPayment: number;
}

export function useROICalculator() {
  const [inputs, setInputs] = useState<ROIInputs>({
    purchasePrice: 300000,
    stampDuty: 6000,
    legalFees: 1500,
    agentFees: 0,
    refurbCosts: 5000,
    otherCosts: 0,

    monthlyRent: 1850,
    monthlyMortgagePayment: 800,
    managementFeePercent: 10,
    annualRepairs: 600,
    annualMaintenance: 500,
    annualInsurance: 400,
    annualOtherCosts: 0,

    loanTermYears: 25,
    interestRate: 5,
    downPayment: 75000,
  });

  const results = useMemo(() => {
    const totalInvestment =
      inputs.purchasePrice +
      inputs.stampDuty +
      inputs.legalFees +
      inputs.agentFees +
      inputs.refurbCosts +
      inputs.otherCosts;

    const annualRentalIncome = inputs.monthlyRent * 12;
    const annualManagementFees = annualRentalIncome * (inputs.managementFeePercent / 100);

    const totalAnnualExpenses =
      inputs.monthlyMortgagePayment * 12 +
      annualManagementFees +
      inputs.annualRepairs +
      inputs.annualMaintenance +
      inputs.annualInsurance +
      inputs.annualOtherCosts;

    const netAnnualIncome = annualRentalIncome - totalAnnualExpenses;
    
    const roi = totalInvestment > 0 ? (netAnnualIncome / totalInvestment) * 100 : 0;
    const monthlyNetIncome = netAnnualIncome / 12;

    return {
      totalInvestment,
      annualRentalIncome,
      annualManagementFees,
      totalAnnualExpenses,
      netAnnualIncome,
      roi,
      monthlyNetIncome,
    };
  }, [inputs]);

  const updateInput = <K extends keyof ROIInputs>(key: K, value: ROIInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return { inputs, updateInput, results };
}
