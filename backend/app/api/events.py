from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.db import get_db
from app.models.models import RaceEvent, Result, Person

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/by-year/{year}")
def events_by_year(year: int, db: Session = Depends(get_db)):
    rows = db.execute(
        select(
            RaceEvent.id, 
            RaceEvent.name, 
            RaceEvent.image_url, 
            RaceEvent.category,
            RaceEvent.location,
            RaceEvent.date_from,
            RaceEvent.date_to
        ).where(RaceEvent.year == year).order_by(RaceEvent.name.asc())
    ).all()
    return [
        {
            "id": r[0], 
            "name": r[1], 
            "image_url": r[2] or "/static/uploads/events/default_event.jpg",
            "category": r[3] or "WDSC",
            "location": r[4] or "Unknown Location",
            "date_from": r[5].isoformat() if r[5] else None,
            "date_to": r[6].isoformat() if r[6] else None,
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
        "image_url": ev.image_url or "/static/uploads/events/default_event.jpg",
        "category": ev.category,
        "date_from": ev.date_from.isoformat() if ev.date_from else None,
        "date_to": ev.date_to.isoformat() if ev.date_to else None,
        "top3": top3,
        "all_results": results,
        "open_results": open_results,
        "luge_results": luge_results,
        "woman_results": woman_results,
        "qualifier_results": qualifier_results,
        "track_record_open_name": ev.track_record_open_name,
        "track_record_open_time": ev.track_record_open_time,
        "track_record_luge_name": ev.track_record_luge_name,
        "track_record_luge_time": ev.track_record_luge_time,
        "track_record_woman_name": ev.track_record_woman_name,
        "track_record_woman_time": ev.track_record_woman_time,
    }