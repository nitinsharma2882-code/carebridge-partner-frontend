'use client'
import { useRouter } from 'next/navigation'
import MobileFrame from '@/components/MobileFrame'
import { COMING_ITEMS } from '@/components/ComingSoonSection'

export default function ComingSoonPage() {
  const router = useRouter()

  return (
    <MobileFrame>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>

        {/* Status bar */}
        <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
          <span style={{ fontSize:'11px', fontWeight:700, color:'#0F172A' }}>5G</span>
        </div>

        {/* Header */}
        <div style={{ height:'56px', background:'#fff', display:'flex', alignItems:'center', padding:'0 16px', gap:'10px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <button onClick={()=>router.back()} style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Coming Soon</span>
          <div style={{ width:'38px' }} />
        </div>

        {/* All items */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px', paddingBottom:'32px' }}>

          {/* Hero banner */}
          <div style={{ background:'linear-gradient(135deg,#0F172A,#134E4A)', borderRadius:'20px', padding:'20px', marginBottom:'16px', textAlign:'center', color:'#fff', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'100px', height:'100px', borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>🚀</div>
            <div style={{ fontSize:'18px', fontWeight:900, letterSpacing:'-0.4px' }}>Big things are coming</div>
            <div style={{ fontSize:'13px', opacity:0.7, marginTop:'6px', lineHeight:1.5 }}>
              We're building new features to make CareBridge even better. Stay tuned!
            </div>
          </div>

          <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px' }}>
            {COMING_ITEMS.length} Features in Pipeline
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {COMING_ITEMS.map((item, i) => (
              <div key={i} style={{ borderRadius:'18px', padding:'16px 18px', background:item.grad, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', bottom:'-20px', right:'-20px', width:'80px', height:'80px', borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'inline-block', color:'#fff', fontSize:'9px', fontWeight:700, padding:'3px 10px', borderRadius:'100px', marginBottom:'8px', letterSpacing:'0.8px', background:'rgba(255,255,255,0.18)' }}>
                      {item.badge}
                    </div>
                    <div style={{ color:'#fff', fontSize:'15px', fontWeight:700, lineHeight:1.3, marginBottom:'4px', whiteSpace:'pre-line' }}>
                      {item.title}
                    </div>
                    <div style={{ color:'rgba(255,255,255,0.65)', fontSize:'12px' }}>
                      {item.sub}
                    </div>
                  </div>
                  <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginLeft:'12px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notify me */}
          <div style={{ background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0', marginTop:'16px', textAlign:'center' }}>
            <div style={{ fontSize:'14px', fontWeight:800, color:'#0F172A', marginBottom:'4px' }}>🔔 Get Notified</div>
            <div style={{ fontSize:'12px', color:'#64748B', lineHeight:1.6, marginBottom:'14px' }}>
              We'll send you a notification as soon as these features are ready.
            </div>
            <button onClick={()=>router.back()} style={{ width:'100%', padding:'14px', background:'#0D9488', border:'none', borderRadius:'13px', color:'#fff', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
              Notify Me →
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  )
}