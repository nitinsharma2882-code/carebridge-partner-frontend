'use client'

interface AdDetailProps {
  ad: { title: string; badge: string; sub: string } | null
  onBack: () => void
  onConfirm: () => void
}

const AD_DETAILS: Record<string, {
  hospital: string; location: string; timing: string; phone: string
  about: string; services: string[]; offer: string; grad: string
  ctaColor: string; cta: string
}> = {
  'AIIMS Delhi': {
    hospital:'AIIMS Delhi', location:'Sri Aurobindo Marg, New Delhi — 110029',
    timing:'Mon–Sat · 9:00 AM – 5:00 PM', phone:'+91 11 2658 8500',
    about:'All India Institute of Medical Sciences (AIIMS) Delhi is a premier public medical institution and hospital. Known for world-class treatment across all specialties.',
    services:['OPD Appointments','Emergency Care','Diagnostics','Surgery','Pharmacy'],
    offer:'Book OPD appointments online — skip the queue.',
    grad:'linear-gradient(135deg,#1d4ed8,#3B82F6)', ctaColor:'#1d4ed8', cta:'Book Appointment',
  },
  '24/7 Ambulance': {
    hospital:'CareBridge Emergency', location:'Serving Delhi NCR · Pan-India coverage',
    timing:'24/7 · 365 days', phone:'+91 98100 00911',
    about:'CareBridge 24/7 Ambulance Service provides instant dispatch with GPS tracking across Delhi NCR. Our trained paramedics ensure safe and timely patient transport.',
    services:['Advanced Life Support','Basic Life Support','Patient Transport','Home to Hospital','Hospital to Hospital'],
    offer:'Call now for instant dispatch — average response time 8 minutes.',
    grad:'linear-gradient(135deg,#991B1B,#DC2626)', ctaColor:'#DC2626', cta:'Call Now',
  },
  'Fortis Healthcare': {
    hospital:'Fortis Healthcare', location:'Sector 62, Noida — 201301',
    timing:'Mon–Sun · 8:00 AM – 8:00 PM', phone:'+91 120 496 0000',
    about:'Fortis Healthcare is one of India\'s leading integrated healthcare delivery service providers. State-of-the-art facilities with expert specialists across all departments.',
    services:['General Medicine','Cardiology','Orthopedics','Oncology','Neurology'],
    offer:'Free health check-up offer — valid till 31 March 2026.',
    grad:'linear-gradient(135deg,#134E4A,#0D9488)', ctaColor:'#0F766E', cta:'Book Free Check',
  },
  'Apollo Hospitals': {
    hospital:'Apollo Hospitals', location:'Mathura Road, New Delhi — 110076',
    timing:'Mon–Sun · 24/7 Emergency', phone:'+91 11 7179 1090',
    about:'Apollo Hospitals is Asia\'s foremost integrated healthcare services provider. Expert cardiologists, surgeons, and specialists available round the clock.',
    services:['Cardiac Care','Robotic Surgery','Cancer Care','Transplant','Critical Care'],
    offer:'Consult top cardiologists — appointments available this week.',
    grad:'linear-gradient(135deg,#4C1D95,#7C3AED)', ctaColor:'#7C3AED', cta:'Consult Now',
  },
}

