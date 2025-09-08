# app/api/bio.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.db import get_db
from app.core.security import get_current_user_claims
from app.core.norm import norm
from app.models.models import User, Person, Result, RaceEvent

router = APIRouter(prefix="/bio", tags=["bio"])

class BioOut(BaseModel):
    name: str | None
    date_of_birth: str | None = None
    nationality: str | None = None
    motivation: str | None = None
    about: str | None = None
    achievements: list[dict]

@router.get("/me", response_model=BioOut)
def get_my_bio(
    db: Session = Depends(get_db),
    claims: dict = Depends(get_current_user_claims),
):
    uid = int(claims["sub"])
    user = db.get(User, uid)
    if not user:
        raise HTTPException(404, "User not found")

    # Use the same normalization everywhere
    key = user.display_name_norm or norm(user.display_name or user.name)
    if not key:
        return BioOut(name=user.name, achievements=[])

    # Option A: only select ids + scalars()
    person_ids = db.execute(
        select(Person.id).where(Person.full_name_norm == key)
    ).scalars().all()

    if not person_ids:
        return BioOut(name=user.display_name or user.name, achievements=[])

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

    achievements = [
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

    return BioOut(
        name=user.display_name or user.name,
        achievements=achievements,
    )
