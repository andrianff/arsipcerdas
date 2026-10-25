import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Berkas from './components/Berkas'
import Pencarian from './components/Pencarian'
import { Bell, Search } from 'lucide-react'

function App() {
  // Tab aktif sesuai struktur menu Figma (default: dashboard atau record_explorer)
  const [activeTab, setActiveTab] = useState('record_explorer')

  // Render halaman berdasarkan tab yang dipilih di sidebar
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />
      case 'record_explorer':
        return <Berkas />
      case 'ingestion':
        return (
          <div className="card">
            <h2 className="card-title">Ingestion & Upload Berkas</h2>
            <p style={{ color: '#64748B', marginTop: '8px' }}>
              Modul OCR, ekstraksi metadata otomatis, dan integrasi berkas digital baru.
            </p>
          </div>
        )
      case 'audit_kepatuhan':
        return (
          <div className="card">
            <h2 className="card-title">Audit Trail & Kepatuhan ISO 15489</h2>
            <p style={{ color: '#64748B', marginTop: '8px' }}>
              Pencatatan log aktivitas, hash integritas SHA-256, dan pelaporan kepatuhan arsip.
            </p>
          </div>
        )
      case 'pengaturan_sistem':
        return (
          <div className="card">
            <h2 className="card-title">Pengaturan Sistem & Penyimpanan</h2>
            <p style={{ color: '#64748B', marginTop: '8px' }}>
              Konfigurasi kapasitas penyimpanan cloud, kuota, hak akses, dan preferensi EDRMS.
            </p>
          </div>
        )
      default:
        return <Dashboard setActiveTab={setActiveTab} />
    }
  }

  return (
    <div className="app-layout">
      {/* 1. Sidebar Navigasi Kiri */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Area Konten Utama */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <header className="top-navbar">
          {/* Breadcrumb / Label Halaman */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span style={{ color: '#64748B' }}>ArsipCerdas</span>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <strong style={{ color: '#0F172A', textTransform: 'capitalize' }}>
              {activeTab.replace('_', ' ')}
            </strong>
          </div>

          {/* Sisi Kanan: Global Search & Notifikasi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="topbar-search">
              <Search size={16} style={{ color: '#94A3B8' }} />
              <input type="text" placeholder="Cari berkas, nomor naskah..." />
              <kbd>⌘K</kbd>
            </div>

            <button className="topbar-action-btn" title="Notifikasi">
              <Bell size={18} />
              <span className="notification-dot" />
            </button>

            {/* Avatar Profil Pengguna */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
              title="Ahmad Fauzi (Arsiparis)"
            >
              A
            </div>
          </div>
        </header>

        {/* 3. Konten Halaman */}
        <main className="page-content">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App