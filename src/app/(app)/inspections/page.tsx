"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { PillTabs, EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { inspections as seed, inspectionTone, type Inspection } from "@/lib/data";
import { CalendarCheck, User, MapPin, Calendar } from "lucide-react";

const tagTone = { Routine: "info", "Move In": "success", "Move Out": "danger" } as const;

export default function InspectionsPage() {
  const toast = useToast();
  const [list] = useState<Inspection[]>(() => [...seed]);
  const [tab, setTab] = useState<"All" | "Scheduled" | "Completed">("All");
  const filtered = list.filter((i) => tab === "All" || (tab === "Scheduled" ? i.status !== "Valid" : i.status === "Valid"));

  return (
    <div className="animate-in">
      <PageTitle title="Inspections" subtitle="Manage property inspections" />
      <div className="mb-5"><PillTabs value={tab} onChange={setTab} tabs={["All", "Scheduled", "Completed"]} /></div>
      {filtered.length === 0 ? <Card><EmptyState icon={CalendarCheck} title="No inspections" /></Card> : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((i) => (
            <Card key={i.id} className="p-5">
              <div className="flex items-center justify-between"><Badge tone={tagTone[i.tag]}>{i.tag}</Badge><Badge tone={inspectionTone(i.status)}>{i.status}</Badge></div>
              <h3 className="mt-3 font-bold">{i.title}</h3>
              <p className="mt-1 text-sm text-text-muted">{i.description}</p>
              <div className="mt-3 space-y-1.5 text-sm text-text-muted">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {i.property}</p>
                <p className="flex items-center gap-2"><User className="h-4 w-4" /> {i.inspector}</p>
                <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {i.date}</p>
              </div>
              {i.status !== "Valid" && <div className="mt-4 flex gap-2"><Button size="sm" variant="secondary" className="flex-1" onClick={() => toast("Rescheduled")}>Reschedule</Button><Button size="sm" variant="outline" className="flex-1 !border-danger !text-danger" onClick={() => toast("Cancelled", "info")}>Cancel</Button></div>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
