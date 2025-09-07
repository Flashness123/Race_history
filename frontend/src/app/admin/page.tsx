"use client";
import { useEffect, useState } from "react";

type Top3 = { name: string; country?: string; instagram?: string; position: number };
type PendingItem = {
  id: number;
  submitted_by_user_id: number | null;
  payload: {
    name: string;
    year: number;
    location: string;
    lat: number;
    lng: number;
    source_url?: string;
    top3?: Top3[];
  };
};

export default function AdminPage() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/submissions", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || `Failed to fetch (${res.status})`);
        setItems([]);
      } else {
        setItems(data);
      }
    } catch (e: any) {
      setErr(e.message || "Failed to fetch");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: number) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}/approve`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || `Approve failed (${res.status})`);
        return;
      }
      // remove the approved item from the list
      setItems((prev) => prev.filter((x) => x.id !== id));
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="max-w-4xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-bold">Pending Submissions</h1>
      {loading && <p className="text-gray-600">Loading…</p>}
      {err && <p className="text-red-600">{err}</p>}

      {!loading && !err && items.length === 0 && (
        <p className="text-gray-600">No pending submissions.</p>
      )}

      <div className="grid gap-4">
        {items.map((s) => (
          <div key={s.id} className="border rounded p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">
                  {s.payload.name} <span className="text-gray-500">({s.payload.year})</span>
                </h2>
                <p className="text-sm text-gray-700">
                  {s.payload.location} · {s.payload.lat}, {s.payload.lng}
                </p>
                {s.payload.source_url && (
                  <p className="text-sm">
                    Source:{" "}
                    <a
                      className="underline"
                      href={s.payload.source_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {s.payload.source_url}
                    </a>
                  </p>
                )}
                {Array.isArray(s.payload.top3) && s.payload.top3.length > 0 && (
                  <ul className="text-sm mt-2">
                    {s.payload.top3
                      .slice()
                      .sort((a, b) => a.position - b.position)
                      .map((r) => (
                        <li key={r.position}>
                          #{r.position}: {r.name}
                          {r.country ? ` (${r.country})` : ""}
                          {r.instagram ? ` · 📸 ${r.instagram}` : ""}
                        </li>
                      ))}
                  </ul>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Submitted by user: {s.submitted_by_user_id ?? "unknown"}
                </p>
              </div>
              <button
                onClick={() => approve(s.id)}
                disabled={busy === s.id}
                className="bg-green-600 text-white rounded px-3 py-2 disabled:opacity-60"
              >
                {busy === s.id ? "Approving…" : "✅ Approve"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
