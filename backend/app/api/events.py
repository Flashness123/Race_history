from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.db import get_db
from app.models.models import RaceEvent, Result, Person

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/by-year/{year}")
def events_by_year(year: int, db: Session = Depends(get_db)):
    rows = db.execute(select(RaceEvent.id, RaceEvent.name, RaceEvent.image_url).where(RaceEvent.year == year).order_by(RaceEvent.name.asc())).all()
    return [{"id": r[0], "name": r[1], "image_url": r[2] or "/static/uploads/events/default_event.jpg"} for r in rows]

@router.get("/{event_id}")
def event_detail(event_id: int, db: Session = Depends(get_db)):
    ev = db.get(RaceEvent, event_id)
    if not ev:
        raise HTTPException(404, "Event not found")
    rows = db.execute(
        select(Result.position, Person.full_name, Person.id, Person.country)
        .join(Person, Person.id == Result.person_id)
        .where(Result.event_id == event_id, Result.position.in_([1,2,3]))
        .order_by(Result.position.asc())
    ).all()
    top3 = [
        {"position": r[0], "name": r[1], "person_id": r[2], "country": r[3]}
        for r in rows
    ]
    return {
        "id": ev.id,
        "name": ev.name,
        "year": ev.year,
        "location": ev.location,
        "lat": ev.lat,
        "lng": ev.lng,
        "source_url": ev.source_url,
        "image_url": ev.image_url or "/static/uploads/events/default_event.jpg",
        "top3": top3,
    }