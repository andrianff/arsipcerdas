from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, get_current_user, CurrentUser
from app.models.berkas import Berkas
from app.models.potongan_berkas import PotonganBerkas
from app.schemas.pencarian import PencarianRequest, PencarianResponse, HasilPencarianItem
from app.services.embedding_service import EmbeddingService

router = APIRouter()

# Hierarki Keamanan: 1 (Terbawah) s/d 4 (Tertinggi)
SECURITY_RANKS = {
    "biasa": 1,
    "terbatas": 2,
    "rahasia": 3,
    "sangat_rahasia": 4
}

# Batas Maksimal Akses Dokumen Berdasarkan Peran Pengguna
ROLE_MAX_SECURITY = {
    "admin": 4,          # Akses hingga sangat_rahasia
    "pimpinan": 4,       # Akses hingga sangat_rahasia
    "arsiparis": 3,      # Akses hingga rahasia
    "auditor": 2,        # Akses hingga terbatas
    "operator": 2,       # Akses hingga terbatas
}

@router.post("/", response_model=PencarianResponse)
def cari_dokumen(
    payload: PencarianRequest,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Pencarian Cerdas Terproteksi (Hybrid Search RBAC):
    1. Otentikasi Pengguna & Penegakan Level Keamanan (ISO 27001).
    2. Eksklusi Berkas yang telah berstatus 'musnah'.
    3. Pencarian Vektor Embedding Semantik (Gemini + pgvector Cosine Similarity).
    4. Pencocokan Kata Kunci (Keyword Matching).
    5. Penggabungan Skor (Hybrid Score: 70% Semantik, 30% Kata Kunci).
    """
    query_teks = payload.query.strip()
    query_vector = None

    # 1. Tentukan batas level keamanan yang diizinkan untuk pengguna ini
    user_max_rank = ROLE_MAX_SECURITY.get(current_user.peran, 2)
    
    # Jika pengguna meminta filter khusus, ambil batas terendah antara permintaan dan hak aksesnya
    if payload.level_keamanan_maks:
        requested_rank = SECURITY_RANKS.get(payload.level_keamanan_maks.lower(), 4)
        effective_rank = min(user_max_rank, requested_rank)
    else:
        effective_rank = user_max_rank

    allowed_levels = [lvl for lvl, rank in SECURITY_RANKS.items() if rank <= effective_rank]

    # 2. Coba buat embedding untuk query pengguna
    try:
        query_vector = EmbeddingService.generate_embedding(query_teks)
    except Exception as e:
        print(f"Peringatan: Gagal generate query embedding, beralih ke pencarian teks biasa. Error: {e}")

    # 3. Base Query dengan Filter Keamanan & Status Siklus Hidup
    base_query = (
        db.query(PotonganBerkas, Berkas)
        .join(Berkas, PotonganBerkas.id_berkas == Berkas.id)
        .filter(
            Berkas.status_siklus_hidup != "musnah",
            Berkas.level_keamanan.in_(allowed_levels)
        )
    )

    # Filter opsional berdasarkan Unit Kerja
    if payload.filter_unit:
        base_query = base_query.filter(Berkas.unit_penghasil.ilike(f"%{payload.filter_unit}%"))

    hasil_map: Dict[str, Dict[str, Any]] = {}

    # 4. Pencarian Semantik Vektor dengan pgvector (jika embedding tersedia)
    if query_vector:
        cosine_dist = PotonganBerkas.embedding.cosine_distance(query_vector)
        
        vector_candidates = (
            base_query.filter(PotonganBerkas.embedding != None)
            .order_by(cosine_dist)
            .limit(payload.limit * 2)
            .all()
        )

        for chunk, b in vector_candidates:
            sim_score = db.query(1 - cosine_dist).filter(PotonganBerkas.id == chunk.id).scalar() or 0.0
            sim_score = max(0.0, min(1.0, float(sim_score)))

            key = f"{b.id}_{chunk.nomor_halaman}_{chunk.indeks_potongan}"
            hasil_map[key] = {
                "chunk": chunk,
                "berkas": b,
                "semantic_score": sim_score,
                "keyword_match": query_teks.lower() in chunk.isi.lower()
            }

    # 5. Pencarian Berbasis Kata Kunci (Keyword Matching)
    keyword_candidates = (
        base_query.filter(
            or_(
                PotonganBerkas.isi.ilike(f"%{query_teks}%"),
                Berkas.judul.ilike(f"%{query_teks}%"),
                Berkas.nomor_berkas.ilike(f"%{query_teks}%")
            )
        )
        .limit(payload.limit * 2)
        .all()
    )

    for chunk, b in keyword_candidates:
        key = f"{b.id}_{chunk.nomor_halaman}_{chunk.indeks_potongan}"
        if key in hasil_map:
            hasil_map[key]["keyword_match"] = True
        else:
            hasil_map[key] = {
                "chunk": chunk,
                "berkas": b,
                "semantic_score": 0.5,
                "keyword_match": True
            }

    # 6. Hitung Skor Gabungan (Hybrid Score) & Urutkan
    daftar_terurut = []
    for item in hasil_map.values():
        sem_score = item["semantic_score"]
        kw_score = 1.0 if item["keyword_match"] else 0.0
        hybrid_score = round((0.7 * sem_score) + (0.3 * kw_score), 4)
        daftar_terurut.append((hybrid_score, item["chunk"], item["berkas"]))

    daftar_terurut.sort(key=lambda x: x[0], reverse=True)

    # 7. Format hasil keluaran response
    hasil_items: List[HasilPencarianItem] = []
    for score, chunk, b in daftar_terurut[:payload.limit]:
        cuplikan = chunk.isi.strip()
        if len(cuplikan) > 350:
            cuplikan = cuplikan[:350] + "..."

        hasil_items.append(
            HasilPencarianItem(
                id_berkas=b.id,
                nomor_berkas=b.nomor_berkas,
                judul=b.judul,
                nomor_halaman=chunk.nomor_halaman,
                potongan_teks=cuplikan,
                skor_kemiripan=score,
                level_keamanan=b.level_keamanan,
                unit_penghasil=b.unit_penghasil
            )
        )

    return PencarianResponse(
        query=payload.query,
        total_hasil=len(hasil_items),
        hasil=hasil_items
    )