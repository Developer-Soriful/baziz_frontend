"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { Card, Avatar, Badge, Button } from "@/components/ui/primitives";
import { PillTabs, SearchInput, EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Select } from "@/components/ui/form";
import { colorFromString } from "@/lib/utils";
import { MessageSquare, Home, Users, Headset, Plus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { chatService } from "@/lib/services/chat.service";
import { tenantService } from "@/lib/services/tenant.service";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: chatService.getChats,
  });

  const { data: leases = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: tenantService.getAll,
    enabled: !!user && user.role === "landlord",
  });

  const [tab, setTab] = useState<"All" | "Tenants" | "Marketplace" | "Group">(
    "All",
  );
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState("");

  const startChatMutation = useMutation({
    mutationFn: (data: { propertyId: string; tenantId: string }) =>
      chatService.createDirectConversation(data.propertyId, data.tenantId),
    onSuccess: (convo) => {
      setModalOpen(false);
      router.push(`/messages/${convo.id || convo._id}`);
    },
    onError: () => toast("Failed to open chat", "error"),
  });

  const tenantChatMutation = useMutation({
    mutationFn: chatService.getTenantDefaultConversation,
    onSuccess: (convo) => {
      if (convo && (convo.id || convo._id)) {
        router.push(`/messages/${convo.id || convo._id}`);
      } else {
        toast(
          "No active landlord chat found. Ensure you have an active lease.",
          "warning",
        );
      }
    },
    onError: () => toast("Failed to connect to landlord", "error"),
  });

  const activeLeases = leases.filter((t: any) => t.tenantId?._id || t.tenantId);

  const handleStartChat = () => {
    const target = activeLeases.find(
      (l: any) => (l._id || l.id) === selectedLeaseId,
    );
    if (!target) return toast("Please select a tenant", "error");

    const tenantId = target.tenantId?._id || target.tenantId;
    const propertyId = target.propertyId?._id || target.propertyId;

    startChatMutation.mutate({ propertyId, tenantId });
  };

  const displayChats = chats || [];

  const filtered = displayChats.filter((c: any) => {
    const mq =
      !q ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.preview.toLowerCase().includes(q.toLowerCase());
    const mt =
      tab === "All" ||
      (tab === "Tenants"
        ? c.category === "Tenant"
        : tab === "Marketplace"
          ? c.category === "Marketplace"
          : c.category === "Group");
    return mq && mt;
  });

  const icon = (cat: string) =>
    cat === "Group" ? Users : cat === "Marketplace" ? Headset : Home;

  const headerAction =
    user?.role === "tenant" ? (
      <Button
        onClick={() => tenantChatMutation.mutate()}
        loading={tenantChatMutation.isPending}
      >
        <MessageSquare className="mr-1.5 h-4 w-4" /> Message Landlord
      </Button>
    ) : (
      <Button onClick={() => setModalOpen(true)}>
        <Plus className="mr-1.5 h-4 w-4" /> New Message
      </Button>
    );

  return (
    <div className="animate-in">
      <PageTitle
        title="Messages"
        subtitle="Manage all your property chats in one place"
        action={headerAction}
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <PillTabs
          value={tab}
          onChange={setTab}
          tabs={["All", "Tenants", "Marketplace", "Group"]}
        />
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search..."
          className="sm:ml-auto sm:max-w-xs"
        />
      </div>
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-text-muted">
            Loading chats...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No chats found" />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((c: any) => {
              const Icon = icon(c.category);
              return (
                <Link
                  key={c.id || c._id}
                  href={`/messages/${c.id || c._id}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-surface-2"
                >
                  <div className="relative">
                    <Avatar
                      name={c.name}
                      color={colorFromString(c.name)}
                      size={46}
                    />
                    {c.unread > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-success ring-2 ring-surface" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-bold text-primary">
                        {c.name}
                      </p>
                      {c.category === "Group" && (
                        <Badge tone="neutral">Group</Badge>
                      )}
                    </div>
                    <p className="flex items-center gap-1 truncate text-xs text-text-muted">
                      <Icon className="h-3 w-3" /> {c.address}
                    </p>
                    <p className="truncate text-sm text-text-muted font-normal mt-0.5">
                      {c.preview}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-text-faint">{c.time}</span>
                    {c.unread > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      {/* New Message Dialog for Landlord */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Message"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStartChat}
              disabled={activeLeases.length === 0}
              loading={startChatMutation.isPending}
            >
              Start Chat
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {activeLeases.length === 0 ? (
            <p className="text-sm text-text-muted">
              You don't have any active tenants who have accepted invitations
              yet. Invite them in the Tenants section to enable chatting.
            </p>
          ) : (
            <Field label="Select Tenant">
              <Select
                value={selectedLeaseId}
                onChange={(e) => setSelectedLeaseId(e.target.value)}
              >
                <option value="">-- Choose a tenant --</option>
                {activeLeases.map((l: any) => {
                  const name = l.tenantFullName || "User";
                  const propertyName = l.propertyId?.propertyName || "Property";
                  return (
                    <option key={l._id || l.id} value={l._id || l.id}>
                      {name} — {propertyName}
                    </option>
                  );
                })}
              </Select>
            </Field>
          )}
        </div>
      </Modal>
    </div>
  );
}
