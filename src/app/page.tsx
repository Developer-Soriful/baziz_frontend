"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2, Home, Wallet, Wrench, FileText, MessageSquare, ShieldCheck, BarChart3,
  ArrowRight, Check, Star, Menu, X, Sparkles, Zap, TrendingUp, Users, ChevronDown, Quote,
} from "lucide-react";

const features = [
  { icon: Wallet, title: "Payments & Rent", desc: "Collect rent, automate reminders and reconcile every payment in seconds." },
  { icon: Wrench, title: "Maintenance", desc: "Log, schedule and resolve issues with your trusted contractors." },
  { icon: FileText, title: "Documents Vault", desc: "Store leases & certificates securely and share with tenants instantly." },
  { icon: MessageSquare, title: "Messaging + AI", desc: "Chat with tenants and teams, plus an AI assistant for property questions." },
  { icon: BarChart3, title: "Analytics & ROI", desc: "Live yields, occupancy and calculators to grow your portfolio." },
  { icon: ShieldCheck, title: "Bank-grade security", desc: "Role-based access and encryption keep everyone's data safe." },
];

const faqs = [
  { q: "Is Propertera free to start?", a: "Yes. The Free plan covers up to 3 properties with the core tools. Upgrade to Pro anytime for unlimited properties and advanced features." },
  { q: "Can tenants use Propertera too?", a: "Absolutely. Tenants get their own portal to pay rent, report maintenance, view documents and message their landlord — on web and mobile." },
  { q: "Do you support UK tax & compliance?", a: "Yes. Stamp duty, ROI and development calculators are built in, along with EPC and safety-certificate tracking." },
  { q: "Is my data secure?", a: "We use industry-standard AES-256 encryption at rest and SSL in transit, with strict role-based access control across every account." },
];

