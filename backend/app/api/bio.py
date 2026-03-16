# app/api/bio.py
from difflib import SequenceMatcher
import re
import unicodedata

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from app.core.db import get_db
from app.core.security import get_current_user_claims
from app.core.norm import norm
from app.models.models import User, Person, Result, RaceEvent, Bio

router = APIRouter(prefix="/bio", tags=["bio"])

DEFAULT_AVATAR = "/static/uploads/profiles/default_avatar.jpg"


def _fuzzy_name_key(value: str | None) -> str:
    if not value:
        return ""

    normalized = unicodedata.normalize("NFKD", value)
    without_marks = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", without_marks.lower()).strip()


def _name_tokens(value: str | None) -> list[str]:
    return [token for token in _fuzzy_name_key(value).split() if token]


def _rider_name_score(query: str, candidate: str) -> float:
    query_key = _fuzzy_name_key(query)
    candidate_key = _fuzzy_name_key(candidate)
    if len(query_key.replace(" ", "")) < 2 or not candidate_key:
        return 0.0

    query_dense = query_key.replace(" ", "")
    candidate_dense = candidate_key.replace(" ", "")
    score = SequenceMatcher(None, query_dense, candidate_dense).ratio() * 100

    if query_dense == candidate_dense:
        score += 150

    if query_dense in candidate_dense:
        score += 35
    if candidate_dense in query_dense:
        score += 20

    query_tokens = _name_tokens(query)
    candidate_tokens = _name_tokens(candidate)
    if not query_tokens or not candidate_tokens:
        return score

    query_set = set(query_tokens)
    candidate_set = set(candidate_tokens)
    overlap = query_set & candidate_set
    score += len(overlap) * 18

    query_first = query_tokens[0]
    query_last = query_tokens[-1]
    candidate_first = candidate_tokens[0]
    candidate_last = candidate_tokens[-1]
    first_matches = (
        query_first == candidate_first
        or candidate_first.startswith(query_first)
        or query_first.startswith(candidate_first)
    )
    last_matches = (
        query_last == candidate_last
        or candidate_last.startswith(query_last)
        or query_last.startswith(candidate_last)
    )

    if len(query_tokens) >= 2 and len(candidate_tokens) >= 2:
        subset_match = query_set.issubset(candidate_set) or candidate_set.issubset(query_set)
        dense_match = query_dense in candidate_dense or candidate_dense in query_dense
        if not ((first_matches and last_matches) or subset_match or dense_match):
            return 0.0

    if query_first == candidate_first:
        score += 25
    elif first_matches:
        score += 12

    if query_last == candidate_last:
        score += 35
    elif last_matches:
        score += 18

    if query_set.issubset(candidate_set):
        score += 25

    if candidate_tokens[1:-1]:
        middle_initials = {token[0] for token in candidate_tokens[1:-1] if token}
        if overlap and any(token[0] in middle_initials for token in query_tokens if token):
            score += 5

    return score

class BioOut(BaseModel):
    name: str | None
    profile_image_url: str | None = None
    nationality: str | None = None
    place_of_birth: str | None = None
    date_of_birth: date | None = None
    message: str | None = None
    phone_number: str | None = None
    email: str | None = None
    instagram: str | None = None
    facebook: str | None = None
    youtube: str | None = None
    tiktok: str | None = None
    achievements: list[dict]

class BioIn(BaseModel):
    nationality: str | None = None
    place_of_birth: str | None = None
    date_of_birth: date | None = None
    message: str | None = None
    phone_number: str | None = None
    email: str | None = None
    instagram: str | None = None
    facebook: str | None = None
    youtube: str | None = None
    tiktok: str | None = None

def _achievements(db: Session, user: User) -> list[dict]:
    key = user.display_name_norm or norm(user.display_name or user.name)
    if not key:
        return []
    person_ids = db.execute(select(Person.id).where(Person.full_name_norm == key)).scalars().all()
    if not person_ids:
        return []
    rows = db.execute(
        select(
            Person.full_name,
            Result.position,
            Result.category,
            RaceEvent.id, RaceEvent.name, RaceEvent.year, RaceEvent.location,
        )
        .join(Result, Result.person_id == Person.id)
        .join(RaceEvent, RaceEvent.id == Result.event_id)
        .where(Person.id.in_(person_ids))
        .order_by(RaceEvent.year.desc(), Result.position.asc())
    ).all()
    
    achievements = []
    for r in rows:
        position = r[1]
        category = r[2] or "OPEN"
        
        # Convert database positions back to display positions
        if category == "LUGE" and position >= 10:
            display_position = position - 10
        elif category == "WOMAN" and position >= 20:
            display_position = position - 20
        elif category == "QUALIFIER" and position >= 100:
            display_position = position - 100
        elif category == "ORGANIZER":
            display_position = 0  # Special position for organizers
        else:
            display_position = position
            
        achievements.append({
            "person_name": r[0],
            "position": display_position,
            "category": category,
            "event_id": r[3],
            "event_name": r[4],
            "year": r[5],
            "location": r[6],
        })
    
    return achievements


