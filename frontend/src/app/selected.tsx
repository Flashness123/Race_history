"use client";
import { useCallback, useEffect, useState } from "react";
import Map from "@/components/Map";
import { useRouter } from "next/navigation";
import ClickableRiderName from "@/components/ClickableRiderName";
import { getMissingEventInfo } from "@/lib/event-completeness";
import {
  CategoryFilters,
  DateFilterMode,
  getFilteredFeature,
} from "@/lib/event-filters";

const CATEGORY_FILTER_OPTIONS: Array<{
  key: keyof CategoryFilters;
  label: string;
  activeStyle: React.CSSProperties;
  dotColor: string;
}> = [
  { key: "WDSC", label: "WDSC", activeStyle: { borderColor: "#FF6200", background: "rgba(255,98,0,0.15)", color: "#FF6200" }, dotColor: "#FF6200" },
  { key: "EURO", label: "Euro", activeStyle: { borderColor: "#3b82f6", background: "rgba(59,130,246,0.15)", color: "#60a5fa" }, dotColor: "#3b82f6" },
  { key: "FREERIDE", label: "Freeride", activeStyle: { borderColor: "#22c55e", background: "rgba(34,197,94,0.15)", color: "#4ade80" }, dotColor: "#22c55e" },
  { key: "IDF", label: "IDF", activeStyle: { borderColor: "#a855f7", background: "rgba(168,85,247,0.15)", color: "#c084fc" }, dotColor: "#a855f7" },
  { key: "SPOT", label: "Spots", activeStyle: { borderColor: "#7A7A84", background: "rgba(122,122,132,0.15)", color: "#7A7A84" }, dotColor: "#7A7A84" },
  { key: "OUTLAW", label: "Outlaw", activeStyle: { borderColor: "#ef4444", background: "rgba(239,68,68,0.15)", color: "#f87171" }, dotColor: "#ef4444" },
  { key: "NATIONAL", label: "National", activeStyle: { borderColor: "#f59e0b", background: "rgba(245,158,11,0.15)", color: "#fbbf24" }, dotColor: "#f59e0b" },
  { key: "RACE", label: "Race", activeStyle: { borderColor: "#14b8a6", background: "rgba(20,184,166,0.15)", color: "#2dd4bf" }, dotColor: "#14b8a6" },
];

const DATE_FILTER_OPTIONS: Array<{ value: DateFilterMode; label: string }> = [
  { value: "all", label: "All" },
  { value: "future", label: "Future" },
  { value: "past", label: "Past" },
];

interface ClientSelectedProps {
  geojson: any;
  onFiltersChange?: (filters: CategoryFilters) => void;
}

