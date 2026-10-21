from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, CurrentUser
from app.models.berkas import Berkas
from app.models.jadwal_retensi import JadwalRetensi
from app.models.potongan_berkas import PotonganBerkas
from app.schemas.berkas import (
    BerkasResponse,
    BerkasVerifyHashResponse
)
from app.schemas.log_audit import LogAuditResponse
from app.services.storage_service import StorageService
from app.services.pdf_processor import PDFProcessor
from app.services.audit_service import AuditService
from app.services.embedding_service import EmbeddingService

router = APIRouter()


@router.post("/upload", response_model=BerkasResponse, status_code=status.HTTP_201_CREATED)
async def upload_berkas(
    request: Request,
    file: UploadFile = File(...),
    judul: str = Form(...),
    tanggal_dokumen: date = Form(...),
    unit_penghasil: str = Form(...),
    level_keamanan: str = Form("biasa"),
    id_jadwal_retensi: Optional[UUID] = Form(None),
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Mengunggah berkas PDF baru:
    1. Validasi format file PDF.
    2. Upload ke Object Storage MinIO & hitung SHA-256.
    3. Ekstraksi teks & pemecahan chunks dengan PyMuPDF.
    4. Hitung masa retensi otomatis berdasarkan JRA.
    5. Generate Vektor Embedding 768 dimensi dengan Google Gemini.
    6. Rekam jejak audit (ISO 15489).
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hanya berkas berformat PDF yang diperbolehkan."
        )

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Berkas kosong.")

    # 1. Ekstraksi PDF & kalkulasi jumlah halaman
    total_halaman = PDFProcessor.count_pages(file_bytes)
    pages_content = PDFProcessor.extract_text_per_page(file_bytes)
    chunks_data = PDFProcessor.chunk_text(pages_content)

    # 2. Upload ke MinIO & SHA-256 Hash
    storage_path, sha256_hash, file_size = StorageService.upload_file(
        file_bytes=file_bytes,
        original_filename=file.filename,
        content_type=file.content_type or "application/pdf"
    )

    # 3. Hitung Masa Retensi Berdasarkan JRA
    now_dt = datetime.now()
    tgl_mulai_aktif = datetime.combine(tanggal_dokumen, datetime.min.time())
    
    # Default 5 tahun jika belum ditentukan JRA
    tgl_akhir_retensi = tgl_mulai_aktif + relativedelta(years=5)
    
    if id_jadwal_retensi:
        jra = db.query(JadwalRetensi).filter(JadwalRetensi.id == id_jadwal_retensi).first()
        if jra:
            total_tahun = jra.tahun_aktif + jra.tahun_inaktif
            tgl_akhir_retensi = tgl_mulai_aktif + relativedelta(years=total_tahun)

    # Generate Nomor Berkas Unik
    nomor_berkas = f"ARSIP/{now_dt.strftime('%Y%m')}/{sha256_hash[:8].upper()}"

    # 4. Simpan Record Berkas ke Database
    berkas = Berkas(
        nomor_berkas=nomor_berkas,
        judul=judul,
        id_jadwal_retensi=id_jadwal_retensi,
        level_keamanan=level_keamanan,
        tanggal_dokumen=tanggal_dokumen,
        storage_path=storage_path,
        sha256_hash=sha256_hash,
        mime_type="application/pdf",
        ukuran_file_bytes=file_size,
        jumlah_halaman=total_halaman,
        status_siklus_hidup="aktif",
        tanggal_mulai_aktif=tgl_mulai_aktif,
        tanggal_akhir_retensi=tgl_akhir_retensi,
        unit_penghasil=unit_penghasil,
        user_id_pembuat=current_user.id
    )
    db.add(berkas)
    db.flush()  # Dapatkan berkas.id

    # 5. Generate Vector Embedding & Simpan Potongan Teks (Chunks)
    daftar_teks = [c["isi"] for c in chunks_data]
    daftar_embedding = []
    if daftar_teks:
        try:
            daftar_embedding = EmbeddingService.generate_embeddings_batch(daftar_teks)
        except Exception as e:
            # Catat warning jika Gemini API mengalami kendala jaringan (dokumen tetap tersimpan)
            print(f"Warning: Gagal membuat embedding dokumen: {e}")

    for i, chunk in enumerate(chunks_data):
        vektor = daftar_embedding[i] if i < len(daftar_embedding) else None
        p_chunk = PotonganBerkas(
            id_berkas=berkas.id,
            indeks_potongan=chunk["indeks_potongan"],
            nomor_halaman=chunk["nomor_halaman"],
            isi=chunk["isi"],
            jumlah_token=chunk["jumlah_token"],
            embedding=vektor
        )
        db.add(p_chunk)

    db.commit()
    db.refresh(berkas)

    # 6. Catat Jejak Audit ISO 15489
    AuditService.log_activity(
        db=db,
        id_berkas=berkas.id,
        aksi="UPLOAD",
        id_pengguna=current_user.id,
        nama_pengguna=current_user.nama,
        request=request,
        details={
            "nama_file": file.filename,
            "ukuran_bytes": file_size,
            "total_halaman": total_halaman,
            "total_chunks": len(chunks_data)
        }
    )

    return berkas


