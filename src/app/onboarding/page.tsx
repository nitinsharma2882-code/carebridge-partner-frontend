'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MobileFrame from '@/components/MobileFrame'

// ── Issue 19: Language list ───────────────────────────────
const LANGUAGES = [
  { code:'en', label:'English',    native:'English' },
  { code:'hi', label:'Hindi',      native:'हिन्दी' },
  { code:'bn', label:'Bengali',    native:'বাংলা' },
  { code:'te', label:'Telugu',     native:'తెలుగు' },
  { code:'mr', label:'Marathi',    native:'मराठी' },
  { code:'ta', label:'Tamil',      native:'தமிழ்' },
  { code:'gu', label:'Gujarati',   native:'ગુજરાતી' },
  { code:'kn', label:'Kannada',    native:'ಕನ್ನಡ' },
  { code:'pa', label:'Punjabi',    native:'ਪੰਜਾਬੀ' },
  { code:'ur', label:'Urdu',       native:'اردو' },
  { code:'fr', label:'French',     native:'Français' },
  { code:'ar', label:'Arabic',     native:'العربية' },
]

const slides = [
  { icon:'₹',  bg:'#EDFAF7', title:'Earn on your schedule',    desc:"Accept bookings when you're ready and earn competitive rates with every completed service." },
  { icon:'🩺', bg:'#FFF7ED', title:'Help patients in need',    desc:'Connect with patients near you and make a real difference through quality, compassionate care.' },
  { icon:'📈', bg:'#EFF6FF', title:'Work flexibly, grow fast', desc:'Track your earnings, manage your schedule and grow your profile — all from one app.' },
]

export default function OnboardingPage() {
  // step 0 = language selection, steps 1-3 = slides
  const [step,     setStep]     = useState(0)
  const [current,  setCurrent]  = useState(0)
  const [selLang,  setSelLang]  = useState('en')
  const router = useRouter()

  const confirmLanguage = () => {
    localStorage.setItem('carebridge_language', selLang)
    setStep(1)
  }

  const next = () => {
    if (current < slides.length - 1) { setCurrent(current + 1) }
    else { localStorage.setItem('cb_onboarding_seen', 'true'); router.replace('/login') }
  }
  const skip = () => { localStorage.setItem('cb_onboarding_seen', 'true'); router.replace('/login') }
  const slide = slides[current]

  // ── Step 0: Language Selection ────────────────────────
  if (step === 0) {
    return (
      <MobileFrame>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', background:'#fff' }}>

          {/* Status bar */}
          <div style={{ height:'50px', display:'flex', alignItems:'center', padding:'14px 20px 0', flexShrink:0 }}>
            <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
          </div>

          {/* Header */}
          <div style={{ padding:'12px 24px 0', flexShrink:0 }}>
            <div style={{ width:'48px', height:'48px', borderRadius:'16px', background:'#EDFAF7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', marginBottom:'16px' }}>🌐</div>
            <h2 style={{ fontSize:'24px', fontWeight:900, color:'#0F172A', letterSpacing:'-0.5px', margin:0 }}>Choose Language</h2>
            <p style={{ fontSize:'14px', color:'#64748B', marginTop:'8px', lineHeight:1.6 }}>Select your preferred language to continue.</p>
          </div>

          {/* Language grid */}
          <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {LANGUAGES.map(lang => (
                <div key={lang.code} onClick={()=>setSelLang(lang.code)}
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderRadius:'16px', border:`1.5px solid ${selLang===lang.code?'#0D9488':'#E2E8F0'}`, background:selLang===lang.code?'#EDFAF7':'#fff', cursor:'pointer', transition:'all 0.15s' }}>
                  <div>
                    <div style={{ fontSize:'15px', fontWeight:700, color:'#0F172A' }}>{lang.label}</div>
                    <div style={{ fontSize:'13px', color:'#94A3B8', marginTop:'2px' }}>{lang.native}</div>
                  </div>
                  <div style={{ width:'22px', height:'22px', borderRadius:'50%', border:`2px solid ${selLang===lang.code?'#0D9488':'#CBD5E1'}`, background:selLang===lang.code?'#0D9488':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {selLang===lang.code && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue button */}
          <div style={{ padding:'16px 24px 44px', flexShrink:0 }}>
            <button onClick={confirmLanguage} style={{ width:'100%', padding:'16px', background:'#0D9488', border:'none', borderRadius:'14px', color:'#fff', fontSize:'16px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
              Continue →
            </button>
          </div>
        </div>
      </MobileFrame>
    )
  }

  // ── Steps 1-3: Onboarding slides ──────────────────────
  return (
    <MobileFrame>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', background:'#fff' }}>

        {/* Status bar */}
        <div style={{ height:'50px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px 0', flexShrink:0 }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
          <button onClick={skip} style={{ background:'none', border:'none', fontSize:'13px', fontWeight:600, color:'#94A3B8', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Skip</button>
        </div>

        {/* Main content */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px 32px 0', gap:'28px' }}>
          <div style={{ width:'220px', height:'220px', borderRadius:'44px', background:slide.bg, display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.4s ease', fontSize:'80px' }}>
            {slide.icon}
          </div>
          <div style={{ textAlign:'center' }}>
            <h2 style={{ fontSize:'26px', fontWeight:900, color:'#0F172A', letterSpacing:'-0.5px', lineHeight:1.25, margin:0 }}>{slide.title}</h2>
            <p style={{ fontSize:'15px', color:'#64748B', marginTop:'12px', lineHeight:1.65 }}>{slide.desc}</p>
          </div>
          <div style={{ display:'flex', gap:'7px', alignItems:'center' }}>
            {slides.map((_,i) => (
              <div key={i} onClick={()=>setCurrent(i)} style={{ height:'8px', width:i===current?'24px':'8px', borderRadius:'4px', background:i===current?'#0D9488':'#E2E8F0', transition:'all 0.3s ease', cursor:'pointer' }} />
            ))}
          </div>
        </div>

        {/* Button */}
        <div style={{ padding:'24px 28px 44px' }}>
          <button onClick={next} style={{ width:'100%', padding:'16px', background:'#0D9488', border:'none', borderRadius:'14px', color:'#fff', fontSize:'16px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
            {current < slides.length - 1 ? 'Continue →' : 'Get Started →'}
          </button>
        </div>
      </div>
    </MobileFrame>
  )
}