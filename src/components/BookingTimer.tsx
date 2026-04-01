'use client'
import { useState, useEffect } from 'react'

interface Props {
  durationMinutes: number
  onComplete?: () => void
}

export default function BookingTimer({ durationMinutes, onComplete }: Props) {
  const total = durationMinutes * 60
  const [secs, setSecs] = useState(total)

  useEffect(() => {
    if (secs <= 0) { onComplete?.(); return }
    const t = setInterval(() => setSecs(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [secs])

  const pct  = ((total - secs) / total) * 100
  const mins = Math.floor(secs / 60)
  const s    = secs % 60
  const col  = secs < 300 ? '#DC2626' : secs < 600 ? '#D97706' : '#0D9488'
  const circumference = 2 * Math.PI * 24

  return (
    <div style={{
      background: '#fff', borderRadius: '18px', padding: '16px',
      border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px',
    }}>
      {/* Circular progress ring */}
      <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
        <svg width="56" height="56" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="24" fill="none" stroke="#F1F5F9" strokeWidth="5"/>
          <circle cx="28" cy="28" r="24" fill="none" stroke={col} strokeWidth="5"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${circumference * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 800, color: col,
        }}>
          {Math.ceil(secs / 60)}m
        </div>
      </div>

      {/* Text */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Session Timer</div>
        <div style={{
          fontSize: '24px', fontWeight: 900, color: col,
          letterSpacing: '-1px', marginTop: '2px',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {String(mins).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </div>
        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
          {secs < 60 ? '⚠️ Almost done' : `of ${durationMinutes} min session`}
        </div>
      </div>
    </div>
  )
}