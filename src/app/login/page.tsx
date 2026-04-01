'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { AuthAPI } from '@/lib/api'
import { getOrCreateDeviceId } from '@/lib/device'

// ── Popup ─────────────────────────────────────────────────────────────────────
function PopupLayer() {
  const { popup, closePopup } = useStore()
  if (!popup) return null
  const iconBg: Record<string, string> = {
    success: '#DCFCE7', warning: '#FEF3C7',
    error: '#FEE2E2', confirm: '#EDE9FE', info: '#EDFAF7',
  }
  const iconDefault: Record<string, string> = {
    success: '✅', warning: '⚠️', error: '❌', confirm: '❓', info: 'ℹ️',
  }
  const btnBg: Record<string, string> = {
    primary: '#0D9488', secondary: '#F1F5F9',
    danger: '#DC2626', warning: '#D97706',
  }
  const btnColor: Record<string, string> = {
    primary: '#fff', secondary: '#475569',
    danger: '#fff', warning: '#fff',
  }
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) closePopup() }}
      style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '22px', width: '100%', overflow: 'hidden', animation: 'popIn 0.25s cubic-bezier(0.34,1.3,0.64,1) forwards' }}>
        <div style={{ padding: '28px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: iconBg[popup.type], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '12px' }}>
            {popup.icon || iconDefault[popup.type]}
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', textAlign: 'center', letterSpacing: '-0.3px', lineHeight: 1.3, margin: 0 }}>{popup.title}</h2>
        </div>
        <p style={{ fontSize: '14px', color: '#64748B', textAlign: 'center', padding: '8px 22px 18px', lineHeight: 1.65 }}
          dangerouslySetInnerHTML={{ __html: popup.body.replace(/\n/g, '<br/>') }} />
        <div style={{ display: 'flex', gap: '10px', padding: '0 18px 22px' }}>
          {popup.actions.map((a, i) => (
            <button key={i} onClick={a.fn} style={{ flex: 1, padding: '14px', borderRadius: '14px', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', background: btnBg[a.variant], color: btnColor[a.variant] }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          from { transform: scale(0.88); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [phone,      setPhone]      = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [loading,    setLoading]    = useState(false)
  const { setPhone: storePhone, showPopup, closePopup } = useStore()
  const router = useRouter()

  // Ensure device ID exists as early as possible
  useEffect(() => { getOrCreateDeviceId() }, [])

  const handleSend = async () => {
    const clean = phone.replace(/\s/g, '')

    // Validation
    if (!clean || clean.trim() === '') {
      setPhoneError('Please enter your mobile number')
      return
    }
    if (clean.replace(/\D/g, '').length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number')
      return
    }
    if (clean.replace(/\D/g, '').length > 10) {
      setPhoneError('Mobile number cannot be more than 10 digits')
      return
    }
    setPhoneError('')

    setLoading(true)
    try {
      // Pass deviceId so backend can invalidate previous sessions
      const deviceId = getOrCreateDeviceId()
      await AuthAPI.sendOTP(clean, deviceId)
      storePhone(clean)
      router.push('/otp')
    } catch {
      // Prototype fallback
      storePhone(clean)
      router.push('/otp')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '390px', height: '844px', borderRadius: '48px', overflow: 'hidden', position: 'relative', flexShrink: 0, boxShadow: '0 0 0 10px #1e293b, 0 0 0 12px #334155, 0 40px 80px rgba(0,0,0,0.8)', background: '#fff' }}>

        {/* Notch */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '126px', height: '34px', background: '#111827', borderRadius: '0 0 20px 20px', zIndex: 50 }} />

        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#fff', overflowY: 'auto' }}>

          {/* Status bar */}
          <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 0', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>9:41</span>
          </div>

          {/* Content */}
          <div style={{ padding: '12px 28px 0', flex: 1 }}>

            {/* Icon */}
            <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#EDFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#0D9488" fillOpacity="0.2" stroke="#0D9488" strokeWidth="1.5"/>
                <path d="M9 12l2 2 4-4" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.7px', margin: 0 }}>Welcome back</h1>
            <p style={{ fontSize: '15px', color: '#64748B', marginTop: '8px', lineHeight: 1.55 }}>
              Sign in to your CareBridge partner account
            </p>

            {/* Phone input */}
            <div style={{ marginTop: '32px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', fontWeight: 700, color: '#64748B' }}>
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); if (phoneError) setPhoneError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  maxLength={10}
                  style={{
                    width: '100%', paddingLeft: '60px', paddingRight: '16px',
                    paddingTop: '15px', paddingBottom: '15px',
                    background: phoneError ? '#FEF2F2' : '#F1F5F9',
                    border: `1.5px solid ${phoneError ? '#DC2626' : '#E2E8F0'}`,
                    borderRadius: '12px', fontSize: '16px', color: '#0F172A',
                    outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
                  }}
                  onFocus={e => { if (!phoneError) { e.target.style.borderColor = '#0D9488'; e.target.style.background = '#EDFAF7' } }}
                  onBlur={e =>  { if (!phoneError) { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F1F5F9' } }}
                />
              </div>

              {phoneError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', padding: '8px 12px', background: '#FEE2E2', borderRadius: '10px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626' }}>{phoneError}</span>
                </div>
              )}
            </div>

            {/* Send OTP button */}
            <button onClick={handleSend} disabled={loading}
              style={{ width: '100%', padding: '16px', background: loading ? '#94A3B8' : '#0D9488', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: '20px', transition: 'opacity 0.15s' }}>
              {loading ? 'Sending…' : 'Send OTP →'}
            </button>

            {/* Terms */}
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: '20px', lineHeight: 1.7 }}>
              By continuing you agree to our{' '}
              <span onClick={() => router.push('/terms')} style={{ color: '#0D9488', fontWeight: 600, cursor: 'pointer' }}>Terms of Service</span>
              {' '}&amp;{' '}
              <span onClick={() => router.push('/privacy')} style={{ color: '#0D9488', fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>
            </p>
          </div>
        </div>

        <PopupLayer />
      </div>
    </div>
  )
}