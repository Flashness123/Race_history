"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClickableRiderName from "@/components/ClickableRiderName";
import { getMissingEventInfo } from "@/lib/event-completeness";

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

interface EventMissingInfoProps {
  eventId: number;
}

// Component to display missing information for each event
function EventMissingInfo({ eventId }: EventMissingInfoProps) {
  const router = useRouter();
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/events/${eventId}`);
        const details = await res.json();
        setEventDetails(details);
      } catch (error) {
        console.error("Failed to fetch event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [eventId]);

  if (loading) {
    return (
      <div className="mt-3 p-2 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-500">Loading details...</div>
      </div>
    );
  }

  const missingInfo = getMissingEventInfo(eventDetails);
  
  if (missingInfo.length === 0) {
    return null; // Don't show anything if no missing info
  }

  return (
    <div className="mt-3 rounded-lg border border-[rgba(143,115,87,0.18)] bg-[rgba(248,242,234,0.72)] p-2">
      <div className="flex items-start gap-2">
        <span className="eyebrow text-[10px] text-[var(--accent-warm)]">Note</span>
        <div className="flex-1">
          <div className="mb-1 text-xs font-medium text-[var(--ink)]">
            Missing: {missingInfo.join(", ")}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event card click
              // Navigate to submit page with prefilled data
              const params = new URLSearchParams({
                edit: 'true',
                eventId: eventId.toString(),
                name: eventDetails?.name || '',
                location: eventDetails?.location || '',
                lat: eventDetails?.lat?.toString() || '',
                lng: eventDetails?.lng?.toString() || '',
                category: eventDetails?.category || 'WDSC',
                date_from: eventDetails?.date_from || '',
                date_to: eventDetails?.date_to || '',
                source_url: eventDetails?.source_url || '',
                event_description: eventDetails?.description || '',
                track_record_open_name: eventDetails?.track_record_open_name || '',
                track_record_open_time: eventDetails?.track_record_open_time || '',
                track_record_luge_name: eventDetails?.track_record_luge_name || '',
                track_record_luge_time: eventDetails?.track_record_luge_time || '',
                track_record_woman_name: eventDetails?.track_record_woman_name || '',
                track_record_woman_time: eventDetails?.track_record_woman_time || '',
                organizer_name: eventDetails?.organizer_name || '',
                spot_notes: eventDetails?.spot_notes || '',
              });
              
              // Add rider data
              if (eventDetails?.open_results && eventDetails.open_results.length > 0) {
                eventDetails.open_results.forEach((rider: any, index: number) => {
                  params.append(`open_${index}_name`, rider.name);
                  params.append(`open_${index}_position`, rider.position.toString());
                  if (rider.country) params.append(`open_${index}_country`, rider.country);
                });
              }
              
              if (eventDetails?.luge_results && eventDetails.luge_results.length > 0) {
                eventDetails.luge_results.forEach((rider: any, index: number) => {
                  params.append(`luge_${index}_name`, rider.name);
                  params.append(`luge_${index}_position`, rider.position.toString());
                  if (rider.country) params.append(`luge_${index}_country`, rider.country);
                });
              }
              
              if (eventDetails?.woman_results && eventDetails.woman_results.length > 0) {
                eventDetails.woman_results.forEach((rider: any, index: number) => {
                  params.append(`woman_${index}_name`, rider.name);
                  params.append(`woman_${index}_position`, rider.position.toString());
                  if (rider.country) params.append(`woman_${index}_country`, rider.country);
                });
              }
              
              if (eventDetails?.qualifier_results && eventDetails.qualifier_results.length > 0) {
                eventDetails.qualifier_results.forEach((rider: any, index: number) => {
                  params.append(`qualifier_${index}_name`, rider.name);
                  params.append(`qualifier_${index}_position`, rider.position.toString());
                  if (rider.country) params.append(`qualifier_${index}_country`, rider.country);
                });
              }
              
              router.push(`/submit?${params.toString()}`);
            }}
            className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 transition-colors duration-200"
          >
            Submit Missing Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientEventsList({ year }: ClientEventsListProps) {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [eventDetailsCache, setEventDetailsCache] = useState<{[key: number]: any}>({});

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

  const handleEventClick = async (event: Event) => {
    setSelectedEvent(event);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/events/${event.id}`);
      const details = await res.json();
      setEventDetails(details);
    } catch (error) {
      console.error("Failed to fetch event details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchEventDetails = async (eventId: number) => {
    if (eventDetailsCache[eventId]) {
      return eventDetailsCache[eventId];
    }
    
    try {
      const res = await fetch(`/api/events/${eventId}`);
      const details = await res.json();
      setEventDetailsCache(prev => ({ ...prev, [eventId]: details }));
      return details;
    } catch (error) {
      console.error("Failed to fetch event details:", error);
      return null;
    }
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setEventDetails(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[rgba(129,100,75,0.15)] border-t-[var(--accent-warm)]"></div>
      </div>
    );
  }

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-[1.25rem] border border-[var(--border)] bg-[rgba(248,242,234,0.88)] px-4 py-3 pl-10 pr-4 text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[rgba(129,100,75,0.18)] transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="eyebrow text-[10px] text-[var(--muted)]">Find</span>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            onClick={() => handleEventClick(event)}
            className="surface-card cursor-pointer overflow-hidden rounded-[1.5rem] transition-all duration-300 group hover:-translate-y-1 hover:border-[var(--border-strong)]"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={event.image_url ? `${process.env.NEXT_PUBLIC_API_BASE}${event.image_url}` : "/file.svg"}
                alt={event.name}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-[var(--ink)] transition-colors duration-200 group-hover:text-[var(--accent-warm)]">
                {event.name}
              </h3>
              <div className="space-y-1 text-sm text-[var(--ink-soft)]">
                <div className="flex items-center gap-2">
                  <span className="eyebrow text-[10px]">Location</span>
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="eyebrow text-[10px]">Year</span>
                  <span>{event.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="eyebrow text-[10px]">Type</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.category === 'WDSC' ? 'bg-orange-100 text-orange-800' :
                    event.category === 'EURO' ? 'bg-blue-100 text-blue-800' :
                    event.category === 'FREERIDE' ? 'bg-green-100 text-green-800' :
                    event.category === 'IDF' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.category === 'WDSC' ? 'WDSC Event' :
                     event.category === 'EURO' ? 'Euro Tour' :
                     event.category === 'FREERIDE' ? 'Freeride Event' :
                     event.category === 'IDF' ? 'IDF Event' : 'Spot'}
                  </span>
                </div>
              </div>
              
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="surface-card mx-auto max-w-xl rounded-[1.5rem] px-6 py-10">
          <h3 className="mb-2 text-xl font-semibold text-[var(--ink)]">No events found</h3>
          <p className="text-[var(--ink-soft)]">
            {searchTerm ? "Try adjusting your search terms" : "No events available for this year"}
          </p>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(24,19,15,0.52)] p-4 backdrop-blur-sm">
          <div className="surface-card-strong max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[1.75rem]">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
              <h2 className="text-2xl font-semibold text-[var(--ink)]">Event Details</h2>
              <button
                onClick={closeModal}
                className="button-soft h-10 w-10 p-0 text-[var(--ink-soft)]"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : eventDetails ? (
                <div className="p-6 space-y-6">
                  {/* Event Header */}
                  <div className="flex items-start gap-6">
                    <img 
                      src={eventDetails.image_url ? `${process.env.NEXT_PUBLIC_API_BASE}${eventDetails.image_url}` : "/file.svg"} 
                      className="w-32 h-32 rounded-xl object-cover border-2 border-gray-200 shadow-sm" 
                      alt={eventDetails.name} 
                    />
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">{eventDetails.name}</h3>
                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="eyebrow text-[10px]">Location</span>
                          <span>{eventDetails.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="eyebrow text-[10px]">Year</span>
                          <span>{eventDetails.year}</span>
                        </div>
                        {eventDetails.date_from && (
                          <div className="flex items-center gap-2">
                            <span className="eyebrow text-[10px]">Dates</span>
                            <span>{new Date(eventDetails.date_from).toLocaleDateString()}</span>
                            {eventDetails.date_to && (
                              <span> - {new Date(eventDetails.date_to).toLocaleDateString()}</span>
                            )}
                          </div>
                        )}
                        {eventDetails.category && (
                          <div className="mt-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              eventDetails.category === 'WDSC' ? 'bg-orange-100 text-orange-800' :
                              eventDetails.category === 'EURO' ? 'bg-blue-100 text-blue-800' :
                              eventDetails.category === 'FREERIDE' ? 'bg-green-100 text-green-800' :
                              eventDetails.category === 'IDF' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {eventDetails.category === 'WDSC' ? 'WDSC Event' :
                               eventDetails.category === 'EURO' ? 'Euro Tour' :
                               eventDetails.category === 'FREERIDE' ? 'Freeride Event' :
                               eventDetails.category === 'IDF' ? 'IDF Event' : 'Spot'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Missing Information Section */}
                  <EventMissingInfo eventId={selectedEvent.id} />

                  {eventDetails.description && (
                    <div className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.42)] p-6">
                      <h4 className="eyebrow mb-4">Event Description</h4>
                      <div className="rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.72)] p-4 whitespace-pre-wrap text-[var(--ink-soft)]">
                        {eventDetails.description}
                      </div>
                    </div>
                  )}

                  {eventDetails.spot_notes && (
                    <div className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.42)] p-6">
                      <h4 className="eyebrow mb-4">Spot Notes</h4>
                      <div className="rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.72)] p-4 whitespace-pre-wrap text-[var(--ink-soft)]">
                        {eventDetails.spot_notes}
                      </div>
                    </div>
                  )}

                  {/* Track Records */}
                  {(eventDetails.track_record_open_name || eventDetails.track_record_luge_name || eventDetails.track_record_woman_name) && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span>⏱️</span>
                        Track Records
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {eventDetails.track_record_open_name && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-700 mb-2">Open</h5>
                            <p className="text-sm text-gray-600">{eventDetails.track_record_open_name}</p>
                            <p className="text-lg font-bold text-gray-900">{eventDetails.track_record_open_time}</p>
                          </div>
                        )}
                        {eventDetails.track_record_luge_name && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-700 mb-2">Luge</h5>
                            <p className="text-sm text-gray-600">{eventDetails.track_record_luge_name}</p>
                            <p className="text-lg font-bold text-gray-900">{eventDetails.track_record_luge_time}</p>
                          </div>
                        )}
                        {eventDetails.track_record_woman_name && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-700 mb-2">Women</h5>
                            <p className="text-sm text-gray-600">{eventDetails.track_record_woman_name}</p>
                            <p className="text-lg font-bold text-gray-900">{eventDetails.track_record_woman_time}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Organizer */}
                  {eventDetails.organizer_name && (
                    <div className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.42)] p-6">
                      <h4 className="eyebrow mb-4">Organizer</h4>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h5 className="font-medium text-gray-700 mb-2">Event Organizer</h5>
                        <ClickableRiderName 
                          name={eventDetails.organizer_name} 
                          className="text-lg font-bold text-[var(--accent-warm)] hover:text-[var(--ink)] hover:underline"
                        />
                      </div>
                    </div>
                  )}

                  {/* Results by Category */}
                  <div className="space-y-6">
                    {/* Open Results */}
                    {Array.isArray(eventDetails.open_results) && eventDetails.open_results.length > 0 && (
                      <div className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.42)] p-6">
                        <h4 className="eyebrow mb-4">Open Results ({eventDetails.open_results.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                          {eventDetails.open_results.map((result: any) => (
                            <div key={result.position} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                result.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                result.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                result.position === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                'bg-gradient-to-br from-blue-500 to-blue-600'
                              }`}>
                                {result.position}
                              </div>
                              <div className="flex-1">
                                <ClickableRiderName name={result.name} className="font-medium text-gray-900 transition-colors duration-200 hover:text-[var(--accent-warm)]" />
                                {result.country && (
                                  <div className="text-xs text-gray-500">{result.country}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Luge Results */}
                    {Array.isArray(eventDetails.luge_results) && eventDetails.luge_results.length > 0 && (
                      <div className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.42)] p-6">
                        <h4 className="eyebrow mb-4">Luge Results ({eventDetails.luge_results.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                          {eventDetails.luge_results.map((result: any) => (
                            <div key={result.position} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                result.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                result.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                result.position === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                'bg-gradient-to-br from-blue-500 to-blue-600'
                              }`}>
                                {result.position}
                              </div>
                              <div className="flex-1">
                                <ClickableRiderName name={result.name} className="font-medium text-gray-900 transition-colors duration-200 hover:text-[var(--accent-warm)]" />
                                {result.country && (
                                  <div className="text-xs text-gray-500">{result.country}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Women Results */}
                    {Array.isArray(eventDetails.woman_results) && eventDetails.woman_results.length > 0 && (
                      <div className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.42)] p-6">
                        <h4 className="eyebrow mb-4">Women Results ({eventDetails.woman_results.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                          {eventDetails.woman_results.map((result: any) => (
                            <div key={result.position} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                result.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                result.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                result.position === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                'bg-gradient-to-br from-blue-500 to-blue-600'
                              }`}>
                                {result.position}
                              </div>
                              <div className="flex-1">
                                <ClickableRiderName name={result.name} className="font-medium text-gray-900 transition-colors duration-200 hover:text-[var(--accent-warm)]" />
                                {result.country && (
                                  <div className="text-xs text-gray-500">{result.country}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Qualifier Results */}
                    {Array.isArray(eventDetails.qualifier_results) && eventDetails.qualifier_results.length > 0 && (
                      <div className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.42)] p-6">
                        <h4 className="eyebrow mb-4">Qualifiers ({eventDetails.qualifier_results.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                          {eventDetails.qualifier_results.map((result: any) => (
                            <div key={result.position} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-green-500 to-teal-600">
                                Q{result.position}
                              </div>
                              <div className="flex-1">
                                <ClickableRiderName name={result.name} className="font-medium text-gray-900 transition-colors duration-200 hover:text-[var(--accent-warm)]" />
                                {result.country && (
                                  <div className="text-xs text-gray-500">{result.country}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Source Link */}
                  {eventDetails.source_url && (
                    <div className="pt-4 border-t border-gray-200">
                      <a 
                        href={eventDetails.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="button-ink px-6 py-3 font-medium"
                      >
                        View Event Source
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">Failed to load event details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
