from sqlalchemy import null
import uuid
from sqlalchemy import Column, Integer, Text, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.core.database import Base

class PotonganBerkas(Base):
    __tablename__ = "potongan_berkas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_berkas = Column(UUID(as_uuid=True), ForeignKey("berkas.id", ondelete="CASCADE"), nullable=False, index=True)
    indeks_potongan = Column(Integer, nullable=False)
    nomor_halaman = Column(Integer, nullable=False)
    isi = Column(Text, nullable=False)
    jumlah_token = Column(Integer, nullable=False)
    embedding = Column(Vector(1536), nullable=True) # Vektor embedding
    waktu_pembuatan = Column(DateTime(timezone=True), server_default=func.now())

    # Relasi ke dokumen induk
    berkas = relationship("Berkas", back_populates="potongan_teks")