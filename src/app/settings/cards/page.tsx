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

interface Card { id:string; type:'visa'|'mastercard'|'upi'|'netbanking'; label:string; last4?:string; expiry?:string; isDefault:boolean; upiId?:string }

const CARD_GRADIENTS = { visa:'linear-gradient(135deg,#1a1a2e,#16213e)', mastercard:'linear-gradient(135deg,#e65c00,#f9d423)', upi:'linear-gradient(135deg,#0D9488,#065f52)', netbanking:'linear-gradient(135deg,#2563EB,#1e40af)' }
const CARD_ICONS = { visa:'💳', mastercard:'💳', upi:'📱', netbanking:'🏦' }

function CardItem({ card, onDelete, onSetDefault }: { card:Card; onDelete:()=>void; onSetDefault:()=>void }) {
  return (
    <div style={{ margin:'0 0 10px', background:'#fff', borderRadius:'18px', padding:'14px 16px', border:`1.5px solid ${card.isDefault?'#CCFBF1':'#E2E8F0'}`, position:'relative' }}>
      {card.isDefault && <div style={{ position:'absolute', top:'10px', right:'14px', background:'#EDFAF7', color:'#0D9488', fontSize:'10px', fontWeight:700, padding:'3px 9px', borderRadius:'100px' }}>★ Default</div>}
      <div style={{ display:'flex', alignItems:'center', gap:'13px', marginBottom:'12px' }}>
        <div style={{ width:'48px', height:'32px', borderRadius:'8px', background:CARD_GRADIENTS[card.type], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>{CARD_ICONS[card.type]}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'14px', fontWeight:800, color:'#0F172A' }}>{card.label}</div>
          <div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>
            {card.last4 ? `•••• •••• •••• ${card.last4}  ·  Exp ${card.expiry}` : card.upiId || ''}
          </div>
        </div>
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        {!card.isDefault && <button onClick={onSetDefault} style={{ flex:1, padding:'9px', background:'#EDFAF7', border:'1px solid #CCFBF1', borderRadius:'12px', fontSize:'12px', fontWeight:700, color:'#0D9488', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Set Default</button>}
        <button onClick={onDelete} style={{ flex:1, padding:'9px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'12px', fontSize:'12px', fontWeight:700, color:'#DC2626', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Remove</button>
      </div>
    </div>
  )
}

const SEED_CARDS: Card[] = [
  { id:'c1', type:'visa',    label:'HDFC Visa',      last4:'4242', expiry:'08/27', isDefault:true },
  { id:'c2', type:'upi',     label:'UPI',            upiId:'rajan@okaxis',         isDefault:false },
  { id:'c3', type:'mastercard', label:'SBI Mastercard', last4:'8810', expiry:'12/26', isDefault:false },
]

export default function SavedCardsPage() {
  const router = useRouter()
  const { showPopup, closePopup } = useStore()
  const [cards, setCards] = useState<Card[]>(SEED_CARDS)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [newType,   setNewType]   = useState<Card['type']>('upi')
  const [newLabel,  setNewLabel]  = useState('')
  const [newLast4,  setNewLast4]  = useState('')
  const [newExpiry, setNewExpiry] = useState('')
  const [newUpi,    setNewUpi]    = useState('')

  const remove = (c:Card) => showPopup({ type:'confirm', title:'Remove Card?', body:`Remove ${c.label} from saved payment methods?`, icon:'🗑️',
    actions:[
      { label:'Remove', variant:'danger', fn:()=>{ setCards(p=>p.filter(x=>x.id!==c.id)); closePopup() } },
      { label:'Cancel', variant:'secondary', fn:closePopup },
    ]
  })

  const setDefault = (id:string) => {
    setCards(p=>p.map(c=>({ ...c, isDefault:c.id===id })))
    showPopup({ type:'success', title:'Default Updated ✅', body:'This payment method is now your default.', icon:'✅', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
  }

  const addCard = () => {
    if (!newLabel.trim()) return
    const newC: Card = { id:`c${Date.now()}`, type:newType, label:newLabel.trim(), last4:newLast4||undefined, expiry:newExpiry||undefined, upiId:newUpi||undefined, isDefault:false }
    setCards(p=>[...p, newC])
    setSheetOpen(false); setNewLabel(''); setNewLast4(''); setNewExpiry(''); setNewUpi('')
    showPopup({ type:'success', title:'Card Added ✅', body:`${newC.label} has been added.`, icon:'✅', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
  }

  const inp: React.CSSProperties = { width:'100%', padding:'12px 14px', background:'#F8FAFC', border:'1.5px solid #E2E8F0', borderRadius:'12px', fontSize:'14px', color:'#0F172A', fontFamily:'DM Sans, sans-serif', outline:'none', boxSizing:'border-box', marginBottom:'12px' }

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
            <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Saved Cards</span>
            <button onClick={()=>setSheetOpen(true)} style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#EDFAF7', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'14px', paddingBottom:'32px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'10px' }}>
              {cards.length} Saved Method{cards.length!==1?'s':''}
            </div>
            {cards.map(c => <CardItem key={c.id} card={c} onDelete={()=>remove(c)} onSetDefault={()=>setDefault(c.id)} />)}
            <button onClick={()=>setSheetOpen(true)} style={{ width:'100%', padding:'14px', background:'transparent', border:'2px dashed #CBD5E1', borderRadius:'18px', fontSize:'14px', fontWeight:700, color:'#64748B', cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginTop:'4px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Payment Method
            </button>
          </div>
        </div>

        {/* Add sheet */}
        {sheetOpen && (
          <div onClick={e=>{ if(e.target===e.currentTarget) setSheetOpen(false) }}
            style={{ position:'absolute', inset:0, zIndex:200, background:'rgba(15,23,42,0.55)', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
            <div style={{ background:'#fff', borderRadius:'28px 28px 0 0', padding:'0 20px 36px', maxHeight:'80%', overflowY:'auto' }}>
              <div style={{ width:'36px', height:'4px', background:'#E2E8F0', borderRadius:'2px', margin:'14px auto 20px' }} />
              <h3 style={{ fontSize:'20px', fontWeight:800, color:'#0F172A', letterSpacing:'-0.4px', marginBottom:'16px' }}>Add Payment Method</h3>
              <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
                {(['upi','visa','mastercard','netbanking'] as Card['type'][]).map(t => (
                  <button key={t} onClick={()=>setNewType(t)} style={{ flex:1, padding:'8px 4px', borderRadius:'10px', border:'none', cursor:'pointer', background:newType===t?'#0D9488':'#F1F5F9', color:newType===t?'#fff':'#475569', fontSize:'11px', fontWeight:700, fontFamily:'DM Sans, sans-serif' }}>
                    {CARD_ICONS[t]}<br/>{t.toUpperCase()}
                  </button>
                ))}
              </div>
              <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Label (e.g. HDFC Visa)" style={inp} />
              {(newType==='visa'||newType==='mastercard') && <>
                <input value={newLast4} onChange={e=>setNewLast4(e.target.value.slice(0,4))} placeholder="Last 4 digits" inputMode="numeric" maxLength={4} style={inp} />
                <input value={newExpiry} onChange={e=>setNewExpiry(e.target.value)} placeholder="Expiry MM/YY" style={inp} />
              </>}
              {newType==='upi' && <input value={newUpi} onChange={e=>setNewUpi(e.target.value)} placeholder="UPI ID (e.g. name@okaxis)" style={inp} />}
              <button onClick={addCard} disabled={!newLabel.trim()} style={{ width:'100%', padding:'15px', background:!newLabel.trim()?'#CBD5E1':'#0D9488', border:'none', borderRadius:'14px', color:'#fff', fontSize:'15px', fontWeight:700, cursor:!newLabel.trim()?'not-allowed':'pointer', fontFamily:'DM Sans, sans-serif', marginBottom:'10px' }}>
                Add Method →
              </button>
              <button onClick={()=>setSheetOpen(false)} style={{ width:'100%', padding:'14px', background:'transparent', border:'1.5px solid #E2E8F0', borderRadius:'14px', color:'#64748B', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Cancel</button>
            </div>
          </div>
        )}

        <PopupLayer />
      </div>
    </div>
  )
}