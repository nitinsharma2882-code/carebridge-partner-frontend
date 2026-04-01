import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL ||
             'https://carebridge-backend-dns0.onrender.com'

export const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Auto-attach JWT token
api.interceptors.request.use((cfg) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cb_assistant_token')
    if (token) cfg.headers.Authorization = `Bearer ${token}`
  }
  return cfg
})

// Auto-logout on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('cb_assistant_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────
export const AuthAPI = {
  sendOTP: (phone: string) =>
    api.post('/api/auth/send-otp', { phone, role: 'assistant' }),

  verifyOTP: (phone: string, otp: string) =>
    api.post('/api/auth/verify-otp', { phone, otp, role: 'assistant' }),
}

// ── Assistant ─────────────────────────────────────────────
export const AssistantAPI = {
  getProfile: () =>
    api.get('/api/assistant/profile'),

  updateProfile: (data: any) =>
    api.patch('/api/assistant/profile', data),

  toggleOnline: (isOnline: boolean) =>
    api.post('/api/assistant/status', { isOnline }),

  getEarnings: (period: 'daily' | 'weekly' | 'monthly') =>
    api.get(`/api/assistant/earnings?period=${period}`),

  getTransactions: () =>
    api.get('/api/assistant/transactions'),

  withdrawEarnings: (amount: number) =>
    api.post('/api/assistant/withdraw', { amount }),

  getNotifications: () =>
    api.get('/api/assistant/notifications'),

  markNotificationRead: (id: string) =>
    api.patch(`/api/assistant/notifications/${id}/read`),

  markAllNotificationsRead: () =>
    api.patch('/api/assistant/notifications/read-all'),

  acceptBooking: (id: string) =>
    api.post(`/api/bookings/${id}/accept`),

  rejectBooking: (id: string) =>
    api.post(`/api/bookings/${id}/reject`),

  completeBooking: (id: string) =>
    api.post(`/api/bookings/${id}/complete`),

  getEmergencyContacts: () =>
    api.get('/api/assistant/emergency-contacts'),

  addEmergencyContact: (data: {
    name: string; phone: string; relation: string
  }) => api.post('/api/assistant/emergency-contacts', data),

  removeEmergencyContact: (id: string) =>
    api.delete(`/api/assistant/emergency-contacts/${id}`),

  triggerSOS: (lat: number, lng: number) =>
    api.post('/api/sos/trigger', { lat, lng, role: 'assistant' }),
}