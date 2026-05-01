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

type Report = {
  id: number;
  event_id: number;
  event_name: string;
  user_name: string;
  user_email: string;
  message: string;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  created_at: string;
  resolved_at: string | null;
};

type ContactMsg = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  created_at: string;
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
  // Reports
  const [reports, setReports] = useState<Report[]>([]);
  const [reportBusy, setReportBusy] = useState<number | null>(null);
  // Contact messages
  const [contactMessages, setContactMessages] = useState<ContactMsg[]>([]);
  const [contactBusy, setContactBusy] = useState<number | null>(null);

  // Collapsible sections state
  const [isRacesCollapsed, setIsRacesCollapsed] = useState(false);
  const [isPendingCollapsed, setIsPendingCollapsed] = useState(false);
  const [isUsersCollapsed, setIsUsersCollapsed] = useState(false);
  const [isReportsCollapsed, setIsReportsCollapsed] = useState(false);
  const [isContactCollapsed, setIsContactCollapsed] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [userBusy, setUserBusy] = useState<number | null>(null);

  // ---- API helpers (proxy routes) ----
  async function loadCore() {
    setLoading(true); setErr(null);
    try {
      const [subsRes, usersRes, reportsRes, contactRes] = await Promise.all([
        fetch("/api/admin/submissions", { cache: "no-store" }),
        fetch("/api/admin/users", { cache: "no-store" }),
        fetch("/api/admin/reports", { cache: "no-store" }),
        fetch("/api/admin/contact-messages", { cache: "no-store" }),
      ]);
      const subsData = await subsRes.json();
      const usersData = await usersRes.json();
      const reportsData = await reportsRes.json();
      const contactData = await contactRes.json();
      if (!subsRes.ok) throw new Error(subsData?.error || `Subs failed (${subsRes.status})`);
      if (!usersRes.ok) throw new Error(usersData?.error || `Users failed (${usersRes.status})`);
      if (!reportsRes.ok) throw new Error(reportsData?.error || `Reports failed (${reportsRes.status})`);
      if (!contactRes.ok) throw new Error(contactData?.error || `Contact failed (${contactRes.status})`);
      setItems(subsData);
      setUsers(usersData);
      setReports(reportsData);
      setContactMessages(contactData);
    } catch (e: any) {
      setErr(e.message);
      setItems([]); setUsers([]); setReports([]); setContactMessages([]);
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

  async function patchReport(id: number, status: "RESOLVED" | "DISMISSED") {
    setReportBusy(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data?.error || `Update failed (${res.status})`); return; }
      setReports(prev => prev.map(r => r.id === id ? { ...r, status, resolved_at: data.resolved_at } : r));
    } finally {
      setReportBusy(null);
    }
  }

  async function deleteReport(id: number) {
    if (!confirm("Delete this report permanently?")) return;
    setReportBusy(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || `Delete failed (${res.status})`);
        return;
      }
      setReports(prev => prev.filter(r => r.id !== id));
    } finally {
      setReportBusy(null);
    }
  }

  async function patchContact(id: number, status: "READ" | "ARCHIVED") {
    setContactBusy(id);
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data?.error || `Update failed (${res.status})`); return; }
      setContactMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    } finally {
      setContactBusy(null);
    }
  }

  async function deleteContact(id: number) {
    if (!confirm("Delete this message permanently?")) return;
    setContactBusy(id);
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || `Delete failed (${res.status})`);
        return;
      }
      setContactMessages(prev => prev.filter(m => m.id !== id));
    } finally {
      setContactBusy(null);
    }
  }

  // initial loads
  useEffect(() => { loadCore(); }, []);
  useEffect(() => { loadRaces(); }, [raceYear]);

  const inputStyle = { background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--paper)" };

  return (
    <main className="min-h-screen" style={{ background: "var(--ink)" }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">⚙️</span>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--paper)" }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "var(--muted)" }}>Manage submissions, users, and races</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}></div>
              <p style={{ color: "var(--muted)" }}>Loading admin data...</p>
            </div>
          </div>
        )}

        {err && (
          <div className="mb-8 p-4 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--surface-raised)" }}>
                <span className="text-sm">⚠</span>
              </div>
              <p className="font-medium" style={{ color: "var(--paper)" }}>{err}</p>
            </div>
          </div>
        )}

        {!loading && !err && (
          <div className="space-y-12">

            {/* Races Section */}
            <div className="rounded-2xl shadow-lg p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🏁</span>
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: "var(--paper)" }}>Races</h2>
                  {races.length > 0 && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: "var(--surface-raised)", color: "var(--muted)" }}>
                      {races.length} races
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsRacesCollapsed(!isRacesCollapsed)}
                  className="p-2 rounded-lg transition-colors duration-200"
                  style={{ color: "var(--muted)" }}
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
                    <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>Year filter:</label>
                    <input
                      type="number"
                      placeholder="(all)"
                      className="px-4 py-2 rounded-lg focus:outline-none transition-all duration-200 w-32"
                      style={inputStyle}
                      value={raceYear}
                      onChange={(e) => setRaceYear(e.target.value ? Number(e.target.value) as number : "")}
                    />
                    <button
                      onClick={loadRaces}
                      className="px-4 py-2 rounded-lg transition-colors duration-200"
                      style={{ background: "var(--surface-raised)", color: "var(--muted)", border: "1px solid var(--border)" }}
                    >
                      Reload
                    </button>
                  </div>

                  {races.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface-raised)" }}>
                        <span className="text-2xl">🏁</span>
                      </div>
                      <p style={{ color: "var(--muted)" }}>No races found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {races.map(r => (
                        <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl hover:shadow-md transition-shadow duration-200" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                          <img
                            src={r.image_url ? `${process.env.NEXT_PUBLIC_API_BASE}${r.image_url}` : "/file.svg"}
                            className="w-20 h-20 rounded-xl object-cover shadow-sm"
                            style={{ border: "2px solid var(--border)" }}
                            alt={r.name}
                          />

                          <div className="flex-1">
                            <div className="font-semibold mb-1" style={{ color: "var(--paper)" }}>
                              {r.name} <span style={{ color: "var(--muted)" }}>({r.year})</span>
                            </div>
                            <div className="text-sm mb-1" style={{ color: "var(--muted)" }}>
                              📍 {r.location} · {r.lat}, {r.lng}
                            </div>
                            {r.source_url && (
                              <div className="text-sm">
                                <a className="hover:underline" style={{ color: "var(--accent)" }} href={r.source_url} target="_blank" rel="noopener noreferrer">
                                  🔗 View source
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="cursor-pointer">
                              <div className="px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium" style={{ background: "var(--surface)", color: "var(--paper)", border: "1px solid var(--border)" }}>
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
                              className="px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                              style={{ background: "var(--surface)", color: "var(--paper)", border: "1px solid var(--border)" }}
                            >
                              ✏️ Edit Event
                            </button>
                            <button
                              onClick={() => deleteRace(r.id, r.name)}
                              disabled={raceBusy === r.id}
                              className="px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                              style={{ background: "var(--surface)", color: "#ef4444", border: "1px solid var(--border)" }}
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
            <div className="rounded-2xl shadow-lg p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">⏳</span>
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: "var(--paper)" }}>Pending Submissions</h2>
                  {items.length > 0 && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: "var(--surface-raised)", color: "var(--muted)" }}>
                      {items.length} pending
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsPendingCollapsed(!isPendingCollapsed)}
                  className="p-2 rounded-lg transition-colors duration-200"
                  style={{ color: "var(--muted)" }}
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
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface-raised)" }}>
                        <span className="text-2xl">✅</span>
                      </div>
                      <p style={{ color: "var(--muted)" }}>No pending submissions.</p>
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
                        <div key={s.id} className="p-6 rounded-xl" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                          <div className="flex justify-between items-start gap-6">
                            <div className="flex-1 space-y-4">
                              {/* Event Header */}
                              <div>
                                <div className="font-semibold text-lg mb-2" style={{ color: "var(--paper)" }}>
                                  {s.payload.name}{" "}
                                  {submissionYear && (
                                    <span style={{ color: "var(--muted)" }}>({submissionYear})</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm mb-2" style={{ color: "var(--muted)" }}>
                                  <span>📍 {s.payload.location}</span>
                                  <span>•</span>
                                  <span>{s.payload.lat}, {s.payload.lng}</span>
                                  <span>•</span>
                                  <span style={{
                                    display: "inline-flex", alignItems: "center",
                                    padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500,
                                    ...(s.payload.category === 'WDSC' ? { background: "rgba(255,98,0,0.15)", color: "#FF6200" } :
                                    s.payload.category === 'EURO' ? { background: "rgba(59,130,246,0.15)", color: "#60a5fa" } :
                                    s.payload.category === 'FREERIDE' ? { background: "rgba(34,197,94,0.15)", color: "#4ade80" } :
                                    s.payload.category === 'IDF' ? { background: "rgba(168,85,247,0.15)", color: "#c084fc" } :
                                    { background: "var(--surface-raised)", color: "var(--muted)" })
                                  }}>
                                    {s.payload.category}
                                  </span>
                                </div>
                                {s.payload.date_from && (
                                  <div className="text-sm" style={{ color: "var(--muted)" }}>
                                    📅 {new Date(s.payload.date_from).toLocaleDateString()}
                                    {s.payload.date_to && ` - ${new Date(s.payload.date_to).toLocaleDateString()}`}
                                  </div>
                                )}

                                {/* Submission Type Badge */}
                                <div className="mt-2">
                                  <span style={{
                                    display: "inline-flex", alignItems: "center",
                                    padding: "0.125rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500,
                                    ...(s.submission_type === 'EDIT'
                                      ? { background: "rgba(59,130,246,0.15)", color: "#60a5fa" }
                                      : { background: "rgba(34,197,94,0.15)", color: "#4ade80" })
                                  }}>
                                    {s.submission_type === 'EDIT' ? '✏️ Edit Submission' : '🆕 New Submission'}
                                  </span>
                                </div>
                              </div>

                              {/* Links */}
                              {s.payload.links && s.payload.links.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Links:</div>
                                  <div className="space-y-1">
                                    {s.payload.links.map((link, idx) => (
                                      <div key={idx} className="text-sm">
                                        <a className="hover:underline" style={{ color: "var(--accent)" }} href={link.url} target="_blank" rel="noopener noreferrer">
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
                                  <div className="text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Spot Information:</div>
                                  <div className="text-sm p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                                    {s.payload.spot_notes}
                                  </div>
                                </div>
                              )}

                              {s.payload.event_description && (
                                <div>
                                  <div className="text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Event Description:</div>
                                  <div className="text-sm p-3 rounded-lg whitespace-pre-wrap" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                                    {s.payload.event_description}
                                  </div>
                                </div>
                              )}

                              {/* Results by Category */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Open Results */}
                                {s.payload.top_riders_open && s.payload.top_riders_open.length > 0 && (
                                  <div>
                                    <div className="text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>🏆 Open Results:</div>
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
                                            <ClickableRiderName name={r.name} className="font-medium transition-colors duration-200" style={{ color: "var(--paper)" } as any} />
                                            {r.country && <span style={{ color: "var(--muted)" }}>({r.country})</span>}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {/* Luge Results */}
                                {s.payload.top_riders_luge && s.payload.top_riders_luge.length > 0 && (
                                  <div>
                                    <div className="text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>🛷 Luge Results:</div>
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
                                            <ClickableRiderName name={r.name} className="font-medium transition-colors duration-200" style={{ color: "var(--paper)" } as any} />
                                            {r.country && <span style={{ color: "var(--muted)" }}>({r.country})</span>}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {/* Women Results */}
                                {s.payload.top_riders_woman && s.payload.top_riders_woman.length > 0 && (
                                  <div>
                                    <div className="text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>👩 Women Results:</div>
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
                                            <ClickableRiderName name={r.name} className="font-medium transition-colors duration-200" style={{ color: "var(--paper)" } as any} />
                                            {r.country && <span style={{ color: "var(--muted)" }}>({r.country})</span>}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {/* Qualifiers */}
                                {s.payload.top_qualifiers && s.payload.top_qualifiers.length > 0 && (
                                  <div>
                                    <div className="text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>🎯 Qualifiers ({s.payload.top_qualifiers.length}):</div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                      {s.payload.top_qualifiers
                                        .slice()
                                        .sort((a,b)=>a.position-b.position)
                                        .map(r=>(
                                          <div key={r.position} className="flex items-center gap-2 text-sm">
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-green-500 to-teal-600">
                                              Q{r.position}
                                            </div>
                                            <ClickableRiderName name={r.name} className="font-medium transition-colors duration-200" style={{ color: "var(--paper)" } as any} />
                                            {r.country && <span style={{ color: "var(--muted)" }}>({r.country})</span>}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Track Records */}
                              {(s.payload.track_record_open || s.payload.track_record_luge || s.payload.track_record_woman) && (
                                <div>
                                  <div className="text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>⏱️ Track Records:</div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {s.payload.track_record_open && (
                                      <div className="p-3 rounded-lg text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                                        <div className="font-medium" style={{ color: "var(--muted)" }}>Open:</div>
                                        <div style={{ color: "var(--paper)" }}>{s.payload.track_record_open.name} - {s.payload.track_record_open.time}</div>
                                      </div>
                                    )}
                                    {s.payload.track_record_luge && (
                                      <div className="p-3 rounded-lg text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                                        <div className="font-medium" style={{ color: "var(--muted)" }}>Luge:</div>
                                        <div style={{ color: "var(--paper)" }}>{s.payload.track_record_luge.name} - {s.payload.track_record_luge.time}</div>
                                      </div>
                                    )}
                                    {s.payload.track_record_woman && (
                                      <div className="p-3 rounded-lg text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                                        <div className="font-medium" style={{ color: "var(--muted)" }}>Women:</div>
                                        <div style={{ color: "var(--paper)" }}>{s.payload.track_record_woman.name} - {s.payload.track_record_woman.time}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Organizer */}
                              {s.payload.organizer_name && (
                                <div>
                                  <div className="text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>👤 Organizer:</div>
                                  <div className="p-3 rounded-lg text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                                    <ClickableRiderName
                                      name={s.payload.organizer_name}
                                      className="hover:underline"
                                      style={{ color: "var(--accent)" } as any}
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="mt-3 p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                                <div className="text-sm font-medium mb-1" style={{ color: "var(--paper)" }}>Submitted by:</div>
                                <div className="text-sm" style={{ color: "var(--muted)" }}>
                                  <div className="font-medium" style={{ color: "var(--paper)" }}>{s.submitted_by_name}</div>
                                  <div style={{ color: "var(--accent)" }}>{s.submitted_by_email}</div>
                                  <div className="text-xs" style={{ color: "var(--muted)" }}>User ID: {s.submitted_by_user_id}</div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3">
                              <button
                                onClick={() => approve(s.id)}
                                disabled={busyId === s.id}
                                className="px-6 py-3 rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                                style={{ background: "var(--surface-raised)", color: "var(--paper)", border: "1px solid var(--border)" }}
                              >
                                {busyId === s.id ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--paper)" }}></div>
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

                                  params.append('submissionId', s.id.toString());

                                  window.open(`/submit?${params.toString()}`, '_blank');
                                }}
                                className="px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                                style={{ background: "var(--surface-raised)", color: "var(--paper)", border: "1px solid var(--border)" }}
                                title="Edit submission details before approving"
                              >
                                <div className="flex items-center gap-2">
                                  <span>✏️</span>
                                  <span>Edit Submission</span>
                                </div>
                              </button>
                              <button
                                onClick={() => deleteSubmission(s.id)}
                                className="px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                                style={{ background: "var(--surface-raised)", color: "#ef4444", border: "1px solid var(--border)" }}
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
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Users Section */}
            <div className="rounded-2xl shadow-lg p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">👥</span>
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: "var(--paper)" }}>Users</h2>
                  {users.length > 0 && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: "var(--surface-raised)", color: "var(--muted)" }}>
                      {users.length} users
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsUsersCollapsed(!isUsersCollapsed)}
                  className="p-2 rounded-lg transition-colors duration-200"
                  style={{ color: "var(--muted)" }}
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
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface-raised)" }}>
                        <span className="text-2xl">👥</span>
                      </div>
                      <p style={{ color: "var(--muted)" }}>No users found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.map((u) => (
                        <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl hover:shadow-md transition-shadow duration-200" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="font-semibold mb-1" style={{ color: "var(--paper)" }}>
                              {u.name || "(no name)"} · {u.email}
                            </div>
                            <div className="flex items-center gap-4 text-sm" style={{ color: "var(--muted)" }}>
                              <span style={{
                                display: "inline-flex", alignItems: "center",
                                padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500,
                                ...(u.role === 'OWNER' ? { background: "rgba(239,68,68,0.15)", color: "#f87171" } :
                                u.role === 'ADMIN' ? { background: "rgba(59,130,246,0.15)", color: "#60a5fa" } :
                                { background: "var(--surface-raised)", color: "var(--muted)" })
                              }}>
                                {u.role}
                              </span>
                              <span style={{
                                display: "inline-flex", alignItems: "center",
                                padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500,
                                ...(u.is_active
                                  ? { background: "rgba(34,197,94,0.15)", color: "#4ade80" }
                                  : { background: "rgba(239,68,68,0.15)", color: "#f87171" })
                              }}>
                                {u.is_active ? 'Active' : 'Inactive'}
                              </span>
                              <span style={{
                                display: "inline-flex", alignItems: "center",
                                padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500,
                                ...(u.can_submit
                                  ? { background: "rgba(34,197,94,0.15)", color: "#4ade80" }
                                  : { background: "var(--surface-raised)", color: "var(--muted)" })
                              }}>
                                {u.can_submit ? 'Can Submit' : 'Cannot Submit'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200"
                              style={u.can_submit
                                ? { background: "var(--surface)", color: "#ef4444", border: "1px solid var(--border)" }
                                : { background: "var(--surface)", color: "#22c55e", border: "1px solid var(--border)" }}
                              disabled={userBusy === u.id}
                              onClick={() => updateUser(u.id, { can_submit: !u.can_submit })}
                            >
                              {u.can_submit ? "Disable Submit" : "Enable Submit"}
                            </button>
                            <select
                              className="px-4 py-2 rounded-lg focus:outline-none transition-all duration-200"
                              style={inputStyle}
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

            {/* Reports Section */}
            <div className="rounded-2xl shadow-lg p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">⚑</span>
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: "var(--paper)" }}>Reports</h2>
                  {reports.filter(r => r.status === "OPEN").length > 0 && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                      {reports.filter(r => r.status === "OPEN").length} open
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsReportsCollapsed(!isReportsCollapsed)}
                  className="p-2 rounded-lg transition-colors duration-200"
                  style={{ color: "var(--muted)" }}
                  title={isReportsCollapsed ? "Expand section" : "Collapse section"}
                >
                  <span className={`text-xl transition-transform duration-200 ${isReportsCollapsed ? 'rotate-180' : ''}`}>▼</span>
                </button>
              </div>

              {!isReportsCollapsed && (
                <>
                  {reports.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface-raised)" }}>
                        <span className="text-2xl">✅</span>
                      </div>
                      <p style={{ color: "var(--muted)" }}>No reports.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div
                          key={report.id}
                          className="p-5 rounded-xl"
                          style={{
                            background: "var(--surface-raised)",
                            border: `1px solid ${report.status === "OPEN" ? "rgba(239,68,68,0.4)" : "var(--border)"}`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm" style={{ color: "var(--paper)" }}>{report.event_name}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{
                                  ...(report.status === "OPEN"
                                    ? { background: "rgba(239,68,68,0.15)", color: "#ef4444" }
                                    : report.status === "RESOLVED"
                                    ? { background: "rgba(34,197,94,0.15)", color: "#4ade80" }
                                    : { background: "var(--surface)", color: "var(--muted)" })
                                }}>
                                  {report.status}
                                </span>
                              </div>
                              <div className="text-xs" style={{ color: "var(--muted)" }}>
                                {report.user_name} · {report.user_email} · {new Date(report.created_at).toLocaleString()}
                              </div>
                              <div className="text-sm p-3 rounded-lg whitespace-pre-wrap" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--paper)" }}>
                                {report.message}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              {report.status === "OPEN" && (
                                <>
                                  <button
                                    onClick={() => patchReport(report.id, "RESOLVED")}
                                    disabled={reportBusy === report.id}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60"
                                    style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}
                                  >
                                    ✓ Resolve
                                  </button>
                                  <button
                                    onClick={() => patchReport(report.id, "DISMISSED")}
                                    disabled={reportBusy === report.id}
                                    className="px-3 py-1.5 rounded-lg text-sm transition-opacity disabled:opacity-60"
                                    style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
                                  >
                                    Dismiss
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => deleteReport(report.id)}
                                disabled={reportBusy === report.id}
                                className="px-3 py-1.5 rounded-lg text-sm transition-opacity disabled:opacity-60"
                                style={{ background: "var(--surface)", color: "#ef4444", border: "1px solid var(--border)" }}
                              >
                                🗑 Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Contact Messages Section */}
            <div className="rounded-2xl shadow-lg p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">📧</span>
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: "var(--paper)" }}>Contact Messages</h2>
                  {contactMessages.filter(m => m.status === "UNREAD").length > 0 && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
                      {contactMessages.filter(m => m.status === "UNREAD").length} unread
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsContactCollapsed(!isContactCollapsed)}
                  className="p-2 rounded-lg transition-colors duration-200"
                  style={{ color: "var(--muted)" }}
                  title={isContactCollapsed ? "Expand section" : "Collapse section"}
                >
                  <span className={`text-xl transition-transform duration-200 ${isContactCollapsed ? 'rotate-180' : ''}`}>▼</span>
                </button>
              </div>

              {!isContactCollapsed && (
                <>
                  {contactMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface-raised)" }}>
                        <span className="text-2xl">📭</span>
                      </div>
                      <p style={{ color: "var(--muted)" }}>No contact messages.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contactMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className="p-5 rounded-xl"
                          style={{
                            background: "var(--surface-raised)",
                            border: `1px solid ${msg.status === "UNREAD" ? "rgba(59,130,246,0.4)" : "var(--border)"}`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm" style={{ color: "var(--paper)" }}>{msg.subject}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{
                                  ...(msg.status === "UNREAD"
                                    ? { background: "rgba(59,130,246,0.15)", color: "#60a5fa" }
                                    : msg.status === "READ"
                                    ? { background: "rgba(34,197,94,0.15)", color: "#4ade80" }
                                    : { background: "var(--surface)", color: "var(--muted)" })
                                }}>
                                  {msg.status}
                                </span>
                              </div>
                              <div className="text-xs" style={{ color: "var(--muted)" }}>
                                {msg.name} · {msg.email} · {new Date(msg.created_at).toLocaleString()}
                              </div>
                              <div className="text-sm p-3 rounded-lg whitespace-pre-wrap" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--paper)" }}>
                                {msg.message}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              {msg.status === "UNREAD" && (
                                <button
                                  onClick={() => patchContact(msg.id, "READ")}
                                  disabled={contactBusy === msg.id}
                                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60"
                                  style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}
                                >
                                  ✓ Mark Read
                                </button>
                              )}
                              {msg.status !== "ARCHIVED" && (
                                <button
                                  onClick={() => patchContact(msg.id, "ARCHIVED")}
                                  disabled={contactBusy === msg.id}
                                  className="px-3 py-1.5 rounded-lg text-sm transition-opacity disabled:opacity-60"
                                  style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
                                >
                                  Archive
                                </button>
                              )}
                              <button
                                onClick={() => deleteContact(msg.id)}
                                disabled={contactBusy === msg.id}
                                className="px-3 py-1.5 rounded-lg text-sm transition-opacity disabled:opacity-60"
                                style={{ background: "var(--surface)", color: "#ef4444", border: "1px solid var(--border)" }}
                              >
                                🗑 Delete
                              </button>
                            </div>
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
