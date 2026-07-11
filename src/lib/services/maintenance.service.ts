import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

// Temporary fallback type for Maintenance/Complaint
export interface MaintenanceRequest {
  id?: string;
  _id?: string;
  title: string;
  property: string;
  status: "Pending" | "In Progress" | "Resolved";
  date: string;
  priority: string;
}

export const maintenanceService = {
  getAll: () =>
    apiClient.get<any>(ENDPOINTS.MAINTENANCE.BASE).then((r) => r.data.data.requests || r.data.data),

  getById: (id: string) =>
    apiClient.get<any>(ENDPOINTS.MAINTENANCE.BY_ID(id)).then((r) => r.data.data.request || r.data.data),

  create: (data: Partial<MaintenanceRequest>) =>
    apiClient
      .post<any>(ENDPOINTS.MAINTENANCE.BASE, data)
      .then((r) => r.data.data),

  update: (id: string, data: Partial<MaintenanceRequest>) =>
    apiClient
      .put<any>(ENDPOINTS.MAINTENANCE.BY_ID(id), data)
      .then((r) => r.data.data),

  delete: (id: string) =>
    apiClient.delete(ENDPOINTS.MAINTENANCE.BY_ID(id)).then((r) => r.data),
};
