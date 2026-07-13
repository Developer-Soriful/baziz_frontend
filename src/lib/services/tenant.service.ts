import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { Tenant } from "../data";

export const tenantService = {
  getAll: () =>
    apiClient.get<Tenant[]>(ENDPOINTS.TENANTS.BASE).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Tenant>(ENDPOINTS.TENANTS.BY_ID(id)).then((r) => r.data),

  create: (data: Partial<Tenant>) =>
    apiClient.post<Tenant>(ENDPOINTS.TENANTS.BASE, data).then((r) => r.data),

  update: (id: string, data: Partial<Tenant>) =>
    apiClient
      .put<Tenant>(ENDPOINTS.TENANTS.BY_ID(id), data)
      .then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(ENDPOINTS.TENANTS.BY_ID(id)).then((r) => r.data),

  getMyLease: () =>
    apiClient.get<any>(ENDPOINTS.TENANT_DASHBOARD.MY_LEASE)
      .then(r => {
        const data = r.data.data;
        if (data && data.leaseEndDate) {
          data.leaseEnd = data.leaseEndDate;
        }
        return data;
      })
      .catch((e) => {
        if (e.response?.status === 404) return null;
        throw e;
      }),

  getDashboard: () =>
    apiClient.get<any>(ENDPOINTS.TENANT_DASHBOARD.DASHBOARD)
      .then(r => r.data.data)
      .catch((e) => {
        if (e.response?.status === 404) return null;
        throw e;
      }),
};
