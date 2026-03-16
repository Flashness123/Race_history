"use client";
import { useEffect, useState } from "react";
import { fetchTopVideos, fetchVideos, createVideo, likeVideo, unlikeVideo, Video } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Me = { authenticated: boolean; user?: { name?: string; role: "OWNER"|"ADMIN"|"USER" } };

export default function MediaPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me>({ authenticated: false });
  const [topVideos, setTopVideos] = useState<Video[]>([]);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    youtube_url: ""
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Load user authentication status
  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();
        setMe(data);
      } catch (e) {
        console.error("Failed to load user:", e);
      }
    }
    loadMe();
  }, []);

  // Load videos
  useEffect(() => {
    async function loadVideos() {
      setLoading(true);
      setError(null);
      try {
        const [topData, allData] = await Promise.all([
          fetchTopVideos(10),
          fetchVideos(50, 0)
        ]);
        setTopVideos(topData);
        setAllVideos(allData);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load videos");
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  const handleLike = async (videoId: number, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikeVideo(videoId);
      } else {
        await likeVideo(videoId);
      }
      
      // Refresh videos
      const [topData, allData] = await Promise.all([
        fetchTopVideos(10),
        fetchVideos(50, 0)
      ]);
      setTopVideos(topData);
      setAllVideos(allData);
    } catch (e: unknown) {
      console.error("Failed to toggle like:", e);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      await createVideo(uploadForm);
      setUploadSuccess("Video uploaded successfully!");
      setUploadForm({ title: "", description: "", youtube_url: "" });
      setShowUploadForm(false);
      
      // Refresh videos
      const [topData, allData] = await Promise.all([
        fetchTopVideos(10),
        fetchVideos(50, 0)
      ]);
      setTopVideos(topData);
      setAllVideos(allData);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to upload video";
      if (errorMessage.includes("401")) {
        setUploadError("Please sign in to upload videos");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const VideoCard = ({ video, isPodium = false, position = 0 }: { video: Video; isPodium?: boolean; position?: number }) => (
    <div className={`group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover-lift ${isPodium ? 'overflow-hidden' : ''}`}>
      <div className="relative">
        <Image
          src={video.thumbnail_url || "/file.svg"}
          alt={video.title}
          width={400}
          height={isPodium ? 192 : 160}
          className={`w-full object-cover ${isPodium ? 'h-48' : 'h-40'} group-hover:scale-105 transition-transform duration-300`}
        />
        {isPodium && position > 0 && (
          <div className="absolute top-4 left-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
              position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
              position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
              'bg-gradient-to-br from-orange-400 to-orange-600'
            }`}>
              {position}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <a
            href={video.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-200"
          >
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </a>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {video.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            by {video.uploaded_by_name}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="eyebrow text-[10px]">Likes</span>
              <span>{video.like_count}</span>
            </div>
            
            {me.authenticated && (
              <button
                onClick={() => handleLike(video.id, video.is_liked)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  video.is_liked
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {video.is_liked ? 'Liked' : 'Like'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <main className="page-shell">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading media...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--accent)]">
            <span className="eyebrow text-[10px] text-[var(--paper-strong)]">Media</span>
          </div>
          <p className="eyebrow mb-3">Community footage</p>
          <h1 className="mb-2 text-4xl font-semibold text-[var(--ink)]">
            Media Gallery
          </h1>
          <p className="mb-6 text-[var(--ink-soft)]">Discover the best downhill longboard videos from the community.</p>
          
          {me.authenticated ? (
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="button-ink px-6 py-3 font-semibold"
            >
              {showUploadForm ? 'Cancel Upload' : 'Upload Video'}
            </button>
          ) : (
            <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-white/50 px-4 py-2">
              <span className="text-sm text-[var(--ink-soft)]">
                Sign in to upload videos
              </span>
            </div>
          )}
        </div>

        {/* Upload Form */}
        {showUploadForm && me.authenticated && (
          <div className="surface-card-strong mb-12 rounded-[1.75rem] p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Video</h2>
            
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter video title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter video description"
                  rows={3}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                <input
                  type="url"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://youtube.com/watch?v=..."
                  value={uploadForm.youtube_url}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, youtube_url: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="button-ink px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    'Upload Video'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
            
            {uploadError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(143,89,77,0.18)] bg-[rgba(143,89,77,0.08)]">
                    <span className="eyebrow text-[8px] text-[var(--danger)]">!</span>
                  </div>
                  <p className="text-red-800 font-medium">{uploadError}</p>
                </div>
              </div>
            )}
            
            {uploadSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-green-800 font-medium">{uploadSuccess}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(143,89,77,0.18)] bg-[rgba(143,89,77,0.08)]">
                <span className="eyebrow text-[8px] text-[var(--danger)]">!</span>
                  </div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Podium Section - Only show if we have 3+ videos */}
        {allVideos.length >= 3 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-2">Top videos</h2>
              <p className="text-gray-600">The most liked videos from the community</p>
            </div>
            
            <div className="relative">
              {/* Podium for top 3 */}
              <div className="flex justify-center items-end gap-6 mb-8 max-w-5xl mx-auto">
                  {/* 2nd place (Left) */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 mb-2 w-64">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-400 mb-2">2nd Place</div>
                        <VideoCard video={allVideos[1]} isPodium={true} position={2} />
                        <div className="text-sm text-gray-500 mt-2">{allVideos[1].like_count} likes</div>
                      </div>
                    </div>
                    <div className="bg-gray-300 rounded-lg w-20 h-16 flex items-center justify-center shadow-md">
                      <span className="text-3xl font-bold text-gray-600">2</span>
                    </div>
                  </div>
                  
                  {/* 1st place (Center) */}
                  <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-xl border-2 border-yellow-300 p-4 mb-2 w-72">
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-600 mb-2">🥇 1st Place</div>
                        <VideoCard video={allVideos[0]} isPodium={true} position={1} />
                        <div className="text-sm text-gray-500 mt-2">{allVideos[0].like_count} likes</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg w-24 h-20 flex items-center justify-center shadow-lg">
                      <span className="text-4xl font-bold text-white">1</span>
                    </div>
                  </div>
                  
                  {/* 3rd place (Right) */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 mb-2 w-64">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-400 mb-2">3rd Place</div>
                        <VideoCard video={allVideos[2]} isPodium={true} position={3} />
                        <div className="text-sm text-gray-500 mt-2">{allVideos[2].like_count} likes</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg w-20 h-16 flex items-center justify-center shadow-md">
                      <span className="text-3xl font-bold text-white">3</span>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* All Videos Section */}
        {allVideos.length > 0 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">All Videos</h2>
              <p className="text-gray-600">Browse all community videos</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allVideos.map((video, index) => (
                <div key={video.id} className="relative">
                  {/* Top 3 Badge */}
                  {index < 3 && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                        'bg-gradient-to-br from-orange-400 to-orange-500'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                  )}
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {allVideos.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border)] bg-white/55">
              <span className="eyebrow text-[10px]">Media</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share a video with the community!</p>
            {me.authenticated && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="button-ink px-6 py-3 font-semibold"
              >
                Upload First Video
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