export default function Landing() {
  const [menu, setMenu] = useState(false);
  const [faq, setFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-base font-black text-white shadow-[var(--shadow-glow)]">P</span>
            <span className="text-lg font-extrabold tracking-tight">Propertera</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-text-muted md:flex">
            <a href="#features" className="transition hover:text-text">Features</a>
            <a href="#how" className="transition hover:text-text">How it works</a>
            <a href="#pricing" className="transition hover:text-text">Pricing</a>
            <a href="#faq" className="transition hover:text-text">FAQ</a>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-text-muted transition hover:bg-surface-2 hover:text-text">Sign in</Link>
            <Link href="/signup" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-[var(--shadow-glow)] transition hover:bg-primary-600">Get started free</Link>
          </div>
          <button className="rounded-lg p-2 md:hidden" onClick={() => setMenu((v) => !v)} aria-label="Menu">{menu ? <X /> : <Menu />}</button>
        </div>
        {menu && (
          <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
            <div className="flex flex-col gap-1 text-sm font-semibold">
              {[["Features", "#features"], ["How it works", "#how"], ["Pricing", "#pricing"], ["FAQ", "#faq"]].map(([l, h]) => <a key={h} href={h} onClick={() => setMenu(false)} className="rounded-lg px-2 py-2.5 hover:bg-surface-2">{l}</a>)}
              <Link href="/login" className="rounded-lg px-2 py-2.5 hover:bg-surface-2">Sign in</Link>
              <Link href="/signup" className="mt-1 rounded-xl bg-primary px-4 py-2.5 text-center text-white">Get started free</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-grid absolute inset-0 opacity-[0.35]" />
        <div className="absolute inset-x-0 top-0 h-[520px]" style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(0,133,119,0.16), transparent 70%)" }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-text-muted shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Now with AI portfolio insights
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Property management that <span className="text-primary">just works</span> — for everyone.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-text-muted lg:mx-0">
              One elegant platform for landlords and tenants: rent, maintenance, documents, messaging and analytics — on web and mobile.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link href="/signup" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-white shadow-[var(--shadow-glow)] transition hover:bg-primary-600 sm:w-auto">Start free <ArrowRight className="h-5 w-5" /></Link>
              <Link href="/login" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-6 py-3.5 text-base font-bold transition hover:border-primary sm:w-auto">Live demo</Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-text-muted lg:justify-start">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> No card required</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Free forever plan</span>
            </div>
          </div>

          {/* Product mockup */}
          <div className="relative">
            <div className="animate-float rounded-2xl border border-border bg-surface p-4 shadow-float">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-black text-white">P</span><span className="text-sm font-bold">Portfolio</span></div>
                <span className="rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-bold text-success">+9.0% MRR</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[{ l: "Rent Collected", v: "£48,300", c: "#008577" }, { l: "Occupancy", v: "92%", c: "#10b981" }, { l: "Active Tenants", v: "104", c: "#007aff" }, { l: "Open Tickets", v: "6", c: "#f59e0b" }].map((s) => (
                  <div key={s.l} className="rounded-xl border border-border p-3">
                    <div className="h-7 w-7 rounded-lg" style={{ background: `${s.c}22` }} />
                    <p className="mt-2 text-[11px] text-text-muted">{s.l}</p>
                    <p className="text-lg font-extrabold">{s.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 rounded-xl border border-border p-3">
                <div className="mb-2 flex items-center justify-between text-[11px]"><span className="font-semibold text-text-muted">Revenue</span><span className="font-bold text-primary">6 mo</span></div>
                <div className="flex h-16 items-end gap-1.5">
                  {[42, 55, 48, 68, 60, 82].map((h, i) => <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-primary" style={{ height: `${h}%` }} />)}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden animate-float rounded-2xl border border-border bg-surface p-3 shadow-float sm:block" style={{ animationDelay: "1.5s" }}>
              <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-success/12 text-success"><Wallet className="h-4 w-4" /></span><div><p className="text-xs font-bold">Rent received</p><p className="text-[11px] text-text-muted">Alice · £1,850</p></div></div>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="relative mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-text-faint">Trusted by modern landlords & agencies</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {["Anderson Lettings", "Shah Properties", "King Estates", "Build MCR", "Foster Rentals"].map((n) => (
              <span key={n} className="flex items-center gap-1.5 text-sm font-bold text-text-muted"><Building2 className="h-4 w-4" /> {n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border bg-surface p-6 sm:p-8 lg:grid-cols-4">
          {[{ v: "12k+", l: "Properties managed", i: Building2 }, { v: "£30M+", l: "Rent processed", i: Wallet }, { v: "8k+", l: "Happy tenants", i: Users }, { v: "99.9%", l: "Uptime", i: Zap }].map((s) => (
            <div key={s.l} className="text-center">
              <s.i className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-3xl font-extrabold tracking-tight">{s.v}</p>
              <p className="text-sm text-text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Built for both sides</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">One platform, two experiences</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {[
            { icon: Building2, tag: "For Landlords", title: "Run your portfolio like a pro", points: ["Unlimited properties & tenants", "Automated rent tracking & reports", "Maintenance, inspections & projects", "Marketplace & joint ventures"], color: "#008577", img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" },
            { icon: Home, tag: "For Tenants", title: "Everything about your home", points: ["Pay rent & view full history", "Report & track maintenance", "Access your lease & documents", "Message your landlord instantly"], color: "#7c3aed", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800" },
          ].map((r) => (
            <div key={r.tag} className="card group overflow-hidden">
              <div className="relative h-44 overflow-hidden">
                <img src={r.img} alt={r.tag} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${r.color}dd, transparent)` }} />
                <div className="absolute bottom-4 left-5 flex items-center gap-2 text-white"><r.icon className="h-5 w-5" /><span className="text-sm font-bold uppercase tracking-wide">{r.tag}</span></div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-extrabold">{r.title}</h3>
                <ul className="mt-4 space-y-2.5">{r.points.map((p) => <li key={p} className="flex items-center gap-2.5 text-sm font-medium"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success"><Check className="h-3 w-3" /></span>{p}</li>)}</ul>
                <Link href="/signup" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-2.5 transition-all">Get started <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y border-border bg-surface/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Features</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Everything you need, nothing you don&apos;t</h2>
            <p className="mt-3 text-text-muted">Replace the spreadsheets, the paperwork and the guesswork with one calm, capable platform.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card p-6 transition hover:-translate-y-1 hover:shadow-float">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><f.icon className="h-5 w-5" /></span>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Up and running in three steps</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", title: "Create your account", desc: "Sign up as a landlord or tenant in under a minute — no card required." },
            { n: "02", title: "Add your world", desc: "Landlords add properties & tenants; tenants connect to their home." },
            { n: "03", title: "Manage everything", desc: "Payments, maintenance, documents and messaging — all in one place." },
          ].map((s, i) => (
            <div key={s.n} className="relative rounded-2xl border border-border bg-surface p-6">
              <span className="text-4xl font-black text-primary/15">{s.n}</span>
              <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-text-muted">{s.desc}</p>
              {i < 2 && <ArrowRight className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-border-strong md:block" />}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border bg-surface/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Loved by users</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Don&apos;t just take our word for it</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { name: "Sarah Mitchell", role: "Portfolio Landlord", quote: "Propertera replaced three tools I was juggling. Rent collection has never been smoother.", color: "#7c3aed" },
              { name: "James Carter", role: "Property Investor", quote: "The ROI calculators and marketplace helped me close two joint ventures this year.", color: "#0ea5e9" },
              { name: "Alice Johnson", role: "Tenant", quote: "Paying rent, reporting issues and finding my lease — all from my phone. Brilliant.", color: "#f59e0b" },
            ].map((t) => (
              <div key={t.name} className="card p-6">
                <Quote className="h-7 w-7 text-primary/20" />
                <p className="mt-3 text-sm leading-relaxed">{t.quote}</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white" style={{ background: t.color }}>{t.name[0]}</span>
                  <div><p className="text-sm font-bold">{t.name}</p><p className="text-xs text-text-muted">{t.role}</p></div>
                  <div className="ml-auto flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber text-amber" />)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Pricing</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { name: "Free", price: "£0", period: "/mo", tagline: "For getting started", features: ["Up to 3 properties", "Basic reports", "Tenant portal", "Community support"], cta: "Start free", highlight: false },
            { name: "Pro", price: "£19.99", period: "/mo", tagline: "For growing portfolios", features: ["Unlimited properties", "Advanced AI insights", "Tax & financial reports", "Marketplace & JV access", "Priority support"], cta: "Go Pro", highlight: true },
            { name: "Enterprise", price: "£79.99", period: "/mo", tagline: "For agencies & scale", features: ["Everything in Pro", "Team & role management", "Dedicated manager", "Custom integrations"], cta: "Contact sales", highlight: false },
          ].map((p) => (
            <div key={p.name} className={`card relative flex flex-col p-7 ${p.highlight ? "ring-2 ring-primary" : ""}`}>
              {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">Most popular</span>}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className="text-xs text-text-muted">{p.tagline}</p>
              <p className="mt-3"><span className="text-4xl font-extrabold">{p.price}</span><span className="text-text-muted">{p.period}</span></p>
              <ul className="mt-6 flex-1 space-y-2.5">{p.features.map((f) => <li key={f} className="flex items-center gap-2.5 text-sm"><Check className="h-4 w-4 text-success" />{f}</li>)}</ul>
              <Link href="/signup" className={`mt-7 block rounded-xl py-3 text-center text-sm font-bold transition ${p.highlight ? "bg-primary text-white shadow-[var(--shadow-glow)] hover:bg-primary-600" : "border border-border-strong hover:border-primary"}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">FAQ</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Questions, answered</h2>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="card overflow-hidden">
              <button onClick={() => setFaq(faq === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                <span className="font-bold">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-text-muted transition-transform ${faq === i ? "rotate-180" : ""}`} />
              </button>
              {faq === i && <p className="px-5 pb-5 text-sm leading-relaxed text-text-muted">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#06110f] px-8 py-16 text-center text-white">
          <div className="absolute inset-0" style={{ background: "radial-gradient(600px 300px at 50% 0%, rgba(0,133,119,0.5), transparent)" }} />
          <div className="relative">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to simplify property?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">Join thousands of landlords and tenants managing their world with Propertera — free to start.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-white shadow-[var(--shadow-glow)] transition hover:bg-primary-600">Get started free <ArrowRight className="h-5 w-5" /></Link>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-base font-bold text-white transition hover:bg-white/10">View demo</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-white">P</span><span className="font-extrabold">Propertera</span></div>
              <p className="mt-3 max-w-xs text-sm text-text-muted">The complete platform to manage property, together.</p>
            </div>
            {[
              { h: "Product", links: ["Features", "Pricing", "Marketplace", "Mobile app"] },
              { h: "Company", links: ["About", "Careers", "Blog", "Contact"] },
              { h: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
            ].map((col) => (
              <div key={col.h}>
                <p className="text-sm font-bold">{col.h}</p>
                <ul className="mt-3 space-y-2 text-sm text-text-muted">{col.links.map((l) => <li key={l}><a href="#" className="transition hover:text-text">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
            <p className="text-sm text-text-muted">© 2026 Propertera. All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-sm text-text-muted"><TrendingUp className="h-4 w-4 text-primary" /> Built for modern property management</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
