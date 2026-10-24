import React from 'react'
import {
    LayoutDashboard,
    Search,
    FolderOpen,
    Clock,
    Trash2,
    LogOut,
    ShieldCheck,
    UserCheck
} from 'lucide-react'

export function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'pencarian', label: 'Pencarian Cerdas AI', icon: Search },
        { id: 'berkas', label: 'Daftar Berkas', icon: FolderOpen },
        { id: 'jra', label: 'Jadwal Retensi (JRA)', icon: Clock },
        { id: 'penyusutan', label: 'Penyusutan Arsip', icon: Trash2 },
    ]

    return (
        <aside className="sidebar">
            {/* Header Logo */}
            <div className="sidebar-header">
                <div className="sidebar-logo-icon">
                    <ShieldCheck size={22} />
                </div>
                <div className="sidebar-logo-text">
                    <h2>
                        ArsipCerdas
                    </h2>
                    <span>
                        EDRMS & AI Retrieval
                    </span>
                </div>
            </div>

            {/* Navigasi Menu */}
            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <Icon size={18} />
                            <span>
                                {item.label}
                            </span>
                        </button>
                    )
                })}
            </nav>

            {/* Profil User & Logout */}
            <div className="sidebar-footer">
                <div className="user-card">
                    <div className="user-info">
                        <span className="user-name">
                            <UserCheck
                                size={14}
                                style={{
                                    verticalAlign: 'middle',
                                    marginRight: '4px',
                                    color: '#2563eb'
                                }}
                            />
                            {user?.full_name || user?.username || 'Pengguna'}
                        </span>
                        <span className="user-role-badge">
                            Role: {user?.role ? user.role.toUpperCase() : 'USER'}
                        </span>
                    </div>
                    <button
                        onClick={onLogout}
                        title="Keluar"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')} 
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar