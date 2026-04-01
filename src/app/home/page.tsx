'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import BottomNav from '@/components/BottomNav'
import SOSFlow from '@/components/SOSFlow'

// ── Inline Popup ──────────────────────────────────────────
function PopupLayer() {
  const { popup, closePopup } = useStore()
  if (!popup) return null
  const iconBg: Record<string, string> = { success: '#DCFCE7', warning: '#FEF3C7', error: '#FEE2E2', confirm: '#EDE9FE', info: '#EDFAF7' }
  const iconDefault: Record<string, string> = { success: '✅', warning: '⚠️', error: '❌', confirm: '❓', info: 'ℹ️' }
  const btnBg: Record<string, string> = { primary: '#0D9488', secondary: '#F1F5F9', danger: '#DC2626', warning: '#D97706' }
  const btnColor: Record<string, string> = { primary: '#fff', secondary: '#475569', danger: '#fff', warning: '#fff' }
  return (
    <div onClick={e => { if (e.target === e.currentTarget) closePopup() }}
      style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '22px', width: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '28px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: iconBg[popup.type], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '12px' }}>
            {popup.icon || iconDefault[popup.type]}
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', textAlign: 'center', margin: 0 }}>{popup.title}</h2>
        </div>
        <p style={{ fontSize: '14px', color: '#64748B', textAlign: 'center', padding: '8px 22px 18px', lineHeight: 1.65 }}
          dangerouslySetInnerHTML={{ __html: popup.body.replace(/\n/g, '<br/>') }} />
        <div style={{ display: 'flex', gap: '10px', padding: '0 18px 22px' }}>
          {popup.actions.map((a, i) => (
            <button key={i} onClick={a.fn} style={{ flex: 1, padding: '14px', borderRadius: '14px', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', background: btnBg[a.variant], color: btnColor[a.variant] }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Sponsored / Promoted Ads Data ────────────────────────
const ADS = [
  {
    id: 1, label: 'Sponsored',
    title: 'Apollo HomeHealth Services',
    sub: 'Partner & earn up to ₹800/visit',
    icon: '🏥', gradient: 'linear-gradient(135deg,#0047AB,#0070CC)',
    cta: 'Learn →', ctaColor: '#2563EB',
    popup: { title: 'Apollo HomeHealth Services', body: 'Partner with Apollo to earn up to ₹800/visit.\nJoin 2,000+ partners already earning more.' },
  },
  {
    id: 2, label: 'Promoted',
    title: 'Medlife — Medicine Delivery',
    sub: '50% off first order for patients',
    icon: '💊', gradient: 'linear-gradient(135deg,#e65c00,#f9d423)',
    cta: 'Shop →', ctaColor: '#D97706',
    popup: { title: 'Medlife — Medicine Delivery', body: '50% off on first order for your patients.\nOrder directly to patient homes.' },
  },
  {
    id: 3, label: 'Sponsored',
    title: 'Practo Health Plans',
    sub: 'Refer patients & earn ₹200/referral',
    icon: '🩺', gradient: 'linear-gradient(135deg,#0D9488,#065f52)',
    cta: 'Join →', ctaColor: '#0D9488',
    popup: { title: 'Practo Health Plans', body: 'Refer patients to Practo and earn ₹200 per referral.\nUnlimited earning potential!' },
  },
]

export default function HomePage() {
  const [isOnline, setIsOnline]   = useState(false)
  const [onlineTime, setOnlineTime] = useState('Go online to earn')
  const [sosVisible, setSosVisible] = useState(false)

  // Draggable SOS FAB
  const [fabPos, setFabPos] = useState({ x: 316, y: 692 })
  const dragging   = useRef(false)
  const didDrag    = useRef(false)
  const frameRef   = useRef<HTMLDivElement>(null)
  const fileRef    = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const { showPopup, closePopup, setSOS } = useStore()

  // ── Drag handlers ──
  const onMouseDown = (e: React.MouseEvent) => { dragging.current = true; didDrag.current = false; e.preventDefault() }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return
    didDrag.current = true
    const frame = frameRef.current; if (!frame) return
    const rect = frame.getBoundingClientRect()
    setFabPos({ x: Math.max(27, Math.min(rect.width - 27, e.clientX - rect.left)), y: Math.max(27, Math.min(rect.height - 27, e.clientY - rect.top)) })
  }
  const onMouseUp = () => { dragging.current = false }
  const onTouchStart = (e: React.TouchEvent) => { dragging.current = true; didDrag.current = false }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return
    didDrag.current = true
    const frame = frameRef.current; if (!frame) return
    const rect = frame.getBoundingClientRect(); const t = e.touches[0]
    setFabPos({ x: Math.max(27, Math.min(rect.width - 27, t.clientX - rect.left)), y: Math.max(27, Math.min(rect.height - 27, t.clientY - rect.top)) })
    e.preventDefault()
  }
  const onTouchEnd = () => { dragging.current = false }

  // ── Actions ──
  const toggleOnline = () => {
    const next = !isOnline
    setIsOnline(next)
    setOnlineTime(next ? 'Online for 0h 0m' : 'Go online to earn')
    showPopup({
      type: next ? 'success' : 'info',
      title: next ? 'You are Online 🟢' : 'You are Offline ⚫',
      body: next ? 'You are now visible to customers.\nRequests will appear here.' : "You won't receive any requests while offline.",
      icon: next ? '🟢' : '⚫',
      actions: [{ label: 'OK', variant: 'primary', fn: closePopup }],
    })
  }

  // Change 7: SOS now opens SOSFlow overlay (same as consumer app)
  const handleSOS = () => {
    if (didDrag.current) return
    setSosVisible(true)
  }

  const handleSponsor = (title: string, body: string) => {
    showPopup({ type: 'info', title, body, icon: '🏥', actions: [{ label: 'Learn More', variant: 'primary', fn: closePopup }, { label: 'Dismiss', variant: 'secondary', fn: closePopup }] })
  }

  // Change 5: Upload medical doc from home
  const handleDocUpload = () => {
    showPopup({
      type: 'info', title: 'Upload Medical Document',
      body: 'Upload your medical documents securely.\nSupported: PDF, JPG, PNG (max 10MB)',
      icon: '📤',
      actions: [
        { label: 'Choose File', variant: 'primary', fn: () => { closePopup(); fileRef.current?.click() } },
        { label: 'View All Docs', variant: 'secondary', fn: () => { closePopup(); router.push('/documents') } },
      ],
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      showPopup({ type: 'error', title: 'File Too Large', body: 'Please select a file under 10MB.', icon: '❌', actions: [{ label: 'OK', variant: 'primary', fn: closePopup }] })
      return
    }
    showPopup({ type: 'success', title: 'Uploaded! ✅', body: `${file.name} has been uploaded successfully.`, icon: '✅', actions: [{ label: 'Done', variant: 'primary', fn: closePopup }, { label: 'View Docs', variant: 'secondary', fn: () => { closePopup(); router.push('/documents') } }] })
    e.target.value = ''
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div ref={frameRef} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        style={{ width: '390px', height: '844px', borderRadius: '48px', overflow: 'hidden', position: 'relative', flexShrink: 0, boxShadow: '0 0 0 10px #1e293b, 0 0 0 12px #334155, 0 40px 80px rgba(0,0,0,0.8)', background: '#F8FAFC' }}>

        {/* Notch */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '126px', height: '34px', background: '#111827', borderRadius: '0 0 20px 20px', zIndex: 50 }} />

        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Status bar */}
          <div style={{ height: '50px', padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>9:41</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>5G</span>
            </div>
          </div>

          {/* App Header */}
          <div style={{ background: '#fff', padding: '10px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Good morning 👋</div>
              <div style={{ fontSize: '19px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.4px', marginTop: '2px' }}>Rajan Kumar</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => { didDrag.current = false; handleSOS() }}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 11px', background: '#DC2626', border: 'none', borderRadius: '20px', cursor: 'pointer', animation: 'sosPulse 2s infinite' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 8.7 2 2 0 014.11 6.5h3a2 2 0 012 1.72"/>
                </svg>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>SOS</span>
              </button>
              <button onClick={() => router.push('/notifications')}
                style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#F1F5F9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                <div style={{ position: 'absolute', top: '7px', right: '7px', width: '9px', height: '9px', background: '#DC2626', borderRadius: '50%', border: '2px solid #fff' }} />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '90px' }}>

            {/* Change 6: ALL Sponsored/Promoted ads at the TOP */}
            <div style={{ padding: '10px 14px 0' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Sponsored & Promoted
              </div>
              {ADS.map(ad => (
                <div key={ad.id} onClick={() => handleSponsor(ad.popup.title, ad.popup.body)}
                  style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', marginBottom: '8px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'right', padding: '5px 12px 0' }}>
                    {ad.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 14px 12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: ad.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '22px' }}>
                      {ad.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{ad.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{ad.sub}</div>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: ad.ctaColor }}>{ad.cta}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Online Toggle */}
            <div style={{ background: '#fff', padding: '12px 14px 10px', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', flexShrink: 0, marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Status</span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{onlineTime}</span>
              </div>
              <div onClick={toggleOnline} style={{ width: '100%', height: '52px', borderRadius: '100px', background: isOnline ? '#EDFAF7' : '#F1F5F9', border: `1.5px solid ${isOnline ? '#CCFBF1' : '#E2E8F0'}`, display: 'flex', padding: '4px', cursor: 'pointer', position: 'relative', transition: 'all 0.3s ease' }}>
                <div style={{ position: 'absolute', top: '4px', bottom: '4px', width: 'calc(50% - 4px)', borderRadius: '100px', background: isOnline ? '#0D9488' : '#fff', boxShadow: isOnline ? '0 2px 14px rgba(13,148,136,0.4)' : '0 2px 8px rgba(0,0,0,0.12)', left: isOnline ? '4px' : 'calc(50%)', transition: 'all 0.3s cubic-bezier(0.34,1.3,0.64,1)' }} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, zIndex: 1, color: isOnline ? '#fff' : '#94A3B8', transition: 'color 0.3s' }}>Online</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, zIndex: 1, color: isOnline ? '#94A3B8' : '#475569', transition: 'color 0.3s' }}>Offline</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '9px' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0, background: isOnline ? '#16A34A' : '#CBD5E1', animation: isOnline ? 'livePulse 1.5s ease-in-out infinite' : 'none' }} />
                <span style={{ fontSize: '13px', color: '#64748B' }}>{isOnline ? 'Looking for requests nearby…' : 'Toggle to start accepting bookings'}</span>
              </div>
            </div>

            <div style={{ height: '12px' }} />

            {/* Earnings Card */}
            <div style={{ margin: '0 14px', borderRadius: '22px', padding: '20px', background: 'linear-gradient(135deg,#065f52,#0D9488,#14b8a6)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ fontSize: '11px', fontWeight: 700, opacity: 0.75, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Today's Earnings</div>
              <div style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '-2px', margin: '4px 0' }}>₹ 1,240</div>
              <div style={{ fontSize: '12px', opacity: 0.75, marginBottom: '16px' }}>↑ 18% more than yesterday</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[{ v: '5', l: 'Trips' }, { v: '4.9★', l: 'Rating' }, { v: '6h 20m', l: 'Online' }].map(s => (
                  <div key={s.l} style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '17px', fontWeight: 800 }}>{s.v}</div>
                    <div style={{ fontSize: '10px', opacity: 0.7, fontWeight: 600, marginTop: '2px' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Change 5: Upload Medical Documents Section */}
            <div style={{ margin: '12px 14px 0', background: '#fff', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#EDFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📋</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Medical Documents</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1px' }}>Store & manage your health records</div>
                  </div>
                </div>
                <button onClick={() => router.push('/documents')} style={{ fontSize: '11px', fontWeight: 700, color: '#0D9488', background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
              </div>
              <div style={{ display: 'flex', gap: '8px', padding: '0 14px 14px' }}>
                <div onClick={handleDocUpload} style={{ flex: 1, background: '#F8FAFC', borderRadius: '14px', padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1.5px dashed #CBD5E1' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0D9488' }}>Upload Doc</span>
                </div>
                {[{ icon: '🩸', label: 'Blood Report' }, { icon: '🪪', label: 'ID Proof' }, { icon: '📜', label: 'Certificate' }].map(q => (
                  <div key={q.label} onClick={handleDocUpload} style={{ flex: 1, background: '#F8FAFC', borderRadius: '14px', padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '20px' }}>{q.icon}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textAlign: 'center' }}>{q.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div style={{ margin: '12px 14px', borderRadius: '18px', overflow: 'hidden', background: '#fff', border: '1px solid #E2E8F0' }}>
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Nearby Requests</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#16A34A' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16A34A', animation: 'livePulse 1.5s infinite' }} />Live
                </span>
              </div>
              <svg width="100%" height="165" viewBox="0 0 362 165">
                <rect width="362" height="165" fill="#ccede8"/>
                <rect y="72" width="362" height="10" fill="#fff" opacity="0.55"/>
                <rect y="118" width="362" height="10" fill="#fff" opacity="0.55"/>
                <rect x="64" y="0" width="10" height="165" fill="#fff" opacity="0.55"/>
                <rect x="168" y="0" width="10" height="165" fill="#fff" opacity="0.55"/>
                <rect x="272" y="0" width="10" height="165" fill="#fff" opacity="0.55"/>
                <circle cx="118" cy="62" r="10" fill="#DC2626" fillOpacity="0.2"/><circle cx="118" cy="62" r="6" fill="#DC2626"/>
                <circle cx="252" cy="48" r="10" fill="#D97706" fillOpacity="0.2"/><circle cx="252" cy="48" r="6" fill="#D97706"/>
                <circle cx="310" cy="105" r="10" fill="#2563EB" fillOpacity="0.2"/><circle cx="310" cy="105" r="6" fill="#2563EB"/>
                <circle cx="180" cy="126" r="16" fill="#0D9488" fillOpacity="0.15"/><circle cx="180" cy="126" r="10" fill="#0D9488"/><circle cx="180" cy="126" r="5" fill="#fff"/>
                <text x="180" y="150" textAnchor="middle" fontSize="9" fill="#0D9488" fontFamily="DM Sans" fontWeight="700">You</text>
              </svg>
            </div>

            {/* Request Banner */}
            {isOnline && (
              <div onClick={() => router.push('/booking')}
                style={{ margin: '0 14px 12px', borderRadius: '18px', background: '#fff', border: '2px solid #0D9488', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', animation: 'fadeIn 0.4s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: '#EDFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>New Request Nearby!</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>2.4 km · Elder Care · ₹320</div>
                  </div>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sosPulse 1s infinite' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            )}
          </div>

          {/* Draggable SOS FAB */}
          <button onMouseDown={onMouseDown} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onClick={handleSOS}
            title="Drag anywhere · Tap to trigger SOS"
            style={{ position: 'absolute', left: `${fabPos.x - 27}px`, top: `${fabPos.y - 27}px`, zIndex: 40, width: '54px', height: '54px', borderRadius: '50%', background: '#DC2626', border: 'none', cursor: dragging.current ? 'grabbing' : 'grab', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(220,38,38,0.5)', animation: 'sosPulse 2s infinite', userSelect: 'none', touchAction: 'none' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 8.7 2 2 0 014.11 6.5h3a2 2 0 012 1.72"/>
            </svg>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff', letterSpacing: '0.5px', marginTop: '1px' }}>SOS</span>
          </button>

          {/* Change 7: SOSFlow overlay — identical to consumer app */}
          {sosVisible && <SOSFlow onCancel={() => { setSOS(false); setSosVisible(false) }} />}
        </div>

        {/* Hidden file input */}
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleFileChange} />

        <BottomNav active="Home" />
        <PopupLayer />

        <style>{`
          @keyframes sosPulse { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.5);}60%{box-shadow:0 0 0 10px rgba(220,38,38,0);} }
          @keyframes livePulse { 0%,100%{box-shadow:0 0 0 0 rgba(22,163,74,0.5);}60%{box-shadow:0 0 0 7px rgba(22,163,74,0);} }
          @keyframes fadeIn { from{opacity:0;transform:scale(0.95);}to{opacity:1;transform:scale(1);} }
        `}</style>
      </div>
    </div>
  )
}