from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.db import get_db
from app.models.models import RaceEvent
from datetime import datetime

router = APIRouter()

@router.get("/races")
def list_races(year: int = Query(..., ge=1900, le=2100), db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    rows = db.execute(
        select(
            RaceEvent.id, RaceEvent.name, RaceEvent.year,
            RaceEvent.location, RaceEvent.lat, RaceEvent.lng, RaceEvent.source_url,
            RaceEvent.date_from, RaceEvent.category
        ).where(RaceEvent.year == year)
        .where(RaceEvent.lat != 0.0)
        .where(RaceEvent.lng != 0.0)
    ).all()

    features = []
    for (id_, name, yr, loc, lat, lng, src, dfrom, category) in rows:
        # Determine future by date_from if available; fallback to year comparison
        # Spots and freerides are never "future" regardless of date
        is_future = False
        if category not in ["SPOT", "FREERIDE"]:
            if dfrom is not None:
                try:
                    is_future = dfrom.date() > today
                except AttributeError:
                    # dfrom may already be date
                    is_future = dfrom > today
            else:
                is_future = yr > today.year
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lng, lat]},
            "properties": {
                "id": id_,
                "name": name,
                "year": yr,
                "location": loc,
                "source_url": src,
                "future": is_future,
                "category": category or "WDSC",
            },
        })
    return {"type": "FeatureCollection", "features": features}
