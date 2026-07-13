"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/misc";
import { billTone } from "@/lib/data";
import { gbp } from "@/lib/utils";
import {
  Droplet,
  Zap,
  Flame,
  Landmark,
  Phone,
  Globe,
  FileText,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { billService, MonthlyBill } from "@/lib/services/bill.service";

const icons: Record<string, React.ElementType> = {
  Water: Droplet,
  Electricity: Zap,
  Gas: Flame,
  "Council Tax": Landmark,
  General: FileText,
};

export default function BillsPage() {
  const { data: bills = [], isLoading } = useQuery({
    queryKey: ["monthly-bills"],
    queryFn: billService.getAll,
  });

  const total = bills.reduce((s, b) => s + b.amount, 0);
  const paid = bills.filter((b) => b.status === "Paid").length;
  const pending = bills.filter((b) => b.status === "Pending").length;

  return (
    <div className="animate-in">
      <PageTitle
        title="Monthly Bills"
        subtitle="Track your utilities & suppliers"
      />

      <div
        className="overflow-hidden rounded-2xl p-6 text-white"
        style={{ background: "linear-gradient(120deg,#008577,#00574b)" }}
      >
        <p className="text-sm text-white/80">Estimated Monthly Total</p>
        <p className="text-4xl font-extrabold">
          {gbp(total, { decimals: true })}
        </p>
        <div className="mt-4 flex gap-3 text-xs font-semibold">
          <span className="rounded-full bg-white/15 px-3 py-1">
            {paid} Paid
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1">
            {pending} Pending
          </span>
        </div>
      </div>

      <h3 className="mb-3 mt-6 font-bold">Your Bills ({bills.length})</h3>

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-text-muted">
            Loading bills...
          </div>
        </Card>
      ) : bills.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No Bills Found"
            message="You don't have any monthly bills yet."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {bills.map((b) => {
            const Icon = icons[b.billType] ?? FileText;
            return (
              <Card key={b._id} className="p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="font-bold">{b.billType}</p>
                    <p className="text-xs text-text-muted">
                      {b.providerDetails?.name || "Unknown Provider"}
                    </p>
                  </div>
                  <Badge tone={billTone(b.status)}>{b.status}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="text-text-muted">
                    Due {new Date(b.dueDate).toLocaleDateString("en-GB")}
                  </span>
                  <span className="font-bold">
                    {gbp(b.amount, { decimals: true })}
                  </span>
                </div>
                {(b.providerDetails?.contact || b.providerDetails?.website) && (
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-muted">
                    {b.providerDetails.contact && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />{" "}
                        {b.providerDetails.contact}
                      </span>
                    )}
                    {b.providerDetails.website && (
                      <span className="flex items-center gap-1 text-primary">
                        <Globe className="h-3.5 w-3.5" />{" "}
                        {b.providerDetails.website}
                      </span>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
