"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { OwnershipProvider } from "@/contexts/OwnershipContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary/30 border-t-primary" />
      </div>
    );
  }
  return (
    <OwnershipProvider>
      <AppShell>{children}</AppShell>
    </OwnershipProvider>
  );
}
