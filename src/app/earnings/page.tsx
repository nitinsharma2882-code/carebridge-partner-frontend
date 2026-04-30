'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { AssistantAPI } from '@/lib/api'
import MobileFrame from '@/components/MobileFrame'
import BottomNav from '@/components/BottomNav'

type Tab = 'daily' | 'weekly' | 'monthly'
type TxStatus = 'paid' | 'pending' | 'processing'
interface Tx { id:string; icon:string; type:string; customer:string; date:string; duration:string; amount:number; status:TxStatus }

interface SavedCard { id:string; label:string; bank:string; last4:string; expiry:string; type:'visa'|'mastercard'; primary:boolean }
const SAVED_CARDS: SavedCard[] = [
  { id:'c1', label:'HDFC Visa',      bank:'HDFC Bank', last4:'4242', expiry:'08/27', type:'visa',       primary:true  },
  { id:'c2', label:'SBI Mastercard', bank:'SBI',       last4:'8810', expiry:'12/26', type:'mastercard', primary:false },
  { id:'c3', label:'Axis Bank Visa', bank:'Axis Bank', last4:'3391', expiry:'03/28', type:'visa',       primary:false },
]
const statusStyle: Record<TxStatus,{color:string;bg:string;label:string}> = {
  paid:       { color:'#16A34A', bg:'#DCFCE7', label:'● Paid' },
  pending:    { color:'#D97706', bg:'#FEF3C7', label:'○ Pending' },
  processing: { color:'#2563EB', bg:'#EFF6FF', label:'⟳ Processing' },
}
const fmt = (n:number) => `₹${n.toLocaleString('en-IN')}`
const serviceIcon: Record<string,string> = { ambulance:'🚑', opd_assistant:'🩺', nursing:'💉', general:'🏥' }

function formatTxDate(iso:string) {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    const time = d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
    if (diffDays === 0) return `Today, ${time}`
    if (diffDays === 1) return `Yesterday, ${time}`
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' }) + `, ${time}`
  } catch { return iso }
}

