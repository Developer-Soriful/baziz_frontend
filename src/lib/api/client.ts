import axios, { AxiosRequestConfig } from "axios";
import { env } from "@/lib/env";
import {
    getAccessToken,
    setAccessToken,
    clearAccessToken,
    getRefreshToken,
    setRefreshToken,
    clearRefreshToken,
} from "@/lib/auth-storage";
import { ENDPOINTS } from "@/lib/api/endpoints";

export const apiClient = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
    timeout: 15000,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attach the latest access token before every request.
apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ─── Token-Refresh State ──────────────────────────────────────────────────────
// isRefreshing prevents multiple concurrent refresh calls.
// pendingQueue stores resolvers/rejecters for requests that arrived while
// a refresh was already in-flight.
let isRefreshing = false;
let pendingQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

function flushQueue(token: string) {
    pendingQueue.forEach(({ resolve }) => resolve(token));
    pendingQueue = [];
}

function drainQueue(err: unknown) {
    pendingQueue.forEach(({ reject }) => reject(err));
    pendingQueue = [];
}

function redirectToLogin() {
    clearAccessToken();
    clearRefreshToken();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
    }
}

// ─── Response Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Only handle 401 once per request; skip if this IS the refresh call itself.
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== ENDPOINTS.AUTH.REFRESH
        ) {
            if (isRefreshing) {
                // Another refresh is already in flight — queue this request.
                return new Promise((resolve, reject) => {
                    pendingQueue.push({
                        resolve: (newToken: string) => {
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            }
                            resolve(apiClient(originalRequest));
                        },
                        reject,
                    });
                });
            }

            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                redirectToLogin();
                return Promise.reject(normalizeApiError(error));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Use a raw axios call so we don't trigger our own interceptor.
                const { data } = await axios.post(
                    `${env.NEXT_PUBLIC_API_URL}${ENDPOINTS.AUTH.REFRESH}`,
                    { refreshToken },
                    { timeout: 10000 }
                );

                const newAccessToken: string =
                    data?.data?.session?.accessToken ?? data?.accessToken ?? data?.token;
                const newRefreshToken: string | undefined =
                    data?.data?.session?.refreshToken ?? data?.refreshToken;

                if (!newAccessToken) throw new Error("No access token in refresh response");

                setAccessToken(newAccessToken);
                if (newRefreshToken) setRefreshToken(newRefreshToken);

                // Flush all queued requests with the new token.
                flushQueue(newAccessToken);

                // Retry the original request.
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return apiClient(originalRequest);
            } catch (refreshError) {
                drainQueue(refreshError);
                redirectToLogin();
                return Promise.reject(normalizeApiError(error));
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(normalizeApiError(error));
    }
);

// ─── Error Normalizer ─────────────────────────────────────────────────────────
function normalizeApiError(error: any) {
    const data = error.response?.data;
    let message = data?.message ?? "Something went wrong";

    // If the backend provides a list of validation errors, join them.
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        message = data.errors.join(", ");
    }

    return {
        message,
        status: error.response?.status ?? 500,
    };
}