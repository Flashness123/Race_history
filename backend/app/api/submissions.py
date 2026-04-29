from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from datetime import date, datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, func, cast, delete
from geoalchemy2 import Geography
from app.core.db import get_db
from app.core.security import get_current_user_claims, require_role
from app.models.models import Submission, RaceEvent, Result, Person, User, SubmissionAttachment, EventAttachment
from app.core.norm import norm
from app.core.files import save_attachment_file
import os
import pandas as pd
import io
import json
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
    category: str = Field(pattern=r"^(SPOT|WDSC|EURO|FREERIDE|IDF|OUTLAW|NATIONAL|RACE)$")
    links: list[LinkData] = Field(default_factory=list)
    top_riders_open: list[RiderData] = Field(default_factory=list)
    top_riders_luge: list[RiderData] = Field(default_factory=list)
    top_riders_woman: list[RiderData] = Field(default_factory=list)
    top_qualifiers: list[RiderData] = Field(default_factory=list)
    track_record_open: TrackRecordData | None = None
    track_record_luge: TrackRecordData | None = None
    track_record_woman: TrackRecordData | None = None
    organizer_name: str | None = Field(None, max_length=200)
    event_description: str | None = Field(None, max_length=4000)
    # Edit mode fields
    is_edit: bool = False
    editing_event_id: int | None = None

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
        
        # Determine submission type
        submission_type = "EDIT" if data.is_edit else "NEW"
        
        sub = Submission(
            submitted_by_user_id=user_id, 
            payload=payload, 
            status="PENDING",
            submission_type=submission_type
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)
        return {"id": sub.id, "status": sub.status, "type": submission_type}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error creating submission: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("", dependencies=[Depends(require_role("ADMIN","OWNER"))])
def list_pending(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Submission.id, Submission.payload, Submission.submitted_by_user_id, Submission.submission_type, User.name, User.email)
        .join(User, User.id == Submission.submitted_by_user_id)
        .where(Submission.status == "PENDING")
    ).all()
    return [
        {
            "id": s[0], 
            "payload": s[1], 
            "submitted_by_user_id": s[2],
            "submission_type": s[3],
            "submitted_by_name": s[4] or "Unknown",
            "submitted_by_email": s[5] or "Unknown"
        } 
        for s in rows
    ]

