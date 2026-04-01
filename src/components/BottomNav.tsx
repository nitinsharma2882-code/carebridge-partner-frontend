'use client'
import { useRouter } from 'next/navigation'

type TabName = 'Home' | 'Earnings' | 'Alerts' | 'Settings'
interface Props { active: TabName }

function NavIcon({ name, active }: { name: TabName; active: boolean }) {
  const c = active ? '#0D9488' : '#94A3B8'
  if (name === 'Home') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
  if (name === 'Earnings') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  )
  if (name === 'Alerts') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  )
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )
}

const TABS: { label: TabName; href: string }[] = [
  { label: 'Home',     href: '/home' },
  { label: 'Earnings', href: '/earnings' },
  { label: 'Alerts',   href: '/notifications' },
  { label: 'Settings', href: '/settings' },
]

export default function BottomNav({ active }: Props) {
  const router = useRouter()
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: '#fff', borderTop: '1px solid #E2E8F0', display: 'flex', paddingBottom: '14px', zIndex: 10 }}>
      {TABS.map(t => {
        const on = t.label === active
        return (
          <button key={t.href} onClick={() => router.push(t.href)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <NavIcon name={t.label} active={on} />
            <span style={{ fontSize: '9px', fontWeight: 700, color: on ? '#0D9488' : '#94A3B8' }}>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}