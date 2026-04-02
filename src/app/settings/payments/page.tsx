'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import MobileFrame from '@/components/MobileFrame'

type TxStatus = 'paid' | 'pending' | 'processing' | 'refunded'
type TxType   = 'earning' | 'withdrawal' | 'refund' | 'bonus'

interface Tx {
  id:string; type:TxType; title:string; subtitle:string
  amount:number; status:TxStatus; date:string; ref:string
}

const SEED_TXS: Tx[] = [
  { id:'t1', type:'earning',    title:'Elder Care · Priya Sharma',    subtitle:'2 hrs · Rohini',           amount:480,  status:'paid',       date:'Today, 4:30 PM',  ref:'REF8821' },
  { id:'t2', type:'earning',    title:'Post-Surgery · Amit Verma',    subtitle:'3 hrs · Vasant Kunj',      amount:720,  status:'paid',       date:'Today, 11:00 AM', ref:'REF8820' },
  { id:'t3', type:'withdrawal', title:'Bank Withdrawal',              subtitle:'HDFC •••• 4242',           amount:2000, status:'processing', date:'Yesterday',       ref:'WD7731' },
  { id:'t4', type:'earning',    title:'Physiotherapy · Sunita Gupta', subtitle:'1.5 hrs · Lajpat Nagar',   amount:360,  status:'paid',       date:'28 Mar',          ref:'REF8810' },
  { id:'t5', type:'bonus',      title:'Performance Bonus',            subtitle:'March 2026 — Top Partner', amount:500,  status:'paid',       date:'27 Mar',          ref:'BON221' },
  { id:'t6', type:'refund',     title:'Cancelled Booking Refund',     subtitle:'Deepak Singh · Pitampura', amount:560,  status:'refunded',   date:'18 Mar',          ref:'REF7700' },
  { id:'t7', type:'earning',    title:'Medication · Kavita Nair',     subtitle:'1 hr · Green Park',        amount:240,  status:'paid',       date:'20 Mar',          ref:'REF8799' },
  { id:'t8', type:'withdrawal', title:'Bank Withdrawal',              subtitle:'HDFC •••• 4242',           amount:3500, status:'paid',       date:'15 Mar',          ref:'WD7680' },
]

const STATUS_CFG: Record<TxStatus,{bg:string;color:string;label:string}> = {
  paid:       { bg:'#DCFCE7', color:'#16A34A', label:'Paid' },
  pending:    { bg:'#FEF3C7', color:'#D97706', label:'Pending' },
  processing: { bg:'#EFF6FF', color:'#2563EB', label:'Processing' },
  refunded:   { bg:'#F5F3FF', color:'#7C3AED', label:'Refunded' },
}
const TYPE_CFG: Record<TxType,{icon:string;sign:string;color:string}> = {
  earning:    { icon:'💰', sign:'+', color:'#16A34A' },
  withdrawal: { icon:'🏦', sign:'-', color:'#DC2626' },
  refund:     { icon:'↩️', sign:'+', color:'#7C3AED' },
  bonus:      { icon:'⭐', sign:'+', color:'#D97706' },
}

type Filter = 'all' | TxType

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

export default function PaymentsPage() {
  const router = useRouter()
  const { showPopup, closePopup } = useStore()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter==='all' ? SEED_TXS : SEED_TXS.filter(t=>t.type===filter)
  const totalEarned    = SEED_TXS.filter(t=>t.type==='earning'||t.type==='bonus').reduce((s,t)=>s+t.amount,0)
  const totalWithdrawn = SEED_TXS.filter(t=>t.type==='withdrawal'&&t.status==='paid').reduce((s,t)=>s+t.amount,0)

  const handleView = (t:Tx) => {
    const tc=TYPE_CFG[t.type]; const sc=STATUS_CFG[t.status]
    showPopup({ type:'info', title:t.title, icon:tc.icon,
      body:`Amount: ${tc.sign}₹${t.amount}\nStatus: ${sc.label}\nDate: ${t.date}\nRef: ${t.ref}`,
      actions:[{ label:'Close', variant:'primary', fn:closePopup }]
    })
  }

  const handleDownload = (t:Tx) => showPopup({
    type:'success', title:'Receipt Downloaded', icon:'⬇️',
    body:`Receipt for ${t.title}\nAmount: ₹${t.amount}\nRef: ${t.ref}\n\nDownloaded to your device.`,
    actions:[{ label:'OK', variant:'primary', fn:closePopup }]
  })

  const handleShare = async (t:Tx) => {
    const text = `CareBridge Transaction\n${t.title}\nAmount: ₹${t.amount}\nDate: ${t.date}\nRef: ${t.ref}`
    if (navigator.share) {
      try { await navigator.share({ title:'Transaction Receipt', text }) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text)
        showPopup({ type:'success', title:'Copied!', icon:'📋', body:'Transaction details copied to clipboard.', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
      } catch {
        showPopup({ type:'info', title:'Share', icon:'📤', body:text, actions:[{ label:'Close', variant:'primary', fn:closePopup }] })
      }
    }
  }

  const FILTERS: { key:Filter; label:string }[] = [
    { key:'all', label:'All' },{ key:'earning', label:'Earnings' },
    { key:'withdrawal', label:'Withdrawals' },{ key:'bonus', label:'Bonus' },
  ]

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
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Payments & Transactions</span>
          <div style={{ width:'38px' }} />
        </div>

        {/* Summary */}
        <div style={{ background:'#fff', padding:'12px 14px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <div style={{ display:'flex', gap:'8px' }}>
            <div style={{ flex:1, background:'linear-gradient(135deg,#065f52,#0D9488)', borderRadius:'14px', padding:'12px' }}>
              <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Total Earned</div>
              <div style={{ fontSize:'20px', fontWeight:900, color:'#fff', marginTop:'2px' }}>₹{totalEarned.toLocaleString()}</div>
            </div>
            <div style={{ flex:1, background:'#F8FAFC', borderRadius:'14px', padding:'12px', border:'1px solid #E2E8F0' }}>
              <div style={{ fontSize:'10px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.5px' }}>Withdrawn</div>
              <div style={{ fontSize:'20px', fontWeight:900, color:'#DC2626', marginTop:'2px' }}>₹{totalWithdrawn.toLocaleString()}</div>
            </div>
            <div style={{ flex:1, background:'#F8FAFC', borderRadius:'14px', padding:'12px', border:'1px solid #E2E8F0' }}>
              <div style={{ fontSize:'10px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.5px' }}>Balance</div>
              <div style={{ fontSize:'20px', fontWeight:900, color:'#0D9488', marginTop:'2px' }}>₹{(totalEarned-totalWithdrawn).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ background:'#fff', padding:'10px 14px', borderBottom:'1px solid #E2E8F0', display:'flex', gap:'8px', overflowX:'auto', flexShrink:0 }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={()=>setFilter(f.key)} style={{ padding:'6px 14px', borderRadius:'100px', border:'none', cursor:'pointer', flexShrink:0, background:filter===f.key?'#0D9488':'#F1F5F9', color:filter===f.key?'#fff':'#64748B', fontSize:'12px', fontWeight:700, fontFamily:'DM Sans, sans-serif' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Transactions with View/Download/Share */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', paddingBottom:'32px' }}>
          {filtered.map(t => {
            const tc=TYPE_CFG[t.type]; const sc=STATUS_CFG[t.status]
            return (
              <div key={t.id} style={{ background:'#fff', borderRadius:'16px', padding:'13px 14px', marginBottom:'10px', border:'1px solid #E2E8F0' }}>
                {/* Transaction info */}
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px' }}>
                  <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>{tc.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.title}</div>
                    <div style={{ fontSize:'11px', color:'#94A3B8', marginTop:'2px' }}>{t.subtitle} · {t.date}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:'15px', fontWeight:800, color:tc.color }}>{tc.sign}₹{t.amount}</div>
                    <div style={{ background:sc.bg, color:sc.color, fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'100px', marginTop:'3px' }}>{sc.label}</div>
                  </div>
                </div>
                {/* View / Download / Share buttons */}
                <div style={{ display:'flex', gap:'6px' }}>
                  <button onClick={()=>handleView(t)} style={{ flex:1, padding:'7px 4px', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:'10px', fontSize:'11px', fontWeight:700, color:'#475569', cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>View
                  </button>
                  <button onClick={()=>handleDownload(t)} style={{ flex:1, padding:'7px 4px', background:'#EDFAF7', border:'1px solid #CCFBF1', borderRadius:'10px', fontSize:'11px', fontWeight:700, color:'#0D9488', cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download
                  </button>
                  <button onClick={()=>handleShare(t)} style={{ flex:1, padding:'7px 4px', background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'10px', fontSize:'11px', fontWeight:700, color:'#2563EB', cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <PopupLayer />
    </MobileFrame>
  )
}