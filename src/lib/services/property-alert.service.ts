import { apiClient } from "../api/client";

export interface AlertNotif {
  _id: string;
  userId: string;
  title: string;
  description: string;
  iconName: string;
  tone: "success" | "info" | "warning";
  isRead: boolean;
  createdAt: string;
}

export interface AlertConfig {
  _id: string;
  title: string;
  propertyType: string;
  location: string;
  isActive: boolean;
  createdAt: string;
}

export const propertyAlertService = {
  // Configs
  getConfigs: () =>
    apiClient.get<any>("/property-alerts/configs").then((r) => r.data.data),

  createConfig: (data: { title: string; propertyType: string; location: string }) =>
    apiClient.post<any>("/property-alerts/configs", data).then((r) => r.data.data),

  toggleConfig: (id: string) =>
    apiClient.patch<any>(`/property-alerts/configs/${id}/toggle`).then((r) => r.data.data),

  // Notifications
  getNotifications: () =>
    apiClient.get<any>("/property-alerts/notifications").then((r) => r.data.data),

  deleteNotification: (id: string) =>
    apiClient.delete<any>(`/property-alerts/notifications/${id}`).then((r) => r.data.data),

  markAsRead: (id: string) =>
    apiClient.patch<any>(`/property-alerts/notifications/${id}/read`).then((r) => r.data.data),

  sendLiveNotification: (data: { tenantId: string; propertyId: string; title: string; description: string }) =>
    apiClient.post<any>("/property-alerts/notifications/send-live", data).then((r) => r.data.data),
};
