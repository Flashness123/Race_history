from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.races import router as races_router

app = FastAPI(title="Downhill Longboarding API")

# CORS for localhost dev (frontend on :3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

app.include_router(races_router)
