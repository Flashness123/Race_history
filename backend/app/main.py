from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.races import router as races_router
from app.api.auth import router as auth_router
from app.api.submissions import router as subs_router
from app.api.admin_users import router as admin_users_router
from app.api.admin_races import router as admin_races_router
from app.api.bio import router as bio_router
import app.models.models

app = FastAPI(title="Downhill Longboarding API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health(): return {"status": "ok"}

app.include_router(auth_router)
app.include_router(subs_router)
app.include_router(races_router)
app.include_router(admin_users_router)
app.include_router(admin_races_router)
app.include_router(bio_router)