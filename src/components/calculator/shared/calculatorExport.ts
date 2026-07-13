import type { BreakdownRow } from "./CalculationBreakdown";

export function exportToCSV(filename: string, title: string, rows: BreakdownRow[]) {
  const csvContent = [
    ["Title", title],
    [],
    ["Label", "Value", "Sub-Value", "Is Total"],
    ...rows.map(r => [
      `"${r.label}"`,
      `"${r.value}"`,
      `"${r.subValue || ""}"`,
      r.isTotal ? "Yes" : "No"
    ])
  ].map(e => e.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
