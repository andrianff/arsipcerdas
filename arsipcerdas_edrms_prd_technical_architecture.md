# ArsipCerdas (Intelligent EDRMS) — Product Requirement Document & Technical Specification

> **Project Name:** ArsipCerdas  
> **System Class:** Enterprise Electronic Document & Records Management System (EDRMS)  
> **Target Roles:** AI Engineer & Fullstack Developer Portfolio  
> **Primary Goals:** Scalable Document Lifecycle, Asynchronous OCR Pipeline, Hybrid Semantic Search, and Cryptographic Audit Compliance  

---

## 1. Executive Summary & Value Proposition

### 1.1 Background & Industry Pain Points
Pengelolaan arsip digital konvensional pada level instansi dan korporasi umumnya menghadapi kendala struktural:
1. **Passive Folder Storage:** Dokumen hanya diunggah ke *shared storage* tanpa ekstraksi metadata otomatis, menyebabkan pencarian bergantung sepenuhnya pada penamaan file yang rawan inkonsistensi.
2. **Slow Manual Indexing:** Staf arsiparis menghabiskan waktu signifikan untuk membaca dokumen dan menginput nomor surat, perihal, tanggal, dan klasifikasi masalah secara manual.
3. **No Semantic Discovery:** Dokumen lampiran dan berkas pindaian (scanned PDF) tidak dapat dicari berdasarkan konteks atau makna kalimat (*unsearchable visual assets*).
4. **Vulnerability to Tampering & Data Drift:** Ketiadaan validasi integritas kriptografis membuat dokumen rentan terhadap modifikasi tanpa jejak audit resmi.
5. **Forgotten Retention Schedules:** Jadwal Retensi Arsip (JRA) sering kali diabaikan, menyebabkan penumpukan berkas inaktif yang membebani kapasitas penyimpanan dan melanggar kepatuhan hukum.

### 1.2 Proposed Solution: ArsipCerdas
**ArsipCerdas** adalah platform EDRMS modern yang menggabungkan:
* **Asynchronous Ingestion Pipeline:** Antrean latar belakang (Celery + Redis) untuk pemrosesan OCR dan vektorisasi tanpa memblokir thread server utama.
* **Hybrid Search Engine:** Kombinasi *Dense Semantic Retrieval* (pgvector) dan *Sparse Lexical Retrieval* (PostgreSQL Full-Text Search) menggunakan algoritma *Reciprocal Rank Fusion* (RRF).
* **Automated Retention Lifecycle:** Pengecekan otomatis batas retensi aktif/inaktif berkas berbasis kode klasifikasi standar.
* **Immutable Security & Audit Trail:** Validasi stempel digital SHA-256 untuk mendeteksi pemalsuan dokumen serta log audit aktivitas pengguna yang terperinci.

---

## 2. Bagian I: Spesifikasi Desain & Antarmuka (Google Stitch Blueprint)

Bagian ini dirancang sebagai panduan pembuatan wireframe, komponen UI, dan prototype antarmuka di Google Stitch.

### 2.1 Design System & Aesthetic Directives
* **Design Philosophy:** *Clean Enterprise, High Data Density, Utilitarian, Trust-Inspiring.*
* **Color Palette:**
  * **Canvas / Background:** Slate Neutral (`#F8FAFC`)
  * **Card / Surface:** Pure White (`#FFFFFF`) with subtle border (`#E2E8F0`)
  * **Primary Brand:** Deep Slate Navy (`#0F172A`)
  * **Interactive / Primary CTA:** Vibrant Indigo (`#4F46E5`, hover: `#4338CA`)
  * **Integrity / Verification:** Emerald Green (`#10B981`)
  * **Warning / Retention Alert:** Warm Amber (`#F59E0B`)
  * **Destructive / Danger:** Crimson Rose (`#F43F5E`)
* **Typography:**
  * Headings: Inter / Plus Jakarta Sans (Semibold / Bold)
  * Body & Tables: Inter (Regular / Medium, 13px - 14px untuk kepadatan data optimal)
  * Code / Hash / Identifiers: JetBrains Mono / Roboto Mono

---

### 2.2 Screen Breakdown & Component Specifications

#### Screen 1: Executive Dashboard & Retention Tracker (`/dashboard`)
* **Purpose:** Tampilan pemantauan terpusat untuk pimpinan dan kepala arsiparis.
* **Layout Structure:**
  1. **Top Metric Ribbon (4 Cards):**
     * *Total Berkas Aktif* (dengan delta pertumbuhan mingguan).
     * *Antrean OCR & Indexing* (status real-time worker).
     * *Menunggu Verifikasi Metadata* (tindakan verifikasi cepat).
     * *Berkas Jatuh Tempo Retensi* (peringatan warna amber/merah).
  2. **Retention Schedule Action Hub:**
     * Tabel daftar berkas yang mencapai ambang batas retensi aktif.
     * Kolom: Nomor Arsip, Judul, Klasifikasi, Tanggal Berakhir Aktif, Rekomendasi Disposisi (*Pindahkan ke Inaktif* / *Usulkan Musnah* / *Arsip Statis*).
     * Aksi batch: tombol *Approve Transfer* dan *Download Berita Acara*.
  3. **Live Compliance & Audit Feed:**
     * Feed kronologis berisi aktivitas baca, unduh, dan perubahan metadata dengan stempel waktu detik.

#### Screen 2: Record Explorer & Hybrid Search (`/records`)
* **Purpose:** Mesin pencari dokumen berkas dan repositori cerdas.
* **Layout Structure (2 Kolom: Filter Sidebar + Result Grid):**
  1. **Omni-Search Bar:**
     * Search input lebar dengan toggle mode:
       * Mode *Semantik (AI)*: Mencari berdasarkan makna topik (misal: "perjanjian sewa ruko kantor cabang").
       * Mode *Eksak*: Mencari berdasarkan nomor surat, klasifikasi, atau kata kunci spesifik.
  2. **Facet Filter Sidebar (Kiri - 260px):**
     * Klasifikasi Masalah (Checkbox: Keuangan `KU`, Kepegawaian `KP`, Hukum `HK`, Operasional `OT`).
     * Status Keamanan (Biasa, Terbatas, Rahasia, Sangat Rahasia).
     * Rentang Tanggal Dokumen.
     * Status Retensi (Aktif, Inaktif, Siap Musnah).
  3. **Data Table / Card View:**
     * Baris data memuat Nomor Berkas, Judul, Tanggal, Klasifikasi, Badge Integritas (Centang Hijau SHA-256 Valid), dan Quick Actions (*Preview*, *Download*, *Audit Log*).
  4. **Side Quick-Drawer:**
     * Membuka panel samping kanan saat salah satu baris diklik, menyajikan metadata penting, ekstrak ringkasan isi dokumen dari LLM, dan skor kecocokan semantik.

#### Screen 3: Document Workspace & Security Viewer (`/records/[id]`)
* **Purpose:** Membaca berkas PDF, memverifikasi keaslian, dan mengelola privasi data.
* **Layout Structure:**
  1. **Central Document Canvas (65%):**
     * Penampil PDF berbasis kanvas dengan fitur *Dynamic Watermark* (Nama pengguna yang sedang login + Timestamp akses + IP address) untuk mencegah kebocoran dokumen melalui tangkapan layar.
     * Mode *PII Redaction View*: Menutup area NIK, tanda tangan, atau nomor rekening saat dibuka oleh staf non-otoritas.
  2. **Information & AI Insight Panel (Right - 35%):**
     * **Tab 1: Metadata & AI Summary:** Ringkasan eksekutif dokumen 3 poin hasil ekstraksi otomatis dan daftar entitas kunci (Named Entities: orang yang bertanda tangan, nominal, tanggal penting).
     * **Tab 2: Cryptographic Integrity:** Status verifikasi SHA-256 hash antara saat unggah dan kondisi saat ini. Tombol *Verifikasi Ulang Hash*.
     * **Tab 3: Immutable Audit Trail:** Tabel log siapa saja yang pernah membuka, mengunduh, mencetak, atau mengubah klasifikasi berkas tersebut.