@router.post("/{submission_id}/approve", dependencies=[Depends(require_role("ADMIN","OWNER"))])
def approve(submission_id: int, db: Session = Depends(get_db)):
    sub = db.get(Submission, submission_id)
    if not sub or sub.status != "PENDING":
        raise HTTPException(status_code=404, detail="Not found or not pending")

    p = sub.payload
    
    # Check if this is an edit submission
    is_edit = sub.submission_type == "EDIT" or p.get("is_edit", False)
    editing_event_id = p.get("editing_event_id") if is_edit else None

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

    if is_edit and editing_event_id:
        # Update existing event
        ev = db.get(RaceEvent, editing_event_id)
        if not ev:
            raise HTTPException(status_code=404, detail="Event to edit not found")
        
        # Update event fields
        ev.name = p["name"]
        ev.year = year
        ev.location = p.get("location") or "Unknown"
        ev.lat = lat if lat is not None and lat != 0.0 else 0.0
        ev.lng = lng if lng is not None and lng != 0.0 else 0.0
        ev.geom = geo_value
        ev.source_url = p.get("links", [{}])[0].get("url") if p.get("links") else None
        ev.date_from = p.get("date_from")
        ev.date_to = p.get("date_to")
        ev.category = p.get("category")
        if image_url:  # Only update image if a new one was uploaded
            ev.image_url = image_url
        ev.description = (p.get("event_description") or p.get("_event_description") or "").strip() or None
        ev.spot_notes = (p.get("spot_notes") or "").strip() or None
        # Update track records
        ev.track_record_open_name = p.get("track_record_open", {}).get("name") if p.get("track_record_open") else None
        ev.track_record_open_time = p.get("track_record_open", {}).get("time") if p.get("track_record_open") else None
        ev.track_record_luge_name = p.get("track_record_luge", {}).get("name") if p.get("track_record_luge") else None
        ev.track_record_luge_time = p.get("track_record_luge", {}).get("time") if p.get("track_record_luge") else None
        ev.track_record_woman_name = p.get("track_record_woman", {}).get("name") if p.get("track_record_woman") else None
        ev.track_record_woman_time = p.get("track_record_woman", {}).get("time") if p.get("track_record_woman") else None
        ev.organizer_name = p.get("organizer_name")
        # Update all categories and organizers
        ev.all_categories = p.get("all_categories")
        ev.all_organizers = p.get("all_organizers")
        
        db.add(ev); db.flush()
        db.commit()  # Commit the updated event first
        
        # Clear existing results for this event
        db.execute(delete(Result).where(Result.event_id == ev.id))
        db.flush()
    else:
        # Create new event
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
            description=(p.get("event_description") or p.get("_event_description") or "").strip() or None,
            spot_notes=(p.get("spot_notes") or "").strip() or None,
            # Track records
            track_record_open_name=p.get("track_record_open", {}).get("name") if p.get("track_record_open") else None,
            track_record_open_time=p.get("track_record_open", {}).get("time") if p.get("track_record_open") else None,
            track_record_luge_name=p.get("track_record_luge", {}).get("name") if p.get("track_record_luge") else None,
            track_record_luge_time=p.get("track_record_luge", {}).get("time") if p.get("track_record_luge") else None,
            track_record_woman_name=p.get("track_record_woman", {}).get("name") if p.get("track_record_woman") else None,
            track_record_woman_time=p.get("track_record_woman", {}).get("time") if p.get("track_record_woman") else None,
            organizer_name=p.get("organizer_name"),
            # Store all categories and organizers
            all_categories=p.get("all_categories"),
            all_organizers=p.get("all_organizers"),
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
                        position=int(rider["position"]),
                        category="OPEN"
                    )
                    db.add(result)
                    db.flush()
                except Exception as e:
                    if "uq_event_position" in str(e) or "duplicate key" in str(e).lower():
                        db.rollback()
                        continue
                    else:
                        raise
        
        # Process Luge category (use positions 10-19)
        for rider in p.get("top_riders_luge", []):
            n = norm(rider["name"])
            person = db.scalar(select(Person).where(Person.full_name_norm == n))
            if not person:
                person = Person(
                    full_name=rider["name"],
                    full_name_norm=n,
                )
                db.add(person); db.flush()

            # Use position 10 + original position to avoid conflicts with Open category
            luge_position = 10 + int(rider["position"])
            
            # Check if result already exists
            existing_result = db.scalar(select(Result).where(
                Result.event_id == ev.id,
                Result.position == luge_position
            ))
            if not existing_result:
                try:
                    result = Result(
                        event_id=ev.id,
                        person_id=person.id,
                        position=luge_position,
                        category="LUGE"
                    )
                    db.add(result)
                    db.flush()
                except Exception as e:
                    if "uq_event_position" in str(e) or "duplicate key" in str(e).lower():
                        db.rollback()
                        continue
                    else:
                        raise
        
        # Process Woman category (use positions 20-29)
        for rider in p.get("top_riders_woman", []):
            n = norm(rider["name"])
            person = db.scalar(select(Person).where(Person.full_name_norm == n))
            if not person:
                person = Person(
                    full_name=rider["name"],
                    full_name_norm=n,
                )
                db.add(person); db.flush()

            # Use position 20 + original position to avoid conflicts with other categories
            woman_position = 20 + int(rider["position"])
            
            # Check if result already exists
            existing_result = db.scalar(select(Result).where(
                Result.event_id == ev.id,
                Result.position == woman_position
            ))
            if not existing_result:
                try:
                    result = Result(
                        event_id=ev.id,
                        person_id=person.id,
                        position=woman_position,
                        category="WOMAN"
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
                        position=qualifier_position,
                        category="QUALIFIER"
                    )
                    db.add(result)
                    db.flush()
                except Exception as e:
                    if "uq_event_position" in str(e) or "duplicate key" in str(e).lower():
                        db.rollback()
                        continue
                    else:
                        raise

    # Handle organizer as a special achievement
    if p.get("organizer_name"):
        organizer_name = p["organizer_name"].strip()
        if organizer_name:
            # First, remove any existing organizer results for this event
            db.execute(delete(Result).where(Result.event_id == ev.id, Result.category == "ORGANIZER"))
            db.flush()
            
            # Find or create person for organizer
            person = db.scalar(select(Person).where(Person.full_name_norm == norm(organizer_name)))
            if not person:
                person = Person(
                    full_name=organizer_name,
                    full_name_norm=norm(organizer_name)
                )
                db.add(person)
                db.flush()
            
            # Add organizer result with special category
            organizer_result = Result(
                event_id=ev.id,
                person_id=person.id,
                position=999,  # Special position for organizers
                category="ORGANIZER",
                time_str=None,
                notes=None
            )
            db.add(organizer_result)
            db.flush()
    else:
        # If no organizer name provided, remove any existing organizer results
        db.execute(delete(Result).where(Result.event_id == ev.id, Result.category == "ORGANIZER"))
        db.flush()

    sub.status = "APPROVED"
    db.commit()

    # Copy submission attachments to event_attachments
    sub_atts = db.scalars(
        select(SubmissionAttachment).where(SubmissionAttachment.submission_id == submission_id)
    ).all()
    for sa_att in sub_atts:
        ev_att = EventAttachment(
            event_id=ev.id,
            uploaded_by_user_id=sa_att.uploaded_by_user_id,
            original_filename=sa_att.original_filename,
            stored_path=sa_att.stored_path,
            file_size=sa_att.file_size,
            uploaded_at=sa_att.uploaded_at,
        )
        db.add(ev_att)
    if sub_atts:
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


