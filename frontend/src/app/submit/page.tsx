"use client";
import { useState } from "react";
import MapPicker from "@/components/MapPicker";

type Rider = { 
  name: string; 
  country?: string; 
  position: number;
  instagram?: string;
};

export default function Submit() {
  const [form, setForm] = useState({
    name: "",
    year: new Date().getFullYear(),
    location: "",
    lat: 50.08804,
    lng: 14.42076,
    source_url: "",
    instagram: "",   // ✅ added Instagram
    top3: [
      { name: "", country: "", position: 1 },
      { name: "", country: "", position: 2 },
      { name: "", country: "", position: 3 },
    ] as Rider[],
  });
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function setRider(i: number, patch: Partial<Rider>) {
    const next = [...form.top3];
    next[i] = { ...next[i], ...patch };
    setForm({ ...form, top3: next });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data?.error || "Failed");
      return;
    }
    setOk(`Submitted #${data.id}. Awaiting approval.`);
  }

  return (
    <main className="max-w-2xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-bold">Submit a race</h1>
      <form onSubmit={onSubmit} className="grid gap-4">
        {/* Race Name */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Race name</label>
          <input
            className="border rounded p-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Top 3 Riders */}
        <div className="grid gap-3">
          <div className="font-medium">Top 3 riders</div>
          {[0,1,2].map((i)=>(
            <div key={i} className="grid grid-cols-[60px_1fr_120px_1fr] gap-2 items-center">
              <span className="text-sm">#{i+1}</span>
              <input
                className="border rounded p-2"
                placeholder="Full name"
                value={form.top3[i].name}
                onChange={(e)=>setRider(i,{name:e.target.value})}
              />
              <input
                className="border rounded p-2"
                placeholder="Country (ISO-2)"
                value={form.top3[i].country||""}
                onChange={(e)=>setRider(i,{country:e.target.value})}
              />
              <input
                className="border rounded p-2"
                placeholder="Instagram (optional)"
                value={form.top3[i].instagram||""}
                onChange={(e)=>setRider(i,{instagram:e.target.value})}
              />
            </div>
          ))}
        </div>

        {/* Year + Location */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Year</label>
            <input
              type="number"
              className="border rounded p-2"
              value={form.year}
              onChange={(e) =>
                setForm({ ...form, year: Number(e.target.value) })
              }
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Location (text)</label>
            <input
              className="border rounded p-2"
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
            />
          </div>
        </div>

        {/* Lat/Lng inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Latitude</label>
            <input
              type="number"
              step="any"
              className="border rounded p-2"
              value={form.lat}
              onChange={(e) =>
                setForm({ ...form, lat: Number(e.target.value) })
              }
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Longitude</label>
            <input
              type="number"
              step="any"
              className="border rounded p-2"
              value={form.lng}
              onChange={(e) =>
                setForm({ ...form, lng: Number(e.target.value) })
              }
            />
          </div>
        </div>

        {/* Map Picker */}
        <MapPicker
          lat={form.lat}
          lng={form.lng}
          onPick={(lat, lng) => setForm({ ...form, lat, lng })}
        />

        {/* Source URL */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Source URL (optional)</label>
          <input
            className="border rounded p-2"
            value={form.source_url}
            onChange={(e) =>
              setForm({ ...form, source_url: e.target.value })
            }
          />
        </div>

        {/* Submit button */}
        <button className="bg-black text-white rounded p-2">Submit</button>
      </form>

      {/* Feedback */}
      {ok && <p className="text-green-700">{ok}</p>}
      {err && <p className="text-red-700">{err}</p>}
    </main>
  );
}
