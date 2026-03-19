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

function Spinner() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center" style={{ background: "var(--ink)" }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-0.5 h-10 animate-pulse"
          style={{ background: "var(--accent)" }}
        />
        <p
          className="text-xl tracking-[0.3em]"
          style={{ fontFamily: "var(--font-display), cursive", color: "var(--muted)" }}
        >
          LOADING
        </p>
      </div>
    </main>
  );
}

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
          if (data.features.length > 0) return { year: candidate, data };
        } catch (error) {
          console.error(`Error loading races for ${candidate}:`, error);
        }
      }
      return { year: startYear, data: { type: "FeatureCollection", features: [] } as GeoJsonData };
    };

    const loadData = async () => {
      try {
        setLoading(true);
        const topPromise = fetch("/api/bio/top", { cache: "no-store" }).then(res => res.ok ? res.json() : []);

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
        console.error("Error loading data:", error);
        if (!alive) return;
        setYear(Number(searchParams.get("year") ?? new Date().getFullYear()));
        setGeojson({ type: "FeatureCollection", features: [] });
        setTop([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadData();
    return () => { alive = false; };
  }, [router, searchParams]);

  if (loading) return <Spinner />;

  const currentYear = year ?? new Date().getFullYear();

  return (
    <main className="flex flex-col min-h-screen relative">
      <DynamicBackground filters={filters} />

      <div className="relative z-10 flex flex-col">
        <YearBar selectedYear={currentYear} />

        {/* Hero */}
        <section className="px-6 pt-14 pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p
                  className="text-xs font-medium tracking-[0.3em] uppercase mb-3"
                  style={{ color: "var(--accent)" }}
                >
                  Discover races, track results, and connect with the community
                </p>
                <h1
                  className="leading-none tracking-wider"
                  style={{
                    fontFamily: "var(--font-display), cursive",
                    fontSize: "clamp(3.5rem, 10vw, 7rem)",
                    color: "var(--paper)",
                  }}
                >
                  DOWNHILL<br />RADAR
                </h1>
              </div>

              <div className="flex items-center gap-3 md:pb-2">
                <span
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: "var(--muted)" }}
                >
                  Season
                </span>
                <div
                  className="px-5 py-2 rounded border"
                  style={{ borderColor: "var(--accent)" }}
                >
                  <span
                    className="text-3xl tracking-wider"
                    style={{ fontFamily: "var(--font-display), cursive", color: "var(--accent)" }}
                  >
                    {currentYear}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map */}
        <section className="px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <ClientSelected geojson={geojson} onFiltersChange={setFilters} />
          </div>
        </section>

        {/* Top Riders */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Section heading */}
            <div className="flex items-center gap-4 mb-10">
              <div className="w-8 h-px" style={{ background: "var(--accent)" }} />
              <h2
                className="text-4xl tracking-wider"
                style={{ fontFamily: "var(--font-display), cursive", color: "var(--paper)" }}
              >
                TOP RIDERS
              </h2>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <p className="text-xs hidden sm:block" style={{ color: "var(--muted)" }}>
                The most successful riders in the community
              </p>
            </div>

            {top.length === 0 ? (
              <div
                className="text-center py-16 rounded-lg border"
                style={{ borderColor: "var(--border)" }}
              >
                <p
                  className="text-2xl tracking-widest"
                  style={{ fontFamily: "var(--font-display), cursive", color: "var(--muted)" }}
                >
                  🏆 NO RIDERS YET
                </p>
                <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
                  Be the first to submit a race!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {top.map((r, i: number) => (
                  <div
                    key={i}
                    className="group flex flex-col items-center p-4 rounded-lg border transition-colors hover-lift cursor-pointer"
                    style={{
                      background: "var(--surface-raised)",
                      borderColor: "var(--border)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                      (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-raised)";
                    }}
                  >
                    <div className="relative mb-3">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_BASE}${r.profile_image_url}`}
                        className="w-14 h-14 rounded-full object-cover border-2 transition-colors"
                        style={{ borderColor: "var(--border)" }}
                        alt={r.name}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                      />
                      {i < 3 && (
                        <div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "var(--accent)" }}
                        >
                          <span
                            className="text-xs leading-none"
                            style={{ fontFamily: "var(--font-display), cursive", color: "var(--ink)" }}
                          >
                            {i + 1}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <ClickableRiderName
                        name={r.name}
                        className="text-sm font-medium transition-colors"
                        style={{ color: "var(--paper)" } as React.CSSProperties}
                      />
                      <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                        {r.achievements_count} result{r.achievements_count !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Events List */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-8 h-px" style={{ background: "var(--accent)" }} />
              <h2
                className="text-4xl tracking-wider"
                style={{ fontFamily: "var(--font-display), cursive", color: "var(--paper)" }}
              >
                ALL EVENTS IN {currentYear}
              </h2>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <p className="text-xs hidden sm:block" style={{ color: "var(--muted)" }}>
                Browse and search through all events from this year
              </p>
            </div>
            <ClientEventsList year={currentYear} />
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<Spinner />}>
      <HomeContent />
    </Suspense>
  );
}
