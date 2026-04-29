import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional
from app.core.db import get_db
from app.core.security import get_current_user_claims, get_optional_user_claims
from app.core.files import save_attachment_file
from app.models.models import EventAttachment, RaceEvent, User

router = APIRouter(prefix="/events", tags=["attachments"])


def _format_attachment(att: EventAttachment, uploader: User | None, current_user_id: int | None) -> dict:
    return {
        "id": att.id,
        "original_filename": att.original_filename,
        "file_size": att.file_size,
        "uploaded_at": att.uploaded_at.isoformat(),
        "uploaded_by_name": (uploader.display_name or uploader.name or "Unknown") if uploader else "Unknown",
        "is_own": att.uploaded_by_user_id == current_user_id if current_user_id else False,
    }


@router.post("/{event_id}/attachments", status_code=201)
async def upload_attachment(
    event_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    claims: dict = Depends(get_current_user_claims),
):
    user_id = int(claims["sub"])
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")

    event = db.get(RaceEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    content = await file.read()
    original_name = file.filename or "attachment"
    try:
        stored_path, file_size = save_attachment_file(content, original_name, user_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    att = EventAttachment(
        event_id=event_id,
        uploaded_by_user_id=user_id,
        original_filename=original_name,
        stored_path=stored_path,
        file_size=file_size,
        uploaded_at=datetime.utcnow(),
    )
    db.add(att)
    db.commit()
    db.refresh(att)

    return _format_attachment(att, user, user_id)


@router.get("/{event_id}/attachments")
def list_attachments(
    event_id: int,
    db: Session = Depends(get_db),
    claims: Optional[dict] = Depends(get_optional_user_claims),
):
    event = db.get(RaceEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    current_user_id = int(claims["sub"]) if claims else None

    rows = db.execute(
        select(EventAttachment, User)
        .outerjoin(User, EventAttachment.uploaded_by_user_id == User.id)
        .where(EventAttachment.event_id == event_id)
        .order_by(EventAttachment.uploaded_at.desc())
    ).all()

    return [_format_attachment(att, uploader, current_user_id) for att, uploader in rows]


@router.get("/{event_id}/attachments/{att_id}/download")
def download_attachment(
    event_id: int,
    att_id: int,
    db: Session = Depends(get_db),
):
    att = db.scalar(
        select(EventAttachment).where(
            EventAttachment.id == att_id,
            EventAttachment.event_id == event_id,
        )
    )
    if not att:
        raise HTTPException(status_code=404, detail="Attachment not found")
    if not os.path.exists(att.stored_path):
        raise HTTPException(status_code=404, detail="File not available")

    _, ext = os.path.splitext(att.original_filename.lower())
    media_types = {
        ".pdf": "application/pdf",
        ".csv": "text/csv",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".xls": "application/vnd.ms-excel",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".ods": "application/vnd.oasis.opendocument.spreadsheet",
        ".txt": "text/plain",
    }
    media_type = media_types.get(ext, "application/octet-stream")

    return FileResponse(
        att.stored_path,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{att.original_filename}"'},
    )


@router.delete("/{event_id}/attachments/{att_id}", status_code=204)
def delete_attachment(
    event_id: int,
    att_id: int,
    db: Session = Depends(get_db),
    claims: dict = Depends(get_current_user_claims),
):
    user_id = int(claims["sub"])
    user = db.get(User, user_id)

    att = db.scalar(
        select(EventAttachment).where(
            EventAttachment.id == att_id,
            EventAttachment.event_id == event_id,
        )
    )
    if not att:
        raise HTTPException(status_code=404, detail="Attachment not found")

    is_owner = att.uploaded_by_user_id == user_id
    is_admin = user and user.role.value in ("ADMIN", "OWNER")
    if not is_owner and not is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this attachment")

    if os.path.exists(att.stored_path):
        os.remove(att.stored_path)

    db.delete(att)
    db.commit()
