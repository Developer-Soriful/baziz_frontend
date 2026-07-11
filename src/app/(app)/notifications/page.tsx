"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Button } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/misc";
import { tenantNotifications as seed, type Notif } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Bell, Wallet, Wrench, FileText, CheckCircle2, Info, BellOff } from "lucide-react";

const icons: Record<string, React.ElementType> = { info: Wallet, warning: Wrench, primary: FileText, success: CheckCircle2, neutral: Info, danger: Bell };
const colorFor = (t: string) => ({ info: "#007aff", warning: "#ff9500", primary: "#008577", success: "#34c759", neutral: "#8e8e93", danger: "#ff3b30" }[t] ?? "#008577");

export default function NotificationsPage() {
  const [list, setList] = useState<Notif[]>(() => [...seed]);
  const unread = list.filter((n) => n.unread).length;
  const markAll = () => setList((l) => l.map((n) => ({ ...n, unread: false })));
  const markOne = (id: string) => setList((l) => l.map((n) => n.id === id ? { ...n, unread: false } : n));

  return (
    <div className="animate-in mx-auto max-w-2xl">
      <PageTitle title="Notifications" subtitle={unread > 0 ? `${unread} unread` : "All caught up"} action={<Button variant="secondary" size="sm" disabled={unread === 0} onClick={markAll}>Mark all read</Button>} />
      {list.length === 0 ? <Card><EmptyState icon={BellOff} title="All caught up!" message="No notifications right now." /></Card> : (
        <div className="space-y-3">
          {list.map((n) => { const Icon = icons[n.tone] ?? Bell; const color = colorFor(n.tone); return (
            <button key={n.id} onClick={() => markOne(n.id)} className={cn("w-full rounded-2xl border p-4 text-left transition", n.unread ? "border-primary/30 bg-primary/5" : "border-border bg-surface")}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}1a`, color }}><Icon className="h-5 w-5" /></span>
                <div className="flex-1"><div className="flex items-center gap-2"><p className="font-bold">{n.title}</p>{n.unread && <span className="h-2 w-2 rounded-full bg-primary" />}</div><p className="mt-0.5 text-sm text-text-muted">{n.body}</p><p className="mt-1 text-xs text-text-faint">{n.time}</p></div>
              </div>
            </button>
          ); })}
        </div>
      )}
    </div>
  );
}
