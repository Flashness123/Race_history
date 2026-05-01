"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import ClickableRiderName from "@/components/ClickableRiderName";

const ReportModal = dynamic(() => import("@/components/ReportModal"), { ssr: false });

function getCategoryStyle(category: string): React.CSSProperties {
  switch (category) {
    case "WDSC": return { background: "rgba(255,98,0,0.18)", color: "#FF6200", border: "1px solid rgba(255,98,0,0.35)" };
    case "EURO": return { background: "rgba(59,130,246,0.18)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.35)" };
    case "FREERIDE": return { background: "rgba(34,197,94,0.18)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.35)" };
    case "IDF": return { background: "rgba(168,85,247,0.18)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.35)" };
    case "OUTLAW": return { background: "rgba(239,68,68,0.18)", color: "#f87171", border: "1px solid rgba(239,68,68,0.35)" };
    case "NATIONAL": return { background: "rgba(245,158,11,0.18)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.35)" };
    case "RACE": return { background: "rgba(20,184,166,0.18)", color: "#2dd4bf", border: "1px solid rgba(20,184,166,0.35)" };
    default: return { background: "rgba(122,122,132,0.18)", color: "#a0a0b0", border: "1px solid rgba(122,122,132,0.35)" };
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "WDSC": return "WDSC Event";
    case "EURO": return "Euro Tour";
    case "FREERIDE": return "Freeride Event";
    case "IDF": return "IDF Event";
    case "OUTLAW": return "Outlaw Event";
    case "NATIONAL": return "National Championship";
    case "RACE": return "Race Event";
    default: return "Longboard Spot";
  }
}

function PositionBadge({ position }: { position: number }) {
  const base = "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0";
  if (position === 1) return <div className={base} style={{ background: "linear-gradient(135deg, #facc15, #d97706)" }}>{position}</div>;
  if (position === 2) return <div className={base} style={{ background: "linear-gradient(135deg, #d1d5db, #6b7280)" }}>{position}</div>;
  if (position === 3) return <div className={base} style={{ background: "linear-gradient(135deg, #fb923c, #b45309)" }}>{position}</div>;
  return <div className={`${base} text-xs`} style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>{position}</div>;
}

