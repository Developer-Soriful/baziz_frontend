import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  companyName: string | null;
  address: string | null;
  role: string;
  isVerified: boolean;
  language?: string;
  theme?: string;
  locationServicesEnabled?: boolean;
  autoBackupEnabled?: boolean;
  emergencyContact: {
    name: string;
    phone: string;
    relationship?: string;
  } | null;
  notificationPreferences: {
    paymentReceived: boolean;
    paymentDue: boolean;
    leaseRenewal: boolean;
    leaseExpired: boolean;
    maintenance: boolean;
    insuranceRenewal: boolean;
    documentUploads: boolean;
    taskDeadlines: boolean;
    tenantMessages: boolean;
    marketplaceInquiries: boolean;
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
}

export const userService = {
  getProfile: () =>
    apiClient.get<{ data: { user: UserProfile } }>(ENDPOINTS.USER_PROFILE)
      .then((res) => res.data.data.user),

  updateProfile: (data: Partial<UserProfile>) =>
    apiClient.patch<{ data: { user: UserProfile } }>(ENDPOINTS.USER_PROFILE, data)
      .then((res) => res.data.data.user),

  updateSettings: (data: Partial<UserProfile>) =>
    apiClient.patch<{ data: { user: UserProfile } }>(`${ENDPOINTS.USER_PROFILE}/settings`, data)
      .then((res) => res.data.data.user),

  updateNotificationPreferences: (prefs: Partial<UserProfile["notificationPreferences"]>) =>
    apiClient.patch<{ data: { user: UserProfile } }>(`${ENDPOINTS.USER_PROFILE}/notifications`, prefs)
      .then((res) => res.data.data.user),
};
