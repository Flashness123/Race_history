"use client";
import { useEffect, useState } from "react";
import ClickableRiderName from "@/components/ClickableRiderName";
import { getEventYearLabel } from "@/lib/event-completeness";

type Top3 = { name: string; country?: string; instagram?: string; position: number };

type PendingItem = {
  id: number;
  submitted_by_user_id: number | null;
  submitted_by_name: string;
  submitted_by_email: string;
  submission_type: string;
  payload: {
    name: string; 
    year: number; 
    location: string; 
    lat: number; 
    lng: number;
    category: string;
    date_from?: string;
    date_to?: string;
    event_description?: string;
    source_url?: string; 
    top_riders_open?: Top3[];
    top_riders_luge?: Top3[];
    top_riders_woman?: Top3[];
    top_qualifiers?: Top3[];
    track_record_open?: { name: string; time: string };
    track_record_luge?: { name: string; time: string };
    track_record_woman?: { name: string; time: string };
    organizer_name?: string;
    links?: { name: string; url: string }[];
    spot_notes?: string;
    is_edit?: boolean;
    editing_event_id?: number;
  };
};

type User = {
  id: number; email: string; name?: string | null;
  role: "OWNER" | "ADMIN" | "USER";
  is_active: boolean; can_submit: boolean;
};

type Race = {
  id: number; name: string; year: number;
  location: string;
  lat: number;
  lng: number;
  source_url?: string;
  image_url?: string | null;
  category?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  organizer_name?: string | null;
  track_record_open_name?: string | null;
  track_record_open_time?: string | null;
  track_record_luge_name?: string | null;
  track_record_luge_time?: string | null;
  track_record_woman_name?: string | null;
  track_record_woman_time?: string | null;
  description?: string | null;
  spot_notes?: string | null;
};

