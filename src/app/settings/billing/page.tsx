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
    <div onClick={e => { if (e.target===e.currentTarget) closePopup() }}
      style={{ position:'absolute', inset:0, zIndex:100, background:'rgba(15,23,42,0.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'22px', width:'100%', overflow:'hidden' }}>
        <div style={{ padding:'28px 20px 0', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:'68px', height:'68px', borderRadius:'50%', background:iconBg[popup.type], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', marginBottom:'12px' }}>
            {popup.icon||'ℹ️'}
          </div>
          <h2 style={{ fontSize:'18px', fontWeight:800, color:'#0F172A', textAlign:'center', margin:0 }}>{popup.title}</h2>
        </div>
        <p style={{ fontSize:'14px', color:'#64748B', textAlign:'center', padding:'8px 22px 18px', lineHeight:1.65 }}
          dangerouslySetInnerHTML={{ __html:popup.body.replace(/\n/g,'<br/>') }} />
        <div style={{ display:'flex', gap:'10px', padding:'0 18px 22px' }}>
          {popup.actions.map((a,i) => (
            <button key={i} onClick={a.fn} style={{ flex:1, padding:'14px', borderRadius:'14px', fontSize:'14px', fontWeight:700, border:'none', cursor:'pointer', fontFamily:'DM Sans, sans-serif', background:btnBg[a.variant], color:btnClr[a.variant] }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const inp: React.CSSProperties = {
  width:'100%', padding:'12px 14px', background:'#F8FAFC',
  border:'1.5px solid #E2E8F0', borderRadius:'12px',
  fontSize:'14px', color:'#0F172A', fontFamily:'DM Sans, sans-serif',
  outline:'none', boxSizing:'border-box',
}

export default function BillingInfoPage() {
  const router = useRouter()
  const { showPopup, closePopup } = useStore()

  const [editMode, setEditMode] = useState(false)
  const [name,    setName]    = useState('Rajan Kumar')
  const [gst,     setGst]     = useState('')
  const [email,   setEmail]   = useState('rajan.kumar@email.com')
  const [addr,    setAddr]    = useState('B-42, Rohini Sector 11, Delhi – 110085')
  const [pan,     setPan]     = useState('ABCDE1234F')

  const save = () => {
    setEditMode(false)
    showPopup({ type:'success', title:'Billing Updated ✅', body:'Your billing information has been saved.', icon:'✅', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
  }

  const Field = ({ label, val, setter, placeholder }: { label:string; val:string; setter:(v:string)=>void; placeholder?:string }) => (
    <div style={{ marginBottom:'14px' }}>
      <label style={{ fontSize:'12px', fontWeight:600, color:'#64748B', display:'block', marginBottom:'5px' }}>{label}</label>
      <input value={val} readOnly={!editMode} onChange={e=>setter(e.target.value)} placeholder={placeholder}
        style={{ ...inp, background:editMode?'#fff':'#F8FAFC', border:`1.5px solid ${editMode?'#0D9488':'#E2E8F0'}` }} />
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1e', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'390px', height:'844px', borderRadius:'48px', overflow:'hidden', position:'relative', flexShrink:0, boxShadow:'0 0 0 10px #1e293b, 0 0 0 12px #334155, 0 40px 80px rgba(0,0,0,0.8)', background:'#F8FAFC' }}>
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'126px', height:'34px', background:'#111827', borderRadius:'0 0 20px 20px', zIndex:50 }} />
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>

          <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
            <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
            <span style={{ fontSize:'11px', fontWeight:700, color:'#0F172A' }}>5G</span>
          </div>

          <div style={{ height:'56px', background:'#fff', display:'flex', alignItems:'center', padding:'0 16px', gap:'10px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
            <button onClick={()=>router.back()} style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
            <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Billing Information</span>
            <button onClick={()=>editMode?save():setEditMode(true)}
              style={{ background:editMode?'#0D9488':'#EDFAF7', border:'none', borderRadius:'10px', padding:'0 14px', height:'34px', fontSize:'13px', fontWeight:700, color:editMode?'#fff':'#0D9488', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
              {editMode?'Save':'Edit'}
            </button>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'16px 14px', paddingBottom:'32px' }}>

            {/* Info banner */}
            <div style={{ background:'#EFF6FF', borderRadius:'16px', padding:'13px 16px', display:'flex', gap:'10px', border:'1px solid #BFDBFE', marginBottom:'16px' }}>
              <span style={{ fontSize:'18px', flexShrink:0 }}>💳</span>
              <div style={{ fontSize:'13px', color:'#1E40AF', lineHeight:1.55 }}>
                This info is used for <strong>GST invoices</strong> and payment receipts sent to your registered email.
              </div>
            </div>

            <div style={{ background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0', marginBottom:'12px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'14px' }}>Personal Details</div>
              <Field label="Full Name"       val={name}  setter={setName} />
              <Field label="Email Address"   val={email} setter={setEmail} />
              <Field label="PAN Number"      val={pan}   setter={setPan}   placeholder="e.g. ABCDE1234F" />
              <Field label="GST Number"      val={gst}   setter={setGst}   placeholder="Optional — for GST invoices" />
            </div>

            <div style={{ background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'14px' }}>Billing Address</div>
              <Field label="Address" val={addr} setter={setAddr} placeholder="Street, City, State – PIN" />
            </div>
          </div>
        </div>
        <PopupLayer />
      </div>
    </div>
  )
}