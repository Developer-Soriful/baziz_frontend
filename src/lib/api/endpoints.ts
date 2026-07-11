export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/signin',
        REGISTER: '/auth/signup',
        ME: '/auth/me',
        VERIFY_EMAIL: '/auth/verify-email',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
    },
    USERS: {
        BASE: '/users',
        BY_ID: (id: string) => `/users/${id}`,
    },
    TENANTS: {
        BASE: '/tenants',
        BY_ID: (id: string) => `/tenants/${id}`,
    },
    PROPERTIES: {
        BASE: '/properties',
        BY_ID: (id: string) => `/properties/${id}`,
        DOCUMENTS: (id: string) => `/properties/${id}/documents`,
    },
    TASKS: {
        BASE: '/tasks',
        BY_ID: (id: string) => `/tasks/${id}`,
    },
    CONTACTS: {
        BASE: '/contacts',
        BY_ID: (id: string) => `/contacts/${id}`,
    },
    MAINTENANCE: {
        BASE: '/maintenance-requests',
        BY_ID: (id: string) => `/maintenance-requests/${id}`,
    },
    BILLS: {
        BASE: '/monthly-bills',
        BY_ID: (id: string) => `/monthly-bills/${id}`,
    },
    COMPLAINTS: {
        BASE: '/complaints',
        BY_ID: (id: string) => `/complaints/${id}`,
    },
    RENT_PAYMENTS: {
        TENANT: '/rent-payments/tenant',
        LANDLORD: '/landlord/rent-payments',
    },
    DASHBOARD: {
        BASE: '/landlord',
    },
    CHAT: {
        BASE: '/chat',
        ROOMS: '/chat/rooms',
        MESSAGES: (roomId: string) => `/chat/rooms/${roomId}/messages`,
    },
    MARKETPLACE: {
        BASE: '/marketplace',
        BY_ID: (id: string) => `/marketplace/${id}`,
    },
    TEAM: {
        BASE: '/team',
        BY_ID: (id: string) => `/team/${id}`,
    },
    BILLING: {
        BASE: '/billing',
    },
    MESSAGES: {
        BASE: '/messages',
        BY_ID: (id: string) => `/messages/${id}`,
    },
    PAYMENTS: {
        BASE: '/payments',
        BY_ID: (id: string) => `/payments/${id}`,
    }
};
