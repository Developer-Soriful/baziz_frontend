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
    apiClient
      .get<any>(ENDPOINTS.RENT_PAYMENTS.LANDLORD)
      .then((r) => r.data?.data?.payments ?? r.data?.payments ?? r.data ?? [])
      .catch(() => []),

  // For tenants
  getMyPayments: () =>
    apiClient.get<any>(ENDPOINTS.RENT_PAYMENTS.TENANT)
      .then((r) => r.data.data.payments)
      .catch((e) => {
        if (e.response?.status === 404) return [];
        throw e;
      }),

  // Create payment intent / charge
  pay: (paymentId: string) =>
    apiClient.post(`${ENDPOINTS.RENT_PAYMENTS.TENANT}/${paymentId}/pay-mock`).then((r) => r.data),

  createPaymentIntent: (paymentId: string) =>
    apiClient.post<any>(`${ENDPOINTS.RENT_PAYMENTS.TENANT}/${paymentId}/pay`)
      .then((r) => r.data.data),

  generateBills: () =>
    apiClient.post<any>(`${ENDPOINTS.RENT_PAYMENTS.LANDLORD}/generate-bills`)
      .then((r) => r.data),
};
