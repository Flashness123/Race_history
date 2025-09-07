from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, constr
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.db import get_db
from app.models.models import User, Role
from app.core.security import create_access_token
from app.core.security import get_current_user_claims
from typing import Annotated

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterIn(BaseModel):
    email: EmailStr
    name: str | None = None
    password: Annotated[str, constr(min_length=8)]

class LoginIn(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    exists = db.scalar(select(User).where(User.email == data.email))
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=data.email, name=data.name, password_hash=User.hash_password(data.password), role=Role.USER)
    db.add(user)
    db.commit()
    return {"ok": True}

@router.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email))
    if not user or not user.verify_password(data.password) or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(str(user.id), user.role.value)
    return {"access_token": token, "token_type": "bearer", "role": user.role.value, "name": user.name}

@router.get("/me")
def me(claims: dict = Depends(get_current_user_claims), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.id == int(claims["sub"])))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "email": user.email, "name": user.name, "role": user.role.value}