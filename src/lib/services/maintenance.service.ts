import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

// Temporary fallback type for Maintenance/Complaint
export interface MaintenanceRequest {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  category?: string;
  property?: string;
  status: "open" | "in_progress" | "resolved" | "closed" | "Pending" | "In Progress" | "Resolved";
  date?: string;
  priority: string;
  cost?: number;
}

export const maintenanceService = {
  getAll: (params?: any) =>
    apiClient.get<any>(ENDPOINTS.MAINTENANCE.BASE, { params }).then((r) => r.data.data.requests || r.data.data),

  getById: (id: string) =>
    apiClient.get<any>(ENDPOINTS.MAINTENANCE.BY_ID(id)).then((r) => r.data.data.maintenanceRequest || r.data.data),

  create: (data: any) =>
    apiClient
      .post<any>(ENDPOINTS.MAINTENANCE.BASE, data)
      .then((r) => r.data.data),

  updateStatus: (id: string, status: string) =>
    apiClient
      .patch<any>(`${ENDPOINTS.MAINTENANCE.BY_ID(id)}/status`, { status })
      .then((r) => r.data.data),

  delete: (id: string) =>
    apiClient.delete(ENDPOINTS.MAINTENANCE.BY_ID(id)).then((r) => r.data),
};
