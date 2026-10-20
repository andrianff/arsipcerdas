from minio import Minio
from minio.error import S3Error
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Inisialisasi MinIO Client
minio_client = Minio(
    endpoint=settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ROOT_USER,
    secret_key=settings.MINIO_ROOT_PASSWORD,
    secure=settings.MINIO_SECURE
)

def ensure_bucket_exists():
    """
    Memeriksa keberadaan bucket dokumen di MinIO.
    Jika belum ada maka akan otomatis dibuat.
    """
    try:
        bucket_name = settings.MINIO_BUCKET_DOCUMENTS
        if not minio_client.bucket_exists(bucket_name):
            minio_client.make_bucket(bucket_name)
            logger.info(f"Bucket '{bucket_name}' berhasil dibuat di MinIO.")
        else:
            logger.info(f"Bucket '{bucket_name}' sudah tersedia.")
    except S3Error as e:
        logger.error(f"Gagal memeriksa/membuat bucket MinIO: {e}")
        raise e