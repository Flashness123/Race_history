"use client";

import { useRef, useState } from "react";
import { uploadSpotRun, type SpotRunListItem } from "@/lib/api";

interface Props {
  eventId: number;
  defaultRiderName?: string;
  onSuccess: (run: SpotRunListItem) => void;
  onClose: () => void;
}

export default function RunUploadModal({ eventId, defaultRiderName, onSuccess, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [riderName, setRiderName] = useState(defaultRiderName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ duration: number; speed: number } | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a CSV file"); return; }
    if (!riderName.trim()) { setError("Please enter your name"); return; }

    setLoading(true);
    setError(null);
    try {
      const run = await uploadSpotRun(eventId, file, riderName.trim());
      setSuccess({ duration: run.duration_ms, speed: run.max_speed_kmh });
      setTimeout(() => {
        onSuccess(run);
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function fmt(ms: number) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-xl p-6 shadow-2xl" style={{ background: "var(--surface)" }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold" style={{ color: "var(--paper)" }}>Upload GPS Run</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">✓</div>
            <p className="font-medium" style={{ color: "var(--paper)" }}>Run uploaded!</p>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {fmt(success.duration)} · {success.speed} km/h max
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--muted)" }}>Rider name</label>
              <input
                type="text"
                value={riderName}
                onChange={(e) => setRiderName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 rounded-lg text-sm border"
                style={{
                  background: "var(--surface-raised)",
                  color: "var(--paper)",
                  borderColor: "var(--border)",
                }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--muted)" }}>RaceBox CSV file</label>
              <div
                className="w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-blue-400"
                style={{ borderColor: "var(--border)" }}
                onClick={() => fileRef.current?.click()}
              >
                {file ? (
                  <p className="text-sm" style={{ color: "var(--paper)" }}>{file.name}</p>
                ) : (
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    Tap to select .csv file from RaceBox app
                  </p>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFile}
                  className="hidden"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

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
