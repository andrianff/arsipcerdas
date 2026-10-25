import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Berkas from './components/Berkas'
import Pencarian from './components/Pencarian'
import Login from './components/Login'

function App() {
  // Cek apakah user sudah login di localStorage atau gunakan user default demo
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : { username: 'arsiparis', role: 'arsiparis', full_name: 'Arsiparis Ahli' }
  })

  // State menu aktif: dashboard, pencarian, berkas, jra, penyusutan
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Jika belum login, tampilkan halaman login
  if (!user) {
    return <Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
  }

  // Render halaman sesuai menu aktif di sidebar
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'berkas':
        return <Berkas />
      case 'pencarian':
        return <Pencarian />
      case 'jra':
        return (
          <div className='card'>
            <h2>
              Jadwal Retensi Arsip (JRA)
            </h2>
            <p style={{
              color: '#64748b',
              marginTop: '8px'
            }}>
              Modul penentuan durasi retensi aktif & inaktif serta putusan akhir arsip (Segera hadir).
            </p>
          </div>
        )
      case 'penyusutan':
        return (
          <div className='card'>
            <h2>
              Penyusutan Arsip & Pemusnahan Arsip
            </h2>
            <p style={{
              color: '#64748b',
              marginTop: '8px'
            }}>
              Modul berita acara pemusnahan dan penetapan arsip permanen sesuai ISO 15489 (Segera hadir).
            </p>
          </div>
        )
      default:
        return <Dashboard setActiveTab={setActiveTab} />
    }
  }

  return (
    <div className='app-layout'>
      {/* Sidebar Navigari Kiri */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Area Konten Utama */}
      <div className='main-wrapper'>
        {/* Top Navbar */}
        <header className='top-navbar'>
          <div style={{
            fontSize: '0.9rem',
            color: '#64748b',
            fontWeight: '500'
          }}>
            ArsipCerdas &bull;
            <strong style={{
              color: '#0f172a'
            }}>
              {activeTab.toUpperCase()}
            </strong>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span
              className='badge badge-aktif'
              style={{
                padding: '4px 10px'
              }}
            >
              Sistem Aktif (ISO 15489)
            </span>
          </div>
        </header>

        {/* Isi Halaman yang Dipilih */}
        <main className='page-content'>
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App