from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import select, func, cast
from geoalchemy2 import Geography
from app.core.db import get_db
from app.core.security import get_current_user_claims, require_role
from app.models.models import Submission, RaceEvent, Result, Person, User
from app.core.norm import norm

router = APIRouter(prefix="/submissions", tags=["submissions"])

class SubmissionIn(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    year: int
    location: str
    lat: float
    lng: float
    source_url: str | None = None
    top3: list[dict] | None = None  # [{name,country,position}, ...]

@router.post("", status_code=201)
def create_submission(data: SubmissionIn, db: Session = Depends(get_db), claims: dict = Depends(get_current_user_claims)):
    user_id = int(claims["sub"])
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")
    if not user.can_submit:
        raise HTTPException(status_code=403, detail="Submitting disabled for your account")

    sub = Submission(submitted_by_user_id=user_id, payload=data.dict(), status="PENDING")
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return {"id": sub.id, "status": sub.status}

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

    # Cast the point to Geography(POINT,4326) ✅
    geo_value = cast(
        func.ST_SetSRID(func.ST_MakePoint(p["lng"], p["lat"]), 4326),
        Geography(geometry_type="POINT", srid=4326),
    )

    ev = RaceEvent(
        name=p["name"],
        year=p["year"],
        location=p["location"],
        lat=p["lat"],
        lng=p["lng"],
        geom=geo_value,                        # ✅ robust insert
        source_url=p.get("source_url"),
    )
    db.add(ev); db.flush()

    # optional top-3 with instagram
    for item in (p.get("top3") or []):
        n = norm(item["name"])  # normalized key
        person = db.scalar(select(Person).where(Person.full_name_norm == n))
        if not person:
            person = Person(
                full_name=item["name"],
                full_name_norm=n,
                country=item.get("country"),
            )
            db.add(person); db.flush()

        db.add(Result(
            event_id=ev.id,
            person_id=person.id,
            position=int(item["position"])
        ))
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
