"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/primitives";
import { PropertyHmoLicenceDetails } from "@/components/portfolio/PropertyHmoLicenceDetails";
import { useToast } from "@/components/ui/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyService } from "@/lib/services/property.service";

interface ComplianceEditDialogProps {
  open: boolean;
  onClose: () => void;
  property: any;
}

export function ComplianceEditDialog({
  open,
  onClose,
  property,
}: ComplianceEditDialogProps) {
  const toast = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    gasSafetyExpiry: "",
    electricalSafetyExpiry: "",
    smokeAlarmExpiry: "",
    leaseEnd: "",
    hmoLicenceNumber: "",
    hmoLicenceIssuingAuthority: "",
    hmoLicenceIssueDate: "",
    hmoLicenceExpiryDate: "",
    hmoLicenceReminderLeadDays: "60",
  });

  const [hmoErrors, setHmoErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (property) {
      const comp = property.compliance || {};
      setForm({
        gasSafetyExpiry: comp.gasSafetyExpiry ? comp.gasSafetyExpiry.split("T")[0] : "",
        electricalSafetyExpiry: comp.electricalSafetyExpiry ? comp.electricalSafetyExpiry.split("T")[0] : "",
        smokeAlarmExpiry: comp.smokeAlarmExpiry ? comp.smokeAlarmExpiry.split("T")[0] : "",
        leaseEnd: comp.leaseEnd ? comp.leaseEnd.split("T")[0] : "",
        hmoLicenceNumber: comp.hmoLicenceNumber || "",
        hmoLicenceIssuingAuthority: comp.hmoLicenceIssuingAuthority || "",
        hmoLicenceIssueDate: comp.hmoLicenceIssueDate ? comp.hmoLicenceIssueDate.split("T")[0] : "",
        hmoLicenceExpiryDate: comp.hmoLicenceExpiryDate ? comp.hmoLicenceExpiryDate.split("T")[0] : comp.hmoLicenceExpiry ? comp.hmoLicenceExpiry.split("T")[0] : "",
        hmoLicenceReminderLeadDays: comp.hmoLicenceReminderLeadDays ? comp.hmoLicenceReminderLeadDays.toString() : "60",
      });
      setHmoErrors({});
    }
  }, [property, open]);

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => propertyService.update(property.id || property._id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property", property.id || property._id] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      toast("Compliance details updated successfully", "success");
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to update compliance details";
      toast(msg, "error");
    },
  });

  const handleSave = () => {
    const fd = new FormData();
    if (form.gasSafetyExpiry) fd.append("gasSafetyExpiry", new Date(form.gasSafetyExpiry).toISOString());
    if (form.electricalSafetyExpiry) fd.append("electricalSafetyExpiry", new Date(form.electricalSafetyExpiry).toISOString());
    if (form.smokeAlarmExpiry) fd.append("smokeAlarmExpiry", new Date(form.smokeAlarmExpiry).toISOString());
    if (form.leaseEnd) fd.append("leaseEnd", new Date(form.leaseEnd).toISOString());

    if (property.propertyType === "hmo") {
      const errs: Record<string, string> = {};
      if (!form.hmoLicenceNumber.trim()) errs.hmoLicenceNumber = 'Licence number is required.';
      if (!form.hmoLicenceIssuingAuthority.trim()) errs.hmoLicenceIssuingAuthority = 'Issuing authority is required.';
      if (!form.hmoLicenceIssueDate) {
        errs.hmoLicenceIssueDate = 'Issue date is required.';
      } else if (new Date(form.hmoLicenceIssueDate) > new Date()) {
        errs.hmoLicenceIssueDate = 'Issue date cannot be in the future.';
      }
      if (!form.hmoLicenceExpiryDate) {
        errs.hmoLicenceExpiryDate = 'Expiry date is required.';
      } else if (form.hmoLicenceIssueDate && new Date(form.hmoLicenceExpiryDate) <= new Date(form.hmoLicenceIssueDate)) {
        errs.hmoLicenceExpiryDate = 'Expiry must be after issue date.';
      }
      const lead = parseInt(form.hmoLicenceReminderLeadDays);
      if (form.hmoLicenceReminderLeadDays && (isNaN(lead) || lead < 1 || lead > 365)) {
        errs.hmoLicenceReminderLeadDays = 'Reminder lead must be between 1 and 365.';
      }

      if (Object.keys(errs).length > 0) {
        setHmoErrors(errs);
        return toast("Please resolve HMO licence errors.", "error");
      }

      fd.append("hmoLicenceNumber", form.hmoLicenceNumber.trim());
      fd.append("hmoLicenceIssuingAuthority", form.hmoLicenceIssuingAuthority.trim());
      if (form.hmoLicenceIssueDate) fd.append("hmoLicenceIssueDate", new Date(form.hmoLicenceIssueDate).toISOString());
      if (form.hmoLicenceExpiryDate) {
        fd.append("hmoLicenceExpiry", new Date(form.hmoLicenceExpiryDate).toISOString());
      }
      fd.append("hmoLicenceReminderLeadDays", form.hmoLicenceReminderLeadDays || "60");
    }

    // Keep other fields unchanged (FormData only overrides fields provided)
    // However, multer will parse what is sent. We append only safety compliance fields
    updateMutation.mutate(fd);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Safety & Compliance"
      subtitle={`Update safety certificates for ${property?.propertyName}`}
      footer={
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Gas Safety CP12 Expiry">
            <Input
              type="date"
              value={form.gasSafetyExpiry}
              onChange={(e) => setForm({ ...form, gasSafetyExpiry: e.target.value })}
            />
          </Field>
          <Field label="Electrical Safety EICR Expiry">
            <Input
              type="date"
              value={form.electricalSafetyExpiry}
              onChange={(e) => setForm({ ...form, electricalSafetyExpiry: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Smoke Alarm Check Expiry">
            <Input
              type="date"
              value={form.smokeAlarmExpiry}
              onChange={(e) => setForm({ ...form, smokeAlarmExpiry: e.target.value })}
            />
          </Field>
          <Field label="Lease End Date">
            <Input
              type="date"
              value={form.leaseEnd}
              onChange={(e) => setForm({ ...form, leaseEnd: e.target.value })}
            />
          </Field>
        </div>

        {property?.propertyType === "hmo" && (
          <div className="mt-2">
            <PropertyHmoLicenceDetails
              values={{
                hmoLicenceNumber: form.hmoLicenceNumber,
                hmoLicenceIssuingAuthority: form.hmoLicenceIssuingAuthority,
                hmoLicenceIssueDate: form.hmoLicenceIssueDate,
                hmoLicenceExpiryDate: form.hmoLicenceExpiryDate,
                hmoLicenceReminderLeadDays: form.hmoLicenceReminderLeadDays,
              }}
              onChange={(field, val) => setForm((prev) => ({ ...prev, [field]: val }))}
              errors={hmoErrors}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
