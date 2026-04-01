'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

interface Props { onCancel: () => void }

export default function SOSFlow({ onCancel }: Props) {
  const [phase,     setPhase]     = useState<'countdown' | 'active'>('countdown')
  const [countdown, setCountdown] = useState(10)
  const { emergencyContacts, setSOS } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) { setPhase('active'); setSOS(true); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, phase])

  const cancel = () => { setSOS(false); onCancel() }

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 90,
      background: 'linear-gradient(160deg,#7f1d1d,#DC2626 60%,#ef4444)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', overflowY: 'auto',
    }}>
      {/* ── Countdown ── */}
      {phase === 'countdown' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
          <div style={{
            width: '140px', height: '140px', borderRadius: '50%',
            border: '4px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'sosRing 1.5s ease-in-out infinite',
          }}>
            <span style={{ fontSize: '60px', fontWeight: 900, color: '#fff' }}>{countdown}</span>
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', margin: 0 }}>SOS Activating…</h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginTop: '10px', lineHeight: 1.65 }}>
              Emergency contacts &amp; CareBridge<br/>will be notified with your location
            </p>
          </div>
          <button onClick={cancel} style={{
            padding: '14px 36px', border: '2px solid rgba(255,255,255,0.5)',
            borderRadius: '14px', background: 'rgba(255,255,255,0.15)',
            color: '#fff', fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}>
            Cancel SOS
          </button>
        </div>
      )}

      {/* ── Active ── */}
      {phase === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '48px' }}>🚨</div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: 0 }}>SOS ACTIVATED</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
            Your location is being shared<br/>with emergency contacts &amp; CareBridge
          </p>
          <div style={{ width: '100%' }}>
            {emergencyContacts.length > 0 ? emergencyContacts.map(c => (
              <div key={c.id} style={{
                background: 'rgba(255,255,255,0.15)', borderRadius: '14px',
                padding: '12px 14px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '8px',
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{c.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{c.relation} · {c.phone}</div>
                </div>
                <span style={{ background: 'rgba(34,197,94,0.3)', color: '#bbf7d0', fontSize: '11px', fontWeight: 700, padding: '5px 10px', borderRadius: '100px' }}>
                  Notified ✓
                </span>
              </div>
            )) : (
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '14px', padding: '14px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                No contacts added.{' '}
                <span onClick={() => router.push('/emergency')} style={{ color: '#fff', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                  Add contacts →
                </span>
              </div>
            )}
          </div>
          <button onClick={cancel} style={{
            width: '100%', padding: '15px',
            border: '2px solid rgba(255,255,255,0.4)', borderRadius: '14px',
            background: 'rgba(255,255,255,0.12)', color: '#fff',
            fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}>
            Cancel SOS
          </button>
        </div>
      )}

      <style>{`
        @keyframes sosRing {
          0%, 100% { transform: scale(1);   opacity: 1;    }
          50%       { transform: scale(1.1); opacity: 0.85; }
        }
      `}</style>
    </div>
  )
}