import os
import math
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import select, asc
from typing import Optional
from app.core.db import get_db
from app.core.security import get_current_user_claims, get_optional_user_claims
from app.core.files import save_run_file
from app.core.racebox_parser import parse_racebox_csv
from app.models.models import SpotRun, RaceEvent, User

router = APIRouter(prefix="/spots", tags=["spot_runs"])

_SORT_COLS = {
    "time": SpotRun.duration_ms,
    "speed": SpotRun.max_speed_kmh,
    "date": SpotRun.run_date,
    "name": SpotRun.rider_name,
}

_MAX_DISTANCE_KM = 10.0
_LEADERBOARD_SIZE = 100


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))


def _format_run(run: SpotRun, current_user_id: int | None) -> dict:
    return {
        "id": run.id,
        "rider_name": run.rider_name,
        "duration_ms": run.duration_ms,
        "max_speed_kmh": run.max_speed_kmh,
        "avg_speed_kmh": run.avg_speed_kmh,
        "run_date": run.run_date.isoformat() if run.run_date else None,
        "uploaded_at": run.uploaded_at.isoformat(),
        "is_own": run.uploaded_by_user_id == current_user_id if current_user_id else False,
    }


@router.post("/{event_id}/runs", status_code=201)
async def upload_run(
    event_id: int,
    file: UploadFile = File(...),
    rider_name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    claims: dict = Depends(get_current_user_claims),
):
    user_id = int(claims["sub"])
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")

    event = db.get(RaceEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    try:
        run_data = parse_racebox_csv(content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Verify the run was recorded near the event (within 10 km)
    if event.lat and event.lng and run_data.track_points:
        run_lat = run_data.track_points[0]["lat"]
        run_lng = run_data.track_points[0]["lng"]
        dist_km = _haversine_km(event.lat, event.lng, run_lat, run_lng)
        if dist_km > _MAX_DISTANCE_KM:
            raise HTTPException(
                status_code=422,
                detail=f"Run start is {dist_km:.1f} km from this event's location. "
                       f"Only runs within {_MAX_DISTANCE_KM} km can be uploaded here."
            )

    # One run per user per event
    existing = db.scalar(
        select(SpotRun).where(
            SpotRun.event_id == event_id,
            SpotRun.uploaded_by_user_id == user_id,
        )
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "already_has_run",
                "existing_run_id": existing.id,
                "existing_duration_ms": existing.duration_ms,
                "existing_max_speed_kmh": existing.max_speed_kmh,
                "existing_rider_name": existing.rider_name,
            },
        )

    name = (rider_name or "").strip() or user.display_name or user.name or "Unknown"

    try:
        raw_path = save_run_file(content, file.filename, user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    run = SpotRun(
        event_id=event_id,
        uploaded_by_user_id=user_id,
        rider_name=name,
        duration_ms=run_data.duration_ms,
        max_speed_kmh=run_data.max_speed_kmh,
        avg_speed_kmh=run_data.avg_speed_kmh,
        track_points=run_data.track_points,
        raw_file_path=raw_path,
        run_date=run_data.run_date,
        uploaded_at=datetime.utcnow(),
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # Build result now, before any top-100 pruning may delete this run
    result = _format_run(run, user_id)
    result["track_points"] = run_data.track_points

    # Top-100 enforcement: keep only the fastest _LEADERBOARD_SIZE runs
    all_runs = db.scalars(
        select(SpotRun)
        .where(SpotRun.event_id == event_id)
        .order_by(SpotRun.duration_ms.asc())
    ).all()

    total = len(all_runs)
    run_ids = [r.id for r in all_runs]
    rank = run_ids.index(run.id) + 1 if run.id in run_ids else total
    kept = True

    if total > _LEADERBOARD_SIZE:
        slowest = all_runs[-1]  # highest duration = slowest
        kept = slowest.id != run.id
        if slowest.raw_file_path and os.path.exists(slowest.raw_file_path):
            os.remove(slowest.raw_file_path)
        db.delete(slowest)
        db.commit()
        if not kept and raw_path and os.path.exists(raw_path):
            os.remove(raw_path)

    result["kept"] = kept
    result["rank"] = rank
    return result


@router.get("/{event_id}/runs")
def list_runs(
    event_id: int,
    sort_by: str = Query("time", pattern="^(time|speed|name|date)$"),
    db: Session = Depends(get_db),
    claims: Optional[dict] = Depends(get_optional_user_claims),
):
    event = db.get(RaceEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    current_user_id = int(claims["sub"]) if claims else None
    sort_col = _SORT_COLS.get(sort_by, SpotRun.duration_ms)

    runs = db.scalars(
        select(SpotRun)
        .where(SpotRun.event_id == event_id)
        .order_by(asc(sort_col))
    ).all()

    return [_format_run(r, current_user_id) for r in runs]


@router.get("/{event_id}/runs/{run_id}")
def get_run(
    event_id: int,
    run_id: int,
    db: Session = Depends(get_db),
    claims: Optional[dict] = Depends(get_optional_user_claims),
):
    run = db.scalar(
        select(SpotRun).where(SpotRun.id == run_id, SpotRun.event_id == event_id)
    )
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    current_user_id = int(claims["sub"]) if claims else None
    result = _format_run(run, current_user_id)
    result["track_points"] = run.track_points
    return result


@router.get("/{event_id}/runs/{run_id}/download")
def download_run(
    event_id: int,
    run_id: int,
    db: Session = Depends(get_db),
):
    run = db.scalar(
        select(SpotRun).where(SpotRun.id == run_id, SpotRun.event_id == event_id)
    )
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if not run.raw_file_path or not os.path.exists(run.raw_file_path):
        raise HTTPException(status_code=404, detail="Raw file not available")

    safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in run.rider_name)
    filename = f"{safe_name}_run_{run_id}.csv"
    return FileResponse(run.raw_file_path, media_type="text/csv",
                        headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@router.delete("/{event_id}/runs/{run_id}", status_code=204)
def delete_run(
    event_id: int,
    run_id: int,
    db: Session = Depends(get_db),
    claims: dict = Depends(get_current_user_claims),
):
    user_id = int(claims["sub"])
    user = db.get(User, user_id)

    run = db.scalar(
        select(SpotRun).where(SpotRun.id == run_id, SpotRun.event_id == event_id)
    )
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    is_owner = run.uploaded_by_user_id == user_id
    is_admin = user and user.role.value in ("ADMIN", "OWNER")
    if not is_owner and not is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this run")

    if run.raw_file_path and os.path.exists(run.raw_file_path):
        os.remove(run.raw_file_path)

    db.delete(run)
    db.commit()
