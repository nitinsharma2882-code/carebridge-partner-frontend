'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const slides = [
  {
    icon: '₹',
    bg: '#EDFAF7',
    title: 'Earn on your schedule',
    desc: "Accept bookings when you're ready and earn competitive rates with every completed service.",
  },
  {
    icon: '🩺',
    bg: '#FFF7ED',
    title: 'Help patients in need',
    desc: 'Connect with patients near you and make a real difference through quality, compassionate care.',
  },
  {
    icon: '📈',
    bg: '#EFF6FF',
    title: 'Work flexibly, grow fast',
    desc: 'Track your earnings, manage your schedule and grow your profile — all from one app.',
  },
]

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const router = useRouter()

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1)
    } else {
      localStorage.setItem('cb_onboarding_seen', 'true')
      router.replace('/login')
    }
  }

  const skip = () => {
    localStorage.setItem('cb_onboarding_seen', 'true')
    router.replace('/login')
  }

  const slide = slides[current]

  return (
    /* ── Outer dark background ── */
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* ── Mobile frame ── */}
      <div style={{
        width: '390px', height: '844px',
        borderRadius: '48px', overflow: 'hidden',
        position: 'relative', flexShrink: 0,
        boxShadow: '0 0 0 10px #1e293b, 0 0 0 12px #334155, 0 40px 80px rgba(0,0,0,0.8)',
        background: '#fff',
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '126px', height: '34px',
          background: '#111827',
          borderRadius: '0 0 20px 20px', zIndex: 50,
        }} />

        {/* Screen content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          background: '#fff',
        }}>
          {/* Status bar */}
          <div style={{
            height: '50px', paddingTop: '14px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px 0', flexShrink: 0,
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>9:41</span>
            <button onClick={skip} style={{
              background: 'none', border: 'none',
              fontSize: '13px', fontWeight: 600,
              color: '#94A3B8', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
            }}>Skip</button>
          </div>

          {/* Main content */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '20px 32px 0', gap: '28px',
          }}>
            {/* Illustration box */}
            <div style={{
              width: '220px', height: '220px',
              borderRadius: '44px',
              background: slide.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.4s ease',
              fontSize: '80px',
            }}>
              {slide.icon}
            </div>

            {/* Text */}
            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                fontSize: '26px', fontWeight: 900,
                color: '#0F172A', letterSpacing: '-0.5px',
                lineHeight: 1.25, margin: 0,
              }}>
                {slide.title}
              </h2>
              <p style={{
                fontSize: '15px', color: '#64748B',
                marginTop: '12px', lineHeight: 1.65,
              }}>
                {slide.desc}
              </p>
            </div>

            {/* Dots */}
            <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
              {slides.map((_, i) => (
                <div key={i} onClick={() => setCurrent(i)} style={{
                  height: '8px',
                  width: i === current ? '24px' : '8px',
                  borderRadius: '4px',
                  background: i === current ? '#0D9488' : '#E2E8F0',
                  transition: 'all 0.3s ease', cursor: 'pointer',
                }} />
              ))}
            </div>
          </div>

          {/* Button */}
          <div style={{ padding: '24px 28px 44px' }}>
            <button onClick={next} style={{
              width: '100%', padding: '16px',
              background: '#0D9488', border: 'none',
              borderRadius: '14px', color: '#fff',
              fontSize: '16px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            }}>
              {current < slides.length - 1 ? 'Continue →' : 'Get Started →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}