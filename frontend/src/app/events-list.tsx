"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Event {
  id: number;
  name: string;
  image_url: string;
  year: number;
  location: string;
  category: string;
  date_from?: string;
  date_to?: string;
}

interface ClientEventsListProps {
  year: number;
}

export default function ClientEventsList({ year }: ClientEventsListProps) {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(`/api/events/by-year/${year}`);
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [year]);

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-xl focus:outline-none transition-all duration-200"
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                color: "var(--paper)",
              }}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--muted)" }}>🔍</span>
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 rounded-lg border" style={{ borderColor: "var(--border)" }}>
          <p className="text-2xl tracking-widest mb-2" style={{ fontFamily: "var(--font-display), cursive", color: "var(--muted)" }}>
            {searchTerm ? "NO RESULTS" : "NO EVENTS"}
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {searchTerm ? "Try adjusting your search terms" : "No events available for this year"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event) => {
            const catStyle = (() => {
              switch (event.category) {
                case "WDSC": return { bg: "rgba(255,98,0,0.18)", color: "#FF6200" };
                case "EURO": return { bg: "rgba(59,130,246,0.18)", color: "#60a5fa" };
                case "FREERIDE": return { bg: "rgba(34,197,94,0.18)", color: "#4ade80" };
                case "IDF": return { bg: "rgba(168,85,247,0.18)", color: "#c084fc" };
                case "OUTLAW": return { bg: "rgba(239,68,68,0.18)", color: "#f87171" };
                case "NATIONAL": return { bg: "rgba(245,158,11,0.18)", color: "#fbbf24" };
                case "RACE": return { bg: "rgba(20,184,166,0.18)", color: "#2dd4bf" };
                default: return { bg: "rgba(122,122,132,0.18)", color: "#a0a0b0" };
              }
            })();
            const catLabel = (() => {
              switch (event.category) {
                case "WDSC": return "WDSC"; case "EURO": return "Euro Tour";
                case "FREERIDE": return "Freeride"; case "IDF": return "IDF";
                case "OUTLAW": return "Outlaw"; case "NATIONAL": return "National";
                case "RACE": return "Race"; default: return "Spot";
              }
            })();
            return (
              <div
                key={event.id}
                onClick={() => router.push(`/event/${event.id}`)}
                className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300"
                style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.transform = "none";
                }}
              >
                <div className="overflow-hidden h-44 relative">
                  <img
                    src={event.image_url ? `${process.env.NEXT_PUBLIC_API_BASE}${event.image_url}` : "/file.svg"}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span
                    className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: catStyle.bg, color: catStyle.color, backdropFilter: "blur(8px)" }}
                  >
                    {catLabel}
                  </span>
                </div>
                <div className="p-4">
                  <h3
                    className="font-bold text-base mb-2 line-clamp-2"
                    style={{ color: "var(--paper)", fontFamily: "var(--font-display), cursive" }}
                  >
                    {event.name}
                  </h3>
                  <div className="space-y-1 text-xs" style={{ color: "var(--muted)" }}>
                    <div className="flex items-center gap-1.5">
                      <span>📍</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                    {(event.date_from || event.year) && (
                      <div className="flex items-center gap-1.5">
                        <span>📅</span>
                        <span>{event.date_from ? new Date(event.date_from).toLocaleDateString() : event.year}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
