"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[260px] w-full items-center justify-center rounded-xl border border-border bg-[var(--color-surface-2)]">
      <p className="text-sm text-text-muted">Loading map...</p>
    </div>
  ),
});

export function MapPanel({
  pins,
}: {
  pins: { name: string; lat: number; lng: number; status: string }[];
}) {
  return <LeafletMap pins={pins} />;
}
