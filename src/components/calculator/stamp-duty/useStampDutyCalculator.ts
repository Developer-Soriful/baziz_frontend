import { useState, useMemo } from "react";
import { useStampDutyRates } from "./useStampDutyRates";

export interface StampDutyInputs {
  region: "england-ni" | "wales" | "scotland";
  propertyType: "residential" | "commercial";
  buyerType: "personal" | "company";
  propertyPrice: number;
  isFirstTimeBuyer: boolean;
  isSecondHome: boolean;
}

export function useStampDutyCalculator() {
  const { data: rates = [], isLoading } = useStampDutyRates();

  const [inputs, setInputs] = useState<StampDutyInputs>({
    region: "england-ni",
    propertyType: "residential",
    buyerType: "personal",
    propertyPrice: 300000,
    isFirstTimeBuyer: false,
    isSecondHome: false,
  });

  const results = useMemo(() => {
    if (!rates.length) return { tax: 0, rows: [] };

    // 1. Regime selection
    let regime: "commercial" | "residential-ftb" | "residential" = "residential";
    if (inputs.buyerType === "company" || inputs.propertyType === "commercial") {
      regime = "commercial";
    } else if (inputs.isFirstTimeBuyer) {
      regime = "residential-ftb";
    }

    // 2. Find rate set
    let rateSet = rates.find((r) => r.region === inputs.region && r.regime === regime);

    // FTB Fallback (if price > 625k, FTB relief is usually lost, fallback to residential)
    // The exact fallback logic depends on the HMRC rules, but standard behavior is if they don't qualify,
    // they fall back to standard residential. If the DB doesn't have a specific FTB band for high prices,
    // we should fallback if FTB rate set isn't found or if we want to manually trigger it.
    if (!rateSet && regime === "residential-ftb") {
      regime = "residential";
      rateSet = rates.find((r) => r.region === inputs.region && r.regime === regime);
    }

    if (!rateSet) return { tax: 0, rows: [] };

    // 3. Band maths
    const rows = [];
    let tax = 0;
    let previousUpper = 0;
    const price = inputs.propertyPrice;

    // Sort bands just in case
    const sortedBands = [...rateSet.bands].sort((a, b) => {
      if (a.upTo === -1) return 1;
      if (b.upTo === -1) return -1;
      return a.upTo - b.upTo;
    });

    for (const band of sortedBands) {
      if (price > previousUpper) {
        const upperLimit = band.upTo === -1 ? Infinity : band.upTo;
        const taxable = Math.max(0, Math.min(price, upperLimit) - previousUpper);
        
        let sliceTax = taxable * band.rate;
        rows.push({
          band: `${previousUpper} - ${band.upTo === -1 ? "Infinity" : band.upTo}`,
          taxable,
          rate: band.rate,
          tax: sliceTax,
          isSurcharge: false
        });

        tax += sliceTax;
        previousUpper = band.upTo === -1 ? price : band.upTo;
      } else {
        break;
      }
    }

    // 4. Surcharge
    if (inputs.isSecondHome && regime !== "commercial") {
      const surcharge = price * rateSet.surchargeRate;
      tax += surcharge;
      rows.push({
        band: "Additional Property Surcharge",
        taxable: price,
        rate: rateSet.surchargeRate,
        tax: surcharge,
        isSurcharge: true
      });
    }

    return { tax, rows };
  }, [inputs, rates]);

  const updateInput = <K extends keyof StampDutyInputs>(
    key: K,
    value: StampDutyInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return { inputs, updateInput, results, isLoading };
}
