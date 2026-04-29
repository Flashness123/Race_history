from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.races import router as races_router
from app.api.auth import router as auth_router
from app.api.submissions import router as subs_router
from app.api.admin_users import router as admin_users_router
from app.api.admin_races import router as admin_races_router
from app.api.bio import router as bio_router
from app.api.events import router as events_router
from app.api.uploads import router as uploads_router
from app.api.videos import router as videos_router
from app.api.spot_runs import router as spot_runs_router
from app.api.attachments import router as attachments_router
import app.models.models

app = FastAPI(title="Downhill Longboarding API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health(): 
    # Health check endpoint for Railway
    return {"status": "ok"}

app.include_router(auth_router)
app.include_router(subs_router)
app.include_router(races_router)
app.include_router(admin_users_router)
app.include_router(admin_races_router)
app.include_router(bio_router)
app.include_router(events_router)
app.include_router(uploads_router)
app.include_router(videos_router)
app.include_router(spot_runs_router)
app.include_router(attachments_router)

# Serve static uploads
app.mount("/static", StaticFiles(directory="app/static"), name="static")