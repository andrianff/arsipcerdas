from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.berkas import Berkas
from app.models.potongan_berkas import PotonganBerkas
from app.schemas.pencarian import PencarianRequest, PencarianResponse, HasilPencarianItem

router = APIRouter()


@router.post("/", response_model=PencarianResponse)
def cari_dokumen(
    payload: PencarianRequest,
    db: Session = Depends(get_db)
):
    """
    Pencarian konten dokumen berdasarkan potongan teks (chunk).
    Mencocokkan kata kunci pada isi teks berkas.
    """
    query_str = f"%{payload.query}%"
    
    # Query join antara potongan berkas dan berkas induk
    results = (
        db.query(PotonganBerkas, Berkas)
        .join(Berkas, PotonganBerkas.id_berkas == Berkas.id)
        .filter(PotonganBerkas.isi.ilike(query_str))
        .limit(payload.limit)
        .all()
    )

    hasil_items = []
    for chunk, b in results:
        hasil_items.append(
            HasilPencarianItem(
                id_berkas=b.id,
                nomor_berkas=b.nomor_berkas,
                judul=b.judul,
                nomor_halaman=chunk.nomor_halaman,
                potongan_teks=chunk.isi[:300] + "..." if len(chunk.isi) > 300 else chunk.isi,
                skor_kemiripan=1.0,
                level_keamanan=b.level_keamanan,
                unit_penghasil=b.unit_penghasil
            )
        )

    return PencarianResponse(
        query=payload.query,
        total_hasil=len(hasil_items),
        hasil=hasil_items
    )