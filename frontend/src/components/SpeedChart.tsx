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

// SVG layout constants
const W = 600;
const PAD = { left: 48, right: 16 };
const SPEED_TOP = 8;
const SPEED_H = 95;
const SPEED_BOT = SPEED_TOP + SPEED_H;      // 103
const GFORCE_TOP = SPEED_BOT + 12;          // 115
const GFORCE_H = 72;
const GFORCE_BOT = GFORCE_TOP + GFORCE_H;   // 187
const XAXIS_Y = GFORCE_BOT + 18;            // 205
const SVG_H = XAXIS_Y + 8;                  // 213
const CHART_W = W - PAD.left - PAD.right;

function nearestPoint(pts: TrackPoint[], t_ms: number): TrackPoint {
  return pts.reduce((best, p) =>
    Math.abs(p.t - t_ms) < Math.abs(best.t - t_ms) ? p : best
  );
}

function combineG(p: TrackPoint): number {
  return Math.sqrt((p.gx ?? 0) ** 2 + (p.gy ?? 0) ** 2);
}

export default function SpeedChart({ runs, onHoverTime }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);
  const [cursorT, setCursorT] = useState<number | null>(null);

  if (runs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Select runs to see telemetry comparison
      </div>
    );
  }

  const allPoints = runs.flatMap((r) => r.trackPoints);
  const maxT_ms = Math.max(...allPoints.map((p) => p.t));
  const maxT_s = maxT_ms / 1000;
  const maxSpd = Math.max(...allPoints.map((p) => p.spd)) * 1.1 || 10;
  const maxG = Math.max(...allPoints.map((p) => combineG(p))) * 1.15 || 2;

  const xScale = (t_ms: number) => PAD.left + (t_ms / maxT_ms) * CHART_W;
  const ySpd = (v: number) => SPEED_TOP + SPEED_H - (v / maxSpd) * SPEED_H;
  const yG = (v: number) => GFORCE_TOP + GFORCE_H - (v / maxG) * GFORCE_H;

  // Grid ticks
  const spdTicks = [0, 0.33, 0.67, 1].map((f) => Math.round(maxSpd * f));
  const gTicks = [0, 0.5, 1].map((f) => parseFloat((maxG * f).toFixed(1)));
  const xTickCount = Math.min(Math.floor(maxT_s / 30) + 1, 9);
  const xStep = maxT_s / (xTickCount - 1 || 1);
  const xTicks = Array.from({ length: xTickCount }, (_, i) => i * xStep);

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const vbX = (e.clientX - rect.left) * scaleX;
    const chartX = vbX - PAD.left;
    if (chartX < 0 || chartX > CHART_W) {
      setCursorX(null);
      setCursorT(null);
      onHoverTime?.(null);
      return;
    }
    const t_ms = (chartX / CHART_W) * maxT_ms;
    setCursorX(vbX);
    setCursorT(t_ms);
    onHoverTime?.(t_ms);
  }

  function handleMouseLeave() {
    setCursorX(null);
    setCursorT(null);
    onHoverTime?.(null);
  }

  const hasG = allPoints.some((p) => (p.gx !== undefined || p.gy !== undefined));

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${SVG_H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Speed panel ── */}
      <text x={PAD.left - 38} y={SPEED_TOP + SPEED_H / 2 + 4} textAnchor="middle" fontSize={9} fill="#6b7280"
        transform={`rotate(-90,${PAD.left - 38},${SPEED_TOP + SPEED_H / 2})`}>km/h</text>

      {spdTicks.map((v) => (
        <g key={`sv${v}`}>
          <line x1={PAD.left} y1={ySpd(v)} x2={W - PAD.right} y2={ySpd(v)} stroke="#2d3748" strokeWidth={0.6} />
          <text x={PAD.left - 5} y={ySpd(v) + 3.5} textAnchor="end" fontSize={8.5} fill="#9ca3af">{v}</text>
        </g>
      ))}

      {runs.map((run) => {
        const pts = run.trackPoints.map((p) => `${xScale(p.t).toFixed(1)},${ySpd(p.spd).toFixed(1)}`).join(" ");
        return <polyline key={run.runId} points={pts} fill="none" stroke={run.color}
          strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" opacity={0.9} />;
      })}

      {/* hover dots on speed panel */}
      {cursorT !== null && runs.map((run) => {
        const p = nearestPoint(run.trackPoints, cursorT);
        return <circle key={run.runId} cx={xScale(p.t)} cy={ySpd(p.spd)} r={3.5}
          fill={run.color} stroke="#fff" strokeWidth={1.2} />;
      })}

      {/* ── G-force panel ── */}
      {hasG && (
        <>
          <text x={PAD.left - 38} y={GFORCE_TOP + GFORCE_H / 2 + 4} textAnchor="middle" fontSize={9} fill="#6b7280"
            transform={`rotate(-90,${PAD.left - 38},${GFORCE_TOP + GFORCE_H / 2})`}>G</text>

          {gTicks.map((v) => (
            <g key={`gv${v}`}>
              <line x1={PAD.left} y1={yG(v)} x2={W - PAD.right} y2={yG(v)} stroke="#2d3748" strokeWidth={0.6} />
              <text x={PAD.left - 5} y={yG(v) + 3.5} textAnchor="end" fontSize={8.5} fill="#9ca3af">{v}</text>
            </g>
          ))}

          {runs.map((run) => {
            const pts = run.trackPoints.map((p) =>
              `${xScale(p.t).toFixed(1)},${yG(combineG(p)).toFixed(1)}`
            ).join(" ");
            return <polyline key={run.runId} points={pts} fill="none" stroke={run.color}
              strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />;
          })}

          {/* hover dots on G panel */}
          {cursorT !== null && runs.map((run) => {
            const p = nearestPoint(run.trackPoints, cursorT);
            return <circle key={run.runId} cx={xScale(p.t)} cy={yG(combineG(p))} r={3.5}
              fill={run.color} stroke="#fff" strokeWidth={1.2} />;
          })}
        </>
      )}

      {/* ── Divider line between panels ── */}
      {hasG && (
        <line x1={PAD.left} y1={GFORCE_TOP - 6} x2={W - PAD.right} y2={GFORCE_TOP - 6}
          stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
      )}

      {/* ── Shared X axis ── */}
      {xTicks.map((v) => (
        <g key={`xt${v}`}>
          <line x1={xScale(v * 1000)} y1={SPEED_TOP} x2={xScale(v * 1000)}
            y2={hasG ? GFORCE_BOT : SPEED_BOT} stroke="#2d3748" strokeWidth={0.6} />
          <text x={xScale(v * 1000)} y={XAXIS_Y} textAnchor="middle" fontSize={8.5} fill="#9ca3af">
            {Math.round(v)}s
          </text>
        </g>
      ))}

      {/* ── Hover cursor ── */}
      {cursorX !== null && (
        <>
          <line x1={cursorX} y1={SPEED_TOP} x2={cursorX} y2={hasG ? GFORCE_BOT : SPEED_BOT}
            stroke="#ffffff" strokeWidth={0.8} strokeDasharray="4,3" opacity={0.55} pointerEvents="none" />
          {/* Time label */}
          <rect x={cursorX - 18} y={SPEED_TOP - 1} width={36} height={11} rx={3}
            fill="#1f2937" opacity={0.85} />
          <text x={cursorX} y={SPEED_TOP + 8} textAnchor="middle" fontSize={8} fill="#e5e7eb">
            {(cursorT! / 1000).toFixed(1)}s
          </text>
        </>
      )}

      {/* ── Legend ── */}
      {runs.map((run, i) => (
        <g key={run.runId} transform={`translate(${PAD.left + i * 110}, ${SVG_H - 2})`}>
          <circle cx={5} cy={0} r={3.5} fill={run.color} />
          <text x={12} y={4} fontSize={8} fill="#d1d5db">
            {run.riderName.length > 13 ? run.riderName.slice(0, 12) + "…" : run.riderName}
          </text>
        </g>
      ))}
    </svg>
  );
}
