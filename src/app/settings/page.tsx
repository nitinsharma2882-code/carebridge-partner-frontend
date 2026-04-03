'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import BottomNav from '@/components/BottomNav'
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

function Toggle({ on, onChange }: { on:boolean; onChange:()=>void }) {
  return (
    <div onClick={onChange} style={{ width:'44px', height:'26px', borderRadius:'100px', background:on?'#0D9488':'#CBD5E1', position:'relative', cursor:'pointer', flexShrink:0, transition:'background 0.25s' }}>
      <div style={{ position:'absolute', top:'3px', left:on?'21px':'3px', width:'20px', height:'20px', borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'left 0.25s cubic-bezier(0.34,1.3,0.64,1)' }} />
    </div>
  )
}

function SectionHeader({ label }: { label:string }) {
  return <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', padding:'16px 16px 8px' }}>{label}</div>
}

function Row({ icon,label,sublabel,toggle,toggled,onToggle,onPress,danger,value,last }: { icon:string;label:string;sublabel?:string;toggle?:boolean;toggled?:boolean;onToggle?:()=>void;onPress?:()=>void;danger?:boolean;value?:string;last?:boolean }) {
  return (
    <div onClick={!toggle?onPress:undefined} style={{ display:'flex', alignItems:'center', gap:'13px', padding:'13px 16px', borderBottom:last?'none':'1px solid #F1F5F9', cursor:toggle?'default':'pointer', background:'#fff' }}>
      <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:danger?'#FEE2E2':'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px', flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'14px', fontWeight:600, color:danger?'#DC2626':'#0F172A' }}>{label}</div>
        {sublabel&&<div style={{ fontSize:'12px', color:'#94A3B8', marginTop:'2px' }}>{sublabel}</div>}
      </div>
      {toggle&&<Toggle on={!!toggled} onChange={onToggle!} />}
      {!toggle&&value&&<span style={{ fontSize:'13px', color:'#94A3B8', fontWeight:600, marginRight:'4px' }}>{value}</span>}
      {!toggle&&<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={danger?'#DC2626':'#CBD5E1'} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { showPopup, closePopup, logout } = useStore()

  const [notifBooking,   setNotifBooking]   = useState(true)
  const [notifPayment,   setNotifPayment]   = useState(true)
  const [notifPromo,     setNotifPromo]     = useState(false)
  const [notifSOS,       setNotifSOS]       = useState(true)
  const [locationAlways, setLocationAlways] = useState(true)
  const [soundAlerts,    setSoundAlerts]    = useState(true)
  const [vibration,      setVibration]      = useState(true)

  // Location toggle — confirmation popup before disabling
  const handleLocationToggle = () => {
    if (locationAlways) {
      showPopup({
        type:'warning', title:'Disable Location?', icon:'📍',
        body:'Disabling location may affect service availability.\nYou may not receive nearby booking requests.\n\nContinue?',
        actions:[
          { label:'Disable', variant:'danger',  fn:() => { setLocationAlways(false); closePopup() } },
          { label:'Keep On', variant:'primary',  fn:closePopup },
        ],
      })
    } else {
      setLocationAlways(true)
    }
  }

  const confirm = (title:string, body:string, icon:string, onConfirm:()=>void) =>
    showPopup({ type:'confirm', title, body, icon, actions:[
      { label:'Confirm', variant:'danger',    fn:()=>{ closePopup(); onConfirm() } },
      { label:'Cancel',  variant:'secondary', fn:closePopup },
    ]})

  const info = (title:string, body:string, icon:string) =>
    showPopup({ type:'info', title, body, icon, actions:[{ label:'OK', variant:'primary', fn:closePopup }] })

  const handleLogout = () =>
    confirm('Log Out?', 'You will be signed out of your account.', '🚪', () => { logout(); router.replace('/login') })

  const handleDeleteAccount = () =>
    confirm('Delete Account?', 'This will permanently delete your account and all data. This cannot be undone.', '⚠️', () => {
      showPopup({ type:'success', title:'Request Submitted', body:'Account deletion request sent.\nOur team will process it within 7 days.', icon:'📧',
        actions:[{ label:'OK', variant:'primary', fn:()=>{ closePopup(); router.replace('/login') } }] })
    })

  // Language label from localStorage
  const savedLang = typeof window !== 'undefined' ? localStorage.getItem('cb_assistant_language') : 'en'
  const LANG_NAMES: Record<string,string> = { en:'English', hi:'Hindi', bn:'Bengali', te:'Telugu', mr:'Marathi', ta:'Tamil', gu:'Gujarati', kn:'Kannada', ml:'Malayalam', pa:'Punjabi', or:'Odia', ur:'Urdu' }
  const langLabel = LANG_NAMES[savedLang||'en'] || 'English'

  return (
    <MobileFrame>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>

        {/* Status bar */}
        <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
        </div>

        {/* Header */}
        <div style={{ height:'56px', background:'#fff', display:'flex', alignItems:'center', padding:'0 16px', gap:'10px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <button onClick={()=>router.back()} style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Settings</span>
          <div style={{ width:'38px' }} />
        </div>

        <div style={{ flex:1, overflowY:'auto', paddingBottom:'90px' }}>

          {/* Profile card */}
          <div onClick={()=>router.push('/profile')} style={{ margin:'14px 14px 0', background:'#fff', borderRadius:'18px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'13px', border:'1px solid #E2E8F0', cursor:'pointer' }}>
            <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'linear-gradient(135deg,#065f52,#0D9488)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>👨‍⚕️</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'16px', fontWeight:800, color:'#0F172A' }}>Rajan Kumar</div>
              <div style={{ fontSize:'13px', color:'#64748B', marginTop:'2px' }}>View & edit your profile →</div>
            </div>
            <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>

          {/* Account */}
          <SectionHeader label="Account" />
          <div style={{ margin:'0 14px', background:'#fff', borderRadius:'18px', overflow:'hidden', border:'1px solid #E2E8F0' }}>
            <Row icon="📍" label="Manage Address"     sublabel="Home, work, saved places"  onPress={()=>router.push('/settings/address')} />
            <Row icon="🆘" label="Emergency Contacts" sublabel="Your SOS contacts"         onPress={()=>router.push('/emergency')} />
            <Row icon="📋" label="My Bookings"        sublabel="Past & upcoming bookings"  onPress={()=>router.push('/bookings')} />
            <Row icon="📁" label="My Documents"       sublabel="Stored health documents"   onPress={()=>router.push('/documents')} last />
          </div>

          {/* Notifications */}
          <SectionHeader label="Notifications" />
          <div style={{ margin:'0 14px', background:'#fff', borderRadius:'18px', overflow:'hidden', border:'1px solid #E2E8F0' }}>
            <Row icon="📋" label="Booking Requests" sublabel="New request alerts"      toggle toggled={notifBooking} onToggle={()=>setNotifBooking(v=>!v)} />
            <Row icon="💰" label="Payment Updates"  sublabel="Credits & withdrawals"   toggle toggled={notifPayment} onToggle={()=>setNotifPayment(v=>!v)} />
            <Row icon="🚨" label="SOS Alerts"       sublabel="Emergency notifications" toggle toggled={notifSOS}     onToggle={()=>setNotifSOS(v=>!v)} />
            <Row icon="📣" label="Promotions"       sublabel="Offers & announcements"  toggle toggled={notifPromo}   onToggle={()=>setNotifPromo(v=>!v)} last />
          </div>

          {/* App Preferences — Dark Mode REMOVED */}
          <SectionHeader label="App Preferences" />
          <div style={{ margin:'0 14px', background:'#fff', borderRadius:'18px', overflow:'hidden', border:'1px solid #E2E8F0' }}>
            <Row icon="🌐" label="Preferred Language" sublabel="English, Hindi & more"     onPress={()=>router.push('/settings/language')} value={langLabel} />
            <Row icon="📍" label="Location Access"    sublabel="Always on for nearby jobs" toggle toggled={locationAlways} onToggle={handleLocationToggle} />
            <Row icon="🔊" label="Sound Alerts"       sublabel="Audible notifications"     toggle toggled={soundAlerts}    onToggle={()=>setSoundAlerts(v=>!v)} />
            <Row icon="📳" label="Vibration"          sublabel="Haptic feedback"           toggle toggled={vibration}      onToggle={()=>setVibration(v=>!v)} last />
          </div>

          {/* Billing */}
          <SectionHeader label="Billing" />
          <div style={{ margin:'0 14px', background:'#fff', borderRadius:'18px', overflow:'hidden', border:'1px solid #E2E8F0' }}>
            <Row icon="💳" label="Billing Information"     sublabel="GST, address, invoices"     onPress={()=>router.push('/settings/billing')} />
            <Row icon="🏦" label="Saved Cards"             sublabel="Cards & UPI addresses"      onPress={()=>router.push('/settings/cards')} />
            <Row icon="💰" label="Payments & Transactions" sublabel="History and receipts"       onPress={()=>router.push('/settings/payments')} />
            <Row icon="🎁" label="Gift Cards & Credits"    sublabel="Redeem & check balance"     onPress={()=>router.push('/settings/credits')} />
            <Row icon="👥" label="Invite a Friend"         sublabel="Earn rewards for referrals" onPress={()=>router.push('/settings/invite')} last />
          </div>

          {/* More */}
          <SectionHeader label="More" />
          <div style={{ margin:'0 14px', background:'#fff', borderRadius:'18px', overflow:'hidden', border:'1px solid #E2E8F0' }}>
            <Row icon="💬" label="Help & Support"        sublabel="FAQ & contact"       onPress={()=>router.push('/settings/help')} />
            <Row icon="⭐" label="Rate the App"          sublabel="Share your feedback" onPress={()=>router.push('/settings/rate')} />
            <Row icon="♿" label="Accessibility"          sublabel="Font size, contrast" onPress={()=>router.push('/settings/accessibility')} />
            <Row icon="📄" label="Terms & Conditions"                                   onPress={()=>router.push('/terms')} />
            <Row icon="🔒" label="Privacy Policy"                                      onPress={()=>router.push('/privacy')} />
            <Row icon="📦" label="Open Source Libraries"                                onPress={()=>router.push('/settings/opensource')} />
            <Row icon="🏅" label="Licenses & Registration"                              onPress={()=>router.push('/settings/licenses')} />
            <Row icon="ℹ️" label="App Version" value="v2.5.0"                          onPress={()=>info('CareBridge Assistant','Version 2.5.0\nBuild 2026.04.01\n\n© 2026 CareBridge Technologies','ℹ️')} last />
          </div>

          {/* Account Actions */}
          <SectionHeader label="Account Actions" />
          <div style={{ margin:'0 14px', background:'#fff', borderRadius:'18px', overflow:'hidden', border:'1px solid #E2E8F0' }}>
            <Row icon="🚪" label="Log Out"        danger onPress={handleLogout} />
            <Row icon="🗑️" label="Delete Account" sublabel="Permanently remove your account" danger onPress={handleDeleteAccount} last />
          </div>

          <div style={{ height:'16px' }} />
        </div>
      </div>

      <BottomNav active="Settings" />
      <PopupLayer />
    </MobileFrame>
  )
}