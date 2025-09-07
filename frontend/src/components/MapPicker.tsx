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

  return <div ref={mapContainer} className="w-full h-[300px] rounded-lg shadow border" />;
}
