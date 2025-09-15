"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Riders() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/bio/riders", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) { setErr(data?.error || "Failed to load"); return; }
      setRows(data);
    })();
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-bold">Riders</h1>
      {err && <p className="text-red-700">{err}</p>}
      <div className="grid gap-2">
        {rows.map((r) => (
          <Link key={r.id} href={`/riders/${r.id}`} className="border rounded p-3 hover:bg-gray-50 flex items-center gap-3">
            {r.profile_image_url ? (
              <img src={r.profile_image_url} alt="profile" className="w-10 h-10 rounded-full object-cover border" />
            ) : (
              <img src="/static/uploads/profiles/default_avatar.jpg" alt="profile" className="w-10 h-10 rounded-full object-cover border" />
            )}
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-sm text-gray-600">Nationality: {r.nationality || "—"} · Achievements: {r.achievements_count}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
