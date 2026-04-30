from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, extract, and_, or_
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
            RaceEvent.date_from, RaceEvent.category, RaceEvent.all_categories
        ).where(
            or_(
                # Spots are always visible regardless of selected year
                RaceEvent.category == 'SPOT',
                # Non-spots: match by date_from year when set, else by year field
                and_(
                    or_(RaceEvent.category.is_(None), RaceEvent.category != 'SPOT'),
                    or_(
                        and_(RaceEvent.date_from.isnot(None),
                             extract('year', RaceEvent.date_from) == year),
                        and_(RaceEvent.date_from.is_(None),
                             RaceEvent.year == year),
                    ),
                ),
            )
        )
        .where(RaceEvent.lat != 0.0)
        .where(RaceEvent.lng != 0.0)
    ).all()

    features = []
    for (id_, name, yr, loc, lat, lng, src, dfrom, category, all_categories) in rows:
        is_future = False
        if category != "SPOT":
            if dfrom is not None:
                try:
                    is_future = dfrom.date() > today
                except AttributeError:
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
                "date_from": dfrom.isoformat() if dfrom else None,
                "future": is_future,
                "category": category or "WDSC",
                "all_categories": all_categories,
            },
        })
    return {"type": "FeatureCollection", "features": features}
