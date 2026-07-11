"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card } from "@/components/ui/primitives";
import { ConfirmDialog } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth";
import { moreGroups } from "@/lib/nav-config";
import { ChevronRight, LogOut } from "lucide-react";
import { colorFromString } from "@/lib/utils";

export default function MorePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  if (!user) return null;
  const groups = moreGroups(user.role);

  return (
    <div className="animate-in">
      <PageTitle title="More" subtitle="Additional features and settings" />
      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-text-faint">{g.title}</p>
            <Card className="divide-y divide-border overflow-hidden">
              {g.items.map((i) => {
                const color = colorFromString(i.label);
                return (
                  <Link key={i.href} href={i.href} className="flex items-center gap-3.5 px-4 py-3.5 transition hover:bg-surface-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}1a`, color }}><i.icon className="h-5 w-5" /></span>
                    <div className="flex-1"><p className="font-semibold">{i.label}</p><p className="text-xs text-text-muted">{i.desc}</p></div>
                    <ChevronRight className="h-5 w-5 text-text-faint" />
                  </Link>
                );
              })}
            </Card>
          </div>
        ))}
        <button onClick={() => setConfirm(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/30 py-3.5 font-bold text-danger transition hover:bg-danger/8"><LogOut className="h-5 w-5" /> Log Out</button>
      </div>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={() => { logout(); router.push("/login"); }} title="Log Out?" message="Are you sure you want to log out of Propertera?" confirmLabel="Log Out" danger />
    </div>
  );
}
