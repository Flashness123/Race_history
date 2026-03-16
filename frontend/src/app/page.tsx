"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  const [geojson, setGeojson] = useState<GeoJsonData>({ type: "FeatureCollection", features: [] });
  const [top, setTop] = useState<TopRider[]>([]);
  const [year, setYear] = useState(Number(searchParams.get("year") ?? new Date().getFullYear()));
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ SPOT: true, WDSC: true, EURO: true, FREERIDE: true, IDF: true, OUTLAW: true, NATIONAL: true, RACE: true });

  // Watch for URL parameter changes
  useEffect(() => {
    const urlYear = Number(searchParams.get("year") ?? new Date().getFullYear());
    setYear(urlYear);
  }, [searchParams]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [racesData, topData] = await Promise.all([
          fetchRaces(year),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bio/top`).then(res => res.ok ? res.json() : [])
        ]);
        setGeojson(racesData);
        setTop(topData);
      } catch (error) {
        console.error('Error loading data:', error);
        setGeojson({ type: "FeatureCollection", features: [] });
        setTop([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [year]);

  if (loading) {
    return (
      <main className="page-shell flex min-h-screen flex-col items-center justify-center">
        <div className="text-lg font-medium text-[var(--ink-soft)]">Loading archive...</div>
      </main>
    );
  }

  return (
    <main className="page-shell relative flex min-h-screen flex-col">
      <DynamicBackground filters={filters} />
      
      <div className="relative z-10 flex flex-col">
        <YearBar />
        
        <section className="px-6 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="surface-card-strong rounded-[2rem] p-8 md:p-12">
              <p className="eyebrow mb-5">Map-first downhill archive</p>
              <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
                <div>
                  <h1 className="mb-5 max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-[var(--ink)] md:text-7xl">
                    Race history, results, and spots gathered in one calmer archive.
                  </h1>
                  <p className="max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)] md:text-xl">
                    Discover events, trace riders across seasons, and keep the community record clean without losing the images, stories, or mapped locations that make it useful.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/40 p-6">
                  <p className="eyebrow mb-3">Current season</p>
                  <div className="mb-4 flex items-end gap-3">
                    <span className="text-5xl font-semibold tracking-[-0.06em] text-[var(--ink)]">{year}</span>
                    <span className="pb-2 text-sm text-[var(--muted)]">live map context</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="pill-muted px-3 py-2 text-sm">Events and spots</span>
                    <span className="pill-muted px-3 py-2 text-sm">Linked riders</span>
                    <span className="pill-muted px-3 py-2 text-sm">Submission flow</span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[var(--ink-soft)]">
                    Browse the global scene by year, then open details, results, and rider profiles directly from the map.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <ClientSelected geojson={geojson} onFiltersChange={setFilters} />
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <p className="eyebrow mb-3">Rider index</p>
              <h2 className="mb-2 text-3xl font-semibold text-[var(--ink)] md:text-4xl">Top riders</h2>
              <p className="text-[var(--ink-soft)]">The most successful riders in the archive right now.</p>
            </div>
            
            {top.length === 0 ? (
              <div className="surface-card rounded-[1.5rem] py-12 text-center">
                <p className="text-lg font-medium text-[var(--ink)]">No riders yet</p>
                <p className="mt-2 text-[var(--ink-soft)]">Be the first to submit a race and start the archive.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                {top.map((r, i: number) => (
                  <div 
                    key={i} 
                    className="surface-card group flex flex-col items-center rounded-[1.5rem] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)]"
                  >
                    <div className="relative mb-3">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_BASE}${r.profile_image_url}`}
                        className="h-16 w-16 rounded-full border-2 border-[var(--border)] object-cover transition-colors duration-300 group-hover:border-[var(--border-strong)]"
                        alt={r.name}
                      />
                      {i < 3 && (
                        <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(255,255,255,0.3)] bg-[var(--accent)] text-xs font-semibold text-[var(--paper-strong)]">
                          {i + 1}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <ClickableRiderName 
                        name={r.name} 
                        className="text-sm font-semibold text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--accent-warm)]"
                      />
                      <div className="mt-1 text-xs text-[var(--muted)]">
                        {r.achievements_count} result{r.achievements_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <p className="eyebrow mb-3">Event library</p>
              <h2 className="mb-4 text-3xl font-semibold text-[var(--ink)] md:text-4xl">
                All Events in {year}
              </h2>
              <p className="text-[var(--ink-soft)]">
                Browse and search through all events from this year
              </p>
            </div>
            <ClientEventsList year={year} />
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="page-shell flex min-h-screen flex-col items-center justify-center">
        <div className="text-lg font-medium text-[var(--ink-soft)]">Loading archive...</div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}
