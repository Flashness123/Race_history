"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Spot {
  id: number;
  name: string;
  image_url: string;
  location: string;
  spot_notes: string | null;
}

export default function ClientSpotsList() {
  const router = useRouter();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/events/spots", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setSpots(Array.isArray(data) ? data : []))
      .catch(() => setSpots([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = spots.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <>
      {/* Search */}
      <div className="mb-8">
        <div className="max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search spots by name or location..."
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-lg border" style={{ borderColor: "var(--border)" }}>
          <p className="text-2xl tracking-widest mb-2" style={{ fontFamily: "var(--font-display), cursive", color: "var(--muted)" }}>
            {searchTerm ? "NO RESULTS" : "NO SPOTS YET"}
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {searchTerm ? "Try adjusting your search" : "Be the first to submit a spot!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((spot) => (
            <div
              key={spot.id}
              onClick={() => router.push(`/events/${spot.id}`)}
              className="rounded-xl overflow-hidden cursor-pointer group transition-all duration-300"
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              }}
            >
              <div className="overflow-hidden h-44">
                <img
                  src={spot.image_url ? `${process.env.NEXT_PUBLIC_API_BASE}${spot.image_url}` : "/file.svg"}
                  alt={spot.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-2 transition-colors duration-200 group-hover:opacity-80"
                  style={{ color: "var(--paper)", fontFamily: "var(--font-display), cursive" }}>
                  {spot.name}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span className="truncate" style={{ color: "var(--muted)" }}>{spot.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📡</span>
                    <span style={{ color: "var(--accent)" }}>GPS runs available</span>
                  </div>
                </div>
                {spot.spot_notes && (
                  <p className="text-xs mt-3 line-clamp-2" style={{ color: "var(--muted)" }}>{spot.spot_notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
