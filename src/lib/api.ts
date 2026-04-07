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

// ── Auth ──────────────────────────────────────────────────────
export const AuthAPI = {
  sendOTP: (phone: string) =>
    api.post('/api/auth/send-otp', { phone }),

  // role='partner' is required by backend
  // serviceType tells backend what kind of partner this is
  verifyOTP: (phone: string, otp: string, serviceType = 'general') =>
    api.post('/api/auth/verify-otp', {
      phone,
      otp,
      role: 'partner',
      serviceType,
    }),
}

// ── Bookings ──────────────────────────────────────────────────
export const BookingAPI = {
  // Get requests visible to this partner (filtered by serviceType)
  getRequests: () =>
    api.get('/api/assistants/requests'),

  // Get bookings assigned to this partner
  getMyBookings: () =>
    api.get('/api/bookings'),

  accept: (id: string) =>
    api.post(`/api/bookings/${id}/accept`),

  reject: (id: string) =>
    api.post(`/api/bookings/${id}/reject`),

  start: (id: string) =>
    api.post(`/api/bookings/${id}/start`),

  complete: (id: string) =>
    api.post(`/api/bookings/${id}/complete`),

  escalate: (id: string, note = 'Partner cannot reach customer') =>
    api.post(`/api/bookings/${id}/escalate`, { note }),
}

// ── Assistant ─────────────────────────────────────────────────
export const AssistantAPI = {
  getProfile: () =>
    api.get('/api/users/me'),

  updateProfile: (data: Record<string, unknown>) =>
    api.put('/api/users/me', data),

  // Toggle online/offline — syncs to backend
  setAvailability: (isOnline: boolean) =>
    api.put('/api/assistants/availability', { isOnline }),

  // Get earnings with daily/weekly/monthly breakdown
  getEarnings: () =>
    api.get('/api/assistants/earnings'),

  // Request a withdrawal
  withdraw: (amount: number, cardLast4?: string) =>
    api.post('/api/assistants/withdraw', { amount, cardLast4 }),
}