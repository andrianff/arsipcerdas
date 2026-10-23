from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, require_roles
from app.models.jadwal_retensi import JadwalRetensi
from app.models.pengguna import Pengguna
from app.schemas.jadwal_retensi import (
    JadwalRetensiCreate,
    JadwalRetensiUpdate,
    JadwalRetensiResponse
)

router = APIRouter()


@router.get("/", response_model=List[JadwalRetensiResponse])
def get_all_jadwal_retensi(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Mendapatkan daftar seluruh klasifikasi Jadwal Retensi Arsip (JRA).
    Terbuka untuk seluruh pengguna terautentikasi.
    """
    return db.query(JadwalRetensi).offset(skip).limit(limit).all()


@router.post("/", response_model=JadwalRetensiResponse, status_code=status.HTTP_201_CREATED)
def create_jadwal_retensi(
    data: JadwalRetensiCreate,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(require_roles(["admin", "arsiparis"]))
):
    """
    Menambahkan aturan Jadwal Retensi Arsip baru.
    Khusus peran Admin dan Arsiparis.
    """
    existing = db.query(JadwalRetensi).filter(
        JadwalRetensi.kode_klasifikasi == data.kode_klasifikasi
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Kode klasifikasi '{data.kode_klasifikasi}' sudah terdaftar."
        )

    jra = JadwalRetensi(**data.model_dump())
    db.add(jra)
    db.commit()
    db.refresh(jra)
    return jra


@router.get("/{id}", response_model=JadwalRetensiResponse)
def get_jadwal_retensi(
    id: UUID, 
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
    ):
    """Mengambil detail satu klasifikasi JRA."""
    jra = db.query(JadwalRetensi).filter(JadwalRetensi.id == id).first()
    if not jra:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="JRA tidak ditemukan.")
    return jra


@router.put("/{id}", response_model=JadwalRetensiResponse)
def update_jadwal_retensi(
    id: UUID,
    data: JadwalRetensiUpdate,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(require_roles(["admin", "arsiparis"]))
):
    """
    Memperbarui aturan klasifikasi JRA.
    Khusus peran Admin dan Arsiparis.
    """
    jra = db.query(JadwalRetensi).filter(JadwalRetensi.id == id).first()
    if not jra:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="JRA tidak ditemukan.")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(jra, field, val)

    db.commit()
    db.refresh(jra)
    return jra