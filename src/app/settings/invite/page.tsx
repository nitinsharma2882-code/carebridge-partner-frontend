'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

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

const REFERRAL_CODE = 'RAJAN2026'
const REFERRED = [
  { id:'r1', name:'Suresh Kumar',  phone:'+91 98765 11111', status:'joined',  earned:100, date:'15 Mar 2026' },
  { id:'r2', name:'Meena Verma',   phone:'+91 98765 22222', status:'joined',  earned:100, date:'20 Mar 2026' },
  { id:'r3', name:'Anil Sharma',   phone:'+91 98765 33333', status:'pending', earned:0,   date:'28 Mar 2026' },
]

export default function InvitePage() {
  const router = useRouter()
  const { showPopup, closePopup } = useStore()
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (typeof navigator !== 'undefined') navigator.clipboard?.writeText(REFERRAL_CODE).catch(()=>{})
    setCopied(true); setTimeout(()=>setCopied(false), 2000)
    showPopup({ type:'success', title:'Code Copied! 📋', body:`Referral code ${REFERRAL_CODE} copied to clipboard.`, icon:'📋', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
  }

  const share = () => {
    showPopup({ type:'info', title:'Share CareBridge', body:`Use my referral code ${REFERRAL_CODE} to join CareBridge as a partner!\nDownload: carebridge.in/partner`, icon:'📤',
      actions:[
        { label:'Share via WhatsApp', variant:'primary',   fn:()=>{ closePopup(); showPopup({ type:'success', title:'Opening WhatsApp…', body:'WhatsApp will open in the live app.', icon:'💬', actions:[{ label:'OK', variant:'primary', fn:closePopup }] }) } },
        { label:'Cancel',             variant:'secondary', fn:closePopup },
      ]
    })
  }

  const totalEarned = REFERRED.reduce((s,r)=>s+r.earned,0)

  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1e', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'390px', height:'844px', borderRadius:'48px', overflow:'hidden', position:'relative', flexShrink:0, boxShadow:'0 0 0 10px #1e293b, 0 0 0 12px #334155, 0 40px 80px rgba(0,0,0,0.8)', background:'#F8FAFC' }}>
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'126px', height:'34px', background:'#111827', borderRadius:'0 0 20px 20px', zIndex:50 }} />
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>

          <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
            <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
          </div>

          <div style={{ height:'56px', background:'#fff', display:'flex', alignItems:'center', padding:'0 16px', gap:'10px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
            <button onClick={()=>router.back()} style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
            <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Invite a Friend</span>
            <div style={{ width:'38px' }} />
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'14px', paddingBottom:'32px' }}>

            {/* Hero banner */}
            <div style={{ background:'linear-gradient(135deg,#065f52,#0D9488)', borderRadius:'22px', padding:'20px', marginBottom:'16px', color:'#fff', textAlign:'center', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'100px', height:'100px', borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
              <div style={{ fontSize:'36px', marginBottom:'8px' }}>👥</div>
              <div style={{ fontSize:'20px', fontWeight:900, letterSpacing:'-0.4px' }}>Earn ₹100 per referral</div>
              <div style={{ fontSize:'13px', opacity:0.8, marginTop:'6px', lineHeight:1.5 }}>Invite friends to join CareBridge as partners. You earn ₹100 when they complete their first booking.</div>
            </div>

            {/* Referral code */}
            <div style={{ background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0', marginBottom:'12px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'10px' }}>Your Referral Code</div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ flex:1, background:'#F8FAFC', borderRadius:'12px', padding:'14px 16px', border:'2px dashed #0D9488' }}>
                  <div style={{ fontSize:'24px', fontWeight:900, color:'#0D9488', letterSpacing:'4px', textAlign:'center' }}>{REFERRAL_CODE}</div>
                </div>
                <button onClick={copy} style={{ width:'48px', height:'48px', borderRadius:'14px', background:copied?'#DCFCE7':'#EDFAF7', border:`1.5px solid ${copied?'#16A34A':'#CCFBF1'}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                  {copied
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  }
                </button>
              </div>
              <button onClick={share} style={{ width:'100%', padding:'13px', background:'#0D9488', border:'none', borderRadius:'13px', color:'#fff', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif', marginTop:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share Referral Link
              </button>
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:'8px', marginBottom:'14px' }}>
              {[{ val:REFERRED.length, label:'Referred', bg:'#EFF6FF', color:'#2563EB' }, { val:REFERRED.filter(r=>r.status==='joined').length, label:'Joined', bg:'#DCFCE7', color:'#16A34A' }, { val:`₹${totalEarned}`, label:'Earned', bg:'#EDFAF7', color:'#0D9488' }].map(s => (
                <div key={s.label} style={{ flex:1, background:s.bg, borderRadius:'14px', padding:'12px', textAlign:'center' }}>
                  <div style={{ fontSize:'20px', fontWeight:900, color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:'10px', fontWeight:700, color:s.color, opacity:0.8, marginTop:'2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Referred list */}
            <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'8px' }}>Referred Friends</div>
            <div style={{ background:'#fff', borderRadius:'18px', border:'1px solid #E2E8F0', overflow:'hidden' }}>
              {REFERRED.map((r, i) => (
                <div key={r.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'13px 16px', borderBottom:i<REFERRED.length-1?'1px solid #F1F5F9':'none' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'linear-gradient(135deg,#0D9488,#065f52)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:800, color:'#fff', flexShrink:0 }}>
                    {r.name.charAt(0)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A' }}>{r.name}</div>
                    <div style={{ fontSize:'11px', color:'#94A3B8', marginTop:'2px' }}>{r.date}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ background:r.status==='joined'?'#DCFCE7':'#FEF3C7', color:r.status==='joined'?'#16A34A':'#D97706', fontSize:'10px', fontWeight:700, padding:'3px 9px', borderRadius:'100px' }}>
                      {r.status==='joined'?'✓ Joined':'⏳ Pending'}
                    </div>
                    {r.earned>0 && <div style={{ fontSize:'12px', fontWeight:700, color:'#16A34A', marginTop:'3px' }}>+₹{r.earned}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <PopupLayer />
      </div>
    </div>
  )
}