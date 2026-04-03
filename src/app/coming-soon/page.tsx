'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import MobileFrame from '@/components/MobileFrame'
import { COMING_ITEMS } from '@/components/ComingSoonSection'

// Per-feature popup content
const FEATURE_INFO: Record<string, { icon:string; description:string; eta:string; benefits:string[] }> = {
  'AI Health\nAssistant': {
    icon:'🤖',
    description:'An intelligent AI-powered health assistant available 24/7 to answer medical queries, provide guidance on symptoms, and help you assist patients more effectively.',
    eta:'Q2 2026',
    benefits:['Instant medical Q&A','Symptom checker','Drug interaction alerts','Personalized care tips'],
  },
  'Medicine\nSubscription': {
    icon:'💊',
    description:'Auto-refill your essential medicines every month. Set up once and never worry about running out. Delivered to your doorstep on schedule.',
    eta:'Q2 2026',
    benefits:['Auto-refill monthly','Doorstep delivery','Up to 30% discount','Prescription management'],
  },
  'Home Lab\nTests': {
    icon:'🧪',
    description:'Book certified lab technicians to collect blood and urine samples at home. Results delivered digitally within 24 hours.',
    eta:'Q3 2026',
    benefits:['100+ tests available','Certified technicians','Digital reports','NABL certified labs'],
  },
  'Doctor Video\nConsult': {
    icon:'👨‍⚕️',
    description:'Connect face-to-face with qualified doctors from the comfort of your home. Get prescriptions, follow-ups, and specialist referrals instantly.',
    eta:'Q2 2026',
    benefits:['500+ specialist doctors','Instant consultation','Digital prescriptions','24/7 availability'],
  },
  'Pharmacy\nDelivery': {
    icon:'🏥',
    description:'Order medicines and healthcare products online and get them delivered within 2 hours. Upload prescriptions directly through the app.',
    eta:'Q3 2026',
    benefits:['2-hour delivery','Prescription upload','Genuine medicines','Track your order'],
  },
  'Health\nInsurance': {
    icon:'🛡️',
    description:'Affordable health insurance plans designed specifically for CareBridge partners. Get coverage for yourself and your family starting at just ₹999/year.',
    eta:'Q3 2026',
    benefits:['From ₹999/year','Family coverage','Cashless hospitals','No claim bonus'],
  },
  'Mental Health\nSupport': {
    icon:'🧠',
    description:'Talk to licensed counsellors and therapists for stress, anxiety, burnout, and emotional wellbeing. Confidential sessions available anytime.',
    eta:'Q4 2026',
    benefits:['Licensed therapists','100% confidential','Text & video sessions','Flexible scheduling'],
  },
  'Elder Care\nMonitoring': {
    icon:'👴',
    description:'Remote 24/7 health monitoring for elderly patients using smart devices. Track vitals, detect falls, and get real-time alerts for emergencies.',
    eta:'Q4 2026',
    benefits:['24/7 vitals tracking','Fall detection','SOS alerts','Family dashboard'],
  },
}

function PopupLayer() {
  const { popup, closePopup } = useStore()
  if (!popup) return null
  const iconBg: Record<string,string> = { success:'#DCFCE7', warning:'#FEF3C7', error:'#FEE2E2', confirm:'#EDE9FE', info:'#EDFAF7' }
  const btnBg:  Record<string,string> = { primary:'#0D9488', secondary:'#F1F5F9', danger:'#DC2626', warning:'#D97706' }
  const btnClr: Record<string,string> = { primary:'#fff', secondary:'#475569', danger:'#fff', warning:'#fff' }
  return (
    <div onClick={e=>{ if(e.target===e.currentTarget) closePopup() }}
      style={{ position:'absolute', inset:0, zIndex:100, background:'rgba(15,23,42,0.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'22px', width:'100%', overflow:'hidden', maxHeight:'85vh', overflowY:'auto' }}>
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

export default function ComingSoonPage() {
  const router   = useRouter()
  const { showPopup, closePopup } = useStore()

  const handleItemClick = (item: typeof COMING_ITEMS[0]) => {
    const info = FEATURE_INFO[item.title]
    if (!info) return

    showPopup({
      type:'info',
      title:item.title.replace('\n',' '),
      icon:info.icon,
      body:`${info.description}\n\n✨ Key Benefits:\n${info.benefits.map(b=>`• ${b}`).join('\n')}\n\n📅 Expected Launch: ${info.eta}`,
      actions:[
        { label:'Notify Me 🔔', variant:'primary',   fn:closePopup },
        { label:'Close',        variant:'secondary', fn:closePopup },
      ],
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
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Coming Soon</span>
          <div style={{ width:'38px' }} />
        </div>

        {/* All items — scrollable */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px', paddingBottom:'32px' }}>

          {/* Hero banner */}
          <div style={{ background:'linear-gradient(135deg,#0F172A,#134E4A)', borderRadius:'20px', padding:'20px', marginBottom:'16px', textAlign:'center', color:'#fff', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'100px', height:'100px', borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>🚀</div>
            <div style={{ fontSize:'18px', fontWeight:900, letterSpacing:'-0.4px' }}>Big things are coming</div>
            <div style={{ fontSize:'13px', opacity:0.7, marginTop:'6px', lineHeight:1.5 }}>
              Tap any feature to learn more about what's coming!
            </div>
          </div>

          <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px' }}>
            {COMING_ITEMS.length} Features in Pipeline · Tap to explore
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {COMING_ITEMS.map((item, i) => {
              const info = FEATURE_INFO[item.title]
              return (
                <div key={i} onClick={() => handleItemClick(item)}
                  style={{ borderRadius:'18px', padding:'16px 18px', background:item.grad, position:'relative', overflow:'hidden', cursor:'pointer' }}
                  onMouseDown={e=>(e.currentTarget.style.transform='scale(0.98)')}
                  onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}
                  onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
                >
                  <div style={{ position:'absolute', bottom:'-20px', right:'-20px', width:'80px', height:'80px', borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                        <div style={{ display:'inline-block', color:'#fff', fontSize:'9px', fontWeight:700, padding:'3px 10px', borderRadius:'100px', letterSpacing:'0.8px', background:'rgba(255,255,255,0.18)' }}>
                          {item.badge}
                        </div>
                        {info?.eta && (
                          <div style={{ display:'inline-block', color:'rgba(255,255,255,0.8)', fontSize:'9px', fontWeight:600, padding:'3px 8px', borderRadius:'100px', background:'rgba(0,0,0,0.2)' }}>
                            {info.eta}
                          </div>
                        )}
                      </div>
                      <div style={{ color:'#fff', fontSize:'15px', fontWeight:700, lineHeight:1.3, marginBottom:'4px', whiteSpace:'pre-line' }}>
                        {item.title}
                      </div>
                      <div style={{ color:'rgba(255,255,255,0.65)', fontSize:'12px' }}>
                        {item.sub}
                      </div>
                    </div>
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginLeft:'12px', fontSize:'18px' }}>
                      {info?.icon || '⏳'}
                    </div>
                  </div>
                  {/* Tap hint */}
                  <div style={{ marginTop:'10px', display:'flex', alignItems:'center', gap:'4px' }}>
                    <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.55)', fontWeight:600 }}>Tap to learn more →</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Notify me */}
          <div style={{ background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0', marginTop:'16px', textAlign:'center' }}>
            <div style={{ fontSize:'14px', fontWeight:800, color:'#0F172A', marginBottom:'4px' }}>🔔 Get Notified First</div>
            <div style={{ fontSize:'12px', color:'#64748B', lineHeight:1.6, marginBottom:'14px' }}>
              We'll notify you as soon as any of these features are ready.
            </div>
            <button onClick={()=>router.back()} style={{ width:'100%', padding:'14px', background:'#0D9488', border:'none', borderRadius:'13px', color:'#fff', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
              Notify Me →
            </button>
          </div>
        </div>
      </div>
      <PopupLayer />
    </MobileFrame>
  )
}