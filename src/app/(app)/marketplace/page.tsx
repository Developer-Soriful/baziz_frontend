"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { PillTabs, SearchInput } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { gbp } from "@/lib/utils";
import { MapPin, TrendingUp, Bookmark, Eye, MessageCircle, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { marketplaceService, MarketplaceListing, JointVenture } from "@/lib/services/marketplace.service";

function epcTone(r: string) { return r === "A" || r === "B" ? "success" : r === "C" ? "info" : "warning"; }
function riskTone(r: string) { return r.startsWith("LOW") ? "success" : r.startsWith("MEDIUM") ? "warning" : "danger"; }

export default function MarketplacePage() {
  const toast = useToast();
  
  const { data: properties = [], isLoading: isLoadingProps } = useQuery({
    queryKey: ["marketplace-properties"],
    queryFn: marketplaceService.getListings,
  });

  const { data: jointVentures = [], isLoading: isLoadingJv } = useQuery({
    queryKey: ["marketplace-jv"],
    queryFn: marketplaceService.getJointVentures,
  });

  const [tab, setTab] = useState<"Properties" | "Joint Ventures">("Properties");
  const [q, setQ] = useState("");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<MarketplaceListing | null>(null);
  const [jv, setJv] = useState<JointVenture | null>(null);
  const [enquire, setEnquire] = useState(false);

  const toggleSave = (id: string) => setSaved((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const props = properties.filter((m: any) => !q || m.title.toLowerCase().includes(q.toLowerCase()) || m.location.toLowerCase().includes(q.toLowerCase()));
  const jvs = jointVentures.filter((j: any) => !q || j.title.toLowerCase().includes(q.toLowerCase()) || j.location.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="animate-in">
      <PageTitle title="Marketplace" subtitle="Investment opportunities & joint ventures" />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <PillTabs value={tab} onChange={setTab} tabs={["Properties", "Joint Ventures"]} />
        <SearchInput value={q} onChange={setQ} placeholder="Search..." className="sm:ml-auto sm:max-w-xs" />
      </div>

      {tab === "Properties" && (
        isLoadingProps ? (
          <Card className="p-8 text-center text-text-muted">Loading properties...</Card>
        ) : props.length === 0 ? (
          <Card className="p-8 text-center text-text-muted">No properties found.</Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {props.map((m: any) => (
              <Card key={m.id || m._id} className="group overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  <img src={m.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800"} alt={m.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                  <span className="absolute left-3 top-3"><Badge tone={epcTone(m.epcRating)}>EPC {m.epcRating}</Badge></span>
                  <button onClick={() => toggleSave(m.id || m._id)} className="absolute right-3 top-3 rounded-lg bg-black/50 p-2 text-white backdrop-blur"><Bookmark className={`h-4 w-4 ${saved.has(m.id || m._id) ? "fill-white" : ""}`} /></button>
                </div>
                <div className="p-4">
                  <p className="text-xl font-extrabold text-primary">{gbp(m.price)}</p>
                  <h3 className="mt-1 font-bold">{m.title}</h3>
                  <p className="flex items-center gap-1 text-xs text-text-muted"><MapPin className="h-3.5 w-3.5" /> {m.location}</p>
                  <div className="mt-3 grid grid-cols-4 gap-1 border-t border-border pt-3 text-center text-xs">
                    <div><p className="font-bold">{m.type}</p><p className="text-text-faint">Type</p></div>
                    <div><p className="font-bold">{(m.size || "0").split(" ")[0]}</p><p className="text-text-faint">Sq ft</p></div>
                    <div><p className="flex items-center justify-center gap-0.5 font-bold text-success"><TrendingUp className="h-3 w-3" />{m.yield}%</p><p className="text-text-faint">Yield</p></div>
                    <div><p className="font-bold">{m.listedDays}</p><p className="text-text-faint">Listed</p></div>
                  </div>
                  <Button size="sm" className="mt-3 w-full" onClick={() => setDetail(m)}>View & Enquire</Button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {tab === "Joint Ventures" && (
        isLoadingJv ? (
          <Card className="p-8 text-center text-text-muted">Loading joint ventures...</Card>
        ) : jvs.length === 0 ? (
          <Card className="p-8 text-center text-text-muted">No joint ventures found.</Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {jvs.map((j: any) => (
              <Card key={j.id || j._id} className="overflow-hidden">
                <img src={j.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800"} alt={j.title} className="h-40 w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-center gap-2"><Badge tone="info">{j.projectType}</Badge><Badge tone={riskTone(j.risk)}>{j.risk}</Badge></div>
                  <h3 className="mt-2 font-bold">{j.title}</h3>
                  <p className="flex items-center gap-1 text-xs text-text-muted"><MapPin className="h-3.5 w-3.5" /> {j.location}</p>
                  <p className="mt-2 text-2xl font-extrabold text-primary">{gbp(j.investmentNeeded)}</p>
                  <p className="text-xs text-text-muted">funding required</p>
                  <div className="mt-3 grid grid-cols-4 gap-1 border-t border-border pt-3 text-center text-xs">
                    <div><p className="font-bold capitalize">{(j.investmentModel || "Equity").split(" ")[0]}</p><p className="text-text-faint">Model</p></div>
                    <div><p className="font-bold">{j.timeline}</p><p className="text-text-faint">Timeline</p></div>
                    <div><p className="font-bold text-success">{j.expectedReturn}%</p><p className="text-text-faint">Return</p></div>
                    <div><p className="font-bold">{(j.partners || "1").split(" ")[0]}</p><p className="text-text-faint">Partners</p></div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-text-muted"><span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{j.views || 0}</span><span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{j.inquiries || 0}</span><span>{j.daysOnMarket || "1 day ago"}</span></div>
                  <div className="mt-3 flex gap-2"><Button size="sm" variant="secondary" className="flex-1" onClick={() => setJv(j)}>Details</Button><Button size="sm" className="flex-1" onClick={() => setEnquire(true)}>Enquire</Button></div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Property detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.title} subtitle={detail?.location} footer={<><Button variant="secondary" onClick={() => setDetail(null)}>Close</Button><Button onClick={() => { setDetail(null); setEnquire(true); }}>Express Interest</Button></>}>
        {detail && (<>
          <img src={detail.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800"} alt={detail.title} className="mb-4 h-48 w-full rounded-xl object-cover" />
          <p className="text-2xl font-extrabold text-primary">{gbp(detail.price)}</p>
          <p className="mt-2 text-sm text-text-muted">{detail.description}</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-lg bg-surface-2 p-3"><p className="font-bold">{detail.size}</p><p className="text-xs text-text-muted">Size</p></div>
            <div className="rounded-lg bg-surface-2 p-3"><p className="font-bold text-success">{detail.yield}%</p><p className="text-xs text-text-muted">Yield</p></div>
            <div className="rounded-lg bg-surface-2 p-3"><p className="font-bold">EPC {detail.epcRating}</p><p className="text-xs text-text-muted">Rating</p></div>
          </div>
        </>)}
      </Modal>

      {/* JV detail modal */}
      <Modal open={!!jv} onClose={() => setJv(null)} title={jv?.title} subtitle={jv?.location} size="lg" footer={<><Button variant="secondary" onClick={() => setJv(null)}>Close</Button><Button onClick={() => { setJv(null); setEnquire(true); }}>Message Sponsor</Button></>}>
        {jv && (<>
          <p className="text-sm text-text-muted">{jv.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["Total Cost", gbp(jv.totalProjectCost)], ["Funding", gbp(jv.investmentNeeded)], ["Return", `${jv.expectedReturn}%`], ["Timeline", jv.timeline]].map(([k, v]) => (<div key={k} className="rounded-lg bg-surface-2 p-3"><p className="text-xs text-text-muted">{k}</p><p className="font-bold">{v}</p></div>))}
          </div>
          <div className="mt-4 rounded-xl bg-primary/8 p-4"><p className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-primary" /> Lead Partner</p><p className="mt-1 text-sm">{jv.leadPartnerName}</p><p className="text-sm text-text-muted">{jv.leadPartnerContact}</p></div>
        </>)}
      </Modal>

      {/* Enquiry modal */}
      <Modal open={enquire} onClose={() => setEnquire(false)} title="Express Interest" footer={<><Button variant="secondary" onClick={() => setEnquire(false)}>Cancel</Button><Button onClick={() => { setEnquire(false); toast("Enquiry sent successfully"); }}>Submit</Button></>}>
        <div className="space-y-4">
          <Field label="Full Name"><Input placeholder="Jane Doe" /></Field>
          <Field label="Email"><Input placeholder="jane@example.com" /></Field>
          <Field label="Phone (optional)"><Input placeholder="+44 7700 900000" /></Field>
          <Field label="Message"><Textarea placeholder="I would like to know more about this opportunity…" /></Field>
        </div>
      </Modal>
    </div>
  );
}
