import axios from "axios";
import { env } from "@/lib/env";
import { getAccessToken, clearAccessToken } from "@/lib/auth-storage";

export const apiClient = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
    timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        if (error.response?.status === 401) {
            clearAccessToken();
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(normalizeApiError(error));
    }
);

function normalizeApiError(error: any) {
    const data = error.response?.data;
    let message = data?.message ?? "Something went wrong";
    
    // If backend provides a list of validation errors, append them to the message
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        message = data.errors.join(", ");
    }
    
    return {
        message,
        status: error.response?.status ?? 500,
    };
}