"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button, Toggle } from "@/components/ui/primitives";
import { PillTabs, FilterChips, EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { Plus, Bell, TrendingDown, Sparkles, Gavel, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyAlertService, AlertConfig, AlertNotif } from "@/lib/services/property-alert.service";
import { userService } from "@/lib/services/user.service";
import { tenantService } from "@/lib/services/tenant.service";
import { propertyService } from "@/lib/services/property.service";
import { useEffect } from "react";

const iconMap: Record<string, React.ElementType> = {
  TrendingDown,
  Sparkles,
  Gavel,
  Bell,
};

export default function AlertsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<"Recent Alerts" | "My Alerts">("Recent Alerts");

  const [push, setPush] = useState(true);
  const [emailN, setEmailN] = useState(false);

  const { data: userProfile, refetch: refreshUser } = useQuery({
    queryKey: ["userProfile"],
    queryFn: userService.getProfile
  });

  useEffect(() => {
    if (userProfile?.notificationPreferences) {
      setPush(userProfile.notificationPreferences.pushNotifications);
      setEmailN(userProfile.notificationPreferences.emailNotifications);
    }
  }, [userProfile]);

  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", type: "Apartment", location: "" });

  const [liveModal, setLiveModal] = useState(false);
  const [liveForm, setLiveForm] = useState({ tenantId: "", propertyId: "", title: "", description: "" });

  const { data: tenants = [] } = useQuery({ queryKey: ["tenants"], queryFn: tenantService.getAll });
  const { data: properties = [] } = useQuery({ queryKey: ["properties"], queryFn: propertyService.getAll });

  const prefsMutation = useMutation({
    mutationFn: userService.updateNotificationPreferences,
    onSuccess: () => {
      refreshUser();
      toast("Preferences saved", "success");
    },
    onError: () => toast("Failed to update preferences", "error")
  });

  const handlePushToggle = (checked: boolean) => {
    setPush(checked);
    prefsMutation.mutate({ pushNotifications: checked });
  };

  const handleEmailToggle = (checked: boolean) => {
    setEmailN(checked);
    prefsMutation.mutate({ emailNotifications: checked });
  };

  const { data: configs = [], isLoading: loadingConfigs } = useQuery({
    queryKey: ["property-alert-configs"],
    queryFn: propertyAlertService.getConfigs,
  });

  const { data: notifs = [], isLoading: loadingNotifs } = useQuery({
    queryKey: ["property-alert-notifications"],
    queryFn: propertyAlertService.getNotifications,
  });

  const createMutation = useMutation({
    mutationFn: propertyAlertService.createConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-alert-configs"] });
      toast("Alert created successfully", "success");
      setModal(false);
    },
    onError: (err: any) => toast(err.response?.data?.message || "Failed to create alert", "error"),
  });

  const toggleMutation = useMutation({
    mutationFn: propertyAlertService.toggleConfig,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["property-alert-configs"] }),
  });

  const deleteNotifMutation = useMutation({
    mutationFn: propertyAlertService.deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["property-alert-notifications"] }),
  });

  const filteredConfigs = configs.filter((c: AlertConfig) => filter === "all" || (filter === "active" ? c.isActive : !c.isActive));

  const create = () => {
    if (!form.title.trim() || !form.location.trim()) return toast("Enter an alert name and location", "error");
    createMutation.mutate({ title: form.title, propertyType: form.type, location: form.location });
  };

  const sendLiveMutation = useMutation({
    mutationFn: (data: any) => propertyAlertService.sendLiveNotification(data),
    onSuccess: () => {
      toast("Live notification sent!", "success");
      setLiveModal(false);
      setLiveForm({ tenantId: "", propertyId: "", title: "", description: "" });
    },
    onError: () => toast("Failed to send notification", "error"),
  });

  const sendLive = () => {
    if (!liveForm.tenantId || !liveForm.propertyId || !liveForm.title || !liveForm.description) {
      return toast("Please fill out all fields", "error");
    }
    sendLiveMutation.mutate(liveForm);
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000); // minutes
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="animate-in">
      <PageTitle title="Property Alerts" subtitle="Get notified about properties matching your criteria" action={<div className="flex gap-2"><Button variant="secondary" onClick={() => { setLiveForm({ tenantId: "", propertyId: "", title: "", description: "" }); setLiveModal(true); }}><Bell className="mr-2 h-4 w-4" /> Send Live Alert</Button><Button onClick={() => { setForm({ title: "", type: "Apartment", location: "" }); setModal(true); }}><Plus className="h-4 w-4" /> New Alert</Button></div>} />
      <div className="mb-5"><PillTabs value={tab} onChange={setTab} tabs={["Recent Alerts", "My Alerts"]} /></div>

      {tab === "Recent Alerts" && (<>
        <Card className="mb-4 p-5">
          <h3 className="mb-2 font-bold">Alert Preferences</h3>
          <div className="flex items-center justify-between py-2"><span className="text-sm font-semibold">Push Notifications</span><Toggle checked={push} onChange={handlePushToggle} /></div>
          <div className="flex items-center justify-between py-2"><span className="text-sm font-semibold">Email Notifications</span><Toggle checked={emailN} onChange={handleEmailToggle} /></div>
        </Card>
        {loadingNotifs ? <p className="text-sm text-text-muted">Loading notifications...</p> : notifs.length === 0 ? <Card><EmptyState icon={Bell} title="All Clear" message="No recent property alerts." /></Card> : (
          <div className="space-y-3">
            {notifs.map((a: AlertNotif) => {
              const Icon = iconMap[a.iconName] || Bell;
              return (
                <Card key={a._id} className="flex items-center gap-3 p-4">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${a.tone}/12 text-${a.tone}`} style={{ background: a.tone === "success" ? "#34c75922" : a.tone === "info" ? "#007aff22" : "#ff950022", color: a.tone === "success" ? "#34c759" : a.tone === "info" ? "#007aff" : "#ff9500" }}><Icon className="h-5 w-5" /></span>
                  <div className="flex-1"><p className="font-bold">{a.title}</p><p className="text-xs text-text-muted">{a.description}</p><p className="mt-0.5 text-[11px] text-text-faint">{getTimeAgo(a.createdAt)}</p></div>
                  <button onClick={() => deleteNotifMutation.mutate(a._id)} className="rounded-lg p-2 text-text-faint hover:bg-danger/10 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                </Card>
              );
            })}
          </div>
        )}
      </>)}

      {tab === "My Alerts" && (<>
        <FilterChips value={filter} onChange={setFilter} chips={[{ value: "all", label: "All" }, { value: "active", label: "Active" }, { value: "paused", label: "Paused" }]} />
        <div className="mt-4 space-y-3">
          {loadingConfigs ? <p className="text-sm text-text-muted">Loading configurations...</p> : filteredConfigs.length === 0 ? <p className="py-4 text-center text-sm text-text-muted">No configurations found.</p> : filteredConfigs.map((c: AlertConfig) => (
            <Card key={c._id} className="flex items-center gap-3 p-4">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.isActive ? "bg-primary/12 text-primary" : "bg-surface-2 text-text-faint"}`}><Bell className="h-5 w-5" /></span>
              <div className="flex-1"><p className="font-bold">{c.title}</p><p className="text-xs text-text-muted">{c.propertyType}, {c.location}</p></div>
              <Badge tone={c.isActive ? "success" : "neutral"}>{c.isActive ? "Active" : "Paused"}</Badge>
              <Toggle checked={c.isActive} onChange={() => toggleMutation.mutate(c._id)} />
            </Card>
          ))}
        </div>
      </>)}

      <Modal open={modal} onClose={() => setModal(false)} title="New Alert" footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={create} loading={createMutation.isPending}>Create Alert</Button></>}>
        <div className="space-y-4">
          <Field label="Alert Name"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="London Investment" /></Field>
          <Field label="Property Type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{["Apartment", "Studio", "House", "Commercial", "HMO"].map((s) => <option key={s} value={s}>{s}</option>)}</Select></Field>
          <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="London" /></Field>
        </div>
      </Modal>

      <Modal open={liveModal} onClose={() => setLiveModal(false)} title="Send Live Alert" footer={<><Button variant="secondary" onClick={() => setLiveModal(false)}>Cancel</Button><Button onClick={sendLive} loading={sendLiveMutation.isPending}>Send Alert</Button></>}>
        <div className="space-y-4">
          <Field label="Tenant">
            <Select value={liveForm.tenantId} onChange={(e) => setLiveForm({ ...liveForm, tenantId: e.target.value })}>
              <option value="">Select Tenant</option>
              {tenants.map((t: any) => {
                const tenantId = t.tenantId?._id || t.tenantId?.id || t.tenantId || t._id || t.id;
                const tenantName = t.tenantFullName || t.tenantId?.firstName || t.tenantName || 'Unknown Tenant';
                const propName = t.propertyId?.propertyName || t.propertyName || t.property?.name || 'Property';
                return (
                  <option key={t._id || t.id || tenantId} value={tenantId} disabled={!tenantId}>{tenantName} ({propName})</option>
                );
              })}
            </Select>
          </Field>
          <Field label="Property">
            <Select value={liveForm.propertyId} onChange={(e) => setLiveForm({ ...liveForm, propertyId: e.target.value })}>
              <option value="">Select Property</option>
              {properties.map((p: any) => (
                <option key={p._id || p.id} value={p._id || p.id}>{p.propertyName || p.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Title"><Input value={liveForm.title} onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })} placeholder="Maintenance Update" /></Field>
          <Field label="Description"><Input value={liveForm.description} onChange={(e) => setLiveForm({ ...liveForm, description: e.target.value })} placeholder="Plumber arriving at 2PM" /></Field>
        </div>
      </Modal>
    </div>
  );
}
