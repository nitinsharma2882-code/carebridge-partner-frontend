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

type DocStatus = 'verified'|'pending'|'rejected'|'missing'
const docBadge: Record<DocStatus,{bg:string;color:string;label:string;icon:string}> = {
  verified:{ bg:'#DCFCE7', color:'#16A34A', label:'Verified', icon:'✓' },
  pending: { bg:'#FEF3C7', color:'#D97706', label:'Pending',  icon:'⏳' },
  rejected:{ bg:'#FEE2E2', color:'#DC2626', label:'Rejected', icon:'✕' },
  missing: { bg:'#F1F5F9', color:'#94A3B8', label:'Upload',   icon:'+' },
}
const DOCS   = [{ id:'d1', type:'Aadhaar Card',     status:'verified' as DocStatus, icon:'🪪' },{ id:'d2', type:'Care Certificate', status:'pending'  as DocStatus, icon:'📋' },{ id:'d3', type:'Medical License',  status:'verified' as DocStatus, icon:'🏥' },{ id:'d4', type:'Police Clearance', status:'missing'  as DocStatus, icon:'🛡️' }]
const SKILLS = ['Elder Care','Nursing','Physiotherapy','Medication','First Aid','Palliative Care']
const LANGS  = ['Hindi','English','Punjabi']

