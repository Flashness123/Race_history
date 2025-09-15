"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Riders() {
  const [rows, setRows] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/bio/riders", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) { setErr(data?.error || "Failed to load"); return; }
      setRows(data);
      setFiltered(data);
    })();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(rows);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(rows.filter(r => 
      r.name.toLowerCase().includes(q) || 
      (r.nationality && r.nationality.toLowerCase().includes(q))
    ));
  }, [search, rows]);

  return (
    <main className="max-w-4xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-bold">Riders</h1>
      
      {/* Search */}
      <div className="grid gap-2">
        <input
          type="text"
          placeholder="Search riders by name or nationality..."
          className="border rounded p-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {err && <p className="text-red-700">{err}</p>}
      
      <div className="grid gap-2">
        {filtered.length === 0 && search ? (
          <p className="text-gray-600">No riders found matching "{search}"</p>
        ) : (
          filtered.map((r) => (
            <Link key={r.id} href={`/riders/${r.id}`} className="border rounded p-3 hover:bg-gray-50">
              <div className="font-medium">{r.name}</div>
              <div className="text-sm text-gray-600">Nationality: {r.nationality || "—"} · Achievements: {r.achievements_count}</div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
