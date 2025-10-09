"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function RiderProfile() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
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

  if (err) return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-2xl">⚠️</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h1>
        <p className="text-gray-600">{err}</p>
      </div>
    </main>
  );
  
  if (!data) return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Loading Profile</h1>
        <p className="text-gray-600">Please wait while we fetch the rider information...</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <img
                src={data.profile_image_url ? `${process.env.NEXT_PUBLIC_API_BASE}${data.profile_image_url}` : "/file.svg"}
                alt={data.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🏁</span>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
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
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 italic">"{data.message}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🏆</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
            {data.achievements?.length > 0 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                {data.achievements.length} result{data.achievements.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 max-h-96 overflow-y-auto">
            {!data.achievements?.length ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏁</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Yet</h3>
                <p className="text-gray-600">This rider hasn't participated in any races yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.achievements.map((a: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      a.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      a.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      a.position === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-blue-400 to-blue-600'
                    }`}>
                      #{a.position}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{a.event_name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <span>📍 {a.location}</span>
                        <span>•</span>
                        <span>📅 {a.year}</span>
                      </div>
                    </div>
                    
                    {a.person_name && (
                      <div className="text-sm text-gray-500 italic">
                        {a.person_name}
                      </div>
                    )}
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
