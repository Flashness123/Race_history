"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function RiderProfile() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const params = useParams<{ id: string }>();
  const id = (params?.id as string) || "";

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/bio/riders/${id}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) { setErr(json?.error || "Failed to load"); return; }
      setData(json);
    })();
  }, [id]);

  if (err) return <main className="max-w-3xl mx-auto p-6">{err}</main>;
  if (!data) return <main className="max-w-3xl mx-auto p-6">Loading…</main>;

  return (
    <main className="max-w-3xl mx-auto p-6 grid gap-6">
      <div className="flex items-center gap-4">
        <img
          src={data.profile_image_url ? `${process.env.NEXT_PUBLIC_API_BASE}${data.profile_image_url}` : "/file.svg"}
          alt={data.name}
          className="w-20 h-20 rounded-full object-cover border"
        />
        <h1 className="text-2xl font-bold">{data.name}</h1>
      </div>
      <section className="grid gap-1">
        <div><b>Nationality:</b> {data.nationality || "—"}</div>
        <div><b>Place of birth:</b> {data.place_of_birth || "—"}</div>
        <div><b>Date of birth:</b> {data.date_of_birth || "—"}</div>
        <div><b>Message:</b> {data.message || "—"}</div>
      </section>
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
