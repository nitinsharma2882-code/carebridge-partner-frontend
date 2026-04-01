'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import MobileFrame from '@/components/MobileFrame'
import BottomNav from '@/components/BottomNav'

type Tab = 'daily' | 'weekly' | 'monthly'
type TxStatus = 'paid' | 'pending' | 'processing'
interface Tx { id:string; icon:string; type:string; customer:string; date:string; duration:string; amount:number; status:TxStatus }

const tabData = {
  daily:   { total:'₹1,240',  subtitle:'↑ 18% more than yesterday',          stats:[{v:'5',l:'Trips'},{v:'₹248',l:'Avg/trip'},{v:'4.9★',l:'Rating'}], bars:[{h:48,l:'Mon'},{h:65,l:'Tue'},{h:38,l:'Wed'},{h:82,l:'Thu'},{h:55,l:'Fri'},{h:92,l:'Sat'},{h:70,l:'Sun',active:true}], chartTitle:'Daily Earnings',   chartRange:'Mar 22–28', s1:'₹1,240', sl1:'Today',      s2:'₹248',   sl2:'Avg/day',   s3:'₹1,820',  sl3:'Best day' },
  weekly:  { total:'₹8,640',  subtitle:'↑ 12% vs last week · 28 trips',      stats:[{v:'28',l:'Trips'},{v:'₹308',l:'Avg/trip'},{v:'4.9★',l:'Rating'}], bars:[{h:60,l:'W1'},{h:75,l:'W2'},{h:45,l:'W3'},{h:88,l:'W4'},{h:70,l:'W5',active:true},{h:55,l:'W6'},{h:82,l:'W7'}], chartTitle:'Weekly Earnings',  chartRange:'Mar 2026',  s1:'₹8,640', sl1:'This week',  s2:'₹7,200', sl2:'Last week', s3:'₹10,200', sl3:'Best week' },
  monthly: { total:'₹31,200', subtitle:'↑ 8% vs last month · 104 trips',     stats:[{v:'104',l:'Trips'},{v:'₹300',l:'Avg/trip'},{v:'4.9★',l:'Rating'}], bars:[{h:50,l:'Jan'},{h:65,l:'Feb'},{h:80,l:'Mar',active:true},{h:55,l:'Apr'}],                                         chartTitle:'Monthly Earnings', chartRange:'2026',      s1:'₹31,200',sl1:'This month',s2:'₹8,200', sl2:'Avg/month',s3:'₹11,400', sl3:'Best month' },
}

