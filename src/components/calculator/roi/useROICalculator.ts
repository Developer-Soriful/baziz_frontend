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

export function useROICalculator(initialInputs?: ROIInputs) {
  const [inputs, setInputs] = useState<ROIInputs>(
    initialInputs || {
      purchasePrice: 0,
      stampDuty: 0,
      legalFees: 0,
      agentFees: 0,
      refurbCosts: 0,
      otherCosts: 0,

      monthlyRent: 0,
      monthlyMortgagePayment: 0,
      managementFeePercent: 0,
      annualRepairs: 0,
      annualMaintenance: 0,
      annualInsurance: 0,
      annualOtherCosts: 0,

      loanTermYears: 0,
      interestRate: 0,
      downPayment: 0,
    }
  );

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

  return { inputs, setInputs, updateInput, results };
}
