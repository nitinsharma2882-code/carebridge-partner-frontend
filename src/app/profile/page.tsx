'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import BottomNav from '@/components/BottomNav'
import MobileFrame from '@/components/MobileFrame'

// ── Popup ─────────────────────────────────────────────────────────────────────
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

// ── Reusable primitives ───────────────────────────────────────────────────────
function SubHead({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:'12px', background:'#fff', borderBottom:'1px solid #E2E8F0', padding:'52px 16px 14px' }}>
      <button onClick={onBack} style={{ width:'38px', height:'38px', borderRadius:'12px', background:'#F8FAFC', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h3 style={{ fontSize:'15px', fontWeight:700, color:'#0F172A', margin:0 }}>{title}</h3>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, readOnly = false, type = 'text' }: {
  label: string; value: string; onChange?: (v: string) => void
  placeholder?: string; readOnly?: boolean; type?: string
}) {
  return (
    <div style={{ marginBottom:'14px' }}>
      <label style={{ display:'block', fontSize:'12px', fontWeight:700, color:'#1E293B', marginBottom:'6px' }}>{label}</label>
      <input type={type} value={value} readOnly={readOnly} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
        style={{ width:'100%', padding:'14px 16px', border:`1.5px solid ${readOnly ? '#E2E8F0' : '#0D9488'}`, borderRadius:'14px', fontSize:'14px', color: readOnly ? '#94A3B8' : '#0F172A', background: readOnly ? '#F8FAFC' : '#fff', outline:'none', fontFamily:'DM Sans, sans-serif', boxSizing:'border-box' as const }} />
    </div>
  )
}

function SaveBtn({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <button onClick={onSave} disabled={saving}
      style={{ width:'100%', padding:'16px', borderRadius:'14px', fontSize:'14px', fontWeight:700, border:'none', cursor: saving ? 'not-allowed' : 'pointer', background: saving ? '#94A3B8' : '#0D9488', color:'#fff', fontFamily:'DM Sans, sans-serif', marginTop:'8px' }}>
      {saving ? 'Saving…' : 'Save Changes'}
    </button>
  )
}

