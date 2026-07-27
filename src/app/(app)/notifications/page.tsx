"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Button } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import { Bell, Wallet, Wrench, FileText, CheckCircle2, Info, BellOff } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyAlertService, AlertNotif } from "@/lib/services/property-alert.service";

const icons: Record<string, React.ElementType> = { info: Wallet, warning: Wrench, primary: FileText, success: CheckCircle2, neutral: Info, danger: Bell };
const colorFor = (t: string) => ({ info: "#007aff", warning: "#ff9500", primary: "#008577", success: "#34c759", neutral: "#8e8e93", danger: "#ff3b30" }[t] ?? "#008577");

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: propertyAlertService.getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => propertyAlertService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const unread = list.filter((n: AlertNotif) => !n.isRead).length;

  const markAll = () => {
    list.filter((n: AlertNotif) => !n.isRead).forEach((n: AlertNotif) => {
      markReadMutation.mutate(n._id);
    });
  };

  const markOne = (id: string) => {
    markReadMutation.mutate(id);
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="animate-in mx-auto max-w-2xl">
      <PageTitle title="Notifications" subtitle={unread > 0 ? `${unread} unread` : "All caught up"} action={<Button variant="secondary" size="sm" disabled={unread === 0} onClick={markAll}>Mark all read</Button>} />
      {isLoading ? <p className="text-center text-text-muted mt-10">Loading notifications...</p> : list.length === 0 ? <Card><EmptyState icon={BellOff} title="All caught up!" message="No notifications right now." /></Card> : (
        <div className="space-y-3">
          {list.map((n: AlertNotif) => { const Icon = icons[n.tone] ?? Bell; const color = colorFor(n.tone); return (
            <button key={n._id} onClick={() => !n.isRead && markOne(n._id)} disabled={n.isRead || markReadMutation.isPending} className={cn("w-full rounded-2xl border p-4 text-left transition", !n.isRead ? "border-primary/30 bg-primary/5 hover:bg-primary/10" : "border-border bg-surface cursor-default opacity-70")}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}1a`, color }}><Icon className="h-5 w-5" /></span>
                <div className="flex-1"><div className="flex items-center gap-2"><p className="font-bold">{n.title}</p>{!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}</div><p className="mt-0.5 text-sm text-text-muted">{n.description}</p><p className="mt-1 text-xs text-text-faint">{getTimeAgo(n.createdAt)}</p></div>
              </div>
            </button>
          ); })}
        </div>
      )}
    </div>
  );
}
