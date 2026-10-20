from sqlalchemy import true
from sqlalchemy import Column, BigInteger, String, Text, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class LogAuditBerkas(Base):
    __tablename__ = "log_audit_berkas"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    id_berkas = Column(UUID(as_uuid=True), ForeignKey("berkas.id", ondelete="CASCADE"), nullable=False, index=True)
    id_pengguna = Column(UUID(as_uuid=True), nullable=False, index=True)
    nama_pengguna = Column(String(150), nullable=False)
    aksi = Column(String(50), nullable=False) # DILIHAT, DOWNLOAD, VERIFIKASI HASH, UBAH RETENSI
    alamat_ip = Column(String(45), nullable=False)
    agent_pengguna = Column(Text, nullable=True)
    details = Column(JSONB, nullable=True, default=dict)
    waktu_pembuatan = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relasi ke dokumen induk
    berkas = relationship("Berkas", back_populates="log_audit")
