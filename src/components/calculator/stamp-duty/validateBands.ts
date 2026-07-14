export interface TaxBand {
  upTo: number;
  rate: number;
}

/**
 * Validates tax bands based on the requirements:
 * 1. Sorted thresholds (monotonically increasing upTo)
 * 2. Non-negative rates
 * 3. Open-ended top band (upTo === -1 or Infinity)
 */
export function validateBands(bands: TaxBand[]): { isValid: boolean; error?: string } {
  if (!bands || bands.length === 0) {
    return { isValid: false, error: "At least one tax band is required." };
  }

  // Check open-ended last band
  const lastBand = bands[bands.length - 1];
  if (lastBand.upTo !== -1 && lastBand.upTo !== Infinity) {
    return { isValid: false, error: "The last band must be open-ended (value must be -1 or Infinity)." };
  }

  let previousUpTo = -1;

  for (let i = 0; i < bands.length; i++) {
    const band = bands[i];

    // Non-negative rate check
    if (band.rate < 0) {
      return { isValid: false, error: `Band ${i + 1} has a negative tax rate. Rates must be non-negative.` };
    }

    if (i < bands.length - 1) {
      if (band.upTo === -1 || band.upTo === Infinity) {
        return { isValid: false, error: "Only the last band can be open-ended." };
      }

      // Monotonically increasing check
      if (band.upTo <= previousUpTo) {
        return { isValid: false, error: `Bands must be in strictly increasing order. Band ${i + 1} (up to ${band.upTo}) is not greater than the previous band.` };
      }

      previousUpTo = band.upTo;
    }
  }

  return { isValid: true };
}
