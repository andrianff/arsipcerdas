import React, { useState } from 'react'
import { authService } from '../services/api'
import { ShieldCheck, Lock, User, AlertCircle, KeyRound } from 'lucide-react'

export function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const data = await authService.login(username, password)

            localStorage.setItem('token', data.access_token)
            const user = await authService.getMe()

            localStorage.setItem('user', JSON.stringify(user))
            onLoginSuccess(user)
        } catch (err) {
            setError(err.response?.data?.detail || 'Username atau password salah.')
        } finally {
            setLoading(false)
        }
    }

    // Helper untuk kemudahan pengujian akun demo
    const fillDemoAccount = (u, p) => {
        setUsername(u)
        setPassword(p)
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: '20px'
        }}>
            <div style={{
                background: '#ffffff',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '440px',
                padding: '40px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                {/* Header Logo */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '32px'
                }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        borderRadius: '14px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        marginBottom: '16px',
                        boxShadow: '0 10px 15px -3px rgba(37, 99, 245, 0.4)'
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        color: '#0f172a',
                        letterSpacing: '-0.02em'
                    }}>
                        ArsipCerdas EDRMS
                    </h1>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#64748b',
                        marginTop: '6px'
                    }}>
                        Sistem Kearsipan & Temu Balik Semantik Berbasis AI
                    </p>
                </div>

                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: '12px',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        marginBottom: '20px'
                    }}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <div style={{
                            position: 'relative'
                        }}>
                            <User size={18}
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '12px',
                                    color: '#94a3b8'
                                }} />
                            <input type="text" className="form-input"
                                style={{
                                    paddingLeft: '40px'
                                }}
                                placeholder="Masukkan username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required />
                        </div>
                    </div>

                    <div className="form-group"
                        style={{
                            marginTop: '16px'
                        }}>
                        <label>Kata Sandi</label>
                        <div style={{
                            position: 'relative'
                        }}>
                            <Lock size={18}
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '12px',
                                    color: '#94a3b8'
                                }} />
                            <input type="password"
                                className="form-input"
                                style={{
                                    paddingLeft: '40px'
                                }}
                                placeholder="*********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required />
                        </div>
                    </div>

                    <button type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            marginTop: '24px',
                            padding: '12px'
                        }}
                        disabled={loading}>
                        {loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
                    </button>

                    {/* Demo Credential Quick Selector */}
                    <div style={{
                        marginTop: '28px',
                        paddingTop: '20px',
                        borderTop: '1px solid #e2e8f0'
                    }}>
                        <p style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: '#64748b',
                            marginBottom: '10px',
                            textAlign: 'center'
                        }}>
                            <KeyRound size={14}
                                style={{
                                    verticalAlign: 'middle',
                                    marginRight: '4px'
                                }} />
                            Pilih Cepat Akun Demo:
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'center'
                        }}>
                            <button type="button"
                                className="btn btn-outline"
                                style={{
                                    fontSize: '0.75rem',
                                    padding: '6px 10px'
                                }}
                                onClick={() => fillDemoAccount('admin', 'admin123')}
                            >
                                Admin
                            </button>
                            <button type="button"
                                className="btn btn-outline"
                                style={{
                                    fontSize: '0.75rem',
                                    padding: '6px 10px'
                                }}
                                onClick={() => fillDemoAccount('arsiparis', 'arsiparis123')}
                            >
                                Arsiparis
                            </button>
                            <button type="button"
                                className="btn btn-outline"
                                style={{
                                    fontSize: '0.75rem',
                                    padding: '6px 10px'
                                }}
                                onClick={() => fillDemoAccount('pegawai', 'pegawai123')}
                            >
                                Pegawai
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login;