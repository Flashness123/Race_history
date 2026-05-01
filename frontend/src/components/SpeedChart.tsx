"use client";

import { useRef, useState } from "react";
import type { TrackPoint } from "@/lib/api";

interface RunLine {
  runId: number;
  riderName: string;
  trackPoints: TrackPoint[];
  color: string;
}

interface Props {
  runs: RunLine[];
  onHoverTime?: (t: number | null) => void;
}

// ── SVG layout ────────────────────────────────────────────────────
const W = 600;
const PAD = { left: 48, right: 16 };
const CHART_W = W - PAD.left - PAD.right;

const SPEED_TOP = 8;
const SPEED_H   = 78;
const SPEED_BOT = SPEED_TOP + SPEED_H;   // 86

const GX_TOP = SPEED_BOT + 14;           // 100
const GX_H   = 56;
const GX_BOT = GX_TOP + GX_H;            // 156

const GY_TOP = GX_BOT + 10;              // 166
const GY_H   = 56;
const GY_BOT = GY_TOP + GY_H;            // 222

const XAXIS_Y = GY_BOT + 18;             // 240
const SVG_H   = XAXIS_Y + 18;            // 258

function nearestPoint(pts: TrackPoint[], t_ms: number): TrackPoint {
  return pts.reduce((best, p) =>
    Math.abs(p.t - t_ms) < Math.abs(best.t - t_ms) ? p : best
  );
}

// Symmetric y-scale for signed G panels (0 maps to the panel midline)
function makeGScale(top: number, h: number, maxAbs: number) {
  return (v: number) => top + h / 2 - (v / maxAbs) * (h / 2);
}

