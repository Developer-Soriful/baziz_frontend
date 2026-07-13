import React from "react";
import { Button } from "@/components/ui/primitives";
import { Save, Share, Download } from "lucide-react";

interface Props {
  onSave: () => void;
  onShare: () => void;
  onExport: () => void;
  isSaving?: boolean;
}

export function CalculatorActions({ onSave, onShare, onExport, isSaving }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-4 border-b border-border mb-5">
      <Button variant="primary" onClick={onSave} disabled={isSaving}>
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? "Saving..." : "Save Calculation"}
      </Button>
      <Button variant="outline" onClick={onShare}>
        <Share className="mr-2 h-4 w-4" />
        Share
      </Button>
      <Button variant="outline" onClick={onExport}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
}
