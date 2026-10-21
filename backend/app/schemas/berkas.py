from typing import Optional
from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.jadwal_retensi import JadwalRetensiResponse


class BerkasBase(BaseModel):
    judul: str = Field(..., max_length=255, examples=["SK Pengangkatan Pegawai 2026"])
    ringkasan: Optional[str] = None
    level_keamanan: str = Field(default="biasa", description="biasa, terbatas, rahasia, sangat_rahasia")
    tanggal_dokumen: date = Field(..., description="Tanggal terbit dokumen fisik/asli")
    unit_penghasil: str = Field(..., max_length=100, examples=["Biro Kepegawaian"])
    id_jadwal_retensi: Optional[UUID] = None


class BerkasCreate(BerkasBase):
    """Digunakan sebagai metadata saat upload berkas PDF"""
    pass


class BerkasUpdate(BaseModel):
    judul: Optional[str] = None
    ringkasan: Optional[str] = None
    level_keamanan: Optional[str] = None
    id_jadwal_retensi: Optional[UUID] = None
    status_siklus_hidup: Optional[str] = None


class BerkasResponse(BerkasBase):
    id: UUID
    nomor_berkas: str
    storage_path: str
    sha256_hash: str
    mime_type: str
    ukuran_file_bytes: int
    jumlah_halaman: int
    status_siklus_hidup: str
    tanggal_mulai_aktif: datetime
    tanggal_akhir_retensi: datetime
    user_id_pembuat: UUID
    waktu_pembuatan: datetime
    waktu_pembaruan: datetime
    jadwal_retensi: Optional[JadwalRetensiResponse] = None

    model_config = ConfigDict(from_attributes=True)


class BerkasVerifyHashResponse(BaseModel):
    id_berkas: UUID
    nomor_berkas: str
    valid: bool
    expected_hash: str
    calculated_current_hash: str
    pesan: str
