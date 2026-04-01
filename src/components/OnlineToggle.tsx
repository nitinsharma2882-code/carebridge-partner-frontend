'use client'

interface Props {
  isOnline: boolean
  onlineTime: string
  onToggle: () => void
}

export default function OnlineToggle({ isOnline, onlineTime, onToggle }: Props) {
  return (
    <div style={{ background: '#fff', padding: '12px 14px 10px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Your Status
        </span>
        <span style={{ fontSize: '12px', color: '#94A3B8' }}>{onlineTime}</span>
      </div>

      {/* Toggle pill */}
      <div
        onClick={onToggle}
        style={{
          width: '100%', height: '52px', borderRadius: '100px',
          background: isOnline ? '#EDFAF7' : '#F1F5F9',
          border: `1.5px solid ${isOnline ? '#CCFBF1' : '#E2E8F0'}`,
          display: 'flex', padding: '4px',
          cursor: 'pointer', position: 'relative',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Sliding thumb */}
        <div style={{
          position: 'absolute', top: '4px', bottom: '4px',
          width: 'calc(50% - 4px)', borderRadius: '100px',
          background: isOnline ? '#0D9488' : '#fff',
          boxShadow: isOnline ? '0 2px 14px rgba(13,148,136,0.4)' : '0 2px 8px rgba(0,0,0,0.12)',
          left: isOnline ? '4px' : 'calc(50%)',
          transition: 'all 0.3s cubic-bezier(0.34,1.3,0.64,1)',
        }} />
        {/* Online label */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, zIndex: 1, color: isOnline ? '#fff' : '#94A3B8', transition: 'color 0.3s' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Online
        </div>
        {/* Offline label */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, zIndex: 1, color: isOnline ? '#94A3B8' : '#475569', transition: 'color 0.3s' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
          Offline
        </div>
      </div>

      {/* Status dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '9px' }}>
        <div style={{
          width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0,
          background: isOnline ? '#16A34A' : '#CBD5E1',
          animation: isOnline ? 'livePulse 1.5s ease-in-out infinite' : 'none',
        }} />
        <span style={{ fontSize: '13px', color: '#64748B' }}>
          {isOnline ? 'Looking for requests nearby…' : 'Toggle to start accepting bookings'}
        </span>
      </div>
    </div>
  )
}