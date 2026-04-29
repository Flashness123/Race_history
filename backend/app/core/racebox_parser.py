import csv
import io
from dataclasses import dataclass
from datetime import datetime


@dataclass
class RunData:
    duration_ms: int
    max_speed_kmh: float
    avg_speed_kmh: float
    track_points: list[dict]  # [{t, lat, lng, alt, spd}]
    run_date: datetime | None


_COLUMN_MAP = {
    "time":  ["time (s)", "time_s", "elapsed time (s)", "elapsed", "t"],
    "lat":   ["latitude", "lat"],
    "lng":   ["longitude", "lng", "lon"],
    "alt":   ["altitude (m)", "altitude", "alt", "elevation (m)", "elevation"],
    "speed": ["speed (km/h)", "gps speed (km/h)", "speed_kmh", "speed (kmh)", "speed"],
}

_DOWNSAMPLE_INTERVAL_MS = 200  # keep at most 5 Hz


def _detect_column(headers: list[str], candidates: list[str]) -> str | None:
    lower = {h.lower(): h for h in headers}
    for c in candidates:
        if c in lower:
            return lower[c]
    return None


def parse_racebox_csv(content: bytes) -> RunData:
    # Try UTF-8 first, fall back to latin-1
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    # Skip comment/metadata lines that start with # or are not CSV
    lines = [l for l in text.splitlines() if l.strip() and not l.startswith("#")]
    if not lines:
        raise ValueError("CSV file is empty")

    reader = csv.DictReader(io.StringIO("\n".join(lines)))
    headers = reader.fieldnames or []

    col_time  = _detect_column(list(headers), _COLUMN_MAP["time"])
    col_lat   = _detect_column(list(headers), _COLUMN_MAP["lat"])
    col_lng   = _detect_column(list(headers), _COLUMN_MAP["lng"])
    col_alt   = _detect_column(list(headers), _COLUMN_MAP["alt"])
    col_speed = _detect_column(list(headers), _COLUMN_MAP["speed"])

    if not col_lat or not col_lng:
        raise ValueError("CSV missing latitude/longitude columns")
    if not col_time:
        raise ValueError("CSV missing time column")

    raw: list[tuple[float, float, float, float, float]] = []
    for row in reader:
        try:
            t_s   = float(row[col_time])
            lat   = float(row[col_lat])
            lng   = float(row[col_lng])
            alt   = float(row[col_alt]) if col_alt and row.get(col_alt) else 0.0
            speed = float(row[col_speed]) if col_speed and row.get(col_speed) else 0.0
            if lat == 0.0 and lng == 0.0:
                continue
            raw.append((t_s, lat, lng, alt, speed))
        except (ValueError, KeyError):
            continue

    if len(raw) < 2:
        raise ValueError("CSV contains too few valid GPS points")

    t0 = raw[0][0]
    # Normalize time to elapsed ms from start
    points_ms = [(round((t - t0) * 1000), lat, lng, alt, spd) for t, lat, lng, alt, spd in raw]

    # Downsample to _DOWNSAMPLE_INTERVAL_MS
    downsampled: list[dict] = []
    last_kept_t = -_DOWNSAMPLE_INTERVAL_MS
    for t_ms, lat, lng, alt, spd in points_ms:
        if t_ms - last_kept_t >= _DOWNSAMPLE_INTERVAL_MS:
            downsampled.append({"t": t_ms, "lat": round(lat, 6), "lng": round(lng, 6),
                                 "alt": round(alt, 1), "spd": round(spd, 1)})
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
        run_date=None,
    )
