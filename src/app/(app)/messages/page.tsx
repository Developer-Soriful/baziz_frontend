"use client";

import { useState } from "react";
import Link from "next/link";
import { PageTitle } from "@/components/page-title";
import { Card, Avatar, Badge } from "@/components/ui/primitives";
import { PillTabs, SearchInput, EmptyState } from "@/components/ui/misc";
import { colorFromString } from "@/lib/utils";
import { MessageSquare, Home, Users, Headset } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { chatService, ChatPreview } from "@/lib/services/chat.service";
import { chats as fallbackChats } from "@/lib/data";

export default function MessagesPage() {
  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: chatService.getChats,
  });

  const [tab, setTab] = useState<"All" | "Tenants" | "Marketplace" | "Group">("All");
  const [q, setQ] = useState("");
  
  // Use fallback chats if no data returned yet
  const displayChats = chats.length > 0 ? chats : fallbackChats;
  
  const filtered = displayChats.filter((c: any) => {
    const mq = !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.preview.toLowerCase().includes(q.toLowerCase());
    const mt = tab === "All" || (tab === "Tenants" ? c.category === "Tenant" : tab === "Marketplace" ? c.category === "Marketplace" : c.category === "Group");
    return mq && mt;
  });
  
  const icon = (cat: string) => cat === "Group" ? Users : cat === "Marketplace" ? Headset : Home;

  return (
    <div className="animate-in">
      <PageTitle title="Messages" subtitle="Manage all your property chats in one place" />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <PillTabs value={tab} onChange={setTab} tabs={["All", "Tenants", "Marketplace", "Group"]} />
        <SearchInput value={q} onChange={setQ} placeholder="Search..." className="sm:ml-auto sm:max-w-xs" />
      </div>
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-text-muted">Loading chats...</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No chats found" />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((c: any) => {
              const Icon = icon(c.category);
              return (
                <Link key={c.id || c._id} href={`/messages/${c.id || c._id}`} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-surface-2">
                  <div className="relative"><Avatar name={c.name} color={colorFromString(c.name)} size={46} />{c.unread > 0 && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-success ring-2 ring-surface" />}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><p className="truncate font-bold text-primary">{c.name}</p>{c.category === "Group" && <Badge tone="neutral">Group</Badge>}</div>
                    <p className="flex items-center gap-1 truncate text-xs text-text-muted"><Icon className="h-3 w-3" /> {c.address}</p>
                    <p className="truncate text-sm text-text-muted">{c.preview}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1"><span className="text-xs text-text-faint">{c.time}</span>{c.unread > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">{c.unread}</span>}</div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
