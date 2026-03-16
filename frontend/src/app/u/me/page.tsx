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

  if (err) return <main className="max-w-3xl mx-auto p-6">{err}</main>;
  if (!data) return <main className="max-w-3xl mx-auto p-6">Loading…</main>;

  return (
    <main className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-6">
            <img 
              src={`${process.env.NEXT_PUBLIC_API_BASE}${data.profile_image_url}`} 
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-md" 
              alt="Profile" 
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.name || "My Bio"}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>🏁 Racer Profile</span>
                <span>•</span>
                <span>{data.achievements?.length || 0} achievements</span>
              </div>
            </div>
          </div>
          <Link 
            href="/u/me/edit" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <span>✏️</span>
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>👤</span>
            Personal Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Nationality:</span>
              <span className="text-gray-900">{data.nationality || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Place of birth:</span>
              <span className="text-gray-900">{data.place_of_birth || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Date of birth:</span>
              <span className="text-gray-900">{data.date_of_birth || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Phone:</span>
              <span className="text-gray-900">{data.phone_number || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Email:</span>
              <span className="text-gray-900">{data.email || "—"}</span>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🌐</span>
            Social Media
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <span>📷</span>
                Instagram:
              </span>
              {data.instagram ? (
                <a href={`https://instagram.com/${data.instagram}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline">
                  @{data.instagram}
                </a>
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <span>📘</span>
                Facebook:
              </span>
              {data.facebook ? (
                <a href={`https://facebook.com/${data.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline">
                  {data.facebook}
                </a>
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <span>📺</span>
                YouTube:
              </span>
              {data.youtube ? (
                <a href={`https://youtube.com/@${data.youtube}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline">
                  {data.youtube}
                </a>
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <span>🎵</span>
                TikTok:
              </span>
              {data.tiktok ? (
                <a href={`https://tiktok.com/@${data.tiktok}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline">
                  @{data.tiktok}
                </a>
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {data.message && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>💬</span>
            Message to Riders
          </h2>
          <p className="text-gray-700 leading-relaxed">{data.message}</p>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🏆</span>
          Achievements
        </h2>
        <div className="max-h-96 overflow-auto">
          {!data.achievements?.length ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🏁</div>
              <div>No results yet. Start racing to build your achievements!</div>
            </div>
          ) : (
            <div className="grid gap-3">
              {data.achievements.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {a.position}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{a.event_name}</div>
                      <div className="text-sm text-gray-600">{a.year} • {a.location}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
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
