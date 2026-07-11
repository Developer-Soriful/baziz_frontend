"use client";

import Link from "next/link";
import { Building2, Home, Wallet, ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#06110f] p-12 text-white lg:flex">
        <div className="absolute inset-0 opacity-90" style={{ background: "radial-gradient(1000px 500px at -10% -10%, rgba(0,133,119,0.55), transparent), radial-gradient(800px 500px at 110% 110%, rgba(124,58,237,0.3), transparent)" }} />
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-black shadow-[var(--shadow-glow)]">P</span>
          <span className="text-lg font-extrabold">Propertera</span>
        </Link>
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight">Property management, beautifully simple.</h2>
          <p className="mt-4 text-base text-white/70">Whether you own a portfolio or rent your home, Propertera brings payments, maintenance, documents and messaging into one elegant place.</p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[{ icon: Building2, label: "Portfolio at a glance" }, { icon: Wallet, label: "Rent & payments" }, { icon: Home, label: "Tenant portal" }, { icon: ShieldCheck, label: "Secure & private" }].map((f) => (
              <div key={f.label} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/25 text-primary-100"><f.icon className="h-5 w-5" /></span><span className="text-sm font-semibold">{f.label}</span></div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/50">© 2026 Propertera. All rights reserved.</p>
      </div>
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
