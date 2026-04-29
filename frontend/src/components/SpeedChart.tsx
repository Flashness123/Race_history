"use client";

import type { TrackPoint } from "@/lib/api";

interface RunLine {
  runId: number;
  riderName: string;
  trackPoints: TrackPoint[];
  color: string;
}

const W = 600;
const H = 200;
const PAD = { top: 12, right: 16, bottom: 36, left: 48 };

export default function SpeedChart({ runs }: { runs: RunLine[] }) {
  if (runs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Select runs to see speed comparison
      </div>
    );
  }

  const maxT = Math.max(...runs.flatMap((r) => r.trackPoints.map((p) => p.t))) / 1000;
  const maxSpd = Math.max(...runs.flatMap((r) => r.trackPoints.map((p) => p.spd))) * 1.1;

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const xScale = (t_ms: number) => PAD.left + (t_ms / 1000 / maxT) * chartW;
  const yScale = (spd: number) => PAD.top + chartH - (spd / maxSpd) * chartH;

  // Y grid lines
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxSpd * f));
  // X grid lines every ~30s
  const xTickCount = Math.min(Math.floor(maxT / 30) + 1, 8);
  const xStep = maxT / (xTickCount - 1 || 1);
  const xTicks = Array.from({ length: xTickCount }, (_, i) => i * xStep);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
    >
      {/* Grid lines */}
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)}
            stroke="#374151" strokeWidth={0.5}
          />
          <text x={PAD.left - 6} y={yScale(v) + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
            {v}
          </text>
        </g>
      ))}
      {xTicks.map((v) => (
        <g key={v}>
          <line
            x1={xScale(v * 1000)} y1={PAD.top} x2={xScale(v * 1000)} y2={PAD.top + chartH}
            stroke="#374151" strokeWidth={0.5}
          />
          <text x={xScale(v * 1000)} y={H - 8} textAnchor="middle" fontSize={9} fill="#9ca3af">
            {Math.round(v)}s
          </text>
        </g>
      ))}

      {/* Axis labels */}
      <text x={PAD.left - 36} y={PAD.top + chartH / 2} textAnchor="middle" fontSize={9} fill="#6b7280"
        transform={`rotate(-90, ${PAD.left - 36}, ${PAD.top + chartH / 2})`}>
        km/h
      </text>

      {/* Track lines */}
      {runs.map((run) => {
        const pts = run.trackPoints
          .map((p) => `${xScale(p.t).toFixed(1)},${yScale(p.spd).toFixed(1)}`)
          .join(" ");
        return (
          <polyline
            key={run.runId}
            points={pts}
            fill="none"
            stroke={run.color}
            strokeWidth={1.8}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.9}
          />
        );
      })}

      {/* Legend */}
      {runs.map((run, i) => (
        <g key={run.runId} transform={`translate(${PAD.left + i * 110}, ${H - 10})`}>
          <circle cx={5} cy={0} r={4} fill={run.color} />
          <text x={13} y={4} fontSize={8} fill="#d1d5db" className="truncate">
            {run.riderName.length > 12 ? run.riderName.slice(0, 11) + "…" : run.riderName}
          </text>
        </g>
      ))}
    </svg>
  );
}