#### Screen 4: Ingestion Pipeline & Human-in-the-Loop Verification (`/ingestion`)
* **Purpose:** Upload berkas baru secara satuan atau massal dengan asistensi AI.
* **Layout Structure:**
  1. **Drag-and-Drop Zone:** Mendukung multi-file PDF, TIFF, dan PNG.
  2. **Processing Pipeline Queue:** Progress bar 4 tahap untuk setiap file:
     * `Upload Completed` ➔ `OCR Text Extraction` ➔ `AI Metadata Inference` ➔ `Ready for Review`.
  3. **Verification Form (Review Pane):**
     * Tampilan berdampingan (*split screen*): Dokumen asli di sisi kiri, kolom input hasil ekstraksi AI di sisi kanan (Nomor Berkas, Tanggal Berkas, Klasifikasi Terdeteksi, Ringkasan).
     * Pengguna dapat mengonfirmasi atau mengoreksi data sebelum menekan tombol *Resmikan ke Basis Data*.

---

## 3. Bagian II: Arsitektur Teknis & Monorepo (Antigravity Blueprint)

Bagian ini dirancang untuk eksekusi kode langsung di workspace Antigravity.

### 3.1 Architectural Principles for Scale
1. **Separation of Concerns:** Pemisahan ketat antara API server transaksi HTTP, worker komputasi asinkron (OCR/AI), dan media storage biner.
2. **Zero Storage Bottleneck:** Seluruh file fisik dialihkan ke S3-compatible Object Storage (**MinIO** untuk lokal, AWS S3 untuk cloud). Database hanya menyimpan path dan checksum hash SHA-256.
3. **Sub-second Hybrid Retrieval:** Pencarian teks bahasa Indonesia dipercepat dengan indeks GIN `tsvector`, dan pencarian embedding didukung indeks HNSW pada `pgvector`.
4. **Append-Only Auditing:** Data audit kepatuhan disimpan dalam tabel terpisah yang diproteksi dari operasi `UPDATE` dan `DELETE` di tingkat database trigger.

---

### 3.2 Database Schema (PostgreSQL 16 + pgvector)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Master Klasifikasi & Jadwal Retensi Arsip (JRA)
CREATE TABLE retention_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classification_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'KU.01', 'HM.02'
    classification_name VARCHAR(255) NOT NULL,
    active_years INT NOT NULL DEFAULT 2,
    inactive_years INT NOT NULL DEFAULT 5,
    disposition_action VARCHAR(50) NOT NULL,        -- 'musnah', 'statis', 'review'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Berkas/Dokumen (Records)
CREATE TABLE records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_number VARCHAR(100) UNIQUE,              -- Nomor resmi surat/dokumen
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    retention_schedule_id UUID REFERENCES retention_schedules(id),
    security_level VARCHAR(30) NOT NULL DEFAULT 'biasa', -- 'biasa', 'terbatas', 'rahasia', 'sangat_rahasia'
    document_date DATE NOT NULL,
    
    -- Penyimpanan Fisik & Kriptografi
    storage_path VARCHAR(500) NOT NULL,             -- Path di MinIO/S3
    sha256_hash CHAR(64) NOT NULL,                  -- Checksum anti-tampering
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    page_count INT DEFAULT 1,
    
    -- Status Siklus Hidup Arsip
    lifecycle_status VARCHAR(50) DEFAULT 'active',  -- 'processing', 'active', 'inactive', 'disposed'
    active_until_date DATE NOT NULL,
    retention_due_date DATE NOT NULL,
    
    -- Metadata Kepemilikan
    originating_unit VARCHAR(100) NOT NULL,
    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Chunk Teks & Vektor Pencarian Semantik
