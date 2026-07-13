import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { AuthResponse, LoginPayload, SignupPayload } from "../types/auth.types";

export const authService = {
    login: (payload: LoginPayload) =>
        apiClient.post<any>(ENDPOINTS.AUTH.LOGIN, payload).then(r => {
            const data = r.data.data;
            return {
                user: { ...data.user, name: data.user.firstName },
                session: {
                    accessToken: data.session.accessToken,
                    refreshToken: data.session.refreshToken
                }
            } as AuthResponse;
        }),

    signup: (payload: SignupPayload) =>
        apiClient.post<any>(ENDPOINTS.AUTH.REGISTER, payload).then(r => {
            const data = r.data.data;
            return {
                user: { ...data.user, name: data.user.firstName },
                session: {
                    accessToken: data.session.accessToken,
                    refreshToken: data.session.refreshToken
                }
            } as AuthResponse;
        }),

    verifyEmail: (payload: { email: string; otp: string }) =>
        apiClient.post<any>(ENDPOINTS.AUTH.VERIFY_EMAIL, payload).then(r => r.data),

    resendOtp: (payload: { email: string }) =>
        apiClient.post<any>(ENDPOINTS.AUTH.ME.replace("/me", "/resend-otp"), payload).then(r => r.data),

    me: () =>
        apiClient.get<any>(ENDPOINTS.AUTH.ME).then(r => {
            const user = r.data.data.user;
            return { ...user, name: user.firstName } as AuthResponse["user"];
        }),
};