import os
import uuid
from typing import Literal

ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_BYTES = 5 * 1024 * 1024  # 5 MB

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
UPLOAD_ROOT = os.path.join(BASE_DIR, "static", "uploads")
PROFILE_DIR = os.path.join(UPLOAD_ROOT, "profiles")
EVENT_DIR = os.path.join(UPLOAD_ROOT, "events")

for d in (UPLOAD_ROOT, PROFILE_DIR, EVENT_DIR):
    os.makedirs(d, exist_ok=True)

def _ext_ok(filename: str) -> bool:
    _, ext = os.path.splitext(filename.lower())
    return ext in ALLOWED_EXTS

def save_file(file_bytes: bytes, filename: str, kind: Literal["profile", "event"], owner_id: int | None = None) -> str:
    if len(file_bytes) > MAX_BYTES:
        raise ValueError("File too large (max 5 MB)")
    if not _ext_ok(filename):
        raise ValueError("Unsupported file type. Use JPG/PNG/WEBP")
    _, ext = os.path.splitext(filename.lower())
    uid = uuid.uuid4().hex[:8]
    if kind == "profile":
        folder = PROFILE_DIR
        outname = f"{owner_id}_{uid}{ext}" if owner_id else f"{uid}{ext}"
        rel = f"/static/uploads/profiles/{outname}"
    else:
        folder = EVENT_DIR
        outname = f"{owner_id}_{uid}{ext}" if owner_id else f"{uid}{ext}"
        rel = f"/static/uploads/events/{outname}"
    path = os.path.join(folder, outname)
    with open(path, "wb") as f:
        f.write(file_bytes)
    return rel