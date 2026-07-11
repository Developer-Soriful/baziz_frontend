export interface LoginPayload {
    email: string;
    password: string;
}

export interface SignupPayload {
    firstName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: "landlord" | "tenant" | "admin";
    termsAccepted: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role?: "landlord" | "tenant";
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken?: string;
}