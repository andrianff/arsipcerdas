import axios from 'axios'

const API_BASE_URL = '/api/v1'

const api = axios.create({
    baseURL: API_BASE_URL,
})

// Interceptor untuk menyisipkan Token JWT ke Authorization Header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Layanan Autentikasi
export const authService = {
    login: async (username, password) => {
        const formData = new URLSearchParams()
        formData.append('username', username)
        formData.append('password', password)
        const response = await api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        })
        return response.data
    },
    getMe: async () => {
        const response = await api.get('/auth/me')
        return response.data
    },
}

// Layanan Berkas & Dokumen
export const berkasService = {
    list: async (params = {}) => {
        const response = await api.get('/berkas/', { params })
        return response.data
    },
    getAll: async (params = {}) => {
        const response = await api.get('/berkas/', { params })
        return response.data
    },
    getDetail: async (id) => {
        const response = await api.get(`/berkas/${id}`)
        return response.data
    },
    getItems: async (id) => {
        // Pada backend ini, satu berkas mewakili dokumen PDF dengan potongan chunk
        const response = await api.get(`/berkas/${id}`)
        return [response.data]
    },
    upload: async (formData) => {
        const response = await api.post('/berkas/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return response.data
    },
    create: async (formData) => {
        // Alias untuk upload berkas baru
        const response = await api.post('/berkas/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return response.data
    },
    uploadItem: async (id, formData) => {
        // Upload item berkas
        const response = await api.post('/berkas/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return response.data
    },
    downloadUrl: (id) => `/api/v1/berkas/${id}/download`,
    verifyIntegrity: async (id) => {
        const response = await api.post(`/berkas/${id}/verify-integrity`)
        return response.data
    },
    getAuditLogs: async (id) => {
        const response = await api.get(`/berkas/${id}/audit-logs`)
        return response.data
    }
}

// Layanan Jadwal Retensi Arsip (JRA)
export const jraService = {
    list: async () => {
        const response = await api.get('/jadwal-retensi/')
        return response.data
    },
    getAll: async () => {
        const response = await api.get('/jadwal-retensi/')
        return response.data
    },
    create: async (data) => {
        const response = await api.post('/jadwal-retensi/', data)
        return response.data
    },
}

// Alias klasifikasiService -> jraService untuk kompatibilitas nama
export const klasifikasiService = jraService

// Layanan Pencarian Cerdas (Hybrid AI + Keyword)
export const searchService = {
    search: async (query, limit = 10, filters = {}) => {
        const response = await api.post('/pencarian/', {
            query,
            limit,
            ...filters,
        })
        return response.data
    },
}

// Layanan Penyusutan & Retensi
export const penyusutanService = {
    getUsulMusnah: async () => {
        const response = await api.get('/penyusutan/usul-musnah')
        return response.data
    },
    eksekusiMusnah: async (data) => {
        const response = await api.post('/penyusutan/eksekusi-musnah', data)
        return response.data
    },
}

export default api