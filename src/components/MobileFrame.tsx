'use client'
import { ReactNode, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'

interface Props {
  children:     ReactNode
  onMouseMove?: (e: React.MouseEvent) => void
  onMouseUp?:   (e: React.MouseEvent) => void
  hideSOS?:     boolean   // pass hideSOS on /sos page to avoid double FAB
}

// ── Screens where SOS FAB should NOT appear ───────────────────────────────────
const SOS_HIDDEN_ROUTES = ['/sos', '/login', '/otp', '/onboarding', '/splash']

export default function MobileFrame({ children, onMouseMove, onMouseUp, hideSOS }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const { setSOS } = useStore()

  // ── Draggable FAB state ───────────────────────────────────────────────────
  const [fabPos,  setFabPos]  = useState({ x: 316, y: 692 })
  const dragging  = useRef(false)
  const didDrag   = useRef(false)
  const frameRef  = useRef<HTMLDivElement>(null)

  const shouldShowSOS = !hideSOS && !SOS_HIDDEN_ROUTES.includes(pathname ?? '')

  // ── Mouse drag ────────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    didDrag.current  = false
    e.preventDefault()
    e.stopPropagation()
  }

  const handleFrameMouseMove = (e: React.MouseEvent) => {
    onMouseMove?.(e)
    if (!dragging.current) return
    didDrag.current = true
    const frame = frameRef.current; if (!frame) return
    const rect  = frame.getBoundingClientRect()
    setFabPos({
      x: Math.max(27, Math.min(rect.width  - 27, e.clientX - rect.left)),
      y: Math.max(27, Math.min(rect.height - 27, e.clientY - rect.top)),
    })
  }

  const handleFrameMouseUp = (e: React.MouseEvent) => {
    onMouseUp?.(e)
    dragging.current = false
  }

  // ── Touch drag ────────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    dragging.current = true
    didDrag.current  = false
    e.stopPropagation()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return
    didDrag.current = true
    const frame = frameRef.current; if (!frame) return
    const rect  = frame.getBoundingClientRect()
    const t     = e.touches[0]
    setFabPos({
      x: Math.max(27, Math.min(rect.width  - 27, t.clientX - rect.left)),
      y: Math.max(27, Math.min(rect.height - 27, t.clientY - rect.top)),
    })
    e.preventDefault()
  }

  const handleTouchEnd = () => { dragging.current = false }

  // ── Tap to trigger SOS ───────────────────────────────────────────────────
  const handleSOSClick = () => {
    if (didDrag.current) return
    router.push('/sos')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0f1e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div
        ref={frameRef}
        onMouseMove={handleFrameMouseMove}
        onMouseUp={handleFrameMouseUp}
        onMouseLeave={handleFrameMouseUp}
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

        {/* ── Draggable SOS FAB ── */}
        {shouldShowSOS && (
          <button
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleSOSClick}
            title="Drag anywhere · Tap to trigger SOS"
            style={{
              position:   'absolute',
              left:       `${fabPos.x - 27}px`,
              top:        `${fabPos.y - 27}px`,
              zIndex:     60,
              width:      '54px',
              height:     '54px',
              borderRadius: '50%',
              background: '#DC2626',
              border:     'none',
              cursor:     dragging.current ? 'grabbing' : 'grab',
              display:    'flex',
              flexDirection: 'column',
              alignItems:    'center',
              justifyContent:'center',
              boxShadow:  '0 4px 16px rgba(220,38,38,0.55)',
              animation:  'sosPulse 2s infinite',
              userSelect: 'none',
              touchAction:'none',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 8.7 2 2 0 014.11 6.5h3a2 2 0 012 1.72"/>
            </svg>
            <span style={{ fontSize:'9px', fontWeight:800, color:'#fff', letterSpacing:'0.5px', marginTop:'1px' }}>SOS</span>
          </button>
        )}

        <style>{`
          @keyframes sosPulse {
            0%,100% { box-shadow: 0 0 0 0   rgba(220,38,38,0.55); }
            60%      { box-shadow: 0 0 0 10px rgba(220,38,38,0);   }
          }
        `}</style>
      </div>
    </div>
  )
}