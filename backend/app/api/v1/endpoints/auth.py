from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.pengguna import Pengguna
from app.schemas.pengguna import (
    PenggunaCreate,
    PenggunaResponse,
    TokenResponse,
)

router = APIRouter()


@router.post("/register", response_model=PenggunaResponse, status_code=status.HTTP_201_CREATED)
def register_pengguna(payload: PenggunaCreate, db: Session = Depends(get_db)):
    """
    Mendaftarkan pengguna baru ke dalam sistem EDRMS.
    """
    user_exist = db.query(Pengguna).filter(Pengguna.email == payload.email.lower().strip()).first()
    if user_exist:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar. Silakan gunakan email lain."
        )
    
    hashed_pwd = get_password_hash(payload.password)

    pengguna_baru = Pengguna(
        email=payload.email.lower().strip(),
        nama_lengkap=payload.nama_lengkap.strip(),
        hashed_password=hashed_pwd,
        peran=payload.peran.lower().strip(),
        unit_kerja=payload.unit_kerja.strip(),
    )

    db.add(pengguna_baru)
    db.commit()
    db.refresh(pengguna_baru)
    
    return pengguna_baru


@router.post("/login", response_model=TokenResponse)
async def login_pengguna(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Autentikasi login pengguna:
    - Mendukung Form Data (otomatis untuk tombol Authorize Swagger UI)
    - Mendukung JSON payload (untuk Frontend / API Client)
    """
    content_type = request.headers.get("content-type", "")
    
    # Deteksi apakah dikirim lewat Form Data (Swagger UI) atau JSON (Frontend)
    if "application/json" in content_type:
        data = await request.json()
        email_or_user = data.get("email") or data.get("username", "")
        raw_password = data.get("password", "")
    else:
        form = await request.form()
        email_or_user = form.get("username") or form.get("email", "")
        raw_password = form.get("password", "")

    if not email_or_user or not raw_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email/username dan password wajib diisi."
        )

    user = db.query(Pengguna).filter(Pengguna.email == str(email_or_user).lower().strip()).first()
    if not user or not verify_password(raw_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun pengguna ini telah dinonaktifkan."
        )
    
    # Buat JWT Token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=str(user.id),
        expires_delta=access_token_expires
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        pengguna=user
    )


@router.get("/me", response_model=PenggunaResponse)
def get_current_user_profile(current_user: Pengguna = Depends(get_current_user)):
    """
    Mendapatkan profil informasi pengguna yang sedang login saat ini.
    """
    return current_user