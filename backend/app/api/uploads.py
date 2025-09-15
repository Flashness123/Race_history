from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.db import get_db
from app.core.security import get_current_user_claims
from app.core.files import save_file
from app.models.models import User, RaceEvent
from app.models.models import Submission

router = APIRouter(prefix="/uploads", tags=["uploads"])

@router.post("/profile-image")
def upload_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    claims: dict = Depends(get_current_user_claims),
):
    uid = int(claims["sub"])
    user = db.get(User, uid)
    if not user:
        raise HTTPException(404, "User not found")
    try:
        content = file.file.read()
        rel = save_file(content, file.filename, kind="profile", owner_id=uid)
    except ValueError as e:
        raise HTTPException(400, str(e))
    user.profile_image_url = rel
    db.add(user); db.commit(); db.refresh(user)
    return {"profile_image_url": user.profile_image_url}


@router.post("/event-image/{event_id}")
def upload_event_image(
    event_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    claims: dict = Depends(get_current_user_claims),
):
    # any logged-in user who submitted/approved could upload; tighten if needed
    ev = db.get(RaceEvent, event_id)
    if not ev:
        raise HTTPException(404, "Event not found")
    try:
        content = file.file.read()
        rel = save_file(content, file.filename, kind="event", owner_id=event_id)
    except ValueError as e:
        raise HTTPException(400, str(e))
    ev.image_url = rel
    db.add(ev); db.commit(); db.refresh(ev)
    return {"image_url": ev.image_url}

@router.post("/submission-image/{submission_id}")
def upload_submission_image(
    submission_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    claims: dict = Depends(get_current_user_claims),
):
    sub = db.get(Submission, submission_id)
    if not sub:
        raise HTTPException(404, "Submission not found")
    try:
        content = file.file.read()
        rel = save_file(content, file.filename, kind="event", owner_id=submission_id)
    except ValueError as e:
        raise HTTPException(400, str(e))
    # stash it in payload under a known key
    payload = sub.payload or {}
    payload["_uploaded_image_url"] = rel
    sub.payload = payload
    db.add(sub); db.commit(); db.refresh(sub)
    return {"temp_image_url": rel}