function SuccessBanner({ msg }: { msg: string }) {
  return (
    <div style={{ background:'#DCFCE7', border:'1px solid #BBF7D0', borderRadius:'12px', padding:'12px 16px', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
      <span style={{ fontSize:'16px' }}>✅</span>
      <span style={{ fontSize:'13px', fontWeight:600, color:'#166534' }}>{msg}</span>
    </div>
  )
}

function MenuItem({ icon, label, sub, danger = false, onClick }: {
  icon: string; label: string; sub?: string; danger?: boolean; onClick: () => void
}) {
  return (
    <div onClick={onClick} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', borderBottom:'1px solid #F1F5F9', cursor:'pointer', background:'#fff' }}>
      <div style={{ width:'38px', height:'38px', borderRadius:'12px', background: danger ? '#FEE2E2' : '#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'14px', fontWeight:700, color: danger ? '#DC2626' : '#0F172A' }}>{label}</div>
        {sub && <div style={{ fontSize:'11px', color:'#94A3B8', marginTop:'2px' }}>{sub}</div>}
      </div>
      {!danger && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>}
    </div>
  )
}

// ── Static data ───────────────────────────────────────────────────────────────
type DocStatus = 'verified'|'pending'|'rejected'|'missing'
const docBadge: Record<DocStatus,{bg:string;color:string;label:string;icon:string}> = {
  verified:{ bg:'#DCFCE7', color:'#16A34A', label:'Verified', icon:'✓' },
  pending: { bg:'#FEF3C7', color:'#D97706', label:'Pending',  icon:'⏳' },
  rejected:{ bg:'#FEE2E2', color:'#DC2626', label:'Rejected', icon:'✕' },
  missing: { bg:'#F1F5F9', color:'#94A3B8', label:'Upload',   icon:'+' },
}
const DOCS   = [
  { id:'d1', type:'Aadhaar Card',     status:'verified' as DocStatus, icon:'🪪' },
  { id:'d2', type:'Care Certificate', status:'pending'  as DocStatus, icon:'📋' },
  { id:'d3', type:'Medical License',  status:'verified' as DocStatus, icon:'🏥' },
  { id:'d4', type:'Police Clearance', status:'missing'  as DocStatus, icon:'🛡️' },
]
const SKILLS = ['Elder Care','Nursing','Physiotherapy','Medication','First Aid','Palliative Care']
const LANGS  = ['Hindi','English','Punjabi']

// ── Sub-screen type ───────────────────────────────────────────────────────────
type SubScreen = 'main' | 'personal' | 'settings' | 'privacy'

interface User { name?:string; phone?:string; email?:string; bloodGroup?:string; gender?:string; age?:number }

// ── Personal Details Sub-screen ───────────────────────────────────────────────
function PersonalView({ onBack }: { onBack: () => void }) {
  const [name,       setName]       = useState('')
  const [email,      setEmail]      = useState('')
  const [phone,      setPhone]      = useState('')
  const [bloodGroup, setBloodGroup] = useState('B+')
  const [gender,     setGender]     = useState('Male')
  const [age,        setAge]        = useState('')
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(data => {
      if (data.success && data.user) {
        const u: User = data.user
        setName(u.name || ''); setEmail(u.email || ''); setPhone(u.phone || '')
        setBloodGroup(u.bloodGroup || 'B+'); setGender(u.gender || 'Male')
        setAge(u.age ? String(u.age) : '')
      }
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true); setSaved(false)
    try {
      const res = await fetch('/api/users/me', {
        method:'PUT', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ name, email, bloodGroup, gender, age: age ? parseInt(age) : undefined }),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        try {
          const s = localStorage.getItem('carebridge_user')
          if (s) localStorage.setItem('carebridge_user', JSON.stringify({ ...JSON.parse(s), name, email }))
        } catch {}
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {}
    setSaving(false)
  }

  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', background:'#F8FAFC' }}>
      <SubHead title="Personal Details" onBack={onBack} />
      <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
        {saved && <SuccessBanner msg="Profile updated successfully!" />}
        <Field label="Full Name"    value={name}  onChange={setName}  placeholder="Enter your name" />
        <Field label="Email"        value={email} onChange={setEmail} placeholder="Enter your email" type="email" />
        <Field label="Phone Number" value={phone} readOnly />
        <Field label="Age"          value={age}   onChange={setAge}   placeholder="Enter your age" type="number" />

        {/* Blood Group */}
        <div style={{ marginBottom:'14px' }}>
          <label style={{ display:'block', fontSize:'12px', fontWeight:700, color:'#1E293B', marginBottom:'6px' }}>Blood Group</label>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => (
              <button key={bg} onClick={() => setBloodGroup(bg)} style={{ padding:'8px 14px', borderRadius:'10px', fontSize:'13px', fontWeight:700, border:`1.5px solid ${bloodGroup===bg?'#0D9488':'#E2E8F0'}`, background:bloodGroup===bg?'#EDFAF7':'#fff', color:bloodGroup===bg?'#0D9488':'#64748B', cursor:'pointer' }}>{bg}</button>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div style={{ marginBottom:'14px' }}>
          <label style={{ display:'block', fontSize:'12px', fontWeight:700, color:'#1E293B', marginBottom:'6px' }}>Gender</label>
          <div style={{ display:'flex', gap:'8px' }}>
            {['Male','Female','Other'].map(g => (
              <button key={g} onClick={() => setGender(g)} style={{ flex:1, padding:'10px', borderRadius:'10px', fontSize:'13px', fontWeight:700, border:`1.5px solid ${gender===g?'#0D9488':'#E2E8F0'}`, background:gender===g?'#EDFAF7':'#fff', color:gender===g?'#0D9488':'#64748B', cursor:'pointer' }}>{g}</button>
            ))}
          </div>
        </div>

        <SaveBtn onSave={handleSave} saving={saving} />
      </div>
    </div>
  )
}

// ── Settings Sub-screen ───────────────────────────────────────────────────────
function SettingsView({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', background:'#F8FAFC' }}>
      <SubHead title="Settings" onBack={onBack} />
      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ margin:'16px 14px 6px' }}>
          <span style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.5px' }}>Preferences</span>
        </div>
        <div style={{ background:'#fff', borderRadius:'16px', margin:'0 14px', overflow:'hidden', border:'1px solid #E2E8F0' }}>
          <MenuItem icon="🔔" label="Notifications"  sub="Manage alerts & reminders" onClick={() => {}} />
          <MenuItem icon="🌐" label="Language"        sub="English (India)"           onClick={() => {}} />
          <MenuItem icon="🎨" label="Appearance"      sub="Light mode"                onClick={() => {}} />
        </div>
        <div style={{ margin:'16px 14px 6px' }}>
          <span style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.5px' }}>Account</span>
        </div>
        <div style={{ background:'#fff', borderRadius:'16px', margin:'0 14px', overflow:'hidden', border:'1px solid #E2E8F0' }}>
          <MenuItem icon="🔒" label="Change PIN"    sub="Update your security PIN"  onClick={() => {}} />
          <MenuItem icon="🏦" label="Bank Details"  sub="Manage payout account"     onClick={() => {}} />
        </div>
      </div>
    </div>
  )
}

// ── Privacy Sub-screen ────────────────────────────────────────────────────────
function PrivacyView({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', background:'#F8FAFC' }}>
      <SubHead title="Privacy & Security" onBack={onBack} />
      <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
        <div style={{ background:'#fff', borderRadius:'16px', overflow:'hidden', border:'1px solid #E2E8F0' }}>
          <MenuItem icon="📍" label="Location Access"  sub="Used for nearby requests"   onClick={() => {}} />
          <MenuItem icon="📷" label="Camera Access"    sub="Used for document uploads"  onClick={() => {}} />
          <MenuItem icon="🗑️" label="Delete Account"   sub="Permanently remove account" danger onClick={() => {}} />
        </div>
      </div>
    </div>
  )
}

// ── Main Profile Page ─────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter()
  const { showPopup, closePopup } = useStore()
  const [view,        setView]        = useState<SubScreen>('main')
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // ── Fetch real user on mount ──────────────────────────────
  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(data => {
      if (data.success) setCurrentUser(data.user)
    }).catch(() => {})
  }, [])

  const handleLogout = () => {
    showPopup({
      type:'confirm', title:'Sign Out?',
      body:'You will be signed out of your account.\nYou can sign back in anytime.',
      icon:'🚪',
      actions:[
        { label:'Cancel',   variant:'secondary', fn: closePopup },
        { label:'Sign Out', variant:'danger',    fn: () => { closePopup(); localStorage.clear(); router.push('/login') } },
      ],
    })
  }

  const onDocPress = (doc: typeof DOCS[0]) => {
    showPopup({
      type: doc.status==='verified' ? 'success' : doc.status==='rejected' ? 'error' : 'info',
      title: doc.type, icon: doc.icon,
      body: doc.status==='verified' ? 'This document has been verified by CareBridge.'
          : doc.status==='pending'  ? 'Document is under review. Allow 24–48 hours.'
          : doc.status==='rejected' ? 'Document was rejected. Please re-upload a clearer copy.'
          : 'No document uploaded yet. Tap to upload.',
      actions:[
        ...(doc.status !== 'verified' ? [{ label: doc.status==='missing' ? 'Upload Now' : 'Re-upload', variant:'primary' as const, fn:()=>{ closePopup(); showPopup({ type:'info', title:'Upload Feature', body:'Document upload will open your camera/gallery in the live app.', icon:'📷', actions:[{ label:'OK', variant:'primary' as const, fn:closePopup }] }) } }] : []),
        { label:'Close', variant:'secondary' as const, fn:closePopup },
      ],
    })
  }

  // Sub-screen router
  if (view === 'personal') return <MobileFrame><PersonalView onBack={() => setView('main')} /></MobileFrame>
  if (view === 'settings') return <MobileFrame><SettingsView onBack={() => setView('main')} /></MobileFrame>
  if (view === 'privacy')  return <MobileFrame><PrivacyView  onBack={() => setView('main')} /></MobileFrame>

  // Avatar initials from real name
  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '👨‍⚕️'

  return (
    <MobileFrame>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>

        {/* Status bar */}
        <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
        </div>

        {/* Top nav */}
        <div style={{ height:'56px', background:'#fff', display:'flex', alignItems:'center', padding:'0 16px', gap:'10px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <button onClick={() => router.back()} style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>My Profile</span>
          {/* Edit button → goes to personal details */}
          <button onClick={() => setView('personal')} style={{ background:'#EDFAF7', border:'none', borderRadius:'10px', padding:'0 14px', height:'34px', fontSize:'13px', fontWeight:700, color:'#0D9488', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
            Edit
          </button>
        </div>

        <div style={{ flex:1, overflowY:'auto', paddingBottom:'90px' }}>

          {/* Profile header */}
          <div style={{ background:'linear-gradient(160deg,#065f52,#0D9488,#14b8a6)', padding:'24px 20px 28px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'rgba(255,255,255,0.25)', border:'3px solid rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: currentUser?.name ? '26px' : '32px', fontWeight:900, color:'#fff' }}>
              {initials}
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'22px', fontWeight:900, color:'#fff', letterSpacing:'-0.4px' }}>
                {currentUser?.name || 'Loading…'}
              </div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.75)', marginTop:'3px' }}>
                Healthcare Assistant · {currentUser?.phone ? `+91 ${currentUser.phone}` : ''}
              </div>
            </div>
            <div style={{ display:'flex', gap:'8px', marginTop:'4px', width:'100%' }}>
              {[{v:'4.9★',l:'Rating'},{v:'104',l:'Trips'},{v:'4 yrs',l:'Exp'}].map(s => (
                <div key={s.l} style={{ flex:1, background:'rgba(255,255,255,0.15)', borderRadius:'12px', padding:'10px 8px', textAlign:'center' }}>
                  <div style={{ fontSize:'15px', fontWeight:800, color:'#fff' }}>{s.v}</div>
                  <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.7)', fontWeight:600, marginTop:'2px' }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'5px', background:'rgba(255,255,255,0.15)', borderRadius:'100px', padding:'5px 14px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontSize:'12px', fontWeight:700, color:'#fff' }}>CareBridge Verified Partner</span>
            </div>
          </div>

          {/* Account menu */}
          <div style={{ margin:'14px 14px 6px' }}>
            <span style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.5px' }}>Account</span>
          </div>
          <div style={{ background:'#fff', borderRadius:'16px', margin:'0 14px', overflow:'hidden', border:'1px solid #E2E8F0' }}>
            <MenuItem icon="👤" label="Personal Details"  sub="Name, email, blood group"    onClick={() => setView('personal')} />
            <MenuItem icon="🏦" label="Bank & Payouts"    sub="Manage your earnings account" onClick={() => router.push('/earnings')} />
            <MenuItem icon="📄" label="My Documents" sub="Certificates & ID proofs" onClick={() => router.push('/bookings')} />
          </div>

          {/* Skills */}
          <div style={{ margin:'12px 14px 0', background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0' }}>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px' }}>Skills & Services</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              {SKILLS.map(s => <div key={s} style={{ background:'#EDFAF7', border:'1px solid #CCFBF1', borderRadius:'100px', padding:'6px 14px', fontSize:'12px', fontWeight:700, color:'#0D9488' }}>{s}</div>)}
            </div>
          </div>

          {/* Languages */}
          <div style={{ margin:'12px 14px 0', background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0' }}>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px' }}>Languages</div>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {LANGS.map(l => <div key={l} style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'100px', padding:'6px 14px', fontSize:'12px', fontWeight:700, color:'#2563EB' }}>{l}</div>)}
            </div>
          </div>

          {/* Documents */}
          <div style={{ margin:'12px 14px 0', background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0' }}>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px' }}>Documents</div>
            {DOCS.map((doc, i) => {
              const b = docBadge[doc.status]
              return (
                <div key={doc.id} onClick={() => onDocPress(doc)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom: i < DOCS.length-1 ? '1px solid #F1F5F9' : 'none', cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'#F8FAFC', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>{doc.icon}</div>
                    <div style={{ fontSize:'14px', fontWeight:600, color:'#0F172A' }}>{doc.type}</div>
                  </div>
                  <div style={{ background:b.bg, color:b.color, fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'100px' }}>{b.icon} {b.label}</div>
                </div>
              )
            })}
          </div>

          {/* Support menu */}
          <div style={{ margin:'12px 14px 6px' }}>
            <span style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.5px' }}>Support</span>
          </div>
          <div style={{ background:'#fff', borderRadius:'16px', margin:'0 14px', overflow:'hidden', border:'1px solid #E2E8F0' }}>
            <MenuItem icon="⚙️" label="Settings"           sub="Notifications, language"    onClick={() => setView('settings')} />
            <MenuItem icon="🔒" label="Privacy & Security" sub="Location, camera, data"     onClick={() => setView('privacy')} />
            <MenuItem icon="💬" label="Help & Support"     sub="Chat with our team"         onClick={() => router.push('/ai-chat')} />
            <MenuItem icon="📋" label="Terms of Service"   sub="Read our terms"             onClick={() => router.push('/terms')} />
          </div>

          {/* Logout */}
          <div style={{ margin:'12px 14px 0' }}>
            <div style={{ background:'#fff', borderRadius:'16px', overflow:'hidden', border:'1px solid #E2E8F0' }}>
              <MenuItem icon="🚪" label="Sign Out" danger onClick={handleLogout} />
            </div>
          </div>

          {/* Version */}
          <div style={{ textAlign:'center', padding:'20px', fontSize:'11px', color:'#CBD5E1', fontWeight:600 }}>
            CareBridge Partner v1.0.0
          </div>

        </div>
      </div>

      <BottomNav active="Settings" />
      <PopupLayer />
    </MobileFrame>
  )
}