export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/signin",
    REGISTER: "/auth/signup",
    ME: "/auth/me",
    VERIFY_EMAIL: "/auth/verify-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USERS: {
    BASE: "/users",
    BY_ID: (id: string) => `/users/${id}`,
  },
  USER_PROFILE: "/users/me",
  TENANTS: {
    BASE: "/tenants",
    BY_ID: (id: string) => `/tenants/${id}`,
  },
  PROPERTIES: {
    BASE: "/properties",
    BY_ID: (id: string) => `/properties/${id}`,
  },
  DOCUMENTS: {
    BASE: "/documents",
    BY_ID: (id: string) => `/documents/${id}`,
  },
  TASKS: {
    BASE: "/tasks",
    BY_ID: (id: string) => `/tasks/${id}`,
  },
  CONTACTS: {
    BASE: "/contacts",
    BY_ID: (id: string) => `/contacts/${id}`,
  },
  MAINTENANCE: {
    BASE: "/maintenance-requests",
    BY_ID: (id: string) => `/maintenance-requests/${id}`,
  },
  BILLS: {
    BASE: "/monthly-bills",
    BY_ID: (id: string) => `/monthly-bills/${id}`,
  },
  COMPLAINTS: {
    BASE: "/complaints",
    BY_ID: (id: string) => `/complaints/${id}`,
  },
  RENT_PAYMENTS: {
    TENANT: "/tenants/rent-payments",
    LANDLORD: "/landlord/rent-payments",
  },
  DASHBOARD: {
    BASE: "/landlord/portfolio-overview",
  },
  TENANT_DASHBOARD: {
    MY_LEASE: "/tenants/my-lease",
    DASHBOARD: "/tenants/rent-payments/dashboard",
    MY_DOCUMENTS: "/tenants/my-property/documents",
  },
  CHAT: {
    BASE: "/chat",
    ROOMS: "/chat/conversations",
    MESSAGES: (roomId: string) => `/chat/conversations/${roomId}/messages`,
  },
  MARKETPLACE: {
    BASE: "/marketplace",
    BY_ID: (id: string) => `/marketplace/${id}`,
  },
  TEAM: {
    BASE: "/team",
    BY_ID: (id: string) => `/team/${id}`,
  },
  BILLING: {
    BASE: "/billing",
  },
  MESSAGES: {
    BASE: "/messages",
    BY_ID: (id: string) => `/messages/${id}`,
  },
  PAYMENTS: {
    BASE: "/payments",
    BY_ID: (id: string) => `/payments/${id}`,
  },
  CALCULATORS: {
    BASE: "/calculators",
    BY_ID: (id: string) => `/calculators/${id}`,
    SHARE: (id: string) => `/calculators/${id}/share`,
    SHARED: (token: string) => `/calculators/shared/${token}`,
  },
  STAMP_DUTY: {
    ACTIVE_RATES: "/stamp-duty/rates/active",
    PROPOSALS: "/stamp-duty/rates",
    APPROVE: (id: string) => `/stamp-duty/rates/${id}/approve`,
    REVERT: (id: string) => `/stamp-duty/rates/${id}/revert`,
  },
  AI: {
    CHAT: "/ai/chat",
    TRANSCRIBE: "/ai/transcribe",
  },
};
