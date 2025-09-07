export async function fetchRaces(year: number) {
  const base = process.env.NEXT_PUBLIC_API_BASE!;
  const res = await fetch(`${base}/races?year=${year}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch races");
  return res.json() as Promise<{
    type: "FeatureCollection";
    features: Array<{ geometry: { coordinates: [number, number] }; properties: any }>;
  }>;
}