@router.get("/", response_model=List[BerkasResponse])
def get_daftar_berkas(
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    level_keamanan: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Mendapatkan daftar berkas dengan filter status retensi dan level keamanan."""
    query = db.query(Berkas)
    if status:
        query = query.filter(Berkas.status_siklus_hidup == status)
    if level_keamanan:
        query = query.filter(Berkas.level_keamanan == level_keamanan)
    return query.order_by(Berkas.waktu_pembuatan.desc()).offset(skip).limit(limit).all()


@router.get("/{id}", response_model=BerkasResponse)
def get_detail_berkas(
    id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Mengambil detail berkas dan mencatat log audit DILIHAT."""
    berkas = db.query(Berkas).filter(Berkas.id == id).first()
    if not berkas:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Berkas tidak ditemukan.")

    AuditService.log_activity(
        db=db,
        id_berkas=berkas.id,
        aksi="DILIHAT",
        id_pengguna=current_user.id,
        nama_pengguna=current_user.nama,
        request=request
    )
    return berkas


@router.get("/{id}/download")
def download_berkas(
    id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """Mengunduh file PDF asli dan mencatat log audit DOWNLOAD."""
    berkas = db.query(Berkas).filter(Berkas.id == id).first()
    if not berkas:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Berkas tidak ditemukan.")

    file_bytes = StorageService.get_file_bytes(berkas.storage_path)

    AuditService.log_activity(
        db=db,
        id_berkas=berkas.id,
        aksi="DOWNLOAD",
        id_pengguna=current_user.id,
        nama_pengguna=current_user.nama,
        request=request
    )

    import io
    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{berkas.nomor_berkas}.pdf"'}
    )


@router.post("/{id}/verify-integrity", response_model=BerkasVerifyHashResponse)
def verify_berkas_integrity(
    id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Memverifikasi integritas dokumen secara kriptografis (ISO 15489).
    Mengunduh file dari MinIO dan menghitung ulang hash SHA-256 untuk mendeteksi pemalsuan/korupsi data.
    """
    berkas = db.query(Berkas).filter(Berkas.id == id).first()
    if not berkas:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Berkas tidak ditemukan.")

    is_valid, current_hash = StorageService.verify_file_integrity(
        storage_path=berkas.storage_path,
        expected_hash=berkas.sha256_hash
    )

    pesan = "Integritas berkas terverifikasi asli (SHA-256 identik)." if is_valid else "PERINGATAN: Berkas telah dimodifikasi atau rusak!"

    AuditService.log_activity(
        db=db,
        id_berkas=berkas.id,
        aksi="VERIFIKASI_HASH",
        id_pengguna=current_user.id,
        nama_pengguna=current_user.nama,
        request=request,
        details={"valid": is_valid, "expected_hash": berkas.sha256_hash, "calculated_hash": current_hash}
    )

    return BerkasVerifyHashResponse(
        id_berkas=berkas.id,
        nomor_berkas=berkas.nomor_berkas,
        valid=is_valid,
        expected_hash=berkas.sha256_hash,
        calculated_current_hash=current_hash,
        pesan=pesan
    )


@router.get("/{id}/audit-logs", response_model=List[LogAuditResponse])
def get_audit_trail(id: UUID, db: Session = Depends(get_db)):
    """Mengambil riwayat jejak audit kepatuhan untuk dokumen tertentu."""
    berkas = db.query(Berkas).filter(Berkas.id == id).first()
    if not berkas:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Berkas tidak ditemukan.")
    return berkas.log_audit