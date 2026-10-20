import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class JadwalRetensi(Base):
    __tablename__ = "jadwal_retensi"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kode_klasifikasi = Column(String(50), unique=True, nullable=False, index=True)
    nama_klasifikasi = Column(String(255), nullable=False)
    tahun_aktif = Column(Integer, nullable=False, default=2)
    tahun_inaktif = Column(Integer, nullable=False, default=5)
    aksi_putusan = Column(String(50), nullable=False) # musnah, statis, review
    deskripsi = Column(Text, nullable=True)
    waktu_pembuatan = Column(DateTime(timezone=True), server_default=func.now())

    # Relasi balik ke berkas
    daftar_berkas = relationship("Berkas", back_populates="jadwal_retensi")