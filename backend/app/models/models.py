from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, UniqueConstraint, Boolean, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geography
import enum
from passlib.hash import bcrypt
from typing import Optional

from app.core.db import Base

class Person(Base):
    __tablename__ = "people"
    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(160), index=True)
    country: Mapped[str | None] = mapped_column(String(2))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    results: Mapped[list["Result"]] = relationship(back_populates="person")

class RaceEvent(Base):
    __tablename__ = "race_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    year: Mapped[int] = mapped_column(index=True)
    date_from: Mapped[datetime | None]
    date_to: Mapped[datetime | None]
    location: Mapped[str] = mapped_column(String(200))
    lat: Mapped[float]
    lng: Mapped[float]
    # NOTE: store as GEOGRAPHY(Point, 4326) for distance/bbox; use long,lat order for POINT
    geom = mapped_column(Geography(geometry_type="POINT", srid=4326))
    source_url: Mapped[str | None]
    results: Mapped[list["Result"]] = relationship(back_populates="event")

class Result(Base):
    __tablename__ = "results"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("race_events.id"))
    person_id: Mapped[int] = mapped_column(ForeignKey("people.id"))
    position: Mapped[int]
    time_str: Mapped[str | None]
    notes: Mapped[str | None]
    person: Mapped[Person] = relationship(back_populates="results")
    event: Mapped[RaceEvent] = relationship(back_populates="results")
    __table_args__ = (UniqueConstraint("event_id", "position", name="uq_event_position"),)

class Role(enum.Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    USER = "USER"

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[Optional[str]] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.USER)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    can_submit: Mapped[bool] = mapped_column(Boolean, default=True)

    @staticmethod
    def hash_password(pw: str) -> str:
        return bcrypt.hash(pw)

    def verify_password(self, pw: str) -> bool:
        return bcrypt.verify(pw, self.password_hash)

class Submission(Base):
    __tablename__ = "submissions"
    id: Mapped[int] = mapped_column(primary_key=True)
    submitted_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    payload: Mapped[dict] = mapped_column(JSON)  # {name,year,lat,lng,location, source_url, top3?}
    status: Mapped[str] = mapped_column(String(20), default="PENDING")  # PENDING/APPROVED/REJECTED
    review_note: Mapped[str | None]