'use client'
import { useRouter } from 'next/navigation'
import MobileFrame from '@/components/MobileFrame'

const SECTIONS = [
  { icon:'📋', title:'Information We Collect',    body:`We collect information you provide directly, including:\n• Full name, phone number, and email address\n• Government-issued ID and professional certificates\n• Bank account details for payment processing\n• Profile photo and work experience\n\nWe also collect data automatically such as device information, IP address, app usage patterns, and GPS location (when the app is active).` },
  { icon:'🎯', title:'How We Use Your Information',body:`Your information is used to:\n• Verify your identity and professional credentials\n• Match you with nearby service requests\n• Process earnings and withdrawals\n• Send booking, payment, and SOS notifications\n• Improve the safety and quality of our platform\n• Comply with legal and regulatory requirements` },
  { icon:'📍', title:'Location Data',              body:`CareBridge collects your precise GPS location while you are online on the app. This is used to match you with nearby customers and to share your location with emergency contacts during an SOS event.\n\nYou can disable location access in your device settings, but this will prevent you from receiving booking requests.` },
  { icon:'🤝', title:'Data Sharing',              body:`We do not sell your personal data. We share your information only with:\n• Customers (limited to name, rating, and service info)\n• Payment processors for earnings disbursement\n• Emergency contacts (location only during SOS)\n• Government authorities when required by law` },
  { icon:'🔒', title:'Data Security',             body:`We use industry-standard encryption (TLS 1.3) to protect data in transit and AES-256 encryption for data at rest. Access to your data is restricted to authorised CareBridge personnel only. We conduct regular security audits and vulnerability assessments.` },
  { icon:'📱', title:'Data Retention',            body:`We retain your account data for as long as your account is active. If you delete your account, we will permanently remove your personal data within 30 days, except where retention is required by law (e.g., financial records retained for 7 years per Indian tax regulations).` },
  { icon:'✅', title:'Your Rights',               body:`Under applicable Indian data protection law, you have the right to:\n• Access the personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion of your account and data\n• Withdraw consent for optional data uses\n• Lodge a complaint with the relevant authority\n\nTo exercise these rights, contact privacy@carebridge.in.` },
  { icon:'🍪', title:'Cookies & Tracking',        body:`The CareBridge app uses analytics tools to understand usage patterns and improve the user experience. We do not use third-party advertising trackers. You can opt out of analytics in Settings → App Preferences.` },
]

export default function PrivacyPage() {
  const router = useRouter()
  return (
    <MobileFrame>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>

        <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', background:'#fff', flexShrink:0 }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
        </div>

        <div style={{ height:'56px', background:'#fff', display:'flex', alignItems:'center', padding:'0 16px', gap:'10px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <button onClick={() => router.back()} style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Privacy Policy</span>
          <div style={{ width:'38px' }} />
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'20px 20px 32px' }}>
          <div style={{ background:'linear-gradient(135deg,#1e3a5f,#2563EB)', borderRadius:'18px', padding:'20px', marginBottom:'20px', textAlign:'center' }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>🔒</div>
            <div style={{ fontSize:'18px', fontWeight:900, color:'#fff', letterSpacing:'-0.3px' }}>Privacy Policy</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', marginTop:'6px' }}>Last updated: April 1, 2026</div>
          </div>
          <p style={{ fontSize:'14px', color:'#64748B', lineHeight:1.65, marginBottom:'20px' }}>
            CareBridge Technologies ("we", "our", "us") is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.
          </p>
          {SECTIONS.map((s,i) => (
            <div key={i} style={{ marginBottom:'20px', background:'#fff', borderRadius:'16px', padding:'16px', border:'1px solid #E2E8F0' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>{s.icon}</div>
                <div style={{ fontSize:'15px', fontWeight:800, color:'#0F172A', letterSpacing:'-0.2px' }}>{s.title}</div>
              </div>
              <div style={{ fontSize:'13px', color:'#475569', lineHeight:1.7, whiteSpace:'pre-line' }}>{s.body}</div>
            </div>
          ))}
          <div style={{ background:'#EFF6FF', borderRadius:'16px', padding:'16px', border:'1px solid #BFDBFE' }}>
            <div style={{ fontSize:'14px', fontWeight:700, color:'#0F172A', marginBottom:'4px' }}>Privacy Concerns?</div>
            <div style={{ fontSize:'13px', color:'#64748B', lineHeight:1.55 }}>
              Email our Data Protection Officer at <span style={{ color:'#2563EB', fontWeight:700 }}>privacy@carebridge.in</span> — we respond within 72 hours.
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  )
}