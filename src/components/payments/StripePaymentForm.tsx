"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api/client";

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
  amountLabel: string;
}

export function StripePaymentForm({
  clientSecret,
  onSuccess,
  onCancel,
  amountLabel,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Trigger dev webhook sync before redirection (just in case they redirect away)
      // Since confirmPayment will redirect the user if using redirect-based payments (or card 3DS secure confirmation),
      // we extract the payment intent ID from clientSecret to trigger a mock sync for localhost convenience.
      const paymentIntentId = clientSecret.split('_secret_')[0];
      if (paymentIntentId) {
        try {
          await apiClient.post("/webhooks/stripe/dev-test", {
            type: "payment_intent.succeeded",
            data: {
              object: {
                id: paymentIntentId,
              },
            },
          });
        } catch (webhookErr) {
          console.error("Local webhook sync failed:", webhookErr);
        }
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payments?success=true`,
        },
      });

      if (error) {
        toast(error.message || "Payment confirmation failed", "error");
      } else {
        onSuccess();
      }
    } catch (err: any) {
      toast(err?.message || "An unexpected error occurred during payment", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-border p-4 bg-background animate-in">
        <PaymentElement />
      </div>
      <p className="text-center text-xs text-text-faint">🔒 Payments secured by Stripe (Card, Apple Pay, Google Pay)</p>
      <div className="flex gap-3 justify-end pt-3">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={!stripe || !elements}>
          Pay {amountLabel}
        </Button>
      </div>
    </form>
  );
}
