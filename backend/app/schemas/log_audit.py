from typing import Any, Dict, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class LogAuditResponse(BaseModel):
    id: int
    id_berkas: UUID
    id_pengguna: UUID
    nama_pengguna: str
    aksi: str
    alamat_ip: str
    agent_pengguna: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    waktu_pembuatan: datetime

    model_config = ConfigDict(from_attributes=True)
