'use client'
import { useRouter } from 'next/navigation'

interface ComingItem {
  title: string
  sub: string
  badge: string
  grad: string
}

export const COMING_ITEMS: ComingItem[] = [
  { title:'AI Health\nAssistant',     sub:'Instant answers 24/7',       badge:'Launching Soon', grad:'linear-gradient(135deg,#1E3A5F,#1a237e)' },
  { title:'Medicine\nSubscription',   sub:'Auto-refill your medicines',  badge:'Coming Soon',    grad:'linear-gradient(135deg,#065F46,#134E4A)' },
  { title:'Home Lab\nTests',          sub:'Blood tests at doorstep',     badge:'Coming Soon',    grad:'linear-gradient(135deg,#7C2D12,#9D3E10)' },
  { title:'Doctor Video\nConsult',    sub:'See a doctor from home',      badge:'Launching Soon', grad:'linear-gradient(135deg,#4C1D95,#5B21B6)' },
  { title:'Pharmacy\nDelivery',       sub:'Medicines at your doorstep',  badge:'Coming Soon',    grad:'linear-gradient(135deg,#0F172A,#1E293B)' },
  { title:'Health\nInsurance',        sub:'Affordable coverage plans',   badge:'Coming Soon',    grad:'linear-gradient(135deg,#7C3AED,#6d28d9)' },
  { title:'Mental Health\nSupport',   sub:'Talk to a counsellor',        badge:'Coming Soon',    grad:'linear-gradient(135deg,#065f52,#0D9488)' },
  { title:'Elder Care\nMonitoring',   sub:'24/7 remote monitoring',      badge:'Launching Soon', grad:'linear-gradient(135deg,#991B1B,#DC2626)' },
]

interface Props {
  onItemClick: () => void
}

export function ComingSoonSection({ onItemClick }: Props) {
  const router = useRouter()

  // Show only first 4 on home screen
  const PREVIEW = COMING_ITEMS.slice(0, 4)

  return (
    <div style={{ padding:'12px 0 0' }}>
      {/* Header with See More */}
      <div style={{ padding:'0 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'1px' }}>
          Coming Soon
        </span>
        <button onClick={() => router.push('/coming-soon')}
          style={{ fontSize:'12px', fontWeight:700, color:'#0D9488', background:'none', border:'none', cursor:'pointer', fontFamily:'DM Sans, sans-serif', padding:0 }}>
          See More →
        </button>
      </div>

      {/* Horizontal scroll preview */}
      <div style={{ display:'flex', gap:'12px', overflowX:'auto', padding:'0 16px 4px', scrollbarWidth:'none' }}>
        {PREVIEW.map((item, i) => (
          <div key={i} onClick={onItemClick}
            style={{ flexShrink:0, borderRadius:'18px', padding:'16px', position:'relative', overflow:'hidden', cursor:'pointer', background:item.grad, width:'160px', minHeight:'110px', transition:'transform 0.15s' }}
            onMouseDown={e => (e.currentTarget.style.transform='scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform='scale(1)')}
            onMouseLeave={e => (e.currentTarget.style.transform='scale(1)')}
          >
            <div style={{ position:'absolute', bottom:'-20px', right:'-20px', width:'70px', height:'70px', borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
            <div style={{ display:'inline-block', color:'#fff', fontSize:'8px', fontWeight:700, padding:'3px 8px', borderRadius:'100px', marginBottom:'8px', letterSpacing:'0.8px', background:'rgba(255,255,255,0.18)' }}>
              {item.badge}
            </div>
            <div style={{ color:'#fff', fontSize:'12px', fontWeight:600, lineHeight:1.35, marginBottom:'4px', whiteSpace:'pre-line' }}>
              {item.title}
            </div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'9px' }}>
              {item.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}