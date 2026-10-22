from fastapi import APIRouter
from app.api.v1.endpoints import auth, jadwal_retensi, berkas, pencarian

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Autentikasi & Akun"])
api_router.include_router(jadwal_retensi.router, prefix="/jadwal-retensi", tags=["Jadwal Retensi Arsip"])
api_router.include_router(berkas.router, prefix="/berkas", tags=["Pengelolaan Berkas"])
api_router.include_router(pencarian.router, prefix="/pencarian", tags=["Pencarian Dokumen"])