from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "ArsipCerdas EDRMS"
    API_V1_STR: str = "/api/v1"

    # Database PostgreSQL
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "arsip_user"
    POSTGRES_PASSWORD: str = "password_kuat_anda"
    POSTGRES_DB: str = "arsipcerdas_db"
    POSTGRES_PORT: str = "5432"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # MinIO Object Storage
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ROOT_USER: str = "minioadmin"
    MINIO_ROOT_PASSWORD: str = "minioadmin"
    MINIO_BUCKET_DOCUMENTS: str = "arsipcerdas-docs"
    MINIO_SECURE: bool = False

    # Redis & Celery
    REDIS_HOST: str = "localhost"
    REDIS_PORT: str = "6379"

    @property
    def CELERY_BROKER_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"
    
    @property
    def CELERY_RESULT_BACKEND(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"
    
    # Keamanan & JWT
    SECRET_KEY: str = "arsipcerdas_super_secret_jwt_key_development_only_change_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 1 hari
    ALGORITHM: str = "HS256"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()