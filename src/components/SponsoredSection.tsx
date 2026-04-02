'use client'
import { useRouter } from 'next/navigation'

interface Ad {
  title: string
  sub: string
  cta: string
  ctaColor: string
  badge: string
  grad: string
}

export const ADS: Ad[] = [
  { title:'AIIMS Delhi\nOPD Open',          sub:'Book appointments online',       cta:'Book Now',    ctaColor:'#1d4ed8', badge:'SPONSORED', grad:'linear-gradient(135deg,#1d4ed8,#3B82F6)' },
  { title:'24/7 Ambulance\nService',        sub:'Instant dispatch · GPS tracked', cta:'Call Now',    ctaColor:'#DC2626', badge:'EMERGENCY', grad:'linear-gradient(135deg,#991B1B,#DC2626)' },
  { title:'Fortis Healthcare\nFree Check',  sub:'Offer valid till 31 Mar',        cta:'Learn More',  ctaColor:'#0F766E', badge:'SPONSORED', grad:'linear-gradient(135deg,#134E4A,#0D9488)' },
  { title:'Apollo Hospitals\nCardiac Care', sub:'Expert cardiologists available', cta:'Consult Now', ctaColor:'#7C3AED', badge:'SPONSORED', grad:'linear-gradient(135deg,#4C1D95,#7C3AED)' },
  { title:'Medlife Medicines\n50% Off',     sub:'First order discount',           cta:'Shop Now',    ctaColor:'#D97706', badge:'PROMOTED',  grad:'linear-gradient(135deg,#e65c00,#f9d423)' },
  { title:'Practo Health\nConsult',         sub:'Earn ₹200 per referral',         cta:'Join Now',    ctaColor:'#0D9488', badge:'SPONSORED', grad:'linear-gradient(135deg,#0D9488,#065f52)' },
]

interface Props {
  onAdClick: (ad: { title:string; badge:string; sub:string }) => void
}

export function SponsoredSection({ onAdClick }: Props) {
  const router = useRouter()

  // Show only first 4 on home screen
  const PREVIEW = ADS.slice(0, 4)

  return (
    <div style={{ padding:'12px 0 0' }}>
      {/* Header with See More */}
      <div style={{ padding:'0 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'1px' }}>
          Featured &amp; Sponsored
        </span>
        <button onClick={() => router.push('/sponsored')}
          style={{ fontSize:'12px', fontWeight:700, color:'#0D9488', background:'none', border:'none', cursor:'pointer', fontFamily:'DM Sans, sans-serif', padding:0 }}>
          See More →
        </button>
      </div>

      {/* Horizontal scroll preview */}
      <div style={{ display:'flex', gap:'12px', overflowX:'auto', padding:'0 16px 4px', scrollbarWidth:'none' }}>
        {PREVIEW.map((ad, i) => (
          <div key={i} onClick={() => onAdClick(ad)}
            style={{ flexShrink:0, borderRadius:'18px', padding:'16px', position:'relative', overflow:'hidden', cursor:'pointer', background:ad.grad, width:'200px', minHeight:'120px', transition:'transform 0.15s' }}
            onMouseDown={e => (e.currentTarget.style.transform='scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform='scale(1)')}
            onMouseLeave={e => (e.currentTarget.style.transform='scale(1)')}
          >
            <div style={{ position:'absolute', bottom:'-20px', right:'-20px', width:'80px', height:'80px', borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />
            <div style={{ display:'inline-block', color:'#fff', fontSize:'8px', fontWeight:700, padding:'3px 8px', borderRadius:'100px', marginBottom:'8px', letterSpacing:'0.8px', background:'rgba(255,255,255,0.18)' }}>
              {ad.badge}
            </div>
            <div style={{ color:'#fff', fontSize:'14px', fontWeight:600, lineHeight:1.35, marginBottom:'4px', whiteSpace:'pre-line' }}>
              {ad.title}
            </div>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'10px', marginBottom:'12px' }}>
              {ad.sub}
            </div>
            <div style={{ display:'inline-block', background:'#fff', fontSize:'10px', fontWeight:600, padding:'6px 12px', borderRadius:'100px', color:ad.ctaColor }}>
              {ad.cta} →
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}