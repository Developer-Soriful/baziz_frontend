"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Moon, Sun, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useSocket } from "@/lib/socket";
import { primaryNav, moreGroups } from "@/lib/nav-config";
import { Avatar } from "@/components/ui/primitives";
import { cn, colorFromString } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useEffect } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { socket } = useSocket();
  const toast = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!socket) return;
    
    const handleNotification = (notif: any) => {
      toast(`New Alert: ${notif.title}`, "info");
    };

    socket.on("notification:new", handleNotification);
    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [socket, toast]);

  if (!user) return null;

  const nav = primaryNav(user.role);
  // Desktop sidebar shows primary nav + flattened "more" items
  const moreItems = moreGroups(user.role).flatMap((g) => g.items);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <Link href="/home" className="flex h-16 items-center gap-2.5 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-base font-black text-white shadow-[var(--shadow-glow)]">P</span>
          <span className="text-lg font-extrabold">Propertera</span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {nav.filter((n) => n.href !== "/more").map((n) => (
            <Link key={n.href} href={n.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", isActive(n.href) ? "bg-primary text-white shadow-[var(--shadow-glow)]" : "text-text-muted hover:bg-surface-2 hover:text-text")}>
              <n.icon className="h-[18px] w-[18px]" /> {n.label}
            </Link>
          ))}
          <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-text-faint">More</p>
          {moreItems.map((n) => (
            <Link key={n.href} href={n.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", isActive(n.href) ? "bg-primary text-white" : "text-text-muted hover:bg-surface-2 hover:text-text")}>
              <n.icon className="h-[18px] w-[18px]" /> {n.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/85 px-4 backdrop-blur-xl sm:px-6">
          <Link href="/home" className="flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-white">P</span>
            <span className="font-extrabold">Propertera</span>
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={toggle} className="rounded-xl p-2.5 text-text-muted hover:bg-surface-2" aria-label="Theme">{theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
            <Link href="/notifications" className="relative rounded-xl p-2.5 text-text-muted hover:bg-surface-2"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" /></Link>
            <div className="relative">
              <button onClick={() => setMenu((v) => !v)} className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-surface-2">
                <Avatar name={user.name} color={colorFromString(user.name)} size={34} />
                <div className="hidden text-left sm:block"><p className="text-[13px] font-bold leading-tight">{user.name}</p><p className="text-[11px] capitalize text-text-muted">{user.role}</p></div>
                <ChevronDown className="hidden h-4 w-4 text-text-faint sm:block" />
              </button>
              {menu && (
                <div className="animate-in absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-surface shadow-float">
                  <div className="border-b border-border px-4 py-3"><p className="truncate text-sm font-bold">{user.name}</p><p className="truncate text-xs text-text-muted">{user.email}</p></div>
                  <Link href="/profile" className="block px-4 py-2.5 text-sm font-semibold hover:bg-surface-2" onClick={() => setMenu(false)}>Profile</Link>
                  <Link href="/settings" className="block px-4 py-2.5 text-sm font-semibold hover:bg-surface-2" onClick={() => setMenu(false)}>Settings</Link>
                  <button onClick={() => { logout(); router.push("/login"); }} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-danger hover:bg-danger/8"><LogOut className="h-4 w-4" /> Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-10">{children}</main>
      </div>
      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
          {nav.map((n) => {
            const active = isActive(n.href);
            return (
              <Link key={n.href} href={n.href} className="flex flex-1 flex-col items-center gap-1 py-1">
                <n.icon className={cn("h-6 w-6 transition", active ? "text-primary" : "text-text-faint")} />
                <span className={cn("text-[10px] font-semibold", active ? "text-primary" : "text-text-faint")}>{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
