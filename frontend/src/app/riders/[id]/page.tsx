"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function RiderProfile() {
  const [data, setData] = useState<any>(null);
  const [videosData, setVideosData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [videosErr, setVideosErr] = useState<string | null>(null);
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

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/videos/user/${id}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) { setVideosErr(json?.error || "Failed to load videos"); return; }
      setVideosData(json);
    })();
  }, [id]);

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
            </div>
          </div>
        </div>

        {/* Achievements Section - Show first for unregistered riders */}
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
                {data.achievements.map((achievement: any, index: number) => (
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

        {/* Videos Section */}
        <div className="rounded-2xl shadow-lg p-8 mb-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🎥</span>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: "var(--paper)" }}>Videos</h2>
            {videosData && (
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: "var(--surface-raised)", color: "var(--muted)" }}>
                  {videosData.total_videos} video{videosData.total_videos !== 1 ? 's' : ''}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                  ❤️ {videosData.total_likes} like{videosData.total_likes !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <div className="rounded-xl p-6 max-h-96 overflow-y-auto" style={{ background: "var(--surface-raised)" }}>
            {videosErr ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface)" }}>
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--paper)" }}>Error Loading Videos</h3>
                <p style={{ color: "var(--muted)" }}>{videosErr}</p>
              </div>
            ) : !videosData ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "var(--border)", borderTopColor: "#ef4444" }}></div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--paper)" }}>Loading Videos</h3>
                <p style={{ color: "var(--muted)" }}>Please wait while we fetch the video information...</p>
              </div>
            ) : !videosData.videos?.length ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface)" }}>
                  <span className="text-2xl">🎥</span>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--paper)" }}>No Videos Yet</h3>
                <p style={{ color: "var(--muted)" }}>This rider hasn't uploaded any videos yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {videosData.videos.map((video: any) => (
                  <div key={video.id} className="flex gap-4 p-4 rounded-lg hover:shadow-md transition-shadow duration-200" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="flex-shrink-0">
                      <img
                        src={video.thumbnail_url || "/file.svg"}
                        alt={video.title}
                        className="w-24 h-18 rounded-lg object-cover"
                        style={{ border: "1px solid var(--border)" }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 line-clamp-2" style={{ color: "var(--paper)" }}>{video.title}</h3>
                      {video.description && (
                        <p className="text-sm mb-2 line-clamp-2" style={{ color: "var(--muted)" }}>{video.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm" style={{ color: "var(--muted)" }}>
                        <span className="flex items-center gap-1">
                          <span>❤️</span>
                          <span>{video.like_count} like{video.like_count !== 1 ? 's' : ''}</span>
                        </span>
                        <span>📅 {new Date(video.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                      >
                        <span>▶️</span>
                        <span>Watch</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
