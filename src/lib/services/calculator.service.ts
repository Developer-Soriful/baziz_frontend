import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export type CalculatorType = "roi" | "stamp-duty" | "property-flip" | "development";

export interface SavedCalculation {
  _id: string;
  userId: string;
  calculatorType: CalculatorType;
  name: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  shareToken: string | null;
  isShared: boolean;
  sharedAt: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StampDutyRateSet {
  _id: string;
  region: "england-ni" | "wales" | "scotland";
  regime: "residential" | "residential-ftb" | "commercial";
  status: "active" | "proposal" | "archived";
  bands: Array<{ upTo: number; rate: number }>;
  surchargeRate: number;
}

export const calculatorService = {
  // Calculators CRUD
  saveCalculation: async (data: {
    calculatorType: CalculatorType;
    name: string;
    inputs: any;
    results: any;
    notes?: string;
  }) => {
    const res = await apiClient.post<any>(ENDPOINTS.CALCULATORS.BASE, data);
    return res.data.data.calc as SavedCalculation;
  },

  getSavedCalculations: async (type?: CalculatorType) => {
    const res = await apiClient.get<any>(ENDPOINTS.CALCULATORS.BASE, {
      params: type ? { type } : undefined,
    });
    return res.data.data.calcs as SavedCalculation[];
  },

  updateCalculation: async (
    id: string,
    data: { name?: string; inputs?: any; results?: any; notes?: string }
  ) => {
    const res = await apiClient.patch<any>(ENDPOINTS.CALCULATORS.BY_ID(id), data);
    return res.data.data.calc as SavedCalculation;
  },

  deleteCalculation: async (id: string) => {
    await apiClient.delete(ENDPOINTS.CALCULATORS.BY_ID(id));
  },

  // Sharing
  enableSharing: async (id: string) => {
    const res = await apiClient.post<any>(ENDPOINTS.CALCULATORS.SHARE(id));
    return res.data.data.calc as SavedCalculation;
  },

  disableSharing: async (id: string) => {
    const res = await apiClient.delete<any>(ENDPOINTS.CALCULATORS.SHARE(id));
    return res.data.data.calc as SavedCalculation;
  },

  getSharedCalculation: async (token: string) => {
    const res = await apiClient.get<any>(ENDPOINTS.CALCULATORS.SHARED(token));
    return res.data.data.calc as SavedCalculation;
  },

  // Stamp Duty Rates
  getStampDutyRates: async () => {
    const res = await apiClient.get<any>(ENDPOINTS.STAMP_DUTY.ACTIVE_RATES);
    return res.data.data.rates as StampDutyRateSet[];
  },
};
