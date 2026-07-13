"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";
import { authService } from "@/lib/services/auth.service";
import { Button } from "@/components/ui/primitives";
import { Field, Input } from "@/components/ui/form";
import { clearAccessToken } from "@/lib/auth-storage";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const isResent = searchParams.get("resent") === "true";
  
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(isResent ? "A new OTP has been sent to your email." : null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Clear any unverified tokens from signup just in case, forcing a fresh login after verification
    clearAccessToken();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!otp || otp.length !== 6) return setError("Please enter the 6-digit OTP.");
    
    setLoading(true);
    try {
       await authService.verifyEmail({ email, otp });
       setSuccess("Email verified successfully! Redirecting to login...");
       setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
       setError(err?.message || "Failed to verify email.");
    } finally {
       setLoading(false);
    }
  };

  const resend = async () => {
    if (!email) return setError("Please enter your email to resend OTP.");
    setError(null);
    setSuccess(null);
    setResending(true);
    try {
       await authService.resendOtp({ email });
       setSuccess("A new OTP has been sent to your email.");
    } catch (err: any) {
       setError(err?.message || "Failed to resend OTP.");
    } finally {
       setResending(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-black text-white">
          P
        </span>
        <span className="text-lg font-extrabold">Propertera</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight">Verify your email</h1>
      <p className="mt-2 text-sm text-text-muted">
        We sent a 6-digit code to your email address. Enter it below to verify your account.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Email address">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-4 w-4" />}
            placeholder="you@example.com"
            required
            disabled={!!emailParam}
          />
        </Field>
        
        <Field label="Verification Code (OTP)">
          <Input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            icon={<CheckCircle className="h-4 w-4" />}
            placeholder="123456"
            maxLength={6}
            required
          />
        </Field>

        {error && (
          <div className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm font-medium text-danger">
            {error}
          </div>
        )}
        
        {success && (
          <div className="rounded-xl bg-success/10 px-3.5 py-2.5 text-sm font-medium text-success">
            {success}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Verify Email <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-muted">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="font-semibold text-primary hover:underline disabled:opacity-50"
        >
          {resending ? "Resending..." : "Resend OTP"}
        </button>
      </p>
      
      <p className="mt-4 text-center text-sm text-text-muted">
        <Link href="/login" className="font-semibold text-primary hover:underline">Back to Login</Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
