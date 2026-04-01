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

export default function CreditsPage() {
  const router = useRouter()
  const { showPopup, closePopup } = useStore()
  const [code,    setCode]    = useState('')
  const [balance, setBalance] = useState(250)
  const [history] = useState([
    { id:'g1', label:'Welcome Bonus',       amount:200,  date:'01 Mar 2026', type:'credit' },
    { id:'g2', label:'Referral — Suresh K', amount:100,  date:'15 Mar 2026', type:'credit' },
    { id:'g3', label:'Redeemed on booking', amount:-50,  date:'20 Mar 2026', type:'debit'  },
  ])

  const redeem = () => {
    const clean = code.trim().toUpperCase()
    if (!clean) { showPopup({ type:'warning', title:'Enter a Code', body:'Please enter a gift card or promo code.', icon:'⚠️', actions:[{ label:'OK', variant:'primary', fn:closePopup }] }); return }
    if (clean === 'CARE100') {
      setBalance(b => b + 100); setCode('')
      showPopup({ type:'success', title:'Code Applied! 🎉', body:'₹100 has been added to your CareBridge Credits.', icon:'🎁', actions:[{ label:'Great!', variant:'primary', fn:closePopup }] })
    } else {
      showPopup({ type:'error', title:'Invalid Code', body:'The code you entered is invalid or has already been used.', icon:'❌', actions:[{ label:'Try Again', variant:'primary', fn:closePopup }] })
    }
  }

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
            <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Gift Cards & Credits</span>
            <div style={{ width:'38px' }} />
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'14px', paddingBottom:'32px' }}>

            {/* Balance card */}
            <div style={{ background:'linear-gradient(135deg,#7C3AED,#6d28d9)', borderRadius:'22px', padding:'20px', marginBottom:'16px', color:'#fff', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
              <div style={{ fontSize:'11px', fontWeight:700, opacity:0.75, letterSpacing:'0.8px', textTransform:'uppercase' }}>CareBridge Credits</div>
              <div style={{ fontSize:'42px', fontWeight:900, letterSpacing:'-2px', margin:'4px 0' }}>₹{balance}</div>
              <div style={{ fontSize:'12px', opacity:0.75 }}>Available balance</div>
            </div>

            {/* Redeem input */}
            <div style={{ background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0', marginBottom:'16px' }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A', marginBottom:'10px' }}>🎁 Redeem Gift Card / Promo Code</div>
              <div style={{ display:'flex', gap:'8px' }}>
                <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Enter code (try CARE100)"
                  style={{ flex:1, padding:'12px 14px', background:'#F8FAFC', border:'1.5px solid #E2E8F0', borderRadius:'12px', fontSize:'14px', color:'#0F172A', fontFamily:'DM Sans, sans-serif', outline:'none' }} />
                <button onClick={redeem} style={{ padding:'12px 16px', background:'#0D9488', border:'none', borderRadius:'12px', color:'#fff', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif', flexShrink:0 }}>Apply</button>
              </div>
              <div style={{ fontSize:'11px', color:'#94A3B8', marginTop:'8px' }}>💡 Tip: Use code <strong>CARE100</strong> to get ₹100 credits</div>
            </div>

            {/* History */}
            <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'8px' }}>Credit History</div>
            <div style={{ background:'#fff', borderRadius:'18px', border:'1px solid #E2E8F0', overflow:'hidden' }}>
              {history.map((h, i) => (
                <div key={h.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', borderBottom:i<history.length-1?'1px solid #F1F5F9':'none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:h.type==='credit'?'#EDFAF7':'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px' }}>
                      {h.type==='credit'?'🎁':'💸'}
                    </div>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A' }}>{h.label}</div>
                      <div style={{ fontSize:'11px', color:'#94A3B8', marginTop:'2px' }}>{h.date}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:'15px', fontWeight:800, color:h.type==='credit'?'#16A34A':'#DC2626' }}>
                    {h.type==='credit'?'+':''}{h.amount<0?h.amount:`₹${h.amount}`}
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