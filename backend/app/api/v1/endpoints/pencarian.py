from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db
from app.models.berkas import Berkas
from app.models.potongan_berkas import PotonganBerkas
from app.schemas.pencarian import PencarianRequest, PencarianResponse, HasilPencarianItem
from app.services.embedding_service import EmbeddingService

router = APIRouter()


@router.post("/", response_model=PencarianResponse)
def cari_dokumen(
    payload: PencarianRequest,
    db: Session = Depends(get_db)
):
    """
    Pencarian Cerdas (Hybrid Search):
    1. Vektor Embedding (Gemini) + pgvector Cosine Similarity untuk pemahaman makna/konteks.
    2. Pencocokan kata kunci (Keyword Match).
    3. Filter unit kerja dan level keamanan berkas.
    4. Graceful Fallback ke pencarian kata kunci jika API AI tidak tersedia.
    """
    query_teks = payload.query.strip()
    query_vector = None

    # 1. Coba buat embedding untuk query pengguna
    try:
        query_vector = EmbeddingService.generate_embedding(query_teks)
    except Exception as e:
        print(f"Peringatan: Gagal generate query embedding, beralih ke pencarian teks biasa. Error: {e}")

    # Base query join
    base_query = db.query(PotonganBerkas, Berkas).join(
        Berkas, PotonganBerkas.id_berkas == Berkas.id
    )

    # Filter opsional berdasarkan Unit Kerja
    if payload.filter_unit:
        base_query = base_query.filter(Berkas.unit_penghasil.ilike(f"%{payload.filter_unit}%"))

    # Filter opsional berdasarkan Level Keamanan Maksimal
    if payload.level_keamanan_maks:
        level_hierarchy = {"biasa": 1, "terbatas": 2, "rahasia": 3, "sangat_rahasia": 4}
        max_level_num = level_hierarchy.get(payload.level_keamanan_maks.lower(), 4)
        allowed_levels = [lvl for lvl, num in level_hierarchy.items() if num <= max_level_num]
        base_query = base_query.filter(Berkas.level_keamanan.in_(allowed_levels))

    hasil_map: Dict[str, Dict[str, Any]] = {}

    # 2. Jika Vektor berhasil digenerate, lakukan Semantic Vector Search dengan pgvector
    if query_vector:
        # Cosine distance: 0 = identik, 2 = berlawanan.
        # Cosine similarity = 1 - cosine_distance
        cosine_dist = PotonganBerkas.embedding.cosine_distance(query_vector)
        
        vector_candidates = (
            base_query.filter(PotonganBerkas.embedding != None)
            .order_by(cosine_dist)
            .limit(payload.limit * 2)
            .all()
        )

        for chunk, b in vector_candidates:
            # Hitung cosine distance untuk chunk ini
            # Gunakan representasi nilai similarity
            sim_score = db.query(1 - cosine_dist).filter(PotonganBerkas.id == chunk.id).scalar() or 0.0
            sim_score = max(0.0, min(1.0, float(sim_score)))

            key = f"{b.id}_{chunk.nomor_halaman}_{chunk.indeks_potongan}"
            hasil_map[key] = {
                "chunk": chunk,
                "berkas": b,
                "semantic_score": sim_score,
                "keyword_match": query_teks.lower() in chunk.isi.lower()
            }

    # 3. Pencarian Berbasis Kata Kunci (Keyword Matching)
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
                "semantic_score": 0.5,  # Skor netral jika tidak lewat vektor
                "keyword_match": True
            }

    # 4. Hitung Skor Gabungan (Hybrid Score) & Urutkan
    # Bobot: 70% Semantik (makna), 30% Kata Kunci (eksak)
    daftar_terurut = []
    for item in hasil_map.values():
        sem_score = item["semantic_score"]
        kw_score = 1.0 if item["keyword_match"] else 0.0
        hybrid_score = round((0.7 * sem_score) + (0.3 * kw_score), 4)

        daftar_terurut.append((hybrid_score, item["chunk"], item["berkas"]))

    daftar_terurut.sort(key=lambda x: x[0], reverse=True)

    # 5. Format hasil keluaran response
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