"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Map({ geojson }: { geojson: any }) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [10, 47],
      zoom: 4,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("races", {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: "races-circle",
        type: "circle",
        source: "races",
        paint: {
          "circle-radius": 6,
          "circle-color": "#2563eb",
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#fff",
        },
      });

      map.on("click", "races-circle", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const [lng, lat] = (f.geometry as any).coordinates;
        const p = f.properties as any;

        new maplibregl.Popup()
          .setLngLat([lng, lat])
          .setHTML(`
            <strong>${p.name}</strong><br/>
            ${p.location}<br/>
            Year: ${p.year}
            ${p.source_url ? `<br/><a href="${p.source_url}" target="_blank">source</a>` : ""}
          `)
          .addTo(mapRef.current!);
      });

      map.on("mouseenter", "races-circle", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "races-circle", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => map.remove();
  }, [geojson]);

  // Update data when races change
  useEffect(() => {
    const m = mapRef.current;
    if (m && m.getSource("races")) {
      (m.getSource("races") as maplibregl.GeoJSONSource).setData(geojson);
    }
  }, [geojson]);

  return <div ref={mapContainer} className="w-full h-[70vh] rounded-lg shadow" />;
}
