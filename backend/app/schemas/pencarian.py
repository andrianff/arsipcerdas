from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class PencarianRequest(BaseModel):
    query: str = Field(..., min_length=2, examples=["kebijakan mutasi staf"])
    limit: int = Field(default=10, ge=1, le=50)
    level_keamanan_maks: Optional[str] = None
    filter_unit: Optional[str] = None


class HasilPencarianItem(BaseModel):
    id_berkas: UUID
    nomor_berkas: str
    judul: str
    nomor_halaman: int
    potongan_teks: str
    skor_kemiripan: float
    level_keamanan: str
    unit_penghasil: str


class PencarianResponse(BaseModel):
    query: str
    total_hasil: int
    hasil: List[HasilPencarianItem]
