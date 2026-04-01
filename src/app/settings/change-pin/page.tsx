'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import MobileFrame from '@/components/MobileFrame'

const PIN_STORAGE_KEY = 'cb_assistant_pin'
const DEFAULT_PIN     = '1234'

function PopupLayer() {
  const { popup, closePopup } = useStore()
  if (!popup) return null
  const iconBg: Record<string,string> = { success:'#DCFCE7', warning:'#FEF3C7', error:'#FEE2E2', confirm:'#EDE9FE', info:'#EDFAF7' }
  const btnBg:  Record<string,string> = { primary:'#0D9488', secondary:'#F1F5F9', danger:'#DC2626', warning:'#D97706' }
  const btnClr: Record<string,string> = { primary:'#fff', secondary:'#475569', danger:'#fff', warning:'#fff' }
  return (
    <div onClick={e=>{ if(e.target===e.currentTarget) closePopup() }} style={{ position:'absolute', inset:0, zIndex:100, background:'rgba(15,23,42,0.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
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

function PinDots({ value, error }: { value:string; error:boolean }) {
  return (
    <div style={{ display:'flex', gap:'14px', justifyContent:'center', margin:'8px 0 4px' }}>
      {[0,1,2,3].map(i => <div key={i} style={{ width:'18px', height:'18px', borderRadius:'50%', background:error?'#DC2626':i<value.length?'#0D9488':'transparent', border:`2.5px solid ${error?'#DC2626':i<value.length?'#0D9488':'#CBD5E1'}`, transition:'all 0.2s' }} />)}
    </div>
  )
}

function NumPad({ onPress,onDelete }: { onPress:(n:string)=>void; onDelete:()=>void }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px', padding:'0 20px' }}>
      {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k,i) => {
        if(k==='') return <div key={i} />
        const isDel=k==='⌫'
        return <button key={i} onClick={()=>isDel?onDelete():onPress(k)} style={{ height:'58px', borderRadius:'16px', border:'none', background:isDel?'#FEE2E2':'#F1F5F9', fontSize:isDel?'20px':'22px', fontWeight:700, color:isDel?'#DC2626':'#0F172A', cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.15s' }}>{k}</button>
      })}
    </div>
  )
}

type Step='old'|'new'|'confirm'

export default function ChangePinPage() {
  const router=useRouter(); const { showPopup,closePopup }=useStore()
  const [step,setStep]=useState<Step>('old')
  const [oldPin,setOldPin]=useState(''); const [newPin,setNewPin]=useState(''); const [confirmPin,setConfirmPin]=useState('')
  const [error,setError]=useState(''); const [shake,setShake]=useState(false)

  const triggerError=(msg:string)=>{ setError(msg); setShake(true); setTimeout(()=>setShake(false),500); if(step==='old') setOldPin(''); if(step==='new') setNewPin(''); if(step==='confirm') setConfirmPin('') }
  const currentPin=step==='old'?oldPin:step==='new'?newPin:confirmPin
  const setCurrentPin=(val:string)=>{ setError(''); if(step==='old') setOldPin(val); if(step==='new') setNewPin(val); if(step==='confirm') setConfirmPin(val) }

  const handlePress=(n:string)=>{ if(currentPin.length>=4) return; const next=currentPin+n; setCurrentPin(next); if(next.length===4) setTimeout(()=>validate(next),150) }
  const handleDelete=()=>{ setError(''); setCurrentPin(currentPin.slice(0,-1)) }

  const validate=(pin:string)=>{
    const stored=typeof window!=='undefined'?(localStorage.getItem(PIN_STORAGE_KEY)||DEFAULT_PIN):DEFAULT_PIN
    if(step==='old'){ if(pin!==stored){ triggerError('Incorrect PIN. Please try again.'); return }; setStep('new') }
    else if(step==='new'){ if(pin===stored){ triggerError('New PIN cannot be same as current PIN.'); return }; if(/^(\d)\1{3}$/.test(pin)){ triggerError('PIN cannot be 4 repeating digits (e.g. 1111).'); return }; if(/^(0123|1234|2345|3456|4567|5678|6789)$/.test(pin)){ triggerError('PIN is too simple. Avoid sequential digits.'); return }; setStep('confirm') }
    else if(step==='confirm'){ if(pin!==newPin){ triggerError('PINs do not match. Please try again.'); return }; if(typeof window!=='undefined') localStorage.setItem(PIN_STORAGE_KEY,newPin); showPopup({ type:'success', title:'PIN Changed ✅', body:'Your PIN has been updated successfully.\nUse your new PIN next time you log in.', icon:'🔑', actions:[{ label:'Done', variant:'primary', fn:()=>{ closePopup(); router.back() } }] }) }
  }

  const STEP_KEYS:Step[]=['old','new','confirm']
  const cfg={ old:{title:'Enter Current PIN',sub:'Enter your existing 4-digit PIN',icon:'🔑'}, new:{title:'Enter New PIN',sub:'Choose a new secure 4-digit PIN',icon:'🔒'}, confirm:{title:'Confirm New PIN',sub:'Re-enter your new PIN to confirm',icon:'✅'} }[step]

  return (
    <MobileFrame>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>
        <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
          <span style={{ fontSize:'11px', fontWeight:700, color:'#0F172A' }}>5G</span>
        </div>
        <div style={{ height:'56px', background:'#fff', display:'flex', alignItems:'center', padding:'0 16px', gap:'10px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <button onClick={()=>router.back()} style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/></svg></button>
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Change PIN</span>
          <div style={{ width:'38px' }} />
        </div>
        <div style={{ background:'#fff', padding:'14px 20px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center' }}>
            {STEP_KEYS.map((s,i)=>{ const done=STEP_KEYS.indexOf(step)>i; const current=step===s; return (
              <div key={s} style={{ display:'flex', alignItems:'center', flex:i<2?1:'none' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:done?'#0D9488':current?'#EDFAF7':'#F1F5F9', border:`2px solid ${done||current?'#0D9488':'#E2E8F0'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:800, color:done?'#fff':current?'#0D9488':'#94A3B8' }}>{done?'✓':i+1}</div>
                  <span style={{ fontSize:'9px', fontWeight:700, color:done||current?'#0D9488':'#94A3B8', whiteSpace:'nowrap' }}>{s==='old'?'Current':s==='new'?'New PIN':'Confirm'}</span>
                </div>
                {i<2&&<div style={{ flex:1, height:'2px', background:done?'#0D9488':'#E2E8F0', margin:'0 6px', marginBottom:'14px', transition:'background 0.3s' }} />}
              </div>
            )})}
          </div>
        </div>
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', paddingBottom:'20px' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', marginBottom:'28px', padding:'0 24px' }}>
            <div style={{ width:'64px', height:'64px', borderRadius:'20px', background:error?'#FEE2E2':'#EDFAF7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', transition:'background 0.2s' }}>{error?'⚠️':cfg.icon}</div>
            <div style={{ fontSize:'20px', fontWeight:900, color:'#0F172A', textAlign:'center', marginTop:'4px' }}>{cfg.title}</div>
            <div style={{ fontSize:'13px', color:'#64748B', textAlign:'center', lineHeight:1.5 }}>{cfg.sub}</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'8px', animation:shake?'pinShake 0.4s ease':'none' }}>
            <PinDots value={currentPin} error={!!error} />
          </div>
          <div style={{ height:'28px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'20px' }}>
            {error&&<div style={{ display:'flex', alignItems:'center', gap:'6px', background:'#FEE2E2', borderRadius:'10px', padding:'6px 14px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize:'12px', fontWeight:600, color:'#DC2626' }}>{error}</span>
            </div>}
          </div>
          <NumPad onPress={handlePress} onDelete={handleDelete} />
          <div style={{ textAlign:'center', marginTop:'20px', padding:'0 24px' }}>
            <span style={{ fontSize:'12px', color:'#94A3B8' }}>{step==='old'?'Forgot PIN? Contact support at support@carebridge.in':'PIN must be 4 digits and not too simple'}</span>
          </div>
        </div>
      </div>
      <PopupLayer />
      <style>{`@keyframes pinShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-8px);} 40%{transform:translateX(8px);} 60%{transform:translateX(-6px);} 80%{transform:translateX(6px);} }`}</style>
    </MobileFrame>
  )
}