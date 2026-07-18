"use client";

import { useEffect, useState } from "react";
import { Field, Input } from "../ui/form";
import { CouncilCombobox } from "./CouncilCombobox";

interface PropertyHmoLicenceDetailsProps {
  values: {
    hmoLicenceNumber: string;
    hmoLicenceIssuingAuthority: string;
    hmoLicenceIssueDate: string;
    hmoLicenceExpiryDate: string;
    hmoLicenceReminderLeadDays: string;
  };
  onChange: (field: string, val: string) => void;
  errors?: Record<string, string>;
}

export function PropertyHmoLicenceDetails({
  values,
  onChange,
  errors = {},
}: PropertyHmoLicenceDetailsProps) {
  const [expiryTouched, setExpiryTouched] = useState(false);

  // Expiry auto-fill logic: Issue Date + 5 years
  useEffect(() => {
    if (values.hmoLicenceIssueDate && !expiryTouched) {
      const issueDate = new Date(values.hmoLicenceIssueDate);
      if (!isNaN(issueDate.getTime())) {
        const expiryDate = new Date(issueDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 5);
        
        // Format to yyyy-MM-dd
        const formattedExpiry = expiryDate.toISOString().split("T")[0];
        onChange("hmoLicenceExpiryDate", formattedExpiry);
      }
    }
  }, [values.hmoLicenceIssueDate, expiryTouched, onChange]);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface-2 p-4">
      <h4 className="font-bold text-sm">HMO Licence Details</h4>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Licence Number" hint="Max 60 chars. Council-issued reference." className="sm:col-span-2">
          <Input
            type="text"
            value={values.hmoLicenceNumber}
            onChange={(e) => onChange("hmoLicenceNumber", e.target.value.substring(0, 60))}
            placeholder="e.g. HMO/2026/01234"
            className={errors.hmoLicenceNumber ? "border-danger focus:border-danger focus:ring-danger/25" : ""}
          />
          {errors.hmoLicenceNumber && (
            <p className="mt-1 text-xs text-danger">{errors.hmoLicenceNumber}</p>
          )}
        </Field>

        <Field label="Issuing Authority" className="sm:col-span-2">
          <CouncilCombobox
            value={values.hmoLicenceIssuingAuthority}
            onChange={(val) => onChange("hmoLicenceIssuingAuthority", val.substring(0, 100))}
            placeholder="Search or enter UK council..."
            error={!!errors.hmoLicenceIssuingAuthority}
          />
          {errors.hmoLicenceIssuingAuthority && (
            <p className="mt-1 text-xs text-danger">{errors.hmoLicenceIssuingAuthority}</p>
          )}
        </Field>

        <Field label="Issue Date">
          <Input
            type="date"
            value={values.hmoLicenceIssueDate}
            onChange={(e) => onChange("hmoLicenceIssueDate", e.target.value)}
            className={errors.hmoLicenceIssueDate ? "border-danger focus:border-danger focus:ring-danger/25" : ""}
          />
          {errors.hmoLicenceIssueDate && (
            <p className="mt-1 text-xs text-danger">{errors.hmoLicenceIssueDate}</p>
          )}
        </Field>

        <Field label="Expiry Date">
          <Input
            type="date"
            value={values.hmoLicenceExpiryDate}
            onChange={(e) => {
              setExpiryTouched(true);
              onChange("hmoLicenceExpiryDate", e.target.value);
            }}
            className={errors.hmoLicenceExpiryDate ? "border-danger focus:border-danger focus:ring-danger/25" : ""}
          />
          {errors.hmoLicenceExpiryDate && (
            <p className="mt-1 text-xs text-danger">{errors.hmoLicenceExpiryDate}</p>
          )}
        </Field>

        <Field label="Reminder Lead (days)" hint="Enter 1-365 days before expiry" className="sm:col-span-2">
          <Input
            type="number"
            min="1"
            max="365"
            value={values.hmoLicenceReminderLeadDays}
            onChange={(e) => onChange("hmoLicenceReminderLeadDays", e.target.value)}
            placeholder="60"
            className={errors.hmoLicenceReminderLeadDays ? "border-danger focus:border-danger focus:ring-danger/25" : ""}
          />
          {errors.hmoLicenceReminderLeadDays && (
            <p className="mt-1 text-xs text-danger">{errors.hmoLicenceReminderLeadDays}</p>
          )}
        </Field>
      </div>
    </div>
  );
}
