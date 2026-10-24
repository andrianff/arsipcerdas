import React, { useState } from 'react'
import { searchService } from '../services/api'
import {
    Search,
    Sparkles,
    FileText,
    Calendar,
    Shield,
    MapPin,
    AlertCircle,
    Clock
} from 'lucide-react'

export function Pencarian() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const [error, setError] = useState('')

    // Contoh kueri siap pakai untuk memudahkan demo
    const quickQueries = [
        'Surat Keputusan Pengangkatan',
        'Laporan Pertanggungjawaban Keuangan',
        'Perjanjian Kerjasama Vendor',
        'Dokumen Pengadaan Barang dan Jasa'
    ]

    const handleSearch = async (e) => {
        if (e) e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        setError('')
        setHasSearched(true)

        try {
            // Panggil endpoint /api/v1/search dengan limit 10 dan threshold relevansi 0.3
            const response = await searchService.search(query, 10, 0.3)
            setResults(response.data || response || [])
        } catch (err) {
            console.error('Error saat pencarian', err)
            setError(
                err.response?.data?.detail || 'Gagal melakukan pencarian semantik. Pastikan service backend dan AI aktif.'
            )
        } finally {
            setLoading(false)
        }
    }

    const handleQuickClick = (text) => {
        setQuery(text)
        // Jalankan pencarian langsung dengan kueri contoh
        runDirectSearch(text)
    }

    const runDirectSearch = async (searchText) => {
        setLoading(true)
        setError('')
        setHasSearched(true)
        try {
            const response = await searchService.search(searchText, 10, 0.3)
            setResults(response.data || response || [])
        } catch (err) {
            setError('Gagal melakukan pencarian.')
        } finally {
            setLoading(false)
        }
    }

    const getSecurityBadge = (level) => {
        switch (level) {
            case 'sangat_rahasia':
                return <span>Sangat Rahasia</span>
            case 'rahasia':
                return <span>Rahasia</span>
            case 'terbatas':
                return <span>Terbatas</span>
            default:
                return <span>Biasa</span>
        }
    }

    return (
        <div>
            {/* Header Pencarian */}
            <div style={{
                marginBottom: '24px'
            }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <Sparkles
                        style={{
                            color: '#2563eb'
                        }}
                        size={24}
                    />
                    Temu Balik Semantik AI
                </h1>
                <p style={{
                    color: '#64748b',
                    fontSize: '0.9rem',
                    margin: 0
                }}>
                    Pencarian cerdas berbasis makna konteks teks menggunakan AI Embedding. Temukan arsip meskipun kata kunci tidak sama persis.
                </p>
            </div>

            {/* Kotak Input Pencarian */}
            <div
                className='card'
                style={{
                    marginBottom: '24px'
                }}
            >
                <form onSubmit={handleSearch}>
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
                                placeholder='Ketik topik, maksud surat, atau kata kunci pencarian...'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                style={{
                                    paddingLeft: '40px',
                                    fontSize: '1rem'
                                }}
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
                        <button
                            type="submit"
                            className='btn btn-primary'
                            disabled={loading || !query.trim()}
                            style={{
                                padding: '10px 20px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {loading ? 'Mencari...' : 'Cari Arsip'}
                        </button>
                    </div>
                </form>

                {/* Quick query chips */}
                <div style={{
                    marginTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap'
                }}>
                    <span style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        fontWeight: '500'
                    }}>
                        Contoh Kueri:
                    </span>
                    {quickQueries.map((item, idx) => (
                        <button
                            key={idx}
                            type="button"
                            className='btn btn-outline'
                            style={{
                                fontSize: '0.75rem',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                background: '#f8fafc'
                            }}
                            onClick={() => handleQuickClick(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifikasi Error */}
            {error && (
                <div style={{
                    padding: '12px 16px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#ef4444',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem'
                }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Hasil Pencarian */}
            <div>
                {loading ? (
                    <div
                        className='card'
                        style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#64748b'
                        }}
                    >
                        <Sparkles
                            className='spin'
                            size={32}
                            style={{
                                color: '#2563eb',
                                marginBottom: '12px'
                            }}
                        />
                        <p style={{
                            margin: 0,
                            fontWeight: '600'
                        }}>
                            AI sedang menganalisis kemiripan semantik arsip...
                        </p>
                    </div>
                ) : hasSearched && results.length === 0 ? (
                    <div
                        className='card'
                        style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#64748b'
                        }}
                    >
                        <FileText
                            size={40}
                            style={{
                                color: '#cbd5e1',
                                marginBottom: '12px'
                            }}
                        />
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: '#334155',
                            marginBottom: '4px'
                        }}>
                            Tidak Ada Berkas Ditemukan
                        </h3>
                        <p style={{
                            fontSize: '0.85rem',
                            margin: 0
                        }}>
                            Coba gunakan instilah kata lain atau periksa kembali kata kunci pencarian Anda.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        {results.map((berkas) => {
                            // Hitung persentase skor kemiripan
                            const scorePercent = berkas.similarity_score ? Math.round(berkas.similarity_score * 100) : 0

                            return (
                                <div
                                    key={berkas.id}
                                    className='card'
                                    style={{
                                        margin: 0
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '10px'
                                    }}>
                                        <div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '4px'
                                            }}>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: '700',
                                                    color: '#2563eb'
                                                }}>
                                                    {berkas.nomor_berkas}
                                                </span>
                                                {getSecurityBadge(berkas.tingkat_keamanan)}
                                            </div>
                                            <h3 style={{
                                                fontSize: '1.05rem',
                                                fontWeight: '700',
                                                color: '#0f172a',
                                                margin: 0
                                            }}>
                                                {berkas.nama_berkas}
                                            </h3>
                                        </div>

                                        {/* Skor Relevansi AI */}
                                        {berkas.similarity_score !== undefined && (
                                            <div style={{
                                                textAlign: 'right',
                                                background: '#eff6ff',
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid #dbeafe'
                                            }}>
                                                <div style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: '600',
                                                    color: '#1e40af'
                                                }}>
                                                    Relevansi Semantik
                                                </div>
                                                <div style={{
                                                    fontSize: '1rem',
                                                    fontWeight: '800',
                                                    color: '#2563eb'
                                                }}>
                                                    {scorePercent}%
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Uraian Informasi Berkas */}
                                    <p style={{
                                        fontSize: '0.85rem',
                                        color: '#475569',
                                        marginBottom: '14px',
                                        lineHeight: '1.5'
                                    }}>
                                        {berkas.uraian_informasi || 'Tidak ada keterangan tambahan.'}
                                    </p>

                                    {/* Metadata Chips Footer */}
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '16px',
                                        paddingTop: '12px',
                                        borderTop: '1px solid #f1f5f9',
                                        fontSize: '0.8rem',
                                        color: '#64748b'
                                    }}>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Calendar size={14} />
                                            Tahun: {berkas.tahun_cipta}
                                        </span>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Clock size={14} />
                                            Status: {berkas.status_retensi}
                                        </span>
                                        {berkas.lokasi_simpan && (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <MapPin size={14} />
                                                Lokasi: {berkas.lokasi_simpan}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
                }
            </div>
        </div>
    )
}

export default Pencarian