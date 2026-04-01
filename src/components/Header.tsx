'use client'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

interface Props {
  title: string
  showBack?: boolean
  right?: ReactNode
}

export default function Header({ title, showBack = true, right }: Props) {
  const router = useRouter()
  return (
    <>
      {/* Status bar */}
      <div style={{ height: '50px', padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0 }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>9:41</span>
      </div>
      {/* Nav bar */}
      <div style={{ height: '56px', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '10px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
        {showBack ? (
          <button onClick={() => router.back()} style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#F1F5F9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        ) : (
          <div style={{ width: '38px' }} />
        )}
        <span style={{ flex: 1, textAlign: 'center', fontSize: '17px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
          {title}
        </span>
        {right ?? <div style={{ width: '38px' }} />}
      </div>
    </>
  )
}