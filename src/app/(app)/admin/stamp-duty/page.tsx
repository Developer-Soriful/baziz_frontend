"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calculatorService, StampDutyRateSet } from "@/lib/services/calculator.service";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/primitives";
import { Field, Input, Select } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, RefreshCw, Check, AlertCircle, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { gbp } from "@/lib/utils";

export default function StampDutyRatesAdminPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State for Manual Proposal
  const [region, setRegion] = useState("england-ni");
  const [regime, setRegime] = useState("residential");
  const [surchargeRate, setSurchargeRate] = useState(0.03);
  const [bands, setBands] = useState<Array<{ upTo: number; rate: number }>>([
    { upTo: 250000, rate: 0 },
    { upTo: -1, rate: 0.12 },
  ]);

  // Fetch all rate sets (active, proposals, archived)
  const { data: rateSets = [], isLoading } = useQuery({
    queryKey: ["adminStampDutyRates"],
    queryFn: () => calculatorService.getAllStampDutyRates(),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => calculatorService.approveStampDutyProposal(id),
    onSuccess: () => {
      toast("Proposal approved and promoted to active!");
      qc.invalidateQueries({ queryKey: ["adminStampDutyRates"] });
      qc.invalidateQueries({ queryKey: ["stampDutyRates"] });
    },
    onError: () => {
      toast("Failed to approve proposal", "error");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => calculatorService.createStampDutyProposal(data),
    onSuccess: () => {
      toast("Proposal created successfully!");
      setShowAddForm(false);
      qc.invalidateQueries({ queryKey: ["adminStampDutyRates"] });
    },
    onError: () => {
      toast("Failed to create proposal", "error");
    },
  });

  const simulateScrapeMutation = useMutation({
    mutationFn: async () => {
      // Mock scraping HMRC / Revenue website and creating a proposal
      const mockScrapedData = {
        region: "england-ni",
        regime: "residential",
        surchargeRate: 0.03,
        bands: [
          { upTo: 250000, rate: 0 },
          { upTo: 925000, rate: 0.05 },
          { upTo: 1500000, rate: 0.1 },
          { upTo: -1, rate: 0.125 }, // AI Scraped slightly higher top rate
        ],
      };
      return calculatorService.createStampDutyProposal(mockScrapedData);
    },
    onSuccess: () => {
      toast("AI Refresh complete: New residential rates proposal created!");
      qc.invalidateQueries({ queryKey: ["adminStampDutyRates"] });
    },
    onError: () => {
      toast("Failed to run AI Scraper", "error");
    },
  });

  const addBand = () => {
    setBands((prev) => [...prev, { upTo: 0, rate: 0 }]);
  };

  const removeBand = (index: number) => {
    setBands((prev) => prev.filter((_, i) => i !== index));
  };

  const updateBand = (index: number, key: "upTo" | "rate", value: number) => {
    setBands((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [key]: value } : b))
    );
  };

  const handleCreateManualProposal = () => {
    // Validate bands
    if (bands.length === 0) {
      toast("Please add at least one tax band", "error");
      return;
    }
    createMutation.mutate({
      region,
      regime,
      surchargeRate,
      bands,
    });
  };

  const activeRates = rateSets.filter((r) => r.status === "active");
  const proposals = rateSets.filter((r) => r.status === "proposal");

  return (
    <div className="animate-in space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/calculators">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Stamp Duty Rates Dashboard</h1>
            <p className="text-sm text-text-muted">
              Manage active tax rates and approve proposals
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => simulateScrapeMutation.mutate()}
            loading={simulateScrapeMutation.isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            AI Rates Refresh
          </Button>
          <Button variant="primary" onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Proposal
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card className="p-5 border-l-4 border-l-primary space-y-4">
          <h3 className="font-bold text-lg">Create New Rate Proposal</h3>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Region">
              <Select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="england-ni">England & NI (SDLT)</option>
                <option value="wales">Wales (LTT)</option>
                <option value="scotland">Scotland (LBTT)</option>
              </Select>
            </Field>
            <Field label="Regime">
              <Select value={regime} onChange={(e) => setRegime(e.target.value)}>
                <option value="residential">Residential</option>
                <option value="residential-ftb">First Time Buyer Relief</option>
                <option value="commercial">Commercial / Non-residential</option>
              </Select>
            </Field>
            <Field label="Surcharge Rate (e.g. 0.03 for 3%)">
              <Input
                type="number"
                step="0.01"
                value={surchargeRate}
                onChange={(e) => setSurchargeRate(Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm">Tax Bands (Sorted ascending)</h4>
              <Button variant="outline" size="sm" onClick={addBand}>
                Add Band
              </Button>
            </div>
            {bands.map((band, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Up To Price (-1 for unlimited)"
                    type="number"
                    value={band.upTo}
                    onChange={(e) => updateBand(idx, "upTo", Number(e.target.value))}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Tax Rate (e.g. 0.05 for 5%)"
                    type="number"
                    step="0.01"
                    value={band.rate}
                    onChange={(e) => updateBand(idx, "rate", Number(e.target.value))}
                  />
                </div>
                <Button variant="danger" size="sm" onClick={() => removeBand(idx)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateManualProposal}
              loading={createMutation.isPending}
            >
              Submit Proposal
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Active Rates */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Check className="h-5 w-5 text-success" />
            Active Rate Sets
          </h2>
          {isLoading ? (
            <p className="text-sm text-text-muted">Loading active rates...</p>
          ) : activeRates.length === 0 ? (
            <p className="text-sm text-text-muted">No active rate sets configured.</p>
          ) : (
            <div className="space-y-4">
              {activeRates.map((rateSet) => (
                <Card key={rateSet._id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm uppercase">
                        {rateSet.region} &bull; {rateSet.regime}
                      </h4>
                      <p className="text-xs text-text-muted">
                        Version {rateSet.version} &bull; Surcharge: {(rateSet.surchargeRate * 100).toFixed(0)}%
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success uppercase">
                      Active
                    </span>
                  </div>
                  <div className="divide-y divide-border text-xs">
                    {rateSet.bands.map((band, idx) => (
                      <div key={idx} className="flex justify-between py-1.5 first:pt-0 last:pb-0">
                        <span>{band.upTo === -1 ? "Above last band" : `Up to ${gbp(band.upTo)}`}</span>
                        <span className="font-bold">{(band.rate * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Proposals */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Rate Proposals (Drafts)
          </h2>
          {isLoading ? (
            <p className="text-sm text-text-muted">Loading proposals...</p>
          ) : proposals.length === 0 ? (
            <div className="rounded-xl border border-border border-dashed p-6 text-center text-sm text-text-muted">
              No pending rate proposals. Run AI Refresh or click Create Proposal to propose tax rate updates.
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((rateSet) => (
                <Card key={rateSet._id} className="p-4 space-y-3 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm uppercase">
                        {rateSet.region} &bull; {rateSet.regime}
                      </h4>
                      <p className="text-xs text-text-muted">
                        Proposed Version {rateSet.version} &bull; Surcharge: {(rateSet.surchargeRate * 100).toFixed(0)}%
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => approveMutation.mutate(rateSet._id)}
                      loading={approveMutation.isPending}
                    >
                      Approve & Publish
                    </Button>
                  </div>
                  <div className="divide-y divide-border text-xs">
                    {rateSet.bands.map((band, idx) => (
                      <div key={idx} className="flex justify-between py-1.5 first:pt-0 last:pb-0">
                        <span>{band.upTo === -1 ? "Above last band" : `Up to ${gbp(band.upTo)}`}</span>
                        <span className="font-bold">{(band.rate * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
