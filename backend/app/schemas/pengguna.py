from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

# Base Schema Pengguna
class PenggunaBase(BaseModel):
    email: str
    nama_lengkap: str
    peran: str = "operator" # admin, arsiparis, operator, auditor
    unit_kerja: str

# Schema buat Create / Register Pengguna Baru
class PenggunaCreate(PenggunaBase):
    password: str

# Schema buat Update Data Pengguna
class PenggunaUpdate(BaseModel):
    nama_lengkap: Optional[str] = None
    password: Optional[str] = None
    peran: Optional[str] = None
    unit_kerja: Optional[str] = None
    is_active: Optional[bool] = None

# Schema Response Pengguna (Safe: hashed_password disembunyikan)
class PenggunaResponse(PenggunaBase):
    id: UUID
    is_active: bool
    waktu_pembuatan: datetime
    waktu_pembaruan: datetime

    model_config = ConfigDict(from_attributes=True)

# Schema Payload Login
class LoginRequest(BaseModel):
    email: str
    password: str

# Schema Response Token JWT
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    pengguna: PenggunaResponse