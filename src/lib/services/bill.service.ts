import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface MonthlyBill {
  _id: string;
  propertyId: any;
  unitId: any;
  tenantId: any;
  billType: string;
  amount: number;
  currency: string;
  dueDate: string;
  billingMonth: string;
  status: "Pending" | "Paid" | "Overdue";
  description?: string;
  providerDetails?: {
    name?: string;
    contact?: string;
    website?: string;
  };
  receiptUrl?: string;
}

export const billService = {
  getAll: () =>
    apiClient.get<any>(ENDPOINTS.BILLS.BASE)
      .then((r) => r.data.data.bills as MonthlyBill[])
      .catch((e) => {
        if (e.response?.status === 404) return [];
        throw e;
      }),
};
