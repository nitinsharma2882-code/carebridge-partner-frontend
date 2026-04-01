'use client'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  onMouseMove?: (e: React.MouseEvent) => void
  onMouseUp?:   (e: React.MouseEvent) => void
}

export default function MobileFrame({ children, onMouseMove, onMouseUp }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{
          width: '390px', height: '844px', borderRadius: '48px',
          overflow: 'hidden', position: 'relative', flexShrink: 0,
          boxShadow: '0 0 0 10px #1e293b, 0 0 0 12px #334155, 0 40px 80px rgba(0,0,0,0.8)',
          background: '#F8FAFC',
        }}
      >
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '126px', height: '34px', background: '#111827',
          borderRadius: '0 0 20px 20px', zIndex: 50,
        }} />
        {children}
      </div>
    </div>
  )
}