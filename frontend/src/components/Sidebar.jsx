import React from 'react'
import {
    LayoutGrid,
    Archive,
    Upload,
    Shield,
    Settings,
    ArrowRight
} from 'lucide-react'

export function Sidebar({ activeTab, setActiveTab }) {
    // Menu Ruang Kerja
    const workspaceMenu = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutGrid,
        },
        {
            id: 'record_explorer',
            label: 'Record Explorer',
            icon: Archive,
        },
        {
            id: 'ingestion',
            label: 'Ingestion',
            icon: Upload,
            badge: '3',
        },
        {
            id: 'audit_kepatuhan',
            label: 'Audit & Kepatuhan',
            icon: Shield,
        },
    ]

    // Menu Administrasi
    const adminMenu = [
        {
            id: 'pengaturan_sistem',
            label: 'Pengaturan Sistem',
            icon: Settings,
        },
    ]

    const renderMenuItem = (item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id

        return (
            <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: isActive ? '1px solid #4f46e5' : '1px solid transparent',
                    backgroundColor: isActive ? '0 0 0 1px #4f46e5, 0 4px 12px rgba(79, 70, 229, 0.25)' : 'none',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    marginBottom: '4px'
                }}
                onMouseEnter={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#111827'
                        e.currentTarget.style.color = '#f1f5f9'
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#94a3b8'
                    }
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Icon
                        size={18}
                        style={{
                            color: isActive ? '#ffffff' : '#94a3b8'
                        }}
                    />
                    <span>{item.label}</span>
                </div>

                {item.badge && (
                    <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {item.badge}
                    </span>
                )}
            </button>
        )
    }

    return (
        <aside style={{
            width: '260px',
            backgroundColor: '#0b1120',
            borderRight: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            flexShrink: 0,
            boxSizing: 'border-box'
        }}>
            {/* Brand Header */}
            <div style={{
                padding: '24px 20px 20px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                {/* Brand Icon SVG */}
                <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
                    flexShrink: 0,
                }}>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M4 6h16" />
                        <path d="M4 12h10" />
                        <path d="M4 18h14" />
                    </svg>
                </div>

                <div>
                    <h2 style={{
                        fontSize: '1.05rem',
                        fontWeight: '700',
                        color: '#ffffff',
                        margin: 0,
                        letterSpacing: '-0.02em'
                    }}>
                        ArsipCerdas
                    </h2>
                    <span style={{
                        fontSize: '0.65rem',
                        fontWeight: '400',
                        color: '#94a3b8',
                        letterSpacing: '0.06em',
                        display: 'block',
                        marginTop: '2px'
                    }}>
                        INTELLIGENT EDRMS
                    </span>
                </div>
            </div>

            {/* Navigasi Utama */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px 14px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Section: RUANG KERJA */}
                <div style={{
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    letterSpacing: '0.08em',
                    color: '#64748b',
                    padding: '12px 10px 8px 10px',
                }}>
                    RUANG KERJA
                </div>
                <nav style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {workspaceMenu.map(renderMenuItem)}
                </nav>

                {/* Section: ADMINISTRASI */}
                <div style={{
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    letterSpacing: '0.08em',
                    color: '#64748b',
                    padding: '24px 10px 8px 10px',
                }}>
                    ADMINISTRASI
                </div>
                <nav style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {adminMenu.map(renderMenuItem)}
                </nav>
            </div>

            {/* Kartu Kapasitas Penyimpanan */}
            <div style={{
                padding: '13px 13px 13px 13px'
            }}>
                <div style={{
                    backgroundColor: '#121a2b',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    padding: '13px 13px 13px 13px'
                }}>
                    {/* Baris Atas */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                width: '29px',
                                height: '29px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(99, 102, 241, 13%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Archive
                                    size={17}
                                    style={{
                                        stroke: '#a5b4fc',
                                    }}
                                />
                            </div>
                            <span style={{
                                fontSize: '0.8rem',
                                fontWeight: '400',
                                color: '#cbd5e1'
                            }}>
                                Penyimpanan
                            </span>
                        </div>
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: '#ffffff'
                        }}>
                            72%
                        </span>
                    </div>

                    {/* Progress Bar Track */}
                    <div style={{
                        height: '4px',
                        backgroundColor: '#334155',
                        borderRadius: '999px',
                        overflow: 'hidden',
                        marginTop: '10px'
                    }}
                    >
                        <div style={{
                            width: '72%',
                            height: '100%',
                            background: '#6366f1',
                        }} />
                    </div>

                    {/* Keterangan Ukuran */}
                    <div style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                    }}>
                        720 GB dari 1 TB digunakan
                    </div>

                    {/* Link Kelola Penyimpanan */}
                    <a
                        href="#kelola-storage"
                        onClick={(e) => {
                            e.preventDefault()
                            setActiveTab('pengaturan_sistem')
                        }}
                        style={{
                            fontSize: '0.74rem',
                            fontWeight: '600',
                            color: '#a5b4fc',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'color 0.15s ease'
                        }}
                    >
                        <span>Kelola Penyimpanan</span>
                        <ArrowRight size={13} />
                    </a>
                </div>
            </div>

            {/* Footer Status Operasional */}
            <div style={{
                padding: '17px 7px 0px 7px',
                borderTop: '1px solid #151f32',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    flexShrink: 0,
                }} />
                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <span style={{
                        fontSize: '0.74rem',
                        fontWeight: '700',
                        color: '#cbd5e1',
                        lineHeight: 1.2,
                    }}>
                        Sistem operasional
                    </span>
                    <span style={{
                        fontSize: '0.68rem',
                        color: '#64748b',
                        marginTop: '2px'
                    }}>
                        Semua layanan normal
                    </span>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar