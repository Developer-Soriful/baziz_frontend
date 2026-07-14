import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { calculatorService, SavedCalculation } from "@/lib/services/calculator.service";
import { Copy, Check, Link, ShieldAlert } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  calculation: SavedCalculation | null;
}

export function ShareCalculationDialog({ open, onClose, calculation }: Props) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const qc = useQueryClient();

  const shareMutation = useMutation({
    mutationFn: () => {
      if (!calculation) throw new Error("No calculation selected");
      return calculatorService.enableSharing(calculation._id);
    },
    onSuccess: (data) => {
      toast("Sharing enabled successfully!");
      qc.invalidateQueries({ queryKey: ["savedCalculations"] });
      // Update our local query state if needed
    },
    onError: () => {
      toast("Failed to enable sharing", "error");
    },
  });

  const disableMutation = useMutation({
    mutationFn: () => {
      if (!calculation) throw new Error("No calculation selected");
      return calculatorService.disableSharing(calculation._id);
    },
    onSuccess: () => {
      toast("Sharing disabled");
      qc.invalidateQueries({ queryKey: ["savedCalculations"] });
    },
    onError: () => {
      toast("Failed to disable sharing", "error");
    },
  });

  const getShareUrl = () => {
    if (!calculation || !calculation.shareToken) return "";
    return `${window.location.origin}/shared/calc/${calculation.shareToken}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    toast("Link copied to clipboard!");
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!calculation) return null;

  const isShared = calculation.isShared && calculation.shareToken;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share Calculation"
      subtitle="Generate a public read-only link to share with clients or lenders"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-5">
        {!isShared ? (
          <div className="rounded-xl border border-border p-4 text-center space-y-3">
            <ShieldAlert className="mx-auto h-8 w-8 text-text-faint" />
            <p className="text-sm text-text-muted">
              Sharing is currently disabled for this calculation.
            </p>
            <Button
              variant="primary"
              onClick={() => shareMutation.mutate()}
              loading={shareMutation.isPending}
            >
              Generate Shareable Link
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl border border-border p-2 bg-surface-2">
              <Link className="h-4 w-4 text-text-muted flex-shrink-0 ml-2" />
              <input
                type="text"
                readOnly
                value={getShareUrl()}
                className="w-full bg-transparent text-sm focus:outline-none select-all px-2"
              />
              <Button
                variant="primary"
                onClick={copyToClipboard}
                size="sm"
                className="flex-shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <p className="text-xs text-text-muted">
              Anyone with this link will be able to view this calculation in read-only mode.
            </p>
            <div className="flex justify-end pt-2 border-t border-border">
              <Button
                variant="danger"
                size="sm"
                onClick={() => disableMutation.mutate()}
                loading={disableMutation.isPending}
              >
                Disable Public Sharing
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
