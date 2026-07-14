import { validateBands } from "./validateBands";

describe("validateBands", () => {
  it("should validate valid bands successfully", () => {
    const validBands = [
      { upTo: 250000, rate: 0 },
      { upTo: 925000, rate: 0.05 },
      { upTo: -1, rate: 0.12 },
    ];
    const result = validateBands(validBands);
    expect(result.isValid).toBe(true);
  });

  it("should fail if the last band is not open-ended", () => {
    const invalidBands = [
      { upTo: 250000, rate: 0 },
      { upTo: 925000, rate: 0.05 },
    ];
    const result = validateBands(invalidBands);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("must be open-ended");
  });

  it("should fail if rates are negative", () => {
    const invalidBands = [
      { upTo: 250000, rate: -0.01 },
      { upTo: -1, rate: 0.12 },
    ];
    const result = validateBands(invalidBands);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("negative tax rate");
  });

  it("should fail if bands are not monotonically increasing", () => {
    const invalidBands = [
      { upTo: 925000, rate: 0.05 },
      { upTo: 250000, rate: 0 },
      { upTo: -1, rate: 0.12 },
    ];
    const result = validateBands(invalidBands);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("strictly increasing order");
  });
});
