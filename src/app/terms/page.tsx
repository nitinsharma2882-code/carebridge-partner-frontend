'use client'
import { useRouter } from 'next/navigation'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using the CareBridge Assistant app ("App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.`,
  },
  {
    title: '2. Eligibility',
    body: `You must be at least 18 years of age and hold a valid healthcare or caregiving qualification recognised in India to register as an Assistant on CareBridge. CareBridge reserves the right to verify your credentials at any time.`,
  },
  {
    title: '3. Your Responsibilities',
    body: `As a CareBridge Assistant, you agree to:\n• Provide honest and accurate profile information.\n• Maintain a professional standard of care for all customers.\n• Arrive on time and complete booked sessions as agreed.\n• Not engage in any fraudulent, abusive, or illegal activity.\n• Keep your login credentials confidential.`,
  },
  {
    title: '4. Earnings & Payments',
    body: `CareBridge facilitates payments between Assistants and customers. Earnings are credited to your registered bank account after successful session completion, subject to a platform service fee. Withdrawal timelines may vary between 1–3 business days depending on your bank.`,
  },
  {
    title: '5. Account Suspension',
    body: `CareBridge may suspend or terminate your account if you violate these terms, receive repeated low ratings, fail document verification, or engage in conduct deemed harmful to customers or the platform.`,
  },
  {
    title: '6. Limitation of Liability',
    body: `CareBridge acts as a technology platform and is not liable for any direct, indirect, or incidental damages arising from your use of the App, including but not limited to loss of earnings, data, or service interruptions.`,
  },
  {
    title: '7. Governing Law',
    body: `These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts located in New Delhi, India.`,
  },
  {
    title: '8. Changes to Terms',
    body: `We reserve the right to update these Terms at any time. Continued use of the App after changes constitutes your acceptance of the revised Terms. We will notify you of significant changes via the App.`,
  },
]

export default function TermsPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Mobile Frame */}
      <div style={{ width: '390px', height: '844px', borderRadius: '48px', overflow: 'hidden', position: 'relative', flexShrink: 0, boxShadow: '0 0 0 10px #1e293b, 0 0 0 12px #334155, 0 40px 80px rgba(0,0,0,0.8)', background: '#F8FAFC' }}>
        {/* Notch */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '126px', height: '34px', background: '#111827', borderRadius: '0 0 20px 20px', zIndex: 50 }} />

        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Status bar */}
          <div style={{ height: '50px', padding: '14px 20px 0', display: 'flex', alignItems: 'center', background: '#fff', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>9:41</span>
          </div>

          {/* Header */}
          <div style={{ height: '56px', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '10px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
            <button onClick={() => router.back()} style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#F1F5F9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Terms of Service</span>
            <div style={{ width: '38px' }} />
          </div>

          {/* Scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 32px' }}>
            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg,#065f52,#0D9488)', borderRadius: '18px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>Terms of Service</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '6px' }}>Last updated: April 1, 2026</div>
            </div>

            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.65, marginBottom: '20px' }}>
              Please read these Terms of Service carefully before using the CareBridge Assistant Partner App. These terms govern your use of our platform and services.
            </p>

            {SECTIONS.map((s, i) => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.2px' }}>{s.title}</div>
                <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{s.body}</div>
              </div>
            ))}

            {/* Contact */}
            <div style={{ background: '#EDFAF7', borderRadius: '16px', padding: '16px', border: '1px solid #CCFBF1', marginTop: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Questions?</div>
              <div style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.55 }}>
                Contact us at{' '}
                <span style={{ color: '#0D9488', fontWeight: 700 }}>legal@carebridge.in</span>
                {' '}or write to CareBridge Technologies, New Delhi – 110001, India.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}