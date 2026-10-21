from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.minio_client import ensure_bucket_exists
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API Sistem Kearsipan Digital Berbasis AI (ISO 15489 Compliant)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware (mengizinkan koneksi dari Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # Pastikan bucket MinIO sudah siap saat aplikasi pertama kali menyala
    ensure_bucket_exists()


@app.get("/health", tags=["Health Check"])
def health_check():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }


# Pasang seluruh router API v1
app.include_router(api_router, prefix=settings.API_V1_STR)
