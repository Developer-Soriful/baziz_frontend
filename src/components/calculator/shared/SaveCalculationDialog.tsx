import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/primitives";
import { Field, Input } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { calculatorService, CalculatorType } from "@/lib/services/calculator.service";

interface Props {
  open: boolean;
  onClose: () => void;
  calculatorType: CalculatorType;
  inputs: any;
  results: any;
  onSaveSuccess?: (savedCalc: any) => void;
}

export function SaveCalculationDialog({
  open,
  onClose,
  calculatorType,
  inputs,
  results,
  onSaveSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const toast = useToast();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      calculatorService.saveCalculation({
        calculatorType,
        name,
        inputs,
        results,
        notes,
      }),
    onSuccess: (data) => {
      toast("Calculation saved successfully!");
      qc.invalidateQueries({ queryKey: ["savedCalculations", calculatorType] });
      if (onSaveSuccess) onSaveSuccess(data);
      onClose();
    },
    onError: () => {
      toast("Failed to save calculation", "error");
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast("Please enter a calculation name", "error");
      return;
    }
    mutation.mutate();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Save Calculation"
      subtitle="Save this configuration to access or compare later"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={mutation.isPending}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Calculation Name / Label">
          <Input
            placeholder="e.g. 12 High Street Deal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={mutation.isPending}
          />
        </Field>
        <Field label="Notes (Optional)">
          <Input
            placeholder="Additional details about this deal..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={mutation.isPending}
          />
        </Field>
      </div>
    </Modal>
  );
}
