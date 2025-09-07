import Map from "@/components/Map";
import YearBar from "@/components/YearBar";
import { fetchRaces } from "@/lib/api";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ year?: string }>;
}) {
  const current = new Date().getFullYear();
  const sp = (await searchParams) ?? {};
  const year = Number(sp.year ?? current);

  const geojson = await fetchRaces(year);

  return (
    <main className="flex flex-col gap-4">
      <YearBar />
      <section className="px-4">
        <h1 className="text-2xl font-bold">Downhill Longboard Race History</h1>
        <p className="text-gray-600">
          Showing races for <span className="font-semibold">{year}</span>
        </p>
      </section>
      <div className="px-4">
        <Map geojson={geojson} />
      </div>
    </main>
  );
}
