'use client'
import { useRouter } from 'next/navigation'
import MobileFrame from '@/components/MobileFrame'

const LICENSES = [
  { title:'Software License',          icon:'📄', desc:'CareBridge Partner App v2.5.0 is licensed for use by registered CareBridge partners only. Redistribution or resale is strictly prohibited.' },
  { title:'Business Registration',     icon:'🏢', desc:'CareBridge Technologies Pvt. Ltd.\nCIN: U72900DL2024PTC123456\nRegistered in Delhi, India' },
  { title:'GSTIN',                     icon:'🏛️', desc:'GSTIN: 07AABCC1234D1ZX\nRegistered under GST Act, 2017\nState: Delhi (Code 07)' },
  { title:'Healthcare Compliance',     icon:'🏥', desc:'CareBridge operates in compliance with the Clinical Establishments Act, 2010 and applicable state regulations for home healthcare services.' },
  { title:'Data Protection',           icon:'🔒', desc:'All user data is handled in accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.' },
  { title:'Payment License',           icon:'💳', desc:'Payment processing powered by RBI-regulated payment gateways. CareBridge does not store card or UPI details on its servers.' },
  { title:'Third-Party Integrations',  icon:'🔗', desc:'Google Maps API · Firebase Cloud Messaging · Razorpay Payment Gateway · AWS Cloud Infrastructure' },
]

export default function LicensesPage() {
  const router = useRouter()
  return (
    <MobileFrame>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>

        <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
        </div>

        <div style={{ height:'56px', background:'#fff', display:'flex', alignItems:'center', padding:'0 16px', gap:'10px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <button onClick={()=>router.back()} style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Licenses & Registration</span>
          <div style={{ width:'38px' }} />
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'14px', paddingBottom:'32px' }}>

          <div style={{ background:'linear-gradient(135deg,#065f52,#0D9488)', borderRadius:'20px', padding:'20px', marginBottom:'16px', color:'#fff', textAlign:'center' }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>🏅</div>
            <div style={{ fontSize:'18px', fontWeight:900 }}>CareBridge Technologies</div>
            <div style={{ fontSize:'13px', opacity:0.8, marginTop:'4px' }}>Officially registered & licensed in India</div>
          </div>

          <div style={{ background:'#fff', borderRadius:'18px', border:'1px solid #E2E8F0', overflow:'hidden' }}>
            {LICENSES.map((item,i) => (
              <div key={item.title} style={{ padding:'16px', borderBottom:i<LICENSES.length-1?'1px solid #F1F5F9':'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                  <span style={{ fontSize:'20px' }}>{item.icon}</span>
                  <div style={{ fontSize:'14px', fontWeight:800, color:'#0F172A' }}>{item.title}</div>
                </div>
                <div style={{ fontSize:'13px', color:'#64748B', lineHeight:1.65, whiteSpace:'pre-line' }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign:'center', padding:'20px', fontSize:'11px', color:'#94A3B8', lineHeight:1.6 }}>
            Version 2.5.0 · Build 2026.04.01<br/>© 2026 CareBridge Technologies Pvt. Ltd.
          </div>
        </div>
      </div>
    </MobileFrame>
  )
}