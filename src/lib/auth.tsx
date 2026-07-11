"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "./services/auth.service";
import {
  setAccessToken,
  clearAccessToken,
  getAccessToken,
} from "./auth-storage";
import { useRouter } from "next/navigation";
import { User } from "./types/auth.types";

export type Role = "landlord" | "tenant";

export interface AppUser extends User {
  role: Role;
}

interface AuthContextValue {
  user: AppUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: Role,
  ) => Promise<string | null>;
  logout: () => void;
  setRole: (r: Role) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const router = useRouter();

  const { data: userResponse, isFetched } = useQuery({
    queryKey: ["me"],
    queryFn: authService.me,
    enabled: typeof window !== "undefined" ? !!getAccessToken() : false,
    retry: false,
  });

  const user = userResponse
    ? {
        id: userResponse.id,
        name: userResponse.name,
        email: userResponse.email,
        role: (userResponse.role || "landlord") as Role,
      }
    : null;

  const login = async (
    email: string,
    password: string,
  ): Promise<string | null> => {
    try {
      const res = await authService.login({ email, password });
      if (res.accessToken) {
        setAccessToken(res.accessToken);
        await qc.invalidateQueries({ queryKey: ["me"] });
        return null; // success
      }
      return "Login failed: No token received.";
    } catch (err: any) {
      return err?.message || "Invalid email or password.";
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: Role,
  ): Promise<string | null> => {
    try {
      const res = await authService.signup({
        email,
        password,
        firstName: name,
        confirmPassword: password,
        role,
        termsAccepted: true
      });
      if (res.accessToken) {
        setAccessToken(res.accessToken);
        await qc.invalidateQueries({ queryKey: ["me"] });
        return null;
      }
      return "Signup failed: No token received.";
    } catch (err: any) {
      return err?.message || "An error occurred during signup.";
    }
  };

  const logout = useCallback(() => {
    clearAccessToken();
    qc.setQueryData(["me"], null);
    router.push("/login");
  }, [qc, router]);

  const setRole = useCallback(
    (role: Role) => {
      if (user) {
        qc.setQueryData(["me"], { ...userResponse, role });
      }
    },
    [qc, user, userResponse],
  );

  const ready =
    (typeof window !== "undefined" && !getAccessToken()) || isFetched;

  return (
    <AuthContext.Provider
      value={{ user, ready, login, signup, logout, setRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
