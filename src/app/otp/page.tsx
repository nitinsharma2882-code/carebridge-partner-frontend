'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { AuthAPI } from '@/lib/api'

// ── Reusable inline popup ─────────────────────────────────
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
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closePopup() }}
      style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: 'rgba(15,23,42,0.65)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '20px',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '22px',
        width: '100%', overflow: 'hidden',
      }}>
        <div style={{
          padding: '28px 20px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{
            width: '68px', height: '68px', borderRadius: '50%',
            background: iconBg[popup.type],
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '30px', marginBottom: '12px',
          }}>
            {popup.icon || iconDefault[popup.type]}
          </div>
          <h2 style={{
            fontSize: '18px', fontWeight: 800, color: '#0F172A',
            textAlign: 'center', letterSpacing: '-0.3px',
            lineHeight: 1.3, margin: 0,
          }}>
            {popup.title}
          </h2>
        </div>
        <p
          style={{
            fontSize: '14px', color: '#64748B', textAlign: 'center',
            padding: '8px 22px 18px', lineHeight: 1.65,
          }}
          dangerouslySetInnerHTML={{ __html: popup.body.replace(/\n/g, '<br/>') }}
        />
        <div style={{ display: 'flex', gap: '10px', padding: '0 18px 22px' }}>
          {popup.actions.map((a, i) => (
            <button key={i} onClick={a.fn} style={{
              flex: 1, padding: '14px', borderRadius: '14px',
              fontSize: '14px', fontWeight: 700, border: 'none',
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              background: btnBg[a.variant], color: btnColor[a.variant],
            }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main OTP Page ─────────────────────────────────────────
export default function OTPPage() {
  const [digits, setDigits]   = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resend, setResend]   = useState(42)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const { phone, setToken, setProfile, showPopup, closePopup } = useStore()
  const router = useRouter()

  // Resend countdown
  useEffect(() => {
    if (!phone) { router.replace('/login'); return }
    const t = setInterval(() => setResend(r => r > 0 ? r - 1 : 0), 1000)
    return () => clearInterval(t)
  }, [])

  const handleInput = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const d = [...digits]
    d[i] = val
    setDigits(d)
    if (val && i < 5) refs.current[i + 1]?.focus()
    if (d.every(x => x) && d.join('').length === 6) {
      verify(d.join(''))
    }
  }

  const handleBackspace = (i: number, key: string) => {
    if (key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const verify = async (code?: string) => {
    const otp = code || digits.join('')
    if (otp.length < 6) {
      showPopup({
        type: 'warning', title: 'Incomplete OTP',
        body: 'Please enter all 6 digits.',
        icon: '⚠️',
        actions: [{ label: 'OK', variant: 'primary', fn: closePopup }],
      })
      return
    }
    setLoading(true)
    try {
      const res = await AuthAPI.verifyOTP(phone, otp)
      setToken(res.data.token)
      if (res.data.profile) setProfile(res.data.profile)
      showPopup({
        type: 'success', title: 'Verified! ✅',
        body: `Welcome back!\nYou are now signed in.`,
        icon: '✅',
        actions: [{
          label: 'Go to Home', variant: 'primary',
          fn: () => { closePopup(); router.replace('/home') },
        }],
      })
    } catch {
      // Prototype mode — accept any 6-digit OTP
      setToken('demo_token_123')
      showPopup({
        type: 'success', title: 'Verified! ✅',
        body: 'Welcome back, Rajan Kumar!\nYou are now signed in.',
        icon: '✅',
        actions: [{
          label: 'Go to Home', variant: 'primary',
          fn: () => { closePopup(); router.replace('/home') },
        }],
      })
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    try { await AuthAPI.sendOTP(phone) } catch {}
    setResend(42)
    showPopup({
      type: 'info', title: 'OTP Resent',
      body: `A new code has been sent to +91 ${phone}`,
      icon: '📱',
      actions: [{ label: 'OK', variant: 'primary', fn: closePopup }],
    })
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0f1e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Mobile Frame */}
      <div style={{
        width: '390px', height: '844px', borderRadius: '48px',
        overflow: 'hidden', position: 'relative', flexShrink: 0,
        boxShadow: '0 0 0 10px #1e293b, 0 0 0 12px #334155, 0 40px 80px rgba(0,0,0,0.8)',
        background: '#fff',
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '126px', height: '34px',
          background: '#111827',
          borderRadius: '0 0 20px 20px', zIndex: 50,
        }} />

        {/* Screen */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          background: '#fff',
        }}>
          {/* Status bar */}
          <div style={{
            height: '50px', padding: '14px 20px 0',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexShrink: 0,
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>9:41</span>
          </div>

          {/* Header with back */}
          <div style={{
            height: '56px', background: '#fff',
            display: 'flex', alignItems: 'center',
            padding: '0 16px', gap: '10px',
            borderBottom: '1px solid #E2E8F0', flexShrink: 0,
          }}>
            <button
              onClick={() => router.back()}
              style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: '#F1F5F9', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <polyline points="15 18 9 12 15 6"
                  stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
            <span style={{
              flex: 1, textAlign: 'center', fontSize: '17px',
              fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px',
            }}>
              Verify Number
            </span>
            <div style={{ width: '38px' }} />
          </div>

          {/* Content */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '20px 28px',
          }}>
            {/* Icon */}
            <div style={{
              width: '56px', height: '56px', borderRadius: '18px',
              background: '#FEF3C7',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '20px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="3"
                  stroke="#D97706" strokeWidth="1.5"/>
                <path d="M2 8l10 6 10-6"
                  stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            <h1 style={{
              fontSize: '28px', fontWeight: 900, color: '#0F172A',
              letterSpacing: '-0.6px', margin: 0,
            }}>
              Check your SMS
            </h1>
            <p style={{
              fontSize: '15px', color: '#64748B',
              marginTop: '8px', lineHeight: 1.55,
            }}>
              6-digit code sent to{' '}
              <strong style={{ color: '#0F172A' }}>+91 {phone}</strong>
            </p>

            {/* OTP Boxes */}
            <div style={{
              display: 'flex', gap: '10px',
              justifyContent: 'center', margin: '28px 0 12px',
            }}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { refs.current[i] = el }}
                  value={d}
                  maxLength={1}
                  inputMode="numeric"
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => handleBackspace(i, e.key)}
                  style={{
                    width: '46px', height: '58px',
                    borderRadius: '12px', textAlign: 'center',
                    fontSize: '24px', fontWeight: 800,
                    fontFamily: 'monospace',
                    border: `2px solid ${d ? '#0D9488' : '#E2E8F0'}`,
                    background: d ? '#EDFAF7' : '#F8FAFC',
                    color: d ? '#0D9488' : '#0F172A',
                    outline: 'none', transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    if (!e.target.value) {
                      e.target.style.borderColor = '#0D9488'
                      e.target.style.background   = '#fff'
                    }
                  }}
                />
              ))}
            </div>

            {/* Resend */}
            <p style={{
              textAlign: 'center', fontSize: '13px',
              color: '#94A3B8', marginBottom: '24px',
            }}>
              {resend > 0 ? (
                <>Resend in <span style={{ color: '#0D9488', fontWeight: 700 }}>{resend}s</span></>
              ) : (
                <span
                  onClick={resendOTP}
                  style={{ color: '#0D9488', fontWeight: 700, cursor: 'pointer' }}
                >
                  Resend OTP
                </span>
              )}
            </p>

            {/* Numeric keypad */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px', marginBottom: '16px',
            }}>
              {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, idx) => {
                if (k === '') return <div key={idx} />
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (k === '⌫') {
                        // backspace
                        const lastFilled = digits.map((d, i) => d ? i : -1)
                          .filter(i => i >= 0).pop() ?? -1
                        if (lastFilled >= 0) {
                          const d = [...digits]
                          d[lastFilled] = ''
                          setDigits(d)
                          refs.current[lastFilled]?.focus()
                        }
                      } else {
                        const firstEmpty = digits.findIndex(d => !d)
                        if (firstEmpty >= 0) handleInput(firstEmpty, k)
                      }
                    }}
                    style={{
                      padding: '16px', background: '#F1F5F9',
                      border: '1px solid #E2E8F0', borderRadius: '14px',
                      fontSize: '20px', fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                      transition: 'background 0.15s',
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.background = '#E2E8F0')}
                    onMouseUp={(e)   => (e.currentTarget.style.background = '#F1F5F9')}
                  >
                    {k}
                  </button>
                )
              })}
            </div>

            {/* Verify button */}
            <button
              onClick={() => verify()}
              disabled={loading}
              style={{
                width: '100%', padding: '16px',
                background: loading ? '#94A3B8' : '#0D9488',
                border: 'none', borderRadius: '14px',
                color: '#fff', fontSize: '16px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {loading ? 'Verifying…' : 'Verify & Continue →'}
            </button>

            {/* Change number */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span
                onClick={() => router.back()}
                style={{
                  fontSize: '13px', color: '#64748B',
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                ← Change number
              </span>
            </div>
          </div>
        </div>

        {/* Popup */}
        <PopupLayer />
      </div>
    </div>
  )
}