"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type AllRider = {
  id: number | null;
  person_id: number;
  name: string;
  nationality: string | null;
  achievements_count: number;
  profile_image_url: string | null;
  is_registered: boolean;
  user_id: number | null;
};

export default function Riders() {
  const [rows, setRows] = useState<AllRider[]>([]);
  const [filtered, setFiltered] = useState<AllRider[]>([]);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/bio/riders/all", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) { setErr(data?.error || "Failed to load"); return; }
      setRows(data);
      setFiltered(data);
    })();
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(rows); return; }
    const q = search.toLowerCase();
    setFiltered(rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.nationality && r.nationality.toLowerCase().includes(q))
    ));
  }, [search, rows]);

  return (
    <main className="max-w-4xl mx-auto p-6 grid gap-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>Riders</h1>
        <p className="mt-2" style={{ color: "var(--muted)" }}>
          All riders who have participated in races, including those who haven't registered accounts yet.
        </p>
      </div>

      <div className="grid gap-2">
        <input
          type="text"
          placeholder="Search riders by name or nationality..."
          className="rounded p-2"
          style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--paper)" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {err && <p style={{ color: "var(--accent)" }}>{err}</p>}

      <div className="grid gap-2">
        {filtered.length === 0 && search ? (
          <p style={{ color: "var(--muted)" }}>No riders found matching "{search}"</p>
        ) : (
          filtered.map((r) => (
            <div key={`${r.person_id}-${r.is_registered ? 'registered' : 'unregistered'}`}
              className="rounded p-3 transition-colors"
              style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
              {r.is_registered ? (
                <Link href={`/riders/${r.user_id}`} className="block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{r.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium" style={{ color: "var(--paper)" }}>{r.name}</div>
                      <div className="text-sm" style={{ color: "var(--muted)" }}>
                        Nationality: {r.nationality || "—"} · Achievements: {r.achievements_count}
                      </div>
                    </div>
                    <div className="text-xs font-medium" style={{ color: "#4ade80" }}>Registered</div>
                  </div>
                </Link>
              ) : (
                <Link href={`/riders/person/${r.person_id}`} className="block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                      <span className="text-sm font-bold" style={{ color: "var(--muted)" }}>{r.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium" style={{ color: "var(--paper)" }}>{r.name}</div>
                      <div className="text-sm" style={{ color: "var(--muted)" }}>Achievements: {r.achievements_count}</div>
                      <div className="text-xs font-medium mt-1" style={{ color: "#f59e0b" }}>
                        This rider has not made an account yet
                      </div>
                    </div>
                    <div className="text-xs font-medium" style={{ color: "var(--muted)" }}>Unregistered</div>
                  </div>
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
