"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { Plus, MessageSquareWarning, User, MapPin, Calendar, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintService, Complaint, ComplaintCategory, ComplaintUrgency, ComplaintStatus, CreateComplaintInput } from "@/lib/services/complaint.service";

const CATEGORY_MAP: Record<string, ComplaintCategory> = {
  "Property Condition": "property_condition",
  "Noise": "noise",
  "Neighbour Dispute": "neighbour_dispute",
  "Billing": "billing",
  "Communication": "communication",
  "Other": "other",
};

const REVERSE_CATEGORY_MAP: Record<ComplaintCategory, string> = {
  property_condition: "Property Condition",
  noise: "Noise",
  neighbour_dispute: "Neighbour Dispute",
  billing: "Billing",
  communication: "Communication",
  other: "Other",
};

const URGENCY_MAP: Record<string, ComplaintUrgency> = {
  "Low": "low",
  "Medium": "medium",
  "High": "high",
};

const REVERSE_URGENCY_MAP: Record<ComplaintUrgency, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const STATUS_MAP: Record<ComplaintStatus, string> = {
  in_review: "In Review",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const urgTone = { high: "danger", medium: "warning", low: "success" } as const;

export default function ComplaintsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isTenant = user?.role === "tenant";

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ 
    category: "Property Condition", 
    title: "", 
    description: "", 
    urgency: "Medium" 
  });

  const { data: complaintsData, isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => complaintService.listComplaints(),
  });

  const list = complaintsData?.complaints || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: ComplaintStatus }) => complaintService.updateStatus(id, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast(`Marked as ${STATUS_MAP[variables.status]}`);
    },
    onError: () => {
      toast("Failed to update status", "error");
    }
  });

  const submitMutation = useMutation({
    mutationFn: (data: CreateComplaintInput) => complaintService.submitComplaint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast("Complaint submitted");
      setModal(false);
      setForm({ category: "Property Condition", title: "", description: "", urgency: "Medium" });
    },
    onError: () => {
      toast("Failed to submit complaint", "error");
    }
  });

  const setStatus = (id: string, status: ComplaintStatus) => { 
    updateStatusMutation.mutate({ id, status });
  };

  const save = () => { 
    if (!form.title.trim()) return toast("Enter a title", "error"); 
    submitMutation.mutate({
      title: form.title,
      description: form.description,
      category: CATEGORY_MAP[form.category],
      urgency: URGENCY_MAP[form.urgency]
    });
  };

  const getComplaintTone = (status: ComplaintStatus) => {
    switch (status) {
      case "in_review": return "warning";
      case "in_progress": return "primary";
      case "resolved":
      case "closed": return "success";
      default: return "neutral";
    }
  };

  return (
    <div className="animate-in">
      <PageTitle 
        title={isTenant ? "My Complaints" : "Tenant Complaints"} 
        subtitle={isTenant ? "Submit and track your complaints" : "Review and resolve tenant complaints"} 
        action={
          isTenant && (
            <Button onClick={() => { 
              setForm({ category: "Property Condition", title: "", description: "", urgency: "Medium" }); 
              setModal(true); 
            }}>
              <Plus className="h-4 w-4" /> New Complaint
            </Button>
          )
        } 
      />

      {isLoading ? (
        <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState 
            icon={MessageSquareWarning} 
            title="No complaints" 
            message={isTenant ? "You have not submitted any complaints yet." : "Tenant complaints will appear here."} 
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((c) => (
            <Card key={c._id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">{REVERSE_CATEGORY_MAP[c.category] || c.category}</Badge>
                  <Badge tone={urgTone[c.urgency] || "neutral"}>{REVERSE_URGENCY_MAP[c.urgency] || c.urgency} urgency</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={getComplaintTone(c.status)}>{STATUS_MAP[c.status] || c.status}</Badge>
                  {!isTenant && c.status !== "resolved" && c.status !== "closed" && (
                    <Button 
                      size="sm" 
                      loading={updateStatusMutation.isPending && updateStatusMutation.variables?.id === c._id}
                      onClick={() => setStatus(c._id || (c as any).id, c.status === "in_review" ? "in_progress" : "resolved")}
                    >
                      {c.status === "in_review" ? "Start Progress" : "Resolve"}
                    </Button>
                  )}
                </div>
              </div>
              <h3 className="mt-3 font-bold">{c.title}</h3>
              <p className="mt-1 text-sm text-text-muted">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-text-muted">
                {!isTenant && <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {(c.tenantId as any)?.name || 'Tenant'}</span>}
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {(c.propertyId as any)?.propertyName || 'Property'}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        open={modal} 
        onClose={() => setModal(false)} 
        title="New Complaint" 
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button loading={submitMutation.isPending} onClick={save}>Submit Complaint</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {Object.keys(CATEGORY_MAP).map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mould in bathroom ceiling" />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue" />
          </Field>
          <Field label="Urgency">
            <Select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
              {Object.keys(URGENCY_MAP).map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
