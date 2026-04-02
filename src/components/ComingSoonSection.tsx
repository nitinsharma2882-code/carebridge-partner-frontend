'use client'

interface ComingItem {
  title: string
  sub: string
  badge: string
  grad: string
}

const COMING: ComingItem[] = [
  { title:'AI Health\nAssistant',    sub:'Instant answers 24/7',      badge:'Launching Soon', grad:'linear-gradient(135deg,#1E3A5F,#1a237e)' },
  { title:'Medicine\nSubscription',  sub:'Auto-refill your medicines', badge:'Coming Soon',    grad:'linear-gradient(135deg,#065F46,#134E4A)' },
  { title:'Home Lab\nTests',         sub:'Blood tests at doorstep',    badge:'Coming Soon',    grad:'linear-gradient(135deg,#7C2D12,#9D3E10)' },
  { title:'Doctor Video\nConsult',   sub:'See a doctor from home',     badge:'Launching Soon', grad:'linear-gradient(135deg,#4C1D95,#5B21B6)' },
]

interface Props {
  onItemClick: () => void
}

export function ComingSoonSection({ onItemClick }: Props) {
  return (
    <div style={{ padding:'12px 0 0' }}>
      <div style={{ padding:'0 16px 10px' }}>
        <span style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'1px' }}>
          Coming Soon
        </span>
      </div>
      <div style={{ display:'flex', gap:'12px', overflowX:'auto', padding:'0 16px 4px', scrollbarWidth:'none' }}>
        {COMING.map((item, i) => (
          <div key={i} onClick={onItemClick}
            style={{ flexShrink:0, borderRadius:'18px', padding:'16px', position:'relative', overflow:'hidden', cursor:'pointer', background:item.grad, width:'160px', minHeight:'110px', transition:'transform 0.15s' }}
            onMouseDown={e => (e.currentTarget.style.transform='scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform='scale(1)')}
            onMouseLeave={e => (e.currentTarget.style.transform='scale(1)')}
          >
            {/* Background decoration */}
            <div style={{ position:'absolute', bottom:'-20px', right:'-20px', width:'70px', height:'70px', borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
            {/* Badge */}
            <div style={{ display:'inline-block', color:'#fff', fontSize:'8px', fontWeight:700, padding:'3px 8px', borderRadius:'100px', marginBottom:'8px', letterSpacing:'0.8px', background:'rgba(255,255,255,0.18)' }}>
              {item.badge}
            </div>
            {/* Title */}
            <div style={{ color:'#fff', fontSize:'12px', fontWeight:600, lineHeight:1.35, marginBottom:'4px', whiteSpace:'pre-line' }}>
              {item.title}
            </div>
            {/* Sub */}
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'9px' }}>
              {item.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}