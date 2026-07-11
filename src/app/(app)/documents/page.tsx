"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { SearchInput, FilterChips, EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { documents as seed, type DocItem } from "@/lib/data";
import { FileText, Download, Users, Lock, Plus, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { documentService } from "@/lib/services/document.service";

export default function DocumentsPage() {
  const { user } = useAuth();
  if (user?.role === "tenant") return <TenantDocs />;
  return <LandlordDocs />;
}

function LandlordDocs() {
  const toast = useToast();
  const [list, setList] = useState<DocItem[]>(() => [...seed]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "Property" | "Tenant" | "Other">("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Leases" });

  const match = (d: DocItem) => filter === "all" || (filter === "Property" ? ["Mortgage", "Leases"].includes(d.type) : filter === "Tenant" ? d.type === "Leases" : ["Other", "Insurance", "Inspections"].includes(d.type));
  const filtered = list.filter((d) => match(d) && (!q || d.name.toLowerCase().includes(q.toLowerCase())));

  const save = () => { if (!form.name.trim()) return toast("Enter a name", "error"); setList((l) => [{ id: `doc_${Date.now()}`, name: form.name, type: form.type, size: "1.0 MB", date: "Just now" }, ...l]); toast("Document uploaded"); setModal(false); };

  return (
    <div className="animate-in">
      <PageTitle title="Documents" subtitle="All your important documents in one place" action={<Button onClick={() => setModal(true)}><Plus className="h-4 w-4" /> Upload</Button>} />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={q} onChange={setQ} placeholder="Search documents..." className="sm:max-w-xs" />
        <FilterChips value={filter} onChange={setFilter} chips={[{ value: "all", label: "All" }, { value: "Property", label: "Property" }, { value: "Tenant", label: "Tenant" }, { value: "Other", label: "Other" }]} />
      </div>
      {filtered.length === 0 ? <Card><EmptyState icon={FileText} title="No documents found" /></Card> : (
        <Card className="divide-y divide-border">
          {filtered.map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><p className="truncate font-semibold">{d.name}</p>{d.shared && <Badge tone="primary"><Users className="mr-1 h-3 w-3" />Shared</Badge>}</div>
                <p className="text-xs text-text-muted">{d.type} · {d.size} · Uploaded on {d.date}</p>
              </div>
              <button onClick={() => toast("Downloading...")} className="rounded-lg p-2 text-text-faint hover:bg-surface-2 hover:text-primary"><Download className="h-4 w-4" /></button>
            </div>
          ))}
        </Card>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Upload Document" footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save}>Upload</Button></>}>
        <div className="space-y-4">
          <Field label="Document Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Lease Agreement Jan 2026" /></Field>
          <Field label="Type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{["Leases", "Inspections", "Insurance", "Mortgage", "Other"].map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <div className="rounded-xl border-2 border-dashed border-border-strong p-8 text-center text-sm text-text-muted">Click to select a file<br /><span className="text-xs">PDF, DOC, DOCX, JPG, PNG</span></div>
        </div>
      </Modal>
    </div>
  );
}

function TenantDocs() {
  const toast = useToast();
  
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["tenant-documents"],
    queryFn: documentService.getMyDocuments,
  });

  const mainLease = documents.find(d => d.documentType === 'Lease' || d.documentName.toLowerCase().includes('lease'));
  const otherDocs = documents.filter(d => d._id !== mainLease?._id);

  if (isLoading) {
    return <div className="animate-in mx-auto max-w-2xl text-center text-text-muted mt-10">Loading documents...</div>;
  }

  if (!mainLease && otherDocs.length === 0) {
    return (
      <div className="animate-in mx-auto max-w-2xl">
        <PageTitle title="Documents" subtitle="Contract Agreement" />
        <Card className="mt-4"><EmptyState icon={FileText} title="No Documents" message="Your landlord hasn't shared any documents with you yet." /></Card>
      </div>
    );
  }

  return (
    <div className="animate-in mx-auto max-w-2xl">
      <PageTitle title="Documents" subtitle="Contract Agreement" />
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-primary/8 p-4"><Users className="h-5 w-5 text-primary" /><p className="text-sm text-text-muted">These documents are shared between you and your landlord.</p></div>
      
      {mainLease && (
        <Card className="p-5 mb-5">
          <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText className="h-6 w-6" /></span><div><p className="font-bold">{mainLease.documentName}</p><p className="text-xs text-text-muted">{(mainLease.fileSize / 1024 / 1024).toFixed(2)} MB · {new Date(mainLease.createdAt).toLocaleDateString("en-GB")}</p></div></div>
          <Button className="mt-4 w-full" onClick={() => window.open(mainLease.documentUrl, "_blank")}><Eye className="h-4 w-4" /> View Agreement</Button>
        </Card>
      )}

      {otherDocs.length > 0 && (
        <>
          <h3 className="mb-3 font-bold">Other Documents ({otherDocs.length})</h3>
          <Card className="divide-y divide-border">
            {otherDocs.map(d => (
              <div key={d._id} className="flex items-center gap-3 p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{d.documentName}</p>
                  <p className="text-xs text-text-muted">{d.documentType} · {(d.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={() => window.open(d.documentUrl, "_blank")} className="rounded-lg p-2 text-text-faint hover:bg-surface-2 hover:text-primary"><Download className="h-4 w-4" /></button>
              </div>
            ))}
          </Card>
        </>
      )}
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-text-faint"><Lock className="h-3.5 w-3.5" /> Read-only · Contact your landlord for changes</p>
    </div>
  );
}
