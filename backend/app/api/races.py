from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.db import get_db
from app.models.models import RaceEvent

router = APIRouter()

@router.get("/races")
def list_races(year: int = Query(..., ge=1900, le=2100), db: Session = Depends(get_db)):
    rows = db.execute(
        select(
            RaceEvent.id, RaceEvent.name, RaceEvent.year,
            RaceEvent.location, RaceEvent.lat, RaceEvent.lng, RaceEvent.source_url
        ).where(RaceEvent.year == year)
    ).all()

    features = []
    for (id_, name, yr, loc, lat, lng, src) in rows:
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lng, lat]},
            "properties": {
                "id": id_,
                "name": name,
                "year": yr,
                "location": loc,
                "source_url": src,
            },
        })
    return {"type": "FeatureCollection", "features": features}