export function AdDetailScreen({ ad, onBack, onConfirm }: AdDetailProps) {
  if (!ad) { onBack(); return null }
  const key = Object.keys(AD_DETAILS).find(k => ad.title.includes(k)) ?? ''
  const d = AD_DETAILS[key] ?? {
    hospital:ad.title.replace('\n',' '), location:'India',
    timing:'Mon–Sat · 9 AM – 6 PM', phone:'+91 98100 00000',
    about:ad.sub, services:['General Services'], offer:ad.sub,
    grad:'linear-gradient(135deg,#0F172A,#134E4A)', ctaColor:'#0D9488', cta:'Contact Now',
  }

  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', background:'#F8FAFC' }}>

      {/* Hero */}
      <div style={{ flexShrink:0, position:'relative', overflow:'hidden', background:d.grad, padding:'52px 20px 28px' }}>
        <div style={{ position:'absolute', bottom:'-40px', right:'-40px', width:'140px', height:'140px', borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
        <button onClick={onBack} style={{ width:'38px', height:'38px', borderRadius:'12px', background:'rgba(255,255,255,0.15)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', marginBottom:'16px' }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{ display:'inline-block', color:'#fff', fontSize:'9px', fontWeight:700, padding:'4px 10px', borderRadius:'100px', marginBottom:'12px', letterSpacing:'0.8px', background:'rgba(255,255,255,0.2)' }}>{ad.badge}</div>
        <div style={{ color:'#fff', fontSize:'20px', fontWeight:600, lineHeight:1.3, marginBottom:'4px', whiteSpace:'pre-line' }}>{ad.title}</div>
        <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px' }}>{d.location}</div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>

        {/* Offer banner */}
        <div style={{ borderRadius:'14px', padding:'12px 16px', marginBottom:'16px', display:'flex', alignItems:'flex-start', gap:'12px', background:'#F0FDFA', border:'1px solid #0D9488' }}>
          <span style={{ fontSize:'18px', flexShrink:0 }}>🎁</span>
          <div>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#0D9488', marginBottom:'2px' }}>Special Offer</div>
            <div style={{ fontSize:'11px', color:'#0F766E', lineHeight:1.6 }}>{d.offer}</div>
          </div>
        </div>

        {/* Info card */}
        <div style={{ background:'#fff', borderRadius:'18px', border:'1px solid #E2E8F0', padding:'16px', marginBottom:'12px' }}>
          <div style={{ fontSize:'10px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px' }}>Hospital Info</div>
          {[['🏥','Name',d.hospital],['📍','Address',d.location],['🕐','Timing',d.timing],['📞','Phone',d.phone]].map(([icon,label,value]) => (
            <div key={label} style={{ display:'flex', alignItems:'flex-start', gap:'12px', padding:'10px 0', borderBottom:'1px solid #E2E8F0' }}>
              <span style={{ fontSize:'16px', flexShrink:0 }}>{icon}</span>
              <div>
                <div style={{ fontSize:'10px', color:'#94A3B8' }}>{label}</div>
                <div style={{ fontSize:'12px', fontWeight:600, color:'#0F172A', marginTop:'2px' }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* About */}
        <div style={{ background:'#fff', borderRadius:'18px', border:'1px solid #E2E8F0', padding:'16px', marginBottom:'12px' }}>
          <div style={{ fontSize:'10px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>About</div>
          <p style={{ fontSize:'12px', color:'#475569', lineHeight:1.7, margin:0 }}>{d.about}</p>
        </div>

        {/* Services */}
        <div style={{ background:'#fff', borderRadius:'18px', border:'1px solid #E2E8F0', padding:'16px', marginBottom:'16px' }}>
          <div style={{ fontSize:'10px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px' }}>Services Available</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {d.services.map(s => (
              <div key={s} style={{ fontSize:'10px', fontWeight:600, padding:'6px 12px', borderRadius:'100px', background:'#F0FDFA', color:'#0D9488', border:'1px solid #CCFBF1' }}>{s}</div>
            ))}
          </div>
        </div>

        {/* Book with CareBridge */}
        <div style={{ borderRadius:'14px', padding:'12px 16px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'12px', background:'#EFF6FF', border:'1px solid #93C5FD' }}>
          <span style={{ fontSize:'18px', flexShrink:0 }}>🤝</span>
          <div>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#1E40AF', marginBottom:'2px' }}>Need assistance?</div>
            <div style={{ fontSize:'10px', color:'#2563EB', lineHeight:1.6 }}>Book a CareBridge assistant to help you navigate this hospital.</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:'0 16px 20px', flexShrink:0, display:'flex', flexDirection:'column', gap:'10px' }}>
        <button onClick={onConfirm}
          style={{ width:'100%', padding:'16px', borderRadius:'14px', fontWeight:700, color:'#fff', fontSize:'14px', border:'none', cursor:'pointer', background:d.ctaColor, fontFamily:'DM Sans, sans-serif' }}>
          {d.cta} →
        </button>
        <button onClick={onBack}
          style={{ width:'100%', padding:'16px', borderRadius:'14px', fontWeight:700, fontSize:'14px', border:'1.5px solid #E2E8F0', background:'#fff', color:'#0F172A', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
          Back
        </button>
      </div>
    </div>
  )
}