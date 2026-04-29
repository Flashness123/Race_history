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

interface Props {
  runs: RunTrack[];
  hoveredTime?: number | null;
}

function findNearest(pts: TrackPoint[], t_ms: number): TrackPoint {
  let best = pts[0];
  let bestDiff = Math.abs(pts[0].t - t_ms);
  for (const p of pts) {
    const d = Math.abs(p.t - t_ms);
    if (d < bestDiff) { bestDiff = d; best = p; }
    if (p.t > t_ms + bestDiff) break;
  }
  return best;
}

function buildHoverGeoJSON(runs: RunTrack[], t_ms: number): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: runs
      .filter((r) => r.trackPoints.length > 0)
      .map((r) => {
        const p = findNearest(r.trackPoints, t_ms);
        return {
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
          properties: { color: r.color },
        };
      }),
  };
}

const EMPTY_FC: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

export default function RunComparisonMap({ runs, hoveredTime }: Props) {
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

      // Hover-points layer (always present, data updated on hover)
      map.addSource("hover-points", { type: "geojson", data: EMPTY_FC });
      map.addLayer({
        id: "hover-points-circle",
        type: "circle",
        source: "hover-points",
        paint: {
          "circle-radius": 7,
          "circle-color": ["get", "color"],
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.95,
        },
      });

      applyRuns(map, runs);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
  }, []);

  // Update track lines when selected runs change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    applyRuns(map, runs);
  }, [runs]);

  // Update hover markers when hovered time changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const src = map.getSource("hover-points") as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    if (hoveredTime == null || runs.length === 0) {
      src.setData(EMPTY_FC);
    } else {
      src.setData(buildHoverGeoJSON(runs, hoveredTime));
    }
  }, [hoveredTime, runs]);

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
      // Insert track lines below the hover-points layer so dots appear on top
      map.addLayer(
        {
          id: sourceId,
          type: "line",
          source: sourceId,
          paint: { "line-color": run.color, "line-width": 3, "line-opacity": 0.85 },
        },
        "hover-points-circle"
      );
    }
  }

  if (allCoords.length > 0) {
    const lngs = allCoords.map((c) => c[0]);
    const lats = allCoords.map((c) => c[1]);
    map.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 40, maxZoom: 17, duration: 600 }
    );
  }
}
