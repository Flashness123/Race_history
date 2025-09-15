"use client";
import { useState } from "react";
import MapPicker from "@/components/MapPicker";

type Rider = { name: string; country?: string; instagram?: string; position: number };

export default function Submit() {
  const [form, setForm] = useState({
    name: "",
    year: new Date().getFullYear(),
    location: "",
    lat: 50.08804,
    lng: 14.42076,
    event_url: "",
    youtube_url: "",
    is_future: false,
    date_from: new Date().toISOString().slice(0,10),
    date_to: "",
    top3: [
      { name: "", country: "", instagram: "", position: 1 },
      { name: "", country: "", instagram: "", position: 2 },
      { name: "", country: "", instagram: "", position: 3 },
    ] as Rider[],
  });
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [nameOptions, setNameOptions] = useState<string[][]>([[],[],[]]);
  const [nameBusy, setNameBusy] = useState([false,false,false]);

  // IMPORTANT: functional updater, so we never lose other fields
  function setRider(i: number, patch: Partial<Rider>) {
    setForm(prev => {
      const next = [...prev.top3];
      next[i] = { ...next[i], ...patch };
      return { ...prev, top3: next };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setBusy(true);
    try {
      // Convert date strings to proper format for backend
      const payload = {
        ...form,
        date_from: form.date_from || undefined,
        date_to: form.date_to || undefined,
      };
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || "Failed");
        return;
      }
      setOk(`Submitted #${data.id}. Awaiting approval.`);
    } catch (e: any) {
      setErr(e.message || "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-bold">Submit a race</h1>
      <form onSubmit={onSubmit} className="grid gap-4">
        {/* Past vs Future */}
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="kind" checked={!form.is_future} onChange={()=>setForm(prev=>({...prev, is_future:false}))} />
            Past event
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="kind" checked={form.is_future} onChange={()=>setForm(prev=>({...prev, is_future:true}))} />
            Future event
          </label>
        </div>
        {/* Race Name */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Race name</label>
          <input
            className="border rounded p-2"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
          />
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
                setForm(prev => ({ ...prev, year: Number(e.target.value) }))
              }
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Location (text)</label>
            <input
              className="border rounded p-2"
              value={form.location}
              onChange={(e) =>
                setForm(prev => ({ ...prev, location: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Event date(s) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Event date (start)</label>
            <input
              type="date"
              className="border rounded p-2"
              value={form.date_from}
              required
              onChange={(e) => {
                const v = e.target.value;
                setForm(prev => ({ ...prev, date_from: v, year: v ? Number(v.slice(0,4)) : prev.year }));
              }}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Event date (end, optional)</label>
            <input
              type="date"
              className="border rounded p-2"
              value={form.date_to}
              onChange={(e) => setForm(prev => ({ ...prev, date_to: e.target.value }))}
            />
          </div>
        </div>

        {/* Map Picker — functional updater onPick */}
        <MapPicker
          lat={form.lat}
          lng={form.lng}
          onPick={(lat, lng) => setForm(prev => ({ ...prev, lat, lng }))}
        />

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
                setForm(prev => ({ ...prev, lat: Number(e.target.value) }))
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
                setForm(prev => ({ ...prev, lng: Number(e.target.value) }))
              }
            />
          </div>
        </div>

        {/* URLs */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Event page URL (optional)</label>
          <input
            className="border rounded p-2"
            value={form.event_url}
            onChange={(e) =>
              setForm(prev => ({ ...prev, event_url: e.target.value }))
            }
          />
        </div>
        {!form.is_future && (
          <div className="grid gap-2">
            <label className="text-sm font-medium">YouTube URL (optional)</label>
            <input
              className="border rounded p-2"
              value={form.youtube_url}
              onChange={(e) => setForm(prev => ({ ...prev, youtube_url: e.target.value }))}
            />
          </div>
        )}

        {/* Top 3 Riders */}
        {!form.is_future && (
        <div className="grid gap-3">
          <div className="font-medium">Top 3 riders</div>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="grid grid-cols-[60px_1fr_120px_1fr] gap-2 items-center"
            >
              <span className="text-sm">#{i + 1}</span>
              <input
                className="border rounded p-2"
                placeholder="Full name"
                value={form.top3[i].name}
                onChange={async (e) => {
                  const v = e.target.value; setRider(i, { name: v });
                  if (v.length >= 2) {
                    setNameBusy(prev => prev.map((b, idx) => idx===i ? true : b) as any);
                    try {
                      const res = await fetch(`/api/bio/riders/search?q=${encodeURIComponent(v)}`);
                      const data = await res.json();
                      const arr = Array.isArray(data) ? data : [];
                      const opts = arr.map((x: any) => x?.name).filter(Boolean);
                      setNameOptions(prev => prev.map((arr, idx) => idx===i ? opts : arr) as any);
                    } finally {
                      setNameBusy(prev => prev.map((b, idx) => idx===i ? false : b) as any);
                    }
                  } else {
                    setNameOptions(prev => prev.map((arr, idx) => idx===i ? [] : arr) as any);
                  }
                }}
              />
              {nameOptions[i]?.length > 0 && (
                <div className="col-span-3 -mt-1 ml-[60px] bg-white border rounded shadow p-2 z-10">
                  <ul className="text-sm">
                    {nameOptions[i].map((n, idx) => (
                      <li key={idx}>
                        <button type="button" className="w-full text-left hover:bg-gray-50 px-1 py-0.5" onClick={() => { setRider(i, { name: n }); setNameOptions(prev => prev.map((arr, j) => j===i ? [] : arr) as any); }}>
                          {n}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <input
                className="border rounded p-2"
                placeholder="Country (ISO-2)"
                value={form.top3[i].country || ""}
                onChange={(e) => setRider(i, { country: e.target.value })}
              />
              <input
                className="border rounded p-2"
                placeholder="Instagram (optional)"
                value={form.top3[i].instagram || ""}
                onChange={(e) => setRider(i, { instagram: e.target.value })}
              />
            </div>
          ))}
        </div>
        )}

        {/* Submit button */}
        <button
          className="bg-black text-white rounded p-2 disabled:opacity-60"
          disabled={busy}
        >
          {busy ? "Submitting…" : "Submit"}
        </button>
      </form>

      {/* Feedback */}
      {ok && <p className="text-green-700">{ok}</p>}
      {err && <p className="text-red-700">{err}</p>}
    </main>
  );
}