@router.get("/me", response_model=BioOut)
def get_my_bio(db: Session = Depends(get_db), claims: dict = Depends(get_current_user_claims)):
    uid = int(claims["sub"])
    user = db.get(User, uid)
    if not user:
        raise HTTPException(404, "User not found")
    bio = db.scalar(select(Bio).where(Bio.user_id == uid))
    ach = _achievements(db, user)
    return BioOut(
        name=user.display_name or user.name,
        profile_image_url=user.profile_image_url or DEFAULT_AVATAR,
        nationality=bio.nationality if bio else None,
        place_of_birth=bio.place_of_birth if bio else None,
        date_of_birth=bio.date_of_birth if bio else None,
        message=bio.message if bio else None,
        phone_number=bio.phone_number if bio else None,
        email=bio.email if bio else None,
        instagram=bio.instagram if bio else None,
        facebook=bio.facebook if bio else None,
        youtube=bio.youtube if bio else None,
        tiktok=bio.tiktok if bio else None,
        achievements=ach,
    )

@router.patch("/me", response_model=BioOut)
def update_my_bio(payload: BioIn, db: Session = Depends(get_db), claims: dict = Depends(get_current_user_claims)):
    uid = int(claims["sub"])
    user = db.get(User, uid)
    if not user:
        raise HTTPException(404, "User not found")

    bio = db.scalar(select(Bio).where(Bio.user_id == uid))
    if not bio:
        bio = Bio(user_id=uid)
        db.add(bio)

    # --- sanitize/validate ---
    nat = (payload.nationality or "").strip().upper() or None
    if nat is not None and len(nat) != 2:
        raise HTTPException(status_code=400, detail="Nationality must be a 2-letter ISO code, e.g. DE")

    # if your users may type other date formats, keep the field as-is and let Pydantic coerce;
    # otherwise add custom parsing here.

    bio.nationality   = nat
    bio.place_of_birth = payload.place_of_birth
    bio.date_of_birth  = payload.date_of_birth
    bio.message        = payload.message
    bio.phone_number   = payload.phone_number
    bio.email          = payload.email
    bio.instagram      = payload.instagram
    bio.facebook       = payload.facebook
    bio.youtube        = payload.youtube
    bio.tiktok         = payload.tiktok
    # -------------------------

    db.commit(); db.refresh(bio)

    return BioOut(
        name=user.display_name or user.name,
        profile_image_url=user.profile_image_url or DEFAULT_AVATAR,
        nationality=bio.nationality,
        place_of_birth=bio.place_of_birth,
        date_of_birth=bio.date_of_birth,
        message=bio.message,
        phone_number=bio.phone_number,
        email=bio.email,
        instagram=bio.instagram,
        facebook=bio.facebook,
        youtube=bio.youtube,
        tiktok=bio.tiktok,
        achievements=_achievements(db, user),
    )


# Public list of riders with basic info + achievements count
class RiderListOut(BaseModel):
    id: int
    name: str
    nationality: str | None
    achievements_count: int
    profile_image_url: str | None = None

@router.get("/riders", response_model=list[RiderListOut])
def list_riders(db: Session = Depends(get_db)):
    users = db.execute(select(User.id, User.display_name, User.name)).all()
    out: list[RiderListOut] = []
    for uid, dname, uname in users:
        name = dname or uname or ""
        key = norm(dname or uname)
        count = 0
        if key:
            person_ids = db.execute(select(Person.id).where(Person.full_name_norm == key)).scalars().all()
            if person_ids:
                count = db.execute(select(func.count(Result.id)).where(Result.person_id.in_(person_ids))).scalar() or 0
        bio = db.scalar(select(Bio).where(Bio.user_id == uid))
        user = db.get(User, uid)
        out.append(RiderListOut(
            id=uid,
            name=name,
            nationality=bio.nationality if bio else None,
            achievements_count=count,
            profile_image_url=(user.profile_image_url or DEFAULT_AVATAR) if user else DEFAULT_AVATAR,
        ))
    return out