@router.post("/{submission_id}/attachments", status_code=201)
async def upload_submission_attachment(
    submission_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    claims: dict = Depends(get_current_user_claims),
):
    user_id = int(claims["sub"])
    sub = db.get(Submission, submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    if sub.submitted_by_user_id != user_id:
        user = db.get(User, user_id)
        if not user or user.role.value not in ("ADMIN", "OWNER"):
            raise HTTPException(status_code=403, detail="Not your submission")

    content = await file.read()
    original_name = file.filename or "attachment"
    try:
        stored_path, file_size = save_attachment_file(content, original_name, user_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    att = SubmissionAttachment(
        submission_id=submission_id,
        uploaded_by_user_id=user_id,
        original_filename=original_name,
        stored_path=stored_path,
        file_size=file_size,
        uploaded_at=datetime.utcnow(),
    )
    db.add(att)
    db.commit()
    db.refresh(att)
    return {
        "id": att.id,
        "original_filename": att.original_filename,
        "file_size": att.file_size,
        "uploaded_at": att.uploaded_at.isoformat(),
    }


@router.get("/{submission_id}/attachments/{att_id}/download")
def download_submission_attachment(
    submission_id: int,
    att_id: int,
    db: Session = Depends(get_db),
):
    from fastapi.responses import FileResponse
    att = db.scalar(
        select(SubmissionAttachment).where(
            SubmissionAttachment.id == att_id,
            SubmissionAttachment.submission_id == submission_id,
        )
    )
    if not att:
        raise HTTPException(status_code=404, detail="Attachment not found")
    if not os.path.exists(att.stored_path):
        raise HTTPException(status_code=404, detail="File not available")

    _, ext = os.path.splitext(att.original_filename.lower())
    media_types = {
        ".pdf": "application/pdf", ".csv": "text/csv",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".xls": "application/vnd.ms-excel", ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".ods": "application/vnd.oasis.opendocument.spreadsheet", ".txt": "text/plain",
    }
    return FileResponse(
        att.stored_path,
        media_type=media_types.get(ext, "application/octet-stream"),
        headers={"Content-Disposition": f'attachment; filename="{att.original_filename}"'},
    )

@router.post("/batch", status_code=201)
def batch_submit(file: UploadFile = File(...), db: Session = Depends(get_db), claims: dict = Depends(get_current_user_claims)):
    """Process batch upload of races from Excel/ODS file with new column structure"""
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
                # Skip empty rows - check if essential fields are empty
                event_name = str(row.get('event_name', '')).strip()
                date_start = row.get('date_start')
                
                if not event_name or event_name == 'nan' or event_name == '' or pd.isna(date_start):
                    print(f"Skipping empty row {index + 1}")
                    continue
                
                # Check if race already exists
                existing_race = db.scalar(
                    select(RaceEvent).where(
                        RaceEvent.name == event_name,
                        RaceEvent.year == pd.to_datetime(date_start, dayfirst=True).year
                    )
                )
                
                if existing_race:
                    skipped += 1
                    continue

                # Geocode location if provided
                location = str(row.get('location', '')).strip()
                lat, lng = 0.0, 0.0
                
                # Skip geocoding if location is empty, nan, or invalid
                if location and location != "" and location.lower() != 'nan' and location != 'None':
                    coords = geocode_location(location)
                    if coords:
                        lat, lng = coords
                        # Add small delay to respect Nominatim rate limits
                        time.sleep(1)
                    else:
                        print(f"Warning: Could not geocode location '{location}' for event '{row['event_name']}'")
                        location = ""  # Clear invalid location

                # Process categories (can be multiple, comma-separated)
                # Try different possible column names for categories
                categories = None
                for col_name in ['link_event_category', 'category', 'event_category']:
                    if col_name in row and pd.notna(row[col_name]):
                        categories = str(row[col_name]).strip()
                        break
                
                if not categories or categories == 'nan' or categories == '':
                    categories = 'WDSC'
                
                # Split categories and map to valid values
                category_list = [cat.strip().upper() for cat in categories.split(',')]
                primary_category = map_category_to_value(category_list[0]) if category_list else 'WDSC'
                
                # Debug logging
                print(f"Event: {row['event_name']}, Raw categories: '{categories}', Parsed: {category_list}, Final: {primary_category}")

                # Process organizers (can be multiple, comma-separated)
                organizers = str(row.get('organizer', '')).strip()
                organizer_list = []
                if organizers and organizers != 'nan':
                    organizer_list = [org.strip() for org in organizers.split(',') if org.strip()]

                # Prepare submission data
                submission_data = {
                    "name": str(row['event_name']),
                    "date_from": pd.to_datetime(row['date_start'], dayfirst=True).date().isoformat(),
                    "date_to": pd.to_datetime(row.get('date_end'), dayfirst=True).date().isoformat() if pd.notna(row.get('date_end')) else None,
                    "location": location,
                    "lat": lat,
                    "lng": lng,
                    "category": primary_category,
                    "links": [{"name": "Event Page", "url": str(row.get('link_event_page', ''))}] if pd.notna(row.get('link_event_page')) else [],
                    "top_riders_open": [],
                    "top_riders_luge": [],
                    "top_riders_woman": [],
                    "top_qualifiers": [],
                    "track_record_open": None,
                    "track_record_luge": None,
                    "track_record_woman": None,
                    "organizer_name": organizer_list[0] if organizer_list else None,
                    # Store all categories and organizers as JSON strings
                    "all_categories": json.dumps(category_list) if category_list else None,
                    "all_organizers": json.dumps(organizer_list) if organizer_list else None,
                    "event_description": str(row.get('event_description', '')).strip() if pd.notna(row.get('event_description')) else None,
                }

                # Add riders if they exist (new column structure)
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
                
                # Add qualifiers if they exist (support up to 64 qualifiers)
                qualifier_position = 1
                for i in range(1, 65):  # Support up to 64 qualifiers
                    if pd.notna(row.get(f'qualifier_{i}')):
                        submission_data["top_qualifiers"].append({
                            "name": str(row[f'qualifier_{i}']),
                            "position": qualifier_position
                        })
                        qualifier_position += 1

                # Add track records if they exist (new column structure)
                track_records = []
                for i in range(1, 7):  # track_record_1 to track_record_6
                    if pd.notna(row.get(f'track_record_{i}')):
                        track_records.append(str(row[f'track_record_{i}']))
                
                # Assign track records to categories if available
                if len(track_records) >= 1:
                    submission_data["track_record_open"] = {
                        "name": track_records[0],
                        "time": ""  # No time column in new structure
                    }
                if len(track_records) >= 2:
                    submission_data["track_record_luge"] = {
                        "name": track_records[1],
                        "time": ""
                    }
                if len(track_records) >= 3:
                    submission_data["track_record_woman"] = {
                        "name": track_records[2],
                        "time": ""
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
    elif category_upper == 'OUTLAW':
        return 'OUTLAW'
    elif category_upper == 'NATIONAL':
        return 'NATIONAL'
    elif category_upper == 'RACE':
        return 'RACE'
    else:
        return 'WDSC'  # Default fallback
