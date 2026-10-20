-- Aktifkan Ekstensi
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Master Klasifikasi & Jadwal Retensi Arsip (JRA)
CREATE TABLE IF NOT EXISTS jadwal_retensi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode_klasifikasi VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'KU.01' (Keuangan), 'KP.02' (Kepegawaian)
    nama_klasifikasi VARCHAR(255) NOT NULL,
    tahun_aktif INT NOT NULL DEFAULT 2, -- Masa aktif (tahun)
    tahun_inaktif INT NOT NULL DEFAULT 5, -- Masa inaktif sebelum pemusnahan
    aksi_putusan VARCHAR(50) NOT NULL, -- 'musnah', 'statis', 'review'
    deskripsi TEXT,
    waktu_pembuatan TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Berkas / Dokumen Arsip (Records)
CREATE TABLE IF NOT EXISTS berkas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nomor_berkas VARCHAR(100) UNIQUE, -- Nomor surat / registrasi
    judul VARCHAR(255) NOT NULL,
    ringkasan TEXT,
    id_jadwal_retensi UUID REFERENCES jadwal_retensi(id),
    level_keamanan VARCHAR(30) NOT NULL DEFAULT 'biasa', -- biasa, terbatas, rahasia, sangat_rahasia
    tanggal_dokumen DATE NOT NULL,
    -- Penyimpanan Fisik & Kriptografi
    storage_path VARCHAR(500) NOT NULL, -- Lokasi objek di MinIO (bucker/object_name)
    sha256_hash CHAR(64) NOT NULL, -- Sidik jari SHA-256 anti-manipulasi
    mime_type VARCHAR(100) NOT NULL,
    ukuran_file_bytes BIGINT NOT NULL,
    jumlah_halaman INT DEFAULT 1,
    -- Siklus Hidup Dokumen (Lifecycle)
    status_siklus_hidup VARCHAR(50) DEFAULT 'aktif', -- Dalam proses, aktif, inaktif, musnah
    tanggal_mulai_aktif TIMESTAMPTZ NOT NULL,
    tanggal_akhir_retensi TIMESTAMPTZ NOT NULL,
    -- Metadata Kepemilikan & Audit Pembuatan
    unit_penghasil VARCHAR(100) NOT NULL,
    user_id_pembuat UUID NOT NULL,
    waktu_pembuatan TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    waktu_pembaruan TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Potongan Teks Dokumen & Vektor AI (Hybrid Retrieval)
CREATE TABLE IF NOT EXISTS potongan_berkas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_berkas UUID REFERENCES berkas(id) ON DELETE CASCADE,
    indeks_potongan INT NOT NULL,
    nomor_halaman INT NOT NULL,
    isi TEXT NOT NULL,
    jumlah_token INT NOT NULL,
    embedding vector(1536), -- Vektor embedding 1536 dimensi
    isi_tsv tsvector GENERATED ALWAYS AS (to_tsvector('indonesian', isi)) STORED,
    waktu_pembuatan TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Jejak Audit Kepatuhan yang Tidak Boleh Dimanipulasi (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS log_audit_berkas (
    id BIGSERIAL PRIMARY KEY,
    id_berkas UUID REFERENCES berkas(id) ON DELETE CASCADE,
    id_pengguna UUID NOT NULL,
    nama_pengguna VARCHAR(150) NOT NULL,
    aksi VARCHAR(50) NOT NULL, -- DILIHAT, DOWNLOAD, VERIFIKASI HASH, PERBARUI SIKLUS HIDUP
    alamat_ip VARCHAR(45) NOT NULL,
    agent_pengguna TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    waktu_pembuatan TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Indeks Khusus untuk Kecepatan Query Skala Besar
CREATE INDEX IF NOT EXISTS indeks_lookup_berkas ON berkas(nomor_berkas, level_keamanan, status_siklus_hidup);
CREATE INDEX IF NOT EXISTS indeks_tanggal_retensi_berkas ON berkas(tanggal_mulai_aktif, tanggal_akhir_retensi);
CREATE INDEX IF NOT EXISTS indeks_embedding_potongan_hnsw ON potongan_berkas USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX IF NOT EXISTS indeks_tsv_potongan_gin ON potongan_berkas USING GIN (isi_tsv);
CREATE INDEX IF NOT EXISTS indeks_parent_potongan ON potongan_berkas(id_berkas);
CREATE INDEX IF NOT EXISTS indeks_chain_audit_berkas ON log_audit_berkas(id_berkas, waktu_pembuatan DESC);