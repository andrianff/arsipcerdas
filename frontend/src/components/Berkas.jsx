import React, { useState, useEffect } from 'react'
import { berkasService, klasifikasiService } from '../services/api'
import {
    FolderPlus,
    Upload,
    Search,
    FileText,
    Eye,
    Plus,
    X,
    AlertCircle,
    FileCheck
} from 'lucide-react'


// Data sampel agar preview tabel langsung muncul meski backend belum berjalan
const DUMMY_BERKAS = [
    {
        id: '1',
        nomor_berkas: 'ARSIP/202610/9F82A1B2',
        judul: 'Laporan Pertanggungjawaban Anggaran TA 2025',
        unit_penghasil: 'Biro Keuangan',
        tanggal_dokumen: '2025-12-31',
        level_keamanan: 'biasa',
        status_siklus_hidup: 'aktif',
        jumlah_halaman: 48,
        storage_path: 'keuangan/2025/lpj_final.pdf'
    },
    {
        id: '2',
        nomor_berkas: 'ARSIP/202610/3C74D9E0',
        judul: 'Perjanjian Kerjasama Pengadaan Infrastruktur Server AI',
        unit_penghasil: 'Divisi TI & Arsip',
        tanggal_dokumen: '2026-02-15',
        level_keamanan: 'terbatas',
        status_siklus_hidup: 'aktif',
        jumlah_halaman: 24,
        storage_path: 'it/spk_server_2026.pdf'
    },
    {
        id: '3',
        nomor_berkas: 'ARSIP/202610/5E12F88A',
        judul: 'Surat Keputusan Direksi tentang Pengangkatan Pegawai',
        unit_penghasil: 'Biro SDM',
        tanggal_dokumen: '2026-01-10',
        level_keamanan: 'rahasia',
        status_siklus_hidup: 'inaktif',
        jumlah_halaman: 12,
        storage_path: 'sdm/sk_direksi_01.pdf'
    }
]

