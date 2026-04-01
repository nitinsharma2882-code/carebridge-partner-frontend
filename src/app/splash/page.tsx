'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const seen  = localStorage.getItem('cb_onboarding_seen')
    const token = localStorage.getItem('cb_assistant_token')
    const timer = setTimeout(() => {
      if (token)     router.replace('/home')
      else if (seen) router.replace('/login')
      else           router.replace('/onboarding')
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    /* ── Outer dark background ── */
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* ── Mobile frame 390×844 ── */}
      <div style={{
        width: '390px',
        height: '844px',
        borderRadius: '48px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 0 0 10px #1e293b, 0 0 0 12px #334155, 0 40px 80px rgba(0,0,0,0.8)',
        flexShrink: 0,
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 0,
          left: '50%', transform: 'translateX(-50%)',
          width: '126px', height: '34px',
          background: '#111827',
          borderRadius: '0 0 20px 20px',
          zIndex: 50,
        }} />

        {/* Splash content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '20px',
          background: 'linear-gradient(160deg, #065f52, #0D9488 55%, #14b8a6)',
        }}>
          {/* Logo */}
          <div style={{
            width: '96px', height: '96px', borderRadius: '28px',
            background: 'rgba(255,255,255,0.18)',
            border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <path d="M25 8v34M8 25h34" stroke="#fff" strokeWidth="4.5" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Text */}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', margin: 0 }}>
              CareBridge
            </h1>
            <p style={{ fontSize: '15px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginTop: '6px' }}>
              Assistant Partner App
            </p>
          </div>

          {/* Spinner */}
          <div style={{
            width: '26px', height: '26px', borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff', marginTop: '28px',
            animation: 'spin 1s linear infinite',
          }} />

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </div>
  )
}