import Map from "@/components/Map";
import YearBar from "@/components/YearBar";
import { fetchRaces } from "@/lib/api";
import ClientSelected from "./selected";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ year?: string }>;
}) {
  const current = new Date().getFullYear();
  const sp = (await searchParams) ?? {};
  const year = Number(sp.year ?? current);

  const geojson = await fetchRaces(year);

  // Fetch top riders server-side
  const topRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bio/top`, { cache: "no-store" });
  const top = topRes.ok ? await topRes.json() : [];

  return (
    <main className="flex flex-col gap-4">
      <YearBar />
      <section className="px-4">
        <h1 className="text-2xl font-bold">Downhill Longboard Race History</h1>
        <p className="text-gray-600">
          Showing races for <span className="font-semibold">{year}</span>
        </p>
      </section>
      <ClientSelected geojson={geojson} />

      <section className="px-4 pb-8">
        <h2 className="text-xl font-semibold mb-2">Top riders</h2>
        {top.length === 0 ? (
          <p className="text-gray-600 text-sm">No riders yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {top.map((r: any, i: number) => (
              <a key={i} href={r.id ? `/riders/${r.id}` : undefined} className="flex flex-col items-center gap-2 p-2 border rounded hover:bg-gray-50">
                <img
                  src={r.profile_image_url ? `${process.env.NEXT_PUBLIC_API_BASE}${r.profile_image_url}` : "/file.svg"}
                  className="w-16 h-16 rounded-full object-cover border"
                  alt={r.name}
                />
                <div className="text-center">
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-gray-600">{r.achievements_count} results</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
