"use client";
import { useCallback, useEffect, useState } from "react";
import Map from "@/components/Map";

export default function ClientSelected({ geojson }: { geojson: any }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSelect = useCallback((id: number | null) => {
    setSelectedId(id);
  }, []);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!selectedId) { setDetail(null); setErr(null); return; }
      setLoading(true); setErr(null);
      const res = await fetch(`/api/events/${selectedId}`, { cache: "no-store" });
      const data = await res.json();
      setLoading(false);
      if (!alive) return;
      if (!res.ok) { setErr(data?.error || "Failed to load"); setDetail(null); return; }
      setDetail(data);
    }
    load();
    return () => { alive = false; };
  }, [selectedId]);

  return (
    <div className="px-4">
      <div className={`grid gap-4 transition-[grid-template-columns] duration-200 ease-out`} style={{ gridTemplateColumns: selectedId ? "1fr 380px" : "1fr" }}>
        <Map geojson={geojson} onSelect={onSelect} />
        {selectedId && (
          <aside className="border rounded-lg p-4 h-[70vh] overflow-auto bg-white">
            {loading && <div>Loading…</div>}
            {err && <div className="text-red-600 text-sm">{err}</div>}
            {detail && (
              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <img src={detail.image_url ? `${process.env.NEXT_PUBLIC_API_BASE}${detail.image_url}` : "/file.svg"} className="w-16 h-16 rounded object-cover border" alt={detail.name} />
                  <div>
                    <div className="font-semibold">{detail.name}</div>
                    <div className="text-gray-600 text-sm">{detail.location} · {detail.year}</div>
                  </div>
                </div>
                {Array.isArray(detail.top3) && detail.top3.length > 0 && (
                  <div className="text-sm">
                    <div className="font-medium mb-1">Top 3</div>
                    <ol className="list-decimal ml-5 grid gap-0.5">
                      {detail.top3.map((p: any) => (
                        <li key={p.position}>#{p.position} {p.name}{p.country ? ` (${p.country})` : ""}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {detail.source_url && <a className="underline text-sm" href={detail.source_url} target="_blank">source</a>}
                <button className="justify-self-start px-2 py-1 border rounded" onClick={() => setSelectedId(null)}>Close</button>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}


