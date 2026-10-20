from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Engine koneksi PostgreSQL dengan pool pre-ping (mencegah broken connection)
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI Dependency untuk menyediakan database session per request.
    Session otomatis ditutup setelah response dikembalikan ke client.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()