from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.races import router as races_router
from app.api.auth import router as auth_router
from app.api.submissions import router as subs_router

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
