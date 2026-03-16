type EventCompletenessInput = {
  category?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  track_record_open_name?: string | null;
  track_record_open_time?: string | null;
  track_record_luge_name?: string | null;
  track_record_luge_time?: string | null;
  track_record_woman_name?: string | null;
  track_record_woman_time?: string | null;
  open_results?: unknown[] | null;
  luge_results?: unknown[] | null;
  woman_results?: unknown[] | null;
  qualifier_results?: unknown[] | null;
  organizer_name?: string | null;
  spot_notes?: string | null;
};

function isFutureDate(dateFrom?: string | null) {
  if (!dateFrom) return false;

  const eventDate = new Date(dateFrom);
  if (Number.isNaN(eventDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  return eventDate > today;
}

export function getMissingEventInfo(
  event: EventCompletenessInput | null | undefined
) {
  if (!event) return [];

  const missing: string[] = [];
  const category = (event.category || "WDSC").toUpperCase();
  const isSpot = category === "SPOT";
  const isFreeride = category === "FREERIDE";
  const isFuture = isFutureDate(event.date_from);

  if (!event.date_from) missing.push("Start Date");
  if (!isSpot && !event.date_to) missing.push("End Date");

  if (isSpot) {
    if (!event.spot_notes?.trim()) missing.push("Spot Notes");
    return missing;
  }

  const hasAnyTrackRecord =
    Boolean(event.track_record_open_name && event.track_record_open_time) ||
    Boolean(event.track_record_luge_name && event.track_record_luge_time) ||
    Boolean(event.track_record_woman_name && event.track_record_woman_time);

  const hasAnyRiderResults =
    Boolean(event.open_results?.length) ||
    Boolean(event.luge_results?.length) ||
    Boolean(event.woman_results?.length);

  if (!isFreeride && !hasAnyTrackRecord) {
    missing.push("Track record incomplete");
  }

  if (!isFreeride && !isFuture && !hasAnyRiderResults) {
    missing.push("Top riders incomplete");
  }

  if (!isFreeride && !isFuture && !event.qualifier_results?.length) {
    missing.push("Qualifier Results");
  }

  if (!event.organizer_name) {
    missing.push("Organizer");
  }

  return missing;
}

export function getEventYearLabel(
  dateFrom?: string | null,
  fallbackYear?: number | null
) {
  if (typeof fallbackYear === "number" && Number.isFinite(fallbackYear)) {
    return fallbackYear;
  }

  if (!dateFrom) return null;

  const parsed = new Date(dateFrom);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.getFullYear();
}
