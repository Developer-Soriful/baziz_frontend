import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface DashboardStats {
  portfolioStats?: any;
  revenueByMonth?: any;
  recentPayments?: any;
}

export const dashboardService = {
  getStats: () =>
    apiClient.get<DashboardStats>(ENDPOINTS.DASHBOARD.BASE).then((r) => r.data),
};