export default function EventFullPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.id);

  const [detail, setDetail] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" }).then((r) => r.json()).then(setMe).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/events/${eventId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--ink)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-0.5 h-10 animate-pulse" style={{ background: "var(--accent)" }} />
          <p className="text-sm tracking-[0.3em]" style={{ fontFamily: "var(--font-display), cursive", color: "var(--muted)" }}>LOADING</p>
        </div>
      </main>
    );
  }

  if (!detail || detail.error) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--ink)" }}>
        <div className="text-center">
          <p className="text-2xl mb-4" style={{ color: "var(--muted)" }}>Event not found</p>
          <button onClick={() => router.back()} className="underline text-sm" style={{ color: "var(--accent)" }}>← Go back</button>
        </div>
      </main>
    );
  }

  const isSpot = detail.category === "SPOT" || !detail.category;
  const imageUrl = detail.image_url
    ? `${process.env.NEXT_PUBLIC_API_BASE}${detail.image_url}`
    : "/file.svg";

  const categories: string[] = (() => {
    if (detail.all_categories) {
      try { return JSON.parse(detail.all_categories); } catch { /* fall through */ }
    }
    return detail.category ? [detail.category] : ["SPOT"];
  })();

  const hasResults = (
    (detail.open_results?.length > 0) ||
    (detail.luge_results?.length > 0) ||
    (detail.woman_results?.length > 0) ||
    (detail.qualifier_results?.length > 0)
  );

  return (
    <main className="min-h-screen" style={{ background: "var(--ink)", color: "var(--paper)" }}>
      {/* ── Hero ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "clamp(260px, 40vh, 480px)" }}>
        <img
          src={imageUrl}
          alt={detail.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.55)" }}
        />
        {/* gradient overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--ink) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }} />

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transition-opacity hover:opacity-80"
            style={{ background: "rgba(0,0,0,0.5)", color: "var(--paper)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            ← Back
          </button>
        </div>

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((cat) => (
              <span key={cat} className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide" style={getCategoryStyle(cat)}>
                {getCategoryLabel(cat)}
              </span>
            ))}
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-2 leading-tight"
            style={{ fontFamily: "var(--font-display), cursive", color: "var(--paper)", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
          >
            {detail.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
            <span>📍 {detail.location}</span>
            {detail.year && <span>📅 {detail.year}</span>}
            {detail.date_from && (
              <span>
                🗓 {new Date(detail.date_from).toLocaleDateString()}
                {detail.date_to && ` – ${new Date(detail.date_to).toLocaleDateString()}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* Action buttons row */}
        <div className="flex flex-wrap gap-3">
          {isSpot && (
            <a
              href={`/events/${eventId}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
              style={{ background: "var(--accent)", color: "var(--paper)" }}
            >
              📡 GPS Run Comparison
            </a>
          )}
          {detail.source_url && (
            <a
              href={detail.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-opacity hover:opacity-80"
              style={{ background: "var(--surface-raised)", color: "var(--paper)", border: "1px solid var(--border)" }}
            >
              🔗 View Source
            </a>
          )}
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-70 ml-auto"
            style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--border)" }}
          >
            ⚑ Report Issue
          </button>
        </div>

        {/* Description */}
        {detail.description && (
          <section className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--paper)" }}>
              <span>📝</span> Event Description
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--muted)" }}>{detail.description}</p>
          </section>
        )}

        {/* Spot notes */}
        {detail.spot_notes && (
          <section className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--paper)" }}>
              <span>⚠️</span> Who to call &amp; what to be aware of
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--muted)" }}>{detail.spot_notes}</p>
          </section>
        )}

        {/* Results */}
        {hasResults && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--paper)" }}>
              <span>🏆</span> Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {detail.open_results?.length > 0 && (
                <ResultCard title="Open" icon="🏆" results={detail.open_results} qualifier={false} />
              )}
              {detail.luge_results?.length > 0 && (
                <ResultCard title="Luge" icon="🛷" results={detail.luge_results} qualifier={false} />
              )}
              {detail.woman_results?.length > 0 && (
                <ResultCard title="Women" icon="👩" results={detail.woman_results} qualifier={false} />
              )}
              {detail.qualifier_results?.length > 0 && (
                <ResultCard title="Qualifiers" icon="🎯" results={detail.qualifier_results} qualifier={true} />
              )}
            </div>
          </section>
        )}

        {/* Track records */}
        {(detail.track_record_open_name || detail.track_record_luge_name || detail.track_record_woman_name) && (
          <section className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--paper)" }}>
              <span>⏱️</span> Track Records
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {detail.track_record_open_name && (
                <TrackRecordCard label="Open" name={detail.track_record_open_name} time={detail.track_record_open_time} />
              )}
              {detail.track_record_luge_name && (
                <TrackRecordCard label="Luge" name={detail.track_record_luge_name} time={detail.track_record_luge_time} />
              )}
              {detail.track_record_woman_name && (
                <TrackRecordCard label="Women" name={detail.track_record_woman_name} time={detail.track_record_woman_time} />
              )}
            </div>
          </section>
        )}

        {/* Organizer */}
        {detail.organizer_name && (
          <section className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--paper)" }}>
              <span>👤</span> Organizer
            </h2>
            <ClickableRiderName
              name={detail.organizer_name}
              className="text-base font-medium hover:underline"
              style={{ color: "var(--accent)" } as React.CSSProperties}
            />
          </section>
        )}

        {/* Coordinates */}
        <section className="rounded-2xl p-5 flex flex-wrap items-center gap-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            <span className="font-medium" style={{ color: "var(--paper)" }}>Coordinates: </span>
            {detail.lat?.toFixed(5)}, {detail.lng?.toFixed(5)}
          </div>
          <a
            href={`https://maps.google.com/?q=${detail.lat},${detail.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: "var(--surface-raised)", color: "var(--accent)", border: "1px solid var(--border)" }}
          >
            Open in Maps ↗
          </a>
        </section>
      </div>

      {showReport && (
        <ReportModal
          eventId={eventId}
          eventName={detail.name}
          isAuthenticated={!!me?.authenticated}
          onClose={() => setShowReport(false)}
        />
      )}
    </main>
  );
}

function ResultCard({ title, icon, results, qualifier }: { title: string; icon: string; results: any[]; qualifier: boolean }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
        <span>{icon}</span> {title} <span className="text-xs">({results.length})</span>
      </h3>
      <div className="space-y-2 max-h-56 overflow-y-auto">
        {results.slice().sort((a, b) => a.position - b.position).map((r: any) => (
          <div key={r.position} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: "var(--surface-raised)" }}>
            {qualifier ? (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #10b981, #0d9488)" }}>
                Q{r.position}
              </div>
            ) : (
              <PositionBadge position={r.position} />
            )}
            <div className="flex-1 min-w-0">
              <ClickableRiderName
                name={r.name}
                className="text-sm font-medium truncate block"
                style={{ color: "var(--paper)" } as React.CSSProperties}
              />
              {r.country && <div className="text-xs truncate" style={{ color: "var(--muted)" }}>{r.country}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackRecordCard({ label, name, time }: { label: string; name: string; time?: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
      <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>{label}</div>
      <ClickableRiderName
        name={name}
        className="text-sm font-medium mb-1 block"
        style={{ color: "var(--paper)" } as React.CSSProperties}
      />
      {time && <div className="text-xl font-bold" style={{ fontFamily: "var(--font-display), cursive", color: "var(--accent)" }}>{time}</div>}
    </div>
  );
}
