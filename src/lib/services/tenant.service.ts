import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { Tenant } from "../data";

export const tenantService = {
  getAll: () =>
    apiClient
      .get<any>(`${ENDPOINTS.TENANTS.BASE}/my-tenants`)
      .then((r) => r.data?.data?.leases || r.data?.leases || r.data || []),

  getById: (id: string) =>
    apiClient.get<Tenant>(ENDPOINTS.TENANTS.BY_ID(id)).then((r) => r.data),

  create: (data: Partial<Tenant>) =>
    apiClient
      .post<any>(`${ENDPOINTS.TENANTS.BASE}/invite`, data)
      .then((r) => r.data),

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

  /** Public — fetch lease preview before signing up (no auth required) */
  getLeasePreview: (leaseId: string) =>
    apiClient
      .get<any>(ENDPOINTS.TENANTS.LEASE_PREVIEW(leaseId))
      .then((r) => r.data?.data || r.data),

  /** Public — accept invitation and create tenant account */
  acceptInvitation: (
    leaseId: string,
    data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }
  ) =>
    apiClient
      .post<any>(ENDPOINTS.TENANTS.ACCEPT_INVITATION(leaseId), data)
      .then((r) => r.data),

  /** Landlord — resend invitation email */
  resendInvitation: (leaseId: string) =>
    apiClient
      .post<any>(`${ENDPOINTS.TENANTS.BASE}/${leaseId}/resend-invitation`, {})
      .then((r) => r.data),

  /** Landlord — allocate parking bay to a lease */
  allocateParkingBay: (propertyId: string, unitId: string, bayNumber: string, leaseId: string) =>
    apiClient
      .post<any>(`${ENDPOINTS.TENANTS.BASE}/properties/${propertyId}/units/${unitId}/parking/allocate`, { bayNumber, leaseId })
      .then((r) => r.data),

  /** Landlord — release parking bay */
  releaseParkingBay: (propertyId: string, unitId: string, bayNumber: string) =>
    apiClient
      .post<any>(`${ENDPOINTS.TENANTS.BASE}/properties/${propertyId}/units/${unitId}/parking/release`, { bayNumber })
      .then((r) => r.data),

  /** Landlord — configure (add/update/remove) parking bays on a unit */
  updateParkingBays: (propertyId: string, unitId: string, data: any) =>
    apiClient
      .put<any>(`${ENDPOINTS.TENANTS.BASE}/properties/${propertyId}/units/${unitId}/parking`, data)
      .then((r) => r.data),
};

