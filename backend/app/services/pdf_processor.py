import io
from typing import List, Dict, Any
import pymupdf

class PDFProcessor:
    @staticmethod
    def extract_text_per_page(file_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Mengekstrak teks halaman per halaman menggunakan PyMuPDF (sangat cepat).
        Mengembalikan list dict: [{'page: 1, 'text': '...'}, ...]
        """
        pages_content = []
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        try:
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text("text").strip()
                pages_content.append({
                    "page": page_num + 1,
                    "text": text
                })
            return pages_content
        finally:
            doc.close()
    
    @staticmethod
    def count_pages(file_bytes: bytes) -> int:
        """
        Menghitung total halaman dokumen PDF.
        """
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        try:
            return len(doc)
        finally:
            doc.close()
    
    @staticmethod
    def chunk_text(
        pages_content: List[Dict[str, Any]],
        chunk_size_words: int = 250,
        overlap_words: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Membagi teks dokumen menjadi potongan-potongan (chunks) dengan konteks tumpang tindih (overlap).
        Potongan ini yang akan disimpan ke database untuk pencarian kata kunci dan vektor AI.
        """
        chunks = []
        chunk_index = 0

        for page in pages_content:
            page_num = page["page"]
            text = page["text"]
            if not text:
                continue

            words = text.split()
            if not words:
                continue

            i = 0
            while i < len(words):
                chunk_words = words[i:i + chunk_size_words]
                chunk_str = " ".join(chunk_words)

                # Estimasi kasar token (1 kata ~ 1.3 token)
                token_count = int(len(chunk_words) * 1.3)

                chunks.append({
                    "indeks_potongan": chunk_index,
                    "nomor_halaman": page_num,
                    "isi": chunk_str,
                    "jumlah_token": token_count
                })

                chunk_index += 1
                if i + chunk_size_words >= len(words):
                    break
                i += (chunk_size_words - overlap_words)

        return chunks