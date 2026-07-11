"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Building2, Home } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";
import { Button } from "@/components/ui/primitives";
import { Field, Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await login(email, password);
    if (err) { setError(err); setLoading(false); }
    else router.push("/home");
  };

  return (
    <div className="animate-in">
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-black text-white">P</span>
        <span className="text-lg font-extrabold">Propertera</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-text-muted">Sign in to manage your property world.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Email address"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="h-4 w-4" />} placeholder="you@example.com" required /></Field>
        <Field label="Password">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"><Lock className="h-4 w-4" /></span>
            <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input-base px-10" placeholder="••••••••" required />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
        </Field>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-text-muted"><input type="checkbox" className="h-4 w-4 rounded border-border-strong accent-primary" defaultChecked /> Remember me</label>
          <Link href="/forgot-password" className="font-semibold text-primary hover:underline">Forgot password?</Link>
        </div>
        {error && <div className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm font-medium text-danger">{error}</div>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>Sign in <ArrowRight className="h-4 w-4" /></Button>
      </form>


      <p className="mt-8 text-center text-sm text-text-muted">Don&apos;t have an account? <Link href="/signup" className="font-semibold text-primary hover:underline">Sign up</Link></p>
    </div>
  );
}