export default function ProfilePage() {
  const router = useRouter()
  const { showPopup, closePopup, profile } = useStore()
  const [editMode,setEditMode] = useState(false)
  const [name, setName]   = useState(profile?.name  || 'Rajan Kumar')
  const [email,setEmail]  = useState(profile?.email || 'rajan.kumar@email.com')
  const [city, setCity]   = useState(profile?.city  || 'Delhi, India')
  const [exp,  setExp]    = useState(profile?.experience || '4 years')

  const saveProfile = () => { setEditMode(false); showPopup({ type:'success', title:'Profile Updated ✅', body:'Your profile changes have been saved.', icon:'✅', actions:[{ label:'OK', variant:'primary', fn:closePopup }] }) }

  const onDocPress = (doc: typeof DOCS[0]) => {
    showPopup({ type:doc.status==='verified'?'success':doc.status==='rejected'?'error':'info', title:doc.type,
      body:doc.status==='verified'?'This document has been verified by CareBridge.':doc.status==='pending'?'Document is under review. Allow 24–48 hours.':doc.status==='rejected'?'Document was rejected. Please re-upload a clearer copy.':'No document uploaded yet. Tap to upload.',
      icon:doc.icon,
      actions:[...(doc.status!=='verified'?[{ label:doc.status==='missing'?'Upload Now':'Re-upload', variant:'primary' as const, fn:()=>{ closePopup(); showPopup({ type:'info', title:'Upload Feature', body:'Document upload will open your camera/gallery in the live app.', icon:'📷', actions:[{ label:'OK', variant:'primary' as const, fn:closePopup }] }) } }]:[]),{ label:'Close', variant:'secondary' as const, fn:closePopup }],
    })
  }

  const inp = (editable: boolean): React.CSSProperties => ({ width:'100%', padding:'12px 14px', background:editable?'#fff':'#F8FAFC', border:`1.5px solid ${editable?'#0D9488':'#E2E8F0'}`, borderRadius:'12px', fontSize:'14px', color:'#0F172A', fontFamily:'DM Sans, sans-serif', outline:'none', boxSizing:'border-box' })

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
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>My Profile</span>
          <button onClick={()=>editMode?saveProfile():setEditMode(true)} style={{ background:editMode?'#0D9488':'#EDFAF7', border:'none', borderRadius:'10px', padding:'0 14px', height:'34px', fontSize:'13px', fontWeight:700, color:editMode?'#fff':'#0D9488', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
            {editMode?'Save':'Edit'}
          </button>
        </div>

        <div style={{ flex:1, overflowY:'auto', paddingBottom:'24px' }}>
          <div style={{ background:'linear-gradient(160deg,#065f52,#0D9488,#14b8a6)', padding:'24px 20px 28px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'rgba(255,255,255,0.25)', border:'3px solid rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px' }}>👨‍⚕️</div>
              {editMode&&<div style={{ position:'absolute', bottom:0, right:0, width:'26px', height:'26px', borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.2)' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>}
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'22px', fontWeight:900, color:'#fff', letterSpacing:'-0.4px' }}>{name}</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.75)', marginTop:'3px' }}>Healthcare Assistant · {city}</div>
            </div>
            <div style={{ display:'flex', gap:'8px', marginTop:'4px', width:'100%' }}>
              {[{v:'4.9★',l:'Rating'},{v:'104',l:'Trips'},{v:exp,l:'Exp'}].map(s=><div key={s.l} style={{ flex:1, background:'rgba(255,255,255,0.15)', borderRadius:'12px', padding:'10px 8px', textAlign:'center' }}><div style={{ fontSize:'15px', fontWeight:800, color:'#fff' }}>{s.v}</div><div style={{ fontSize:'10px', color:'rgba(255,255,255,0.7)', fontWeight:600, marginTop:'2px' }}>{s.l}</div></div>)}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'5px', background:'rgba(255,255,255,0.15)', borderRadius:'100px', padding:'5px 14px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontSize:'12px', fontWeight:700, color:'#fff' }}>CareBridge Verified Partner</span>
            </div>
          </div>

          <div style={{ margin:'14px 14px 0', background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0' }}>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'14px' }}>Personal Info</div>
            {[{label:'Full Name',val:name,setter:setName,editable:true},{label:'Email',val:email,setter:setEmail,editable:true},{label:'Phone',val:profile?.phone||'+91 98765 43210',setter:()=>{},editable:false},{label:'City',val:city,setter:setCity,editable:true},{label:'Experience',val:exp,setter:setExp,editable:true}].map((f,i)=>(
              <div key={i} style={{ marginBottom:'12px' }}>
                <label style={{ fontSize:'12px', fontWeight:600, color:'#64748B', display:'block', marginBottom:'5px' }}>{f.label}</label>
                <input value={f.val} readOnly={!editMode||!f.editable} onChange={e=>f.setter(e.target.value)} style={inp(editMode&&f.editable)} />
              </div>
            ))}
          </div>

          <div style={{ margin:'12px 14px 0', background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0' }}>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px' }}>Skills & Services</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              {SKILLS.map(s=><div key={s} style={{ background:'#EDFAF7', border:'1px solid #CCFBF1', borderRadius:'100px', padding:'6px 14px', fontSize:'12px', fontWeight:700, color:'#0D9488' }}>{s}</div>)}
            </div>
          </div>

          <div style={{ margin:'12px 14px 0', background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0' }}>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px' }}>Languages</div>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {LANGS.map(l=><div key={l} style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'100px', padding:'6px 14px', fontSize:'12px', fontWeight:700, color:'#2563EB' }}>{l}</div>)}
            </div>
          </div>

          <div style={{ margin:'12px 14px 0', background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0' }}>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px' }}>Documents</div>
            {DOCS.map((doc,i)=>{ const b=docBadge[doc.status]; return (
              <div key={doc.id} onClick={()=>onDocPress(doc)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:i<DOCS.length-1?'1px solid #F1F5F9':'none', cursor:'pointer' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'#F8FAFC', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>{doc.icon}</div>
                  <div style={{ fontSize:'14px', fontWeight:600, color:'#0F172A' }}>{doc.type}</div>
                </div>
                <div style={{ background:b.bg, color:b.color, fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'100px' }}>{b.icon} {b.label}</div>
              </div>
            )})}
          </div>
          <div style={{ height:'16px' }} />
        </div>
      </div>

      <PopupLayer />
    </MobileFrame>
  )
}