"use client";
import { useState } from "react";

interface Props {
  eventId: number;
  eventName: string;
  isAuthenticated: boolean;
  onClose: () => void;
}

export default function ReportModal({ eventId, eventName, isAuthenticated, onClose }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed (${res.status})`);
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Failed to send report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-xl p-6 shadow-2xl" style={{ background: "var(--surface)" }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold" style={{ color: "var(--paper)" }}>Report Issue</h2>
          <button onClick={onClose} className="text-xl leading-none hover:opacity-70" style={{ color: "var(--muted)" }}>&times;</button>
        </div>

        {done ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-3">✅</div>
            <p className="font-medium mb-1" style={{ color: "var(--paper)" }}>Report sent</p>
            <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>Admins will review your report soon.</p>
            <button
              onClick={onClose}
              className="w-full py-2 rounded-lg font-medium text-sm"
              style={{ background: "var(--accent)", color: "var(--paper)" }}
            >
              Close
            </button>
          </div>
        ) : !isAuthenticated ? (
          <div className="text-center py-4">
            <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>You need to be signed in to report an issue.</p>
            <div className="flex gap-3">
              <a href="/login" className="flex-1 text-center py-2 rounded-lg text-sm font-medium"
                style={{ background: "var(--accent)", color: "var(--paper)" }}>Sign In</a>
              <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: "var(--surface-raised)", color: "var(--muted)", border: "1px solid var(--border)" }}>Cancel</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                Reporting issue for: <span className="font-medium" style={{ color: "var(--paper)" }}>{eventName}</span>
              </p>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--paper)" }}>
                Describe the problem
              </label>
              <textarea
                required
                rows={4}
                placeholder="e.g. The first uploaded run is incorrect, the RaceBox track link is broken, wrong location..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--paper)" }}
              />
            </div>
            {error && <p className="text-sm" style={{ color: "#ef4444" }}>{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: "var(--surface-raised)", color: "var(--muted)", border: "1px solid var(--border)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="flex-1 py-2 rounded-lg font-medium text-sm transition-opacity disabled:opacity-50"
                style={{ background: "#ef4444", color: "var(--paper)" }}
              >
                {loading ? "Sending…" : "Send Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
