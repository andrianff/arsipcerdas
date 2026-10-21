from typing import Generator
from uuid import UUID, uuid4
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """Dependency untuk menyediakan sesi database SQLAlchemy per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class CurrentUser:
    """Mock identity pengguna untuk kepatuhan Audit Trail ISO 15489."""
    def __init__(self, id_pengguna: UUID, nama_pengguna: str, peran: str):
        self.id = id_pengguna
        self.nama = nama_pengguna
        self.peran = peran


def get_current_user() -> CurrentUser:
    # Di masa depan dapat digantikan dengan JWT token auth
    return CurrentUser(
        id_pengguna=UUID("00000000-0000-0000-0000-000000000001"),
        nama_pengguna="Arsiparis Administrator",
        peran="admin"
    )