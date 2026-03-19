"use client";
import { useEffect, useState } from "react";
import { fetchTopVideos, fetchVideos, createVideo, likeVideo, unlikeVideo, Video } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Me = { authenticated: boolean; user?: { name?: string; role: "OWNER"|"ADMIN"|"USER" } };

const inputStyle = { background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--paper)" } as const;

export default function MediaPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me>({ authenticated: false });
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: "", description: "", youtube_url: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();
        setMe(data);
      } catch (e) { console.error("Failed to load user:", e); }
    }
    loadMe();
  }, []);

  useEffect(() => {
    async function loadVideos() {
      setLoading(true); setError(null);
      try {
        const [, allData] = await Promise.all([fetchTopVideos(10), fetchVideos(50, 0)]);
        setAllVideos(allData);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load videos");
      } finally { setLoading(false); }
    }
    loadVideos();
  }, []);

  const handleLike = async (videoId: number, isLiked: boolean) => {
    try {
      if (isLiked) { await unlikeVideo(videoId); } else { await likeVideo(videoId); }
      const [, allData] = await Promise.all([fetchTopVideos(10), fetchVideos(50, 0)]);
      setAllVideos(allData);
    } catch (e: unknown) { console.error("Failed to toggle like:", e); }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault(); setUploading(true); setUploadError(null); setUploadSuccess(null);
    try {
      await createVideo(uploadForm);
      setUploadSuccess("Video uploaded successfully!");
      setUploadForm({ title: "", description: "", youtube_url: "" });
      setShowUploadForm(false);
      const [, allData] = await Promise.all([fetchTopVideos(10), fetchVideos(50, 0)]);
      setAllVideos(allData);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to upload video";
      if (msg.includes("401")) { setUploadError("Please sign in to upload videos"); setTimeout(() => router.push("/login"), 2000); }
      else { setUploadError(msg); }
    } finally { setUploading(false); }
  };

  const VideoCard = ({ video, position = 0 }: { video: Video; position?: number }) => (
    <div className="group relative rounded-xl border hover-lift transition-all duration-300" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="relative">
        <Image src={video.thumbnail_url || "/file.svg"} alt={video.title} width={400} height={160}
          className="w-full h-40 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300" />
        {position > 0 && (
          <div className="absolute top-4 left-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}
              style={{ background: position === 1 ? "#f59e0b" : position === 2 ? "#9ca3af" : "var(--accent)" }}>
              {position}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-t-xl">
          <a href={video.youtube_url} target="_blank" rel="noopener noreferrer"
            className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-200">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </a>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2" style={{ color: "var(--paper)" }}>{video.title}</h3>
        {video.description && <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--muted)" }}>{video.description}</p>}
        <div className="flex items-center justify-between">
          <div className="text-sm" style={{ color: "var(--muted)" }}>by {video.uploaded_by_name}</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm" style={{ color: "var(--muted)" }}>
              <span>❤️</span><span>{video.like_count}</span>
            </div>
            {me.authenticated && (
              <button onClick={() => handleLike(video.id, video.is_liked)}
                className="px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200"
                style={{ background: video.is_liked ? "var(--accent)" : "var(--surface-raised)", color: "var(--paper)", border: "1px solid var(--border)" }}>
                {video.is_liked ? '❤️ Liked' : '🤍 Like'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <main className="min-h-screen" style={{ background: "var(--ink)" }}>
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}></div>
            <p style={{ color: "var(--muted)" }}>Loading media...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--ink)" }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--accent)" }}>
            <span className="font-bold text-3xl">🎬</span>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>Media Gallery</h1>
          <p className="mb-6" style={{ color: "var(--muted)" }}>Discover the best downhill longboard videos from the community</p>

          {me.authenticated ? (
            <button onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-6 py-3 font-semibold rounded-lg transition-opacity hover:opacity-90 hover-lift"
              style={{ background: "var(--accent)", color: "var(--paper)" }}>
              {showUploadForm ? 'Cancel Upload' : '🎥 Upload Video'}
            </button>
          ) : (
            <div className="inline-flex items-center px-4 py-2 rounded-lg border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted)" }}>
              Sign in to upload videos
            </div>
          )}
        </div>

        {/* Upload Form */}
        {showUploadForm && me.authenticated && (
          <div className="mb-12 rounded-2xl border p-8" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>Upload Video</h2>
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Video Title</label>
                <input type="text" required className="w-full px-4 py-3 rounded-lg" style={inputStyle}
                  placeholder="Enter video title" value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Description (optional)</label>
                <textarea className="w-full px-4 py-3 rounded-lg" style={inputStyle}
                  placeholder="Enter video description" rows={3} value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>YouTube URL</label>
                <input type="url" required className="w-full px-4 py-3 rounded-lg" style={inputStyle}
                  placeholder="https://youtube.com/watch?v=..." value={uploadForm.youtube_url}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, youtube_url: e.target.value }))} />
              </div>
              <div className="flex gap-4">
                <button type="submit" disabled={uploading}
                  className="px-6 py-3 font-semibold rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 hover-lift"
                  style={{ background: "var(--accent)", color: "var(--paper)" }}>
                  {uploading ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Uploading...</span></div> : 'Upload Video'}
                </button>
                <button type="button" onClick={() => setShowUploadForm(false)}
                  className="px-6 py-3 font-semibold rounded-lg transition-opacity hover:opacity-80"
                  style={{ background: "var(--surface-raised)", color: "var(--paper)", border: "1px solid var(--border)" }}>
                  Cancel
                </button>
              </div>
            </form>
            {uploadError && <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: "var(--accent)", color: "var(--accent)", background: "var(--surface-raised)" }}>⚠ {uploadError}</div>}
            {uploadSuccess && <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: "var(--border)", color: "var(--paper)", background: "var(--surface-raised)" }}>✓ {uploadSuccess}</div>}
          </div>
        )}

        {error && <div className="mb-8 p-4 rounded-lg border" style={{ borderColor: "var(--accent)", color: "var(--accent)", background: "var(--surface)" }}>⚠ {error}</div>}

        {/* Podium */}
        {allVideos.length >= 3 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>🏆 Top 3 Videos</h2>
              <p style={{ color: "var(--muted)" }}>The most liked videos from the community</p>
            </div>
            <div className="flex justify-center items-end gap-6 mb-8 max-w-5xl mx-auto">
              {/* 2nd place */}
              <div className="flex flex-col items-center">
                <div className="rounded-xl border p-4 mb-2 w-64" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <div className="text-center">
                    <div className="text-xl font-bold mb-2" style={{ color: "var(--muted)" }}>2nd Place</div>
                    <VideoCard video={allVideos[1]} position={2} />
                    <div className="text-sm mt-2" style={{ color: "var(--muted)" }}>{allVideos[1].like_count} likes</div>
                  </div>
                </div>
                <div className="rounded-lg w-20 h-16 flex items-center justify-center shadow-md" style={{ background: "#9ca3af" }}>
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
              </div>
              {/* 1st place */}
              <div className="flex flex-col items-center">
                <div className="rounded-xl border-2 p-4 mb-2 w-72" style={{ background: "var(--surface)", borderColor: "#f59e0b" }}>
                  <div className="text-center">
                    <div className="text-xl font-bold mb-2" style={{ color: "#f59e0b" }}>🥇 1st Place</div>
                    <VideoCard video={allVideos[0]} position={1} />
                    <div className="text-sm mt-2" style={{ color: "var(--muted)" }}>{allVideos[0].like_count} likes</div>
                  </div>
                </div>
                <div className="rounded-lg w-24 h-20 flex items-center justify-center shadow-lg" style={{ background: "#f59e0b" }}>
                  <span className="text-4xl font-bold text-white">1</span>
                </div>
              </div>
              {/* 3rd place */}
              <div className="flex flex-col items-center">
                <div className="rounded-xl border p-4 mb-2 w-64" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <div className="text-center">
                    <div className="text-xl font-bold mb-2" style={{ color: "var(--muted)" }}>3rd Place</div>
                    <VideoCard video={allVideos[2]} position={3} />
                    <div className="text-sm mt-2" style={{ color: "var(--muted)" }}>{allVideos[2].like_count} likes</div>
                  </div>
                </div>
                <div className="rounded-lg w-20 h-16 flex items-center justify-center shadow-md" style={{ background: "var(--accent)" }}>
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Videos */}
        {allVideos.length > 0 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>All Videos</h2>
              <p style={{ color: "var(--muted)" }}>Browse all community videos</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allVideos.map((video, index) => (
                <div key={video.id} className="relative">
                  {index < 3 && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                        style={{ background: index === 0 ? "#f59e0b" : index === 1 ? "#9ca3af" : "var(--accent)" }}>
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
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
              <span className="text-2xl">🎬</span>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--paper)" }}>No videos yet</h3>
            <p className="mb-6" style={{ color: "var(--muted)" }}>Be the first to share a video with the community!</p>
            {me.authenticated && (
              <button onClick={() => setShowUploadForm(true)}
                className="px-6 py-3 font-semibold rounded-lg transition-opacity hover:opacity-90 hover-lift"
                style={{ background: "var(--accent)", color: "var(--paper)" }}>
                Upload First Video
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
