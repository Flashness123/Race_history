"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE_URL } from "@/lib/map-config";
import type { TrackPoint } from "@/lib/api";

export const TRACK_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ef4444"];

interface RunTrack {
  runId: number;
  riderName: string;
  trackPoints: TrackPoint[];
  color: string;
}

export default function RunComparisonMap({ runs }: { runs: RunTrack[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [14.42076, 50.08804],
      zoom: 13,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      loadedRef.current = true;
      applyRuns(map, runs);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    applyRuns(map, runs);
  }, [runs]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-lg" />
      {runs.length > 0 && (
        <div className="absolute bottom-3 left-3 bg-black/70 rounded-lg px-3 py-2 flex flex-col gap-1 text-xs">
          {runs.map((r) => (
            <div key={r.runId} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: r.color }} />
              <span className="text-white truncate max-w-[120px]">{r.riderName}</span>
            </div>
          ))}
        </div>
      )}
      {runs.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-sm text-gray-400 bg-black/50 px-4 py-2 rounded-lg">
            Select runs from the leaderboard to compare tracks
          </p>
        </div>
      )}
    </div>
  );
}

function applyRuns(map: maplibregl.Map, runs: RunTrack[]) {
  // Remove any old layers/sources not in current runs
  const currentIds = new Set(runs.map((r) => `run-${r.runId}`));
  const style = map.getStyle();
  for (const layer of style?.layers ?? []) {
    if (layer.id.startsWith("run-") && !currentIds.has(layer.id)) {
      map.removeLayer(layer.id);
      map.removeSource(layer.id);
    }
  }

  if (runs.length === 0) return;

  const allCoords: [number, number][] = [];

  for (const run of runs) {
    const sourceId = `run-${run.runId}`;
    const coords: [number, number][] = run.trackPoints.map((p) => [p.lng, p.lat]);
    allCoords.push(...coords);

    const geojson: GeoJSON.Feature = {
      type: "Feature",
      geometry: { type: "LineString", coordinates: coords },
      properties: {},
    };

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource(sourceId, { type: "geojson", data: geojson });
      map.addLayer({
        id: sourceId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": run.color,
          "line-width": 3,
          "line-opacity": 0.85,
        },
      });
    }
  }

  // Fit to bounds of all tracks
  if (allCoords.length > 0) {
    const lngs = allCoords.map((c) => c[0]);
    const lats = allCoords.map((c) => c[1]);
    map.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 40, maxZoom: 17, duration: 600 }
    );
  }
}
