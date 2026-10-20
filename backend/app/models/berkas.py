from time import time
from sqlalchemy import null
import uuid
from sqlalchemy import Column, String, Integer, BigInteger, Text, Date, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Berkas(Base):
    __tablename__ = "berkas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nomor_berkas = Column(String(100), unique=True, nullable=False, index=True)
    judul = Column(String(255), nullable=False, index=True)
    ringkasan = Column(Text, nullable=True)

    id_jadwal_retensi = Column(UUID(as_uuid=True), ForeignKey("jadwal_retensi.id"), nullable=True)
    level_keamanan = Column(String(30), nullable=False, default="biasa", index=True)
    tanggal_dokumen = Column(Date, nullable=False)

    # File Storage & Verifikasi Integritas
    storage_path = Column(String(500), nullable=False)
    sha256_hash = Column(String(64), nullable=False)
    mime_type = Column(String(100), nullable=False)
    ukuran_file_bytes = Column(BigInteger, nullable=False)
    jumlah_halaman = Column(Integer, default=1)

    # Lifecycle & Retensi
    status_siklus_hidup = Column(String(50), default="aktif", index=True)
    tanggal_mulai_aktif = Column(DateTime(timezone=True), nullable=False)
    tanggal_akhir_retensi = Column(DateTime(timezone=True), nullable=False)

    # Metadata Kepemilikan & Audit
    unit_penghasil = Column(String(100), nullable=False)
    user_id_pembuat = Column(UUID(as_uuid=True), nullable=False)
    waktu_pembuatan = Column(DateTime(timezone=True), server_default=func.now())
    waktu_pembaruan = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relasi
    jadwal_retensi = relationship("JadwalRetensi", back_populates="daftar_berkas")
    potongan_teks = relationship("PotonganBerkas", back_populates="berkas", cascade="all, delete-orphan")
    log_audit = relationship("LogAuditBerkas", back_populates="berkas", cascade="all, delete-orphan")