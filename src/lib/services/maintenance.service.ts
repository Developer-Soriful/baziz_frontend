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
    apiClient.get<MaintenanceRequest[]>(ENDPOINTS.COMPLAINTS.BASE).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<MaintenanceRequest>(ENDPOINTS.COMPLAINTS.BY_ID(id)).then((r) => r.data),

  create: (data: Partial<MaintenanceRequest>) =>
    apiClient
      .post<MaintenanceRequest>(ENDPOINTS.COMPLAINTS.BASE, data)
      .then((r) => r.data),

  update: (id: string, data: Partial<MaintenanceRequest>) =>
    apiClient
      .put<MaintenanceRequest>(ENDPOINTS.COMPLAINTS.BY_ID(id), data)
      .then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(ENDPOINTS.COMPLAINTS.BY_ID(id)).then((r) => r.data),
};
