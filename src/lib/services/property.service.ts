import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { Property } from "../data";

export const propertyService = {
  getAll: () =>
    apiClient.get<any>(ENDPOINTS.PROPERTIES.BASE).then((r) => r.data.data || r.data),

  getById: (id: string) =>
    apiClient.get<any>(ENDPOINTS.PROPERTIES.BY_ID(id)).then((r) => r.data.data || r.data),

  create: (data: FormData | Partial<Property>) =>
    apiClient
      .post<any>(ENDPOINTS.PROPERTIES.BASE, data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      })
      .then((r) => r.data.data || r.data),

  update: (id: string, data: FormData | Partial<Property>) =>
    apiClient
      .patch<any>(ENDPOINTS.PROPERTIES.BY_ID(id), data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      })
      .then((r) => r.data.data || r.data),

  delete: (id: string) =>
    apiClient.delete(ENDPOINTS.PROPERTIES.BY_ID(id)).then((r) => r.data),

  getCurrentTenants: (id: string) =>
    apiClient
      .get<any>(`${ENDPOINTS.PROPERTIES.BY_ID(id)}/current-tenants`)
      .then((r) => r.data?.data?.tenants || r.data?.tenants || []),

  getExpenses: (propertyId: string) =>
    apiClient
      .get<any>(`${ENDPOINTS.PROPERTIES.BY_ID(propertyId)}/expenses`)
      .then((r) => r.data?.data?.expenses || r.data?.expenses || []),

  getExpensesReport: (propertyId: string, groupBy: "category" | "month" = "category") =>
    apiClient
      .get<any>(`${ENDPOINTS.PROPERTIES.BY_ID(propertyId)}/expenses/report`, { params: { groupBy } })
      .then((r) => r.data?.data || r.data),
};
