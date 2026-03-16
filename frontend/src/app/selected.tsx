"use client";
import { useCallback, useEffect, useState } from "react";
import Map from "@/components/Map";
import { useRouter } from "next/navigation";
import ClickableRiderName from "@/components/ClickableRiderName";
import { getMissingEventInfo } from "@/lib/event-completeness";

type Filters = {SPOT:boolean;WDSC:boolean;EURO:boolean;FREERIDE:boolean;IDF:boolean;OUTLAW:boolean;NATIONAL:boolean;RACE:boolean};

interface ClientSelectedProps {
  geojson: any;
  onFiltersChange?: (filters: Filters) => void;
}

export default function ClientSelected({ geojson, onFiltersChange }: ClientSelectedProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ SPOT: true, WDSC: true, EURO: true, FREERIDE: true, IDF: true, OUTLAW: true, NATIONAL: true, RACE: true });

  const onSelect = useCallback((id: number | null) => {
    setSelectedId(id);
  }, []);

  // Notify parent when filters change
  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

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
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={filters.OUTLAW} 
              onChange={e=>setFilters(f=>({...f, OUTLAW:e.target.checked}))}
              className="w-4 h-4 text-red-600 bg-gray-100 border-red-300 rounded focus:ring-red-500 focus:ring-2 checked:bg-red-600 checked:border-red-600 focus:outline-none appearance-none relative"
              style={{
                accentColor: 'transparent',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                backgroundImage: filters.OUTLAW ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z\'/%3e%3c/svg%3e")' : 'none',
                backgroundSize: '12px 12px',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <span className="text-sm font-medium text-red-600 transition-colors duration-200">Outlaw Events</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={filters.NATIONAL} 
              onChange={e=>setFilters(f=>({...f, NATIONAL:e.target.checked}))}
              className="w-4 h-4 text-yellow-600 bg-gray-100 border-yellow-300 rounded focus:ring-yellow-500 focus:ring-2 checked:bg-yellow-600 checked:border-yellow-600 focus:outline-none appearance-none relative"
              style={{
                accentColor: 'transparent',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                backgroundImage: filters.NATIONAL ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z\'/%3e%3c/svg%3e")' : 'none',
                backgroundSize: '12px 12px',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <span className="text-sm font-medium text-yellow-600 transition-colors duration-200">National Championships</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={filters.RACE} 
              onChange={e=>setFilters(f=>({...f, RACE:e.target.checked}))}
              className="w-4 h-4 text-teal-600 bg-gray-100 border-teal-300 rounded focus:ring-teal-500 focus:ring-2 checked:bg-teal-600 checked:border-teal-600 focus:outline-none appearance-none relative"
              style={{
                accentColor: 'transparent',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                backgroundImage: filters.RACE ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z\'/%3e%3c/svg%3e")' : 'none',
                backgroundSize: '12px 12px',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <span className="text-sm font-medium text-teal-600 transition-colors duration-200">Race Events</span>
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
                    <span className="text-red-600 text-sm font-semibold">!</span>
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
                        <span className="text-sm">Location: {detail.location}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm">Year: {detail.year}</span>
                      </div>
                      {(detail.category || detail.all_categories) && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(() => {
                            // Parse all categories if available, otherwise use single category
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
                              const getCategoryStyle = (category: string) => {
                                switch (category) {
                                  case 'WDSC': return 'bg-orange-100 text-orange-800';
                                  case 'EURO': return 'bg-blue-100 text-blue-800';
                                  case 'FREERIDE': return 'bg-green-100 text-green-800';
                                  case 'IDF': return 'bg-purple-100 text-purple-800';
                                  case 'OUTLAW': return 'bg-red-100 text-red-800';
                                  case 'NATIONAL': return 'bg-yellow-100 text-yellow-800';
                                  case 'RACE': return 'bg-teal-100 text-teal-800';
                                  default: return 'bg-gray-100 text-gray-800';
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
                                <span key={index} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryStyle(cat)}`}>
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
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Event Details</h4>
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
                  {detail.description && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Event Description</h4>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 whitespace-pre-wrap text-sm text-gray-700">
                        {detail.description}
                      </div>
                    </div>
                  )}

                  {detail.spot_notes && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Spot Notes</h4>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 whitespace-pre-wrap text-sm text-gray-700">
                        {detail.spot_notes}
                      </div>
                    </div>
                  )}

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

                  {/* Organizer */}
                  {(detail.organizer_name || detail.all_organizers) && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Organizer{detail.all_organizers ? 's' : ''}</h4>
                      <div className="space-y-2">
                        {(() => {
                          // Parse all organizers if available, otherwise use single organizer
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
                            <div key={index} className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200">
                              <span className="text-sm font-medium text-gray-700">
                                {organizers.length > 1 ? `Organizer ${index + 1}:` : 'Event Organizer:'}
                              </span>
                              <ClickableRiderName 
                                name={organizer} 
                                className="text-sm warm-link hover:underline"
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
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Open Results ({detail.open_results.length})</h4>
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
                                <ClickableRiderName name={p.name} className="font-medium text-gray-900 text-sm hover:text-[var(--warm-accent)] transition-colors duration-200" />
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
                        <h4 className="font-semibold text-gray-900 mb-3">Luge Results ({detail.luge_results.length})</h4>
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
                                <ClickableRiderName name={p.name} className="font-medium text-gray-900 text-sm hover:text-[var(--warm-accent)] transition-colors duration-200" />
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
                        <h4 className="font-semibold text-gray-900 mb-3">Women Results ({detail.woman_results.length})</h4>
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
                                <ClickableRiderName name={p.name} className="font-medium text-gray-900 text-sm hover:text-[var(--warm-accent)] transition-colors duration-200" />
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
                        <h4 className="font-semibold text-gray-900 mb-3">Qualifiers ({detail.qualifier_results.length})</h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {detail.qualifier_results.map((p: any) => (
                            <div key={p.position} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-green-500 to-teal-600">
                                Q{p.position}
                              </div>
                              <div className="flex-1">
                                <ClickableRiderName name={p.name} className="font-medium text-gray-900 text-sm hover:text-[var(--warm-accent)] transition-colors duration-200" />
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
                        className="warm-button px-4 py-2 text-sm font-medium"
                      >
                        View Source
                      </a>
                    </div>
                  )}

                  {/* Missing Information */}
                  {(() => {
                    const missingInfo = getMissingEventInfo(detail);
                    if (missingInfo.length > 0) {
                      return (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <span className="text-yellow-700 text-xs font-semibold">Note</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                                  Missing Information
                                </h4>
                                <p className="text-xs text-yellow-700 mb-3">
                                  This event is missing: {missingInfo.join(", ")}
                                </p>
                                <button
                                  onClick={() => {
                                    // Navigate to submit page with prefilled data
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
                                    
                                    // Add rider data
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
                                  className="warm-button-secondary px-3 py-2 text-xs font-medium"
                                >
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
                  <div className="pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => setSelectedId(null)} 
                      className="warm-button-secondary w-full px-4 py-2 font-medium"
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
