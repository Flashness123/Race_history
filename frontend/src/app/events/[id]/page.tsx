"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  fetchSpotRuns,
  fetchSpotRun,
  deleteSpotRun,
  spotRunDownloadUrl,
  type SpotRunListItem,
  type SpotRunOut,
} from "@/lib/api";
import { TRACK_COLORS } from "@/components/RunComparisonMap";

const RunComparisonMap = dynamic(() => import("@/components/RunComparisonMap"), { ssr: false });
const SpeedChart = dynamic(() => import("@/components/SpeedChart"), { ssr: false });
const RunUploadModal = dynamic(() => import("@/components/RunUploadModal"), { ssr: false });

type SortBy = "time" | "speed" | "name" | "date";

function fmtDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec}s`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-base leading-none" title="1st">🥇</span>;
  if (rank === 2) return <span className="text-base leading-none" title="2nd">🥈</span>;
  if (rank === 3) return <span className="text-base leading-none" title="3rd">🥉</span>;
  return (
    <span className="text-xs font-mono w-5 text-right flex-shrink-0" style={{ color: "var(--muted)" }}>
      {rank}.
    </span>
  );
}

export default function EventRunsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.id);

  const [event, setEvent] = useState<any>(null);
  const [runs, setRuns] = useState<SpotRunListItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [tracks, setTracks] = useState<Record<number, SpotRunOut>>({});
  const [sortBy, setSortBy] = useState<SortBy>("time");
  const [showUpload, setShowUpload] = useState(false);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  // A run that was uploaded but not kept (rank > 100) — available for comparison this session only
  const [tempRun, setTempRun] = useState<SpotRunOut | null>(null);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then(setMe)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/events/${eventId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setEvent)
      .catch(() => {});
  }, [eventId]);

  function loadEvent() {
    fetch(`/api/events/${eventId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setEvent)
      .catch(() => {});
  }

  const loadRuns = useCallback(
    async (sort: SortBy = sortBy) => {
      try {
        const data = await fetchSpotRuns(eventId, sort);
        setRuns(data);
      } catch {}
      setLoading(false);
    },
    [eventId, sortBy]
  );

  useEffect(() => { loadRuns(); }, [loadRuns]);

  async function toggleRun(runId: number) {
    const next = new Set(selectedIds);
    if (next.has(runId)) {
      next.delete(runId);
    } else {
      if (next.size >= 5) return;
      next.add(runId);
      if (!tracks[runId]) {
        try {
          const full = await fetchSpotRun(eventId, runId);
          setTracks((prev) => ({ ...prev, [runId]: full }));
        } catch {}
      }
    }
    setSelectedIds(next);
  }

  function toggleTempRun() {
    if (!tempRun) return;
    const next = new Set(selectedIds);
    const TEMP_ID = -1;
    if (next.has(TEMP_ID)) {
      next.delete(TEMP_ID);
    } else {
      if (next.size >= 5) return;
      next.add(TEMP_ID);
      setTracks((prev) => ({ ...prev, [-1]: tempRun }));
    }
    setSelectedIds(next);
  }

  async function handleSort(s: SortBy) {
    setSortBy(s);
    setLoading(true);
    await loadRuns(s);
  }

  async function handleDelete(runId: number) {
    if (!confirm("Delete this run?")) return;
    setDeleteError(null);
    try {
      await deleteSpotRun(eventId, runId);
      setRuns((prev) => prev.filter((r) => r.id !== runId));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(runId); return n; });
      setTracks((prev) => { const n = { ...prev }; delete n[runId]; return n; });
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete run");
    }
  }

  const selectedArray = Array.from(selectedIds);
  const selectedRuns = selectedArray.map((id, i) => {
    const track = tracks[id];
    const run = id === -1 ? tempRun : runs.find((r) => r.id === id);
    return track
      ? {
          runId: id,
          riderName: id === -1 ? (tempRun?.rider_name ?? "Your run") : (run?.rider_name ?? "Unknown"),
          trackPoints: track.track_points,
          color: TRACK_COLORS[i % TRACK_COLORS.length],
        }
      : null;
  }).filter(Boolean) as any[];

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: "time", label: "Time" },
    { value: "speed", label: "Top Speed" },
    { value: "name", label: "Name" },
    { value: "date", label: "Date" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--ink)", color: "var(--paper)" }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-sm px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ background: "var(--surface-raised)", color: "var(--muted)" }}
          >
            ← Back
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate" style={{ color: "var(--paper)" }}>
              {event?.name ?? "Event"} — GPS Run Comparison
            </h1>
            {event?.location && (
              <p className="text-sm" style={{ color: "var(--muted)" }}>{event.location}</p>
            )}
          </div>
          {event?.category && (
            <span className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: "var(--surface-raised)", color: "var(--accent)" }}>
              {event.category}
            </span>
          )}
        </div>
      </div>

      {/* RaceBox track reference banner */}
      {event?.racebox_track_url ? (
        <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 text-sm">
            <span style={{ color: "var(--muted)" }}>📍 Reference track:</span>
            <a
              href={event.racebox_track_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:opacity-80 break-all"
              style={{ color: "var(--accent)" }}
            >
              {event.racebox_track_url}
            </a>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              — Download this track in the RaceBox app to ride with the exact same start &amp; end points.
            </span>
          </div>
        </div>
      ) : (
        <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}>
          <div className="max-w-7xl mx-auto text-sm" style={{ color: "var(--muted)" }}>
            📍 No reference track yet — the first person to upload a run must provide a RaceBox Pro track link.
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: leaderboard */}
          <div className="w-full lg:w-80 flex-shrink-0">
            {/* Sort controls */}
            <div className="flex flex-wrap gap-1 mb-4">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSort(opt.value)}
                  className="text-xs px-3 py-1 rounded-full transition-colors"
                  style={{
                    background: sortBy === opt.value ? "var(--accent)" : "var(--surface-raised)",
                    color: "var(--paper)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Leaderboard header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                Leaderboard {runs.length > 0 && `· ${runs.length}/100`}
              </span>
              {runs.length >= 100 && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--accent)", color: "var(--paper)" }}>
                  TOP 100
                </span>
              )}
            </div>

            {deleteError && (
              <p className="text-xs mb-3" style={{ color: "#ef4444" }}>{deleteError}</p>
            )}

            {loading ? (
              <p className="text-sm text-center py-6" style={{ color: "var(--muted)" }}>Loading…</p>
            ) : runs.length === 0 && !tempRun ? (
              <p className="text-sm text-center py-6" style={{ color: "var(--muted)" }}>
                No runs yet. Be the first to upload!
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {runs.map((run, i) => {
                  const rank = i + 1;
                  const selected = selectedIds.has(run.id);
                  const colorIdx = selectedArray.indexOf(run.id);
                  const color = colorIdx >= 0 ? TRACK_COLORS[colorIdx % TRACK_COLORS.length] : undefined;
                  return (
                    <div
                      key={run.id}
                      className="rounded-lg px-3 py-2.5 cursor-pointer transition-all border"
                      style={{
                        background: selected ? "var(--surface-raised)" : "var(--surface)",
                        borderColor: selected ? (color ?? "var(--accent)") : "var(--border)",
                      }}
                      onClick={() => toggleRun(run.id)}
                    >
                      <div className="flex items-center gap-2">
                        <RankBadge rank={rank} />
                        {selected && color && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                        )}
                        <span className="font-medium text-sm flex-1 truncate" style={{ color: "var(--paper)" }}>
                          {run.rider_name}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a
                            href={spotRunDownloadUrl(eventId, run.id)}
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs px-1.5 py-0.5 rounded transition-opacity hover:opacity-70"
                            style={{ background: "var(--surface-raised)", color: "var(--muted)" }}
                            title="Download CSV"
                          >
                            ↓
                          </a>
                          {run.is_own && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(run.id); }}
                              className="text-xs px-1.5 py-0.5 rounded transition-opacity hover:opacity-70"
                              style={{ background: "var(--surface-raised)", color: "#ef4444" }}
                              title="Delete my run"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 flex gap-3 text-xs pl-6" style={{ color: "var(--muted)" }}>
                        <span>⏱ {fmtDuration(run.duration_ms)}</span>
                        <span>⚡ {run.max_speed_kmh.toFixed(1)} km/h</span>
                      </div>
                    </div>
                  );
                })}

                {/* Temp run (not saved, comparison only) */}
                {tempRun && (
                  <div
                    className="rounded-lg px-3 py-2.5 cursor-pointer transition-all border border-dashed mt-1"
                    style={{
                      background: selectedIds.has(-1) ? "var(--surface-raised)" : "var(--surface)",
                      borderColor: selectedIds.has(-1) ? "var(--accent)" : "var(--border)",
                      opacity: 0.8,
                    }}
                    onClick={toggleTempRun}
                    title="Your run was outside the top 100 and was not saved. Click to compare."
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "var(--muted)" }}>#{tempRun.rank ?? "—"}</span>
                      {selectedIds.has(-1) && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: TRACK_COLORS[selectedArray.indexOf(-1) % TRACK_COLORS.length] }} />
                      )}
                      <span className="font-medium text-sm flex-1 truncate" style={{ color: "var(--paper)" }}>
                        {tempRun.rider_name}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ background: "var(--surface-raised)", color: "var(--muted)" }}>
                        not saved
                      </span>
                    </div>
                    <div className="mt-1 flex gap-3 text-xs pl-5" style={{ color: "var(--muted)" }}>
                      <span>⏱ {fmtDuration(tempRun.duration_ms)}</span>
                      <span>⚡ {tempRun.max_speed_kmh.toFixed(1)} km/h</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload button */}
            {me?.authenticated ? (
              <button
                onClick={() => setShowUpload(true)}
                className="mt-4 w-full py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-80"
                style={{ background: "var(--accent)", color: "var(--paper)" }}
              >
                + Upload Your Run
              </button>
            ) : (
              <p className="mt-4 text-xs text-center" style={{ color: "var(--muted)" }}>
                <a href="/login" className="underline hover:opacity-80">Log in</a> to upload your run
              </p>
            )}

            {selectedIds.size > 0 && (
              <p className="mt-2 text-xs text-center" style={{ color: "var(--muted)" }}>
                {selectedIds.size}/5 runs selected — click to toggle
              </p>
            )}
          </div>

          {/* Right: map + chart */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="rounded-xl overflow-hidden" style={{ height: "380px", background: "var(--surface)" }}>
              <RunComparisonMap runs={selectedRuns} hoveredTime={hoveredTime} />
            </div>
            <div className="rounded-xl p-3" style={{ height: "270px", background: "var(--surface)" }}>
              <SpeedChart runs={selectedRuns} onHoverTime={setHoveredTime} />
            </div>
          </div>
        </div>
      </div>

      {showUpload && (
        <RunUploadModal
          eventId={eventId}
          hasReferenceTrack={!!event?.racebox_track_url}
          onSuccess={(run) => {
            if (run.replaced_run_id) {
              setRuns((prev) => prev.filter((r) => r.id !== run.replaced_run_id));
              setSelectedIds((prev) => { const n = new Set(prev); n.delete(run.replaced_run_id!); return n; });
              setTracks((prev) => { const n = { ...prev }; delete n[run.replaced_run_id!]; return n; });
            }
            if (!run.kept) {
              setTempRun(run);
            }
            loadRuns(sortBy);
            loadEvent();
          }}
          onReplace={(deletedId) => {
            setRuns((prev) => prev.filter((r) => r.id !== deletedId));
            setSelectedIds((prev) => { const n = new Set(prev); n.delete(deletedId); return n; });
            setTracks((prev) => { const n = { ...prev }; delete n[deletedId]; return n; });
          }}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}
