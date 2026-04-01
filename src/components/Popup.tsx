'use client'
import { useStore } from '@/lib/store'

export default function Popup() {
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
    primary: '#0D9488', secondary: '#F1F5F9', danger: '#DC2626', warning: '#D97706',
  }
  const btnColor: Record<string, string> = {
    primary: '#fff', secondary: '#475569', danger: '#fff', warning: '#fff',
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
        animation: 'popIn 0.25s cubic-bezier(0.34,1.3,0.64,1) forwards',
      }}>
        <div style={{ padding: '28px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '68px', height: '68px', borderRadius: '50%',
            background: iconBg[popup.type],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '30px', marginBottom: '12px',
          }}>
            {popup.icon || iconDefault[popup.type]}
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', textAlign: 'center', letterSpacing: '-0.3px', lineHeight: 1.3, margin: 0 }}>
            {popup.title}
          </h2>
        </div>
        <p
          style={{ fontSize: '14px', color: '#64748B', textAlign: 'center', padding: '8px 22px 18px', lineHeight: 1.65 }}
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
      <style>{`
        @keyframes popIn {
          from { transform: scale(0.88); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}