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
            </div>
          </div>
        </div>

        {/* Achievements Section - Show first for unregistered riders */}
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
                {data.achievements.map((achievement: any, index: number) => (
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

        {/* Videos Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🎥</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Videos</h2>
            {videosData && (
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                  {videosData.total_videos} video{videosData.total_videos !== 1 ? 's' : ''}
                </span>
                <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                  ❤️ {videosData.total_likes} like{videosData.total_likes !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 max-h-96 overflow-y-auto">
            {videosErr ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Videos</h3>
                <p className="text-gray-600">{videosErr}</p>
              </div>
            ) : !videosData ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Videos</h3>
                <p className="text-gray-600">Please wait while we fetch the video information...</p>
              </div>
            ) : !videosData.videos?.length ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎥</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Videos Yet</h3>
                <p className="text-gray-600">This rider hasn't uploaded any videos yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {videosData.videos.map((video: any) => (
                  <div key={video.id} className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div className="flex-shrink-0">
                      <img
                        src={video.thumbnail_url || "/file.svg"}
                        alt={video.title}
                        className="w-24 h-18 rounded-lg object-cover border border-gray-200"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{video.title}</h3>
                      {video.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
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
