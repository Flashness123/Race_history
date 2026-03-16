"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  DEFAULT_MAP_CENTER,
  MAP_STYLE_URL,
  PICKER_MAP_ZOOM,
} from "@/lib/map-config";

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
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const onPickRef = useRef(onPick);
  const mapReadyRef = useRef(false);
  const skipNextCenterSyncRef = useRef(false);
  const initialCoordinatesRef = useRef(DEFAULT_MAP_CENTER);
  const capturedInitialCoordinatesRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const resolvedLat = Number.isFinite(lat) ? lat : DEFAULT_MAP_CENTER.lat;
  const resolvedLng = Number.isFinite(lng) ? lng : DEFAULT_MAP_CENTER.lng;

  if (mounted && !capturedInitialCoordinatesRef.current) {
    initialCoordinatesRef.current = {
      lat: resolvedLat,
      lng: resolvedLng,
    };
    capturedInitialCoordinatesRef.current = true;
  }

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE_URL,
      center: [
        initialCoordinatesRef.current.lng,
        initialCoordinatesRef.current.lat,
      ],
      zoom: PICKER_MAP_ZOOM,
    });

    const handleResize = () => {
      map.resize();
    };

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    const marker = new maplibregl.Marker({ draggable: true })
      .setLngLat([
        initialCoordinatesRef.current.lng,
        initialCoordinatesRef.current.lat,
      ])
      .addTo(map);

    marker.on("dragend", () => {
      const { lng, lat } = marker.getLngLat();
      skipNextCenterSyncRef.current = true;
      onPickRef.current(lat, lng);
    });

    map.on("click", (e) => {
      marker.setLngLat(e.lngLat);
      skipNextCenterSyncRef.current = true;
      onPickRef.current(e.lngLat.lat, e.lngLat.lng);
    });

    map.on("load", () => {
      mapReadyRef.current = true;
      setMapReady(true);
      setMapError(null);
      requestAnimationFrame(handleResize);
      window.setTimeout(handleResize, 150);
    });

    map.on("error", (event) => {
      console.error("Map picker failed to load", event.error);
      if (!mapReadyRef.current) {
        setMapError(
          "The basemap could not be loaded. You can still search or type coordinates, but the map tiles are unavailable right now."
        );
      }
    });

    window.addEventListener("resize", handleResize);

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      window.removeEventListener("resize", handleResize);
      mapReadyRef.current = false;
      setMapReady(false);
      marker.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [mounted]);

  // Update marker if props change
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLngLat([resolvedLng, resolvedLat]);
    }

    if (mapRef.current && mapReadyRef.current) {
      if (skipNextCenterSyncRef.current) {
        skipNextCenterSyncRef.current = false;
        return;
      }

      const center = mapRef.current.getCenter();
      const sameCenter =
        Math.abs(center.lat - resolvedLat) < 0.000001 &&
        Math.abs(center.lng - resolvedLng) < 0.000001;

      if (!sameCenter) {
        mapRef.current.easeTo({
          center: [resolvedLng, resolvedLat],
          duration: 500,
          essential: true,
        });
      }
    }
  }, [resolvedLat, resolvedLng]);

  async function searchLocation() {
    const q = searchInputRef.current?.value.trim() || "";
    if (!q) return;

    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`
    );
    const items = await resp.json();
    if (!Array.isArray(items) || items.length === 0) return;

    const best = items[0];
    const nextLat = Number(best.lat);
    const nextLng = Number(best.lon);

    if (mapRef.current && markerRef.current) {
      mapRef.current.flyTo({ center: [nextLng, nextLat], zoom: 10 });
      markerRef.current.setLngLat([nextLng, nextLat]);
      skipNextCenterSyncRef.current = true;
      onPickRef.current(nextLat, nextLng);
    }
  }

  if (!mounted) {
    return <div className="w-full h-[300px] rounded-lg shadow border bg-gray-100" />;
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <input
          ref={searchInputRef}
          className="border rounded p-2 flex-1"
          placeholder="Search place (OpenStreetMap)"
          onKeyDown={async (e) => {
            // prevent submitting the outer form when pressing Enter
            if (e.key === "Enter") e.preventDefault();
            if (e.key !== "Enter") return;
            await searchLocation();
          }}
        />
        <button
          type="button"
          className="px-3 py-2 border rounded"
          onClick={searchLocation}
        >
          Search
        </button>
      </div>
      {mapError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {mapError}
        </div>
      )}
      <div className="relative">
        <div
          ref={mapContainer}
          className="w-full h-[300px] rounded-lg shadow border bg-gray-100"
        />
        {!mapReady && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 text-sm font-medium text-gray-600 backdrop-blur-sm">
            Loading map...
          </div>
        )}
      </div>
    </div>
  );
}
