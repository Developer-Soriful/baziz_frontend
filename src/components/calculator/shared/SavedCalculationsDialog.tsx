import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calculatorService, CalculatorType, SavedCalculation } from "@/lib/services/calculator.service";
import { Trash2, FolderOpen, Calendar } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  calculatorType: CalculatorType;
  onSelectCalculation: (calc: SavedCalculation) => void;
}

export function SavedCalculationsDialog({
  open,
  onClose,
  calculatorType,
  onSelectCalculation,
}: Props) {
  const toast = useToast();
  const qc = useQueryClient();

  const { data: calculations = [], isLoading } = useQuery({
    queryKey: ["savedCalculations", calculatorType],
    queryFn: () => calculatorService.getSavedCalculations(calculatorType),
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => calculatorService.deleteCalculation(id),
    onSuccess: () => {
      toast("Calculation deleted successfully!");
      qc.invalidateQueries({ queryKey: ["savedCalculations", calculatorType] });
    },
    onError: () => {
      toast("Failed to delete calculation", "error");
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Saved Calculations"
      subtitle={`Load a previously saved ${calculatorType} calculation`}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-6 text-center text-text-muted text-sm">Loading calculations...</div>
        ) : calculations.length === 0 ? (
          <div className="py-6 text-center text-text-muted text-sm">
            No saved calculations found for this calculator.
          </div>
        ) : (
          <div className="divide-y divide-border max-h-[60vh] overflow-y-auto pr-1">
            {calculations.map((calc) => (
              <div
                key={calc._id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex-1 mr-4">
                  <h4 className="font-bold text-sm text-text">{calc.name}</h4>
                  {calc.notes && <p className="text-xs text-text-muted mt-0.5">{calc.notes}</p>}
                  <div className="flex items-center gap-1 text-[11px] text-text-faint mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>Saved on {formatDate(calc.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onSelectCalculation(calc);
                      onClose();
                    }}
                  >
                    <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
                    Load
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this calculation?")) {
                        deleteMutation.mutate(calc._id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
