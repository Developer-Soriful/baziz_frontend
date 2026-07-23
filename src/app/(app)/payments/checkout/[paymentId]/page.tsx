"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { paymentService } from "@/lib/services/payment.service";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripePaymentForm } from "@/components/payments/StripePaymentForm";
import { ChevronLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const stripePromise = loadStripe(
  "pk_test_51SS1nAR3i1UyIGRriTohUDb5vFmb3VZB3LaXqdzxwki8TwgRsaTyk9MGR2iZ83INVeWSvU8C9xnWtu5LD5gxKjke00RFB9oWLs",
);

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  
  const paymentId = params.paymentId as string;
  const amountStr = searchParams.get("amount");
  const amountLabel = amountStr ? `£${parseFloat(amountStr).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "your balance";

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) return;

    paymentService
      .createPaymentIntent(paymentId)
      .then((data) => {
        if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError("Failed to generate payment intent.");
          toast("Failed to generate payment intent", "error");
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.message || "Stripe initialization failed";
        setError(msg);
        toast(msg, "error");
      });
  }, [paymentId, toast]);

  return (
    <div className="animate-in mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="secondary" onClick={() => router.back()} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
          <p className="text-sm text-text-muted">Complete your secure rent payment</p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-bold border-b border-border pb-4">
          Payment Details
        </h3>
        
        <div className="mb-6 rounded-xl bg-primary/5 p-4 flex justify-between items-center">
          <span className="font-medium">Total Amount Due</span>
          <span className="text-xl font-bold text-primary">{amountLabel}</span>
        </div>

        {error ? (
          <div className="p-6 text-center text-danger bg-danger/10 rounded-xl">
            {error}
            <div className="mt-4 flex justify-center">
              <Button onClick={() => router.back()} variant="secondary">Go Back</Button>
            </div>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm
              clientSecret={clientSecret}
              amountLabel={amountLabel}
              onCancel={() => router.push("/payments")}
              onSuccess={() => {
                qc.invalidateQueries({ queryKey: ["payments-tenant"] });
                qc.invalidateQueries({ queryKey: ["tenant-dashboard"] });
                toast("Payment successful!", "success");
                router.push("/payments?success=true");
              }}
            />
          </Elements>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-text-muted space-y-4">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p>Loading secure checkout...</p>
          </div>
        )}
      </Card>
    </div>
  );
}
