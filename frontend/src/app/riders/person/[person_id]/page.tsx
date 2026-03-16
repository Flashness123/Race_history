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
                src={`${process.env.NEXT_PUBLIC_API_BASE}${data.profile_image_url}`}
                alt={data.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
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

              {/* Unregistered Notice */}
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 text-lg">ℹ️</span>
                  <div>
                    <p className="text-amber-800 font-medium">Unregistered Rider</p>
                    <p className="text-amber-700 text-sm">
                      This rider has not created an account yet. They can register to edit their profile and see more details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section - Shown First for Unregistered Riders */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8 mb-8">
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
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Achievements Yet</h3>
                <p className="text-gray-600">This rider hasn't participated in any races yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">#{achievement.position}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{achievement.event_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📅 {achievement.year}</span>
                        <span>📍 {achievement.location}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          achievement.category === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                          achievement.category === 'LUGE' ? 'bg-green-100 text-green-800' :
                          achievement.category === 'WOMAN' ? 'bg-pink-100 text-pink-800' :
                          achievement.category === 'QUALIFIER' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
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
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Know This Rider?
            </h3>
            <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
              If this is you or someone you know, they can register for free to edit their profile, 
              add more details, and manage their racing achievements.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/register"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🚀 Register Now
              </a>
              <a
                href="/login"
                className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200"
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