export default function AdminPage() {
  // Pending submissions
  const [items, setItems] = useState<PendingItem[]>([]);
  // Users
  const [users, setUsers] = useState<User[]>([]);
  // Races
  const [races, setRaces] = useState<Race[]>([]);
  const [raceYear, setRaceYear] = useState<number | "">("");
  const [raceBusy, setRaceBusy] = useState<number | null>(null);
  
  // Collapsible sections state
  const [isRacesCollapsed, setIsRacesCollapsed] = useState(false);
  const [isPendingCollapsed, setIsPendingCollapsed] = useState(false);
  const [isUsersCollapsed, setIsUsersCollapsed] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [userBusy, setUserBusy] = useState<number | null>(null);

  // ---- API helpers (proxy routes) ----
  async function loadCore() {
    setLoading(true); setErr(null);
    try {
      const [subsRes, usersRes] = await Promise.all([
        fetch("/api/admin/submissions", { cache: "no-store" }),
        fetch("/api/admin/users", { cache: "no-store" }),
      ]);
      const subsData = await subsRes.json();
      const usersData = await usersRes.json();
      if (!subsRes.ok) throw new Error(subsData?.error || `Subs failed (${subsRes.status})`);
      if (!usersRes.ok) throw new Error(usersData?.error || `Users failed (${usersRes.status})`);
      setItems(subsData);
      setUsers(usersData);
    } catch (e: any) {
      setErr(e.message);
      setItems([]); setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadRaces() {
    const params = raceYear ? `?year=${raceYear}` : "";
    const res = await fetch(`/api/admin/races${params}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || `Failed to load races (${res.status})`);
      setRaces([]);
      return;
    }
    setRaces(data);
  }

  async function approve(id: number) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}/approve`, { method: "POST" });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) { alert(data?.error || `Approve failed (${res.status})`); return; }
      setItems(prev => prev.filter(x => x.id !== id));
    } finally {
      setBusyId(null);
    }
  }
  async function deleteSubmission(id: number) {
    if (!confirm("Delete this submission permanently? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) {
      alert(data?.error || `Delete failed (${res.status})`);
      return;
    }
    setItems(prev => prev.filter(x => x.id !== id));
  }

  async function deleteRace(id: number, name: string) {
    if (!confirm(`Delete "${name}" permanently? This cannot be undone.`)) return;
    setRaceBusy(id);
    const res = await fetch(`/api/admin/races/${id}`, { method: "DELETE" });
    const data = await res.json().catch(()=>({}));
    setRaceBusy(null);
    if (!res.ok) { alert(data?.error || `Delete failed (${res.status})`); return; }
    setRaces(prev => prev.filter(r => r.id !== id));
  }

  async function updateUser(id: number, patch: Partial<Pick<User, "role"|"can_submit"|"is_active">>) {
    setUserBusy(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) { alert(data?.error || `Update failed (${res.status})`); return; }
      setUsers(prev => prev.map(u => u.id === id ? data : u));
    } finally {
      setUserBusy(null);
    }
  }

  // initial loads
  useEffect(() => { loadCore(); }, []);
  useEffect(() => { loadRaces(); }, [raceYear]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">⚙️</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage submissions, users, and races</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading admin data...</p>
            </div>
          </div>
        )}
        
        {err && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm">⚠</span>
              </div>
              <p className="text-red-800 font-medium">{err}</p>
            </div>
          </div>
        )}

        {!loading && !err && (
          <div className="space-y-12">

            {/* Races Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🏁</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Races</h2>
                  {races.length > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {races.length} races
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsRacesCollapsed(!isRacesCollapsed)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title={isRacesCollapsed ? "Expand section" : "Collapse section"}
                >
                  <span className={`text-xl transition-transform duration-200 ${isRacesCollapsed ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
              </div>
              
              {!isRacesCollapsed && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                <label className="text-sm font-medium text-gray-700">Year filter:</label>
                <input
                  type="number"
                  placeholder="(all)"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-32"
                  value={raceYear}
                  onChange={(e) => setRaceYear(e.target.value ? Number(e.target.value) as number : "")}
                />
                <button 
                  onClick={loadRaces} 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Reload
                </button>
              </div>

              {races.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏁</span>
                  </div>
                  <p className="text-gray-600">No races found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {races.map(r => (
                    <div key={r.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <img 
                        src={r.image_url ? `${process.env.NEXT_PUBLIC_API_BASE}${r.image_url}` : "/file.svg"} 
                        className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 shadow-sm" 
                        alt={r.name} 
                      />
                      
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">
                          {r.name} <span className="text-gray-500">({r.year})</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          📍 {r.location} · {r.lat}, {r.lng}
                        </div>
                        {r.source_url && (
                          <div className="text-sm">
                            <a className="text-blue-600 hover:text-blue-700 underline" href={r.source_url} target="_blank" rel="noopener noreferrer">
                              🔗 View source
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer">
                          <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium">
                            📷 Change image
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const fd = new FormData();
                              fd.append("file", file);
                              const res = await fetch(`/api/uploads/event-image/${r.id}`, { method: "POST", body: fd });
                              const data = await res.json();
                              if (!res.ok) { alert(data?.error || "Upload failed"); return; }
                              setRaces(prev => prev.map(x => x.id === r.id ? { ...x, image_url: data.image_url } : x));
                            }}
                          />
                        </label>
                        <button
                          onClick={() => {
                            // Navigate to submit page with prefilled data for editing
                            const params = new URLSearchParams({
                              edit: 'true',
                              eventId: r.id.toString(),
                              name: r.name || '',
                              location: r.location || '',
                              lat: r.lat?.toString() || '',
                              lng: r.lng?.toString() || '',
                              category: r.category || 'WDSC',
                              date_from: r.date_from || '',
                              date_to: r.date_to || '',
                              source_url: r.source_url || '',
                              event_description: r.description || '',
                              track_record_open_name: r.track_record_open_name || '',
                              track_record_open_time: r.track_record_open_time || '',
                              track_record_luge_name: r.track_record_luge_name || '',
                              track_record_luge_time: r.track_record_luge_time || '',
                              track_record_woman_name: r.track_record_woman_name || '',
                              track_record_woman_time: r.track_record_woman_time || '',
                              organizer_name: r.organizer_name || '',
                              spot_notes: r.spot_notes || '',
                            });
                            window.open(`/submit?${params.toString()}`, '_blank');
                          }}
                          className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors duration-200 text-sm font-medium"
                        >
                          ✏️ Edit Event
                        </button>
                        <button
                          onClick={() => deleteRace(r.id, r.name)}
                          disabled={raceBusy === r.id}
                          className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {raceBusy === r.id ? "Deleting…" : "🗑 Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
                </>
              )}
            </div>

            {/* Pending Submissions Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">⏳</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Pending Submissions</h2>
                  {items.length > 0 && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {items.length} pending
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsPendingCollapsed(!isPendingCollapsed)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title={isPendingCollapsed ? "Expand section" : "Collapse section"}
                >
                  <span className={`text-xl transition-transform duration-200 ${isPendingCollapsed ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
              </div>
              
              {!isPendingCollapsed && (
                <>
                  {items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-gray-600">No pending submissions.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((s) => {
                    const submissionYear = getEventYearLabel(
                      s.payload.date_from,
                      s.payload.year
                    );
                    const sourceUrl =
                      s.payload.links?.[0]?.url || s.payload.source_url || "";

                    return (
                    <div key={s.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-start gap-6">
                        <div className="flex-1 space-y-4">
                          {/* Event Header */}
                          <div>
                            <div className="font-semibold text-lg text-gray-900 mb-2">
                              {s.payload.name}{" "}
                              {submissionYear && (
                                <span className="text-gray-500">({submissionYear})</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span>📍 {s.payload.location}</span>
                              <span>•</span>
                              <span>{s.payload.lat}, {s.payload.lng}</span>
                              <span>•</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                s.payload.category === 'WDSC' ? 'bg-orange-100 text-orange-800' :
                                s.payload.category === 'EURO' ? 'bg-blue-100 text-blue-800' :
                                s.payload.category === 'FREERIDE' ? 'bg-green-100 text-green-800' :
                                s.payload.category === 'IDF' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {s.payload.category}
                              </span>
                            </div>
                            {s.payload.date_from && (
                              <div className="text-sm text-gray-600">
                                📅 {new Date(s.payload.date_from).toLocaleDateString()}
                                {s.payload.date_to && ` - ${new Date(s.payload.date_to).toLocaleDateString()}`}
                              </div>
                            )}
                            
                            {/* Submission Type Badge */}
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                s.submission_type === 'EDIT' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {s.submission_type === 'EDIT' ? '✏️ Edit Submission' : '🆕 New Submission'}
                              </span>
                            </div>
                          </div>

                          {/* Links */}
                          {s.payload.links && s.payload.links.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-2">Links:</div>
                              <div className="space-y-1">
                                {s.payload.links.map((link, idx) => (
                                  <div key={idx} className="text-sm">
                                    <a className="text-blue-600 hover:text-blue-700 underline" href={link.url} target="_blank" rel="noopener noreferrer">
                                      🔗 {link.name}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Spot Notes */}
                          {s.payload.spot_notes && (
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-2">Spot Information:</div>
                              <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                                {s.payload.spot_notes}
                              </div>
                            </div>
                          )}

                          {s.payload.event_description && (
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-2">Event Description:</div>
                              <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border whitespace-pre-wrap">
                                {s.payload.event_description}
                              </div>
                            </div>
                          )}

                          {/* Results by Category */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Open Results */}
                            {s.payload.top_riders_open && s.payload.top_riders_open.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-2">🏆 Open Results:</div>
                                <div className="space-y-1">
                                  {s.payload.top_riders_open
                                    .slice()
                                    .sort((a,b)=>a.position-b.position)
                                    .map(r=>(
                                      <div key={r.position} className="flex items-center gap-2 text-sm">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                          r.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                          r.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                          'bg-gradient-to-br from-orange-400 to-orange-600'
                                        }`}>
                                          {r.position}
                                        </div>
                                        <ClickableRiderName name={r.name} className="font-medium hover:text-blue-600 transition-colors duration-200" />
                                        {r.country && <span className="text-gray-500">({r.country})</span>}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* Luge Results */}
                            {s.payload.top_riders_luge && s.payload.top_riders_luge.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-2">🛷 Luge Results:</div>
                                <div className="space-y-1">
                                  {s.payload.top_riders_luge
                                    .slice()
                                    .sort((a,b)=>a.position-b.position)
                                    .map(r=>(
                                      <div key={r.position} className="flex items-center gap-2 text-sm">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                          r.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                          r.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                          'bg-gradient-to-br from-orange-400 to-orange-600'
                                        }`}>
                                          {r.position}
                                        </div>
                                        <ClickableRiderName name={r.name} className="font-medium hover:text-blue-600 transition-colors duration-200" />
                                        {r.country && <span className="text-gray-500">({r.country})</span>}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* Women Results */}
                            {s.payload.top_riders_woman && s.payload.top_riders_woman.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-2">👩 Women Results:</div>
                                <div className="space-y-1">
                                  {s.payload.top_riders_woman
                                    .slice()
                                    .sort((a,b)=>a.position-b.position)
                                    .map(r=>(
                                      <div key={r.position} className="flex items-center gap-2 text-sm">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                          r.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                          r.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                          'bg-gradient-to-br from-orange-400 to-orange-600'
                                        }`}>
                                          {r.position}
                                        </div>
                                        <ClickableRiderName name={r.name} className="font-medium hover:text-blue-600 transition-colors duration-200" />
                                        {r.country && <span className="text-gray-500">({r.country})</span>}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* Qualifiers */}
                            {s.payload.top_qualifiers && s.payload.top_qualifiers.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-2">🎯 Qualifiers ({s.payload.top_qualifiers.length}):</div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {s.payload.top_qualifiers
                                    .slice()
                                    .sort((a,b)=>a.position-b.position)
                                    .map(r=>(
                                      <div key={r.position} className="flex items-center gap-2 text-sm">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-green-500 to-teal-600">
                                          Q{r.position}
                                        </div>
                                        <ClickableRiderName name={r.name} className="font-medium hover:text-blue-600 transition-colors duration-200" />
                                        {r.country && <span className="text-gray-500">({r.country})</span>}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Track Records */}
                          {(s.payload.track_record_open || s.payload.track_record_luge || s.payload.track_record_woman) && (
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-2">⏱️ Track Records:</div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {s.payload.track_record_open && (
                                  <div className="bg-white p-3 rounded-lg border text-sm">
                                    <div className="font-medium text-gray-700">Open:</div>
                                    <div>{s.payload.track_record_open.name} - {s.payload.track_record_open.time}</div>
                                  </div>
                                )}
                                {s.payload.track_record_luge && (
                                  <div className="bg-white p-3 rounded-lg border text-sm">
                                    <div className="font-medium text-gray-700">Luge:</div>
                                    <div>{s.payload.track_record_luge.name} - {s.payload.track_record_luge.time}</div>
                                  </div>
                                )}
                                {s.payload.track_record_woman && (
                                  <div className="bg-white p-3 rounded-lg border text-sm">
                                    <div className="font-medium text-gray-700">Women:</div>
                                    <div>{s.payload.track_record_woman.name} - {s.payload.track_record_woman.time}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Organizer */}
                          {s.payload.organizer_name && (
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-2">👤 Organizer:</div>
                              <div className="bg-white p-3 rounded-lg border text-sm">
                                <ClickableRiderName 
                                  name={s.payload.organizer_name} 
                                  className="text-blue-600 hover:text-blue-700 hover:underline"
                                />
                              </div>
                            </div>
                          )}

                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm font-medium text-blue-900 mb-1">Submitted by:</div>
                            <div className="text-sm text-blue-800">
                              <div className="font-medium">{s.submitted_by_name}</div>
                              <div className="text-blue-600">{s.submitted_by_email}</div>
                              <div className="text-xs text-blue-500">User ID: {s.submitted_by_user_id}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => approve(s.id)}
                            disabled={busyId === s.id}
                            className="px-6 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                          >
                            {busyId === s.id ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                                <span>Approving…</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>✅</span>
                                <span>Approve</span>
                              </div>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              // Navigate to submit page with prefilled data for editing pending submission
                              const params = new URLSearchParams({
                                edit: 'true',
                                eventId: s.payload.is_edit ? s.payload.editing_event_id?.toString() || '' : '',
                                name: s.payload.name || '',
                                location: s.payload.location || '',
                                lat: s.payload.lat?.toString() || '',
                                lng: s.payload.lng?.toString() || '',
                                category: s.payload.category || 'WDSC',
                                date_from: s.payload.date_from || '',
                                date_to: s.payload.date_to || '',
                                source_url: sourceUrl,
                                event_description: s.payload.event_description || '',
                                track_record_open_name: s.payload.track_record_open?.name || '',
                                track_record_open_time: s.payload.track_record_open?.time || '',
                                track_record_luge_name: s.payload.track_record_luge?.name || '',
                                track_record_luge_time: s.payload.track_record_luge?.time || '',
                                track_record_woman_name: s.payload.track_record_woman?.name || '',
                                track_record_woman_time: s.payload.track_record_woman?.time || '',
                                organizer_name: s.payload.organizer_name || '',
                                spot_notes: s.payload.spot_notes || '',
                              });
                              
                              // Add rider data
                              if (s.payload.top_riders_open && s.payload.top_riders_open.length > 0) {
                                s.payload.top_riders_open.forEach((rider: any, index: number) => {
                                  params.append(`open_${index}_name`, rider.name);
                                  params.append(`open_${index}_position`, rider.position.toString());
                                  if (rider.country) params.append(`open_${index}_country`, rider.country);
                                });
                              }
                              
                              if (s.payload.top_riders_luge && s.payload.top_riders_luge.length > 0) {
                                s.payload.top_riders_luge.forEach((rider: any, index: number) => {
                                  params.append(`luge_${index}_name`, rider.name);
                                  params.append(`luge_${index}_position`, rider.position.toString());
                                  if (rider.country) params.append(`luge_${index}_country`, rider.country);
                                });
                              }
                              
                              if (s.payload.top_riders_woman && s.payload.top_riders_woman.length > 0) {
                                s.payload.top_riders_woman.forEach((rider: any, index: number) => {
                                  params.append(`woman_${index}_name`, rider.name);
                                  params.append(`woman_${index}_position`, rider.position.toString());
                                  if (rider.country) params.append(`woman_${index}_country`, rider.country);
                                });
                              }
                              
                              if (s.payload.top_qualifiers && s.payload.top_qualifiers.length > 0) {
                                s.payload.top_qualifiers.forEach((rider: any, index: number) => {
                                  params.append(`qualifier_${index}_name`, rider.name);
                                  params.append(`qualifier_${index}_position`, rider.position.toString());
                                  if (rider.country) params.append(`qualifier_${index}_country`, rider.country);
                                });
                              }
                              
                              // Add submission ID for reference
                              params.append('submissionId', s.id.toString());
                              
                              window.open(`/submit?${params.toString()}`, '_blank');
                            }}
                            className="px-6 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors duration-200 font-medium"
                            title="Edit submission details before approving"
                          >
                            <div className="flex items-center gap-2">
                              <span>✏️</span>
                              <span>Edit Submission</span>
                            </div>
                          </button>
                          <button
                            onClick={() => deleteSubmission(s.id)}
                            className="px-6 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium"
                            title="Hard delete submission"
                          >
                            <div className="flex items-center gap-2">
                              <span>🗑</span>
                              <span>Delete</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              )}
                </>
              )}
            </div>

            {/* Users Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">👥</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Users</h2>
                  {users.length > 0 && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {users.length} users
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsUsersCollapsed(!isUsersCollapsed)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title={isUsersCollapsed ? "Expand section" : "Collapse section"}
                >
                  <span className={`text-xl transition-transform duration-200 ${isUsersCollapsed ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
              </div>
              
              {!isUsersCollapsed && (
                <>
                  {users.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <p className="text-gray-600">No users found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">
                          {u.name || "(no name)"} · {u.email}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.role === 'OWNER' ? 'bg-red-100 text-red-800' :
                            u.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {u.role}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.can_submit ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {u.can_submit ? 'Can Submit' : 'Cannot Submit'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                            u.can_submit 
                              ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                          disabled={userBusy === u.id}
                          onClick={() => updateUser(u.id, { can_submit: !u.can_submit })}
                        >
                          {u.can_submit ? "Disable Submit" : "Enable Submit"}
                        </button>
                        <select
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          disabled={userBusy === u.id}
                          value={u.role}
                          onChange={(e) => updateUser(u.id, { role: e.target.value as User["role"] })}
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="OWNER">OWNER</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
