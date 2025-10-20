"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type AllRider = {
  id: number | null;
  person_id: number;
  name: string;
  nationality: string | null;
  achievements_count: number;
  profile_image_url: string | null;
  is_registered: boolean;
  user_id: number | null;
};

export default function Riders() {
  const [rows, setRows] = useState<AllRider[]>([]);
  const [filtered, setFiltered] = useState<AllRider[]>([]);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/bio/riders/all", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) { setErr(data?.error || "Failed to load"); return; }
      setRows(data);
      setFiltered(data);
    })();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(rows);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(rows.filter(r => 
      r.name.toLowerCase().includes(q) || 
      (r.nationality && r.nationality.toLowerCase().includes(q))
    ));
  }, [search, rows]);

  return (
    <main className="max-w-4xl mx-auto p-6 grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">Riders</h1>
        <p className="text-gray-600 mt-2">
          All riders who have participated in races, including those who haven't registered accounts yet.
        </p>
      </div>
      
      {/* Search */}
      <div className="grid gap-2">
        <input
          type="text"
          placeholder="Search riders by name or nationality..."
          className="border rounded p-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {err && <p className="text-red-700">{err}</p>}
      
      <div className="grid gap-2">
        {filtered.length === 0 && search ? (
          <p className="text-gray-600">No riders found matching "{search}"</p>
        ) : (
          filtered.map((r) => (
            <div key={`${r.person_id}-${r.is_registered ? 'registered' : 'unregistered'}`} className="border rounded p-3 hover:bg-gray-50">
              {r.is_registered ? (
                <Link href={`/riders/${r.user_id}`} className="block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {r.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{r.name}</div>
                      <div className="text-sm text-gray-600">
                        Nationality: {r.nationality || "—"} · Achievements: {r.achievements_count}
                      </div>
                    </div>
                    <div className="text-xs text-green-600 font-medium">Registered</div>
                  </div>
                </Link>
              ) : (
                <Link href={`/riders/person/${r.person_id}`} className="block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {r.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{r.name}</div>
                      <div className="text-sm text-gray-600">
                        Achievements: {r.achievements_count}
                      </div>
                      <div className="text-xs text-amber-600 font-medium mt-1">
                        This rider has not made an account yet
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Unregistered</div>
                  </div>
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
