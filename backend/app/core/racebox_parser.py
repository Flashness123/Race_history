import csv
import io
from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass
class RunData:
    duration_ms: int
    max_speed_kmh: float
    avg_speed_kmh: float
    track_points: list[dict]  # [{t, lat, lng, alt, spd}]
    run_date: datetime | None


# Speed column names that indicate explicit units (all lowercase)
_SPEED_MS_HEADERS = {"speed (m/s)"}
_SPEED_MPH_HEADERS = {"speed (mph)", "speed (mi/h)", "mph"}
_SPEED_KMH_HEADERS = {"speed (km/h)", "gps speed (km/h)", "speed_kmh", "speed (kmh)", "kph"}

# Altitude column names that indicate feet (all lowercase)
_ALT_FT_HEADERS = {"altitude (ft)", "altitude (feet)", "alt (ft)", "elevation (ft)", "elevation (feet)"}

_COLUMN_MAP = {
    "time":  ["time (s)", "time_s", "elapsed time (s)", "elapsed", "time", "t"],
    "lat":   ["latitude", "lat"],
    "lng":   ["longitude", "lng", "lon"],
    # altitude: explicit meters first, then explicit feet (for conversion), then bare names
    "alt":   ["altitude (m)", "altitude (ft)", "altitude (feet)", "alt (ft)",
              "altitude", "alt", "elevation (m)", "elevation (ft)", "elevation (feet)", "elevation"],
    # speed: explicit units first, then bare names
    "speed": ["speed (m/s)", "speed (mph)", "speed (mi/h)", "mph",
              "speed (km/h)", "gps speed (km/h)", "speed_kmh", "speed (kmh)", "kph",
              "speed"],
    # g-force: explicit variants first, bare X/Y last to avoid accidental matches
    "gx":    ["gforcex (g)", "gforcex", "g-force x", "longitudinal acc. (g)", "longitudinal acc (g)", "accel_x", "x"],
    "gy":    ["gforcey (g)", "gforcey", "g-force y", "lateral acc. (g)", "lateral acc (g)", "accel_y", "y"],
}

_DOWNSAMPLE_INTERVAL_MS = 200  # keep at most 5 Hz

_RUN_START_MOVING_KMH = 10.0
_RUN_START_IDLE_KMH = 3.0


def _find_run_start_idx(points_ms: list) -> int:
    """
    Find the index where the actual descent begins.
    Scans forward to find the first point at or above MOVING threshold,
    then walks back to find the last point below IDLE threshold before it.
    This trims pre-start waiting time so all runs align at t=0.
    """
    fast_idx = -1
    for i, p in enumerate(points_ms):
        if p[4] >= _RUN_START_MOVING_KMH:
            fast_idx = i
            break

    if fast_idx <= 0:
        return 0

    for i in range(fast_idx - 1, -1, -1):
        if points_ms[i][4] < _RUN_START_IDLE_KMH:
            return i + 1

    return 0


def _detect_column(headers: list[str], candidates: list[str]) -> str | None:
    lower = {h.lower().strip(): h for h in headers}
    for c in candidates:
        if c in lower:
            return lower[c]
    return None


def _parse_time_value(t_str: str) -> float:
    """Return a sortable float from either elapsed-seconds or ISO datetime string."""
    t_str = t_str.strip()
    try:
        return float(t_str)
    except ValueError:
        pass
    t_str = t_str.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(t_str).timestamp()
    except ValueError:
        raise ValueError(f"Unrecognised time format: {t_str!r}")


def _find_data_start(lines: list[str]) -> int:
    """Return the index of the line that contains the actual column headers."""
    for i, line in enumerate(lines):
        lower = line.lower()
        if "latitude" in lower and "longitude" in lower:
            return i
    return -1


def _speed_multiplier(col_header: str, values: list[float]) -> float:
    """Return the factor to multiply raw speed values to get km/h."""
    h = col_header.lower().strip()
    if h in _SPEED_MS_HEADERS:
        return 3.6
    if h in _SPEED_MPH_HEADERS:
        return 1.60934
    if h in _SPEED_KMH_HEADERS:
        return 1.0
    # Bare "speed" or unknown label: use value range heuristic
    # Typical downhill max in m/s ≈ 21, in km/h ≈ 76, in mph ≈ 47
    # Threshold at 30: below → m/s, at/above → km/h (mph ≈ km/h is an accepted ambiguity)
    max_val = max(values) if values else 0.0
    return 3.6 if max_val < 30 else 1.0


def _alt_multiplier(col_header: str) -> float:
    """Return the factor to multiply raw altitude values to get meters."""
    h = col_header.lower().strip()
    return 0.3048 if h in _ALT_FT_HEADERS else 1.0


def _extract_run_date_from_iso(t_str: str) -> datetime | None:
    """Extract just the UTC date from an ISO 8601 timestamp, or None."""
    t_str = t_str.strip().replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(t_str)
        return dt.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
    except ValueError:
        return None


