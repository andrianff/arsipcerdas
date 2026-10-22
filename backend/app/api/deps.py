from typing import Generator, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.models.pengguna import Pengguna

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def get_db() -> Generator[Session, None, None]:
    """Dependency untuk menyediakan sesi database SQLAlchemy per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> Pengguna:
    """Memvalidasi access token JWT dan mengambil data Pengguna dari database."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kredensial autentikasi tidak valid atau sudah kedaluwarsa.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(Pengguna).filter(Pengguna.id == user_id).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Akun pengguna ini telah dinonaktifkan."
        )

    return user


def require_roles(allowed_roles: List[str]):
    """Role-Based Access Control (RBAC) Dependency."""
    def role_checker(current_user: Pengguna = Depends(get_current_user)) -> Pengguna:
        if current_user.peran not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Akses ditolak. Peran '{current_user.peran}' tidak memiliki izin untuk operasi ini."
            )
        return current_user
    return role_checker

# Alias untuk backward-compatibility dengan endpoint yang lama
CurrentUser = Pengguna