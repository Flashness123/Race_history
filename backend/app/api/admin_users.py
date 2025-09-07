from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import require_role, get_current_user_claims
from app.models.models import User, Role

router = APIRouter(prefix="/admin/users", tags=["admin-users"])

class UserOut(BaseModel):
    id: int
    email: str
    name: str | None
    role: str
    is_active: bool
    can_submit: bool

    class Config:
        from_attributes = True

class UserUpdateIn(BaseModel):
    role: Role | None = None
    can_submit: bool | None = None
    is_active: bool | None = None

@router.get("", response_model=list[UserOut], dependencies=[Depends(require_role("ADMIN","OWNER"))])
def list_users(db: Session = Depends(get_db)):
    users = db.scalars(select(User).order_by(User.id)).all()
    return users

@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    patch: UserUpdateIn,
    db: Session = Depends(get_db),
    claims: dict = Depends(get_current_user_claims),
):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    caller_role = claims.get("role")
    # Only OWNER may change roles; ADMIN can toggle can_submit / is_active
    if patch.role is not None and caller_role != "OWNER":
        raise HTTPException(status_code=403, detail="Only OWNER can change role")

    if patch.role is not None:
        target.role = patch.role
    if patch.can_submit is not None:
        target.can_submit = patch.can_submit
    if patch.is_active is not None:
        target.is_active = patch.is_active

    db.commit()
    db.refresh(target)
    return target
