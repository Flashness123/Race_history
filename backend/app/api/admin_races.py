from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from app.core.db import get_db
from app.core.security import require_role
from app.models.models import RaceEvent, Result

router = APIRouter(prefix="/admin/races", tags=["admin-races"])

@router.get("", dependencies=[Depends(require_role("ADMIN", "OWNER"))])
def list_races(year: int | None = Query(None), db: Session = Depends(get_db)):
    stmt = select(RaceEvent).order_by(RaceEvent.year.desc(), RaceEvent.id.desc())
    if year:
        stmt = stmt.where(RaceEvent.year == year)
    rows = db.scalars(stmt).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "year": r.year,
            "location": r.location,
            "lat": r.lat,
            "lng": r.lng,
            "source_url": r.source_url,
            "image_url": r.image_url,
        }
        for r in rows
    ]

@router.delete("/{race_id}", dependencies=[Depends(require_role("ADMIN", "OWNER"))])
def delete_race(race_id: int, db: Session = Depends(get_db)):
    race = db.get(RaceEvent, race_id)
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")

    # delete children first to satisfy FK constraints if not ON DELETE CASCADE
    db.execute(delete(Result).where(Result.event_id == race_id))
    db.delete(race)
    db.commit()
    return {"ok": True}
