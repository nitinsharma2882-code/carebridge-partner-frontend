'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import BottomNav from '@/components/BottomNav'
import MobileFrame from '@/components/MobileFrame'
import { SponsoredSection } from '@/components/SponsoredSection'
import { ComingSoonSection } from '@/components/ComingSoonSection'
import { AdDetailScreen } from '@/components/AdDetailScreen'

function PopupLayer() {
  const { popup, closePopup } = useStore()
  if (!popup) return null
  const iconBg: Record<string,string> = { success:'#DCFCE7', warning:'#FEF3C7', error:'#FEE2E2', confirm:'#EDE9FE', info:'#EDFAF7' }
  const iconDef: Record<string,string> = { success:'✅', warning:'⚠️', error:'❌', confirm:'❓', info:'ℹ️' }
  const btnBg:   Record<string,string> = { primary:'#0D9488', secondary:'#F1F5F9', danger:'#DC2626', warning:'#D97706' }
  const btnClr:  Record<string,string> = { primary:'#fff', secondary:'#475569', danger:'#fff', warning:'#fff' }
  return (
    <div onClick={e => { if (e.target===e.currentTarget) closePopup() }}
      style={{ position:'absolute', inset:0, zIndex:100, background:'rgba(15,23,42,0.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'22px', width:'100%', overflow:'hidden' }}>
        <div style={{ padding:'28px 20px 0', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:'68px', height:'68px', borderRadius:'50%', background:iconBg[popup.type], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', marginBottom:'12px' }}>
            {popup.icon || iconDef[popup.type]}
          </div>
          <h2 style={{ fontSize:'18px', fontWeight:800, color:'#0F172A', textAlign:'center', margin:0 }}>{popup.title}</h2>
        </div>
        <p style={{ fontSize:'14px', color:'#64748B', textAlign:'center', padding:'8px 22px 18px', lineHeight:1.65 }}
          dangerouslySetInnerHTML={{ __html: popup.body.replace(/\n/g,'<br/>') }} />
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

function QuickCard({ emoji, bg, label, sub, onClick }: { emoji:string; bg:string; label:string; sub:string; onClick:()=>void }) {
  return (
    <div onClick={onClick} style={{ flex:1, background:'#fff', border:'1px solid #E2E8F0', borderRadius:'16px', padding:'14px', cursor:'pointer', display:'flex', flexDirection:'column', gap:'8px' }}>
      <div style={{ width:'36px', height:'36px', borderRadius:'11px', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>{emoji}</div>
      <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A' }}>{label}</div>
      <div style={{ fontSize:'11px', color:'#94A3B8', marginTop:'-4px' }}>{sub}</div>
    </div>
  )
}

const BULLETIN_ITEMS = [
  '🚑 Ambulance: 108', '🚓 Police: 100', '🔥 Fire: 101',
  '🏥 Medical Helpline: 104', '👩 Women Helpline: 1091',
  '🧒 Child Helpline: 1098', '⚡ Disaster: 1070',
]

const TESTIMONIALS = [
  { name:'Rajan K',  stars:5, quote:'CareBridge helped me earn ₹18,000 last month working just 5 hours a day!', initials:'RK', bg:'#EDFAF7', color:'#0D9488' },
  { name:'Sunita M', stars:5, quote:'The app is very easy to use and bookings come regularly in my area.',        initials:'SM', bg:'#EFF6FF', color:'#2563EB' },
  { name:'Amit S',   stars:4, quote:'Great platform for healthcare workers. Payments are always on time.',        initials:'AS', bg:'#FFF7ED', color:'#D97706' },
]

export default function HomePage() {
  const [isOnline,          setIsOnline]          = useState(false)
  const [onlineTime,        setOnlineTime]        = useState('Go online to earn')
  const [userName,          setUserName]          = useState('there')
  const [upcomingCount,     setUpcomingCount]     = useState(0)
  const [adScreen,          setAdScreen]          = useState(false)
  const [adData,            setAdData]            = useState<{ title:string; badge:string; sub:string } | null>(null)
  const [comingSoonScreen,  setComingSoonScreen]  = useState(false)

  const router = useRouter()
  const { showPopup, closePopup } = useStore()

  useEffect(() => {
    // Restore online state
    try {
      const savedOnline = localStorage.getItem('carebridge_partner_online')
      if (savedOnline === 'true') { setIsOnline(true); setOnlineTime('Online') }
    } catch {}

    // Username
    try {
      const saved = localStorage.getItem('carebridge_user')
      if (saved) { const u = JSON.parse(saved); if (u.name) setUserName(u.name) }
    } catch {}
    fetch('/api/users/me').then(r=>r.json()).then(data => {
      if (data.success && data.user?.name) {
        setUserName(data.user.name)
        localStorage.setItem('carebridge_user', JSON.stringify(data.user))
      }
    }).catch(()=>{})

    // Booking count
    fetch('/api/bookings').then(r=>r.json()).then(data => {
      if (data.success && data.bookings) {
        const count = data.bookings.filter((b:any) => b.status==='upcoming' || b.status==='active').length
        setUpcomingCount(count)
      }
    }).catch(()=>{})

    // Location permission
    if (navigator?.permissions) {
      navigator.permissions.query({ name:'geolocation' }).then(result => {
        if (result.state === 'denied') {
          showPopup({
            type:'warning', title:'Location Disabled', icon:'📍',
            body:'Please enable location access from App Preferences to receive nearby booking requests.',
            actions:[
              { label:'Open Settings', variant:'primary',   fn:() => { closePopup(); router.push('/settings') } },
              { label:'Dismiss',       variant:'secondary', fn:closePopup },
            ],
          })
        }
      }).catch(()=>{})
    }
  }, [])

  const toggleOnline = () => {
    const next = !isOnline
    setIsOnline(next)
    setOnlineTime(next ? 'Online' : 'Go online to earn')
    localStorage.setItem('carebridge_partner_online', String(next))
    showPopup({
      type: next ? 'success' : 'info',
      title: next ? 'You are Online 🟢' : 'You are Offline ⚫',
      body: next ? 'You are now visible to customers.\nRequests will appear here.' : "You won't receive any requests while offline.",
      icon: next ? '🟢' : '⚫',
      actions: [{ label:'OK', variant:'primary', fn:closePopup }],
    })
  }

  const handleAdClick = (ad: { title:string; badge:string; sub:string }) => {
    setAdData(ad)
    setAdScreen(true)
  }

  const handleAdConfirm = () => {
    setAdScreen(false)
    showPopup({
      type:'success', title:'Request Sent! ✅', icon:'✅',
      body:`We have received your request for ${adData?.title.replace('\n',' ')}.\nOur team will contact you shortly.`,
      actions:[{ label:'OK', variant:'primary', fn:closePopup }],
    })
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <MobileFrame>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>

        {/* Status bar */}
        <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
          <span style={{ fontSize:'11px', fontWeight:700, color:'#0F172A' }}>5G</span>
        </div>

        {/* Header */}
        <div style={{ background:'#fff', padding:'10px 16px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:'11px', color:'#94A3B8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px' }}>{greeting} 👋</div>
            <div style={{ fontSize:'19px', fontWeight:900, color:'#0F172A', letterSpacing:'-0.4px', marginTop:'2px' }}>{userName}</div>
            {upcomingCount > 0 && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:'5px', marginTop:'5px', background:'#EDFAF7', borderRadius:'20px', padding:'3px 10px' }}>
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#0D9488' }} />
                <span style={{ fontSize:'11px', fontWeight:700, color:'#0D9488' }}>{upcomingCount} Active Booking{upcomingCount > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          <button onClick={() => router.push('/notifications')}
            style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <div style={{ position:'absolute', top:'7px', right:'7px', width:'9px', height:'9px', background:'#DC2626', borderRadius:'50%', border:'2px solid #fff' }} />
          </button>
        </div>

        {/* Bulletin marquee */}
        <div style={{ background:'#0F172A', padding:'7px 0', flexShrink:0, overflow:'hidden' }}>
          <div style={{ display:'flex', animation:'marquee 22s linear infinite', whiteSpace:'nowrap' }}>
            {[...BULLETIN_ITEMS, ...BULLETIN_ITEMS].map((item, i) => (
              <span key={i} style={{ fontSize:'11px', fontWeight:600, color:'#94A3B8', paddingRight:'32px', flexShrink:0 }}>{item}</span>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex:1, overflowY:'auto', paddingBottom:'90px' }}>

          {/* SOS Banner */}
          <div onClick={() => router.push('/sos')} style={{ margin:'12px 14px 0', borderRadius:'16px', background:'linear-gradient(135deg,#FEF2F2,#FEE2E2)', border:'1.5px solid #FECACA', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', animation:'sosPulse 2s infinite' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'42px', height:'42px', borderRadius:'13px', background:'#DC2626', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 12px rgba(220,38,38,0.35)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015.11 12.7 19.79 19.79 0 012.12 4.1 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize:'14px', fontWeight:800, color:'#991B1B' }}>SOS Emergency Available</div>
                <div style={{ fontSize:'12px', color:'#DC2626', marginTop:'2px', opacity:0.85 }}>Tap for instant support · Response in 10 seconds</div>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          {/* Quick Actions — 2 cards only */}
          <div style={{ padding:'12px 14px 0' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'10px' }}>Quick Actions</div>
            <div style={{ display:'flex', gap:'10px' }}>
              <QuickCard emoji="📋" bg="#EDFAF7" label="Active Bookings" sub="View requests"  onClick={() => router.push('/bookings')} />
              <QuickCard emoji="💰" bg="#FEF3C7" label="Today's Earnings" sub="Check payouts" onClick={() => router.push('/earnings')} />
            </div>
          </div>

          {/* Online Toggle */}
          <div style={{ background:'#fff', padding:'12px 14px 10px', borderTop:'1px solid #E2E8F0', borderBottom:'1px solid #E2E8F0', marginTop:'12px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
              <span style={{ fontSize:'11px', fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px' }}>Your Status</span>
              <span style={{ fontSize:'12px', color:'#94A3B8' }}>{onlineTime}</span>
            </div>
            <div onClick={toggleOnline} style={{ width:'100%', height:'52px', borderRadius:'100px', background:isOnline?'#EDFAF7':'#F1F5F9', border:`1.5px solid ${isOnline?'#CCFBF1':'#E2E8F0'}`, display:'flex', padding:'4px', cursor:'pointer', position:'relative', transition:'all 0.3s ease' }}>
              <div style={{ position:'absolute', top:'4px', bottom:'4px', width:'calc(50% - 4px)', borderRadius:'100px', background:isOnline?'#0D9488':'#fff', boxShadow:isOnline?'0 2px 14px rgba(13,148,136,0.4)':'0 2px 8px rgba(0,0,0,0.12)', left:isOnline?'4px':'calc(50%)', transition:'all 0.3s cubic-bezier(0.34,1.3,0.64,1)' }} />
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, zIndex:1, color:isOnline?'#fff':'#94A3B8' }}>Online</div>
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, zIndex:1, color:isOnline?'#94A3B8':'#475569' }}>Offline</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'9px' }}>
              <div style={{ width:'9px', height:'9px', borderRadius:'50%', background:isOnline?'#16A34A':'#CBD5E1', animation:isOnline?'livePulse 1.5s ease-in-out infinite':'none' }} />
              <span style={{ fontSize:'13px', color:'#64748B' }}>{isOnline?'Looking for requests nearby…':'Toggle to start accepting bookings'}</span>
            </div>
          </div>

          {/* New Request — only when online, between toggle and map */}
          {isOnline && (
            <div onClick={() => router.push('/bookings')}
              style={{ margin:'10px 14px 0', borderRadius:'18px', background:'#fff', border:'2px solid #0D9488', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', animation:'fadeIn 0.4s ease' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'42px', height:'42px', borderRadius:'13px', background:'#EDFAF7', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'#0F172A' }}>New Request Nearby!</div>
                  <div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>2.4 km · Elder Care · ₹320</div>
                </div>
              </div>
              <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#0D9488', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          )}

          {/* Nearby Requests map */}
          <div style={{ margin:'12px 14px', borderRadius:'18px', overflow:'hidden', background:'#fff', border:'1px solid #E2E8F0' }}>
            <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:'14px', fontWeight:800, color:'#0F172A' }}>Nearby Requests</span>
              <span style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', fontWeight:700, color:'#16A34A' }}>
                <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#16A34A', animation:'livePulse 1.5s infinite' }} />Live
              </span>
            </div>
            <svg width="100%" height="155" viewBox="0 0 362 155">
              <rect width="362" height="155" fill="#ccede8"/>
              <rect y="62" width="362" height="10" fill="#fff" opacity="0.55"/>
              <rect y="108" width="362" height="10" fill="#fff" opacity="0.55"/>
              <rect x="64" y="0" width="10" height="155" fill="#fff" opacity="0.55"/>
              <rect x="168" y="0" width="10" height="155" fill="#fff" opacity="0.55"/>
              <rect x="272" y="0" width="10" height="155" fill="#fff" opacity="0.55"/>
              <circle cx="118" cy="52" r="10" fill="#DC2626" fillOpacity="0.2"/><circle cx="118" cy="52" r="6" fill="#DC2626"/>
              <circle cx="252" cy="38" r="10" fill="#D97706" fillOpacity="0.2"/><circle cx="252" cy="38" r="6" fill="#D97706"/>
              <circle cx="180" cy="116" r="16" fill="#0D9488" fillOpacity="0.15"/><circle cx="180" cy="116" r="10" fill="#0D9488"/><circle cx="180" cy="116" r="5" fill="#fff"/>
              <text x="180" y="140" textAnchor="middle" fontSize="9" fill="#0D9488" fontFamily="DM Sans" fontWeight="700">You</text>
            </svg>
          </div>

          <div style={{ height:'12px' }} />

          {/* Earnings Card */}
          <div style={{ margin:'0 14px', borderRadius:'22px', padding:'20px', background:'linear-gradient(135deg,#065f52,#0D9488,#14b8a6)', color:'#fff', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'150px', height:'150px', borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
            <div style={{ fontSize:'11px', fontWeight:700, opacity:0.75, letterSpacing:'0.8px', textTransform:'uppercase' }}>Today's Earnings</div>
            <div style={{ fontSize:'38px', fontWeight:900, letterSpacing:'-2px', margin:'4px 0' }}>₹ 1,240</div>
            <div style={{ fontSize:'12px', opacity:0.75, marginBottom:'16px' }}>↑ 18% more than yesterday</div>
            <div style={{ display:'flex', gap:'8px' }}>
              {[{v:'5',l:'Trips'},{v:'4.9★',l:'Rating'},{v:'6h 20m',l:'Online'}].map(s => (
                <div key={s.l} style={{ flex:1, background:'rgba(255,255,255,0.15)', borderRadius:'12px', padding:'10px 12px' }}>
                  <div style={{ fontSize:'17px', fontWeight:800 }}>{s.v}</div>
                  <div style={{ fontSize:'10px', opacity:0.7, fontWeight:600, marginTop:'2px' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsored & Promoted — Consumer App style */}
          <SponsoredSection onAdClick={handleAdClick} />

          {/* Coming Soon — Consumer App style */}
          <ComingSoonSection onItemClick={() => setComingSoonScreen(true)} />

          {/* Testimonials */}
          <div style={{ padding:'16px 0 0' }}>
            <div style={{ padding:'0 14px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:'11px', fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px' }}>What Partners Say</span>
              <span style={{ fontSize:'11px', fontWeight:600, color:'#0D9488' }}>⭐ Verified reviews</span>
            </div>
            <div style={{ display:'flex', gap:'10px', overflowX:'auto', padding:'0 14px 4px', scrollbarWidth:'none' }}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} style={{ minWidth:'220px', background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0', flexShrink:0 }}>
                  <div style={{ display:'flex', gap:'2px', marginBottom:'10px' }}>
                    {Array.from({ length:5 }).map((_,s) => (
                      <span key={s} style={{ fontSize:'13px', color: s < t.stars ? '#F59E0B' : '#E2E8F0' }}>★</span>
                    ))}
                  </div>
                  <div style={{ fontSize:'12px', color:'#475569', lineHeight:1.65, marginBottom:'12px' }}>"{t.quote}"</div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:800, color:t.color, flexShrink:0 }}>{t.initials}</div>
                    <div style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>{t.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height:'16px' }} />
        </div>
      </div>

      {/* Ad Detail full screen overlay */}
      {adScreen && (
        <div style={{ position:'absolute', inset:0, zIndex:200 }}>
          <AdDetailScreen
            ad={adData}
            onBack={() => setAdScreen(false)}
            onConfirm={handleAdConfirm}
          />
        </div>
      )}

      {/* Coming Soon full screen overlay */}
      {comingSoonScreen && (
        <div style={{ position:'absolute', inset:0, zIndex:200, display:'flex', flexDirection:'column', background:'#F8FAFC' }}>
          <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:'12px', background:'#fff', borderBottom:'1px solid #E2E8F0', padding:'52px 16px 14px' }}>
            <button onClick={() => setComingSoonScreen(false)} style={{ width:'38px', height:'38px', borderRadius:'12px', background:'#F8FAFC', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth={2.5}><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <h3 style={{ fontSize:'15px', fontWeight:700, color:'#0F172A', margin:0 }}>Coming Soon</h3>
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', textAlign:'center' }}>
            <div style={{ width:'80px', height:'80px', borderRadius:'24px', background:'linear-gradient(135deg,#0F172A,#134E4A)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'24px' }}>
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#5EEAD4" strokeWidth={1.5}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h2 style={{ fontSize:'20px', fontWeight:800, color:'#0F172A', margin:'0 0 8px' }}>Coming Soon!</h2>
            <p style={{ fontSize:'13px', color:'#94A3B8', lineHeight:1.7, marginBottom:'24px' }}>
              We are working hard to bring this feature to you. Stay tuned for updates!
            </p>
            <div style={{ width:'100%', borderRadius:'18px', padding:'16px', marginBottom:'24px', background:'#F0FDFA', border:'1px solid #0D9488' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#0D9488', marginBottom:'4px' }}>Be the first to know</div>
              <div style={{ fontSize:'12px', color:'#0F766E' }}>We'll notify you as soon as this feature launches.</div>
            </div>
            <button onClick={() => setComingSoonScreen(false)}
              style={{ width:'100%', padding:'16px', borderRadius:'14px', fontWeight:700, color:'#fff', fontSize:'14px', border:'none', cursor:'pointer', background:'#0D9488', fontFamily:'DM Sans, sans-serif' }}>
              Back to Home
            </button>
          </div>
        </div>
      )}

      <BottomNav active="Home" />
      <PopupLayer />
      <style>{`
        @keyframes sosPulse  { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.5);}60%{box-shadow:0 0 0 10px rgba(220,38,38,0);} }
        @keyframes livePulse { 0%,100%{box-shadow:0 0 0 0 rgba(22,163,74,0.5);}60%{box-shadow:0 0 0 7px rgba(22,163,74,0);} }
        @keyframes fadeIn    { from{opacity:0;transform:scale(0.95);}to{opacity:1;transform:scale(1);} }
        @keyframes marquee   { 0%{transform:translateX(0);}100%{transform:translateX(-50%);} }
      `}</style>
    </MobileFrame>
  )
}