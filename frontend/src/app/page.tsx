import Map from "@/components/Map";
import YearBar from "@/components/YearBar";
import { fetchRaces } from "@/lib/api";
import ClientSelected from "./selected";
import ClientEventsList from "./events-list";

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
    <main 
      className="flex flex-col min-h-screen relative"
      style={{
        backgroundImage: 'url(/images/backgrounds/mainpage_background.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Full page overlay for better content readability */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Content with relative positioning to appear above overlay */}
      <div className="relative z-10 flex flex-col">
        <YearBar />
        
        {/* Hero Section */}
        <section className="px-6 py-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Downhill Longboard Race History
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                Discover races, track results, and connect with the community
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <span className="text-sm font-medium">Showing races for</span>
                <span className="ml-2 px-3 py-1 bg-white/30 rounded-full text-sm font-bold">
                  {year}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <ClientSelected geojson={geojson} />
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
                {top.map((r: any, i: number) => (
                  <a 
                    key={i} 
                    href={r.id ? `/riders/${r.id}` : undefined} 
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
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {r.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {r.achievements_count} result{r.achievements_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </a>
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
                All Events in {year}
              </h2>
              <p className="text-blue-100 drop-shadow-md">
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
