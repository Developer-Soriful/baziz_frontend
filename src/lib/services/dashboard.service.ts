import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface DashboardStats {
  portfolioStats?: any;
  revenueByMonth?: any;
  recentPayments?: any;
  analytics?: {
    occupancyRate: number;
    maintenanceCompletion: number;
    onTimeRent: number;
  };
}

export const dashboardService = {
  getStats: () =>
    apiClient.get<any>(ENDPOINTS.DASHBOARD.BASE).then((r) => {
      const overview = r.data?.data?.portfolioOverview;
      if (!overview) return {};

      const portfolioStats = [
        { 
          label: overview.properties?.label || "Properties", 
          value: overview.properties?.total?.toString() || "0", 
          sub: overview.properties?.subtext || "", 
          accent: "#007aff" 
        },
        { 
          label: overview.rentCollected?.label || "Rent Collected", 
          value: `${overview.rentCollected?.currency === 'GBP' ? '£' : '$'}${overview.rentCollected?.amount || 0}`, 
          sub: overview.rentCollected?.subtext || "", 
          accent: "#008577" 
        },
        { 
          label: overview.activeTenants?.label || "Active Tenants", 
          value: overview.activeTenants?.total?.toString() || "0", 
          sub: overview.activeTenants?.subtext || "", 
          accent: "#10b981" 
        },
        { 
          label: overview.overdue?.label || "Overdue", 
          value: overview.overdue?.total?.toString() || "0", 
          sub: overview.overdue?.subtext || "", 
          accent: "#ff9500" 
        },
      ];

      return {
        portfolioStats,
        revenueByMonth: overview.revenueByMonth || [],
        recentPayments: overview.recentPayments || [],
        analytics: overview.analytics || {
          occupancyRate: 0,
          maintenanceCompletion: 0,
          onTimeRent: 0
        },
      } as DashboardStats;
    }),
};