# Extended rider info for unregistered riders
class AllRiderOut(BaseModel):
    id: int | None  # User ID if registered, None if unregistered
    person_id: int  # Person ID from results
    name: str
    nationality: str | None
    achievements_count: int
    profile_image_url: str | None = None
    is_registered: bool
    user_id: int | None = None  # For linking to user profile if registered

@router.get("/riders/all", response_model=list[AllRiderOut])
def list_all_riders(db: Session = Depends(get_db)):
    """Get all riders including unregistered ones from race results"""
    # Get all unique persons who have race results
    person_results = db.execute(
        select(
            Person.id,
            Person.full_name,
            func.count(Result.id).label('achievements_count')
        )
        .join(Result, Result.person_id == Person.id)
        .group_by(Person.id, Person.full_name)
        .order_by(func.count(Result.id).desc())
    ).all()
    
    out: list[AllRiderOut] = []
    
    for person_id, full_name, achievements_count in person_results:
        # Check if this person has a registered account
        user = db.scalar(
            select(User).where(User.display_name_norm == norm(full_name))
        )
        
        if user:
            # Registered user - get their bio info
            bio = db.scalar(select(Bio).where(Bio.user_id == user.id))
            out.append(AllRiderOut(
                id=user.id,
                person_id=person_id,
                name=user.display_name or user.name or full_name,
                nationality=bio.nationality if bio else None,
                achievements_count=achievements_count,
                profile_image_url=user.profile_image_url or DEFAULT_AVATAR,
                is_registered=True,
                user_id=user.id
            ))
        else:
            # Unregistered rider - use person data
            out.append(AllRiderOut(
                id=None,
                person_id=person_id,
                name=full_name,
                nationality=None,
                achievements_count=achievements_count,
                profile_image_url=DEFAULT_AVATAR,
                is_registered=False,
                user_id=None
            ))
    
    return out

class TopRiderOut(BaseModel):
    id: int | None
    name: str
    achievements_count: int
    profile_image_url: str | None = None


class RiderSearchSuggestionOut(BaseModel):
    name: str
    country: str | None
    achievements_count: int

@router.get("/top", response_model=list[TopRiderOut])
def top_riders(db: Session = Depends(get_db)):
    # Aggregate by Person (race results), then try to map to Users via normalized name
    person_counts = db.execute(
        select(Person.full_name, Person.full_name_norm, Person.id, func.count(Result.id))
        .join(Result, Result.person_id == Person.id)
        .group_by(Person.id)
        .order_by(func.count(Result.id).desc())
        .limit(10)
    ).all()

    out: list[TopRiderOut] = []
    for full_name, norm_name, person_id, cnt in person_counts:
        user = db.scalar(select(User).where(User.display_name_norm == norm_name))
        out.append(TopRiderOut(
            id=user.id if user else None,
            name=user.display_name or user.name if user else full_name,
            achievements_count=cnt,
            profile_image_url=(user.profile_image_url or DEFAULT_AVATAR) if user else DEFAULT_AVATAR,
        ))
    return out

# Smart rider name suggestions based on achievement names that are not yet claimed
@router.get("/riders/search", response_model=list[RiderSearchSuggestionOut])
def rider_search(
    q: str,
    limit: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db),
):
    query = (q or "").strip()
    if len(_fuzzy_name_key(query).replace(" ", "")) < 2:
        return []

    people = db.execute(
        select(
            Person.full_name,
            Person.full_name_norm,
            Person.country,
            func.count(Result.id).label("achievements_count"),
        )
        .join(Result, Result.person_id == Person.id)
        .group_by(Person.id, Person.full_name, Person.full_name_norm, Person.country)
    ).all()

    claimed_norms = {
        value
        for value in db.execute(
            select(User.display_name_norm).where(User.display_name_norm.is_not(None))
        ).scalars()
        if value
    }

    suggestions: list[tuple[float, int, str, str | None]] = []
    for full_name, full_name_norm, country, achievements_count in people:
        if full_name_norm in claimed_norms:
            continue

        score = _rider_name_score(query, full_name)
        if score < 60:
            continue

        suggestions.append((score, achievements_count, full_name, country))

    suggestions.sort(key=lambda item: (-item[0], -item[1], item[2].lower()))

    return [
        {
            "name": full_name,
            "country": country,
            "achievements_count": achievements_count,
        }
        for _, achievements_count, full_name, country in suggestions[:limit]
    ]


