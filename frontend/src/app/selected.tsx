"use client";
import { useCallback, useEffect, useState } from "react";
import Map from "@/components/Map";

export default function ClientSelected({ geojson }: { geojson: any }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filters, setFilters] = useState<{SPOT:boolean;WDSC:boolean;EURO:boolean;FREERIDE:boolean;IDF:boolean}>({ SPOT: true, WDSC: true, EURO: true, FREERIDE: true, IDF: true });

  const onSelect = useCallback((id: number | null) => {
    setSelectedId(id);
  }, []);

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
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
        <span className="text-sm font-medium text-gray-700">Filter by category:</span>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={filters.WDSC} 
              onChange={e=>setFilters(f=>({...f, WDSC:e.target.checked}))}
              className="w-4 h-4 text-orange-600 bg-gray-100 border-orange-300 rounded focus:ring-orange-500 focus:ring-2 checked:bg-orange-600 checked:border-orange-600 focus:outline-none appearance-none relative"
              style={{
                accentColor: 'transparent',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                backgroundImage: filters.WDSC ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z\'/%3e%3c/svg%3e")' : 'none',
                backgroundSize: '12px 12px',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <span className="text-sm font-medium text-orange-600 transition-colors duration-200">WDSC Events</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={filters.EURO} 
              onChange={e=>setFilters(f=>({...f, EURO:e.target.checked}))}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-blue-300 rounded focus:ring-blue-500 focus:ring-2 checked:bg-blue-600 checked:border-blue-600 focus:outline-none appearance-none relative"
              style={{
                accentColor: 'transparent',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                backgroundImage: filters.EURO ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z\'/%3e%3c/svg%3e")' : 'none',
                backgroundSize: '12px 12px',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <span className="text-sm font-medium text-blue-600 transition-colors duration-200">Euro Tour</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={filters.FREERIDE} 
              onChange={e=>setFilters(f=>({...f, FREERIDE:e.target.checked}))}
              className="w-4 h-4 text-green-600 bg-gray-100 border-green-300 rounded focus:ring-green-500 focus:ring-2 checked:bg-green-600 checked:border-green-600 focus:outline-none appearance-none relative"
              style={{
                accentColor: 'transparent',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                backgroundImage: filters.FREERIDE ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z\'/%3e%3c/svg%3e")' : 'none',
                backgroundSize: '12px 12px',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <span className="text-sm font-medium text-green-600 transition-colors duration-200">Freerides</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={filters.IDF} 
              onChange={e=>setFilters(f=>({...f, IDF:e.target.checked}))}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-purple-300 rounded focus:ring-purple-500 focus:ring-2 checked:bg-purple-600 checked:border-purple-600 focus:outline-none appearance-none relative"
              style={{
                accentColor: 'transparent',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                backgroundImage: filters.IDF ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z\'/%3e%3c/svg%3e")' : 'none',
                backgroundSize: '12px 12px',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <span className="text-sm font-medium text-purple-600 transition-colors duration-200">IDF Events</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={filters.SPOT} 
              onChange={e=>setFilters(f=>({...f, SPOT:e.target.checked}))}
              className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2 checked:bg-gray-600 checked:border-gray-600 focus:outline-none appearance-none relative"
              style={{
                accentColor: 'transparent',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                backgroundImage: filters.SPOT ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z\'/%3e%3c/svg%3e")' : 'none',
                backgroundSize: '12px 12px',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <span className="text-sm font-medium text-gray-600 transition-colors duration-200">Spots</span>
          </label>
        </div>
      </div>

      {/* Map and Details Layout */}
      <div className={`grid gap-6 transition-[grid-template-columns] duration-300 ease-out`} style={{ gridTemplateColumns: selectedId ? "1fr 400px" : "1fr" }}>
        <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200/50">
          <Map geojson={geojson} onSelect={onSelect} filters={filters} />
        </div>
        
        {selectedId && (
          <aside className="bg-white rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div className="h-[70vh] overflow-auto">
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-sm">Loading event details...</p>
                  </div>
                </div>
              )}
              
              {err && (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-red-600 text-xl">⚠️</span>
                  </div>
                  <p className="text-red-600 text-sm">{err}</p>
                </div>
              )}
              
              {detail && (
                <div className="p-6 space-y-6">
                  {/* Event Header */}
                  <div className="flex items-start gap-4">
                    <img 
                      src={detail.image_url ? `${process.env.NEXT_PUBLIC_API_BASE}${detail.image_url}` : "/file.svg"} 
                      className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 shadow-sm" 
                      alt={detail.name} 
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{detail.name}</h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-sm">📍 {detail.location}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm">📅 {detail.year}</span>
                      </div>
                      {detail.category && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            detail.category === 'WDSC' ? 'bg-orange-100 text-orange-800' :
                            detail.category === 'EURO' ? 'bg-blue-100 text-blue-800' :
                            detail.category === 'FREERIDE' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {detail.category === 'WDSC' ? 'WDSC Event' :
                             detail.category === 'EURO' ? 'Euro Tour' :
                             detail.category === 'FREERIDE' ? 'Freeride Event' : 'Spot'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      Event Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      {detail.date_from && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Date:</span>
                          <span className="font-medium">{new Date(detail.date_from).toLocaleDateString()}</span>
                        </div>
                      )}
                      {detail.date_to && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">End Date:</span>
                          <span className="font-medium">{new Date(detail.date_to).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coordinates:</span>
                        <span className="font-medium">{detail.lat.toFixed(4)}, {detail.lng.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Track Records */}
                  {(detail.track_record_open_name || detail.track_record_luge_name || detail.track_record_woman_name) && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-lg">⏱️</span>
                        Track Records
                      </h4>
                      <div className="space-y-2">
                        {detail.track_record_open_name && (
                          <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200">
                            <span className="text-sm font-medium text-gray-700">Open:</span>
                            <span className="text-sm">{detail.track_record_open_name} - {detail.track_record_open_time}</span>
                          </div>
                        )}
                        {detail.track_record_luge_name && (
                          <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200">
                            <span className="text-sm font-medium text-gray-700">Luge:</span>
                            <span className="text-sm">{detail.track_record_luge_name} - {detail.track_record_luge_time}</span>
                          </div>
                        )}
                        {detail.track_record_woman_name && (
                          <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200">
                            <span className="text-sm font-medium text-gray-700">Women:</span>
                            <span className="text-sm">{detail.track_record_woman_name} - {detail.track_record_woman_time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Results by Category */}
                  <div className="space-y-4">
                    {/* Open Results */}
                    {Array.isArray(detail.open_results) && detail.open_results.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-lg">🏆</span>
                          Open Results ({detail.open_results.length})
                        </h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {detail.open_results.map((p: any) => (
                            <div key={p.position} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                p.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                p.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                p.position === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                'bg-gradient-to-br from-blue-500 to-blue-600'
                              }`}>
                                {p.position}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                                {p.country && (
                                  <div className="text-xs text-gray-500">{p.country}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Luge Results */}
                    {Array.isArray(detail.luge_results) && detail.luge_results.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-lg">🛷</span>
                          Luge Results ({detail.luge_results.length})
                        </h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {detail.luge_results.map((p: any) => (
                            <div key={p.position} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                p.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                p.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                p.position === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                'bg-gradient-to-br from-blue-500 to-blue-600'
                              }`}>
                                {p.position}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                                {p.country && (
                                  <div className="text-xs text-gray-500">{p.country}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Women Results */}
                    {Array.isArray(detail.woman_results) && detail.woman_results.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-lg">👩</span>
                          Women Results ({detail.woman_results.length})
                        </h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {detail.woman_results.map((p: any) => (
                            <div key={p.position} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                p.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                p.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                p.position === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                'bg-gradient-to-br from-blue-500 to-blue-600'
                              }`}>
                                {p.position}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                                {p.country && (
                                  <div className="text-xs text-gray-500">{p.country}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Qualifier Results */}
                    {Array.isArray(detail.qualifier_results) && detail.qualifier_results.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-lg">🎯</span>
                          Qualifiers ({detail.qualifier_results.length})
                        </h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {detail.qualifier_results.map((p: any) => (
                            <div key={p.position} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-green-500 to-teal-600">
                                Q{p.position - 100}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                                {p.country && (
                                  <div className="text-xs text-gray-500">{p.country}</div>
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
                    <div className="pt-4 border-t border-gray-200">
                      <a 
                        href={detail.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium"
                      >
                        <span>🔗</span>
                        View Source
                      </a>
                    </div>
                  )}

                  {/* Close Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => setSelectedId(null)} 
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
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


