"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icons in Leaflet with Webpack/Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function LeafletMap({
  pins,
}: {
  pins: { name: string; lat: number; lng: number; status: string }[];
}) {
  useEffect(() => {
    // Leaflet needs to run on client only
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  // Default center if no pins, or center on first pin
  const center: [number, number] = pins.length > 0 ? [pins[0].lat, pins[0].lng] : [51.505, -0.09];

  return (
    <div className="h-full min-h-[260px] w-full overflow-hidden rounded-xl border border-border">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", minHeight: "260px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((p) => (
          <Marker key={p.name} position={[p.lat, p.lng]} icon={customIcon}>
            <Popup>
              <strong>{p.name}</strong>
              <br />
              Status: {p.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
