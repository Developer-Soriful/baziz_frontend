"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Building2, Home } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";
import { Button } from "@/components/ui/primitives";
import { Field, Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("tenant");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Please enter your name.");
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(password)) {
      return setError("Password must be at least 8 characters with uppercase, lowercase, number, and special character.");
    }
    setLoading(true);
    const err = await signup(name, email, password, role);
    if (err) { setError(err); setLoading(false); }
    else router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="animate-in">
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-black text-white">P</span>
        <span className="text-lg font-extrabold">Propertera</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-text-muted">Join Propertera in less than a minute.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-text-muted">I am a…</span>
          <div className="grid grid-cols-2 gap-2.5">
            {([{ role: "tenant", icon: Home, label: "Tenant", desc: "I rent a home" }, { role: "landlord", icon: Building2, label: "Landlord", desc: "I own property" }] as const).map((r) => (
              <button type="button" key={r.role} onClick={() => setRole(r.role)} className={cn("rounded-xl border-2 p-3 text-left transition", role === r.role ? "border-primary bg-primary/5" : "border-border hover:border-border-strong")}>
                <r.icon className={cn("h-5 w-5", role === r.role ? "text-primary" : "text-text-faint")} />
                <p className="mt-1.5 text-sm font-bold">{r.label}</p>
                <p className="text-[11px] text-text-muted">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} icon={<User className="h-4 w-4" />} placeholder="Jane Doe" required /></Field>
        <Field label="Email address"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="h-4 w-4" />} placeholder="you@example.com" required /></Field>
        <Field label="Password"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="h-4 w-4" />} placeholder="Strong password required" required /></Field>
        {error && <div className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm font-medium text-danger">{error}</div>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>Create account <ArrowRight className="h-4 w-4" /></Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-muted">Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link></p>
    </div>
  );
}
