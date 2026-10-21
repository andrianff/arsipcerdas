from typing import Optional, Dict, Any
from uuid import UUID
from fastapi import Request
from sqlalchemy.orm import Session
from app.models.log_audit import LogAuditBerkas


class AuditService:
    @staticmethod
    def log_activity(
        db: Session,
        id_berkas: UUID,
        aksi: str,
        id_pengguna: UUID,
        nama_pengguna: str,
        request: Optional[Request] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> LogAuditBerkas:
        """
        Mencatat jejak audit resmi sesuai ISO 15489.
        Merekam: siapa, dokumen apa, aksi apa, dari IP mana, dan kapan.
        """
        # Ekstraksi IP Address asli (mendukung Reverse Proxy / Nginx)
        alamat_ip = "127.0.0.1"
        agent_pengguna = "System/Worker"

        if request:
            forwarded = request.headers.get("X-Forwarded-For")
            if forwarded:
                alamat_ip = forwarded.split(",")[0].strip()
            elif request.client:
                alamat_ip = request.client.host

            agent_pengguna = request.headers.get("User-Agent", "Unknown")

        log_entry = LogAuditBerkas(
            id_berkas=id_berkas,
            id_pengguna=id_pengguna,
            nama_pengguna=nama_pengguna,
            aksi=aksi,
            alamat_ip=alamat_ip,
            agent_pengguna=agent_pengguna,
            details=details or {}
        )

        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