def parse_racebox_csv(content: bytes) -> RunData:
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    all_lines = text.splitlines()

    header_idx = _find_data_start(all_lines)
    if header_idx == -1:
        raise ValueError("CSV missing latitude/longitude columns")

    # Extract run_date from metadata block (lines before header row)
    run_date: datetime | None = None
    for line in all_lines[:header_idx]:
        lower = line.lower()
        if lower.startswith("date utc,") or lower.startswith("date,"):
            parts = line.split(",", 1)
            if len(parts) == 2:
                try:
                    val = parts[1].strip().replace("Z", "+00:00")
                    run_date = datetime.fromisoformat(val)
                except ValueError:
                    pass

    csv_text = "\n".join(all_lines[header_idx:])
    reader = csv.DictReader(io.StringIO(csv_text))
    headers = list(reader.fieldnames or [])

    col_time  = _detect_column(headers, _COLUMN_MAP["time"])
    col_lat   = _detect_column(headers, _COLUMN_MAP["lat"])
    col_lng   = _detect_column(headers, _COLUMN_MAP["lng"])
    col_alt   = _detect_column(headers, _COLUMN_MAP["alt"])
    col_speed = _detect_column(headers, _COLUMN_MAP["speed"])
    col_gx    = _detect_column(headers, _COLUMN_MAP["gx"])
    col_gy    = _detect_column(headers, _COLUMN_MAP["gy"])

    if not col_lat or not col_lng:
        raise ValueError("CSV missing latitude/longitude columns")
    if not col_time:
        raise ValueError("CSV missing time column")
    if not col_gx and not col_gy:
        raise ValueError(
            "This file is missing acceleration (G-force) data. "
            "Please export from the RaceBox app using a CSV format that includes GForce columns "
            "(e.g. the default CSV export, not GPX or KML)."
        )

    # Read all rows into memory so we can apply speed-unit heuristic on max value
    all_rows = list(reader)

    # Determine speed unit multiplier (needs all values for bare "Speed" heuristic)
    speed_mult = 1.0
    if col_speed:
        raw_speeds = []
        for row in all_rows:
            v = row.get(col_speed, "").strip()
            if v:
                try:
                    raw_speeds.append(float(v))
                except ValueError:
                    pass
        speed_mult = _speed_multiplier(col_speed, raw_speeds)

    alt_mult = _alt_multiplier(col_alt) if col_alt else 1.0

    # Extract run_date from first ISO timestamp in data when not found in metadata
    if run_date is None and col_time:
        for row in all_rows:
            t_str = row.get(col_time, "").strip()
            if "T" in t_str or "Z" in t_str:
                run_date = _extract_run_date_from_iso(t_str)
                if run_date:
                    break

    raw: list[tuple[float, float, float, float, float, float, float]] = []
    for row in all_rows:
        try:
            t_val = _parse_time_value(row[col_time])
            lat   = float(row[col_lat])
            lng   = float(row[col_lng])
            alt   = float(row[col_alt]) * alt_mult if col_alt and row.get(col_alt) else 0.0
            speed = float(row[col_speed]) * speed_mult if col_speed and row.get(col_speed) else 0.0
            gx    = float(row[col_gx]) if col_gx and row.get(col_gx) else 0.0
            gy    = float(row[col_gy]) if col_gy and row.get(col_gy) else 0.0
            if lat == 0.0 and lng == 0.0:
                continue
            raw.append((t_val, lat, lng, alt, speed, gx, gy))
        except (ValueError, KeyError):
            continue

    if len(raw) < 2:
        raise ValueError("CSV contains too few valid GPS points")

    t0 = raw[0][0]
    points_ms = [(round((t - t0) * 1000), lat, lng, alt, spd, gx, gy) for t, lat, lng, alt, spd, gx, gy in raw]

    start_idx = _find_run_start_idx(points_ms)
    if start_idx > 0:
        t_origin = points_ms[start_idx][0]
        points_ms = [(t - t_origin, lat, lng, alt, spd, gx, gy)
                     for t, lat, lng, alt, spd, gx, gy in points_ms[start_idx:]]

    downsampled: list[dict] = []
    last_kept_t = -_DOWNSAMPLE_INTERVAL_MS
    for t_ms, lat, lng, alt, spd, gx, gy in points_ms:
        if t_ms - last_kept_t >= _DOWNSAMPLE_INTERVAL_MS:
            downsampled.append({"t": t_ms, "lat": round(lat, 6), "lng": round(lng, 6),
                                 "alt": round(alt, 1), "spd": round(spd, 1),
                                 "gx": round(gx, 3), "gy": round(gy, 3)})
            last_kept_t = t_ms

    if not downsampled:
        raise ValueError("No valid GPS points after processing")

    duration_ms = points_ms[-1][0]
    speeds = [p[4] for p in points_ms if p[4] > 0]
    max_speed = round(max(speeds), 1) if speeds else 0.0
    avg_speed = round(sum(speeds) / len(speeds), 1) if speeds else 0.0

    return RunData(
        duration_ms=duration_ms,
        max_speed_kmh=max_speed,
        avg_speed_kmh=avg_speed,
        track_points=downsampled,
        run_date=run_date,
    )
