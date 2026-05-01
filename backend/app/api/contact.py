from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, desc
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import require_role
from app.models.models import ContactMessage

router = APIRouter(tags=["contact"])


class ContactIn(BaseModel):
    name: str
    email: str
    subject: str
    message: str


class ContactStatusIn(BaseModel):
    status: str  # UNREAD | READ | ARCHIVED


@router.post("/contact", status_code=201)
def submit_contact(body: ContactIn, db: Session = Depends(get_db)):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    msg = ContactMessage(
        name=body.name.strip(),
        email=body.email.strip(),
        subject=body.subject.strip(),
        message=body.message.strip(),
        status="UNREAD",
        created_at=datetime.utcnow(),
    )
    db.add(msg)
    db.commit()
    return {"id": msg.id}


@router.get("/admin/contact-messages", dependencies=[Depends(require_role("ADMIN", "OWNER"))])
def list_contact_messages(db: Session = Depends(get_db)):
    rows = db.execute(
        select(ContactMessage).order_by(desc(ContactMessage.created_at))
    ).scalars().all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "email": r.email,
            "subject": r.subject,
            "message": r.message,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.patch("/admin/contact-messages/{msg_id}", dependencies=[Depends(require_role("ADMIN", "OWNER"))])
def update_contact_message(msg_id: int, body: ContactStatusIn, db: Session = Depends(get_db)):
    msg = db.get(ContactMessage, msg_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Not found")
    if body.status not in ("UNREAD", "READ", "ARCHIVED"):
        raise HTTPException(status_code=400, detail="Invalid status")
    msg.status = body.status
    db.commit()
    return {"id": msg.id, "status": msg.status}


@router.delete("/admin/contact-messages/{msg_id}", status_code=204, dependencies=[Depends(require_role("ADMIN", "OWNER"))])
def delete_contact_message(msg_id: int, db: Session = Depends(get_db)):
    msg = db.get(ContactMessage, msg_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(msg)
    db.commit()
