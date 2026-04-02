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

interface Card { id:string; type:'visa'|'mastercard'; label:string; last4:string; expiry:string; isDefault:boolean }
interface UPI  { id:string; label:string; upiId:string; isDefault:boolean }

const SEED_CARDS: Card[] = [
  { id:'c1', type:'visa',       label:'HDFC Visa',        last4:'4242', expiry:'08/27', isDefault:true },
  { id:'c2', type:'mastercard', label:'SBI Mastercard',   last4:'8810', expiry:'12/26', isDefault:false },
]
const SEED_UPI: UPI[] = [
  { id:'u1', label:'Axis Bank UPI',  upiId:'rajan@okaxis',  isDefault:true },
  { id:'u2', label:'PhonePe',        upiId:'rajan@ybl',     isDefault:false },
]

const CARD_GRADIENTS = { visa:'linear-gradient(135deg,#1a1a2e,#16213e)', mastercard:'linear-gradient(135deg,#e65c00,#f9d423)' }

export default function SavedCardsPage() {
  const router = useRouter()
  const { showPopup, closePopup } = useStore()
  const [cards,      setCards]      = useState<Card[]>(SEED_CARDS)
  const [upis,       setUpis]       = useState<UPI[]>(SEED_UPI)
  const [sheetOpen,  setSheetOpen]  = useState(false)
  const [sheetType,  setSheetType]  = useState<'card'|'upi'>('card')
  const [newLabel,   setNewLabel]   = useState('')
  const [newLast4,   setNewLast4]   = useState('')
  const [newExpiry,  setNewExpiry]  = useState('')
  const [newUpi,     setNewUpi]     = useState('')
  const [newCardType,setNewCardType]= useState<'visa'|'mastercard'>('visa')

  const removeCard = (c:Card) => showPopup({ type:'confirm', title:'Remove Card?', body:`Remove ${c.label} ending in ${c.last4}?`, icon:'🗑️',
    actions:[{ label:'Remove', variant:'danger', fn:()=>{ setCards(p=>p.filter(x=>x.id!==c.id)); closePopup() } },{ label:'Cancel', variant:'secondary', fn:closePopup }]
  })
  const removeUpi = (u:UPI) => showPopup({ type:'confirm', title:'Remove UPI?', body:`Remove ${u.upiId}?`, icon:'🗑️',
    actions:[{ label:'Remove', variant:'danger', fn:()=>{ setUpis(p=>p.filter(x=>x.id!==u.id)); closePopup() } },{ label:'Cancel', variant:'secondary', fn:closePopup }]
  })

  const setDefaultCard = (id:string) => { setCards(p=>p.map(c=>({...c,isDefault:c.id===id}))); showPopup({ type:'success', title:'Default Updated ✅', body:'This card is now your default.', icon:'✅', actions:[{ label:'OK', variant:'primary', fn:closePopup }] }) }
  const setDefaultUpi  = (id:string) => { setUpis(p=>p.map(u=>({...u,isDefault:u.id===id}))); showPopup({ type:'success', title:'Default Updated ✅', body:'This UPI is now your default.', icon:'✅', actions:[{ label:'OK', variant:'primary', fn:closePopup }] }) }

  const addCard = () => {
    if (!newLabel.trim() || !newLast4 || !newExpiry) return
    setCards(p=>[...p, { id:`c${Date.now()}`, type:newCardType, label:newLabel.trim(), last4:newLast4, expiry:newExpiry, isDefault:false }])
    setSheetOpen(false); setNewLabel(''); setNewLast4(''); setNewExpiry('')
    showPopup({ type:'success', title:'Card Added ✅', body:'Your card has been saved.', icon:'✅', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
  }
  const addUpi = () => {
    if (!newLabel.trim() || !newUpi.trim()) return
    setUpis(p=>[...p, { id:`u${Date.now()}`, label:newLabel.trim(), upiId:newUpi.trim(), isDefault:false }])
    setSheetOpen(false); setNewLabel(''); setNewUpi('')
    showPopup({ type:'success', title:'UPI Added ✅', body:'Your UPI address has been saved.', icon:'✅', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
  }

  const inp: React.CSSProperties = { width:'100%', padding:'12px 14px', background:'#F8FAFC', border:'1.5px solid #E2E8F0', borderRadius:'12px', fontSize:'14px', color:'#0F172A', fontFamily:'DM Sans, sans-serif', outline:'none', boxSizing:'border-box', marginBottom:'12px' }

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
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Saved Cards & UPI</span>
          <div style={{ width:'38px' }} />
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'14px', paddingBottom:'32px' }}>

          {/* ── Card Details Section ── */}
          <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'10px' }}>
            💳 Card Details
          </div>
          {cards.map(c => (
            <div key={c.id} style={{ background:'#fff', borderRadius:'18px', padding:'14px 16px', border:`1.5px solid ${c.isDefault?'#CCFBF1':'#E2E8F0'}`, marginBottom:'10px', position:'relative' }}>
              {c.isDefault && <div style={{ position:'absolute', top:'10px', right:'14px', background:'#EDFAF7', color:'#0D9488', fontSize:'10px', fontWeight:700, padding:'3px 9px', borderRadius:'100px' }}>★ Default</div>}
              <div style={{ display:'flex', alignItems:'center', gap:'13px', marginBottom:'12px' }}>
                <div style={{ width:'48px', height:'32px', borderRadius:'8px', background:CARD_GRADIENTS[c.type], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>💳</div>
                <div>
                  <div style={{ fontSize:'14px', fontWeight:800, color:'#0F172A' }}>{c.label}</div>
                  <div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>•••• •••• •••• {c.last4} · Exp {c.expiry}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                {!c.isDefault && <button onClick={()=>setDefaultCard(c.id)} style={{ flex:1, padding:'9px', background:'#EDFAF7', border:'1px solid #CCFBF1', borderRadius:'12px', fontSize:'12px', fontWeight:700, color:'#0D9488', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Set Default</button>}
                <button onClick={()=>removeCard(c)} style={{ flex:1, padding:'9px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'12px', fontSize:'12px', fontWeight:700, color:'#DC2626', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Remove</button>
              </div>
            </div>
          ))}
          <button onClick={()=>{ setSheetType('card'); setSheetOpen(true) }} style={{ width:'100%', padding:'13px', background:'transparent', border:'2px dashed #CBD5E1', borderRadius:'16px', fontSize:'13px', fontWeight:700, color:'#64748B', cursor:'pointer', fontFamily:'DM Sans, sans-serif', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
            + Add Card
          </button>

          {/* ── Saved UPI Section ── */}
          <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'10px' }}>
            📱 Saved UPI Addresses
          </div>
          {upis.map(u => (
            <div key={u.id} style={{ background:'#fff', borderRadius:'18px', padding:'14px 16px', border:`1.5px solid ${u.isDefault?'#CCFBF1':'#E2E8F0'}`, marginBottom:'10px', position:'relative' }}>
              {u.isDefault && <div style={{ position:'absolute', top:'10px', right:'14px', background:'#EDFAF7', color:'#0D9488', fontSize:'10px', fontWeight:700, padding:'3px 9px', borderRadius:'100px' }}>★ Default</div>}
              <div style={{ display:'flex', alignItems:'center', gap:'13px', marginBottom:'12px' }}>
                <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'linear-gradient(135deg,#0D9488,#065f52)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>📱</div>
                <div>
                  <div style={{ fontSize:'14px', fontWeight:800, color:'#0F172A' }}>{u.label}</div>
                  <div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>{u.upiId}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                {!u.isDefault && <button onClick={()=>setDefaultUpi(u.id)} style={{ flex:1, padding:'9px', background:'#EDFAF7', border:'1px solid #CCFBF1', borderRadius:'12px', fontSize:'12px', fontWeight:700, color:'#0D9488', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Set Default</button>}
                <button onClick={()=>removeUpi(u)} style={{ flex:1, padding:'9px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'12px', fontSize:'12px', fontWeight:700, color:'#DC2626', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Remove</button>
              </div>
            </div>
          ))}
          <button onClick={()=>{ setSheetType('upi'); setSheetOpen(true) }} style={{ width:'100%', padding:'13px', background:'transparent', border:'2px dashed #CBD5E1', borderRadius:'16px', fontSize:'13px', fontWeight:700, color:'#64748B', cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
            + Add UPI Address
          </button>
        </div>

        {/* Add sheet */}
        {sheetOpen && (
          <div onClick={e=>{ if(e.target===e.currentTarget) setSheetOpen(false) }}
            style={{ position:'absolute', inset:0, zIndex:200, background:'rgba(15,23,42,0.55)', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
            <div style={{ background:'#fff', borderRadius:'28px 28px 0 0', padding:'0 20px 36px', maxHeight:'80%', overflowY:'auto' }}>
              <div style={{ width:'36px', height:'4px', background:'#E2E8F0', borderRadius:'2px', margin:'14px auto 20px' }} />
              <h3 style={{ fontSize:'20px', fontWeight:800, color:'#0F172A', marginBottom:'16px' }}>{sheetType==='card'?'Add Card':'Add UPI Address'}</h3>
              {sheetType === 'card' ? (
                <>
                  <div style={{ display:'flex', gap:'8px', marginBottom:'14px' }}>
                    {(['visa','mastercard'] as const).map(t => (
                      <button key={t} onClick={()=>setNewCardType(t)} style={{ flex:1, padding:'10px', borderRadius:'10px', border:'none', cursor:'pointer', background:newCardType===t?'#0D9488':'#F1F5F9', color:newCardType===t?'#fff':'#475569', fontSize:'13px', fontWeight:700, fontFamily:'DM Sans, sans-serif' }}>
                        💳 {t.charAt(0).toUpperCase()+t.slice(1)}
                      </button>
                    ))}
                  </div>
                  <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Card label (e.g. HDFC Visa)" style={inp} />
                  <input value={newLast4} onChange={e=>setNewLast4(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="Last 4 digits" inputMode="numeric" maxLength={4} style={inp} />
                  <input value={newExpiry} onChange={e=>setNewExpiry(e.target.value)} placeholder="Expiry MM/YY" style={inp} />
                  <button onClick={addCard} disabled={!newLabel.trim()||!newLast4||!newExpiry} style={{ width:'100%', padding:'15px', background:(!newLabel.trim()||!newLast4||!newExpiry)?'#CBD5E1':'#0D9488', border:'none', borderRadius:'14px', color:'#fff', fontSize:'15px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif', marginBottom:'10px' }}>Add Card →</button>
                </>
              ) : (
                <>
                  <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Label (e.g. PhonePe)" style={inp} />
                  <input value={newUpi} onChange={e=>setNewUpi(e.target.value)} placeholder="UPI ID (e.g. name@okaxis)" style={inp} />
                  <button onClick={addUpi} disabled={!newLabel.trim()||!newUpi.trim()} style={{ width:'100%', padding:'15px', background:(!newLabel.trim()||!newUpi.trim())?'#CBD5E1':'#0D9488', border:'none', borderRadius:'14px', color:'#fff', fontSize:'15px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif', marginBottom:'10px' }}>Add UPI →</button>
                </>
              )}
              <button onClick={()=>setSheetOpen(false)} style={{ width:'100%', padding:'14px', background:'transparent', border:'1.5px solid #E2E8F0', borderRadius:'14px', color:'#64748B', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      <PopupLayer />
    </MobileFrame>
  )
}