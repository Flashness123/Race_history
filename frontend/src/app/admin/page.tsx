"use client";
import { useEffect, useState } from "react";

type Top3 = { name: string; country?: string; instagram?: string; position: number };

type PendingItem = {
  id: number;
  submitted_by_user_id: number | null;
  payload: {
    name: string; year: number; location: string; lat: number; lng: number;
    source_url?: string; top3?: Top3[];
  };
};

type User = {
  id: number; email: string; name?: string | null;
  role: "OWNER" | "ADMIN" | "USER";
  is_active: boolean; can_submit: boolean;
};

type Race = {
  id: number; name: string; year: number;
  location: string; lat: number; lng: number; source_url?: string;
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
    <main className="max-w-6xl mx-auto p-6 grid gap-8">
      <h1 className="text-2xl font-bold">Admin</h1>
      {loading && <p>Loading…</p>}
      {err && <p className="text-red-600">{err}</p>}

      {/* Races */}
      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Races</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm">Year filter:</label>
          <input
            type="number"
            placeholder="(all)"
            className="border rounded px-2 py-1 w-28"
            value={raceYear}
            onChange={(e) => setRaceYear(e.target.value ? Number(e.target.value) as number : "")}
          />
          <button onClick={loadRaces} className="px-2 py-1 border rounded">Reload</button>
        </div>

        {races.length === 0 && <p className="text-gray-600">No races found.</p>}

        <div className="grid gap-2">
          {races.map(r => (
            <div key={r.id} className="border rounded p-3 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">
                  {r.name} <span className="text-gray-600">({r.year})</span>
                </div>
                <div className="text-gray-700">{r.location} · {r.lat}, {r.lng}</div>
                {r.source_url && (
                  <div className="text-gray-600">
                    <a className="underline" href={r.source_url} target="_blank">source</a>
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteRace(r.id, r.name)}
                disabled={raceBusy === r.id}
                className="bg-red-600 text-white rounded px-3 py-2 disabled:opacity-60"
              >
                {raceBusy === r.id ? "Deleting…" : "🗑 Delete"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Pending Submissions */}
      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Pending submissions</h2>
        {items.length === 0 && <p className="text-gray-600">No pending submissions.</p>}
        <div className="grid gap-4">
          {items.map((s) => (
            <div key={s.id} className="border rounded p-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <div className="font-semibold">
                    {s.payload.name} <span className="text-gray-500">({s.payload.year})</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {s.payload.location} · {s.payload.lat}, {s.payload.lng}
                  </div>
                  {s.payload.source_url && (
                    <div className="text-sm">
                      Source: <a className="underline" href={s.payload.source_url} target="_blank">link</a>
                    </div>
                  )}
                  {Array.isArray(s.payload.top3) && s.payload.top3.length > 0 && (
                    <ul className="text-sm mt-2">
                      {s.payload.top3
                        .slice()
                        .sort((a,b)=>a.position-b.position)
                        .map(r=>(
                          <li key={r.position}>
                            #{r.position}: {r.name}
                            {r.country ? ` (${r.country})` : ""}
                            {r.instagram ? ` · 📸 ${r.instagram}` : ""}
                          </li>
                        ))}
                    </ul>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Submitted by user: {s.submitted_by_user_id ?? "unknown"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => approve(s.id)}
                    disabled={busyId === s.id}
                    className="bg-green-600 text-white rounded px-3 py-2 disabled:opacity-60"
                  >
                    {busyId === s.id ? "Approving…" : "✅ Approve"}
                  </button>
                  <button
                    onClick={() => deleteSubmission(s.id)}
                    className="bg-gray-700 text-white rounded px-3 py-2"
                    title="Hard delete submission"
                  >
                    🗑 Delete
                </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Users */}
      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Users</h2>
        {users.length === 0 && <p className="text-gray-600">No users.</p>}
        <div className="grid gap-2">
          {users.map((u) => (
            <div key={u.id} className="border rounded p-3 flex items-center justify-between gap-3">
              <div className="text-sm">
                <div className="font-medium">{u.name || "(no name)"} · {u.email}</div>
                <div className="text-gray-600">Role: {u.role} · Active: {String(u.is_active)} · Can submit: {String(u.can_submit)}</div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 border rounded"
                  disabled={userBusy === u.id}
                  onClick={() => updateUser(u.id, { can_submit: !u.can_submit })}
                >
                  {u.can_submit ? "Disable submit" : "Enable submit"}
                </button>
                {/* Owner-only role changes will error for non-owners */}
                <select
                  className="px-2 py-1 border rounded"
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
      </section>
    </main>
  );
}
