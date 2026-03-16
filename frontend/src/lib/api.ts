export async function fetchRaces(year: number) {
  const res = await fetch(`/api/races?year=${year}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    let errorData: any;
    try { errorData = JSON.parse(text); } catch { errorData = { error: text || "Failed to fetch races" }; }
    throw new Error(errorData.error || `Failed to fetch races (${res.status})`);
  }
  return res.json() as Promise<{
    type: "FeatureCollection";
    features: Array<{ geometry: { coordinates: [number, number] }; properties: any }>;
  }>;
}

export type Video = {
  id: number;
  title: string;
  description?: string;
  youtube_url: string;
  youtube_id: string;
  thumbnail_url?: string;
  uploaded_by_user_id: number;
  uploaded_by_name: string;
  created_at: string;
  like_count: number;
  is_liked: boolean;
};

export async function fetchVideos(limit = 50, offset = 0): Promise<Video[]> {
  const res = await fetch(`/api/videos?limit=${limit}&offset=${offset}`, { cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch videos (${res.status})`);
  }
  return res.json();
}

export async function fetchTopVideos(limit = 10): Promise<Video[]> {
  const res = await fetch(`/api/videos/top?limit=${limit}`, { cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch top videos (${res.status})`);
  }
  return res.json();
}

export async function createVideo(data: { title: string; description?: string; youtube_url: string }) {
  const res = await fetch("/api/videos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create video (${res.status})`);
  }
  
  return res.json();
}

export async function likeVideo(videoId: number) {
  const res = await fetch(`/api/videos/${videoId}/like`, { method: "POST" });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to like video (${res.status})`);
  }
  
  return res.json();
}

export async function unlikeVideo(videoId: number) {
  const res = await fetch(`/api/videos/${videoId}/like`, { method: "DELETE" });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to unlike video (${res.status})`);
  }
  
  return res.json();
}
