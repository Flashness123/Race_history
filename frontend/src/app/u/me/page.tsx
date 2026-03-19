"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

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

  if (err) return <main className="max-w-3xl mx-auto p-6" style={{ color: "var(--muted)" }}>{err}</main>;
  if (!data) return <main className="max-w-3xl mx-auto p-6" style={{ color: "var(--muted)" }}>Loading…</main>;

  return (
    <main className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="rounded-xl shadow-lg p-8 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-6">
            <img
              src={`${process.env.NEXT_PUBLIC_API_BASE}${data.profile_image_url}`}
              className="w-24 h-24 rounded-full object-cover shadow-md"
              style={{ border: "4px solid var(--border)" }}
              alt="Profile"
            />
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--paper)" }}>{data.name || "My Bio"}</h1>
              <div className="flex items-center gap-4 text-sm" style={{ color: "var(--muted)" }}>
                <span>🏁 Racer Profile</span>
                <span>•</span>
                <span>{data.achievements?.length || 0} achievements</span>
              </div>
            </div>
          </div>
          <Link
            href="/u/me/edit"
            className="inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg shadow-md transition-colors duration-200"
            style={{ background: "var(--accent)", color: "var(--paper)" }}
          >
            <span>✏️</span>
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="rounded-xl shadow-lg p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--paper)" }}>
            <span>👤</span>
            Personal Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium" style={{ color: "var(--muted)" }}>Nationality:</span>
              <span style={{ color: "var(--paper)" }}>{data.nationality || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium" style={{ color: "var(--muted)" }}>Place of birth:</span>
              <span style={{ color: "var(--paper)" }}>{data.place_of_birth || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium" style={{ color: "var(--muted)" }}>Date of birth:</span>
              <span style={{ color: "var(--paper)" }}>{data.date_of_birth || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium" style={{ color: "var(--muted)" }}>Phone:</span>
              <span style={{ color: "var(--paper)" }}>{data.phone_number || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium" style={{ color: "var(--muted)" }}>Email:</span>
              <span style={{ color: "var(--paper)" }}>{data.email || "—"}</span>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="rounded-xl shadow-lg p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--paper)" }}>
            <span>🌐</span>
            Social Media
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium flex items-center gap-2" style={{ color: "var(--muted)" }}>
                <span>📷</span>
                Instagram:
              </span>
              {data.instagram ? (
                <a href={`https://instagram.com/${data.instagram}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }} className="hover:underline">
                  @{data.instagram}
                </a>
              ) : (
                <span style={{ color: "var(--muted)" }}>—</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium flex items-center gap-2" style={{ color: "var(--muted)" }}>
                <span>📘</span>
                Facebook:
              </span>
              {data.facebook ? (
                <a href={`https://facebook.com/${data.facebook}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }} className="hover:underline">
                  {data.facebook}
                </a>
              ) : (
                <span style={{ color: "var(--muted)" }}>—</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium flex items-center gap-2" style={{ color: "var(--muted)" }}>
                <span>📺</span>
                YouTube:
              </span>
              {data.youtube ? (
                <a href={`https://youtube.com/@${data.youtube}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }} className="hover:underline">
                  {data.youtube}
                </a>
              ) : (
                <span style={{ color: "var(--muted)" }}>—</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium flex items-center gap-2" style={{ color: "var(--muted)" }}>
                <span>🎵</span>
                TikTok:
              </span>
              {data.tiktok ? (
                <a href={`https://tiktok.com/@${data.tiktok}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }} className="hover:underline">
                  @{data.tiktok}
                </a>
              ) : (
                <span style={{ color: "var(--muted)" }}>—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {data.message && (
        <div className="rounded-xl shadow-lg p-6 mt-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--paper)" }}>
            <span>💬</span>
            Message to Riders
          </h2>
          <p className="leading-relaxed" style={{ color: "var(--muted)" }}>{data.message}</p>
        </div>
      )}

      {/* Achievements */}
      <div className="rounded-xl shadow-lg p-6 mt-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--paper)" }}>
          <span>🏆</span>
          Achievements
        </h2>
        <div className="max-h-96 overflow-auto">
          {!data.achievements?.length ? (
            <div className="text-center py-8" style={{ color: "var(--muted)" }}>
              <div className="text-4xl mb-2">🏁</div>
              <div>No results yet. Start racing to build your achievements!</div>
            </div>
          ) : (
            <div className="grid gap-3">
              {data.achievements.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {a.position}
                    </div>
                    <div>
                      <div className="font-medium" style={{ color: "var(--paper)" }}>{a.event_name}</div>
                      <div className="text-sm" style={{ color: "var(--muted)" }}>{a.year} • {a.location}</div>
                    </div>
                  </div>
                  <div className="text-sm capitalize" style={{ color: "var(--muted)" }}>
                    {a.category === 'ORGANIZER' ? 'Organizer' : a.category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
