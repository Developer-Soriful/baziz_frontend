"use client";

import { useState, useEffect } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Button, Toggle } from "@/components/ui/primitives";
import { Field, Select } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/lib/theme";
import { Palette, Bell, Globe, RefreshCw, MapPin } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/lib/services/user.service";

function Row({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {hint && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function SettingsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { theme, toggle, setTheme } = useTheme();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: userService.getProfile,
  });

  const [notif, setNotif] = useState({ push: true, email: true, sms: false });
  const [loc, setLoc] = useState(true);
  const [sync, setSync] = useState(false);
  const [lang, setLang] = useState("en");
  const [hasSyncedTheme, setHasSyncedTheme] = useState(false);

  useEffect(() => {
    if (profile) {
      setNotif({
        push: profile.notificationPreferences?.pushNotifications ?? true,
        email: profile.notificationPreferences?.emailNotifications ?? true,
        sms: profile.notificationPreferences?.smsNotifications ?? false,
      });
      setLoc(profile.locationServicesEnabled ?? false);
      setSync(profile.autoBackupEnabled ?? false);
      setLang(profile.language ?? "en");
      
      if (!hasSyncedTheme && profile.theme && (profile.theme === "light" || profile.theme === "dark")) {
        setTheme(profile.theme);
        setHasSyncedTheme(true);
      }
    }
  }, [profile, hasSyncedTheme, setTheme]);

  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      // Update General Settings
      await userService.updateSettings({
        theme,
        language: lang,
        locationServicesEnabled: loc,
        autoBackupEnabled: sync,
      });

      // Update Notifications
      await userService.updateNotificationPreferences({
        pushNotifications: notif.push,
        emailNotifications: notif.email,
        smsNotifications: notif.sms,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast("Settings saved successfully!", "success");
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || error.message || "Error saving settings", "error");
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted">Loading settings...</div>;
  }

  return (
    <div className="animate-in mx-auto max-w-2xl">
      <PageTitle 
        title="Settings" 
        subtitle="App preferences and configuration" 
        action={
          <Button 
            onClick={() => updateSettingsMutation.mutate()} 
            loading={updateSettingsMutation.isPending}
          >
            Save
          </Button>
        } 
      />
      <div className="space-y-4">
        <Card className="p-5">
          <h3 className="mb-2 flex items-center gap-2 font-bold"><Palette className="h-4 w-4 text-primary" /> Preferences</h3>
          <Row label="Dark Theme" hint="Switch between light and dark mode" checked={theme === "dark"} onChange={toggle} />
          <div className="border-t border-border" />
          <Row label="Location Services" hint="Show property locations on maps" checked={loc} onChange={setLoc} />
          <Row label="Auto Sync" hint="Sync data in the background" checked={sync} onChange={setSync} />
          <div className="pt-2.5">
            <Field label="Language">
              <Select value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="en">English (UK)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </Select>
            </Field>
          </div>
        </Card>
        
        <Card className="p-5">
          <h3 className="mb-2 flex items-center gap-2 font-bold"><Bell className="h-4 w-4 text-primary" /> Notifications</h3>
          <Row label="Push Notifications" checked={notif.push} onChange={(v) => setNotif({ ...notif, push: v })} />
          <Row label="Email Notifications" checked={notif.email} onChange={(v) => setNotif({ ...notif, email: v })} />
          <Row label="SMS Notifications" checked={notif.sms} onChange={(v) => setNotif({ ...notif, sms: v })} />
        </Card>
      </div>
      <p className="mt-6 text-center text-xs text-text-faint">Propertera · App Version 1.0.0</p>
    </div>
  );
}
