from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, UniqueConstraint, Boolean, Enum, JSON, Date, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geography
import enum
from passlib.hash import bcrypt
from typing import Optional
from sqlalchemy import event
from app.core.norm import norm
from app.core.db import Base
from datetime import date


class Person(Base):
    __tablename__ = "people"
    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(160), index=True)
    full_name_norm: Mapped[str | None] = mapped_column(String(160), index=True)
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
    image_url: Mapped[str | None] = mapped_column(String(400))
    category: Mapped[str | None] = mapped_column(String(20))  # SPOT | WDSC | EURO | FREERIDE
    # Multiple categories and organizers
    all_categories: Mapped[str | None] = mapped_column(Text)  # JSON string of all categories
    all_organizers: Mapped[str | None] = mapped_column(Text)  # JSON string of all organizers
    description: Mapped[str | None] = mapped_column(Text)
    spot_notes: Mapped[str | None] = mapped_column(Text)
    # Track record fields
    track_record_open_name: Mapped[str | None] = mapped_column(String(200))
    track_record_open_time: Mapped[str | None] = mapped_column(String(50))
    track_record_luge_name: Mapped[str | None] = mapped_column(String(200))
    track_record_luge_time: Mapped[str | None] = mapped_column(String(50))
    track_record_woman_name: Mapped[str | None] = mapped_column(String(200))
    track_record_woman_time: Mapped[str | None] = mapped_column(String(50))
    organizer_name: Mapped[str | None] = mapped_column(String(200))
    results: Mapped[list["Result"]] = relationship(back_populates="event")

class Result(Base):
    __tablename__ = "results"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("race_events.id"))
    person_id: Mapped[int] = mapped_column(ForeignKey("people.id"))
    position: Mapped[int]
    category: Mapped[str | None] = mapped_column(String(20))  # OPEN | LUGE | WOMAN | QUALIFIER
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
    display_name: Mapped[str | None] = mapped_column(String(160))
    display_name_norm: Mapped[str | None] = mapped_column(String(160), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.USER)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    can_submit: Mapped[bool] = mapped_column(Boolean, default=True)
    profile_image_url: Mapped[str | None] = mapped_column(String(400))

    @staticmethod
    def hash_password(pw: str) -> str:
        return bcrypt.hash(pw)

    def verify_password(self, pw: str) -> bool:
        return bcrypt.verify(pw, self.password_hash)
    
@event.listens_for(User, "before_insert")
def _user_before_insert(mapper, conn, target: User):
    target.display_name = target.display_name or target.name
    target.display_name_norm = norm(target.display_name or target.name)
    if not target.profile_image_url:
        target.profile_image_url = "/static/uploads/profiles/default_avatar.jpg"

@event.listens_for(User, "before_update")
def _user_before_update(mapper, conn, target: User):
    # recompute every update; cheap and safe
    target.display_name = target.display_name or target.name
    target.display_name_norm = norm(target.display_name or target.name)

class Submission(Base):
    __tablename__ = "submissions"
    id: Mapped[int] = mapped_column(primary_key=True)
    submitted_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    payload: Mapped[dict] = mapped_column(JSON)  # {name,year,lat,lng,location, source_url, top3?}
    status: Mapped[str] = mapped_column(String(20), default="PENDING")  # PENDING/APPROVED/REJECTED
    submission_type: Mapped[str] = mapped_column(String(20), default="NEW")  # NEW/EDIT
    review_note: Mapped[str | None]

class Bio(Base):
    __tablename__ = "bios"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    nationality: Mapped[str | None] = mapped_column(String(2)) # ISO-2
    place_of_birth: Mapped[str | None] = mapped_column(String(160))
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    message: Mapped[str | None] = mapped_column(Text) # short motivational text
    phone_number: Mapped[str | None] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(255))
    instagram: Mapped[str | None] = mapped_column(String(100))
    facebook: Mapped[str | None] = mapped_column(String(100))
    youtube: Mapped[str | None] = mapped_column(String(100))
    tiktok: Mapped[str | None] = mapped_column(String(100))
    user: Mapped["User"] = relationship("User", backref="bio", uselist=False)

class Video(Base):
    __tablename__ = "videos"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), index=True)
    description: Mapped[str | None] = mapped_column(Text)
    youtube_url: Mapped[str] = mapped_column(String(500), unique=True, index=True)
    youtube_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)  # extracted from URL
    thumbnail_url: Mapped[str | None] = mapped_column(String(500))
    uploaded_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    like_count: Mapped[int] = mapped_column(Integer, default=0, index=True)
    
    # Relationships
    uploaded_by: Mapped["User"] = relationship("User", backref="uploaded_videos")
    likes: Mapped[list["VideoLike"]] = relationship("VideoLike", back_populates="video", cascade="all, delete-orphan")

class VideoLike(Base):
    __tablename__ = "video_likes"
    id: Mapped[int] = mapped_column(primary_key=True)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Relationships
    video: Mapped["Video"] = relationship("Video", back_populates="likes")
    user: Mapped["User"] = relationship("User", backref="video_likes")

    # Ensure one like per user per video
    __table_args__ = (UniqueConstraint("video_id", "user_id", name="uq_video_user_like"),)

class SpotRun(Base):
    __tablename__ = "spot_runs"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("race_events.id", ondelete="CASCADE"), index=True)
    uploaded_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    rider_name: Mapped[str] = mapped_column(String(160))
    duration_ms: Mapped[int]
    max_speed_kmh: Mapped[float]
    avg_speed_kmh: Mapped[float]
    track_points: Mapped[dict] = mapped_column(JSON)  # [{t, lat, lng, alt, spd}, ...]
    raw_file_path: Mapped[str | None] = mapped_column(String(400), nullable=True)
    run_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class EventAttachment(Base):
    __tablename__ = "event_attachments"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("race_events.id", ondelete="CASCADE"), index=True)
    uploaded_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    original_filename: Mapped[str] = mapped_column(String(260))
    stored_path: Mapped[str] = mapped_column(String(400))
    file_size: Mapped[int]
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SubmissionAttachment(Base):
    __tablename__ = "submission_attachments"
    id: Mapped[int] = mapped_column(primary_key=True)
    submission_id: Mapped[int] = mapped_column(ForeignKey("submissions.id", ondelete="CASCADE"), index=True)
    uploaded_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    original_filename: Mapped[str] = mapped_column(String(260))
    stored_path: Mapped[str] = mapped_column(String(400))
    file_size: Mapped[int]
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
