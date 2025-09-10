# app/api/bio.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from app.core.db import get_db
from app.core.security import get_current_user_claims
from app.core.norm import norm
from app.models.models import User, Person, Result, RaceEvent, Bio

router = APIRouter(prefix="/bio", tags=["bio"])

class BioOut(BaseModel):
    name: str | None
    nationality: str | None = None
    place_of_birth: str | None = None
    date_of_birth: date | None = None
    message: str | None = None
    achievements: list[dict]

class BioIn(BaseModel):
    nationality: str | None = None
    place_of_birth: str | None = None
    date_of_birth: date | None = None
    message: str | None = None

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
            RaceEvent.id, RaceEvent.name, RaceEvent.year, RaceEvent.location,
        )
        .join(Result, Result.person_id == Person.id)
        .join(RaceEvent, RaceEvent.id == Result.event_id)
        .where(Person.id.in_(person_ids))
        .order_by(RaceEvent.year.desc(), Result.position.asc())
    ).all()
    return [
        {
            "person_name": r[0],
            "position": r[1],
            "event_id": r[2],
            "event_name": r[3],
            "year": r[4],
            "location": r[5],
        }
        for r in rows
    ]


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
        nationality=bio.nationality if bio else None,
        place_of_birth=bio.place_of_birth if bio else None,
        date_of_birth=bio.date_of_birth if bio else None,
        message=bio.message if bio else None,
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
    # -------------------------

    db.commit(); db.refresh(bio)

    return BioOut(
        name=user.display_name or user.name,
        nationality=bio.nationality,
        place_of_birth=bio.place_of_birth,
        date_of_birth=bio.date_of_birth,
        message=bio.message,
        achievements=_achievements(db, user),
    )


# Public list of riders with basic info + achievements count
class RiderListOut(BaseModel):
    id: int
    name: str
    nationality: str | None
    achievements_count: int

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
        out.append(RiderListOut(id=uid, name=name, nationality=bio.nationality if bio else None, achievements_count=count))
    return out


# Public rider detail page
class PublicRiderOut(BaseModel):
    id: int
    name: str
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
        nationality=bio.nationality if bio else None,
        place_of_birth=bio.place_of_birth if bio else None,
        date_of_birth=bio.date_of_birth if bio else None,
        message=bio.message if bio else None,
        achievements=_achievements(db, user),
    )