const transactions: Tx[] = [
  { id:'t1', icon:'🩺', type:'Elder Care',    customer:'Priya Kapoor', date:'Today, 9:15 AM',      duration:'2 hrs',   amount:320, status:'paid' },
  { id:'t2', icon:'💉', type:'Nursing Care',  customer:'Arjun Mehta',  date:'Today, 7:00 AM',      duration:'3 hrs',   amount:480, status:'paid' },
  { id:'t3', icon:'🦽', type:'Physio Assist', customer:'Sunita Devi',  date:'Yesterday, 3:30 PM',  duration:'1.5 hrs', amount:260, status:'pending' },
  { id:'t4', icon:'🩺', type:'Elder Care',    customer:'Ramesh Gupta', date:'Yesterday, 10:00 AM', duration:'2.5 hrs', amount:380, status:'paid' },
  { id:'t5', icon:'💊', type:'Med Reminder',  customer:'Kamla Devi',   date:'25 Mar, 11:00 AM',    duration:'1 hr',    amount:180, status:'processing' },
]
const statusStyle: Record<TxStatus,{color:string;bg:string;label:string}> = {
  paid:       { color:'#16A34A', bg:'#DCFCE7', label:'● Paid' },
  pending:    { color:'#D97706', bg:'#FEF3C7', label:'○ Pending' },
  processing: { color:'#2563EB', bg:'#EFF6FF', label:'⟳ Processing' },
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

function WithdrawModal({ open, onClose }: { open:boolean; onClose:()=>void }) {
  const [amount, setAmount] = useState('8640')
  const { showPopup, closePopup } = useStore()
  const confirm = () => { onClose(); setTimeout(() => { showPopup({ type:'success', title:'Withdrawal Initiated! ✅', body:`Amount: ₹${amount}\nBank: SBI •••• 4521\n\nFunds arrive in 1–2 business days.`, icon:'✅', actions:[{ label:'Done', variant:'primary', fn:closePopup }] }) }, 300) }
  if (!open) return null
  return (
    <div onClick={e=>{ if(e.target===e.currentTarget) onClose() }} style={{ position:'absolute', inset:0, zIndex:200, background:'rgba(15,23,42,0.55)', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div style={{ background:'#fff', borderRadius:'28px 28px 0 0', padding:'0 20px 36px', maxHeight:'85%', overflowY:'auto' }}>
        <div style={{ width:'36px', height:'4px', background:'#E2E8F0', borderRadius:'2px', margin:'14px auto 20px' }} />
        <h3 style={{ fontSize:'20px', fontWeight:800, color:'#0F172A', letterSpacing:'-0.4px', marginBottom:'6px' }}>Withdraw Earnings</h3>
        <p style={{ fontSize:'14px', color:'#64748B', marginBottom:'20px', lineHeight:1.55 }}>Transfer to SBI account ending <strong>4521</strong></p>
        <label style={{ fontSize:'13px', fontWeight:600, color:'#475569', display:'block', marginBottom:'8px' }}>Amount</label>
        <div style={{ position:'relative', marginBottom:'16px' }}>
          <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'16px', fontWeight:800, color:'#64748B' }}>₹</span>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} style={{ width:'100%', paddingLeft:'30px', paddingRight:'14px', paddingTop:'14px', paddingBottom:'14px', background:'#F1F5F9', border:'1.5px solid #E2E8F0', borderRadius:'12px', fontSize:'16px', color:'#0F172A', outline:'none', fontFamily:'DM Sans, sans-serif', boxSizing:'border-box' }} />
        </div>
        <label style={{ fontSize:'13px', fontWeight:600, color:'#475569', display:'block', marginBottom:'8px' }}>Bank Account</label>
        <div style={{ background:'#F1F5F9', border:'1.5px solid #E2E8F0', borderRadius:'12px', padding:'13px 16px', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div><div style={{ fontSize:'14px', fontWeight:700, color:'#0F172A' }}>SBI Savings Account</div><div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>•••• •••• •••• 4521</div></div>
          <span style={{ background:'#DCFCE7', color:'#16A34A', fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'100px' }}>Primary</span>
        </div>
        <div style={{ background:'#FEF3C7', borderRadius:'12px', padding:'12px 14px', marginBottom:'20px', fontSize:'13px', color:'#D97706', lineHeight:1.5 }}>⏱ Processing time: 1–2 business days</div>
        <button onClick={confirm} style={{ width:'100%', padding:'16px', background:'#0D9488', border:'none', borderRadius:'14px', color:'#fff', fontSize:'16px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif', marginBottom:'10px' }}>Confirm Withdrawal →</button>
        <button onClick={onClose} style={{ width:'100%', padding:'15px', background:'transparent', border:'1.5px solid #0D9488', borderRadius:'14px', color:'#0D9488', fontSize:'15px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Cancel</button>
      </div>
    </div>
  )
}

export default function EarningsPage() {
  const [tab, setTab]               = useState<Tab>('daily')
  const [showWithdraw, setShowWithdraw] = useState(false)
  const { showPopup, closePopup }   = useStore()
  const router = useRouter()
  const d = tabData[tab]

  const openTx = (tx: Tx) => {
    showPopup({ type:'info', title:`${tx.type} — ₹${tx.amount}`, body:`Customer: ${tx.customer}\nDate: ${tx.date}\nDuration: ${tx.duration}\nRef: CB-${tx.id.toUpperCase()}`, icon:tx.icon,
      actions:[
        { label:'Download Receipt', variant:'primary',   fn:() => { closePopup(); showPopup({ type:'success', title:'Receipt downloaded ✓', body:'', icon:'✅', actions:[{ label:'OK', variant:'primary', fn:closePopup }] }) } },
        { label:'Close',            variant:'secondary', fn:closePopup },
      ],
    })
  }

  return (
    <MobileFrame>
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
            <div style={{ fontSize:'40px', fontWeight:900, letterSpacing:'-2px', margin:'4px 0 3px' }}>{d.total}</div>
            <div style={{ fontSize:'13px', opacity:0.75, marginBottom:'16px' }}>{d.subtitle}</div>
            <div style={{ display:'flex', gap:'8px' }}>
              {d.stats.map(s => <div key={s.l} style={{ flex:1, background:'rgba(255,255,255,0.15)', borderRadius:'12px', padding:'10px 12px' }}><div style={{ fontSize:'17px', fontWeight:800 }}>{s.v}</div><div style={{ fontSize:'10px', opacity:0.7, fontWeight:600, marginTop:'2px' }}>{s.l}</div></div>)}
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
                  <div style={{ fontSize:'18px', fontWeight:800, color:'#0F172A' }}>{s.v}</div>
                  <div style={{ fontSize:'11px', color:'#94A3B8', marginTop:'2px' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ margin:'0 14px 12px', background:'#EDFAF7', borderRadius:'16px', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', border:'1px solid #CCFBF1' }}>
            <div><div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A' }}>Pending Withdrawal</div><div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>Available to withdraw now</div></div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:'20px', fontWeight:900, color:'#0D9488' }}>₹8,640</div>
              <button onClick={() => setShowWithdraw(true)} style={{ background:'#0D9488', border:'none', borderRadius:'8px', color:'#fff', fontSize:'11px', fontWeight:700, padding:'4px 10px', cursor:'pointer', marginTop:'4px', fontFamily:'DM Sans, sans-serif' }}>Withdraw →</button>
            </div>
          </div>

          <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', padding:'4px 16px 8px' }}>Payment History</div>
          {transactions.map(tx => {
            const s = statusStyle[tx.status]
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
                  <div style={{ fontSize:'16px', fontWeight:800, color:tx.status==='paid'?'#16A34A':tx.status==='pending'?'#D97706':'#2563EB' }}>+₹{tx.amount}</div>
                  <div style={{ fontSize:'11px', fontWeight:700, color:s.color, marginTop:'2px' }}>{s.label}</div>
                </div>
              </div>
            )
          })}

          <div style={{ padding:'8px 14px 8px' }}>
            <button onClick={() => setShowWithdraw(true)} style={{ width:'100%', padding:'16px', background:'#0D9488', border:'none', borderRadius:'14px', color:'#fff', fontSize:'16px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Withdraw ₹8,640 →</button>
          </div>
        </div>
      </div>

      <BottomNav active="Earnings" />
      <PopupLayer />
      <WithdrawModal open={showWithdraw} onClose={() => setShowWithdraw(false)} />
    </MobileFrame>
  )
}