'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

type Notif = {
  id: string
  icon: string
  iconBg: string
  title: string
  body: string
  time: string
  unread: boolean
  action?: { label: string; href: string }
}

const INITIAL: Notif[] = [
  {
    id: 'n1', icon: '💰', iconBg: '#DCFCE7',
    title: 'Payment received!',
    body: '₹320 credited for Elder Care with Priya Kapoor',
    time: '9:45 AM · Just now', unread: true,
    action: { label: 'View Earnings', href: '/earnings' },
  },
  {
    id: 'n2', icon: '📋', iconBg: '#EFF6FF',
    title: 'New booking request',
    body: 'Elder care · Priya Kapoor · 2.4 km · ₹320',
    time: '9:30 AM', unread: true,
    action: { label: 'View Request', href: '/booking' },
  },
  {
    id: 'n3', icon: '✅', iconBg: '#EDFAF7',
    title: 'Trip completed',
    body: 'Nursing Care trip ended. Priya rated you ★★★★★',
    time: '9:10 AM', unread: false,
    action: { label: 'View Earnings', href: '/earnings' },
  },
  {
    id: 'n4', icon: '⏳', iconBg: '#FEF3C7',
    title: 'Document under review',
    body: 'Care Certificate is being verified. Allow 24–48 hrs.',
    time: 'Yesterday, 5:30 PM', unread: false,
    action: { label: 'View Profile', href: '/profile' },
  },
  {
    id: 'n5', icon: '🏦', iconBg: '#DCFCE7',
    title: 'Weekly payout processed',
    body: '₹7,640 transferred to SBI •••• 4521',
    time: 'Yesterday, 10:00 AM', unread: false,
    action: { label: 'View Earnings', href: '/earnings' },
  },
  {
    id: 'n6', icon: '❌', iconBg: '#FEE2E2',
    title: 'Request expired',
    body: 'Physio Assist request from Neha expired at 8:05 AM',
    time: 'Yesterday, 8:05 AM', unread: false,
  },
  {
    id: 'n7', icon: '🔄', iconBg: '#EDE9FE',
    title: 'App Update Available',
    body: 'CareBridge v2.5 — new features & bug fixes',
    time: '2 days ago', unread: false,
    action: { label: 'Update Now', href: '#' },
  },
]

// ── Inline Popup ──────────────────────────────────────────
function PopupLayer() {
  const { popup, closePopup } = useStore()
  if (!popup) return null
  const iconBg: Record<string, string> = {
    success: '#DCFCE7', warning: '#FEF3C7',
    error: '#FEE2E2', confirm: '#EDE9FE', info: '#EDFAF7',
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
      <div style={{ background: '#fff', borderRadius: '22px', width: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '28px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '68px', height: '68px', borderRadius: '50%',
            background: iconBg[popup.type],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '30px', marginBottom: '12px',
          }}>
            {popup.icon || '📢'}
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', textAlign: 'center', margin: 0 }}>
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
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────
export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL)
  const { showPopup, closePopup } = useStore()
  const router = useRouter()

  const unreadCount = notifs.filter(n => n.unread).length

  const markAllRead = () => {
    setNotifs(notifs.map(n => ({ ...n, unread: false })))
    showPopup({
      type: 'success', title: 'All Caught Up! ✅',
      body: 'All notifications have been marked as read.',
      icon: '✅',
      actions: [{ label: 'OK', variant: 'primary', fn: closePopup }],
    })
  }

  const openNotif = (n: Notif) => {
    // Mark as read
    setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))
    // Show popup
    showPopup({
      type: 'info',
      title: n.title,
      body: n.body + `\n\n🕐 ${n.time}`,
      icon: n.icon,
      actions: [
        ...(n.action ? [{
          label: n.action.label,
          variant: 'primary' as const,
          fn: () => { closePopup(); router.push(n.action!.href) },
        }] : []),
        { label: 'Dismiss', variant: 'secondary' as const, fn: closePopup },
      ],
    })
  }

  const today    = notifs.filter(n => n.time.includes('AM') || n.time.includes('PM') && !n.time.includes('Yesterday'))
  const yesterday = notifs.filter(n => n.time.includes('Yesterday'))
  const older     = notifs.filter(n => n.time.includes('days ago'))

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
        background: '#F8FAFC',
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '126px', height: '34px', background: '#111827',
          borderRadius: '0 0 20px 20px', zIndex: 50,
        }} />

        {/* Screen */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Status bar */}
          <div style={{
            height: '50px', padding: '14px 20px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#fff', flexShrink: 0,
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>9:41</span>
          </div>

          {/* Header */}
          <div style={{
            height: '56px', background: '#fff',
            display: 'flex', alignItems: 'center',
            padding: '0 16px', gap: '10px',
            borderBottom: '1px solid #E2E8F0', flexShrink: 0,
          }}>
            <button onClick={() => router.back()} style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: '#F1F5F9', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: '8px', background: '#DC2626', color: '#fff',
                  fontSize: '11px', fontWeight: 700, padding: '2px 7px',
                  borderRadius: '100px',
                }}>
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 ? (
              <button onClick={markAllRead} style={{
                background: '#EDFAF7', border: 'none', borderRadius: '8px',
                padding: '0 10px', height: '32px',
                fontSize: '11px', fontWeight: 700, color: '#0D9488',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              }}>
                All read
              </button>
            ) : (
              <div style={{ width: '38px' }} />
            )}
          </div>

          {/* Notification list */}
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '90px' }}>

            {/* Today */}
            {today.length > 0 && (
              <>
                <div style={{
                  fontSize: '11px', fontWeight: 700, color: '#94A3B8',
                  textTransform: 'uppercase', letterSpacing: '0.6px',
                  padding: '14px 16px 8px',
                }}>Today</div>
                {today.map(n => <NotifItem key={n.id} n={n} onClick={() => openNotif(n)} />)}
              </>
            )}

            {/* Yesterday */}
            {yesterday.length > 0 && (
              <>
                <div style={{
                  fontSize: '11px', fontWeight: 700, color: '#94A3B8',
                  textTransform: 'uppercase', letterSpacing: '0.6px',
                  padding: '14px 16px 8px',
                }}>Yesterday</div>
                {yesterday.map(n => <NotifItem key={n.id} n={n} onClick={() => openNotif(n)} />)}
              </>
            )}

            {/* Older */}
            {older.length > 0 && (
              <>
                <div style={{
                  fontSize: '11px', fontWeight: 700, color: '#94A3B8',
                  textTransform: 'uppercase', letterSpacing: '0.6px',
                  padding: '14px 16px 8px',
                }}>Earlier</div>
                {older.map(n => <NotifItem key={n.id} n={n} onClick={() => openNotif(n)} />)}
              </>
            )}
          </div>

          {/* Bottom Nav */}
          <BottomNav active="Alerts" router={router} />
        </div>

        <PopupLayer />
      </div>
    </div>
  )
}

// ── Notification Item ─────────────────────────────────────
function NotifItem({ n, onClick }: { n: Notif; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        margin: '0 14px 8px', borderRadius: '16px',
        padding: '13px 14px', display: 'flex', gap: '12px',
        border: `1px solid ${n.unread ? '#CCFBF1' : '#E2E8F0'}`,
        background: n.unread ? '#EDFAF7' : '#fff',
        cursor: 'pointer', transition: 'opacity 0.15s',
      }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '12px',
        background: n.iconBg, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', flexShrink: 0,
      }}>
        {n.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '14px', fontWeight: 700, color: '#0F172A',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          {n.title}
          {n.unread && (
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0D9488', flexShrink: 0 }} />
          )}
        </div>
        <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px', lineHeight: 1.45 }}>
          {n.body}
        </div>
        <div style={{
          fontSize: '11px', fontWeight: 600, marginTop: '6px',
          color: n.unread ? '#0D9488' : '#94A3B8',
        }}>
          {n.time}
        </div>
      </div>
    </div>
  )
}

// ── Bottom Nav ────────────────────────────────────────────
function BottomNav({ active, router }: { active: string; router: any }) {
  const tabs = [
    { label: 'Home', href: '/home' },
    { label: 'Earnings', href: '/earnings' },
    { label: 'Alerts', href: '/notifications' },
    { label: 'Settings', href: '/settings' },
  ]
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: '80px', background: '#fff',
      borderTop: '1px solid #E2E8F0',
      display: 'flex', paddingBottom: '14px',
    }}>
      {tabs.map(t => {
        const on = active === t.label
        return (
          <button key={t.href} onClick={() => router.push(t.href)} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '3px',
            border: 'none', background: 'transparent', cursor: 'pointer',
          }}>
            <NavIcon name={t.label} active={on} />
            <span style={{ fontSize: '9px', fontWeight: 700, color: on ? '#0D9488' : '#94A3B8' }}>
              {t.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
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