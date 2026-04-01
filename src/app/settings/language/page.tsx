'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import MobileFrame from '@/components/MobileFrame'

const STORAGE_KEY = 'cb_assistant_language'
const LANGUAGES = [
  { code:'en', name:'English',   native:'English',  flag:'🇬🇧' },
  { code:'hi', name:'Hindi',     native:'हिन्दी',      flag:'🇮🇳' },
  { code:'bn', name:'Bengali',   native:'বাংলা',      flag:'🇮🇳' },
  { code:'te', name:'Telugu',    native:'తెలుగు',      flag:'🇮🇳' },
  { code:'mr', name:'Marathi',   native:'मराठी',       flag:'🇮🇳' },
  { code:'ta', name:'Tamil',     native:'தமிழ்',       flag:'🇮🇳' },
  { code:'gu', name:'Gujarati',  native:'ગુજરાતી',     flag:'🇮🇳' },
  { code:'kn', name:'Kannada',   native:'ಕನ್ನಡ',       flag:'🇮🇳' },
  { code:'ml', name:'Malayalam', native:'മലയാളം',      flag:'🇮🇳' },
  { code:'pa', name:'Punjabi',   native:'ਪੰਜਾਬੀ',      flag:'🇮🇳' },
  { code:'or', name:'Odia',      native:'ଓଡ଼ିଆ',       flag:'🇮🇳' },
  { code:'ur', name:'Urdu',      native:'اردو',        flag:'🇮🇳' },
]

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

export default function LanguagePage() {
  const router=useRouter(); const { showPopup,closePopup }=useStore()
  const [selected,setSelected]=useState('en'); const [saved,setSaved]=useState('en'); const [search,setSearch]=useState('')

  useEffect(()=>{ if(typeof window!=='undefined'){ const stored=localStorage.getItem(STORAGE_KEY); if(stored){ setSelected(stored); setSaved(stored) } } },[])

  const filtered=LANGUAGES.filter(l=>l.name.toLowerCase().includes(search.toLowerCase())||l.native.toLowerCase().includes(search.toLowerCase()))
  const hasChanges=selected!==saved
  const currentLang=LANGUAGES.find(l=>l.code===saved)

  const handleSave=()=>{ if(typeof window!=='undefined') localStorage.setItem(STORAGE_KEY,selected); setSaved(selected); const lang=LANGUAGES.find(l=>l.code===selected); showPopup({ type:'success', title:'Language Updated ✅', body:`App language has been set to ${lang?.name}.`, icon:lang?.flag||'🌐', actions:[{ label:'Done', variant:'primary', fn:()=>{ closePopup(); router.back() } }] }) }

  return (
    <MobileFrame>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>
        <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
          <span style={{ fontSize:'11px', fontWeight:700, color:'#0F172A' }}>5G</span>
        </div>
        <div style={{ height:'56px', background:'#fff', display:'flex', alignItems:'center', padding:'0 16px', gap:'10px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <button onClick={()=>router.back()} style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/></svg></button>
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Preferred Language</span>
          {hasChanges?<button onClick={handleSave} style={{ background:'#0D9488', border:'none', borderRadius:'10px', padding:'0 14px', height:'34px', fontSize:'13px', fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Save</button>:<div style={{ width:'38px' }} />}
        </div>
        <div style={{ background:'#fff', padding:'12px 14px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <div style={{ background:'#EDFAF7', borderRadius:'14px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', border:'1px solid #CCFBF1' }}>
            <span style={{ fontSize:'26px' }}>{currentLang?.flag}</span>
            <div><div style={{ fontSize:'12px', fontWeight:600, color:'#0D9488', marginBottom:'2px' }}>Currently Active</div><div style={{ fontSize:'15px', fontWeight:800, color:'#0F172A' }}>{currentLang?.name} <span style={{ fontSize:'13px', fontWeight:500, color:'#64748B' }}>· {currentLang?.native}</span></div></div>
          </div>
        </div>
        <div style={{ background:'#fff', padding:'10px 14px 12px', flexShrink:0, borderBottom:'1px solid #E2E8F0' }}>
          <div style={{ position:'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search language..." style={{ width:'100%', padding:'10px 14px 10px 36px', background:'#F1F5F9', border:'1.5px solid #E2E8F0', borderRadius:'12px', fontSize:'14px', color:'#0F172A', fontFamily:'DM Sans, sans-serif', outline:'none', boxSizing:'border-box' }}
              onFocus={e=>{ e.target.style.borderColor='#0D9488'; e.target.style.background='#EDFAF7' }}
              onBlur={e=>{ e.target.style.borderColor='#E2E8F0'; e.target.style.background='#F1F5F9' }} />
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'10px 14px 24px' }}>
          {filtered.length===0?(
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 24px', gap:'12px', textAlign:'center' }}>
              <div style={{ fontSize:'48px' }}>🔍</div><div style={{ fontSize:'15px', fontWeight:800, color:'#0F172A' }}>No language found</div><div style={{ fontSize:'13px', color:'#94A3B8' }}>Try a different search term</div>
            </div>
          ):(
            <div style={{ background:'#fff', borderRadius:'18px', border:'1px solid #E2E8F0', overflow:'hidden' }}>
              {filtered.map((lang,i)=>{ const isSel=selected===lang.code; const isLast=i===filtered.length-1; return (
                <div key={lang.code} onClick={()=>setSelected(lang.code)} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', borderBottom:isLast?'none':'1px solid #F1F5F9', cursor:'pointer', background:isSel?'#EDFAF7':'#fff', transition:'background 0.15s' }}>
                  <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:isSel?'#CCFBF1':'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>{lang.flag}</div>
                  <div style={{ flex:1 }}><div style={{ fontSize:'14px', fontWeight:700, color:isSel?'#0D9488':'#0F172A' }}>{lang.name}</div><div style={{ fontSize:'12px', color:isSel?'#0D9488':'#94A3B8', marginTop:'2px' }}>{lang.native}</div></div>
                  {isSel?<div style={{ width:'24px', height:'24px', borderRadius:'50%', background:'#0D9488', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>:<div style={{ width:'24px', height:'24px', borderRadius:'50%', border:'2px solid #E2E8F0', flexShrink:0 }} />}
                </div>
              )})}
            </div>
          )}
        </div>
        {hasChanges&&<div style={{ padding:'12px 14px 24px', background:'#fff', borderTop:'1px solid #E2E8F0', flexShrink:0 }}><button onClick={handleSave} style={{ width:'100%', padding:'16px', background:'#0D9488', border:'none', borderRadius:'14px', color:'#fff', fontSize:'16px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>Save Language Preference →</button></div>}
      </div>
      <PopupLayer />
    </MobileFrame>
  )
}