'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

const STORAGE_KEY = 'cb_assistant_rating'

// ── Popup ─────────────────────────────────────────────────────────────────────
function PopupLayer() {
  const { popup, closePopup } = useStore()
  if (!popup) return null
  const iconBg: Record<string,string> = { success:'#DCFCE7', warning:'#FEF3C7', error:'#FEE2E2', confirm:'#EDE9FE', info:'#EDFAF7' }
  const btnBg:  Record<string,string> = { primary:'#0D9488', secondary:'#F1F5F9', danger:'#DC2626', warning:'#D97706' }
  const btnClr: Record<string,string> = { primary:'#fff', secondary:'#475569', danger:'#fff', warning:'#fff' }
  return (
    <div onClick={e => { if (e.target === e.currentTarget) closePopup() }}
      style={{ position:'absolute', inset:0, zIndex:100, background:'rgba(15,23,42,0.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'22px', width:'100%', overflow:'hidden' }}>
        <div style={{ padding:'28px 20px 0', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:'68px', height:'68px', borderRadius:'50%', background:iconBg[popup.type], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', marginBottom:'12px' }}>
            {popup.icon || 'ℹ️'}
          </div>
          <h2 style={{ fontSize:'18px', fontWeight:800, color:'#0F172A', textAlign:'center', margin:0 }}>{popup.title}</h2>
        </div>
        <p style={{ fontSize:'14px', color:'#64748B', textAlign:'center', padding:'8px 22px 18px', lineHeight:1.65 }}
          dangerouslySetInnerHTML={{ __html: popup.body.replace(/\n/g,'<br/>') }} />
        <div style={{ display:'flex', gap:'10px', padding:'0 18px 22px' }}>
          {popup.actions.map((a,i) => (
            <button key={i} onClick={a.fn} style={{ flex:1, padding:'14px', borderRadius:'14px', fontSize:'14px', fontWeight:700, border:'none', cursor:'pointer', fontFamily:'DM Sans, sans-serif', background:btnBg[a.variant], color:btnClr[a.variant] }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Star config ───────────────────────────────────────────────────────────────
const STAR_LABELS: Record<number, { emoji: string; label: string; color: string; bg: string }> = {
  1: { emoji:'😞', label:'Very Poor',  color:'#DC2626', bg:'#FEE2E2' },
  2: { emoji:'😕', label:'Poor',       color:'#D97706', bg:'#FEF3C7' },
  3: { emoji:'😐', label:'Average',    color:'#64748B', bg:'#F1F5F9' },
  4: { emoji:'😊', label:'Good',       color:'#2563EB', bg:'#EFF6FF' },
  5: { emoji:'🤩', label:'Excellent',  color:'#0D9488', bg:'#EDFAF7' },
}

const QUICK_TAGS: Record<number, string[]> = {
  1: ['App crashes', 'Very slow', 'Hard to use', 'Missing features'],
  2: ['Slow loading', 'Confusing UI', 'Bugs found', 'Needs improvement'],
  3: ['Okay experience', 'Some issues', 'Average speed', 'Could be better'],
  4: ['Easy to use', 'Good design', 'Helpful features', 'Fast loading'],
  5: ['Love the app', 'Very smooth', 'Great design', 'Highly recommended'],
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RateAppPage() {
  const router = useRouter()
  const { showPopup, closePopup } = useStore()

  const [rating,   setRating]   = useState(0)
  const [hovered,  setHovered]  = useState(0)
  const [feedback, setFeedback] = useState('')
  const [tags,     setTags]     = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const active = hovered || rating
  const cfg    = active ? STAR_LABELS[active] : null

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handleSubmit = () => {
    if (!rating) {
      showPopup({ type:'warning', title:'Select a Rating', body:'Please tap on the stars to rate the app before submitting.', icon:'⭐', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
      return
    }
    // Persist rating locally (API-ready structure)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ rating, feedback: feedback.trim(), tags, date: new Date().toISOString() }))
    }
    setSubmitted(true)
  }

  // ── Thank you screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight:'100vh', background:'#0a0f1e', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:'390px', height:'844px', borderRadius:'48px', overflow:'hidden', position:'relative', flexShrink:0, boxShadow:'0 0 0 10px #1e293b, 0 0 0 12px #334155, 0 40px 80px rgba(0,0,0,0.8)', background:'#F8FAFC' }}>
          <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'126px', height:'34px', background:'#111827', borderRadius:'0 0 20px 20px', zIndex:50 }} />
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 28px', textAlign:'center' }}>
            <div style={{ fontSize:'72px', marginBottom:'16px', animation:'popIn 0.4s cubic-bezier(0.34,1.3,0.64,1)' }}>
              {STAR_LABELS[rating].emoji}
            </div>
            <h2 style={{ fontSize:'26px', fontWeight:900, color:'#0F172A', letterSpacing:'-0.5px', margin:0 }}>Thank you!</h2>
            <p style={{ fontSize:'15px', color:'#64748B', marginTop:'10px', lineHeight:1.6 }}>
              Your feedback helps us make CareBridge better for everyone.
            </p>

            {/* Stars display */}
            <div style={{ display:'flex', gap:'8px', margin:'20px 0' }}>
              {[1,2,3,4,5].map(s => (
                <span key={s} style={{ fontSize:'32px', filter: s <= rating ? 'none' : 'grayscale(1) opacity(0.3)' }}>★</span>
              ))}
            </div>

            <div style={{ background:cfg!.bg, borderRadius:'14px', padding:'10px 20px', marginBottom:'28px' }}>
              <span style={{ fontSize:'14px', fontWeight:700, color:cfg!.color }}>{cfg!.label}</span>
            </div>

            {tags.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', justifyContent:'center', marginBottom:'24px' }}>
                {tags.map(t => (
                  <div key={t} style={{ background:'#EDFAF7', borderRadius:'100px', padding:'5px 12px', fontSize:'12px', fontWeight:700, color:'#0D9488' }}>{t}</div>
                ))}
              </div>
            )}

            <button onClick={() => router.back()}
              style={{ width:'100%', padding:'16px', background:'#0D9488', border:'none', borderRadius:'14px', color:'#fff', fontSize:'16px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
              Back to Settings
            </button>
          </div>
          <style>{`@keyframes popIn { from{transform:scale(0.5);opacity:0;} to{transform:scale(1);opacity:1;} }`}</style>
        </div>
      </div>
    )
  }

  // ── Rating form ───────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1e', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'390px', height:'844px', borderRadius:'48px', overflow:'hidden', position:'relative', flexShrink:0, boxShadow:'0 0 0 10px #1e293b, 0 0 0 12px #334155, 0 40px 80px rgba(0,0,0,0.8)', background:'#F8FAFC' }}>

        {/* Notch */}
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'126px', height:'34px', background:'#111827', borderRadius:'0 0 20px 20px', zIndex:50 }} />

        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>

          {/* Status bar */}
          <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
            <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
            <span style={{ fontSize:'11px', fontWeight:700, color:'#0F172A' }}>5G</span>
          </div>

          {/* Header */}
          <div style={{ height:'56px', background:'#fff', display:'flex', alignItems:'center', padding:'0 16px', gap:'10px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
            <button onClick={() => router.back()} style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
            <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Rate the App</span>
            <div style={{ width:'38px' }} />
          </div>

          {/* Content */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px 14px', paddingBottom:'32px' }}>

            {/* Hero */}
            <div style={{ background:'linear-gradient(135deg,#065f52,#0D9488)', borderRadius:'22px', padding:'24px 20px', marginBottom:'20px', textAlign:'center', color:'#fff', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
              <div style={{ fontSize:'40px', marginBottom:'10px' }}>
                {cfg ? cfg.emoji : '⭐'}
              </div>
              <div style={{ fontSize:'20px', fontWeight:900, letterSpacing:'-0.4px' }}>
                {cfg ? cfg.label : 'How are we doing?'}
              </div>
              <div style={{ fontSize:'13px', opacity:0.8, marginTop:'6px', lineHeight:1.5 }}>
                {cfg ? 'Thank you for your feedback!' : 'Your rating helps us improve CareBridge for everyone.'}
              </div>
            </div>

            {/* Stars */}
            <div style={{ background:'#fff', borderRadius:'18px', padding:'20px 16px', border:'1px solid #E2E8F0', marginBottom:'14px' }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A', textAlign:'center', marginBottom:'16px' }}>
                Tap a star to rate
              </div>
              <div style={{ display:'flex', justifyContent:'center', gap:'10px', marginBottom:'12px' }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s}
                    onClick={() => { setRating(s); setTags([]) }}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    style={{ background:'none', border:'none', cursor:'pointer', padding:'4px', transition:'transform 0.15s', transform: s <= active ? 'scale(1.15)' : 'scale(1)' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill={s <= active ? '#F59E0B' : 'none'} stroke={s <= active ? '#F59E0B' : '#CBD5E1'} strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                ))}
              </div>

              {/* Label pill */}
              <div style={{ height:'28px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {cfg && (
                  <div style={{ background:cfg.bg, borderRadius:'100px', padding:'5px 18px', transition:'all 0.2s' }}>
                    <span style={{ fontSize:'13px', fontWeight:700, color:cfg.color }}>{cfg.emoji} {cfg.label}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick tags — shown after star selected */}
            {rating > 0 && (
              <div style={{ background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0', marginBottom:'14px' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A', marginBottom:'10px' }}>
                  What best describes your experience? <span style={{ color:'#94A3B8', fontWeight:500 }}>(Optional)</span>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {QUICK_TAGS[rating].map(tag => {
                    const selected = tags.includes(tag)
                    return (
                      <button key={tag} onClick={() => toggleTag(tag)} style={{
                        padding:'7px 14px', borderRadius:'100px', border:'none', cursor:'pointer',
                        background: selected ? '#0D9488' : '#F1F5F9',
                        color: selected ? '#fff' : '#475569',
                        fontSize:'12px', fontWeight:700, fontFamily:'DM Sans, sans-serif',
                        transition:'all 0.15s',
                      }}>
                        {selected ? '✓ ' : ''}{tag}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Feedback text */}
            <div style={{ background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0', marginBottom:'20px' }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A', marginBottom:'8px' }}>
                Additional Feedback <span style={{ color:'#94A3B8', fontWeight:500 }}>(Optional)</span>
              </div>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Tell us what you loved or what we can improve…"
                rows={4}
                maxLength={300}
                style={{
                  width:'100%', padding:'12px 14px',
                  background:'#F8FAFC', border:'1.5px solid #E2E8F0',
                  borderRadius:'12px', fontSize:'14px', color:'#0F172A',
                  fontFamily:'DM Sans, sans-serif', outline:'none',
                  resize:'none', boxSizing:'border-box', lineHeight:1.5,
                }}
                onFocus={e => { e.target.style.borderColor = '#0D9488'; e.target.style.background = '#EDFAF7' }}
                onBlur={e  => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC' }}
              />
              <div style={{ textAlign:'right', fontSize:'11px', color:'#94A3B8', marginTop:'4px' }}>
                {feedback.length}/300
              </div>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit}
              style={{ width:'100%', padding:'16px', background: rating ? '#0D9488' : '#CBD5E1', border:'none', borderRadius:'14px', color:'#fff', fontSize:'16px', fontWeight:700, cursor: rating ? 'pointer' : 'not-allowed', fontFamily:'DM Sans, sans-serif', transition:'background 0.2s' }}>
              {rating ? `Submit ${STAR_LABELS[rating].emoji}` : 'Select a Rating First'}
            </button>

            {rating >= 4 && (
              <div style={{ textAlign:'center', marginTop:'12px', fontSize:'12px', color:'#94A3B8', lineHeight:1.6 }}>
                Love CareBridge? Consider rating us on the{' '}
                <span onClick={() => showPopup({ type:'info', title:'App Store', body:'App Store rating will open in the live version of the app.', icon:'⭐', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })}
                  style={{ color:'#0D9488', fontWeight:700, cursor:'pointer' }}>
                  App Store
                </span>
              </div>
            )}
          </div>
        </div>

        <PopupLayer />
      </div>
    </div>
  )
}