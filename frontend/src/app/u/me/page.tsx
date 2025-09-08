"use client";
import { useEffect, useState } from "react";

export default function MyBio() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/bio/me", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) { setErr(json?.error || "Failed to load"); return; }
      setData(json);
    })();
  }, []);

  if (err) return <main className="max-w-3xl mx-auto p-6">{err}</main>;
  if (!data) return <main className="max-w-3xl mx-auto p-6">Loading…</main>;

  return (
    <main className="max-w-3xl mx-auto p-6 grid gap-6">
      <h1 className="text-2xl font-bold">{data.name || "My Bio"}</h1>

      <section className="grid gap-2">
        <div className="font-semibold">Achievements</div>
        <div className="border rounded p-3 h-64 overflow-auto">
          {!data.achievements?.length ? (
            <div className="text-sm text-gray-600">No results yet.</div>
          ) : (
            <ul className="text-sm grid gap-1">
              {data.achievements.map((a: any, i: number) => (
                <li key={i}>
                  {a.year} · #{a.position} — {a.event_name} ({a.location})
                  {a.person_name ? <> · <span className="text-gray-500">{a.person_name}</span></> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
