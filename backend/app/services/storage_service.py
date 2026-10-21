import io
import hashlib
from datetime import datetime
from uuid import uuid4
from typing import Tuple, BinaryIO
from app.core.config import settings
from app.core.minio_client import minio_client, ensure_bucket_exists

class StorageService:
    @staticmethod
    def calculate_sha256(data: bytes) -> str:
        """
        Menghitung hash SHA-256 dari byte data untuk menjamin integritas arsip.
        """
        sha256 = hashlib.sha256()
        sha256.update(data)
        return sha256.hexdigest()
    
    @classmethod
    def upload_file(cls, file_bytes: bytes, original_filename: str, content_type: str = "application/pdf") -> Tuple[str, str, int]:
        """
        Upload file dokumen ke MinIO dengan nama dan path unik terstruktur.
        Mengembalikan: (storage_path, sha256_hash, file_size)
        """
        ensure_bucket_exists()

        file_size = len(file_bytes)
        sha256_hash = cls.calculate_sha256(file_bytes)
        
        # Path penyimpanan: documents/2026/10/<uuid>_<filename>
        now = datetime.now()
        safe_filename = original_filename.replace(" ", "_")
        unique_name = f"{uuid4().hex[:8]}_{safe_filename}"
        storage_path = f"documents/{now.strftime('%Y/%m')}/{unique_name}"

        # Upload ke MinIO stream
        data_stream = io.BytesIO(file_bytes)
        minio_client.put_object(
            bucket_name=settings.MINIO_BUCKET_DOCUMENTS,
            object_name=storage_path,
            data=data_stream,
            length=file_size,
            content_type=content_type,
            metadata={"sha256": sha256_hash}
        )

        return storage_path, sha256_hash, file_size

    @staticmethod
    def get_file_bytes(storage_path: str) -> bytes:
        """
        Mengambil data file dari MinIO sebagai raw bytes.
        """
        response = minio_client.get_object(
            bucket_name=settings.MINIO_BUCKET_DOCUMENTS,
            object_name=storage_path
        )
        try:
            return response.read()
        finally:
            response.close()
            response.release_conn()
    
    @staticmethod
    def get_presigned_download_url(storage_path: str, expires_seconds: int = 3600) -> str:
        """
        Menghasilkan URL download berdurasi terbatas (presigned URL) untuk keamanan.
        """
        from datetime import timedelta
        return minio_client.presigned_get_object(
            bucket_name=settings.MINIO_BUCKET_DOCUMENTS,
            object_name=storage_path,
            expires=timedelta(seconds=expires_seconds)
        )
    
    @classmethod
    def verify_file_integrity(cls, storage_path: str, expected_hash: str) -> Tuple[bool, str]:
        """
        Mengunduh file dari MinIO dan menghitung ulang hash SHA-256 untuk memastikan file belum pernah dirusak atau dimanipulasi sama sekali (ISO 15489).
        """
        file_bytes = cls.get_file_bytes(storage_path)
        current_hash = cls.calculate_sha256(file_bytes)
        is_valid = (current_hash.lower() == expected_hash.lower())
        return is_valid, current_hash
    
    @staticmethod
    def delete_file(storage_path: str) -> None:
        """
        Menghapus objek dari MinIO (dipakai pada tahap pemusnahan retensi).
        """
        minio_client.remove_object(
            bucket_name=settings.MINIO_BUCKET_DOCUMENTS,
            object_name=storage_path
        )