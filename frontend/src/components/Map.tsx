"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Map({ geojson, onSelect, filters }: { geojson: any, onSelect?: (id: number | null) => void, filters?: { SPOT: boolean; WDSC: boolean; EURO: boolean; FREERIDE: boolean } }) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current!,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json", // 🌍 Streets + labels
      center: [14.42076, 50.08804], // default Prague
      zoom: 5,
    });

    mapRef.current = map;

    // ✅ Zoom buttons
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      // Optionally filter features by category
      const filtered = {
        ...geojson,
        features: geojson.features.filter((f: any) => {
          const cat = f.properties?.category || "WDSC";
          if (!filters) return true;
          return Boolean((filters as any)[cat]);
        })
      };

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
          // Color by category: WDSC=orange, EURO=blue, FREERIDE=green, SPOT=gray
          "circle-color": [
            "case",
            ["==", ["get", "future"], true],
            "#dc2626", // Future events in red
            [
              "case",
              ["==", ["get", "category"], "WDSC"],
              "#ea580c", // Orange for WDSC
              ["==", ["get", "category"], "EURO"],
              "#2563eb", // Blue for EURO
              ["==", ["get", "category"], "FREERIDE"],
              "#16a34a", // Green for FREERIDE
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
      const filtered = {
        ...geojson,
        features: geojson.features.filter((f: any) => {
          const cat = f.properties?.category || "WDSC";
          if (!filters) return true;
          return Boolean((filters as any)[cat]);
        })
      };
      (m.getSource("races") as maplibregl.GeoJSONSource).setData(filtered);
    }
  }, [geojson, filters]);

  return <div ref={mapContainer} className="w-full h-[70vh] rounded-lg shadow" />;
}
