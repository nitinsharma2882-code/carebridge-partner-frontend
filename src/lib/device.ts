const DEVICE_ID_KEY   = 'cb_assistant_device_id'
const SESSION_DEVICE_KEY = 'cb_assistant_session_device'

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

export const getDeviceId = getOrCreateDeviceId

export function registerSession(deviceId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_DEVICE_KEY, deviceId)
}

export function isSessionValid(): boolean {
  if (typeof window === 'undefined') return true
  const sessionDevice = localStorage.getItem(SESSION_DEVICE_KEY)
  const currentDevice = localStorage.getItem(DEVICE_ID_KEY)
  if (!sessionDevice || !currentDevice) return true
  return sessionDevice === currentDevice
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_DEVICE_KEY)
}