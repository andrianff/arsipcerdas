import uuid
from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class Pengguna(Base):
    __tablename__ = "pengguna"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    nama_lengkap = Column(String(150), nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # Peran: admin, arsiparis, operator, auditor
    peran = Column(String(50), nullable=False, default="operator")

    # Unit Kerja / Depattemen pemilik arsip
    unit_kerja = Column(String(100), nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)
    waktu_pembuatan = Column(DateTime(timezone=True), server_default=func.now())
    waktu_pembaruan = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    @property
    def nama(self) -> str:
        """
        Alias untuk kompatibilitas dengan AuditService yang memanggil current_user.nama
        """
        return self.nama_lengkap