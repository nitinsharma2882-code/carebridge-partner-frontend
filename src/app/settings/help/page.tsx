'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import MobileFrame from '@/components/MobileFrame'

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

const FAQS = [
  { q:'How do I go online and start accepting bookings?', a:'Go to Home and toggle the Online/Offline switch to Online. You will start receiving nearby booking requests immediately.' },
  { q:'How are payments processed?', a:'Payments are credited to your CareBridge wallet after each completed booking. You can withdraw to your bank account from the Earnings section.' },
  { q:'What should I do if a customer cancels?', a:'If a customer cancels after you have started traveling, a cancellation fee may apply. Go to My Bookings to view the details.' },
  { q:'How do I update my documents?', a:'Go to My Profile → My Documents and tap on any document to upload or re-upload a clearer copy.' },
  { q:'What if I face a technical issue?', a:'Contact our support team at support@carebridge.in or call +91 98100 00911. We are available Mon–Sat, 9 AM – 6 PM.' },
  { q:'How is my rating calculated?', a:'Your rating is the average of all customer ratings you receive after completed bookings. Maintaining a rating above 4.0 keeps you as a preferred partner.' },
]

export default function HelpPage() {
  const router  = useRouter()
  const { showPopup, closePopup } = useStore()
  const [openFaq, setOpenFaq] = useState<number|null>(null)

  const contactSupport = () => showPopup({
    type:'info', title:'Contact Support', icon:'💬',
    body:'📧 Email: support@carebridge.in\n📞 Phone: +91 98100 00911\n🕐 Available: Mon–Sat, 9 AM – 6 PM',
    actions:[{ label:'OK', variant:'primary', fn:closePopup }]
  })

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
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Help & Support</span>
          <div style={{ width:'38px' }} />
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'14px', paddingBottom:'32px' }}>

          {/* Contact options */}
          <div style={{ background:'linear-gradient(135deg,#065f52,#0D9488)', borderRadius:'20px', padding:'20px', marginBottom:'16px', color:'#fff' }}>
            <div style={{ fontSize:'16px', fontWeight:800, marginBottom:'6px' }}>We're here to help 👋</div>
            <div style={{ fontSize:'13px', opacity:0.85, lineHeight:1.6, marginBottom:'14px' }}>Reach our support team for any issues with bookings, payments, or your account.</div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={contactSupport} style={{ flex:1, padding:'10px', background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'12px', color:'#fff', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
                💬 Chat Support
              </button>
              <button onClick={()=>{ if(typeof window!=='undefined') window.open('tel:+919810000911','_self') }} style={{ flex:1, padding:'10px', background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'12px', color:'#fff', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
                📞 Call Us
              </button>
            </div>
          </div>

          {/* Contact info */}
          <div style={{ background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0', marginBottom:'16px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px' }}>Contact Information</div>
            {[
              { icon:'📧', label:'Email',     val:'support@carebridge.in' },
              { icon:'📞', label:'Phone',     val:'+91 98100 00911' },
              { icon:'🕐', label:'Hours',     val:'Mon–Sat · 9 AM – 6 PM' },
              { icon:'📍', label:'Address',   val:'CareBridge HQ, New Delhi – 110001' },
            ].map((item,i,arr) => (
              <div key={item.label} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:i<arr.length-1?'1px solid #F1F5F9':'none' }}>
                <span style={{ fontSize:'20px', flexShrink:0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize:'11px', color:'#94A3B8', fontWeight:600 }}>{item.label}</div>
                  <div style={{ fontSize:'13px', color:'#0F172A', fontWeight:600, marginTop:'2px' }}>{item.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'10px' }}>
            Frequently Asked Questions
          </div>
          <div style={{ background:'#fff', borderRadius:'18px', border:'1px solid #E2E8F0', overflow:'hidden' }}>
            {FAQS.map((faq,i) => (
              <div key={i} style={{ borderBottom:i<FAQS.length-1?'1px solid #F1F5F9':'none' }}>
                <div onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', cursor:'pointer', background:openFaq===i?'#F8FAFC':'#fff' }}>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A', flex:1, paddingRight:'12px', lineHeight:1.4 }}>{faq.q}</div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink:0, transition:'transform 0.2s', transform:openFaq===i?'rotate(180deg)':'rotate(0deg)' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                {openFaq===i && (
                  <div style={{ padding:'0 16px 14px', fontSize:'13px', color:'#64748B', lineHeight:1.65, background:'#F8FAFC' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <PopupLayer />
    </MobileFrame>
  )
}