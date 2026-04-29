"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  fetchSpotRuns,
  fetchSpotRun,
  deleteSpotRun,
  spotRunDownloadUrl,
  fetchEventAttachments,
  uploadEventAttachment,
  deleteEventAttachment,
  eventAttachmentDownloadUrl,
  type SpotRunListItem,
  type SpotRunOut,
  type EventAttachment,
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

function fmtFileSize(bytes: number): string {
  if (bytes < 1024) return "< 1 KB";
  return `${Math.round(bytes / 1024)} KB`;
}

function fileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "📕";
  if (["xlsx", "xls", "ods", "csv"].includes(ext)) return "📊";
  if (["doc", "docx"].includes(ext)) return "📄";
  return "📎";
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
  const [attachments, setAttachments] = useState<EventAttachment[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    fetchEventAttachments(eventId)
      .then(setAttachments)
      .catch(() => {});
  }, [eventId]);

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

  async function handleAttachmentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setAttachError(null);
    setUploading(true);
    try {
      const att = await uploadEventAttachment(eventId, file);
      setAttachments((prev) => [att, ...prev]);
    } catch (err: any) {
      setAttachError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleAttachmentDelete(attId: number) {
    if (!confirm("Delete this attachment?")) return;
    setAttachError(null);
    try {
      await deleteEventAttachment(eventId, attId);
      setAttachments((prev) => prev.filter((a) => a.id !== attId));
    } catch (err: any) {
      setAttachError(err.message || "Failed to delete attachment");
    }
  }

  const selectedArray = Array.from(selectedIds);
  const selectedRuns = selectedArray.map((id, i) => {
    const track = tracks[id];
    const run = runs.find((r) => r.id === id);
    return track
      ? { runId: id, riderName: run?.rider_name ?? "Unknown", trackPoints: track.track_points, color: TRACK_COLORS[i % TRACK_COLORS.length] }
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: leaderboard */}
          <div className="w-full lg:w-72 flex-shrink-0">
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

            {deleteError && (
              <p className="text-xs text-red-400 mb-3">{deleteError}</p>
            )}

            {loading ? (
              <p className="text-sm text-center py-6" style={{ color: "var(--muted)" }}>Loading…</p>
            ) : runs.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "var(--muted)" }}>
                No runs yet. Be the first to upload!
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {runs.map((run, i) => {
                  const selected = selectedIds.has(run.id);
                  const colorIdx = selectedArray.indexOf(run.id);
                  const color = colorIdx >= 0 ? TRACK_COLORS[colorIdx % TRACK_COLORS.length] : undefined;
                  return (
                    <div
                      key={run.id}
                      className="rounded-lg p-3 cursor-pointer transition-all border"
                      style={{
                        background: selected ? "var(--surface-raised)" : "var(--surface)",
                        borderColor: selected ? (color ?? "var(--accent)") : "var(--border)",
                      }}
                      onClick={() => toggleRun(run.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {selected && color && (
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                          )}
                          <span className="text-xs text-gray-400 flex-shrink-0 w-5">{i + 1}.</span>
                          <span className="font-medium text-sm truncate">{run.rider_name}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a
                            href={spotRunDownloadUrl(eventId, run.id)}
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs px-2 py-0.5 rounded transition-opacity hover:opacity-70"
                            style={{ background: "var(--surface-raised)", color: "var(--muted)" }}
                          >
                            ↓
                          </a>
                          {run.is_own && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(run.id); }}
                              className="text-xs px-2 py-0.5 rounded text-red-400 transition-opacity hover:opacity-70"
                              style={{ background: "var(--surface-raised)" }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-1.5 flex gap-3 text-xs" style={{ color: "var(--muted)" }}>
                        <span>⏱ {fmtDuration(run.duration_ms)}</span>
                        <span>⚡ {run.max_speed_kmh.toFixed(1)} km/h</span>
                      </div>
                    </div>
                  );
                })}
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
                {selectedIds.size}/5 runs selected — click a run to toggle
              </p>
            )}
          </div>

          {/* Right: map + chart */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="rounded-xl overflow-hidden" style={{ height: "380px", background: "var(--surface)" }}>
              <RunComparisonMap runs={selectedRuns} hoveredTime={hoveredTime} />
            </div>
            <div
              className="rounded-xl p-3"
              style={{ height: "270px", background: "var(--surface)" }}
            >
              <SpeedChart runs={selectedRuns} onHoverTime={setHoveredTime} />
            </div>

            {/* Attachments */}
            <div className="rounded-xl p-4" style={{ background: "var(--surface)" }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold" style={{ color: "var(--paper)" }}>Attachments</h2>
                {me?.authenticated && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="text-xs px-3 py-1 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50"
                      style={{ background: "var(--accent)", color: "var(--paper)" }}
                    >
                      {uploading ? "Uploading…" : "+ Attach"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls,.doc,.docx,.pdf,.txt,.ods"
                      className="hidden"
                      onChange={handleAttachmentUpload}
                    />
                  </>
                )}
              </div>

              {attachError && (
                <p className="text-xs text-red-400 mb-2">{attachError}</p>
              )}

              {attachments.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  No attachments yet.{me?.authenticated ? ' Use "+ Attach" to add qualifying results, schedules, etc.' : ""}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 rounded-lg px-3 py-2"
                      style={{ background: "var(--surface-raised)" }}
                    >
                      <span className="flex-shrink-0">{fileIcon(att.original_filename)}</span>
                      <span className="flex-1 text-xs truncate" style={{ color: "var(--paper)" }}>
                        {att.original_filename}
                      </span>
                      <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>
                        {fmtFileSize(att.file_size)}
                      </span>
                      <span className="text-xs flex-shrink-0 hidden sm:block" style={{ color: "var(--muted)" }}>
                        {att.uploaded_by_name}
                      </span>
                      <a
                        href={eventAttachmentDownloadUrl(eventId, att.id)}
                        download
                        className="text-xs px-2 py-0.5 rounded transition-opacity hover:opacity-70 flex-shrink-0"
                        style={{ background: "var(--ink)", color: "var(--muted)" }}
                      >
                        ↓
                      </a>
                      {att.is_own && (
                        <button
                          onClick={() => handleAttachmentDelete(att.id)}
                          className="text-xs px-2 py-0.5 rounded text-red-400 transition-opacity hover:opacity-70 flex-shrink-0"
                          style={{ background: "var(--ink)" }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showUpload && (
        <RunUploadModal
          eventId={eventId}
          defaultRiderName={me?.user?.display_name || me?.user?.name}
          onSuccess={(run) => {
            setRuns((prev) => {
              const next = [run, ...prev];
              if (sortBy === "time") return next.sort((a, b) => a.duration_ms - b.duration_ms);
              if (sortBy === "speed") return next.sort((a, b) => b.max_speed_kmh - a.max_speed_kmh);
              if (sortBy === "name") return next.sort((a, b) => a.rider_name.localeCompare(b.rider_name));
              return next;
            });
          }}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}
