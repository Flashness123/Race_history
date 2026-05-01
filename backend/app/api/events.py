from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, and_, extract
from app.core.db import get_db
from app.models.models import RaceEvent, Result, Person

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/spots")
def all_spots(db: Session = Depends(get_db)):
    rows = db.execute(
        select(
            RaceEvent.id,
            RaceEvent.name,
            RaceEvent.image_url,
            RaceEvent.category,
            RaceEvent.location,
            RaceEvent.spot_notes,
        ).where(RaceEvent.category == 'SPOT').order_by(RaceEvent.name.asc())
    ).all()
    return [
        {
            "id": r[0],
            "name": r[1],
            "image_url": r[2] or "/static/uploads/events/default_event.webp",
            "category": "SPOT",
            "location": r[4] or "Unknown Location",
            "spot_notes": r[5],
        }
        for r in rows
    ]

@router.get("/by-year/{year}")
def events_by_year(year: int, db: Session = Depends(get_db)):
    rows = db.execute(
        select(
            RaceEvent.id, 
            RaceEvent.name, 
            RaceEvent.image_url, 
            RaceEvent.category,
            RaceEvent.all_categories,
            RaceEvent.location,
            RaceEvent.date_from,
            RaceEvent.date_to,
            RaceEvent.organizer_name,
            RaceEvent.all_organizers,
            RaceEvent.description,
            RaceEvent.spot_notes,
        ).where(
            or_(RaceEvent.category.is_(None), RaceEvent.category != 'SPOT')
        ).where(
            or_(
                and_(RaceEvent.date_from.isnot(None),
                     extract('year', RaceEvent.date_from) == year),
                and_(RaceEvent.date_from.is_(None),
                     RaceEvent.year == year),
            )
        ).order_by(RaceEvent.name.asc())
    ).all()
    return [
        {
            "id": r[0], 
            "name": r[1], 
            "image_url": r[2] or "/static/uploads/events/default_event.webp",
            "category": r[3] or "WDSC",
            "all_categories": r[4],
            "location": r[5] or "Unknown Location",
            "date_from": r[6].isoformat() if r[6] else None,
            "date_to": r[7].isoformat() if r[7] else None,
            "organizer_name": r[8],
            "all_organizers": r[9],
            "description": r[10],
            "spot_notes": r[11],
            "year": year
        } 
        for r in rows
    ]

@router.get("/{event_id}")
def event_detail(event_id: int, db: Session = Depends(get_db)):
    ev = db.get(RaceEvent, event_id)
    if not ev:
        raise HTTPException(404, "Event not found")
    
    # Get all results (not just top 3)
    all_results = db.execute(
        select(Result.position, Person.full_name, Person.id, Person.country, Result.category)
        .join(Person, Person.id == Result.person_id)
        .where(Result.event_id == event_id)
        .order_by(Result.position.asc())
    ).all()
    
    results = []
    for r in all_results:
        position = r[0]
        category = r[4] or "OPEN"
        
        # Convert database positions back to display positions
        if category == "LUGE" and position >= 10:
            display_position = position - 10
        elif category == "WOMAN" and position >= 20:
            display_position = position - 20
        elif category == "QUALIFIER" and position >= 100:
            display_position = position - 100
        else:
            display_position = position
            
        results.append({
            "position": display_position,
            "name": r[1], 
            "person_id": r[2], 
            "country": r[3], 
            "category": category
        })
    
    # Categorize results
    open_results = [r for r in results if r["category"] == "OPEN"]
    luge_results = [r for r in results if r["category"] == "LUGE"]
    woman_results = [r for r in results if r["category"] == "WOMAN"]
    qualifier_results = [r for r in results if r["category"] == "QUALIFIER"]
    organizer_results = [r for r in results if r["category"] == "ORGANIZER"]
    
    # Get top 3 for backward compatibility (only from open category)
    top3 = [r for r in open_results if r["position"] <= 3]
    
    return {
        "id": ev.id,
        "name": ev.name,
        "year": ev.year,
        "location": ev.location,
        "lat": ev.lat,
        "lng": ev.lng,
        "source_url": ev.source_url,
        "image_url": ev.image_url or "/static/uploads/events/default_event.webp",
        "category": ev.category,
        "all_categories": ev.all_categories,
        "date_from": ev.date_from.isoformat() if ev.date_from else None,
        "date_to": ev.date_to.isoformat() if ev.date_to else None,
        "top3": top3,
        "all_results": results,
        "open_results": open_results,
        "luge_results": luge_results,
        "woman_results": woman_results,
        "qualifier_results": qualifier_results,
        "organizer_results": organizer_results,
        "organizer_name": ev.organizer_name,
        "all_organizers": ev.all_organizers,
        "description": ev.description,
        "spot_notes": ev.spot_notes,
        "track_record_open_name": ev.track_record_open_name,
        "track_record_open_time": ev.track_record_open_time,
        "track_record_luge_name": ev.track_record_luge_name,
        "track_record_luge_time": ev.track_record_luge_time,
        "track_record_woman_name": ev.track_record_woman_name,
        "track_record_woman_time": ev.track_record_woman_time,
        "racebox_track_url": ev.racebox_track_url,
    }
