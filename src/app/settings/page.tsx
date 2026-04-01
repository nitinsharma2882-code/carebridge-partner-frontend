'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import BottomNav from '@/components/BottomNav'

// ── Popup ─────────────────────────────────────────────────────────────────────
function PopupLayer() {
  const { popup, closePopup } = useStore()
  if (!popup) return null
  const iconBg: Record<string, string> = {
    success: '#DCFCE7', warning: '#FEF3C7',
    error: '#FEE2E2', confirm: '#EDE9FE', info: '#EDFAF7',
  }
  const btnBg: Record<string, string> = {
    primary: '#0D9488', secondary: '#F1F5F9', danger: '#DC2626', warning: '#D97706',
  }
  const btnColor: Record<string, string> = {
    primary: '#fff', secondary: '#475569', danger: '#fff', warning: '#fff',
  }
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) closePopup() }}
      style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '22px', width: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '28px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: iconBg[popup.type], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '12px' }}>
            {popup.icon || 'ℹ️'}
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', textAlign: 'center', margin: 0 }}>{popup.title}</h2>
        </div>
        <p style={{ fontSize: '14px', color: '#64748B', textAlign: 'center', padding: '8px 22px 18px', lineHeight: 1.65 }}
          dangerouslySetInnerHTML={{ __html: popup.body.replace(/\n/g, '<br/>') }} />
        <div style={{ display: 'flex', gap: '10px', padding: '0 18px 22px' }}>
          {popup.actions.map((a, i) => (
            <button key={i} onClick={a.fn} style={{ flex: 1, padding: '14px', borderRadius: '14px', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', background: btnBg[a.variant], color: btnColor[a.variant] }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{ width: '44px', height: '26px', borderRadius: '100px', background: on ? '#0D9488' : '#CBD5E1', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.25s' }}>
      <div style={{ position: 'absolute', top: '3px', left: on ? '21px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.25s cubic-bezier(0.34,1.3,0.64,1)' }} />
    </div>
  )
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '16px 16px 8px' }}>
      {label}
    </div>
  )
}