export default function SpeedChart({ runs, onHoverTime }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [cursorX, setCursorX]   = useState<number | null>(null);
  const [cursorT, setCursorT]   = useState<number | null>(null);

  if (runs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm" style={{ color: "var(--muted)" }}>
        Select runs to see telemetry comparison
      </div>
    );
  }

  const allPoints = runs.flatMap((r) => r.trackPoints);
  const maxT_ms = Math.max(...allPoints.map((p) => p.t));
  const maxT_s  = maxT_ms / 1000;
  const maxSpd  = Math.max(...allPoints.map((p) => p.spd)) * 1.1 || 10;

  const hasGx = allPoints.some((p) => p.gx !== undefined && p.gx !== null);
  const hasGy = allPoints.some((p) => p.gy !== undefined && p.gy !== null);
  const hasG  = hasGx || hasGy;

  // Symmetric range for each axis
  const maxAbsGx = hasGx
    ? Math.max(...allPoints.map((p) => Math.abs(p.gx ?? 0))) * 1.2 || 1
    : 1;
  const maxAbsGy = hasGy
    ? Math.max(...allPoints.map((p) => Math.abs(p.gy ?? 0))) * 1.2 || 1
    : 1;

  const xScale = (t_ms: number) => PAD.left + (t_ms / maxT_ms) * CHART_W;
  const ySpd   = (v: number) => SPEED_TOP + SPEED_H - (v / maxSpd) * SPEED_H;
  const yGx    = makeGScale(GX_TOP, GX_H, maxAbsGx);
  const yGy    = makeGScale(GY_TOP, GY_H, maxAbsGy);

  // Adjust effective bottom for panels actually present
  const chartBottom = hasG ? GY_BOT : SPEED_BOT;

  // Grid ticks
  const spdTicks = [0, 0.33, 0.67, 1].map((f) => Math.round(maxSpd * f));
  const gxTick   = parseFloat((maxAbsGx * 0.7).toFixed(1));
  const gyTick   = parseFloat((maxAbsGy * 0.7).toFixed(1));
  const xTickCount = Math.min(Math.floor(maxT_s / 30) + 1, 9);
  const xStep      = maxT_s / (xTickCount - 1 || 1);
  const xTicks     = Array.from({ length: xTickCount }, (_, i) => i * xStep);

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect   = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const vbX    = (e.clientX - rect.left) * scaleX;
    const chartX = vbX - PAD.left;
    if (chartX < 0 || chartX > CHART_W) {
      setCursorX(null); setCursorT(null); onHoverTime?.(null);
      return;
    }
    const t_ms = (chartX / CHART_W) * maxT_ms;
    setCursorX(vbX);
    setCursorT(t_ms);
    onHoverTime?.(t_ms);
  }

  function handleMouseLeave() {
    setCursorX(null); setCursorT(null); onHoverTime?.(null);
  }

  function PanelLabel({ x, y, label }: { x: number; y: number; label: string }) {
    return (
      <text x={x} y={y} textAnchor="middle" fontSize={8.5} fill="#6b7280"
        transform={`rotate(-90,${x},${y - 4})`}>{label}</text>
    );
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${SVG_H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ═══════════════════════════════════════
          SPEED PANEL
      ═══════════════════════════════════════ */}
      <PanelLabel x={PAD.left - 36} y={SPEED_TOP + SPEED_H / 2 + 4} label="km/h" />

      {spdTicks.map((v) => (
        <g key={`sv${v}`}>
          <line x1={PAD.left} y1={ySpd(v)} x2={W - PAD.right} y2={ySpd(v)}
            stroke="#2d3748" strokeWidth={0.6} />
          <text x={PAD.left - 5} y={ySpd(v) + 3.5} textAnchor="end" fontSize={8} fill="#9ca3af">{v}</text>
        </g>
      ))}

      {runs.map((run) => {
        const pts = run.trackPoints
          .map((p) => `${xScale(p.t).toFixed(1)},${ySpd(p.spd).toFixed(1)}`)
          .join(" ");
        return (
          <polyline key={run.runId} points={pts} fill="none" stroke={run.color}
            strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" opacity={0.9} />
        );
      })}

      {cursorT !== null && runs.map((run) => {
        const p = nearestPoint(run.trackPoints, cursorT);
        return <circle key={run.runId} cx={xScale(p.t)} cy={ySpd(p.spd)} r={3.5}
          fill={run.color} stroke="#fff" strokeWidth={1.2} />;
      })}

      {/* ═══════════════════════════════════════
          GX PANEL — Longitudinal G (accel/brake)
      ═══════════════════════════════════════ */}
      {hasG && (
        <>
          <line x1={PAD.left} y1={GX_TOP - 5} x2={W - PAD.right} y2={GX_TOP - 5}
            stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />

          <PanelLabel x={PAD.left - 36} y={GX_TOP + GX_H / 2 + 4} label="Gx" />

          {/* panel label */}
          <text x={PAD.left + 3} y={GX_TOP + 8} fontSize={7.5} fill="#6b7280">longitudinal</text>

          {/* zero line */}
          <line x1={PAD.left} y1={yGx(0)} x2={W - PAD.right} y2={yGx(0)}
            stroke="#4b5563" strokeWidth={0.9} />

          {/* positive tick */}
          <line x1={PAD.left} y1={yGx(gxTick)} x2={W - PAD.right} y2={yGx(gxTick)}
            stroke="#2d3748" strokeWidth={0.5} />
          <text x={PAD.left - 5} y={yGx(gxTick) + 3.5} textAnchor="end" fontSize={8} fill="#9ca3af">+{gxTick}</text>

          {/* negative tick */}
          <line x1={PAD.left} y1={yGx(-gxTick)} x2={W - PAD.right} y2={yGx(-gxTick)}
            stroke="#2d3748" strokeWidth={0.5} />
          <text x={PAD.left - 5} y={yGx(-gxTick) + 3.5} textAnchor="end" fontSize={8} fill="#9ca3af">-{gxTick}</text>

          {/* 0 label */}
          <text x={PAD.left - 5} y={yGx(0) + 3.5} textAnchor="end" fontSize={8} fill="#6b7280">0</text>

          {runs.map((run) => {
            if (!run.trackPoints.some((p) => p.gx !== undefined)) return null;
            const pts = run.trackPoints
              .map((p) => `${xScale(p.t).toFixed(1)},${yGx(p.gx ?? 0).toFixed(1)}`)
              .join(" ");
            return (
              <polyline key={run.runId} points={pts} fill="none" stroke={run.color}
                strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
            );
          })}

          {cursorT !== null && runs.map((run) => {
            if (!run.trackPoints.some((p) => p.gx !== undefined)) return null;
            const p = nearestPoint(run.trackPoints, cursorT);
            return <circle key={run.runId} cx={xScale(p.t)} cy={yGx(p.gx ?? 0)} r={3}
              fill={run.color} stroke="#fff" strokeWidth={1.2} />;
          })}
        </>
      )}

      {/* ═══════════════════════════════════════
          GY PANEL — Lateral G (cornering)
      ═══════════════════════════════════════ */}
      {hasG && (
        <>
          <line x1={PAD.left} y1={GY_TOP - 5} x2={W - PAD.right} y2={GY_TOP - 5}
            stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />

          <PanelLabel x={PAD.left - 36} y={GY_TOP + GY_H / 2 + 4} label="Gy" />

          {/* panel label */}
          <text x={PAD.left + 3} y={GY_TOP + 8} fontSize={7.5} fill="#6b7280">lateral</text>

          {/* zero line */}
          <line x1={PAD.left} y1={yGy(0)} x2={W - PAD.right} y2={yGy(0)}
            stroke="#4b5563" strokeWidth={0.9} />

          {/* positive tick */}
          <line x1={PAD.left} y1={yGy(gyTick)} x2={W - PAD.right} y2={yGy(gyTick)}
            stroke="#2d3748" strokeWidth={0.5} />
          <text x={PAD.left - 5} y={yGy(gyTick) + 3.5} textAnchor="end" fontSize={8} fill="#9ca3af">+{gyTick}</text>

          {/* negative tick */}
          <line x1={PAD.left} y1={yGy(-gyTick)} x2={W - PAD.right} y2={yGy(-gyTick)}
            stroke="#2d3748" strokeWidth={0.5} />
          <text x={PAD.left - 5} y={yGy(-gyTick) + 3.5} textAnchor="end" fontSize={8} fill="#9ca3af">-{gyTick}</text>

          {/* 0 label */}
          <text x={PAD.left - 5} y={yGy(0) + 3.5} textAnchor="end" fontSize={8} fill="#6b7280">0</text>

          {runs.map((run) => {
            if (!run.trackPoints.some((p) => p.gy !== undefined)) return null;
            const pts = run.trackPoints
              .map((p) => `${xScale(p.t).toFixed(1)},${yGy(p.gy ?? 0).toFixed(1)}`)
              .join(" ");
            return (
              <polyline key={run.runId} points={pts} fill="none" stroke={run.color}
                strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
            );
          })}

          {cursorT !== null && runs.map((run) => {
            if (!run.trackPoints.some((p) => p.gy !== undefined)) return null;
            const p = nearestPoint(run.trackPoints, cursorT);
            return <circle key={run.runId} cx={xScale(p.t)} cy={yGy(p.gy ?? 0)} r={3}
              fill={run.color} stroke="#fff" strokeWidth={1.2} />;
          })}
        </>
      )}

      {/* ═══════════════════════════════════════
          SHARED X AXIS
      ═══════════════════════════════════════ */}
      {xTicks.map((v) => (
        <g key={`xt${v}`}>
          <line x1={xScale(v * 1000)} y1={SPEED_TOP} x2={xScale(v * 1000)} y2={chartBottom}
            stroke="#2d3748" strokeWidth={0.6} />
          <text x={xScale(v * 1000)} y={XAXIS_Y} textAnchor="middle" fontSize={8.5} fill="#9ca3af">
            {Math.round(v)}s
          </text>
        </g>
      ))}

      {/* ═══════════════════════════════════════
          HOVER CURSOR
      ═══════════════════════════════════════ */}
      {cursorX !== null && (
        <>
          <line x1={cursorX} y1={SPEED_TOP} x2={cursorX} y2={chartBottom}
            stroke="#ffffff" strokeWidth={0.8} strokeDasharray="4,3" opacity={0.45} pointerEvents="none" />

          {/* time label */}
          <rect x={cursorX - 18} y={SPEED_TOP - 1} width={36} height={11} rx={3}
            fill="#1f2937" opacity={0.9} />
          <text x={cursorX} y={SPEED_TOP + 8} textAnchor="middle" fontSize={8} fill="#e5e7eb">
            {(cursorT! / 1000).toFixed(1)}s
          </text>

          {/* hover tooltip values */}
          {runs.map((run, i) => {
            const p = nearestPoint(run.trackPoints, cursorT!);
            const tooltipX = Math.min(cursorX + 6, W - PAD.right - 55);
            const tooltipY = SPEED_TOP + 2 + i * 28;
            return (
              <g key={run.runId}>
                <rect x={tooltipX} y={tooltipY} width={54} height={26} rx={3}
                  fill="#111827" opacity={0.88} />
                <text x={tooltipX + 4} y={tooltipY + 9} fontSize={7.5} fill={run.color}>
                  {p.spd.toFixed(1)} km/h
                </text>
                {p.gx !== undefined && (
                  <text x={tooltipX + 4} y={tooltipY + 18} fontSize={7} fill="#6b7280">
                    Gx {p.gx >= 0 ? "+" : ""}{p.gx.toFixed(2)}
                    {p.gy !== undefined ? `  Gy ${p.gy >= 0 ? "+" : ""}${p.gy.toFixed(2)}` : ""}
                  </text>
                )}
              </g>
            );
          })}
        </>
      )}

      {/* ═══════════════════════════════════════
          LEGEND
      ═══════════════════════════════════════ */}
      {runs.map((run, i) => (
        <g key={run.runId} transform={`translate(${PAD.left + i * 110}, ${SVG_H - 4})`}>
          <circle cx={5} cy={0} r={3.5} fill={run.color} />
          <text x={12} y={4} fontSize={8} fill="#d1d5db">
            {run.riderName.length > 13 ? run.riderName.slice(0, 12) + "…" : run.riderName}
          </text>
        </g>
      ))}
    </svg>
  );
}
