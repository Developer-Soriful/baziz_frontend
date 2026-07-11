"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Button, Avatar, Toggle } from "@/components/ui/primitives";
import { Field, Input } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { colorFromString } from "@/lib/utils";
import { User, ShieldAlert, Calendar, Bell } from "lucide-react";

export default function ProfilePage() {
  const toast = useToast();
  const { user } = useAuth();
  const isTenant = user?.role === "tenant";
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("(555) 123-4567");
  const [prefs, setPrefs] = useState({ rent: true, maint: true, building: true });

  return (
    <div className="animate-in mx-auto max-w-2xl">
      <PageTitle title={isTenant ? "Profile & Lease" : "Profile"} subtitle="Manage your account details" action={<Button onClick={() => toast("Changes saved successfully!")}>Save</Button>} />
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-4"><Avatar name={user?.name ?? "U"} color={colorFromString(user?.name ?? "U")} size={64} /><div><p className="text-lg font-bold">{user?.name}</p><p className="text-sm capitalize text-text-muted">{user?.role}</p></div></div>
        <h3 className="mb-3 flex items-center gap-2 font-bold"><User className="h-4 w-4 text-primary" /> Personal Information</h3>
        <div className="space-y-4">
          <Field label="Full Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email"><Input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
        </div>
      </Card>

      {isTenant && (<>
        <Card className="mt-4 p-6">
          <h3 className="mb-3 flex items-center gap-2 font-bold"><ShieldAlert className="h-4 w-4 text-warning" /> Emergency Contact</h3>
          <div className="space-y-4"><Field label="Contact Name"><Input defaultValue="Jane Smith" /></Field><Field label="Contact Phone"><Input defaultValue="(555) 987-6543" /></Field></div>
        </Card>
        <Card className="mt-4 p-6">
          <h3 className="mb-3 flex items-center gap-2 font-bold"><Bell className="h-4 w-4 text-primary" /> Notification Preferences</h3>
          <div className="divide-y divide-border">
            {([["Rent Reminders", "rent"], ["Maintenance Updates", "maint"], ["Building Announcements", "building"]] as const).map(([label, key]) => (
              <div key={key} className="flex items-center justify-between py-2.5"><span className="text-sm font-semibold">{label}</span><Toggle checked={prefs[key]} onChange={(v) => setPrefs({ ...prefs, [key]: v })} /></div>
            ))}
          </div>
        </Card>
        <Card className="mt-4 p-6">
          <h3 className="mb-3 flex items-center gap-2 font-bold"><Calendar className="h-4 w-4 text-primary" /> Lease Information</h3>
          <div className="divide-y divide-border text-sm">
            {[["Unit", "2B"], ["Lease Start", "January 1, 2024"], ["Lease End", "December 31, 2024"], ["Monthly Rent", "£1,850"], ["Security Deposit", "£2,000"]].map(([k, v]) => (<div key={k} className="flex justify-between py-2.5"><span className="text-text-muted">{k}</span><span className="font-semibold">{v}</span></div>))}
          </div>
          <div className="mt-4 rounded-xl bg-primary/8 p-4 text-sm"><p className="font-semibold text-primary">Lease Renewal Notice</p><p className="mt-1 text-text-muted">Your lease expires in 11 months. We&apos;ll notify you 60 days before renewal.</p></div>
        </Card>
      </>)}

      {!isTenant && (
        <Card className="mt-4 p-6">
          <h3 className="mb-3 font-bold">Business Information</h3>
          <div className="space-y-4"><Field label="Company Name"><Input defaultValue="Smith Properties" /></Field><Field label="Address"><Input placeholder="Enter your address (optional)" /></Field></div>
        </Card>
      )}
    </div>
  );
}
