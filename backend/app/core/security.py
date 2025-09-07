from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from typing import Any, Dict

bearer_scheme = HTTPBearer(auto_error=False)

def create_access_token(sub: str, role: str, expires_minutes: int = 60) -> str:
    now = datetime.utcnow()
    payload: Dict[str, Any] = {"sub": sub, "role": role, "iat": now, "exp": now + timedelta(minutes=expires_minutes)}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user_claims(creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return decode_token(creds.credentials)

def require_role(*allowed: str):
    def _dep(claims: dict = Depends(get_current_user_claims)):
        if claims.get("role") not in allowed:
            raise HTTPException(status_code=403, detail="Forbidden")
        return claims
    return _dep
