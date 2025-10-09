"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MapPicker from "@/components/MapPicker";

type Rider = { name: string; country?: string; instagram?: string; position: number };

export default function Submit() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    year: new Date().getFullYear(),
    location: "",
    lat: 50.08804,
    lng: 14.42076,
    category: "WDSC",
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

  // No authentication check on page load - let the submit handle it

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
        date_from: form.date_from || new Date().toISOString().slice(0,10),
        date_to: form.date_to || null,
      };
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        setErr(`Server error: ${res.status} ${res.statusText}`);
        return;
      }
      
      if (!res.ok) {
        if (res.status === 401) {
          setErr("Please sign in to submit races");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setErr(data?.error || `Failed: ${res.status}`);
        }
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Submit a Race
          </h1>
          <p className="text-gray-600">Share your race with the community</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Event Type Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Type</h2>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="kind" 
                  checked={!form.is_future} 
                  onChange={()=>setForm(prev=>({...prev, is_future:false}))}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏁</span>
                  <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">Past Event</span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="kind" 
                  checked={form.is_future} 
                  onChange={()=>setForm(prev=>({...prev, is_future:true}))}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">Future Event</span>
                </div>
              </label>
            </div>
          </div>
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-6">
              {/* Race Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Race Name</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter race name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Year + Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={form.year}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, year: Number(e.target.value) }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="City, Country"
                    value={form.location}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, location: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="WDSC">🏁 WDSC Event</option>
                  <option value="EURO">🌍 Euro Tour Event</option>
                  <option value="FREERIDE">🏄 Freeride Event</option>
                  <option value="SPOT">📍 Spot (not an event)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Event Dates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={form.date_from}
                  required
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm(prev => ({ ...prev, date_from: v, year: v ? Number(v.slice(0,4)) : prev.year }));
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date (optional)</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={form.date_to}
                  onChange={(e) => setForm(prev => ({ ...prev, date_to: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
            <div className="space-y-6">
              {/* Map Picker */}
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <MapPicker
                  lat={form.lat}
                  lng={form.lng}
                  onPick={(lat, lng) => setForm(prev => ({ ...prev, lat, lng }))}
                />
              </div>

              {/* Lat/Lng inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={form.lat}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, lat: Number(e.target.value) }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={form.lng}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, lng: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* URLs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Links</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Page URL (optional)</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://example.com/event"
                  value={form.event_url}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, event_url: e.target.value }))
                  }
                />
              </div>
              {!form.is_future && form.category !== "SPOT" && form.category !== "FREERIDE" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL (optional)</label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://youtube.com/watch?v=..."
                    value={form.youtube_url}
                    onChange={(e) => setForm(prev => ({ ...prev, youtube_url: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Top 3 Riders */}
          {!form.is_future && form.category !== "SPOT" && form.category !== "FREERIDE" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🏆</span>
                Top 3 Riders
              </h2>
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="relative">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">#{i + 1}</span>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                          <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                          {nameBusy[i] && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        
                        <input
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Country (ISO-2)"
                          value={form.top3[i].country || ""}
                          onChange={(e) => setRider(i, { country: e.target.value })}
                        />
                        
                        <input
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Instagram (optional)"
                          value={form.top3[i].instagram || ""}
                          onChange={(e) => setRider(i, { instagram: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    {nameOptions[i]?.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                        <ul className="py-2">
                          {nameOptions[i].map((n, idx) => (
                            <li key={idx}>
                              <button 
                                type="button" 
                                className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-900 transition-colors duration-200" 
                                onClick={() => { 
                                  setRider(i, { name: n }); 
                                  setNameOptions(prev => prev.map((arr, j) => j===i ? [] : arr) as any); 
                                }}
                              >
                                {n}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <button
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover-lift"
              disabled={busy}
            >
              {busy ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  <span>Submit Race</span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Feedback Messages */}
        {ok && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="text-green-800 font-medium">{ok}</p>
            </div>
          </div>
        )}
        
        {err && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm">⚠</span>
              </div>
              <p className="text-red-800 font-medium">{err}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
