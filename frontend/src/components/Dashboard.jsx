import React, { useState, useEffect } from 'react'
import { berkasService, penyusutanService } from '../services/api'
import {
    FolderCheck,
    Archive,
    AlertTriangle,
    Files,
    Search,
    Upload,
    Clock,
    ArrowRight
} from 'lucide-react'

export function Dashboard({ setActiveTab }) {
    const [stats, setStats] = useState({
        total: 0,
        aktif: 0,
        inaktif: 0,
        usulMusnah: 0
    })
    const [recentBerkas, setRecentBerkas] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const berkasRes = await berkasService.getAll({ limit: 50 })
            const berkasList = berkasRes.data || []

            let usulMusnahCount = 0
            try {
                const usulRes = await penyusutanService.getUsulMusnah()
                usulMusnahCount = usulRes.length || 0
            } catch (e) {
                console.warn('Gagal memuat data usul musnah', e)
            }

            const aktifCount = berkasList.filter((b) => b.status_retensi === 'aktif').length
            const inaktifCount = berkasList.filter((b) => b.status_retensi === 'inaktif').length

            setStats({
                total: berkasRes.total || berkasList.length,
                aktif: aktifCount,
                inaktif: inaktifCount,
                usulMusnah: usulMusnahCount
            })

            setRecentBerkas(berkasList.slice(0, 5))
        } catch (err) {
            console.error('Error fetching dashboard data:', err)
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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'aktif':
                return <span>Aktif</span>
            case 'inaktif':
                return <span>Inaktif</span>
            case 'usul_musnah':
                return <span>Musnah</span>
            default:
                return <span>{status}</span>
        }
    }

    return (
        <div>
            {/* Banner Selamat Datang */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                borderRadius: '16px',
                padding: '28px',
                color: '#ffffff',
                marginBottom: '24px'
            }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    marginBottom: '8px'
                }}>
                    Selamat Datang di ArsipCerdas EDRMS
                </h1>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                    maxWidth: '650px',
                    margin: 0
                }}>
                    Platform manajemen arsip dinamis & inaktif dengan pencarian semantik AI, otomatisasi jadwal retensi (JRA), dan kepatuhan penuh terhadap regulasi ANRI.
                </p>
            </div>

            {/* Kartu Statistik */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div
                        className="stat-icon"
                        style={{
                            background: '#eff6ff',
                            color: '#2563eb'
                        }}
                    >
                        <Files size={24} />
                    </div>
                    <div>
                        <div className="stat-val">
                            {loading ? '...' : stats.total}
                        </div>
                        <div className="stat-label">
                            Total Berkas Terdaftar
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div
                        className="stat-icon"
                        style={{
                            background: '#ecfdf5',
                            color: '#10b981'
                        }}>
                        <FolderCheck size={24} />
                    </div>
                    <div>
                        <div className="stat-val">
                            {loading ? '...' : stats.aktif}
                        </div>
                        <div className="stat-label">
                            Arsip Aktif
                        </div>
                    </div>
                </div>

                <div className='stat-card'>
                    <div
                        className='stat-icon'
                        style={{
                            background: '#fffbeb',
                            color: '#f59e0b'
                        }}>
                        <Archive size={24} />
                    </div>
                    <div>
                        <div className='stat-val'>
                            {loading ? '...' : stats.inaktif}
                        </div>
                        <div className='stat-label'>
                            Arsip Inaktif
                        </div>
                    </div>
                </div>

                <div className='stat-card'>
                    <div
                        className='stat-icon'
                        style={{
                            background: '#fef2f2',
                            color: '#ef4444'
                        }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <div className='stat-val'>
                            {loading ? '...' : stats.usulMusnah}
                        </div>
                        <div className='stat-label'>
                            Usul Musnah / Retensi
                        </div>
                    </div>
                </div>

                {/* Aksi Cepat */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <div
                        className='card'
                        style={{
                            cursor: 'pointer',
                            margin: 0
                        }}
                        onClick={() => setActiveTab && setActiveTab('pencarian')}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px'
                        }}>
                            <div style={{
                                padding: '8px',
                                background: '#f5f3ff',
                                color: '#8b5cf6',
                                borderRadius: '8px'
                            }}>
                                <Search size={20} />
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: '0.95rem',
                                    fontWeight: '700',
                                    margin: 0
                                }}>
                                    Temu Balik Semantik AI
                                </h3>
                                <p style={{
                                    fontSize: '0.8rem',
                                    color: '#64748b',
                                    margin: 0
                                }}>
                                    Cari dokumen dengan makna & konteks
                                </p>
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#2563eb',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                        }}>
                            Mulai Pencarian <ArrowRight size={14} />
                        </div>
                    </div>

                    <div
                        className='card'
                        style={{
                            cursor: 'pointer',
                            margin: 0
                        }}
                        onClick={() => setActiveTab && setActiveTab('berkas')}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px'
                        }}>
                            <div style={{
                                padding: '8px',
                                background: '#eff6ff',
                                color: '#2563eb',
                                borderRadius: '8px'
                            }}>
                                <Upload size={20} />
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: '0.95rem',
                                    fontWeight: '700',
                                    margin: 0
                                }}>
                                    Registrasi Berkas Baru
                                </h3>
                                <p style={{
                                    fontSize: '0.8rem',
                                    color: '#64748b',
                                    margin: 0
                                }}>
                                    Unggah file PDF dan set JRA otomatis
                                </p>
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#2563eb',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                        }}>
                            Unggah Berkas <ArrowRight size={14} />
                        </div>
                    </div>

                    <div
                        className='card'
                        style={{
                            cursor: 'pointer',
                            margin: 0
                        }}
                        onClick={() => setActiveTab && setActiveTab('penyusutan')}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px'
                        }}>
                            <div style={{
                                padding: '8px',
                                background: '#fffbeb',
                                color: '#f59e0b',
                                borderRadius: '8px'
                            }}>
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: '0.95rem',
                                    fontWeight: '700',
                                    margin: 0
                                }}>
                                    Tinjau Penyusutan
                                </h3>
                                <p style={{
                                    fontSize: '0.8rem',
                                    color: '#64748b',
                                    margin: 0
                                }}>
                                    Proses pemusnahan & cetak Berita Acara
                                </p>
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#2563eb',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                        }}>
                            Lihat Usul Musnah <ArrowRight size={14} />
                        </div>
                    </div>
                </div>

                {/* Tabel Berkas Terbaru */}
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-title'>
                            Berkas Terakhir Diunggah
                        </h2>
                        <button
                            className='btn btn-outline'
                            style={{
                                fontSize: '0.8rem',
                                padding: '6px 12px'
                            }}
                            onClick={() => setActiveTab && setActiveTab('berkas')}
                        >
                            Lihat Semua Berkas
                        </button>
                    </div>

                    {loading ? (
                        <p style={{
                            textAlign: 'center',
                            color: '#64748b',
                            padding: '24px'
                        }}>
                            Memuat data berkas...
                        </p>
                    ) : recentBerkas.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                            Belum ada berkas tersimpan di sistem.
                        </p>
                    ) : (
                        <div className='table-container'>
                            <table className='custom-table'>
                                <thead>
                                    <tr>
                                        <th>No. Berkas</th>
                                        <th>Uraian / Judul Berkas</th>
                                        <th>Tahun</th>
                                        <th>Keamanan</th>
                                        <th>Status Retensi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBerkas.map((b) => (
                                        <tr key={b.id}>
                                            <td style={{ fontWeight: '600', color: '#0f172a' }}>{b.nomor_berkas}</td>
                                            <td>{b.nama_berkas}</td>
                                            <td>{b.tahun_cipta}</td>
                                            <td>{getSecurityBadge(b.tingkat_keamanan)}</td>
                                            <td>{getStatusBadge(b.status_retensi)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard