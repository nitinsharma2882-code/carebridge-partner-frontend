'use client'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import MobileFrame from '@/components/MobileFrame'
import { AdDetailScreen } from '@/components/AdDetailScreen'
import { ADS } from '@/components/SponsoredSection'
import { useState } from 'react'

function PopupLayer() {
  const { popup, closePopup } = useStore()
  if (!popup) return null
  const iconBg: Record<string,string> = { success:'#DCFCE7', warning:'#FEF3C7', error:'#FEE2E2', confirm:'#EDE9FE', info:'#EDFAF7' }
  const btnBg:  Record<string,string> = { primary:'#0D9488', secondary:'#F1F5F9', danger:'#DC2626', warning:'#D97706' }
  const btnClr: Record<string,string> = { primary:'#fff', secondary:'#475569', danger:'#fff', warning:'#fff' }
  return (
    <div onClick={e=>{ if(e.target===e.currentTarget) closePopup() }}
      style={{ position:'absolute', inset:0, zIndex:100, background:'rgba(15,23,42,0.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'22px', width:'100%', overflow:'hidden' }}>
        <div style={{ padding:'28px 20px 0', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:'68px', height:'68px', borderRadius:'50%', background:iconBg[popup.type], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', marginBottom:'12px' }}>{popup.icon||'ℹ️'}</div>
          <h2 style={{ fontSize:'18px', fontWeight:800, color:'#0F172A', textAlign:'center', margin:0 }}>{popup.title}</h2>
        </div>
        <p style={{ fontSize:'14px', color:'#64748B', textAlign:'center', padding:'8px 22px 18px', lineHeight:1.65 }} dangerouslySetInnerHTML={{ __html:popup.body.replace(/\n/g,'<br/>') }} />
        <div style={{ display:'flex', gap:'10px', padding:'0 18px 22px' }}>
          {popup.actions.map((a,i) => <button key={i} onClick={a.fn} style={{ flex:1, padding:'14px', borderRadius:'14px', fontSize:'14px', fontWeight:700, border:'none', cursor:'pointer', fontFamily:'DM Sans, sans-serif', background:btnBg[a.variant], color:btnClr[a.variant] }}>{a.label}</button>)}
        </div>
      </div>
    </div>
  )
}

export default function SponsoredPage() {
  const router = useRouter()
  const { showPopup, closePopup } = useStore()
  const [adScreen,  setAdScreen]  = useState(false)
  const [adData,    setAdData]    = useState<{ title:string; badge:string; sub:string }|null>(null)

  const handleAdClick = (ad: { title:string; badge:string; sub:string }) => {
    setAdData(ad); setAdScreen(true)
  }

  const handleAdConfirm = () => {
    setAdScreen(false)
    showPopup({
      type:'success', title:'Request Sent! ✅', icon:'✅',
      body:`We have received your request for ${adData?.title.replace('\n',' ')}.\nOur team will contact you shortly.`,
      actions:[{ label:'OK', variant:'primary', fn:closePopup }],
    })
  }

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
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Featured & Sponsored</span>
          <div style={{ width:'38px' }} />
        </div>

        {/* All ads in grid */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px', paddingBottom:'32px' }}>
          <div style={{ fontSize:'12px', color:'#94A3B8', marginBottom:'14px', lineHeight:1.6 }}>
            Trusted healthcare partners and services available near you.
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {ADS.map((ad, i) => (
              <div key={i} onClick={() => handleAdClick(ad)}
                style={{ borderRadius:'18px', padding:'18px', position:'relative', overflow:'hidden', cursor:'pointer', background:ad.grad, minHeight:'110px', transition:'transform 0.15s' }}
                onMouseDown={e=>(e.currentTarget.style.transform='scale(0.98)')}
                onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}
                onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
              >
                <div style={{ position:'absolute', bottom:'-30px', right:'-30px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'inline-block', color:'#fff', fontSize:'9px', fontWeight:700, padding:'3px 10px', borderRadius:'100px', marginBottom:'10px', letterSpacing:'0.8px', background:'rgba(255,255,255,0.2)' }}>
                      {ad.badge}
                    </div>
                    <div style={{ color:'#fff', fontSize:'16px', fontWeight:700, lineHeight:1.3, marginBottom:'6px', whiteSpace:'pre-line' }}>
                      {ad.title}
                    </div>
                    <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'12px', marginBottom:'14px' }}>
                      {ad.sub}
                    </div>
                    <div style={{ display:'inline-block', background:'#fff', fontSize:'12px', fontWeight:700, padding:'8px 16px', borderRadius:'100px', color:ad.ctaColor }}>
                      {ad.cta} →
                    </div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink:0, marginLeft:'12px', marginTop:'4px' }}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {adScreen && (
        <div style={{ position:'absolute', inset:0, zIndex:200 }}>
          <AdDetailScreen ad={adData} onBack={()=>setAdScreen(false)} onConfirm={handleAdConfirm} />
        </div>
      )}

      <PopupLayer />
    </MobileFrame>
  )
}