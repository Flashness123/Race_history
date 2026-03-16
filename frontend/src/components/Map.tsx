"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE_URL } from "@/lib/map-config";
import {
  CategoryFilters,
  DateFilterMode,
  getFilteredGeojson,
} from "@/lib/event-filters";

export default function Map({
  geojson,
  onSelect,
  filters,
  dateFilter = "all",
}: {
  geojson: any;
  onSelect?: (id: number | null) => void;
  filters?: CategoryFilters;
  dateFilter?: DateFilterMode;
}) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current!,
      style: MAP_STYLE_URL,
      center: [14.42076, 50.08804], // default Prague
      zoom: 5,
    });

    mapRef.current = map;

    // ✅ Zoom buttons
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      const filtered = getFilteredGeojson(geojson, filters, dateFilter) as any;

      map.addSource("races", {
        type: "geojson",
        data: filtered,
      });

      map.addLayer({
        id: "races-circle",
        type: "circle",
        source: "races",
        paint: {
          "circle-radius": 6,
          // Color by category: WDSC=orange, EURO=blue, FREERIDE=green, IDF=purple, OUTLAW=red, NATIONAL=gold, RACE=teal, SPOT=gray
          "circle-color": [
            "case",
            ["==", ["get", "future"], true],
            "#dc2626", // Future events in red
            [
              "case",
              ["==", ["get", "display_category"], "WDSC"],
              "#ea580c", // Orange for WDSC
              ["==", ["get", "display_category"], "EURO"],
              "#2563eb", // Blue for EURO
              ["==", ["get", "display_category"], "FREERIDE"],
              "#16a34a", // Green for FREERIDE
              ["==", ["get", "display_category"], "IDF"],
              "#7c3aed", // Purple for IDF
              ["==", ["get", "display_category"], "OUTLAW"],
              "#dc2626", // Red for OUTLAW
              ["==", ["get", "display_category"], "NATIONAL"],
              "#f59e0b", // Gold for NATIONAL
              ["==", ["get", "display_category"], "RACE"],
              "#0d9488", // Teal for RACE
              "#6b7280"  // Gray for SPOT
            ]
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#fff",
        },
      });

      // Select on click
      map.on("click", "races-circle", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const p = f.properties as any;
        onSelect?.(Number(p.id));
      });

      // Clear selection on background click
      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["races-circle"] });
        if (!features || features.length === 0) {
          onSelect?.(null);
        }
      });

      map.on("mouseenter", "races-circle", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "races-circle", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      map.remove();
      mapRef.current = null; // ✅ prevent stale reference
    };
  }, []);

  // ✅ Update data safely
  useEffect(() => {
    const m = mapRef.current;
    if (m && m.isStyleLoaded() && m.getSource("races")) {
      const filtered = getFilteredGeojson(geojson, filters, dateFilter) as any;
      (m.getSource("races") as maplibregl.GeoJSONSource).setData(filtered);
    }
  }, [geojson, filters, dateFilter]);

  return <div ref={mapContainer} className="w-full h-[70vh] rounded-lg shadow" />;
}
