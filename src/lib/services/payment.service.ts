import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface Payment {
  id?: string;
  _id?: string;
  tenant: string;
  property: string;
  amount: string | number;
  status: "Paid" | "Pending" | "Overdue";
  date: string;
}

export const paymentService = {
  // For landlords
  getAll: () =>
    apiClient.get<Payment[]>(ENDPOINTS.RENT_PAYMENTS.LANDLORD).then((r) => r.data),

  // For tenants
  getMyPayments: () =>
    apiClient.get<any>(ENDPOINTS.RENT_PAYMENTS.TENANT)
      .then((r) => r.data.data.payments)
      .catch((e) => {
        if (e.response?.status === 404) return [];
        throw e;
      }),

  // Create payment intent / charge
  pay: (data: { amount: number; paymentMethodId: string }) =>
    apiClient.post(`${ENDPOINTS.RENT_PAYMENTS.TENANT}/charge`, data).then((r) => r.data),
};
