"use client";

/**
 * Tenant Invitation Accept Page
 * Route: /tenant/signup?leaseId=<id>
 *
 * Public page — no authentication required.
 */

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { tenantService } from "@/lib/services/tenant.service";

interface LeasePreview {
  propertyName: string;
  unitNumber: string;
  rentAmount: number;
  securityDeposit: number;
  paymentFrequency: string;
  leaseStartDate: string;
  leaseEndDate: string;
  invitationExpiresAt: string;
  isExpired: boolean;
  tenantEmail: string;
  tenantFullName: string;
  status: string;
}

interface FormState {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

// Password strength checker
const getPasswordStrength = (pw: string) => {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[@$!%*?&]/.test(pw)) score++;
  const map: Record<number, { label: string; color: string }> = {
    0: { label: "Very weak", color: "#ef4444" },
    1: { label: "Weak", color: "#f97316" },
    2: { label: "Fair", color: "#eab308" },
    3: { label: "Good", color: "#22c55e" },
    4: { label: "Strong", color: "#10b981" },
    5: { label: "Very strong", color: "#6366f1" },
  };
  return { score, ...map[score] };
};

function TenantSignupInner() {
  const params = useSearchParams();
  const router = useRouter();
  const leaseId = params.get("leaseId");

  const [lease, setLease] = useState<LeasePreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState<"details" | "success">("details");

  const passwordStrength = getPasswordStrength(form.password);

  useEffect(() => {
    if (!leaseId) {
      setLoadError("Invalid invitation link. Please check your email.");
      setLoading(false);
      return;
    }
    tenantService
      .getLeasePreview(leaseId)
      .then((data) => {
        setLease(data);
        const parts = (data.tenantFullName || "").trim().split(" ");
        setForm((f) => ({
          ...f,
          firstName: parts[0] || "",
          lastName: parts.slice(1).join(" ") || "",
        }));
      })
      .catch((e) => {
        setLoadError(
          e?.response?.data?.message || "Invitation not found or has expired."
        );
      })
      .finally(() => setLoading(false));
  }, [leaseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!form.firstName.trim()) return setSubmitError("First name is required.");
    if (!form.lastName.trim()) return setSubmitError("Last name is required.");
    if (!form.phoneNumber.trim()) return setSubmitError("Phone number is required.");
    if (passwordStrength.score < 5)
      return setSubmitError(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)."
      );
    if (form.password !== form.confirmPassword)
      return setSubmitError("Passwords do not match.");
    if (!form.termsAccepted)
      return setSubmitError("You must accept the terms and conditions.");

    setSubmitting(true);
    try {
      const result = await tenantService.acceptInvitation(leaseId!, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: lease!.tenantEmail,
        password: form.password,
        confirmPassword: form.confirmPassword,
        phoneNumber: form.phoneNumber.trim(),
        termsAccepted: true,
      } as any);

      const session = result?.data?.session || result?.session;
      if (session?.accessToken) {
        localStorage.setItem("accessToken", session.accessToken);
        if (session.refreshToken)
          localStorage.setItem("refreshToken", session.refreshToken);
      }

      setStep("success");
      setTimeout(() => router.push("/home"), 3000);
    } catch (e: any) {
      const errors = e?.response?.data?.errors;
      const msg = e?.response?.data?.message;
      setSubmitError(
        Array.isArray(errors) && errors.length > 0
          ? errors.join(" · ")
          : msg || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .ti-root{min-height:100vh;background:#080812;display:flex;align-items:center;justify-content:center;font-family:'Inter',-apple-system,sans-serif;padding:24px;position:relative;overflow-x:hidden}
        .ti-orb1{position:fixed;top:-180px;left:-180px;width:550px;height:550px;background:radial-gradient(circle,rgba(99,102,241,.2) 0%,transparent 70%);pointer-events:none;animation:orbF 9s ease-in-out infinite alternate}
        .ti-orb2{position:fixed;bottom:-180px;right:-150px;width:480px;height:480px;background:radial-gradient(circle,rgba(16,185,129,.15) 0%,transparent 70%);pointer-events:none;animation:orbF 11s ease-in-out infinite alternate-reverse}
        @keyframes orbF{from{transform:translate(0,0) scale(1)}to{transform:translate(40px,40px) scale(1.12)}}
        .ti-card{width:100%;max-width:500px;background:rgba(15,15,28,.9);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,.07);border-radius:24px;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,.7),0 0 0 1px rgba(99,102,241,.1);position:relative;z-index:1;animation:cardIn .5s cubic-bezier(.16,1,.3,1) both}
        @keyframes cardIn{from{opacity:0;transform:translateY(28px) scale(.97)}to{opacity:1;transform:none}}
        .ti-header{background:linear-gradient(135deg,#312e81 0%,#1e40af 55%,#0369a1 100%);padding:28px 32px 24px;position:relative;overflow:hidden}
        .ti-header::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='.04'%3E%3Ccircle cx='20' cy='20' r='3'/%3E%3C/g%3E%3C/svg%3E")}
        .ti-brand{display:flex;align-items:center;gap:9px;margin-bottom:16px;position:relative;z-index:1}
        .ti-brand-icon{width:32px;height:32px;background:rgba(255,255,255,.15);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px}
        .ti-brand-name{font-size:14px;font-weight:700;color:rgba(255,255,255,.9);letter-spacing:.3px}
        .ti-header-title{font-size:24px;font-weight:800;color:#fff;line-height:1.25;position:relative;z-index:1}
        .ti-header-sub{font-size:13px;color:rgba(255,255,255,.65);margin-top:5px;position:relative;z-index:1}
        .ti-lease{margin:24px 24px 0;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:14px;overflow:hidden}
        .ti-lease-head{background:rgba(255,255,255,.035);padding:12px 16px;font-size:10.5px;font-weight:600;color:rgba(255,255,255,.4);letter-spacing:1.1px;text-transform:uppercase;display:flex;align-items:center;gap:8px}
        .ti-lease-row{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-top:1px solid rgba(255,255,255,.04)}
        .ti-lease-label{font-size:13px;color:rgba(255,255,255,.42);font-weight:400}
        .ti-lease-value{font-size:13px;color:rgba(255,255,255,.85);font-weight:500;text-align:right}
        .ti-lease-value.rent{font-size:15px;font-weight:700;color:#34d399}
        .ti-warn{margin:14px 24px 0;padding:12px 14px;background:rgba(251,191,36,.07);border:1px solid rgba(251,191,36,.18);border-radius:11px;display:flex;align-items:flex-start;gap:9px;font-size:12.5px;color:#fbbf24;line-height:1.5}
        .ti-expired{margin:14px 24px 0;padding:12px 14px;background:rgba(239,68,68,.09);border:1px solid rgba(239,68,68,.22);border-radius:11px;display:flex;align-items:flex-start;gap:9px;font-size:12.5px;color:#f87171;line-height:1.5}
        .ti-form{padding:22px 24px 28px;display:flex;flex-direction:column;gap:14px}
        .ti-row{display:grid;grid-template-columns:1fr 1fr;gap:11px}
        .ti-field{display:flex;flex-direction:column;gap:5px}
        .ti-label{font-size:11px;font-weight:600;color:rgba(255,255,255,.45);letter-spacing:.5px;text-transform:uppercase}
        .ti-input{width:100%;padding:11px 13px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:11px;color:rgba(255,255,255,.9);font-size:13.5px;font-family:inherit;outline:none;transition:border-color .2s,box-shadow .2s}
        .ti-input:focus{border-color:rgba(99,102,241,.6);box-shadow:0 0 0 3px rgba(99,102,241,.11)}
        .ti-input:disabled,.ti-input.ro{opacity:.4;cursor:default}
        .ti-input::placeholder{color:rgba(255,255,255,.22)}
        .ti-input-wrap{position:relative}
        .ti-input-wrap .ti-input{padding-right:40px}
        .ti-eye{position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,.38);font-size:15px;transition:color .15s;padding:0;line-height:1}
        .ti-eye:hover{color:rgba(255,255,255,.7)}
        .ti-pw-bar{height:3px;background:rgba(255,255,255,.06);border-radius:9px;margin-top:6px;overflow:hidden}
        .ti-pw-fill{height:100%;border-radius:9px;transition:width .35s,background .35s}
        .ti-pw-hint{font-size:11px;margin-top:4px;display:flex;align-items:center;gap:5px}
        .ti-divider{display:flex;align-items:center;gap:10px;margin:2px 0}
        .ti-div-line{flex:1;height:1px;background:rgba(255,255,255,.07)}
        .ti-div-text{font-size:11px;color:rgba(255,255,255,.28);font-weight:500}
        .ti-check-wrap{display:flex;align-items:flex-start;gap:10px;padding:4px 0}
        .ti-checkbox{width:17px;height:17px;flex-shrink:0;accent-color:#6366f1;cursor:pointer;margin-top:1px}
        .ti-check-label{font-size:12.5px;color:rgba(255,255,255,.45);line-height:1.55;cursor:pointer}
        .ti-check-label a{color:#818cf8;text-decoration:none}
        .ti-check-label a:hover{text-decoration:underline}
        .ti-error{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:10px;padding:10px 13px;font-size:12.5px;color:#f87171;display:flex;align-items:flex-start;gap:8px;line-height:1.5}
        .ti-btn{width:100%;padding:13px;background:linear-gradient(135deg,#4f46e5 0%,#2563eb 100%);border:none;border-radius:11px;color:#fff;font-size:14.5px;font-weight:600;font-family:inherit;cursor:pointer;transition:opacity .2s,transform .15s,box-shadow .2s;box-shadow:0 4px 20px rgba(79,70,229,.38);position:relative;overflow:hidden;margin-top:2px}
        .ti-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,transparent 0%,rgba(255,255,255,.07) 100%);pointer-events:none}
        .ti-btn:hover:not(:disabled){opacity:.92;transform:translateY(-1px);box-shadow:0 8px 28px rgba(79,70,229,.48)}
        .ti-btn:active:not(:disabled){transform:none}
        .ti-btn:disabled{opacity:.48;cursor:not-allowed;transform:none}
        .ti-spin{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle;margin-right:7px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ti-success{text-align:center;padding:44px 32px 48px}
        .ti-suc-icon{width:76px;height:76px;background:linear-gradient(135deg,#059669 0%,#10b981 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:34px;margin:0 auto 22px;box-shadow:0 12px 40px rgba(16,185,129,.35);animation:pop .5s cubic-bezier(.16,1,.3,1) both}
        @keyframes pop{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}
        .ti-suc-title{font-size:21px;font-weight:800;color:#fff;margin-bottom:9px}
        .ti-suc-sub{font-size:13.5px;color:rgba(255,255,255,.5);line-height:1.6;max-width:300px;margin:0 auto}
        .ti-redirect{margin-top:22px;font-size:11.5px;color:rgba(255,255,255,.28)}
        .ti-skel{background:rgba(255,255,255,.05);border-radius:8px;animation:shim 1.4s ease-in-out infinite}
        @keyframes shim{0%,100%{opacity:.35}50%{opacity:.8}}
        .ti-foot{padding:0 24px 22px;text-align:center;font-size:11.5px;color:rgba(255,255,255,.22)}
        @media(max-width:440px){.ti-row{grid-template-columns:1fr}.ti-card{border-radius:18px}.ti-header{padding:22px 18px}.ti-form{padding:18px 18px 24px}.ti-lease{margin:18px 14px 0}.ti-warn,.ti-expired{margin:12px 14px 0}}
      `}</style>

      <div className="ti-root">
        <div className="ti-orb1" />
        <div className="ti-orb2" />

        <div className="ti-card">
          {/* Header */}
          <div className="ti-header">
            <div className="ti-brand">
              <div className="ti-brand-icon">🏠</div>
              <span className="ti-brand-name">B Aziz Property Management</span>
            </div>
            <div className="ti-header-title">
              {step === "success" ? "Welcome aboard! 🎉" : "Lease Invitation"}
            </div>
            {step !== "success" && (
              <div className="ti-header-sub">
                Set up your tenant account to access your portal
              </div>
            )}
          </div>

          {/* Success */}
          {step === "success" && (
            <div className="ti-success">
              <div className="ti-suc-icon">✓</div>
              <div className="ti-suc-title">Account Created!</div>
              <div className="ti-suc-sub">
                Your tenant account is ready. Redirecting you to your dashboard…
              </div>
              <div className="ti-redirect">Redirecting in a moment…</div>
            </div>
          )}

          {/* Loading */}
          {step === "details" && loading && (
            <div style={{ padding: 24 }}>
              <div className="ti-skel" style={{ height: 145, marginBottom: 14 }} />
              <div className="ti-skel" style={{ height: 50, width: "65%", marginBottom: 12 }} />
              <div className="ti-skel" style={{ height: 44 }} />
            </div>
          )}

          {/* Load error */}
          {step === "details" && !loading && loadError && (
            <div style={{ padding: 24 }}>
              <div className="ti-error" style={{ marginBottom: 20 }}>
                <span>⚠️</span><span>{loadError}</span>
              </div>
              <p style={{ textAlign: "center", color: "rgba(255,255,255,.3)", fontSize: 13 }}>
                Please contact your landlord to resend the invitation.
              </p>
            </div>
          )}

          {/* Main content */}
          {step === "details" && !loading && lease && !loadError && (
            <>
              {/* Lease summary */}
              <div className="ti-lease">
                <div className="ti-lease-head">🏘️ Your Lease Summary</div>
                <div className="ti-lease-row">
                  <span className="ti-lease-label">Property</span>
                  <span className="ti-lease-value">{lease.propertyName}</span>
                </div>
                <div className="ti-lease-row">
                  <span className="ti-lease-label">Unit</span>
                  <span className="ti-lease-value">{lease.unitNumber}</span>
                </div>
                <div className="ti-lease-row">
                  <span className="ti-lease-label">Rent</span>
                  <span className="ti-lease-value rent">
                    {fmtCurrency(lease.rentAmount)}
                    <span style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,.38)", marginLeft: 3 }}>
                      /{lease.paymentFrequency}
                    </span>
                  </span>
                </div>
                <div className="ti-lease-row">
                  <span className="ti-lease-label">Deposit</span>
                  <span className="ti-lease-value">{fmtCurrency(lease.securityDeposit)}</span>
                </div>
                <div className="ti-lease-row">
                  <span className="ti-lease-label">Period</span>
                  <span className="ti-lease-value">
                    {fmt(lease.leaseStartDate)} – {fmt(lease.leaseEndDate)}
                  </span>
                </div>
              </div>

              {/* Expiry / Already Accepted */}
              {lease.status === 'accepted' || lease.status === 'active' ? (
                <div style={{ padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="ti-expired" style={{ margin: 0 }}>
                    <span>✅</span>
                    <span>
                      <strong>Account already created.</strong> This invitation was previously accepted.
                      Your tenant account is ready — just log in to access your portal.
                    </span>
                  </div>
                  <a
                    href="/login"
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "13px",
                      background: "linear-gradient(135deg,#4f46e5 0%,#2563eb 100%)",
                      border: "none",
                      borderRadius: "11px",
                      color: "#fff",
                      fontSize: "14.5px",
                      fontWeight: 600,
                      fontFamily: "inherit",
                      textAlign: "center",
                      textDecoration: "none",
                      boxShadow: "0 4px 20px rgba(79,70,229,.38)",
                      transition: "opacity .2s, transform .15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; (e.currentTarget as HTMLAnchorElement).style.transform = "none"; }}
                  >
                    Go to Login →
                  </a>
                </div>
              ) : lease.isExpired ? (
                <div className="ti-expired">
                  <span>🚫</span>
                  <span>
                    <strong>Invitation expired</strong> on {fmt(lease.invitationExpiresAt)}.
                    Please ask your landlord to resend it.
                  </span>
                </div>
              ) : (
                <div className="ti-warn">
                  <span>⏰</span>
                  <span>
                    Expires <strong>{fmt(lease.invitationExpiresAt)}</strong> — accept before then.
                  </span>
                </div>
              )}

              {/* Form — only show if invitation is still pending */}
              {!lease.isExpired && lease.status === 'pending_acceptance' && (
                <form className="ti-form" onSubmit={handleSubmit}>
                  <div className="ti-divider">
                    <div className="ti-div-line" />
                    <span className="ti-div-text">CREATE YOUR ACCOUNT</span>
                    <div className="ti-div-line" />
                  </div>

                  {/* Name */}
                  <div className="ti-row">
                    <div className="ti-field">
                      <label className="ti-label">First Name</label>
                      <input
                        className="ti-input"
                        placeholder="James"
                        value={form.firstName}
                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                        disabled={submitting}
                        required
                      />
                    </div>
                    <div className="ti-field">
                      <label className="ti-label">Last Name</label>
                      <input
                        className="ti-input"
                        placeholder="Smith"
                        value={form.lastName}
                        onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                        disabled={submitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Email (read-only) */}
                  <div className="ti-field">
                    <label className="ti-label">Email Address</label>
                    <input
                      className="ti-input ro"
                      value={lease.tenantEmail}
                      readOnly
                      tabIndex={-1}
                    />
                  </div>

                  {/* Phone */}
                  <div className="ti-field">
                    <label className="ti-label">Phone Number</label>
                    <input
                      className="ti-input"
                      placeholder="+44 7700 900123"
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                      disabled={submitting}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="ti-field">
                    <label className="ti-label">Password</label>
                    <div className="ti-input-wrap">
                      <input
                        className="ti-input"
                        type={showPass ? "text" : "password"}
                        placeholder="Min 8 chars, uppercase, number, symbol"
                        value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        disabled={submitting}
                        required
                      />
                      <button type="button" className="ti-eye" onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
                        {showPass ? "🙈" : "👁"}
                      </button>
                    </div>
                    {form.password && (
                      <>
                        <div className="ti-pw-bar">
                          <div
                            className="ti-pw-fill"
                            style={{
                              width: `${(passwordStrength.score / 5) * 100}%`,
                              background: passwordStrength.color,
                            }}
                          />
                        </div>
                        <div className="ti-pw-hint" style={{ color: passwordStrength.color }}>
                          <span>●</span>
                          <span>{passwordStrength.label}</span>
                          {passwordStrength.score < 5 && (
                            <span style={{ color: "rgba(255,255,255,.3)", marginLeft: 4 }}>
                              — needs: uppercase, lowercase, number & symbol (@$!%*?&)
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="ti-field">
                    <label className="ti-label">Confirm Password</label>
                    <div className="ti-input-wrap">
                      <input
                        className="ti-input"
                        type={showPass ? "text" : "password"}
                        placeholder="Repeat password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                        disabled={submitting}
                        required
                      />
                      {form.confirmPassword && (
                        <span style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 14,
                        }}>
                          {form.confirmPassword === form.password ? "✅" : "❌"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="ti-check-wrap" htmlFor="terms-cb">
                    <input
                      id="terms-cb"
                      type="checkbox"
                      className="ti-checkbox"
                      checked={form.termsAccepted}
                      onChange={(e) => setForm((f) => ({ ...f, termsAccepted: e.target.checked }))}
                      disabled={submitting}
                    />
                    <span className="ti-check-label">
                      I agree to the <a href="#">Terms of Service</a> and{" "}
                      <a href="#">Privacy Policy</a> of B Aziz Property Management
                    </span>
                  </label>

                  {/* Error */}
                  {submitError && (
                    <div className="ti-error">
                      <span>⚠️</span><span>{submitError}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button type="submit" className="ti-btn" disabled={submitting || !form.termsAccepted}>
                    {submitting ? (
                      <><span className="ti-spin" />Creating account…</>
                    ) : (
                      "Accept Invitation & Create Account →"
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {step !== "success" && (
            <div className="ti-foot">
              🔒 Secure & Encrypted · B Aziz Property Management
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function TenantSignupPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", background: "#080812", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 44, height: 44, border: "3px solid rgba(99,102,241,.3)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        </div>
      }
    >
      <TenantSignupInner />
    </Suspense>
  );
}
