"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ExtendedRider = {
  id: number | null;
  person_id: number;
  name: string;
  profile_image_url: string;
  nationality: string | null;
  place_of_birth: string | null;
  date_of_birth: string | null;
  message: string | null;
  achievements: Array<{
    person_name: string;
    position: number;
    category: string;
    event_id: number;
    event_name: string;
    year: number;
    location: string;
  }>;
  is_registered: boolean;
  user_id: number | null;
};

export default function UnregisteredRiderProfile() {
  const [data, setData] = useState<ExtendedRider | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const params = useParams<{ person_id: string }>();
  const person_id = (params?.person_id as string) || "";

  useEffect(() => {
    if (!person_id) return;
    (async () => {
      const res = await fetch(`/api/bio/riders/person/${person_id}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) { setErr(json?.error || "Failed to load"); return; }
      setData(json);
    })();
  }, [person_id]);

  if (err) return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--ink)" }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface)" }}>
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: "var(--paper)" }}>Error Loading Profile</h1>
        <p style={{ color: "var(--muted)" }}>{err}</p>
      </div>
    </main>
  );

  if (!data) return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--ink)" }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}></div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: "var(--paper)" }}>Loading Profile</h1>
        <p style={{ color: "var(--muted)" }}>Please wait while we fetch the rider information...</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen" style={{ background: "var(--ink)" }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="rounded-2xl shadow-lg p-8 mb-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <img
                src={`${process.env.NEXT_PUBLIC_API_BASE}${data.profile_image_url}`}
                alt={data.name}
                className="w-32 h-32 rounded-full object-cover shadow-lg"
                style={{ border: "4px solid var(--border)" }}
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--paper)" }}>{data.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm" style={{ color: "var(--muted)" }}>
                {data.nationality && (
                  <div className="flex items-center gap-1">
                    <span>🌍</span>
                    <span>{data.nationality}</span>
                  </div>
                )}
                {data.place_of_birth && (
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span>{data.place_of_birth}</span>
                  </div>
                )}
                {data.date_of_birth && (
                  <div className="flex items-center gap-1">
                    <span>🎂</span>
                    <span>{data.date_of_birth}</span>
                  </div>
                )}
              </div>

              {data.message && (
                <div className="mt-4 p-4 rounded-lg" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                  <p className="italic" style={{ color: "var(--paper)" }}>"{data.message}"</p>
                </div>
              )}

              {/* Unregistered Notice */}
              <div className="mt-4 p-4 rounded-lg" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg" style={{ color: "var(--accent)" }}>ℹ️</span>
                  <div>
                    <p className="font-medium" style={{ color: "var(--paper)" }}>Unregistered Rider</p>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      This rider has not created an account yet. They can register to edit their profile and see more details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section - Shown First for Unregistered Riders */}
        <div className="rounded-2xl shadow-lg p-8 mb-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🏆</span>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: "var(--paper)" }}>Achievements</h2>
            {data.achievements?.length > 0 && (
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: "var(--surface-raised)", color: "var(--muted)" }}>
                {data.achievements.length} result{data.achievements.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="rounded-xl p-6 max-h-96 overflow-y-auto" style={{ background: "var(--surface-raised)" }}>
            {!data.achievements?.length ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface)" }}>
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--paper)" }}>No Achievements Yet</h3>
                <p style={{ color: "var(--muted)" }}>This rider hasn't participated in any races yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:shadow-md transition-shadow duration-200" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">#{achievement.position}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1" style={{ color: "var(--paper)" }}>{achievement.event_name}</h3>
                      <div className="flex items-center gap-4 text-sm" style={{ color: "var(--muted)" }}>
                        <span>📅 {achievement.year}</span>
                        <span>📍 {achievement.location}</span>
                        <span style={{
                          padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500,
                          ...(achievement.category === 'OPEN' ? { background: "rgba(59,130,246,0.15)", color: "#60a5fa" } :
                          achievement.category === 'LUGE' ? { background: "rgba(34,197,94,0.15)", color: "#4ade80" } :
                          achievement.category === 'WOMAN' ? { background: "rgba(236,72,153,0.15)", color: "#f472b6" } :
                          achievement.category === 'QUALIFIER' ? { background: "rgba(168,85,247,0.15)", color: "#c084fc" } :
                          { background: "var(--surface-raised)", color: "var(--muted)" })
                        }}>
                          {achievement.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Registration Prompt */}
        <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: "var(--paper)" }}>
              Know This Rider?
            </h3>
            <p className="mb-4 max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
              If this is you or someone you know, they can register for free to edit their profile,
              add more details, and manage their racing achievements.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/register"
                className="px-6 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200"
                style={{ background: "var(--accent)", color: "var(--paper)" }}
              >
                🚀 Register Now
              </a>
              <a
                href="/login"
                className="px-6 py-3 font-semibold rounded-lg transition-all duration-200"
                style={{ background: "var(--surface-raised)", color: "var(--paper)", border: "1px solid var(--border)" }}
              >
                🔑 Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
