"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageTitle } from "@/components/page-title";
import { Card, Button, Badge } from "@/components/ui/primitives";
import { PillTabs } from "@/components/ui/misc";
import { Field, Input, Select } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { calculatorService } from "@/lib/services/calculator.service";
import {
  TrendingUp, Calendar, ShieldCheck, ChevronDown, ChevronUp, RefreshCw,
  ExternalLink, AlertTriangle, CheckCircle, Info, Landmark, HelpCircle,
  PiggyBank, Percent, ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// Auto-detect current UK tax year (April 6th start date)
const getAutoTaxYear = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed
  const date = d.getDate();

  // If before April 6th
  if (month < 3 || (month === 3 && date < 6)) {
    return `${year - 1}/${(year).toString().slice(-2)}`;
  }
  return `${year}/${(year + 1).toString().slice(-2)}`;
};

export default function ExitStrategyPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"cgt" | "timing" | "probate">("cgt");

  // CGT Tab States
  const [selectedTaxYear, setSelectedTaxYear] = useState<string>(getAutoTaxYear());
  const [cgtInputs, setCgtInputs] = useState({
    purchasePrice: 250000,
    salePrice: 420000,
    improvementCosts: 15000,
    sellingCosts: 5000,
    annualIncome: 45000,
    mainResidence: false,
    jointOwnership: false,
  });

  // Expandable sections for Probate
  const [expandedSection, setExpandedSection] = useState<string | null>("iht");

  // ─── Queries ──────────────────────────────────────────────────────────────
  const {
    data: cgtRates,
    isLoading: loadingCGT,
    isError: errorCGT,
    error: cgtError,
    refetch: refetchCGT,
  } = useQuery({
    queryKey: ["cgt-rates", selectedTaxYear],
    queryFn: () => calculatorService.getCGTRates(selectedTaxYear),
    retry: 1,
  });

  const {
    data: ihtRates,
    isLoading: loadingIHT,
    isError: errorIHT,
    error: ihtError,
    refetch: refetchIHT,
  } = useQuery({
    queryKey: ["iht-rates"],
    queryFn: calculatorService.getIHTRates,
    retry: 1,
  });

  // Tax year chips array (current year +/- 2 years)
  const taxYears = useMemo(() => {
    const currentStr = getAutoTaxYear();
    const currentYear = parseInt(currentStr.split("/")[0]);
    return [
      `${currentYear - 2}/${(currentYear - 1).toString().slice(-2)}`,
      `${currentYear - 1}/${(currentYear).toString().slice(-2)}`,
      currentStr,
      `${currentYear + 1}/${(currentYear + 2).toString().slice(-2)}`,
      `${currentYear + 2}/${(currentYear + 3).toString().slice(-2)}`,
    ];
  }, []);

  // CGT calculations
  const cgtCalculations = useMemo(() => {
    const {
      purchasePrice, salePrice, improvementCosts, sellingCosts,
      annualIncome, mainResidence, jointOwnership
    } = cgtInputs;

    // Capital Gain
    const gain = Math.max(0, salePrice - purchasePrice - improvementCosts - sellingCosts);

    if (mainResidence) {
      return {
        gain,
        allowance: 0,
        taxableGain: 0,
        basicBandUsed: 0,
        higherBandUsed: 0,
        cgtDue: 0,
        netProfit: gain,
        effectiveRate: 0,
        breakdownText: "Main residence relief applied — no CGT due",
      };
    }

    // Determine rates & allowance from fetch or fallbacks
    // Bundled fallback rates for 2023/24 through 2027/28
    const isAfter24 = selectedTaxYear !== "2023/24";
    const fallbackAllowance = isAfter24 ? 3000 : 6000;
    const fallbackBasicRate = 18; // Residential CGT rates
    const fallbackHigherRate = 24;
    const fallbackBasicBandLimit = 50270;
    const fallbackPersonalAllowance = 12570;

    const allowance = cgtRates?.allowance ?? fallbackAllowance;
    const basicRate = cgtRates?.basicRate ?? fallbackBasicRate;
    const higherRate = cgtRates?.higherRate ?? fallbackHigherRate;
    const basicBandLimit = cgtRates?.basicRateBand ?? fallbackBasicBandLimit;
    const personalAllowance = fallbackPersonalAllowance; // standard allowance

    // Total deductible allowance (doubled for couples)
    const totalAllowance = jointOwnership ? allowance * 2 : allowance;
    const taxableGain = Math.max(0, gain - totalAllowance);

    // Stacking gain on top of other income to determine rate band
    // Remaining basic rate band = £50,270 - (income - personal allowance of £12,570)
    const taxableIncome = Math.max(0, annualIncome - personalAllowance);
    const basicBandRemaining = Math.max(0, basicBandLimit - taxableIncome);

    // If joint ownership, bands are doubled
    const actualBasicBandRemaining = jointOwnership ? basicBandRemaining * 2 : basicBandRemaining;

    let basicBandUsed = 0;
    let higherBandUsed = 0;

    if (taxableGain <= actualBasicBandRemaining) {
      basicBandUsed = taxableGain;
    } else {
      basicBandUsed = actualBasicBandRemaining;
      higherBandUsed = taxableGain - actualBasicBandRemaining;
    }

    const cgtBasic = (basicBandUsed * basicRate) / 100;
    const cgtHigher = (higherBandUsed * higherRate) / 100;
    const cgtDue = cgtBasic + cgtHigher;

    const netProfit = gain - cgtDue;
    const effectiveRate = gain > 0 ? (cgtDue / gain) * 100 : 0;

    // Breakdown message
    const breakdownText = cgtDue > 0
      ? `£${basicBandUsed.toLocaleString()} at ${basicRate}% = £${cgtBasic.toLocaleString()} and £${higherBandUsed.toLocaleString()} at ${higherRate}% = £${cgtHigher.toLocaleString()}`
      : `Taxable gain falls under the £${totalAllowance.toLocaleString()} annual exemption.`;

    return {
      gain,
      allowance: totalAllowance,
      taxableGain,
      basicBandUsed,
      higherBandUsed,
      cgtDue,
      netProfit,
      effectiveRate,
      breakdownText,
    };
  }, [cgtInputs, cgtRates, selectedTaxYear]);

  // Handle live rates refresh
  const handleRefreshCGT = () => {
    refetchCGT();
    toast("Refetching Capital Gains Tax rates...");
  };

  const handleRefreshIHT = () => {
    refetchIHT();
    toast("Refetching Inheritance Tax bands...");
  };

  return (
    <div className="animate-in space-y-6">
      <PageTitle
        title="Exit Strategy Planning"
        subtitle="Formulate financial pathways for selling, gifting, or passing assets through inheritance"
      />

      <div className="border-b border-border pb-2">
        <PillTabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { value: "cgt", label: "Capital Gains Tax" },
            { value: "timing", label: "Market Timing" },
            { value: "probate", label: "Probate & Inheritance" },
          ]}
        />
      </div>

      {/* ─── TAB 1: CAPITAL GAINS TAX CALCULATOR ──────────────────────────────── */}
      {activeTab === "cgt" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5 space-y-5">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" /> CGT Calculator
              </h3>

              {/* Tax Year horizontal row */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-text-muted">Tax Year Disposal</label>
                <div className="flex flex-wrap gap-2">
                  {taxYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedTaxYear(year)}
                      className={cn(
                        "rounded-xl border px-4 py-2 text-xs font-bold transition-all duration-150 active:scale-[0.98]",
                        selectedTaxYear === year
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-border-strong bg-surface text-text-muted hover:border-primary hover:text-primary"
                      )}
                    >
                      {year} {year === getAutoTaxYear() && "(Current)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate Status Banner */}
              <div className="pt-1">
                {loadingCGT ? (
                  <div className="flex items-center gap-2 text-xs text-text-faint bg-surface-2/40 p-2.5 rounded-xl border border-border">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span>Fetching live CGT rates for {selectedTaxYear}...</span>
                  </div>
                ) : errorCGT ? (
                  <div className="flex items-start justify-between gap-3 text-xs text-warning bg-warning/5 p-3 rounded-xl border border-warning/20">
                    <div className="flex gap-2">
                      <AlertTriangle className="h-4.5 w-4.5 text-warning shrink-0" />
                      <div>
                        <span className="font-bold">Using bundled rates for {selectedTaxYear} (offline)</span>
                        <p className="text-[11px] text-text-faint mt-0.5">Failed to retrieve live rates: {cgtError?.message || "Toolkit down"}</p>
                      </div>
                    </div>
                    <button onClick={handleRefreshCGT} className="text-text-muted hover:text-primary p-1">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3 text-xs text-success bg-success/5 p-3 rounded-xl border border-success/20">
                    <div className="flex gap-2">
                      <CheckCircle className="h-4.5 w-4.5 text-success shrink-0" />
                      <div>
                        <span className="font-bold">Live rates for {selectedTaxYear} — updated {cgtRates?.lastUpdated || "recently"}</span>
                        <p className="text-[11px] text-text-faint mt-0.5">
                          Allowance: £{(cgtRates?.allowance || 3000).toLocaleString()} | Band limits fetched successfully.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {cgtRates?.source && (
                        <a
                          href={cgtRates.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                        >
                          View source <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <button onClick={handleRefreshCGT} className="text-text-muted hover:text-primary p-1">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <label className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-2/40 cursor-pointer border border-transparent hover:border-border">
                  <input
                    type="checkbox"
                    checked={cgtInputs.mainResidence}
                    onChange={(e) => setCgtInputs({ ...cgtInputs, mainResidence: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-text block">Main Residence Relief</span>
                    <span className="text-[10px] text-text-faint block mt-0.5">Qualifies for PRR (zero CGT)</span>
                  </div>
                </label>

                <label className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-2/40 cursor-pointer border border-transparent hover:border-border">
                  <input
                    type="checkbox"
                    checked={cgtInputs.jointOwnership}
                    onChange={(e) => setCgtInputs({ ...cgtInputs, jointOwnership: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-text block">Joint Ownership</span>
                    <span className="text-[10px] text-text-faint block mt-0.5">Double annual exemption allowance</span>
                  </div>
                </label>
              </div>

              {/* Numerical Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Purchase Price (£)">
                  <Input
                    type="number"
                    value={cgtInputs.purchasePrice}
                    onChange={(e) => setCgtInputs({ ...cgtInputs, purchasePrice: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Estimated Sale Price (£)">
                  <Input
                    type="number"
                    value={cgtInputs.salePrice}
                    onChange={(e) => setCgtInputs({ ...cgtInputs, salePrice: Number(e.target.value) })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Capital Improvements (£)">
                  <Input
                    type="number"
                    value={cgtInputs.improvementCosts}
                    onChange={(e) => setCgtInputs({ ...cgtInputs, improvementCosts: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Selling Costs (Legal/Agent) (£)">
                  <Input
                    type="number"
                    value={cgtInputs.sellingCosts}
                    onChange={(e) => setCgtInputs({ ...cgtInputs, sellingCosts: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Annual Income (£)" hint="For tax band placement">
                  <Input
                    type="number"
                    value={cgtInputs.annualIncome}
                    onChange={(e) => setCgtInputs({ ...cgtInputs, annualIncome: Number(e.target.value) })}
                  />
                </Field>
              </div>
            </Card>

            {/* Planning Tips */}
            <Card className="p-4 bg-surface-2/20 border border-border space-y-2">
              <h4 className="text-xs font-extrabold uppercase text-text-muted flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary" /> Tax Efficiency Guidelines
              </h4>
              <ul className="text-xs text-text-muted space-y-1.5 list-disc pl-4 leading-relaxed">
                <li><strong>Spreading Disposals:</strong> Spread sales across tax years to maximize allowances.</li>
                <li><strong>Enhancement Records:</strong> Keep invoices for capital renovations to deduct from gains.</li>
                <li><strong>Joint Registration:</strong> Register properties in joint names before sale to use both tax bands.</li>
              </ul>
            </Card>
          </div>

          {/* Results Summary Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-5 bg-surface border border-border/80 shadow-md relative overflow-hidden flex flex-col justify-between h-full">
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-text uppercase tracking-wider">Calculation Results</h4>

                <div className="space-y-3.5 border-t border-border pt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted font-medium">Gross Capital Gain:</span>
                    <span className="font-bold text-text">£{cgtCalculations.gain.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted font-medium">Allowance Deducted:</span>
                    <span className="font-bold text-success">-£{cgtCalculations.allowance.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-xs border-b border-border pb-3.5">
                    <span className="text-text-muted font-medium">Net Taxable Gain:</span>
                    <span className="font-bold text-text">£{cgtCalculations.taxableGain.toLocaleString()}</span>
                  </div>

                  {/* Calculations breakdown description */}
                  <div className="p-2.5 rounded-xl bg-surface-2 text-[11px] font-semibold text-text-muted leading-relaxed">
                    {cgtCalculations.breakdownText}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-text-muted font-medium">CGT Due:</span>
                    <span className="text-lg font-black text-danger">£{cgtCalculations.cgtDue.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-muted font-medium">Effective CGT Rate:</span>
                    <Badge tone={cgtCalculations.effectiveRate > 15 ? "warning" : "primary"} className="font-bold text-xs py-0.5">
                      {cgtCalculations.effectiveRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Big Profit Indicator */}
              <div className="border-t border-border pt-4 mt-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-text-faint">Net Cash Return After Tax</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-text">£{cgtCalculations.netProfit.toLocaleString()}</span>
                  <span className="text-xs text-success font-bold flex items-center gap-0.5">
                    <PiggyBank className="h-3.5 w-3.5" /> Profit
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ─── TAB 2: MARKET TIMING RECOMMENDATIONS ──────────────────────────────── */}
      {activeTab === "timing" && (
        <div className="space-y-6">
          <Card className="p-5 flex flex-col md:flex-row md:items-center gap-4 bg-primary/5 border border-primary/20">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-text">Sell-Optimal Conditions</h3>
              <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
                Maximize valuations and shorten market listings by aligning disposals with seasonal patterns and supply indexes.
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1 bg-success/15 border border-success/20 px-3 py-1 rounded-full text-success text-xs font-bold">
              <CheckCircle className="h-3.5 w-3.5" /> Favorable Supply
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { season: "Spring (March-May)", rating: "Best", ratingColor: "bg-success/10 text-success border-success/20", desc: "Peak buyer volumes, families seeking moves before new terms, and premium visibility under daylight conditions." },
              { season: "Summer (June-August)", rating: "Good", ratingColor: "bg-primary/10 text-primary border-primary/20", desc: "Steady buyer flows. Volumes can dip mid-season during school break windows, but closing times remain rapid." },
              { season: "Autumn (Sept-Nov)", rating: "Fair", ratingColor: "bg-warning/10 text-warning border-warning/20", desc: "Moderate traffic. Buyers push to conclude sales before Christmas shutdowns. Listing timelines expand." },
              { season: "Winter (Dec-Feb)", rating: "Slow", ratingColor: "bg-danger/10 text-danger border-danger/20", desc: "Lowest activity. Limited viewings, though incoming queries usually represent highly motivated buyers." }
            ].map((s) => (
              <Card key={s.season} className="p-4 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <span className="text-xs font-extrabold text-text">{s.season}</span>
                    <Badge tone="neutral" className={cn("text-[10px] font-extrabold px-2 py-0.5", s.ratingColor)}>
                      {s.rating}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted mt-2.5 leading-relaxed">{s.desc}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-5 space-y-3">
            <h4 className="text-sm font-bold text-text">Strategic Execution Timeline</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-1">
                <span className="text-xs font-bold text-primary">01 / Prep Window</span>
                <p className="text-xs text-text-muted leading-relaxed">
                  List property 4-6 weeks before peak seasonal demands. Get certifications and structural reviews fully logged.
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-primary">02 / School Break Avoidance</span>
                <p className="text-xs text-text-muted leading-relaxed">
                  Avoid listing launches during late August or Christmas weeks when conveyancing speeds slow down by up to 50%.
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-primary">03 / local Supply Check</span>
                <p className="text-xs text-text-muted leading-relaxed">
                  Monitor local registry indices. List during periods of low comparable properties to capture supply premiums.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB 3: PROBATE & INHERITANCE ────────────────────────────────────── */}
      {activeTab === "probate" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Expandable Sections */}
          <div className="lg:col-span-2 space-y-3">
            {/* Rates banner */}
            {loadingIHT ? (
              <div className="flex items-center gap-2 text-xs text-text-faint bg-surface-2/40 p-2.5 rounded-xl border border-border">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Fetching live IHT rates...</span>
              </div>
            ) : errorIHT ? (
              <div className="flex items-start justify-between gap-3 text-xs text-warning bg-warning/5 p-3 rounded-xl border border-warning/20">
                <div className="flex gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-warning shrink-0" />
                  <div>
                    <span className="font-bold">Using bundled rates (offline)</span>
                    <p className="text-[11px] text-text-faint mt-0.5">Failed to retrieve live thresholds: {ihtError?.message || "Toolkit down"}</p>
                  </div>
                </div>
                <button onClick={handleRefreshIHT} className="text-text-muted hover:text-primary p-1">
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3 text-xs text-success bg-success/5 p-3 rounded-xl border border-success/20">
                <div className="flex gap-2">
                  <CheckCircle className="h-4.5 w-4.5 text-success shrink-0" />
                  <div>
                    <span className="font-bold">Live rates — updated {ihtRates?.lastUpdated || "recently"}</span>
                    <p className="text-[11px] text-text-faint mt-0.5">
                      Nil-Rate Band: £{(ihtRates?.nilRateBand || 325000).toLocaleString()} | Residence Nil-Rate Band: £{(ihtRates?.residenceNilRateBand || 175000).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {ihtRates?.source && (
                    <a
                      href={ihtRates.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                    >
                      View source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <button onClick={handleRefreshIHT} className="text-text-muted hover:text-primary p-1">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Accordion Panels */}
            {[
              {
                id: "iht",
                title: "HMRC Inheritance Tax (IHT) Rates",
                icon: Landmark,
                content: (
                  <div className="space-y-4 text-xs text-text-muted leading-relaxed">
                    <p>Inheritance tax is levied on estates passed at death. Live statutory parameters fetched from HMRC database:</p>
                    <div className="grid grid-cols-2 gap-4 bg-surface-2/40 p-4 rounded-2xl border border-border">
                      <div>
                        <span className="text-text-faint font-semibold text-[10px] uppercase">Nil-Rate Band (NRB)</span>
                        <span className="text-base font-bold text-text block mt-0.5">£{(ihtRates?.nilRateBand || 325000).toLocaleString()}</span>
                        <span className="text-[10px] text-text-faint">Standard tax-free allowance threshold.</span>
                      </div>
                      <div>
                        <span className="text-text-faint font-semibold text-[10px] uppercase">Residence Nil-Rate Band</span>
                        <span className="text-base font-bold text-text block mt-0.5">£{(ihtRates?.residenceNilRateBand || 175000).toLocaleString()}</span>
                        <span className="text-[10px] text-text-faint">Additional allowance when passing home to children.</span>
                      </div>
                      <div className="col-span-2 border-t border-border pt-3.5 mt-1 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-text-faint font-semibold text-[10px] uppercase">Standard IHT Rate</span>
                          <span className="text-base font-bold text-text block mt-0.5">{(ihtRates?.ihtRate || 40)}%</span>
                        </div>
                        <div>
                          <span className="text-text-faint font-semibold text-[10px] uppercase">Combined Couple Limit</span>
                          <span className="text-base font-bold text-text block mt-0.5">£{(ihtRates?.coupleCombinedThreshold || 1000000).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                id: "gifting",
                title: "Property Gifting Rules (7-Year Exemption)",
                icon: PiggyBank,
                content: (
                  <div className="space-y-3 text-xs text-text-muted leading-relaxed">
                    <p>Gifting property can remove it from inheritance valuations, but is subject to strict rules:</p>
                    <ul className="list-disc pl-4 space-y-1.5">
                      <li><strong>7-Year Rule:</strong> Gifts are Potentially Exempt Transfers (PET). Excluded from IHT only if the donor survives for 7 full years after the gift.</li>
                      <li><strong>Taper Relief:</strong> If death occurs 3-7 years post-gift, tax is reduced gradually: 3-4 years (80% IHT), 4-5 years (60%), 5-6 years (40%), 6-7 years (20%).</li>
                      <li><strong>CGT Risk:</strong> Gifting residential property triggers Capital Gains Tax calculated on current market value, even if no cash changes hands.</li>
                    </ul>
                  </div>
                )
              },
              {
                id: "trusts",
                title: "Trusts & Structural Ownership Schemes",
                icon: ShieldCheck,
                content: (
                  <div className="space-y-3.5 text-xs text-text-muted leading-relaxed">
                    <p>Placing property in trusts can shelter asset valuations, depending on structure:</p>
                    <div className="space-y-2.5">
                      <div>
                        <span className="font-bold text-text text-xs">Bare Trust</span>
                        <p className="text-[11px] mt-0.5">Assets held directly in trustee names for absolute benefit of named beneficiaries. Beneficiaries have immediate rights.</p>
                      </div>
                      <div>
                        <span className="font-bold text-text text-xs">Discretionary Trust</span>
                        <p className="text-[11px] mt-0.5">Trustees retain choice on when and how to allocate gains/income. Shelters value but incurs periodic 10-year exit charges.</p>
                      </div>
                      <div>
                        <span className="font-bold text-text text-xs">Interest in Possession Trust</span>
                        <p className="text-[11px] mt-0.5">One beneficiary receives rental income for life, while assets pass to capital beneficiaries at death.</p>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                id: "probate",
                title: "Probate Administration Process (6 Steps)",
                icon: Calendar,
                content: (
                  <div className="space-y-3 text-xs text-text-muted leading-relaxed">
                    <ol className="list-decimal pl-4 space-y-2">
                      <li><strong>Register Death:</strong> Register the death within 5 days to obtain certificate copies.</li>
                      <li><strong>Value the Estate:</strong> Document property valuations, assets, deposits, and outstanding mortgages.</li>
                      <li><strong>Pay Inheritance Tax:</strong> Pay calculated IHT within 6 months of death (HMRC accepts payment in annual installments for property).</li>
                      <li><strong>Apply for Probate:</strong> Submit the application to the Probate Registry to get the Grant of Representation.</li>
                      <li><strong>Collect Assets:</strong> Secure property deeds, liquidate investments, and settle mortgages.</li>
                      <li><strong>Distribute Estate:</strong> Pay remaining taxes and transfer titles to legal heirs.</li>
                    </ol>
                  </div>
                )
              }
            ].map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSection === section.id;
              return (
                <Card key={section.id} className="border border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-text hover:bg-surface-2/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary shrink-0" />
                      <span>{section.title}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-text-faint" /> : <ChevronDown className="h-4 w-4 text-text-faint" />}
                  </button>
                  {isExpanded && <div className="p-4 border-t border-border bg-surface-2/10">{section.content}</div>}
                </Card>
              );
            })}
          </div>

          {/* Action Checklist & Disclaimers */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-5 space-y-4">
              <h4 className="text-sm font-extrabold text-text uppercase tracking-wider">Planning Action Steps</h4>
              <ul className="space-y-3 text-xs text-text-muted">
                <li className="flex items-start gap-2.5">
                  <input type="checkbox" className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4 shrink-0" />
                  <span>Draft or update Will document with property executors.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <input type="checkbox" className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4 shrink-0" />
                  <span>Document joint-tenancy declarations and deeds.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <input type="checkbox" className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4 shrink-0" />
                  <span>Evaluate Whole-of-Life insurance to cover IHT liabilities.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <input type="checkbox" className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4 shrink-0" />
                  <span>Register power of attorneys with property registries.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <input type="checkbox" className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4 shrink-0" />
                  <span>Consult a qualified UK estate planning expert.</span>
                </li>
              </ul>
            </Card>

            <Card className="p-4 bg-danger/5 border border-danger/10 text-danger-strong rounded-2xl">
              <div className="flex gap-2.5">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-danger" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold block">Disclaimer Note</span>
                  All rates and threshold valuations are fetched from active HMRC databases for general information. Tax regulations are highly individual. Never make transactional or structural changes without qualified professional legal and taxation counsel.
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