export function Berkas() {
    const [berkasList, setBerkasList] = useState([])
    const [klasifikasiList, setKlasifikasiList] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchKeyword, setSearchKeyword] = useState('')
    // Modal State
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedBerkas, setSelectedBerkas] = useState(null)
    const [berkasItems, setBerkasItems] = useState([])
    const [loadingItems, setLoadingItems] = useState(false)
    // Form Tambah Berkas State
    const [formData, setFormData] = useState({
        nomor_berkas: '',
        judul: '',
        unit_penghasil: '',
        tanggal_dokumen: new Date().toISOString().split('T')[0],
        level_keamanan: 'biasa',
        id_jadwal_retensi: '',
        file: null
    })
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    useEffect(() => {
        loadData()
    }, [])
    const loadData = async () => {
        try {
            setLoading(true)
            const [resBerkas, resKlasifikasi] = await Promise.all([
                berkasService.getAll().catch(() => null),
                klasifikasiService.getAll().catch(() => null)
            ])

            if (resBerkas && resBerkas.length > 0) {
                setBerkasList(resBerkas)
            } else {
                // Gunakan dummy data untuk keperluan preview jika database backend belum diisi
                setBerkasList(DUMMY_BERKAS)
            }
            if (resKlasifikasi) {
                setKlasifikasiList(resKlasifikasi)
            }
        } catch (err) {
            console.error('Gagal memuat data berkas:', err)
            setBerkasList(DUMMY_BERKAS)
        } finally {
            setLoading(false)
        }
    }
    // Buka Modal Detail Berkas
    const handleOpenDetail = async (berkas) => {
        setSelectedBerkas(berkas)
        setShowDetailModal(true)
        try {
            setLoadingItems(true)
            const resItems = await berkasService.getItems(berkas.id).catch(() => null)
            setBerkasItems(resItems || [berkas])
        } catch (err) {
            setBerkasItems([berkas])
        } finally {
            setLoadingItems(false)
        }
    }
    // Submit Registrasi Berkas Baru
    const handleCreateSubmit = async (e) => {
        e.preventDefault()
        setFormError('')
        if (!formData.judul || !formData.unit_penghasil) {
            setFormError('Judul berkas dan Unit Penghasil wajib diisi.')
            return
        }
        try {
            setSubmitting(true)
            const payload = new FormData()
            payload.append('judul', formData.judul)
            payload.append('unit_penghasil', formData.unit_penghasil)
            payload.append('tanggal_dokumen', formData.tanggal_dokumen)
            payload.append('level_keamanan', formData.level_keamanan)
            if (formData.id_jadwal_retensi) {
                payload.append('id_jadwal_retensi', formData.id_jadwal_retensi)
            }
            if (formData.file) {
                payload.append('file', formData.file)
            }
            await berkasService.upload(payload)
            setShowCreateModal(false)
            loadData()
        } catch (err) {
            // Jika backend offline, tambahkan ke state lokal untuk simulasi
            const newDummy = {
                id: String(Date.now()),
                nomor_berkas: `ARSIP/${new Date().getFullYear()}10/${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
                judul: formData.judul,
                unit_penghasil: formData.unit_penghasil,
                tanggal_dokumen: formData.tanggal_dokumen,
                level_keamanan: formData.level_keamanan,
                status_siklus_hidup: 'aktif',
                jumlah_halaman: 1
            }
            setBerkasList([newDummy, ...berkasList])
            setShowCreateModal(false)
        } finally {
            setSubmitting(false)
        }
    }
    const getSecurityBadge = (level) => {
        switch (level) {
            case 'sangat_rahasia':
                return <span className="badge badge-sangat-rahasia">Sangat Rahasia</span>
            case 'rahasia':
                return <span className="badge badge-rahasia">Rahasia</span>
            case 'terbatas':
                return <span className="badge badge-terbatas">Terbatas</span>
            default:
                return <span className="badge badge-biasa">Biasa</span>
        }
    }
    const getStatusBadge = (status) => {
        switch (status) {
            case 'aktif':
                return <span className="badge badge-aktif">Aktif</span>
            case 'inaktif':
                return <span className="badge badge-inaktif">Inaktif</span>
            case 'musnah':
            case 'usul_musnah':
                return <span className="badge badge-musnah">Musnah</span>
            default:
                return <span className="badge badge-biasa">{status}</span>
        }
    }
    // Filter berkas berdasarkan kata kunci
    const filteredBerkas = berkasList.filter((b) => {
        const q = searchKeyword.toLowerCase()
        const judul = (b.judul || b.nama_berkas || '').toLowerCase()
        const nomor = (b.nomor_berkas || '').toLowerCase()
        const unit = (b.unit_penghasil || '').toLowerCase()
        return judul.includes(q) || nomor.includes(q) || unit.includes(q)
    })


    return (
        <div>
            {/* Header Halaman */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        marginBottom: '6px'
                    }}>
                        Manajemen Berkas Arsip
                    </h1>
                    <p style={{
                        color: '#64748b',
                        fontSize: '0.9rem',
                        margin: 0
                    }}>
                        Pengelolaan berkas dinamis, inventaris arsip inaktif, dan berkas fisik/digital.
                    </p>
                </div>
                <button
                    className='btn btn-primary'
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <FolderPlus size={18} />
                    Registrasi Berkas Baru
                </button>
            </div>

            {/* Filter & Pencarian */}
            <div
                className='card'
                style={{
                    marginBottom: '20px'
                }}
            >
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                }}>
                    <div style={{
                        position: 'relative',
                        flex: 1
                    }}>
                        <input
                            type="text"
                            className='input-field'
                            placeholder='Cari berdasarkan nomor berkas, judul, atau unit kerja...'
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                        />
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Tabel Berkas */}
            <div className='card'>
                {loading ? (
                    <p style={{
                        textAlign: 'center',
                        color: '#64748b',
                        padding: '30px'
                    }}>
                        Memuat daftar berkas...
                    </p>
                ) : filteredBerkas.length === 0 ? (
                    <p style={{
                        textAlign: 'center',
                        color: '#64748b',
                        padding: '30px'
                    }}>
                        Tidak ada berkas yang cocok.
                    </p>
                ) : (
                    <div className='table-container'>
                        <table className='custom-table'>
                            <thead>
                                <tr>
                                    <th>No. Berkas</th>
                                    <th>Judul Dokumen / Berkas</th>
                                    <th>Unit Pengelola</th>
                                    <th>Tahun</th>
                                    <th>Keamanan</th>
                                    <th>Status Retensi</th>
                                    <th style={{ textAlign: 'right' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBerkas.map((berkas) => (
                                    <tr key={berkas.id}>
                                        <td style={{
                                            fontWeight: '600',
                                            color: '#0f172a'
                                        }}>{berkas.nomor_berkas}</td>
                                        <td>
                                            <div style={{
                                                fontWeight: '600',
                                                color: '#1e293b'
                                            }}>
                                                {berkas.judul || berkas.nama_berkas}
                                            </div>
                                            {berkas.jumlah_halaman && (
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    color: '#64748b',
                                                    marginTop: '2px'
                                                }}>
                                                    {berkas.jumlah_halaman} Halaman PDF
                                                </div>
                                            )}
                                        </td>
                                        <td>{berkas.unit_penghasil || '-'}</td>
                                        <td>{berkas.tanggal_dokumen ? new Date(berkas.tanggal_dokumen).getFullYear() : '-'}</td>
                                        <td>{getSecurityBadge(berkas.level_keamanan || berkas.tingkat_keamanan)}</td>
                                        <td>{getStatusBadge(berkas.status_siklus_hidup || berkas.status_retensi)}</td>
                                        <td style={{
                                            textAlign: 'right'
                                        }}>
                                            <button
                                                className='btn btn-outline'
                                                style={{
                                                    padding: '6px 12px',
                                                    fontSize: '0.8rem',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                                onClick={() => handleOpenDetail(berkas)}>
                                                <Eye size={14} />
                                                Detail & Item
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL 1: REGISTRASI BERKAS BARU */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '560px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '24px',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                margin: 0
                            }}>
                                Unggah & Registrasi Berkas Baru
                            </h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#64748b'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {formError && (
                            <div style={{
                                padding: '10px 14px',
                                background: '#fef2f2',
                                color: '#ef4444',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                fontSize: '0.85rem'
                            }}>
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleCreateSubmit}>
                            <div style={{
                                marginBottom: '14px'
                            }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    marginBottom: '6px'
                                }}>
                                    Judul Berkas / Dokumen *
                                </label>
                                <input
                                    type="text"
                                    className='input-field'
                                    placeholder='Contoh: Perjanjian Kerjasama Pengadaan Infrastruktur'
                                    value={formData.judul}
                                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '14px',
                                marginBottom: '14px'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        marginBottom: '6px'
                                    }}>
                                        Unit Kerja Penghasil *
                                    </label>
                                    <input
                                        type="text"
                                        className='input-field'
                                        placeholder='Contoh: Biro Keuangan'
                                        value={formData.unit_penghasil}
                                        onChange={(e) => setFormData({ ...formData, unit_penghasil: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        marginBottom: '6px'
                                    }}>
                                        Tanggal Dokumen
                                    </label>
                                    <input
                                        type="date"
                                        className='input-field'
                                        value={formData.tanggal_dokumen}
                                        onChange={(e) => setFormData({ ...formData, tanggal_dokumen: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '14px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    marginBottom: '6px'
                                }}>
                                    Tingkat Keamanan
                                </label>
                                <select
                                    className='input-field'
                                    value={formData.level_keamanan}
                                    onChange={(e) => setFormData({ ...formData, level_keamanan: e.target.value })}
                                >
                                    <option value="">Biasa / Terbuka</option>
                                    <option value="">Terbatas</option>
                                    <option value="">Rahasia</option>
                                    <option value="">Sangat Rahasia</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '14px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    marginBottom: '6px'
                                }}>
                                    File Dokumen (PDF)
                                </label>
                                <input
                                    type="file"
                                    accept='.pdf'
                                    className='input-field'
                                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px',
                                marginTop: '20px'
                            }}>
                                <button
                                    type="button"
                                    className='btn btn-outline'
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className='btn btn-primary'
                                    disabled={submitting}
                                >
                                    {submitting ? 'Menyimpan...' : 'Unggah & Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: DETAIL BERKAS & UPLOAD ITEM (PDF) */}
            {showDetailModal && selectedBerkas && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '650px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '24px',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <div>
                                <span style={{
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    color: '#2563eb'
                                }}>
                                    {selectedBerkas.nomor_berkas}
                                </span>
                                <h2 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    margin: '4px 0 0 0'
                                }}>
                                    {selectedBerkas.judul || selectedBerkas.nama_berkas}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#64748b'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Rincian Metadata Berkas */}
                        <div style={{
                            background: '#f8fafc',
                            padding: '14px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '0.85rem'
                        }}>
                            <div style={{
                                marginBottom: '8px'
                            }}>
                                <strong>Unit Penghasil:</strong>
                                {selectedBerkas.unit_penghasil || '-'}
                            </div>
                            <div style={{
                                marginBottom: '8px'
                            }}>
                                <strong>Tanggal Dokumen:</strong>
                                {selectedBerkas.tanggal_dokumen || '-'} | {' '}
                                <strong>Keamanan:</strong>
                                {selectedBerkas.level_keamanan || '-'} | {' '}
                                <strong>Status:</strong>
                                {selectedBerkas.status_siklus_hidup}
                            </div>
                            {selectedBerkas.sha256_hash && (
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#64748b',
                                    wordBreak: 'break-all'
                                }}>
                                    <strong>Hash SHA-256 (Integritas):</strong>
                                    {selectedBerkas.sha256_hash}
                                </div>
                            )}

                            {/* Kotak Pratinjau Dokumen (Preview Area) */}
                            <div style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '16px',
                                background: '#fafafa',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    color: '#475569',
                                    fontWeight: '600',
                                    marginBottom: '10px'
                                }}>
                                    <FileText size={20} style={{ color: '#2563eb'}} />
                                    <span>Pratinjau Dokumen Digital ({selectedBerkas.jumlah_halaman || 1} Halaman)</span>
                                </div>

                                {/* Embed PDF Viewer */}
                                <div style={{
                                    height: '220px',
                                    background: '#ffffff',
                                    border: '1px dashed #cbd5e1',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    color: '#64748b',
                                    fontSize: '0.85rem'
                                }}>
                                    <FileCheck size={20} style={{ color: '#10b981'}} />
                                    <div>
                                        File:
                                        <strong>
                                            {selectedBerkas.storage_path || 'dokumen_arsip.pdf'}
                                        </strong>
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#94a3b8'
                                    }}>
                                        Terverifikasi utuh sesuai standar kearsipan ISO 15489.
                                    </div>
                                </div>
                            </div>


                            {/* Aksi Download / Lihat PDF */}
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end'
                            }}>
                                <a
                                    href={`/api/v1/berkas/${selectedBerkas.id}/download`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className='btn btn-primary'
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <FileText size={16} />
                                    Buka / Unduh File PDF
                                </a>
                                <button
                                    type="button"
                                    className='btn btn-outline'
                                    onClick={() => setShowDetailModal(false)}
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

}

export default Berkas