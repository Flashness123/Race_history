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


_COLUMN_MAP = {
    "time":  ["time (s)", "time_s", "elapsed time (s)", "elapsed", "time", "t"],
    "lat":   ["latitude", "lat"],
    "lng":   ["longitude", "lng", "lon"],
    "alt":   ["altitude (m)", "altitude", "alt", "elevation (m)", "elevation"],
    "speed": ["speed (km/h)", "gps speed (km/h)", "speed_kmh", "speed (kmh)", "speed"],
    "gx":    ["gforcex", "g-force x", "longitudinal acc. (g)", "longitudinal acc (g)", "accel_x"],
    "gy":    ["gforcey", "g-force y", "lateral acc. (g)", "lateral acc (g)", "accel_y"],
}

_DOWNSAMPLE_INTERVAL_MS = 200  # keep at most 5 Hz


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
    # ISO 8601 datetime (e.g. "2026-04-26T10:56:02.600Z")
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


def parse_racebox_csv(content: bytes) -> RunData:
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    all_lines = text.splitlines()

    # Find the header row by looking for the line that contains lat/lng column names.
    # This skips any session description block (RaceBox custom export header).
    header_idx = _find_data_start(all_lines)
    if header_idx == -1:
        raise ValueError("CSV missing latitude/longitude columns")

    # Also try to extract run_date from the metadata block above the header
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

    raw: list[tuple[float, float, float, float, float, float, float]] = []
    for row in reader:
        try:
            t_val = _parse_time_value(row[col_time])
            lat   = float(row[col_lat])
            lng   = float(row[col_lng])
            alt   = float(row[col_alt]) if col_alt and row.get(col_alt) else 0.0
            speed = float(row[col_speed]) if col_speed and row.get(col_speed) else 0.0
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

    # Downsample to _DOWNSAMPLE_INTERVAL_MS
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
