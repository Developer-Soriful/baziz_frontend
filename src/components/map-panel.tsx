"use client";

import { MapPin } from "lucide-react";

// Lightweight stylised map (no external tiles) — plots pins on a UK-ish grid.
export function MapPanel({
  pins,
}: {
  pins: { name: string; lat: number; lng: number; status: string }[];
}) {
  // Normalise lat/lng to 0..100 within a rough UK bounding box
  const latMin = 50,
    latMax = 55.5,
    lngMin = -3.5,
    lngMax = 0.5;
  const pos = (lat: number, lng: number) => ({
    top: `${(1 - (lat - latMin) / (latMax - latMin)) * 100}%`,
    left: `${((lng - lngMin) / (lngMax - lngMin)) * 100}%`,
  });

  return (
    <div className="relative h-full min-h-[260px] w-full overflow-hidden rounded-xl border border-border bg-[var(--color-surface-2)]">
      {/* grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 300px at 60% 30%, rgba(0,133,119,0.12), transparent)",
        }}
      />
      {pins.map((p) => {
        const { top, left } = pos(p.lat, p.lng);
        const color = p.status === "Vacant" ? "#f59e0b" : "#008577";
        return (
          <div key={p.name} className="group absolute -translate-x-1/2 -translate-y-full" style={{ top, left }}>
            <div className="relative flex flex-col items-center">
              <span className="mb-1 whitespace-nowrap rounded-lg bg-surface px-2 py-1 text-[11px] font-bold shadow-card opacity-0 transition group-hover:opacity-100">
                {p.name}
              </span>
              <MapPin className="h-6 w-6 drop-shadow" style={{ color }} fill={color} fillOpacity={0.25} />
              <span className="absolute -bottom-1 h-2 w-2 animate-ping rounded-full" style={{ background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
