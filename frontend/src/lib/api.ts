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

export type SpotRunListItem = {
  id: number;
  rider_name: string;
  duration_ms: number;
  max_speed_kmh: number;
  avg_speed_kmh: number;
  run_date: string | null;
  uploaded_at: string;
  is_own: boolean;
};

export type TrackPoint = { t: number; lat: number; lng: number; alt: number; spd: number; gx?: number; gy?: number };

export type SpotRunOut = SpotRunListItem & {
  track_points: TrackPoint[];
  kept?: boolean;
  rank?: number;
};

export type ExistingRunConflict = {
  code: "already_has_run";
  existing_run_id: number;
  existing_duration_ms: number;
  existing_max_speed_kmh: number;
  existing_rider_name: string;
};

export class RunConflictError extends Error {
  conflict: ExistingRunConflict;
  constructor(conflict: ExistingRunConflict) {
    super("already_has_run");
    this.conflict = conflict;
  }
}

export async function fetchSpotRuns(
  eventId: number,
  sortBy: "time" | "speed" | "name" | "date" = "time"
): Promise<SpotRunListItem[]> {
  const res = await fetch(`/api/spots/${eventId}/runs?sort_by=${sortBy}`, { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to fetch runs (${res.status})`);
  }
  return res.json();
}

export async function fetchSpotRun(eventId: number, runId: number): Promise<SpotRunOut> {
  const res = await fetch(`/api/spots/${eventId}/runs/${runId}`, { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to fetch run (${res.status})`);
  }
  return res.json();
}

export async function uploadSpotRun(
  eventId: number,
  file: File,
  riderName?: string
): Promise<SpotRunOut> {
  const form = new FormData();
  form.append("file", file);
  if (riderName) form.append("rider_name", riderName);

  const res = await fetch(`/api/spots/${eventId}/runs`, { method: "POST", body: form });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 409 && data.detail?.code === "already_has_run") {
      throw new RunConflictError(data.detail as ExistingRunConflict);
    }
    const msg = typeof data.detail === "string" ? data.detail : data.error || `Upload failed (${res.status})`;
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteSpotRun(eventId: number, runId: number): Promise<void> {
  const res = await fetch(`/api/spots/${eventId}/runs/${runId}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to delete run (${res.status})`);
  }
}

export function spotRunDownloadUrl(eventId: number, runId: number): string {
  return `/api/spots/${eventId}/runs/${runId}/download`;
}
