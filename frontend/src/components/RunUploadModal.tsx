"use client";

import { useRef, useState } from "react";
import {
  uploadSpotRun,
  deleteSpotRun,
  RunConflictError,
  type SpotRunOut,
  type ExistingRunConflict,
} from "@/lib/api";

interface Props {
  eventId: number;
  defaultRiderName?: string;
  onSuccess: (run: SpotRunOut) => void;
  onReplace?: (deletedRunId: number) => void;
  onClose: () => void;
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

export default function RunUploadModal({ eventId, defaultRiderName, onSuccess, onReplace, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [riderName, setRiderName] = useState(defaultRiderName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<ExistingRunConflict | null>(null);
  const [notKept, setNotKept] = useState<{ rank: number; duration_ms: number; max_speed_kmh: number } | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("Only .csv files are supported");
      return;
    }
    setFile(f);
    setError(null);
  }

  async function doUpload(replaceId?: number) {
    if (!file) { setError("Please select a CSV file"); return; }
    if (!riderName.trim()) { setError("Please enter your name"); return; }
    setLoading(true);
    setError(null);
    try {
      if (replaceId !== undefined) {
        await deleteSpotRun(eventId, replaceId);
        onReplace?.(replaceId);
      }
      const run = await uploadSpotRun(eventId, file, riderName.trim());
      if (!run.kept) {
        setNotKept({ rank: run.rank!, duration_ms: run.duration_ms, max_speed_kmh: run.max_speed_kmh });
      }
      onSuccess(run);
      if (run.kept) onClose();
    } catch (err: any) {
      if (err instanceof RunConflictError) {
        setConflict(err.conflict);
        return;
      }
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await doUpload();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-xl p-6 shadow-2xl" style={{ background: "var(--surface)" }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold" style={{ color: "var(--paper)" }}>Upload GPS Run</h2>
          <button onClick={onClose} className="text-xl leading-none hover:opacity-70" style={{ color: "var(--muted)" }}>&times;</button>
        </div>

        {/* Not-in-top-100 feedback (stays open so user can still close manually) */}
        {notKept && (
          <div className="rounded-lg p-4 mb-4" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
            <p className="font-medium mb-1" style={{ color: "var(--paper)" }}>Run compared — not saved</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Your run ranked <strong style={{ color: "var(--accent)" }}>#{notKept.rank}</strong> but only the top {100} runs are stored.
              You can still see your track on the map for this session.
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
              {fmt(notKept.duration_ms)} · {notKept.max_speed_kmh.toFixed(1)} km/h max
            </p>
            <button
              onClick={onClose}
              className="mt-3 w-full py-1.5 text-sm rounded-lg"
              style={{ background: "var(--accent)", color: "var(--paper)" }}
            >
              Close
            </button>
          </div>
        )}

        {/* Replacement confirmation */}
        {conflict && !notKept && (
          <div className="space-y-4">
            <div className="rounded-lg p-4" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--paper)" }}>You already have a run on this spot</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {conflict.existing_rider_name} · {fmt(conflict.existing_duration_ms)} · {conflict.existing_max_speed_kmh.toFixed(1)} km/h max
              </p>
            </div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Upload this new run and <strong style={{ color: "#ef4444" }}>permanently delete</strong> your existing one?
            </p>
            {error && <p className="text-sm" style={{ color: "#ef4444" }}>{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setConflict(null)}
                className="flex-1 py-2 text-sm rounded-lg transition-opacity hover:opacity-80"
                style={{ background: "var(--surface-raised)", color: "var(--muted)", border: "1px solid var(--border)" }}
              >
                Keep old run
              </button>
              <button
                disabled={loading}
                onClick={() => doUpload(conflict.existing_run_id)}
                className="flex-1 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ background: "#ef4444", color: "var(--paper)" }}
              >
                {loading ? "Replacing…" : "Yes, replace it"}
              </button>
            </div>
          </div>
        )}

        {/* Normal upload form */}
        {!conflict && !notKept && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--muted)" }}>Rider name</label>
              <input
                type="text"
                value={riderName}
                onChange={(e) => setRiderName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 rounded-lg text-sm border"
                style={{ background: "var(--surface-raised)", color: "var(--paper)", borderColor: "var(--border)" }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--muted)" }}>RaceBox CSV file</label>
              <div
                className="w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-opacity-70"
                style={{ borderColor: "var(--border)" }}
                onClick={() => fileRef.current?.click()}
              >
                {file ? (
                  <p className="text-sm" style={{ color: "var(--paper)" }}>{file.name}</p>
                ) : (
                  <p className="text-sm" style={{ color: "var(--muted)" }}>Tap to select .csv file from RaceBox app</p>
                )}
                <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
              </div>
            </div>

            {error && <p className="text-sm" style={{ color: "#ef4444" }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg font-medium text-sm transition-opacity disabled:opacity-50"
              style={{ background: "var(--accent)", color: "var(--paper)" }}
            >
              {loading ? "Uploading…" : "Upload Run"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