CREATE TABLE record_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID NOT NULL REFERENCES records(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    page_number INT NOT NULL,
    content TEXT NOT NULL,
    token_count INT NOT NULL,
    embedding vector(1536),                         -- Model text-embedding-3-small / bge-m3
    tsv_content tsvector GENERATED ALWAYS AS (to_tsvector('indonesian', content)) STORED,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Immutable Audit Trail
CREATE TABLE record_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    record_id UUID REFERENCES records(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    action VARCHAR(50) NOT NULL,                   -- 'VIEW', 'DOWNLOAD', 'VERIFY_HASH', 'UPDATE_LIFECYCLE'
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Optimal Indexing for Scale
CREATE INDEX idx_records_lookup ON records(record_number, security_level, lifecycle_status);
CREATE INDEX idx_records_retention_dates ON records(active_until_date, retention_due_date);
CREATE INDEX idx_chunks_embedding_hnsw ON record_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX idx_chunks_tsv_gin ON record_chunks USING gin (tsv_content);
CREATE INDEX idx_chunks_parent ON record_chunks(record_id);
CREATE INDEX idx_audit_record_chain ON record_audit_logs(record_id, created_at DESC);
```

---

### 3.3 Hybrid Search Logic Formulation (SQL + RRF)

Pencarian menggabungkan kemiripan semantik sudut kosinus (*Vector*) dan frekuensi kecocokan leksikal (*Full-Text Search*):

$$
RRF\_Score(d) = \frac{0.65}{60 + Rank_{vector}(d)} + \frac{0.35}{60 + Rank_{lexical}(d)}
$$

Fungsi Retrieval di Backend:
```sql
WITH vector_search AS (
    SELECT id, record_id, page_number, content,
           ROW_NUMBER() OVER (ORDER BY embedding <=> :query_vector) AS rank_v
    FROM record_chunks
    LIMIT 30
),
lexical_search AS (
    SELECT id, record_id, page_number, content,
           ROW_NUMBER() OVER (ORDER BY ts_rank_cd(tsv_content, plainto_tsquery('indonesian', :query_text)) DESC) AS rank_l
    FROM record_chunks
    WHERE tsv_content @@ plainto_tsquery('indonesian', :query_text)
    LIMIT 30
)
SELECT 
    COALESCE(v.record_id, l.record_id) AS record_id,
    COALESCE(v.page_number, l.page_number) AS page_number,
    COALESCE(v.content, l.content) AS content,
    (COALESCE(1.0 / (60 + v.rank_v), 0.0) * 0.65) +
    (COALESCE(1.0 / (60 + l.rank_l), 0.0) * 0.35) AS composite_score
FROM vector_search v
FULL OUTER JOIN lexical_search l ON v.id = l.id
ORDER BY composite_score DESC
LIMIT 10;
```

---

### 3.4 Monorepo Directory Structure (Antigravity Root)

```text
arsipcerdas-platform/
├── docker-compose.yml              # Multi-container orchestration
├── .env.example                    # Template environment variables
├── Makefile                        # Project setup shortcuts
├── README.md
│
├── backend/                        # FastAPI Application
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                # FastAPI lifecycle, CORS, routing
│   │   ├── core/
│   │   │   ├── config.py          # Pydantic BaseSettings & Environment
│   │   │   ├── database.py        # SQLAlchemy AsyncEngine setup
│   │   │   └── security.py        # JWT & RBAC dependency injection
│   │   ├── api/
│   │   │   ├── router.py
│   │   │   └── v1/
│   │   │       ├── records.py     # Endpoints: CRUD, Presigned MinIO URLs
│   │   │       ├── search.py      # Endpoints: Hybrid Semantic Search
│   │   │       ├── retention.py   # Endpoints: JRA lifecycle triggers
│   │   │       └── audit.py       # Endpoints: Access log retrieval
│   │   ├── models/
│   │   │   ├── record.py          # SQLAlchemy Record & Chunk ORM
│   │   │   ├── retention.py       # Retention schedule model
│   │   │   └── audit.py           # Audit log model
│   │   ├── schemas/
│   │   │   ├── record.py          # Pydantic In/Out validation
│   │   │   └── search.py
│   │   └── services/
│   │       ├── storage.py         # MinIO client wrapper
│   │       ├── crypto.py          # SHA-256 calculation & validation
│   │       └── search_engine.py   # Hybrid query executor & RRF
│   └── tests/
│
├── worker/                         # Celery Asynchronous Worker
│   ├── Dockerfile
│   ├── requirements.txt
│   └── tasks/
│       ├── celery_app.py          # Celery configuration with Redis broker
│       ├── ocr_pipeline.py        # PyMuPDF + Tesseract/Surya extraction
│       ├── embedding_task.py      # Sentence splitting & embedding calculation
│       └── retention_cron.py      # Daily scheduled job for retention expiry
│
└── frontend/                       # Next.js 14 (App Router)
    ├── Dockerfile
    ├── package.json
    ├── tailwind.config.ts
    ├── src/
        ├── app/
        │   ├── layout.tsx         # Sidebar shell & root styling
        │   ├── dashboard/page.tsx # Screen 1: Dashboard & Retention
        │   ├── records/
        │   │   ├── page.tsx       # Screen 2: Explorer & Search
        │   │   └── [id]/page.tsx  # Screen 3: Detail, Viewer, & Audit
        │   └── ingestion/page.tsx # Screen 4: Bulk Upload & Verification
        ├── components/
        │   ├── ui/                # Button, Input, Modal, Badge (Shadcn UI)
        │   ├── viewer/
        │   │   ├── SecurePDFViewer.tsx  # Canvas PDF + Dynamic Watermark
        │   │   └── IntegrityBadge.tsx   # SHA-256 verification indicator
        │   ├── search/
        │   │   ├── SearchBarAI.tsx      # Semantic/Exact mode toggle
        │   │   └── FilterSidebar.tsx    # Faceted classification filter
        │   └── dashboard/
        │       ├── RetentionTable.tsx   # Expiry monitoring table
        │       └── StatCard.tsx
        ├── hooks/
        │   ├── useRecords.ts      # Data fetching hooks
        │   └── useAuditLog.ts
        └── lib/
            ├── api-client.ts      # Axios/Fetch instance
            └── utils.ts
```

---

### 3.5 Core Docker Compose Blueprint (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: arsipcerdas_db
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-arsip_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-arsip_pass123}
      POSTGRES_DB: ${POSTGRES_DB:-arsipcerdas_db}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-arsip_user}"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: arsipcerdas_redis
    ports:
      - "6379:6379"

  minio:
    image: minio/minio:RELEASE.2024-01-18T22-51-28Z
    container_name: arsipcerdas_storage
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin123}
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - miniodata:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: arsipcerdas_api
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      minio:
        condition: service_started
    environment:
      DATABASE_URL: postgresql+asyncpg://${POSTGRES_USER:-arsip_user}:${POSTGRES_PASSWORD:-arsip_pass123}@postgres:5432/${POSTGRES_DB:-arsipcerdas_db}
      REDIS_URL: redis://redis:6379/0
      MINIO_ENDPOINT: minio:9000
      MINIO_ACCESS_KEY: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD:-minioadmin123}
    ports:
      - "8000:8000"

  worker:
    build:
      context: ./worker
      dockerfile: Dockerfile
    container_name: arsipcerdas_worker
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-arsip_user}:${POSTGRES_PASSWORD:-arsip_pass123}@postgres:5432/${POSTGRES_DB:-arsipcerdas_db}
      REDIS_URL: redis://redis:6379/0

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: arsipcerdas_web
    depends_on:
      - backend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1

volumes:
  pgdata:
  miniodata:
```

---

## 4. Implementation Steps in Antigravity

1. **Step 1: Container Orchestration & Migrations**
   * Buat file `.env` dari `.env.example`.
   * Jalankan `docker compose up -d postgres redis minio` untuk memvalidasi ketersediaan basis data dan storage.
   * Eksekusi script DDL SQL di atas untuk membuat tabel, indeks HNSW, dan GIN.

2. **Step 2: Core Ingestion & Storage Pipeline**
   * Implementasikan `storage.py` menggunakan pustaka `minio-py` untuk pembuatan bucket otomatis dan fungsi *presigned URL*.
   * Implementasikan `crypto.py` untuk mengkalkulasi checksum SHA-256 berkas saat proses upload berlangsung.
   * Hubungkan task Celery `ocr_pipeline.py` menggunakan `PyMuPDF` untuk membaca halaman dokumen, mendeteksi orientasi, dan mengekstrak teks.

3. **Step 3: Vector Indexing & Hybrid Query**
   * Jalankan task `embedding_task.py` yang memecah teks hasil OCR per 600 token dan menghasilkan vektor embedding.
   * Uji query SQL RRF pada `search_engine.py` untuk membuktikan hasil pencarian semantik dan kata kunci berjalan di bawah 100 ms.

4. **Step 4: Frontend Screens & Secure Canvas**
   * Susun layout dashboard di Next.js 14 dengan 4 layar utama sesuai spesifikasi Google Stitch.
   * Terapkan canvas watermark dinamis pada penampil PDF untuk memenuhi aspek keamanan kepatuhan.