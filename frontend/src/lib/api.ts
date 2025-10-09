export async function fetchRaces(year: number) {
  const base = process.env.NEXT_PUBLIC_API_BASE!;
  const res = await fetch(`${base}/races?year=${year}`, { cache: "no-store" });
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
