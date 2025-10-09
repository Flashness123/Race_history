from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, HttpUrl
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc, and_
from app.core.db import get_db
from app.core.security import get_current_user_claims, get_optional_user_claims, require_role
from app.models.models import Video, VideoLike, User
from typing import Optional
import re
from urllib.parse import urlparse, parse_qs

router = APIRouter(prefix="/videos", tags=["videos"])

class VideoIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    youtube_url: HttpUrl

class VideoOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    youtube_url: str
    youtube_id: str
    thumbnail_url: Optional[str]
    uploaded_by_user_id: int
    uploaded_by_name: str
    created_at: str
    like_count: int
    is_liked: bool = False

def extract_youtube_id(url: str) -> str:
    """Extract YouTube video ID from various YouTube URL formats"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/v\/([^&\n?#]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, str(url))
        if match:
            return match.group(1)
    
    raise ValueError("Invalid YouTube URL format")

def get_youtube_thumbnail(youtube_id: str) -> str:
    """Get YouTube thumbnail URL from video ID"""
    return f"https://img.youtube.com/vi/{youtube_id}/maxresdefault.jpg"

@router.post("", status_code=201)
def create_video(data: VideoIn, db: Session = Depends(get_db), claims: dict = Depends(get_current_user_claims)):
    """Upload a new video (requires authentication)"""
    try:
        user_id = int(claims["sub"])
        user = db.get(User, user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=403, detail="Inactive user")
        
        # Extract YouTube ID and validate URL
        youtube_id = extract_youtube_id(str(data.youtube_url))
        
        # Check if video already exists
        existing = db.scalar(select(Video).where(Video.youtube_id == youtube_id))
        if existing:
            raise HTTPException(status_code=400, detail="Video already exists")
        
        # Create video
        video = Video(
            title=data.title,
            description=data.description,
            youtube_url=str(data.youtube_url),
            youtube_id=youtube_id,
            thumbnail_url=get_youtube_thumbnail(youtube_id),
            uploaded_by_user_id=user_id,
        )
        
        db.add(video)
        db.commit()
        db.refresh(video)
        
        return {
            "id": video.id,
            "title": video.title,
            "youtube_id": video.youtube_id,
            "thumbnail_url": video.thumbnail_url
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("")
def list_videos(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    claims: Optional[dict] = Depends(get_optional_user_claims)
):
    """List videos with ranking by likes (public endpoint)"""
    user_id = int(claims["sub"]) if claims else None
    
    # Get videos ordered by likes (descending)
    videos_query = (
        select(
            Video.id, Video.title, Video.description, Video.youtube_url,
            Video.youtube_id, Video.thumbnail_url, Video.uploaded_by_user_id,
            Video.created_at, Video.like_count, User.name.label("uploaded_by_name")
        )
        .join(User, Video.uploaded_by_user_id == User.id)
        .where(Video.is_active == True)
        .order_by(desc(Video.like_count), desc(Video.created_at))
        .limit(limit)
        .offset(offset)
    )
    
    videos = db.execute(videos_query).all()
    
    # Get user's likes if authenticated
    user_likes = set()
    if user_id:
        like_query = select(VideoLike.video_id).where(VideoLike.user_id == user_id)
        user_likes = {row[0] for row in db.execute(like_query).all()}
    
    return [
        {
            "id": v.id,
            "title": v.title,
            "description": v.description,
            "youtube_url": v.youtube_url,
            "youtube_id": v.youtube_id,
            "thumbnail_url": v.thumbnail_url,
            "uploaded_by_user_id": v.uploaded_by_user_id,
            "uploaded_by_name": v.uploaded_by_name,
            "created_at": v.created_at.isoformat(),
            "like_count": v.like_count,
            "is_liked": v.id in user_likes
        }
        for v in videos
    ]

@router.get("/top")
def get_top_videos(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    claims: Optional[dict] = Depends(get_optional_user_claims)
):
    """Get top videos for podium display (public endpoint)"""
    user_id = int(claims["sub"]) if claims else None
    
    # Get top videos
    videos_query = (
        select(
            Video.id, Video.title, Video.description, Video.youtube_url,
            Video.youtube_id, Video.thumbnail_url, Video.uploaded_by_user_id,
            Video.created_at, Video.like_count, User.name.label("uploaded_by_name")
        )
        .join(User, Video.uploaded_by_user_id == User.id)
        .where(Video.is_active == True)
        .order_by(desc(Video.like_count), desc(Video.created_at))
        .limit(limit)
    )
    
    videos = db.execute(videos_query).all()
    
    # Get user's likes if authenticated
    user_likes = set()
    if user_id:
        like_query = select(VideoLike.video_id).where(VideoLike.user_id == user_id)
        user_likes = {row[0] for row in db.execute(like_query).all()}
    
    return [
        {
            "id": v.id,
            "title": v.title,
            "description": v.description,
            "youtube_url": v.youtube_url,
            "youtube_id": v.youtube_id,
            "thumbnail_url": v.thumbnail_url,
            "uploaded_by_user_id": v.uploaded_by_user_id,
            "uploaded_by_name": v.uploaded_by_name,
            "created_at": v.created_at.isoformat(),
            "like_count": v.like_count,
            "is_liked": v.id in user_likes
        }
        for v in videos
    ]

@router.post("/{video_id}/like")
def like_video(video_id: int, db: Session = Depends(get_db), claims: dict = Depends(get_current_user_claims)):
    """Like a video (requires authentication)"""
    user_id = int(claims["sub"])
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")
    
    video = db.get(Video, video_id)
    if not video or not video.is_active:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Check if already liked
    existing_like = db.scalar(
        select(VideoLike).where(
            and_(VideoLike.video_id == video_id, VideoLike.user_id == user_id)
        )
    )
    
    if existing_like:
        raise HTTPException(status_code=400, detail="Video already liked")
    
    # Create like
    like = VideoLike(video_id=video_id, user_id=user_id)
    db.add(like)
    
    # Update like count
    video.like_count += 1
    
    db.commit()
    
    return {"ok": True, "like_count": video.like_count}

@router.delete("/{video_id}/like")
def unlike_video(video_id: int, db: Session = Depends(get_db), claims: dict = Depends(get_current_user_claims)):
    """Unlike a video (requires authentication)"""
    user_id = int(claims["sub"])
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")
    
    video = db.get(Video, video_id)
    if not video or not video.is_active:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Find and delete like
    like = db.scalar(
        select(VideoLike).where(
            and_(VideoLike.video_id == video_id, VideoLike.user_id == user_id)
        )
    )
    
    if not like:
        raise HTTPException(status_code=400, detail="Video not liked")
    
    db.delete(like)
    
    # Update like count
    video.like_count = max(0, video.like_count - 1)
    
    db.commit()
    
    return {"ok": True, "like_count": video.like_count}

@router.delete("/{video_id}", dependencies=[Depends(require_role("ADMIN", "OWNER"))])
def delete_video(video_id: int, db: Session = Depends(get_db)):
    """Delete a video (admin only)"""
    video = db.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Soft delete by setting is_active to False
    video.is_active = False
    db.commit()
    
    return {"ok": True}
