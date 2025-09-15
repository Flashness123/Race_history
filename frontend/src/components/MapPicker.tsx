"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapPicker({
  lat,
  lng,
  onPick,
}: {
  lat: number;
  lng: number;
  onPick: (lat: number, lng: number) => void;
}) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.stadiamaps.com/styles/alidade_smooth.json",
      center: [lng, lat],
      zoom: 6,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    const marker = new maplibregl.Marker({ draggable: true })
      .setLngLat([lng, lat])
      .addTo(map);

    marker.on("dragend", () => {
      const { lng, lat } = marker.getLngLat();
      onPick(lat, lng);
    });

    map.on("click", (e) => {
      marker.setLngLat(e.lngLat);
      onPick(e.lngLat.lat, e.lngLat.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => map.remove();
  }, [mounted]);

  // Update marker if props change
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }
  }, [lat, lng]);

  if (!mounted) {
    return <div className="w-full h-[300px] rounded-lg shadow border bg-gray-100" />;
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <input
          className="border rounded p-2 flex-1"
          placeholder="Search place (OpenStreetMap)"
          onKeyDown={async (e) => {
            // prevent submitting the outer form when pressing Enter
            if (e.key === "Enter") e.preventDefault();
            if (e.key !== "Enter") return;
            const q = (e.target as HTMLInputElement).value.trim();
            if (!q) return;
            const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
            const items = await resp.json();
            if (!Array.isArray(items) || items.length === 0) return;
            const best = items[0];
            const lat = Number(best.lat); const lng = Number(best.lon);
            if (mapRef.current && markerRef.current) {
              mapRef.current.flyTo({ center: [lng, lat], zoom: 10 });
              markerRef.current.setLngLat([lng, lat]);
              onPick(lat, lng);
            }
          }}
        />
        <button
          type="button"
          className="px-3 py-2 border rounded"
          onClick={async (e) => {
            const input = (e.currentTarget.previousSibling as HTMLInputElement) as HTMLInputElement | null;
            const q = input?.value?.trim() || "";
            if (!q) return;
            const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
            const items = await resp.json();
            if (!Array.isArray(items) || items.length === 0) return;
            const best = items[0];
            const lat = Number(best.lat); const lng = Number(best.lon);
            if (mapRef.current && markerRef.current) {
              mapRef.current.flyTo({ center: [lng, lat], zoom: 10 });
              markerRef.current.setLngLat([lng, lat]);
              onPick(lat, lng);
            }
          }}
        >Search</button>
      </div>
      <div ref={mapContainer} className="w-full h-[300px] rounded-lg shadow border" />
    </div>
  );
}
