"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/toast";

export function useHmoLicenceReminders(property: any) {
  const toast = useToast();

  useEffect(() => {
    if (!property || property.propertyType !== "hmo") return;

    const comp = property.compliance || {};
    const expiryDateStr = comp.hmoLicenceExpiryDate || comp.hmoLicenceExpiry;
    if (!expiryDateStr) return;

    const expiryDate = new Date(expiryDateStr);
    if (isNaN(expiryDate.getTime())) return;

    const leadDays = comp.hmoLicenceReminderLeadDays || 60;
    const propertyId = property.id || property._id;
    const storageKey = `hmo-licence-reminder-shown:${propertyId}:${expiryDateStr}`;

    // Check if reminder was already shown
    if (localStorage.getItem(storageKey)) return;

    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      toast(`HMO Licence is OVERDUE for ${property.propertyName || "property"}. Expiry date: ${expiryDate.toLocaleDateString("en-GB")}`, "error");
      localStorage.setItem(storageKey, "true");
    } else if (diffDays <= leadDays) {
      toast(`HMO Licence for ${property.propertyName || "property"} is expiring in ${diffDays} days on ${expiryDate.toLocaleDateString("en-GB")}`, "warning");
      localStorage.setItem(storageKey, "true");
    }
  }, [property, toast]);
}
