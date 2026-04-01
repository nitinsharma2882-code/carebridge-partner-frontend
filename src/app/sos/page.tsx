'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function SOSPage() {
  const [phase, setPhase]       = useState<'countdown' | 'active'>('countdown')
  const [countdown, setCountdown] = useState(10)
  const router  = useRouter()
  const { emergencyContacts, setSOS } = useStore()

  // 10-second countdown
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) { activate(); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, phase])

  const activate = () => {
    setPhase('active')
    setSOS(true)
    // In real app: call AssistantAPI.triggerSOS(lat, lng)
  }

  const cancel = () => {
    setSOS(false)
    router.back()
  }

  const callNumber = (num: string) => {
    // In real app: open tel: link
    alert(`Calling ${num}…`)
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
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '126px', height: '34px', background: '#111827',
          borderRadius: '0 0 20px 20px', zIndex: 50,
        }} />

        {/* Full screen SOS bg */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg,#7f1d1d,#DC2626 60%,#ef4444)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '32px 24px',
          overflowY: 'auto',
        }}>

          {/* ── COUNTDOWN PHASE ── */}
          {phase === 'countdown' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
              {/* Pulsing ring */}
              <div style={{
                width: '140px', height: '140px', borderRadius: '50%',
                border: '4px solid rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'sosRing 1.5s ease-in-out infinite',
              }}>
                <span style={{ fontSize: '60px', fontWeight: 900, color: '#fff' }}>
                  {countdown}
                </span>
              </div>

              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
                  SOS Activating…
                </h1>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginTop: '10px', lineHeight: 1.65 }}>
                  Emergency contacts &amp; CareBridge<br/>will be notified with your location
                </p>
              </div>

              <button
                onClick={cancel}
                style={{
                  padding: '14px 36px',
                  border: '2px solid rgba(255,255,255,0.5)',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff', fontSize: '15px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  marginTop: '8px',
                }}
              >
                Cancel SOS
              </button>
            </div>
          )}

          {/* ── ACTIVE PHASE ── */}
          {phase === 'active' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '48px' }}>🚨</div>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
                  SOS ACTIVATED
                </h1>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginTop: '8px', lineHeight: 1.6 }}>
                  Your location is being shared<br/>with emergency contacts &amp; CareBridge
                </p>
              </div>

              {/* Emergency contacts notified */}
              <div style={{ width: '100%', marginTop: '4px' }}>
                {emergencyContacts.length > 0 ? (
                  emergencyContacts.map((c) => (
                    <div key={c.id} style={{
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: '14px', padding: '12px 14px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', marginBottom: '8px',
                    }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{c.name}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                          {c.relation} · {c.phone}
                        </div>
                      </div>
                      <span style={{
                        background: 'rgba(34,197,94,0.3)',
                        color: '#bbf7d0', fontSize: '11px', fontWeight: 700,
                        padding: '5px 10px', borderRadius: '100px',
                      }}>
                        Notified ✓
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{
                    background: 'rgba(255,255,255,0.12)',
                    borderRadius: '14px', padding: '14px',
                    fontSize: '13px', color: 'rgba(255,255,255,0.7)',
                  }}>
                    No emergency contacts added.{' '}
                    <span
                      onClick={() => router.push('/emergency')}
                      style={{ color: '#fff', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Add contacts →
                    </span>
                  </div>
                )}
              </div>

              {/* Dial buttons */}
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button onClick={() => callNumber('112')} style={{
                  flex: 1, padding: '14px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderRadius: '14px', color: '#fff',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  📞 Call 112
                </button>
                <button onClick={() => callNumber('108')} style={{
                  flex: 1, padding: '14px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderRadius: '14px', color: '#fff',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  🚑 Ambulance 108
                </button>
              </div>
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button onClick={() => callNumber('100')} style={{
                  flex: 1, padding: '13px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderRadius: '14px', color: '#fff',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  🚔 Police 100
                </button>
                <button onClick={() => callNumber('101')} style={{
                  flex: 1, padding: '13px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderRadius: '14px', color: '#fff',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  🔥 Fire 101
                </button>
              </div>

              <button onClick={cancel} style={{
                width: '100%', padding: '15px',
                border: '2px solid rgba(255,255,255,0.4)',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.12)',
                color: '#fff', fontSize: '15px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                marginTop: '4px',
              }}>
                Cancel SOS
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes sosRing {
          0%,100% { transform:scale(1); opacity:1; }
          50%      { transform:scale(1.1); opacity:0.85; }
        }
      `}</style>
    </div>
  )
}