function Skeleton({ w='100%', h=16, r=8 }: { w?:string|number; h?:number; r?:number }) {
  return <div style={{ width:w, height:h, borderRadius:r, background:'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
}

function PopupLayer() {
  const { popup, closePopup } = useStore()
  if (!popup) return null
  const iconBg:Record<string,string> = { success:'#DCFCE7', warning:'#FEF3C7', error:'#FEE2E2', confirm:'#EDE9FE', info:'#EDFAF7' }
  const btnBg: Record<string,string> = { primary:'#0D9488', secondary:'#F1F5F9', danger:'#DC2626', warning:'#D97706' }
  const btnClr:Record<string,string> = { primary:'#fff', secondary:'#475569', danger:'#fff', warning:'#fff' }
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

function WithdrawModal({ open, available, onClose }: { open:boolean; available:number; onClose:()=>void }) {
  const [amount,         setAmount]         = useState(String(available || 0))
  const [selectedCardId, setSelectedCardId] = useState(SAVED_CARDS[0].id)
  const [loading,        setLoading]        = useState(false)
  const { showPopup, closePopup } = useStore()
  const selectedCard = SAVED_CARDS.find(c => c.id === selectedCardId)!

  useEffect(() => { setAmount(String(available || 0)) }, [available])

  const confirm = async () => {
    const amt = parseInt(amount)
    if (!amt || amt < 100) {
      showPopup({ type:'warning', title:'Invalid Amount', body:'Minimum withdrawal amount is ₹100.', icon:'⚠️', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
      return
    }
    if (amt > available) {
      showPopup({ type:'warning', title:'Insufficient Balance', body:`You only have ${fmt(available)} available.`, icon:'⚠️', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
      return
    }
    setLoading(true)
    try {
      await AssistantAPI.withdraw(amt, selectedCard.last4)
      onClose()
      setTimeout(() => {
        showPopup({
          type:'success', title:'Withdrawal Initiated! ✅',
          body:`Amount: ${fmt(amt)}\nCard: ${selectedCard.label} •••• ${selectedCard.last4}\n\nFunds arrive in 1–2 business days.`,
          icon:'✅', actions:[{ label:'Done', variant:'primary', fn:closePopup }],
        })
      }, 300)
    } catch (err:any) {
      const msg = err?.response?.data?.message || 'Withdrawal failed. Please try again.'
      showPopup({ type:'error', title:'Withdrawal Failed', body:msg, icon:'❌', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
    } finally { setLoading(false) }
  }

  if (!open) return null
  const quickAmounts = [500, 1000, 2500, available].filter((v,i,a) => v > 0 && a.indexOf(v) === i).slice(0,4)

  return (
    <div onClick={e=>{ if(e.target===e.currentTarget) onClose() }}
      style={{ position:'absolute', inset:0, zIndex:200, background:'rgba(15,23,42,0.55)', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div style={{ background:'#fff', borderRadius:'28px 28px 0 0', padding:'0 20px 36px', maxHeight:'90%', overflowY:'auto' }}>
        <div style={{ width:'36px', height:'4px', background:'#E2E8F0', borderRadius:'2px', margin:'14px auto 20px' }} />
        <h3 style={{ fontSize:'20px', fontWeight:800, color:'#0F172A', letterSpacing:'-0.4px', marginBottom:'4px' }}>Withdraw Earnings</h3>
        <p style={{ fontSize:'13px', color:'#64748B', marginBottom:'20px', lineHeight:1.55 }}>
          Available: <strong style={{ color:'#0D9488' }}>{fmt(available)}</strong>. Select a saved card to receive your funds.
        </p>

        <label style={{ fontSize:'13px', fontWeight:700, color:'#0F172A', display:'block', marginBottom:'8px' }}>Withdrawal Amount</label>
        <div style={{ position:'relative', marginBottom:'12px' }}>
          <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'16px', fontWeight:800, color:'#64748B' }}>₹</span>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)}
            style={{ width:'100%', paddingLeft:'30px', paddingRight:'14px', paddingTop:'14px', paddingBottom:'14px', background:'#F8FAFC', border:'1.5px solid #E2E8F0', borderRadius:'14px', fontSize:'18px', fontWeight:700, color:'#0F172A', outline:'none', fontFamily:'DM Sans, sans-serif', boxSizing:'border-box' }}
            onFocus={e=>{ e.target.style.borderColor='#0D9488'; e.target.style.background='#EDFAF7' }}
            onBlur={e=>{ e.target.style.borderColor='#E2E8F0'; e.target.style.background='#F8FAFC' }}
          />
        </div>

        <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
          {quickAmounts.map(amt => (
            <button key={amt} onClick={()=>setAmount(String(amt))}
              style={{ flex:1, padding:'8px 4px', background:parseInt(amount)===amt?'#0D9488':'#F1F5F9', border:'none', borderRadius:'10px', fontSize:'12px', fontWeight:700, color:parseInt(amount)===amt?'#fff':'#64748B', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
              {fmt(amt)}
            </button>
          ))}
        </div>

        <label style={{ fontSize:'13px', fontWeight:700, color:'#0F172A', display:'block', marginBottom:'10px' }}>Select Payment Card</label>
        <div style={{ fontSize:'11px', color:'#94A3B8', marginBottom:'10px', display:'flex', alignItems:'center', gap:'4px' }}>
          <span>💳</span> Only saved cards are supported for withdrawals
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'20px' }}>
          {SAVED_CARDS.map(card => {
            const isSelected = selectedCardId === card.id
            return (
              <div key={card.id} onClick={() => setSelectedCardId(card.id)}
                style={{ display:'flex', alignItems:'center', gap:'13px', padding:'13px 16px', background:isSelected?'#EDFAF7':'#F8FAFC', border:`1.5px solid ${isSelected?'#0D9488':'#E2E8F0'}`, borderRadius:'14px', cursor:'pointer' }}>
                <div style={{ width:'44px', height:'30px', borderRadius:'8px', background:card.type==='visa'?'linear-gradient(135deg,#1a1a2e,#16213e)':'linear-gradient(135deg,#e65c00,#f9d423)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 }}>{card.type==='visa'?'💙':'🔴'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'#0F172A' }}>{card.label}</div>
                  <div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>{card.bank} · •••• {card.last4} · Exp {card.expiry}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
                  {card.primary && <div style={{ background:'#EDFAF7', color:'#0D9488', fontSize:'9px', fontWeight:700, padding:'2px 8px', borderRadius:'100px' }}>PRIMARY</div>}
                  <div style={{ width:'20px', height:'20px', borderRadius:'50%', border:`2px solid ${isSelected?'#0D9488':'#CBD5E1'}`, background:isSelected?'#0D9488':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {isSelected && <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#fff' }} />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ background:'#FEF3C7', borderRadius:'12px', padding:'12px 14px', marginBottom:'20px', display:'flex', gap:'8px' }}>
          <span style={{ fontSize:'16px', flexShrink:0 }}>⏱</span>
          <div style={{ fontSize:'13px', color:'#D97706', lineHeight:1.5 }}>Processing time: <strong>1–2 business days.</strong> Amount will reflect in your selected card's linked bank account.</div>
        </div>

        <div style={{ background:'#F8FAFC', borderRadius:'14px', padding:'14px 16px', marginBottom:'20px', border:'1px solid #E2E8F0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
            <span style={{ fontSize:'13px', color:'#64748B' }}>Withdrawal Amount</span>
            <span style={{ fontSize:'13px', fontWeight:700, color:'#0F172A' }}>{fmt(parseInt(amount||'0'))}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
            <span style={{ fontSize:'13px', color:'#64748B' }}>Processing Fee</span>
            <span style={{ fontSize:'13px', fontWeight:700, color:'#16A34A' }}>FREE</span>
          </div>
          <div style={{ borderTop:'1px solid #E2E8F0', paddingTop:'8px', display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:'14px', fontWeight:700, color:'#0F172A' }}>You Receive</span>
            <span style={{ fontSize:'16px', fontWeight:900, color:'#0D9488' }}>{fmt(parseInt(amount||'0'))}</span>
          </div>
        </div>

        <button onClick={confirm} disabled={loading}
          style={{ width:'100%', padding:'16px', background:loading?'#94A3B8':'#0D9488', border:'none', borderRadius:'14px', color:'#fff', fontSize:'16px', fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:'DM Sans, sans-serif', marginBottom:'10px' }}>
          {loading ? 'Processing…' : 'Confirm Withdrawal →'}
        </button>
        <button onClick={onClose} disabled={loading}
          style={{ width:'100%', padding:'15px', background:'transparent', border:'1.5px solid #E2E8F0', borderRadius:'14px', color:'#64748B', fontSize:'15px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function EarningsPage() {
  const [tab,          setTab]          = useState<Tab>('daily')
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [loading,      setLoading]      = useState(true)
  const [earnings,     setEarnings]     = useState<any>(null)
  const [transactions, setTransactions] = useState<Tx[]>([])
  const [available,    setAvailable]    = useState(0)
  const { showPopup, closePopup } = useStore()
  const router = useRouter()

  useEffect(() => {
    AssistantAPI.getEarnings()
      .then(res => {
        const data = res.data
        if (data.success) {
          setEarnings(data)
          setAvailable(data.available ?? data.availableBalance ?? 0)
          const rawTx: any[] = data.transactions || data.earnings || []
          const normalised: Tx[] = rawTx.map((t:any, i:number) => ({
            id:       t._id || t.id || String(i),
            icon:     serviceIcon[t.serviceType || t.bookingId?.serviceType] || '🏥',
            type:     t.serviceType === 'ambulance' ? 'Ambulance' : t.serviceType === 'opd_assistant' ? 'OPD Assist' : 'Healthcare',
            customer: t.bookingId?.userId?.name || t.customerName || 'Customer',
            date:     formatTxDate(t.createdAt || t.date || ''),
            duration: t.duration || '—',
            amount:   t.amount || 0,
            status:   (t.status === 'completed' ? 'paid' : t.status) as TxStatus,
          }))
          setTransactions(normalised)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const build = (period: Tab) => {
    if (!earnings) return { total:'₹0', subtitle:'No data yet', stats:[{v:'0',l:'Trips'},{v:'₹0',l:'Avg/trip'},{v:'—',l:'Rating'}], bars:[{h:20,l:'—',active:true}], chartTitle:'Earnings', chartRange:'', s1:'₹0', sl1:'Total', s2:'₹0', sl2:'Avg', s3:'₹0', sl3:'Best' }
    const now = new Date()
    const periodMap: Record<Tab,{key:string;title:string;range:string}> = {
      daily:   { key:'today', title:'Daily Earnings',   range: now.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) },
      weekly:  { key:'week',  title:'Weekly Earnings',  range: now.toLocaleDateString('en-IN',{month:'short',year:'numeric'}) },
      monthly: { key:'month', title:'Monthly Earnings', range: String(now.getFullYear()) },
    }
    const { key, title, range } = periodMap[period]
    const p = earnings[key] || {}
    const total = p.total ?? 0
    const trips = p.trips ?? 0
    const avg   = trips > 0 ? Math.round(total / trips) : 0
    const rating = p.rating ?? earnings.rating ?? '—'
    const best   = p.best ?? total
    const lastPeriod = p.lastPeriod ?? p.lastWeek ?? p.lastMonth ?? 0
    const pctChange  = lastPeriod > 0 ? Math.round(((total - lastPeriod) / lastPeriod) * 100) : 0
    const subtitle   = trips > 0
      ? `${pctChange >= 0 ? '↑' : '↓'} ${Math.abs(pctChange)}% vs last ${period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month'} · ${trips} trip${trips !== 1 ? 's' : ''}`
      : 'No trips yet this period'
    const days = earnings.dailyBreakdown || p.breakdown || []
    const barData = days.length > 0
      ? (() => { const max = Math.max(...days.map((d:any)=>d.amount||0), 1); return days.map((d:any,i:number)=>({h:Math.max(8,Math.round((d.amount/max)*90)),l:d.label||String(i+1),active:i===days.length-1})) })()
      : [{ h: total > 0 ? 80 : 20, l: period==='daily'?'Today':period==='weekly'?'Wk':'Mo', active:true }]
    return { total:fmt(total), subtitle, stats:[{v:String(trips),l:'Trips'},{v:fmt(avg),l:'Avg/trip'},{v:`${rating}★`,l:'Rating'}], bars:barData, chartTitle:title, chartRange:range, s1:fmt(total), sl1:period==='daily'?'Today':period==='weekly'?'This week':'This month', s2:fmt(avg), sl2:'Avg/trip', s3:fmt(best), sl3:`Best ${period==='daily'?'day':period==='weekly'?'week':'month'}` }
  }

  const d = build(tab)

  const openTx = (tx: Tx) => {
    showPopup({ type:'info', title:`${tx.type} — ₹${tx.amount}`, body:`Customer: ${tx.customer}\nDate: ${tx.date}\nDuration: ${tx.duration}\nRef: CB-${tx.id.toUpperCase().slice(-8)}`, icon:tx.icon,
      actions:[
        { label:'Download Receipt', variant:'primary',   fn:() => { closePopup(); showPopup({ type:'success', title:'Receipt downloaded ✓', body:'', icon:'✅', actions:[{ label:'OK', variant:'primary', fn:closePopup }] }) } },
        { label:'Close',            variant:'secondary', fn:closePopup },
      ],
    })
  }

  return (
    <MobileFrame>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>
        <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
        </div>
        <div style={{ height:'56px', background:'#fff', display:'flex', alignItems:'center', padding:'0 16px', gap:'10px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <button onClick={() => router.back()} style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Earnings</span>
          <button onClick={() => setShowWithdraw(true)} style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#EDFAF7', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </button>
        </div>

        <div style={{ flex:1, overflowY:'auto', paddingBottom:'90px' }}>
          <div style={{ margin:'14px 14px 12px', borderRadius:'22px', padding:'20px', background:'linear-gradient(135deg,#065f52,#0D9488,#14b8a6)', color:'#fff', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'150px', height:'150px', borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
            <div style={{ fontSize:'11px', fontWeight:700, opacity:0.75, letterSpacing:'0.8px', textTransform:'uppercase' }}>{tab==='daily'?'Today':tab==='weekly'?'This Week':'This Month'}</div>
            {loading ? <div style={{ margin:'8px 0 14px' }}><Skeleton h={44} r={8} /></div> : <div style={{ fontSize:'40px', fontWeight:900, letterSpacing:'-2px', margin:'4px 0 3px' }}>{d.total}</div>}
            <div style={{ fontSize:'13px', opacity:0.75, marginBottom:'16px' }}>{loading ? '...' : d.subtitle}</div>
            <div style={{ display:'flex', gap:'8px' }}>
              {loading
                ? [0,1,2].map(i => <div key={i} style={{ flex:1, background:'rgba(255,255,255,0.15)', borderRadius:'12px', padding:'10px 12px' }}><Skeleton h={17} w="60%" /><Skeleton h={10} w="80%" /></div>)
                : d.stats.map(s => <div key={s.l} style={{ flex:1, background:'rgba(255,255,255,0.15)', borderRadius:'12px', padding:'10px 12px' }}><div style={{ fontSize:'17px', fontWeight:800 }}>{s.v}</div><div style={{ fontSize:'10px', opacity:0.7, fontWeight:600, marginTop:'2px' }}>{s.l}</div></div>)
              }
            </div>
          </div>

          <div style={{ display:'flex', background:'#E2E8F0', borderRadius:'12px', padding:'3px', margin:'0 14px 14px' }}>
            {(['daily','weekly','monthly'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:'9px', background:tab===t?'#fff':'transparent', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, color:tab===t?'#0D9488':'#94A3B8', cursor:'pointer', boxShadow:tab===t?'0 1px 6px rgba(0,0,0,0.1)':'none', transition:'all 0.2s', fontFamily:'DM Sans, sans-serif' }}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ margin:'0 14px 12px', background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <span style={{ fontSize:'14px', fontWeight:800, color:'#0F172A' }}>{d.chartTitle}</span>
              <span style={{ fontSize:'12px', color:'#0D9488', fontWeight:700 }}>{d.chartRange}</span>
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:'6px', height:'100px', marginBottom:'10px' }}>
              {d.bars.map((b,i) => (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', height:'100%', justifyContent:'flex-end' }}>
                  <div style={{ width:'100%', borderRadius:'6px 6px 0 0', height:`${b.h}%`, background:b.active?'#0D9488':'#CCFBF1', border:b.active?'2px solid #0F766E':'none', transition:'height 0.5s' }} />
                  <div style={{ fontSize:'10px', fontWeight:b.active?700:600, color:b.active?'#0D9488':'#94A3B8' }}>{b.l}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-around', paddingTop:'12px', borderTop:'1px solid #F1F5F9' }}>
              {[{v:d.s1,l:d.sl1},{v:d.s2,l:d.sl2},{v:d.s3,l:d.sl3}].map(s => (
                <div key={s.l} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'18px', fontWeight:800, color:'#0F172A' }}>{loading ? '—' : s.v}</div>
                  <div style={{ fontSize:'11px', color:'#94A3B8', marginTop:'2px' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ margin:'0 14px 12px', background:'#EDFAF7', borderRadius:'16px', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', border:'1px solid #CCFBF1' }}>
            <div>
              <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A' }}>Available to Withdraw</div>
              <div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>Ready to transfer to your card</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:'20px', fontWeight:900, color:'#0D9488' }}>{loading ? '…' : fmt(available)}</div>
              <button onClick={() => setShowWithdraw(true)} style={{ background:'#0D9488', border:'none', borderRadius:'8px', color:'#fff', fontSize:'11px', fontWeight:700, padding:'4px 10px', cursor:'pointer', marginTop:'4px', fontFamily:'DM Sans, sans-serif' }}>Withdraw →</button>
            </div>
          </div>

          <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', padding:'4px 16px 8px' }}>Payment History</div>

          {loading && [0,1,2,3].map(i => (
            <div key={i} style={{ margin:'0 14px 8px', background:'#fff', borderRadius:'16px', padding:'14px', display:'flex', alignItems:'center', justifyContent:'space-between', border:'1px solid #E2E8F0' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'#F1F5F9' }} />
                <div><Skeleton h={14} w={120} /><div style={{ marginTop:6 }}><Skeleton h={12} w={90} /></div></div>
              </div>
              <div style={{ textAlign:'right' }}><Skeleton h={16} w={60} /><div style={{ marginTop:4 }}><Skeleton h={11} w={50} /></div></div>
            </div>
          ))}

          {!loading && transactions.length === 0 && (
            <div style={{ textAlign:'center', padding:'30px 20px', color:'#94A3B8' }}>
              <div style={{ fontSize:'36px', marginBottom:'8px' }}>💸</div>
              <div style={{ fontSize:'14px', fontWeight:600 }}>No transactions yet</div>
              <div style={{ fontSize:'12px', marginTop:'4px' }}>Complete trips to see your earnings here</div>
            </div>
          )}

          {!loading && transactions.map(tx => {
            const s = statusStyle[tx.status] || statusStyle.pending
            return (
              <div key={tx.id} onClick={() => openTx(tx)} style={{ margin:'0 14px 8px', background:'#fff', borderRadius:'16px', padding:'14px', display:'flex', alignItems:'center', justifyContent:'space-between', border:'1px solid #E2E8F0', cursor:'pointer' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'#EDFAF7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>{tx.icon}</div>
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:700, color:'#0F172A' }}>{tx.type}</div>
                    <div style={{ fontSize:'12px', color:'#94A3B8', marginTop:'2px' }}>{tx.date} · {tx.customer}</div>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'16px', fontWeight:800, color:tx.status==='paid'?'#16A34A':tx.status==='pending'?'#D97706':'#2563EB' }}>+{fmt(tx.amount)}</div>
                  <div style={{ fontSize:'11px', fontWeight:700, color:s.color, marginTop:'2px' }}>{s.label}</div>
                </div>
              </div>
            )
          })}

          <div style={{ padding:'8px 14px 8px' }}>
            <button onClick={() => setShowWithdraw(true)} style={{ width:'100%', padding:'16px', background:'#0D9488', border:'none', borderRadius:'14px', color:'#fff', fontSize:'16px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
              {loading ? 'Loading…' : `Withdraw ${fmt(available)} →`}
            </button>
          </div>
        </div>
      </div>

      <BottomNav active="Earnings" />
      <PopupLayer />
      <WithdrawModal open={showWithdraw} available={available} onClose={() => setShowWithdraw(false)} />
    </MobileFrame>
  )
}
