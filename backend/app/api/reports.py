from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, desc
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user_claims, require_role
from app.models.models import EventReport, RaceEvent, User

router = APIRouter(tags=["reports"])


class ReportIn(BaseModel):
    message: str


class ReportStatusIn(BaseModel):
    status: str  # OPEN | RESOLVED | DISMISSED


@router.post("/events/{event_id}/report", status_code=201)
def submit_report(
    event_id: int,
    body: ReportIn,
    db: Session = Depends(get_db),
    claims: dict = Depends(get_current_user_claims),
):
    event = db.get(RaceEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    user_id = int(claims["sub"])
    user = db.get(User, user_id)

    report = EventReport(
        event_id=event_id,
        user_id=user_id,
        user_name=(user.display_name or user.name) if user else None,
        user_email=user.email if user else None,
        message=body.message.strip(),
        status="OPEN",
        created_at=datetime.utcnow(),
    )
    db.add(report)
    db.commit()
    return {"id": report.id, "status": "OPEN"}


@router.get("/admin/reports", dependencies=[Depends(require_role("ADMIN", "OWNER"))])
def list_reports(db: Session = Depends(get_db)):
    rows = db.execute(
        select(
            EventReport.id,
            EventReport.event_id,
            EventReport.user_name,
            EventReport.user_email,
            EventReport.message,
            EventReport.status,
            EventReport.created_at,
            RaceEvent.name.label("event_name"),
            RaceEvent.category.label("event_category"),
        )
        .join(RaceEvent, RaceEvent.id == EventReport.event_id)
        .order_by(desc(EventReport.created_at))
    ).all()
    return [
        {
            "id": r[0],
            "event_id": r[1],
            "user_name": r[2],
            "user_email": r[3],
            "message": r[4],
            "status": r[5],
            "created_at": r[6].isoformat() if r[6] else None,
            "event_name": r[7],
            "event_category": r[8],
        }
        for r in rows
    ]


@router.patch("/admin/reports/{report_id}", dependencies=[Depends(require_role("ADMIN", "OWNER"))])
def update_report(report_id: int, body: ReportStatusIn, db: Session = Depends(get_db)):
    report = db.get(EventReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if body.status not in ("OPEN", "RESOLVED", "DISMISSED"):
        raise HTTPException(status_code=400, detail="Invalid status")
    report.status = body.status
    if body.status in ("RESOLVED", "DISMISSED"):
        report.resolved_at = datetime.utcnow()
    else:
        report.resolved_at = None
    db.commit()
    return {"id": report.id, "status": report.status}


@router.delete("/admin/reports/{report_id}", status_code=204, dependencies=[Depends(require_role("ADMIN", "OWNER"))])
def delete_report(report_id: int, db: Session = Depends(get_db)):
    report = db.get(EventReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
