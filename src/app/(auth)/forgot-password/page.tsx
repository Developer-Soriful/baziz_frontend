"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { Field, Input } from "@/components/ui/form";

type Step = "email" | "otp" | "reset" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const advance = (next: Step, guard?: () => string | null) => (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const g = guard?.();
    if (g) return setError(g);
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(next); }, 600);
  };

  return (
    <div className="animate-in">
      <Link href="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>

      {step === "email" && (
        <>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary"><KeyRound className="h-6 w-6" /></div>
          <h1 className="text-3xl font-extrabold tracking-tight">Reset your password</h1>
          <p className="mt-2 text-sm text-text-muted">Enter your email and we&apos;ll send a 6-digit code.</p>
          <form onSubmit={advance("otp", () => (!email.includes("@") ? "Enter a valid email address." : null))} className="mt-8 space-y-4">
            <Field label="Email address"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="h-4 w-4" />} placeholder="you@example.com" required /></Field>
            {error && <p className="text-sm font-medium text-danger">{error}</p>}
            <Button type="submit" size="lg" className="w-full" loading={loading}>Send verification code</Button>
          </form>
        </>
      )}
      {step === "otp" && (
        <>
          <h1 className="text-3xl font-extrabold tracking-tight">Enter the code</h1>
          <p className="mt-2 text-sm text-text-muted">Sent to <span className="font-semibold text-text">{email}</span>. <span className="text-xs">(Demo: <b>123456</b>)</span></p>
          <form onSubmit={advance("reset", () => (otp.trim() !== "123456" ? "Invalid verification code." : null))} className="mt-8 space-y-4">
            <Field label="Verification code"><Input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="text-center text-2xl font-bold tracking-[0.5em]" placeholder="123456" required /></Field>
            {error && <p className="text-sm font-medium text-danger">{error}</p>}
            <Button type="submit" size="lg" className="w-full" loading={loading}>Verify code</Button>
          </form>
        </>
      )}
      {step === "reset" && (
        <>
          <h1 className="text-3xl font-extrabold tracking-tight">Set a new password</h1>
          <form onSubmit={advance("done", () => { if (password.length < 6) return "Password must be at least 6 characters."; if (password !== confirm) return "Passwords do not match."; return null; })} className="mt-8 space-y-4">
            <Field label="New password"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /></Field>
            <Field label="Confirm password"><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required /></Field>
            {error && <p className="text-sm font-medium text-danger">{error}</p>}
            <Button type="submit" size="lg" className="w-full" loading={loading}>Update password</Button>
          </form>
        </>
      )}
      {step === "done" && (
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/12 text-success"><CheckCircle2 className="h-9 w-9" /></div>
          <h1 className="text-3xl font-extrabold tracking-tight">Password updated</h1>
          <p className="mt-2 text-sm text-text-muted">You can now sign in with your new password.</p>
          <Link href="/login" className="mt-8 block"><Button size="lg" className="w-full">Back to sign in</Button></Link>
        </div>
      )}
    </div>
  );
}