# Public rider detail page
class PublicRiderOut(BaseModel):
    id: int
    name: str
    profile_image_url: str | None = None
    nationality: str | None
    place_of_birth: str | None
    date_of_birth: date | None
    message: str | None
    achievements: list[dict]

@router.get("/riders/{user_id}", response_model=PublicRiderOut)
def public_rider(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    bio = db.scalar(select(Bio).where(Bio.user_id == user_id))
    return PublicRiderOut(
        id=user.id,
        name=user.display_name or user.name,
        profile_image_url=user.profile_image_url or DEFAULT_AVATAR,
        nationality=bio.nationality if bio else None,
        place_of_birth=bio.place_of_birth if bio else None,
        date_of_birth=bio.date_of_birth if bio else None,
        message=bio.message if bio else None,
        achievements=_achievements(db, user),
    )

# Extended rider profile for both registered and unregistered riders
class ExtendedRiderOut(BaseModel):
    id: int | None
    person_id: int
    name: str
    profile_image_url: str
    nationality: str | None
    place_of_birth: str | None
    date_of_birth: str | None
    message: str | None
    achievements: list[dict]
    is_registered: bool
    user_id: int | None

@router.get("/riders/person/{person_id}", response_model=ExtendedRiderOut)
def public_rider_by_person(person_id: int, db: Session = Depends(get_db)):
    """Get rider profile by person_id (works for both registered and unregistered riders)"""
    # Get person data
    person = db.get(Person, person_id)
    if not person:
        raise HTTPException(404, "Person not found")
    
    # Check if this person has a registered account
    user = db.scalar(
        select(User).where(User.display_name_norm == norm(person.full_name))
    )
    
    if user:
        # Registered user - get their bio info
        bio = db.scalar(select(Bio).where(Bio.user_id == user.id))
        return ExtendedRiderOut(
            id=user.id,
            person_id=person_id,
            name=user.display_name or user.name or person.full_name,
            profile_image_url=user.profile_image_url or DEFAULT_AVATAR,
            nationality=bio.nationality if bio else None,
            place_of_birth=bio.place_of_birth if bio else None,
            date_of_birth=bio.date_of_birth if bio else None,
            message=bio.message if bio else None,
            achievements=_achievements(db, user),
            is_registered=True,
            user_id=user.id
        )
    else:
        # Unregistered rider - get achievements directly from person
        achievements = _achievements_by_person(db, person)
        return ExtendedRiderOut(
            id=None,
            person_id=person_id,
            name=person.full_name,
            profile_image_url=DEFAULT_AVATAR,
            nationality=None,
            place_of_birth=None,
            date_of_birth=None,
            message=None,
            achievements=achievements,
            is_registered=False,
            user_id=None
        )

def _achievements_by_person(db: Session, person: Person) -> list[dict]:
    """Get achievements for a person (unregistered rider)"""
    rows = db.execute(
        select(
            Person.full_name,
            Result.position,
            Result.category,
            RaceEvent.id, RaceEvent.name, RaceEvent.year, RaceEvent.location,
        )
        .join(Result, Result.person_id == Person.id)
        .join(RaceEvent, RaceEvent.id == Result.event_id)
        .where(Person.id == person.id)
        .order_by(RaceEvent.year.desc(), Result.position.asc())
    ).all()
    
    achievements = []
    for r in rows:
        position = r[1]
        category = r[2] or "OPEN"
        
        # Convert database positions back to display positions
        if category == "LUGE" and position >= 10:
            display_position = position - 10
        elif category == "WOMAN" and position >= 20:
            display_position = position - 20
        elif category == "QUALIFIER" and position >= 100:
            display_position = position - 100
        elif category == "ORGANIZER":
            display_position = 0  # Special position for organizers
        else:
            display_position = position
            
        achievements.append({
            "person_name": r[0],
            "position": display_position,
            "category": category,
            "event_id": r[3],
            "event_name": r[4],
            "year": r[5],
            "location": r[6],
        })
    
    return achievements