export default function ClientSelected({ geojson, onFiltersChange }: ClientSelectedProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filters, setFilters] = useState<CategoryFilters>({ SPOT: true, WDSC: true, EURO: true, FREERIDE: true, IDF: true, OUTLAW: true, NATIONAL: true, RACE: true });
  const [dateFilter, setDateFilter] = useState<DateFilterMode>("all");

  const onSelect = useCallback((id: number | null) => {
    setSelectedId(id);
  }, []);

  // Notify parent when filters change
  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  useEffect(() => {
    if (!selectedId) return;

    const selectedFeature = (geojson?.features ?? []).find(
      (feature: any) => Number(feature.properties?.id) === selectedId
    );

    if (!selectedFeature) {
      setSelectedId(null);
      setDetail(null);
      return;
    }

    if (!getFilteredFeature(selectedFeature, filters, dateFilter)) {
      setSelectedId(null);
      setDetail(null);
      setErr(null);
    }
  }, [dateFilter, filters, geojson, selectedId]);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!selectedId) { setDetail(null); setErr(null); return; }
      setLoading(true); setErr(null);
      const res = await fetch(`/api/events/${selectedId}`, { cache: "no-store" });
      const data = await res.json();
      setLoading(false);
      if (!alive) return;
      if (!res.ok) { setErr(data?.error || "Failed to load"); setDetail(null); return; }
      setDetail(data);
    }
    load();
    return () => { alive = false; };
  }, [selectedId]);

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
              Category
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_FILTER_OPTIONS.map((option) => {
                const active = filters[option.key];
                return (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setFilters((current) => ({
                        ...current,
                        [option.key]: !current[option.key],
                      }))
                    }
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-all duration-200"
                    style={active
                      ? { ...option.activeStyle, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }
                      : { borderColor: "var(--border)", background: "var(--surface-raised)", color: "var(--muted)" }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: active ? option.dotColor : "var(--muted)" }} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-3 lg:min-w-[280px] lg:max-w-[320px]">
            <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
              Start Date
            </div>
            <div className="inline-flex rounded-full p-1 shadow-inner" style={{ background: "var(--surface-raised)" }}>
              {DATE_FILTER_OPTIONS.map((option) => {
                const active = dateFilter === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setDateFilter(option.value)}
                    className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
                    style={active
                      ? { background: "var(--accent)", color: "var(--paper)" }
                      : { color: "var(--muted)" }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Filters use each event&apos;s start date. Spots remain visible in every mode.
            </p>
          </div>
        </div>
      </div>

      {/* Map and Details Layout */}
      <div className={`gap-6 ${selectedId ? "flex flex-col md:grid" : "grid"}`} style={{ gridTemplateColumns: selectedId ? "1fr 400px" : "1fr" }}>
        <div className="rounded-xl overflow-hidden shadow-lg" style={{ border: "1px solid var(--border)" }}>
          <Map geojson={geojson} onSelect={onSelect} filters={filters} dateFilter={dateFilter} />
        </div>

        {selectedId && (
          <aside className="rounded-xl shadow-lg overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="max-h-[60vh] md:h-[70vh] overflow-auto">
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}></div>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>Loading event details...</p>
                  </div>
                </div>
              )}

              {err && (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "var(--surface-raised)" }}>
                    <span className="text-xl">⚠️</span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{err}</p>
                </div>
              )}

              {detail && (
                <div className="p-6 space-y-6">
                  {/* Event Header */}
                  <div className="flex items-start gap-4">
                    <img
                      src={detail.image_url ? `${process.env.NEXT_PUBLIC_API_BASE}${detail.image_url}` : "/file.svg"}
                      className="w-20 h-20 rounded-xl object-cover shadow-sm"
                      style={{ border: "2px solid var(--border)" }}
                      alt={detail.name}
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1" style={{ color: "var(--paper)" }}>{detail.name}</h3>
                      <div className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
                        <span className="text-sm">📍 {detail.location}</span>
                        <span style={{ color: "var(--border)" }}>•</span>
                        <span className="text-sm">📅 {detail.year}</span>
                      </div>
                      {(detail.category || detail.all_categories) && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(() => {
                            let categories = [];
                            if (detail.all_categories) {
                              try {
                                categories = JSON.parse(detail.all_categories);
                              } catch (e) {
                                categories = [detail.category];
                              }
                            } else if (detail.category) {
                              categories = [detail.category];
                            }

                            return categories.map((cat: string, index: number) => {
                              const getCategoryStyle = (category: string): React.CSSProperties => {
                                switch (category) {
                                  case 'WDSC': return { background: "rgba(255,98,0,0.15)", color: "#FF6200" };
                                  case 'EURO': return { background: "rgba(59,130,246,0.15)", color: "#60a5fa" };
                                  case 'FREERIDE': return { background: "rgba(34,197,94,0.15)", color: "#4ade80" };
                                  case 'IDF': return { background: "rgba(168,85,247,0.15)", color: "#c084fc" };
                                  case 'OUTLAW': return { background: "rgba(239,68,68,0.15)", color: "#f87171" };
                                  case 'NATIONAL': return { background: "rgba(245,158,11,0.15)", color: "#fbbf24" };
                                  case 'RACE': return { background: "rgba(20,184,166,0.15)", color: "#2dd4bf" };
                                  default: return { background: "var(--surface-raised)", color: "var(--muted)" };
                                }
                              };

                              const getCategoryLabel = (category: string) => {
                                switch (category) {
                                  case 'WDSC': return 'WDSC Event';
                                  case 'EURO': return 'Euro Tour';
                                  case 'FREERIDE': return 'Freeride Event';
                                  case 'IDF': return 'IDF Event';
                                  case 'OUTLAW': return 'Outlaw Event';
                                  case 'NATIONAL': return 'National Championship';
                                  case 'RACE': return 'Race Event';
                                  default: return 'Spot';
                                }
                              };

                              return (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={getCategoryStyle(cat)}>
                                  {getCategoryLabel(cat)}
                                </span>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="rounded-xl p-4" style={{ background: "var(--surface-raised)" }}>
                    <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--paper)" }}>
                      <span className="text-lg">📅</span>
                      Event Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      {detail.date_from && (
                        <div className="flex justify-between">
                          <span style={{ color: "var(--muted)" }}>Start Date:</span>
                          <span className="font-medium" style={{ color: "var(--paper)" }}>{new Date(detail.date_from).toLocaleDateString()}</span>
                        </div>
                      )}
                      {detail.date_to && (
                        <div className="flex justify-between">
                          <span style={{ color: "var(--muted)" }}>End Date:</span>
                          <span className="font-medium" style={{ color: "var(--paper)" }}>{new Date(detail.date_to).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span style={{ color: "var(--muted)" }}>Coordinates:</span>
                        <span className="font-medium" style={{ color: "var(--paper)" }}>{detail.lat.toFixed(4)}, {detail.lng.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Event Description */}
                  {detail.description && (
                    <div className="rounded-xl p-4" style={{ background: "var(--surface-raised)" }}>
                      <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--paper)" }}>
                        <span className="text-lg">📝</span>
                        Event Description
                      </h4>
                      <div className="rounded-lg p-3 whitespace-pre-wrap text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                        {detail.description}
                      </div>
                    </div>
                  )}

                  {detail.spot_notes && (
                    <div className="rounded-xl p-4" style={{ background: "var(--surface-raised)" }}>
                      <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--paper)" }}>
                        <span className="text-lg">⚠️</span>
                        Who to call &amp; what to be aware of
                      </h4>
                      <div className="rounded-lg p-3 whitespace-pre-wrap text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                        {detail.spot_notes}
                      </div>
                    </div>
                  )}

                  {(detail.track_record_open_name || detail.track_record_luge_name || detail.track_record_woman_name) && (
                    <div className="rounded-xl p-4" style={{ background: "var(--surface-raised)" }}>
                      <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--paper)" }}>
                        <span className="text-lg">⏱️</span>
                        Track Records
                      </h4>
                      <div className="space-y-2">
                        {detail.track_record_open_name && (
                          <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Open:</span>
                            <span className="text-sm" style={{ color: "var(--paper)" }}>{detail.track_record_open_name} - {detail.track_record_open_time}</span>
                          </div>
                        )}
                        {detail.track_record_luge_name && (
                          <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Luge:</span>
                            <span className="text-sm" style={{ color: "var(--paper)" }}>{detail.track_record_luge_name} - {detail.track_record_luge_time}</span>
                          </div>
                        )}
                        {detail.track_record_woman_name && (
                          <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Women:</span>
                            <span className="text-sm" style={{ color: "var(--paper)" }}>{detail.track_record_woman_name} - {detail.track_record_woman_time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Organizer */}
                  {(detail.organizer_name || detail.all_organizers) && (
                    <div className="rounded-xl p-4" style={{ background: "var(--surface-raised)" }}>
                      <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--paper)" }}>
                        <span className="text-lg">👤</span>
                        Organizer{detail.all_organizers ? 's' : ''}
                      </h4>
                      <div className="space-y-2">
                        {(() => {
                          let organizers = [];
                          if (detail.all_organizers) {
                            try {
                              organizers = JSON.parse(detail.all_organizers);
                            } catch (e) {
                              organizers = [detail.organizer_name];
                            }
                          } else if (detail.organizer_name) {
                            organizers = [detail.organizer_name];
                          }

                          return organizers.map((organizer: string, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                              <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                                {organizers.length > 1 ? `Organizer ${index + 1}:` : 'Event Organizer:'}
                              </span>
                              <ClickableRiderName
                                name={organizer}
                                className="text-sm hover:underline"
                                style={{ color: "var(--accent)" } as any}
                              />
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Results by Category */}
                  <div className="space-y-4">
                    {/* Open Results */}
                    {Array.isArray(detail.open_results) && detail.open_results.length > 0 && (
                      <div className="rounded-xl p-4" style={{ background: "var(--surface-raised)" }}>
                        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--paper)" }}>
                          <span className="text-lg">🏆</span>
                          Open Results ({detail.open_results.length})
                        </h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {detail.open_results.map((p: any) => (
                            <div key={p.position} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                p.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                p.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                p.position === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                'bg-gradient-to-br from-blue-500 to-blue-600'
                              }`}>
                                {p.position}
                              </div>
                              <div className="flex-1">
                                <ClickableRiderName name={p.name} className="font-medium text-sm transition-colors duration-200" style={{ color: "var(--paper)" } as any} />
                                {p.country && (
                                  <div className="text-xs" style={{ color: "var(--muted)" }}>{p.country}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Luge Results */}
                    {Array.isArray(detail.luge_results) && detail.luge_results.length > 0 && (
                      <div className="rounded-xl p-4" style={{ background: "var(--surface-raised)" }}>
                        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--paper)" }}>
                          <span className="text-lg">🛷</span>
                          Luge Results ({detail.luge_results.length})
                        </h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {detail.luge_results.map((p: any) => (
                            <div key={p.position} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                p.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                p.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                p.position === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                'bg-gradient-to-br from-blue-500 to-blue-600'
                              }`}>
                                {p.position}
                              </div>
                              <div className="flex-1">
                                <ClickableRiderName name={p.name} className="font-medium text-sm transition-colors duration-200" style={{ color: "var(--paper)" } as any} />
                                {p.country && (
                                  <div className="text-xs" style={{ color: "var(--muted)" }}>{p.country}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Women Results */}
                    {Array.isArray(detail.woman_results) && detail.woman_results.length > 0 && (
                      <div className="rounded-xl p-4" style={{ background: "var(--surface-raised)" }}>
                        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--paper)" }}>
                          <span className="text-lg">👩</span>
                          Women Results ({detail.woman_results.length})
                        </h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {detail.woman_results.map((p: any) => (
                            <div key={p.position} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                p.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                p.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                p.position === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                'bg-gradient-to-br from-blue-500 to-blue-600'
                              }`}>
                                {p.position}
                              </div>
                              <div className="flex-1">
                                <ClickableRiderName name={p.name} className="font-medium text-sm transition-colors duration-200" style={{ color: "var(--paper)" } as any} />
                                {p.country && (
                                  <div className="text-xs" style={{ color: "var(--muted)" }}>{p.country}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Qualifier Results */}
                    {Array.isArray(detail.qualifier_results) && detail.qualifier_results.length > 0 && (
                      <div className="rounded-xl p-4" style={{ background: "var(--surface-raised)" }}>
                        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--paper)" }}>
                          <span className="text-lg">🎯</span>
                          Qualifiers ({detail.qualifier_results.length})
                        </h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {detail.qualifier_results.map((p: any) => (
                            <div key={p.position} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-green-500 to-teal-600">
                                Q{p.position}
                              </div>
                              <div className="flex-1">
                                <ClickableRiderName name={p.name} className="font-medium text-sm transition-colors duration-200" style={{ color: "var(--paper)" } as any} />
                                {p.country && (
                                  <div className="text-xs" style={{ color: "var(--muted)" }}>{p.country}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Source Link */}
                  {detail.source_url && (
                    <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                      <a
                        href={detail.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                        style={{ background: "var(--surface-raised)", color: "var(--accent)", border: "1px solid var(--border)" }}
                      >
                        <span>🔗</span>
                        View Source
                      </a>
                    </div>
                  )}

                  {/* Missing Information */}
                  {(() => {
                    const missingInfo = getMissingEventInfo(detail);
                    if (missingInfo.length > 0) {
                      return (
                        <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                          <div className="rounded-lg p-4" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <span className="text-lg" style={{ color: "var(--accent)" }}>⚠️</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium mb-2" style={{ color: "var(--paper)" }}>
                                  Missing Information
                                </h4>
                                <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                                  This event is missing: {missingInfo.join(", ")}
                                </p>
                                <button
                                  onClick={() => {
                                    const params = new URLSearchParams({
                                      edit: 'true',
                                      eventId: detail.id.toString(),
                                      name: detail.name || '',
                                      location: detail.location || '',
                                      lat: detail.lat?.toString() || '',
                                      lng: detail.lng?.toString() || '',
                                      category: detail.category || 'WDSC',
                                      date_from: detail.date_from || '',
                                      date_to: detail.date_to || '',
                                      source_url: detail.source_url || '',
                                      event_description: detail.description || '',
                                      track_record_open_name: detail.track_record_open_name || '',
                                      track_record_open_time: detail.track_record_open_time || '',
                                      track_record_luge_name: detail.track_record_luge_name || '',
                                      track_record_luge_time: detail.track_record_luge_time || '',
                                      track_record_woman_name: detail.track_record_woman_name || '',
                                      track_record_woman_time: detail.track_record_woman_time || '',
                                      organizer_name: detail.organizer_name || '',
                                      spot_notes: detail.spot_notes || '',
                                    });

                                    if (detail.open_results && detail.open_results.length > 0) {
                                      detail.open_results.forEach((rider: any, index: number) => {
                                        params.append(`open_${index}_name`, rider.name);
                                        params.append(`open_${index}_position`, rider.position.toString());
                                        if (rider.country) params.append(`open_${index}_country`, rider.country);
                                      });
                                    }

                                    if (detail.luge_results && detail.luge_results.length > 0) {
                                      detail.luge_results.forEach((rider: any, index: number) => {
                                        params.append(`luge_${index}_name`, rider.name);
                                        params.append(`luge_${index}_position`, rider.position.toString());
                                        if (rider.country) params.append(`luge_${index}_country`, rider.country);
                                      });
                                    }

                                    if (detail.woman_results && detail.woman_results.length > 0) {
                                      detail.woman_results.forEach((rider: any, index: number) => {
                                        params.append(`woman_${index}_name`, rider.name);
                                        params.append(`woman_${index}_position`, rider.position.toString());
                                        if (rider.country) params.append(`woman_${index}_country`, rider.country);
                                      });
                                    }

                                    if (detail.qualifier_results && detail.qualifier_results.length > 0) {
                                      detail.qualifier_results.forEach((rider: any, index: number) => {
                                        params.append(`qualifier_${index}_name`, rider.name);
                                        params.append(`qualifier_${index}_position`, rider.position.toString());
                                        if (rider.country) params.append(`qualifier_${index}_country`, rider.country);
                                      });
                                    }
                                    router.push(`/submit?${params.toString()}`);
                                  }}
                                  className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-200"
                                  style={{ background: "var(--accent)", color: "var(--paper)" }}
                                >
                                  <span>✏️</span>
                                  Submit Missing Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Close Button */}
                  <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="w-full px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                      style={{ background: "var(--surface-raised)", color: "var(--muted)", border: "1px solid var(--border)" }}
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