// ── Settings Row ──────────────────────────────────────────────────────────────
function Row({
  icon, label, sublabel, toggle, toggled, onToggle, onPress, danger, value, last,
}: {
  icon: string; label: string; sublabel?: string
  toggle?: boolean; toggled?: boolean; onToggle?: () => void
  onPress?: () => void; danger?: boolean; value?: string; last?: boolean
}) {
  return (
    <div onClick={!toggle ? onPress : undefined}
      style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '13px 16px', borderBottom: last ? 'none' : '1px solid #F1F5F9', cursor: toggle ? 'default' : 'pointer', background: '#fff' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: danger ? '#FEE2E2' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: danger ? '#DC2626' : '#0F172A' }}>{label}</div>
        {sublabel && <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{sublabel}</div>}
      </div>
      {toggle && <Toggle on={!!toggled} onChange={onToggle!} />}
      {!toggle && value && <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 600, marginRight: '4px' }}>{value}</span>}
      {!toggle && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={danger ? '#DC2626' : '#CBD5E1'} strokeWidth="2.5" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter()
  const { showPopup, closePopup, logout } = useStore()

  // Notification toggles
  const [notifBooking,  setNotifBooking]  = useState(true)
  const [notifPayment,  setNotifPayment]  = useState(true)
  const [notifPromo,    setNotifPromo]    = useState(false)
  const [notifSOS,      setNotifSOS]      = useState(true)

  // App settings
  const [locationAlways, setLocationAlways] = useState(true)
  const [darkMode,        setDarkMode]       = useState(false)
  const [soundAlerts,     setSoundAlerts]    = useState(true)
  const [vibration,       setVibration]      = useState(true)
  const [biometric,       setBiometric]      = useState(false)
  const [autoAccept,      setAutoAccept]     = useState(false)

  const confirm = (title: string, body: string, icon: string, onConfirm: () => void) => {
    showPopup({
      type: 'confirm', title, body, icon,
      actions: [
        { label: 'Confirm', variant: 'danger',    fn: () => { closePopup(); onConfirm() } },
        { label: 'Cancel',  variant: 'secondary', fn: closePopup },
      ],
    })
  }

  const info = (title: string, body: string, icon: string) => {
    showPopup({
      type: 'info', title, body, icon,
      actions: [{ label: 'OK', variant: 'primary', fn: closePopup }],
    })
  }

  const comingSoon = (label: string) =>
    info(label, 'This feature is coming in the next update!', '🔧')

  const handleLogout = () => {
    confirm('Log Out?', 'You will be signed out of your account.', '🚪', () => {
      logout()
      router.replace('/login')
    })
  }

  const handleDeleteAccount = () => {
    confirm('Delete Account?', 'This will permanently delete your account and all data. This cannot be undone.', '⚠️', () => {
      showPopup({
        type: 'success', title: 'Request Submitted',
        body: 'Account deletion request sent.\nOur team will process it within 7 days.',
        icon: '📧',
        actions: [{ label: 'OK', variant: 'primary', fn: () => { closePopup(); router.replace('/login') } }],
      })
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '390px', height: '844px', borderRadius: '48px', overflow: 'hidden', position: 'relative', flexShrink: 0, boxShadow: '0 0 0 10px #1e293b, 0 0 0 12px #334155, 0 40px 80px rgba(0,0,0,0.8)', background: '#F8FAFC' }}>

        {/* Notch */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '126px', height: '34px', background: '#111827', borderRadius: '0 0 20px 20px', zIndex: 50 }} />

        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Status bar */}
          <div style={{ height: '50px', padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>9:41</span>
          </div>

          {/* Header */}
          <div style={{ height: '56px', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '10px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
            <button onClick={() => router.back()} style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#F1F5F9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Settings</span>
            <div style={{ width: '38px' }} />
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '90px' }}>

            {/* Profile mini card */}
            <div onClick={() => router.push('/profile')}
              style={{ margin: '14px 14px 0', background: '#fff', borderRadius: '18px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '13px', border: '1px solid #E2E8F0', cursor: 'pointer' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#065f52,#0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>👨‍⚕️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Rajan Kumar</div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>View & edit your profile →</div>
              </div>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>

            {/* ── ACCOUNT ── */}
            <SectionHeader label="Account" />
            <div style={{ margin: '0 14px', background: '#fff', borderRadius: '18px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <Row icon="👤" label="Profile Details"    sublabel="Name, photo, contact info"  onPress={() => router.push('/profile')} />
              <Row icon="📍" label="Manage Address"     sublabel="Home, work, saved places"   onPress={() => router.push('/settings/address')} />
              <Row icon="🆘" label="Emergency Contacts" sublabel="Your SOS contacts"          onPress={() => router.push('/emergency')} />
              <Row icon="📋" label="My Bookings"        sublabel="Past & upcoming bookings"   onPress={() => router.push('/bookings')} />
              <Row icon="📁" label="My Documents"       sublabel="Stored health documents"    onPress={() => router.push('/documents')} last />
            </div>

            {/* ── NOTIFICATIONS ── */}
            <SectionHeader label="Notifications" />
            <div style={{ margin: '0 14px', background: '#fff', borderRadius: '18px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <Row icon="📋" label="Booking Requests" sublabel="New request alerts"      toggle toggled={notifBooking} onToggle={() => setNotifBooking(v => !v)} />
              <Row icon="💰" label="Payment Updates"  sublabel="Credits & withdrawals"   toggle toggled={notifPayment} onToggle={() => setNotifPayment(v => !v)} />
              <Row icon="🚨" label="SOS Alerts"       sublabel="Emergency notifications" toggle toggled={notifSOS}     onToggle={() => setNotifSOS(v => !v)} />
              <Row icon="📣" label="Promotions"       sublabel="Offers & announcements"  toggle toggled={notifPromo}   onToggle={() => setNotifPromo(v => !v)} last />
            </div>

            {/* ── APP PREFERENCES ── */}
            <SectionHeader label="App Preferences" />
            <div style={{ margin: '0 14px', background: '#fff', borderRadius: '18px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <Row icon="🌐" label="Preferred Language" sublabel="English, Hindi & more"       onPress={() => comingSoon('Preferred Language')} value="English" />
              <Row icon="📍" label="Location Access"    sublabel="Always on for nearby jobs"   toggle toggled={locationAlways} onToggle={() => setLocationAlways(v => !v)} />
              <Row icon="🔊" label="Sound Alerts"       sublabel="Audible notifications"       toggle toggled={soundAlerts}    onToggle={() => setSoundAlerts(v => !v)} />
              <Row icon="📳" label="Vibration"          sublabel="Haptic feedback"             toggle toggled={vibration}      onToggle={() => setVibration(v => !v)} />
              <Row icon="🌙" label="Dark Mode"          sublabel="Coming soon"                 toggle toggled={darkMode}       onToggle={() => info('Dark Mode', 'Dark mode is coming in the next update!', '🌙')} />
              <Row icon="⚡" label="Auto-Accept"        sublabel="Auto accept nearby requests" toggle toggled={autoAccept}     onToggle={() => {
                if (!autoAccept) confirm('Enable Auto-Accept?', 'Requests within 2 km will be automatically accepted.', '⚡', () => setAutoAccept(true))
                else setAutoAccept(false)
              }} last />
            </div>

            {/* ── SECURITY ── */}
            <SectionHeader label="Privacy & Security" />
            <div style={{ margin: '0 14px', background: '#fff', borderRadius: '18px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <Row icon="👆" label="Biometric Login" sublabel="Face ID / Fingerprint"  toggle toggled={biometric} onToggle={() => setBiometric(v => !v)} />
              <Row icon="🔑" label="Change PIN"      sublabel="Update your login PIN"   onPress={() => info('Change PIN', 'PIN change will be available in the next update.', '🔑')} />
              <Row icon="📱" label="Linked Devices"  value="1 device"                  onPress={() => info('Linked Devices', 'Currently signed in on:\n📱 Xiaomi Redmi Note 12\nDelhi, India · Right now', '📱')} last />
            </div>

            {/* ── BILLING ── */}
            <SectionHeader label="Billing" />
            <div style={{ margin: '0 14px', background: '#fff', borderRadius: '18px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <Row icon="💳" label="Billing Information"     sublabel="GST, address, invoices"     onPress={() => comingSoon('Billing Information')} />
              <Row icon="🏦" label="Saved Cards"             sublabel="Manage payment methods"     onPress={() => comingSoon('Saved Cards')} />
              <Row icon="💰" label="Payments & Transactions" sublabel="History and receipts"       onPress={() => comingSoon('Payments & Transactions')} />
              <Row icon="🎁" label="Gift Cards & Credits"    sublabel="Redeem & check balance"     onPress={() => comingSoon('Gift Cards & Credits')} />
              <Row icon="👥" label="Invite a Friend"         sublabel="Earn rewards for referrals" onPress={() => comingSoon('Invite a Friend')} last />
            </div>

            {/* ── MORE ── */}
            <SectionHeader label="More" />
            <div style={{ margin: '0 14px', background: '#fff', borderRadius: '18px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <Row icon="💬" label="Help & Support"          sublabel="Chat with our team"  onPress={() => info('Help & Support', 'Contact us at:\nsupport@carebridge.in\n\nAvailable Mon–Sat, 9 AM – 6 PM', '💬')} />
              <Row icon="⭐" label="Rate the App"            sublabel="Share your feedback" onPress={() => info('Rate CareBridge', 'Thank you! Rating opens the app store in the live version.', '⭐')} />
              <Row icon="♿" label="Accessibility"            sublabel="Font size, contrast"  onPress={() => comingSoon('Accessibility')} />
              <Row icon="📄" label="Terms & Conditions"                                      onPress={() => router.push('/terms')} />
              <Row icon="🔒" label="Privacy Policy"                                          onPress={() => router.push('/privacy')} />
              <Row icon="📦" label="Open Source Libraries"                                   onPress={() => comingSoon('Open Source Libraries')} />
              <Row icon="🏅" label="Licenses & Registration"                                 onPress={() => comingSoon('Licenses & Registration')} />
              <Row icon="ℹ️" label="App Version" value="v2.5.0"                             onPress={() => info('CareBridge Assistant', 'Version 2.5.0\nBuild 2026.04.01\n\n© 2026 CareBridge Technologies', 'ℹ️')} last />
            </div>

            {/* ── DANGER ZONE ── */}
            <SectionHeader label="Account Actions" />
            <div style={{ margin: '0 14px', background: '#fff', borderRadius: '18px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <Row icon="🚪" label="Log Out"        danger onPress={handleLogout} />
              <Row icon="🗑️" label="Delete Account" sublabel="Permanently remove your account" danger onPress={handleDeleteAccount} last />
            </div>

            <div style={{ height: '16px' }} />
          </div>
        </div>

        <BottomNav active="Settings" />
        <PopupLayer />
      </div>
    </div>
  )
}