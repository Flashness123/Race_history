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
    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-2">
        <span className="text-yellow-600 text-sm">⚠️</span>
        <div className="flex-1">
          <div className="text-xs text-yellow-800 font-medium mb-1">
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
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
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
              className="w-full px-4 py-3 pl-10 pr-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
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
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={event.image_url ? `${process.env.NEXT_PUBLIC_API_BASE}${event.image_url}` : "/file.svg"}
                alt={event.name}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                {event.name}
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>{event.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏷️</span>
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
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
          <p className="text-blue-100">
            {searchTerm ? "Try adjusting your search terms" : "No events available for this year"}
          </p>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <span className="text-xl">✕</span>
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
                          <span>📍</span>
                          <span>{eventDetails.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{eventDetails.year}</span>
                        </div>
                        {eventDetails.date_from && (
                          <div className="flex items-center gap-2">
                            <span>🗓️</span>
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
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span>📝</span>
                        Event Description
                      </h4>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 whitespace-pre-wrap text-gray-700">
                        {eventDetails.description}
                      </div>
                    </div>
                  )}

                  {eventDetails.spot_notes && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span>📍</span>
                        Spot Notes
                      </h4>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 whitespace-pre-wrap text-gray-700">
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
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span>👤</span>
                        Organizer
                      </h4>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h5 className="font-medium text-gray-700 mb-2">Event Organizer</h5>
                        <ClickableRiderName 
                          name={eventDetails.organizer_name} 
                          className="text-lg font-bold text-blue-600 hover:text-blue-700 hover:underline"
                        />
                      </div>
                    </div>
                  )}

                  {/* Results by Category */}
                  <div className="space-y-6">
                    {/* Open Results */}
                    {Array.isArray(eventDetails.open_results) && eventDetails.open_results.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <span>🏆</span>
                          Open Results ({eventDetails.open_results.length})
                        </h4>
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
                                <ClickableRiderName name={result.name} className="font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200" />
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
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <span>🛷</span>
                          Luge Results ({eventDetails.luge_results.length})
                        </h4>
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
                                <ClickableRiderName name={result.name} className="font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200" />
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
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <span>👩</span>
                          Women Results ({eventDetails.woman_results.length})
                        </h4>
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
                                <ClickableRiderName name={result.name} className="font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200" />
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
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <span>🎯</span>
                          Qualifiers ({eventDetails.qualifier_results.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                          {eventDetails.qualifier_results.map((result: any) => (
                            <div key={result.position} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-green-500 to-teal-600">
                                Q{result.position}
                              </div>
                              <div className="flex-1">
                                <ClickableRiderName name={result.name} className="font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200" />
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
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                      >
                        <span>🔗</span>
                        View Event Source
                      </a>
                    </div>
                  )}

                  {/* GPS Run Comparison */}
                  <div className={eventDetails.source_url ? "pt-3" : "pt-4 border-t border-gray-200"}>
                    <a
                      href={`/events/${selectedEvent.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                      style={{ background: "var(--surface-raised)", color: "var(--accent)" }}
                    >
                      <span>📍</span>
                      GPS Run Comparison →
                    </a>
                  </div>
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
