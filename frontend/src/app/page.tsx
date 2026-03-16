"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import YearBar from "@/components/YearBar";
import { fetchRaces } from "@/lib/api";
import ClientSelected from "./selected";
import ClientEventsList from "./events-list";
import ClickableRiderName from "@/components/ClickableRiderName";
import DynamicBackground from "@/components/DynamicBackground";

type Filters = {SPOT:boolean;WDSC:boolean;EURO:boolean;FREERIDE:boolean;IDF:boolean;OUTLAW:boolean;NATIONAL:boolean;RACE:boolean};
type GeoJsonData = Awaited<ReturnType<typeof fetchRaces>>;
type TopRider = {
  name: string;
  profile_image_url: string;
  achievements_count: number;
};

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [geojson, setGeojson] = useState<GeoJsonData>({ type: "FeatureCollection", features: [] });
  const [top, setTop] = useState<TopRider[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ SPOT: true, WDSC: true, EURO: true, FREERIDE: true, IDF: true, OUTLAW: true, NATIONAL: true, RACE: true });

  useEffect(() => {
    let alive = true;

    const findLatestYearWithRaces = async (startYear: number) => {
      const minYear = Math.max(1900, startYear - 25);

      for (let candidate = startYear; candidate >= minYear; candidate -= 1) {
        try {
          const data = await fetchRaces(candidate);
          if (data.features.length > 0) {
            return { year: candidate, data };
          }
        } catch (error) {
          console.error(`Error loading races for ${candidate}:`, error);
        }
      }

      return {
        year: startYear,
        data: { type: "FeatureCollection", features: [] } as GeoJsonData,
      };
    };

    const loadData = async () => {
      try {
        setLoading(true);
        const topPromise = fetch("/api/bio/top", { cache: "no-store" }).then((res) =>
          res.ok ? res.json() : []
        );

        const yearParam = searchParams.get("year");
        const parsedYear = yearParam ? Number(yearParam) : NaN;
        const hasExplicitYear = Number.isFinite(parsedYear);
        const currentYear = new Date().getFullYear();

        const resolved = hasExplicitYear
          ? { year: parsedYear, data: await fetchRaces(parsedYear) }
          : await findLatestYearWithRaces(currentYear);

        const topData = await topPromise;

        if (!alive) return;

        setYear(resolved.year);
        setGeojson(resolved.data);
        setTop(topData);

        if (!hasExplicitYear) {
          router.replace(`/?year=${resolved.year}`, { scroll: false });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (!alive) return;
        setYear(Number(searchParams.get("year") ?? new Date().getFullYear()));
        setGeojson({ type: "FeatureCollection", features: [] });
        setTop([]);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      alive = false;
    };
  }, [router, searchParams]);

  if (loading) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen relative">
      {/* Dynamic Background Component */}
      <DynamicBackground filters={filters} />
      
      {/* Content with relative positioning to appear above overlay */}
      <div className="relative z-10 flex flex-col">
        <YearBar selectedYear={year ?? new Date().getFullYear()} />
        
        {/* Hero Section */}
        <section className="px-6 py-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Downhill Radar
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                Discover races, track results, and connect with the community
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <span className="text-sm font-medium">Showing races for</span>
                <span className="ml-2 px-3 py-1 bg-white/30 rounded-full text-sm font-bold">
                  {year ?? new Date().getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <ClientSelected geojson={geojson} onFiltersChange={setFilters} />
          </div>
        </section>

        {/* Top Riders Section */}
        <section className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Top Riders</h2>
              <p className="text-white/90 drop-shadow-md">The most successful riders in the community</p>
            </div>
            
            {top.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <p className="text-white/90 drop-shadow-md">No riders yet. Be the first to submit a race!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                {top.map((r, i: number) => (
                  <div 
                    key={i} 
                    className="group flex flex-col items-center p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:shadow-xl hover:bg-white hover:border-blue-200 transition-all duration-300 hover-lift"
                  >
                    <div className="relative mb-3">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_BASE}${r.profile_image_url}`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors duration-300"
                        alt={r.name}
                      />
                      {i < 3 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{i + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <ClickableRiderName 
                        name={r.name} 
                        className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {r.achievements_count} result{r.achievements_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Events List Section */}
        <section className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                All Events in {year ?? new Date().getFullYear()}
              </h2>
              <p className="text-blue-100 drop-shadow-md">
                Browse and search through all events from this year
              </p>
            </div>
            <ClientEventsList year={year ?? new Date().getFullYear()} />
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="flex flex-col min-h-screen items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}
