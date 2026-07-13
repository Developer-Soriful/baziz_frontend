import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface MonthlyBill {
  _id: string;
  propertyId: any;
  unitId: any;
  tenantId: any;
  landlordId: any;
  billType: "water" | "electricity" | "gas" | "council_tax" | "broadband" | "other";
  supplier: string;
  accountReference: string;
  monthlyAmount: number;
  dueDay: number;
  paymentStatus: "paid" | "pending" | "overdue";
  supplierPhone?: string;
  supplierWebsite?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AddBillInput = Omit<
  MonthlyBill,
  | "_id"
  | "propertyId"
  | "unitId"
  | "tenantId"
  | "landlordId"
  | "paymentStatus"
  | "isActive"
  | "createdAt"
  | "updatedAt"
>;

export const billService = {
  getAll: () =>
    apiClient.get<any>(ENDPOINTS.BILLS.BASE)
      .then((r) => r.data.data.bills as MonthlyBill[])
      .catch((e) => {
        if (e.response?.status === 404) return [];
        throw e;
      }),

  addBill: (data: AddBillInput) =>
    apiClient.post<any>(ENDPOINTS.BILLS.BASE, data)
      .then((r) => r.data.data.bill as MonthlyBill),

  updateBill: (id: string, data: Partial<AddBillInput>) =>
    apiClient.patch<any>(ENDPOINTS.BILLS.BY_ID(id), data)
      .then((r) => r.data.data.bill as MonthlyBill),

  deleteBill: (id: string) =>
    apiClient.delete<any>(ENDPOINTS.BILLS.BY_ID(id))
      .then((r) => r.data),

  updateStatus: (id: string, paymentStatus: "paid" | "pending" | "overdue") =>
    apiClient.patch<any>(`${ENDPOINTS.BILLS.BY_ID(id)}/status`, { paymentStatus })
      .then((r) => r.data.data.bill as MonthlyBill),
};
