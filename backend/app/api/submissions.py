from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from datetime import date, datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, func, cast
from geoalchemy2 import Geography
from app.core.db import get_db
from app.core.security import get_current_user_claims, require_role
from app.models.models import Submission, RaceEvent, Result, Person, User
from app.core.norm import norm
import pandas as pd
import io
import requests
import time

router = APIRouter(prefix="/submissions", tags=["submissions"])

class LinkData(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    url: str = Field(min_length=1, max_length=500)

class RiderData(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    position: int = Field(ge=1)

class TrackRecordData(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    time: str = Field(min_length=1, max_length=20)  # Format like "1,27.46"

class SubmissionIn(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    date_from: date
    date_to: date | None = None
    location: str | None = None
    lat: float | None = None
    lng: float | None = None
    category: str = Field(pattern=r"^(SPOT|WDSC|EURO|FREERIDE|IDF)$")
    links: list[LinkData] = Field(default_factory=list)
    top_riders_open: list[RiderData] = Field(default_factory=list)
    top_riders_luge: list[RiderData] = Field(default_factory=list)
    top_riders_woman: list[RiderData] = Field(default_factory=list)
    top_qualifiers: list[RiderData] = Field(default_factory=list)
    track_record_open: TrackRecordData | None = None
    track_record_luge: TrackRecordData | None = None
    track_record_woman: TrackRecordData | None = None

@router.post("", status_code=201)
def create_submission(data: SubmissionIn, db: Session = Depends(get_db), claims: dict = Depends(get_current_user_claims)):
    try:
        user_id = int(claims["sub"])
        user = db.get(User, user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=403, detail="Inactive user")
        if not user.can_submit:
            raise HTTPException(status_code=403, detail="Submitting disabled for your account")

        # Check for duplicate spots (if category is SPOT)
        if data.category == "SPOT":
            existing_spot = db.scalar(
                select(RaceEvent).where(
                    RaceEvent.name == data.name,
                    RaceEvent.category == "SPOT"
                )
            )
            if existing_spot:
                raise HTTPException(status_code=400, detail=f"A spot with the name '{data.name}' already exists")

        # Convert dates to strings for JSON serialization
        payload = data.dict()
        if payload.get("date_from"):
            payload["date_from"] = payload["date_from"].isoformat()
        if payload.get("date_to"):
            payload["date_to"] = payload["date_to"].isoformat()
        
        sub = Submission(submitted_by_user_id=user_id, payload=payload, status="PENDING")
        db.add(sub)
        db.commit()
        db.refresh(sub)
        return {"id": sub.id, "status": sub.status}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error creating submission: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("", dependencies=[Depends(require_role("ADMIN","OWNER"))])
def list_pending(db: Session = Depends(get_db)):
    rows = db.scalars(select(Submission).where(Submission.status == "PENDING")).all()
    return [{"id": s.id, "payload": s.payload, "submitted_by_user_id": s.submitted_by_user_id} for s in rows]

@router.post("/{submission_id}/approve", dependencies=[Depends(require_role("ADMIN","OWNER"))])
def approve(submission_id: int, db: Session = Depends(get_db)):
    sub = db.get(Submission, submission_id)
    if not sub or sub.status != "PENDING":
        raise HTTPException(status_code=404, detail="Not found or not pending")

    p = sub.payload

    # Cast the point to Geography(POINT,4326) - only if valid lat/lng are provided
    geo_value = None
    lat = p.get("lat")
    lng = p.get("lng")
    if lat is not None and lng is not None and lat != 0.0 and lng != 0.0:
        geo_value = cast(
            func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326),
            Geography(geometry_type="POINT", srid=4326),
        )

    # Extract year from date_from
    year = datetime.fromisoformat(str(p["date_from"])).year
    
    # Determine image URL - use uploaded image or random default
    image_url = None
    if p.get("_uploaded_image_url"):
        image_url = p["_uploaded_image_url"]
    else:
        # Choose random default image
        import random
        random_index = random.randint(1, 6)
        image_url = f"/static/uploads/events/event_{random_index}.jpg"

    ev = RaceEvent(
        name=p["name"],
        year=year,
        location=p.get("location") or "Unknown",
        lat=lat if lat is not None and lat != 0.0 else 0.0,
        lng=lng if lng is not None and lng != 0.0 else 0.0,
        geom=geo_value,
        source_url=p.get("links", [{}])[0].get("url") if p.get("links") else None,  # First link as source
        date_from=p.get("date_from"),
        date_to=p.get("date_to"),
        category=p.get("category"),
        image_url=image_url,
        # Track records
        track_record_open_name=p.get("track_record_open", {}).get("name") if p.get("track_record_open") else None,
        track_record_open_time=p.get("track_record_open", {}).get("time") if p.get("track_record_open") else None,
        track_record_luge_name=p.get("track_record_luge", {}).get("name") if p.get("track_record_luge") else None,
        track_record_luge_time=p.get("track_record_luge", {}).get("time") if p.get("track_record_luge") else None,
        track_record_woman_name=p.get("track_record_woman", {}).get("name") if p.get("track_record_woman") else None,
        track_record_woman_time=p.get("track_record_woman", {}).get("time") if p.get("track_record_woman") else None,
    )
    db.add(ev); db.flush()
    db.commit()  # Commit the event first

    # Process riders for each category (skip for spots and freerides)
    if p.get("category") not in ["SPOT", "FREERIDE"]:
        # Process Open category
        for rider in p.get("top_riders_open", []):
            n = norm(rider["name"])
            person = db.scalar(select(Person).where(Person.full_name_norm == n))
            if not person:
                person = Person(
                    full_name=rider["name"],
                    full_name_norm=n,
                )
                db.add(person); db.flush()

            # Check if result already exists
            existing_result = db.scalar(select(Result).where(
                Result.event_id == ev.id,
                Result.position == int(rider["position"])
            ))
            if not existing_result:
                try:
                    result = Result(
                        event_id=ev.id,
                        person_id=person.id,
                        position=int(rider["position"])
                    )
                    db.add(result)
                    db.flush()
                except Exception as e:
                    if "uq_event_position" in str(e) or "duplicate key" in str(e).lower():
                        db.rollback()
                        continue
                    else:
                        raise
        
        # Process Luge category
        for rider in p.get("top_riders_luge", []):
            n = norm(rider["name"])
            person = db.scalar(select(Person).where(Person.full_name_norm == n))
            if not person:
                person = Person(
                    full_name=rider["name"],
                    full_name_norm=n,
                )
                db.add(person); db.flush()

            # Check if result already exists
            existing_result = db.scalar(select(Result).where(
                Result.event_id == ev.id,
                Result.position == int(rider["position"])
            ))
            if not existing_result:
                try:
                    result = Result(
                        event_id=ev.id,
                        person_id=person.id,
                        position=int(rider["position"])
                    )
                    db.add(result)
                    db.flush()
                except Exception as e:
                    if "uq_event_position" in str(e) or "duplicate key" in str(e).lower():
                        db.rollback()
                        continue
                    else:
                        raise
        
        # Process Woman category
        for rider in p.get("top_riders_woman", []):
            n = norm(rider["name"])
            person = db.scalar(select(Person).where(Person.full_name_norm == n))
            if not person:
                person = Person(
                    full_name=rider["name"],
                    full_name_norm=n,
                )
                db.add(person); db.flush()

            # Check if result already exists
            existing_result = db.scalar(select(Result).where(
                Result.event_id == ev.id,
                Result.position == int(rider["position"])
            ))
            if not existing_result:
                try:
                    result = Result(
                        event_id=ev.id,
                        person_id=person.id,
                        position=int(rider["position"])
                    )
                    db.add(result)
                    db.flush()
                except Exception as e:
                    if "uq_event_position" in str(e) or "duplicate key" in str(e).lower():
                        db.rollback()
                        continue
                    else:
                        raise
        
        # Process Qualifiers category (use positions 100+ to avoid conflicts)
        for rider in p.get("top_qualifiers", []):
            n = norm(rider["name"])
            person = db.scalar(select(Person).where(Person.full_name_norm == n))
            if not person:
                person = Person(
                    full_name=rider["name"],
                    full_name_norm=n,
                )
                db.add(person); db.flush()

            # Use position 100 + original position to avoid conflicts with regular riders
            qualifier_position = 100 + int(rider["position"])
            
            # Check if result already exists
            existing_result = db.scalar(select(Result).where(
                Result.event_id == ev.id,
                Result.position == qualifier_position
            ))
            if not existing_result:
                try:
                    result = Result(
                        event_id=ev.id,
                        person_id=person.id,
                        position=qualifier_position
                    )
                    db.add(result)
                    db.flush()
                except Exception as e:
                    if "uq_event_position" in str(e) or "duplicate key" in str(e).lower():
                        db.rollback()
                        continue
                    else:
                        raise

    sub.status = "APPROVED"
    db.commit()
    return {"ok": True, "event_id": ev.id}

@router.delete("/{submission_id}", dependencies=[Depends(require_role("ADMIN","OWNER"))])
def delete_submission(submission_id: int, db: Session = Depends(get_db)):
    sub = db.get(Submission, submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    # If you want to restrict deletion to only PENDING, uncomment:
    if sub.status != "PENDING":
        raise HTTPException(status_code=400, detail="Only pending submissions can be deleted")

    db.delete(sub)
    db.commit()
    return {"ok": True}

@router.post("/batch", status_code=201)
def batch_submit(file: UploadFile = File(...), db: Session = Depends(get_db), claims: dict = Depends(get_current_user_claims)):
    """Process batch upload of races from Excel/ODS file"""
    try:
        user_id = int(claims["sub"])
        user = db.get(User, user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=403, detail="Inactive user")
        if not user.can_submit:
            raise HTTPException(status_code=403, detail="Submitting disabled for your account")

        # Read the uploaded file
        content = file.file.read()
        
        # Determine file type and read accordingly
        if file.filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(content))
        elif file.filename.endswith('.ods'):
            df = pd.read_excel(io.BytesIO(content), engine='odf')
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please use .xlsx or .ods")

        # Validate required columns
        required_columns = ['event_name', 'date_start']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(status_code=400, detail=f"Missing required columns: {missing_columns}")

        successful = 0
        skipped = 0
        errors = []

        for index, row in df.iterrows():
            try:
                # Check if race already exists
                existing_race = db.scalar(
                    select(RaceEvent).where(
                        RaceEvent.name == str(row['event_name']),
                        RaceEvent.year == pd.to_datetime(row['date_start']).year
                    )
                )
                
                if existing_race:
                    skipped += 1
                    continue

                # Geocode location if provided
                location = str(row.get('location', '')).strip()
                lat, lng = 0.0, 0.0
                
                if location and location != "":
                    coords = geocode_location(location)
                    if coords:
                        lat, lng = coords
                        # Add small delay to respect Nominatim rate limits
                        time.sleep(1)
                    else:
                        print(f"Warning: Could not geocode location '{location}' for event '{row['event_name']}'")

                # Prepare submission data
                submission_data = {
                    "name": str(row['event_name']),
                    "date_from": pd.to_datetime(row['date_start']).date().isoformat(),
                    "date_to": pd.to_datetime(row.get('date_end')).date().isoformat() if pd.notna(row.get('date_end')) else None,
                    "location": location,
                    "lat": lat,
                    "lng": lng,
                    "category": map_category_to_value(str(row.get('category', 'WDSC'))),
                    "links": [{"name": "Event Page", "url": str(row.get('link_event_page', ''))}] if pd.notna(row.get('link_event_page')) else [],
                    "top_riders_open": [],
                    "top_riders_luge": [],
                    "top_riders_woman": [],
                    "top_qualifiers": [],
                    "track_record_open": None,
                    "track_record_luge": None,
                    "track_record_woman": None,
                }

                # Add riders if they exist
                for i in range(1, 4):
                    if pd.notna(row.get(f'standup_top_{i}')):
                        submission_data["top_riders_open"].append({
                            "name": str(row[f'standup_top_{i}']),
                            "position": i
                        })
                    if pd.notna(row.get(f'luge_top_{i}')):
                        submission_data["top_riders_luge"].append({
                            "name": str(row[f'luge_top_{i}']),
                            "position": i
                        })
                    if pd.notna(row.get(f'women_top_{i}')):
                        submission_data["top_riders_woman"].append({
                            "name": str(row[f'women_top_{i}']),
                            "position": i
                        })
                
                # Add qualifiers if they exist (support unlimited qualifiers)
                qualifier_position = 1
                for i in range(1, 11):  # Support up to 10 qualifiers
                    if pd.notna(row.get(f'qualifier_{i}')):
                        submission_data["top_qualifiers"].append({
                            "name": str(row[f'qualifier_{i}']),
                            "position": qualifier_position
                        })
                        qualifier_position += 1

                # Add track records if they exist
                if pd.notna(row.get('track_record_open')) and pd.notna(row.get('track_record_open_time')):
                    submission_data["track_record_open"] = {
                        "name": str(row['track_record_open']),
                        "time": str(row['track_record_open_time'])
                    }
                if pd.notna(row.get('track_record_luge')) and pd.notna(row.get('track_record_luge_time')):
                    submission_data["track_record_luge"] = {
                        "name": str(row['track_record_luge']),
                        "time": str(row['track_record_luge_time'])
                    }
                if pd.notna(row.get('track_record_women')) and pd.notna(row.get('track_record_women_time')):
                    submission_data["track_record_woman"] = {
                        "name": str(row['track_record_women']),
                        "time": str(row['track_record_women_time'])
                    }

                # Create submission
                sub = Submission(submitted_by_user_id=user_id, payload=submission_data, status="PENDING")
                db.add(sub)
                successful += 1

            except Exception as e:
                errors.append(f"Row {index + 1}: {str(e)}")
                continue

        db.commit()
        
        return {
            "successful": successful,
            "skipped": skipped,
            "errors": errors[:10],  # Limit to first 10 errors
            "total_errors": len(errors),
            "message": f"Processed {len(df)} rows. {successful} successful, {skipped} skipped, {len(errors)} errors."
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Batch processing error: {str(e)}")

def geocode_location(location: str) -> tuple[float, float] | None:
    """Geocode a location string to lat/lng coordinates using OpenStreetMap Nominatim"""
    if not location or location.strip() == "":
        return None
    
    try:
        # Use OpenStreetMap Nominatim API (free, no API key required)
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            'q': location.strip(),
            'format': 'json',
            'limit': 1,
            'addressdetails': 1
        }
        headers = {
            'User-Agent': 'RaceHistoryApp/1.0'  # Required by Nominatim
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        if data and len(data) > 0:
            result = data[0]
            lat = float(result['lat'])
            lng = float(result['lon'])
            print(f"Geocoded '{location}' -> ({lat}, {lng})")
            return (lat, lng)
        else:
            print(f"No geocoding results for '{location}'")
            return None
            
    except Exception as e:
        print(f"Geocoding failed for '{location}': {e}")
        return None

def map_category_to_value(category: str) -> str:
    """Map category string to valid category value"""
    category_upper = category.upper()
    if category_upper == 'WDSC':
        return 'WDSC'
    elif category_upper == 'IDF':
        return 'IDF'
    elif category_upper == 'EURO':
        return 'EURO'
    elif category_upper == 'FREERIDE':
        return 'FREERIDE'
    else:
        return 'WDSC'  # Default fallback
