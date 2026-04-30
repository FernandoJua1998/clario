"""
Verificación de JWT de Supabase y resolución del usuario en la BD local.

Supabase firma los access tokens con ES256 (nuevas keys sb_publishable_/sb_secret_)
o con HS256 (keys legacy). Los validamos descargando el JWKS desde el endpoint
público estándar: /auth/v1/.well-known/jwks.json
"""
import uuid
from functools import lru_cache

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User

_bearer = HTTPBearer()

# Algoritmos aceptados:
# - ES256: nuevas Supabase keys (sb_publishable_ / sb_secret_)
# - RS256: keys intermedias con par RSA
# - HS256: keys legacy (eyJ... JWT-format)
_ALGORITHMS = ["ES256", "RS256", "HS256"]


@lru_cache(maxsize=1)
def _get_jwks() -> dict:
    """
    Descarga las claves públicas de Supabase desde el endpoint JWKS estándar.

    Endpoint público (no requiere autenticación):
    /auth/v1/.well-known/jwks.json
    """
    url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
    response = httpx.get(url, timeout=10)
    response.raise_for_status()
    return response.json()


def _decode_token(token: str) -> dict:
    """Decodifica y valida la firma del JWT de Supabase."""
    jwks = _get_jwks()
    try:
        payload = jwt.decode(
            token,
            jwks,
            algorithms=_ALGORITHMS,
            audience="authenticated",
            options={"verify_aud": True},
        )
        return payload
    except JWTError as exc:
        # Si el JWKS estaba cacheado y falló (ej. rotación de claves),
        # limpiar caché para forzar descarga fresca en el siguiente intento.
        _get_jwks.cache_clear()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def _upsert_user(payload: dict, db: Session) -> User:
    """
    Sincroniza el usuario de Supabase con la BD local.
    Crea el registro si es la primera vez que se autentica.
    """
    supabase_id = uuid.UUID(payload["sub"])
    user_meta = payload.get("user_metadata", {})
    email = payload.get("email", "")
    name = user_meta.get("name") or user_meta.get("full_name") or email.split("@")[0]

    user = db.get(User, supabase_id)
    if user is None:
        user = User(id=supabase_id, email=email, name=name)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


# ---------------------------------------------------------------------------
# Dependency pública para usar en routers
# ---------------------------------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    """Dependency de FastAPI: extrae, valida el JWT y retorna el User de la BD."""
    payload = _decode_token(credentials.credentials)
    return _upsert_user(payload, db)
