from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class JadwalRetensiBase(BaseModel):
    kode_klasifikasi: str = Field(..., max_length=50, examples=["KP.01.02"])
    nama_klasifikasi: str = Field(..., max_length=255, examples=["Surat Keputusan Promosi"])
    tahun_aktif: int = Field(default=2, ge=0, description="Masa simpan aktif (tahun)")
    tahun_inaktif: int = Field(default=5, ge=0, description="Masa simpan inaktif (tahun)")
    aksi_putusan: str = Field(..., examples=["musnah"], description="Pilihan: musnah, statis, review")
    deskripsi: Optional[str] = None

class JadwalRetensiCreate(JadwalRetensiBase):
    pass

class JadwalRetensiUpdate(BaseModel):
    nama_klasifikasi: Optional[str] = None
    tahun_aktif: Optional[int] = Field(None, ge=0)
    tahun_inaktif: Optional[int] = Field(None, ge=0)
    aksi_putusan: Optional[str] = None
    deskripsi: Optional[str] = None

class JadwalRetensiResponse(JadwalRetensiBase):
    id: UUID
    waktu_pembuatan: datetime

    model_config = ConfigDict(from_attributes=True)