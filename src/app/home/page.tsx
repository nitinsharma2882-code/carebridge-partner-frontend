'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { BookingAPI, AssistantAPI } from '@/lib/api'
import BottomNav from '@/components/BottomNav'
import MobileFrame from '@/components/MobileFrame'
import { SponsoredSection } from '@/components/SponsoredSection'
import { ComingSoonSection } from '@/components/ComingSoonSection'
import { AdDetailScreen } from '@/components/AdDetailScreen'

// ── Popup layer ───────────────────────────────────────────────
function PopupLayer() {
  const { popup, closePopup } = useStore()
  if (!popup) return null
  const iconBg: Record<string,string> = { success:'#DCFCE7', warning:'#FEF3C7', error:'#FEE2E2', confirm:'#EDE9FE', info:'#EDFAF7' }
  const btnBg:  Record<string,string> = { primary:'#0D9488', secondary:'#F1F5F9', danger:'#DC2626', warning:'#D97706' }
  const btnClr: Record<string,string> = { primary:'#fff', secondary:'#475569', danger:'#fff', warning:'#fff' }
  return (
    <div onClick={e => { if (e.target===e.currentTarget) closePopup() }}
      style={{ position:'absolute', inset:0, zIndex:100, background:'rgba(15,23,42,0.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'22px', width:'100%', overflow:'hidden' }}>
        <div style={{ padding:'28px 20px 0', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:'68px', height:'68px', borderRadius:'50%', background:iconBg[popup.type], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', marginBottom:'12px' }}>
            {popup.icon || ''}
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

// ── Quick card ────────────────────────────────────────────────
function QuickCard({ emoji, bg, label, sub, onClick }: { emoji:string; bg:string; label:string; sub:string; onClick:()=>void }) {
  return (
    <div onClick={onClick} style={{ flex:1, background:'#fff', border:'1px solid #E2E8F0', borderRadius:'16px', padding:'14px', cursor:'pointer', display:'flex', flexDirection:'column', gap:'8px' }}>
      <div style={{ width:'36px', height:'36px', borderRadius:'11px', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>{emoji}</div>
      <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A' }}>{label}</div>
      <div style={{ fontSize:'11px', color:'#94A3B8', marginTop:'-4px' }}>{sub}</div>
    </div>
  )
}

const TESTIMONIALS = [
  { name:'Rajan K',  stars:5, quote:'CareBridge helped me earn Rs.18,000 last month working just 5 hours a day!', initials:'RK', bg:'#EDFAF7', color:'#0D9488' },
  { name:'Sunita M', stars:5, quote:'The app is very easy to use and bookings come regularly in my area.',         initials:'SM', bg:'#EFF6FF', color:'#2563EB' },
  { name:'Amit S',   stars:4, quote:'Great platform for healthcare workers. Payments are always on time.',         initials:'AS', bg:'#FFF7ED', color:'#D97706' },
]

const SCROLL_KEY = 'home_scroll_pos'

const SERVICE_LABELS: Record<string, string> = {
  opd_assistant: 'OPD Assistant',
  ambulance:     'Ambulance',
  nursing:       'Nursing Care',
  general:       'General Help',
}

// ── Main page ─────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const { isOnline, setOnline, showPopup, closePopup, profile } = useStore()

  const [userName,        setUserName]        = useState('there')
  const [earnings,        setEarnings]        = useState({ daily: 0, totalTrips: 0 })
  const [adScreen,        setAdScreen]        = useState(false)
  const [adData,          setAdData]          = useState<{ title:string; badge:string; sub:string }|null>(null)
  const [incomingRequest, setIncomingRequest] = useState<Record<string,unknown>|null>(null)
  const [activeBooking,   setActiveBooking]   = useState<Record<string,unknown>|null>(null)
  const [accepting,       setAccepting]       = useState(false)

  const scrollRef  = useRef<HTMLDivElement>(null)
  const pollRef    = useRef<ReturnType<typeof setInterval>|null>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout>|null>(null)

  // Restore scroll position
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY)
    if (saved && scrollRef.current) scrollRef.current.scrollTop = parseInt(saved, 10)
  }, [])

  const handleScroll = () => {
    if (scrollRef.current) sessionStorage.setItem(SCROLL_KEY, String(scrollRef.current.scrollTop))
  }

  // Load user name and earnings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('carebridge_user')
      if (saved) { const u = JSON.parse(saved); if (u.name) setUserName(u.name) }
    } catch {}

    // Fetch profile from backend
    AssistantAPI.getProfile().then(res => {
      if (res.data?.success && res.data.user?.name) {
        setUserName(res.data.user.name)
        localStorage.setItem('carebridge_user', JSON.stringify(res.data.user))
      }
    }).catch(() => {})

    // Fetch earnings
    AssistantAPI.getEarnings().then(res => {
      if (res.data?.success) {
        setEarnings({
          daily:      res.data.daily      || 0,
          totalTrips: res.data.totalTrips || 0,
        })
      }
    }).catch(() => {})
  }, [])

  // Poll for incoming requests when online
  useEffect(() => {
    if (!isOnline) {
      setIncomingRequest(null)
      if (pollRef.current)  clearInterval(pollRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    const poll = async () => {
      try {
        const res = await BookingAPI.getRequests()
        if (res.data?.success && res.data.requests?.length > 0) {
          const first = res.data.requests[0]
          // Only show if it's a new request
          if (!incomingRequest || (incomingRequest as any)._id !== first._id) {
            setIncomingRequest(first)
            // Auto-reject after 30 seconds
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => {
              setIncomingRequest(null)
            }, 30000)
          }
        } else {
          setIncomingRequest(null)
        }
      } catch {
        setIncomingRequest(null)
      }
    }

    poll()
    pollRef.current = setInterval(poll, 15000)

    return () => {
      if (pollRef.current)  clearInterval(pollRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isOnline])

  // ── Accept booking ──────────────────────────────────────────
  const handleAccept = async () => {
    if (!incomingRequest) return
    setAccepting(true)
    try {
      const res = await BookingAPI.accept((incomingRequest as any)._id)
      if (res.data?.success) {
        if (timerRef.current) clearTimeout(timerRef.current)
        setActiveBooking(res.data.booking)
        setIncomingRequest(null)
        showPopup({
          type:'success', title:'Booking Accepted!', icon:'',
          body:'Head to the customer location. Use the Complete button when done.',
          actions:[{ label:'OK', variant:'primary', fn:closePopup }],
        })
      }
    } catch {
      showPopup({ type:'error', title:'Could not accept', icon:'', body:'Please try again.', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
    } finally {
      setAccepting(false)
    }
  }

  // ── Reject booking ──────────────────────────────────────────
  const handleReject = async () => {
    if (!incomingRequest) return
    try {
      await BookingAPI.reject((incomingRequest as any)._id)
    } catch {}
    if (timerRef.current) clearTimeout(timerRef.current)
    setIncomingRequest(null)
  }

  // ── Escalate booking ────────────────────────────────────────
  const handleEscalate = () => {
    if (!activeBooking) return
    showPopup({
      type:'warning', title:'Escalate to Support', icon:'',
      body:'Cannot reach the customer? Our support team will bridge the connection.',
      actions:[
        { label:'Yes, Escalate', variant:'warning', fn: async () => {
          closePopup()
          try {
            await BookingAPI.escalate((activeBooking as any)._id)
            showPopup({ type:'info', title:'Support Notified', icon:'', body:'Our team is now contacting the customer on your behalf.', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
          } catch {
            showPopup({ type:'error', title:'Failed', icon:'', body:'Please try again.', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
          }
        }},
        { label:'Cancel', variant:'secondary', fn:closePopup },
      ],
    })
  }

  // ── Complete booking ────────────────────────────────────────
  const handleComplete = () => {
    if (!activeBooking) return
    showPopup({
      type:'confirm', title:'Mark as Complete?', icon:'',
      body:'Confirm that the service has been successfully completed.',
      actions:[
        { label:'Yes, Complete', variant:'primary', fn: async () => {
          closePopup()
          try {
            const res = await BookingAPI.complete((activeBooking as any)._id)
            if (res.data?.success) {
              setActiveBooking(null)
              // Refresh earnings
              AssistantAPI.getEarnings().then(r => {
                if (r.data?.success) setEarnings({ daily: r.data.daily || 0, totalTrips: r.data.totalTrips || 0 })
              }).catch(() => {})
              showPopup({ type:'success', title:'Service Complete!', icon:'', body:'Your earnings have been recorded.', actions:[{ label:'Great!', variant:'primary', fn:closePopup }] })
            }
          } catch {
            showPopup({ type:'error', title:'Failed', icon:'', body:'Please try again.', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
          }
        }},
        { label:'Cancel', variant:'secondary', fn:closePopup },
      ],
    })
  }

  // ── Online toggle ───────────────────────────────────────────
  const handleToggle = () => {
    if (isOnline) {
      showPopup({
        type:'confirm', title:'Go Offline?', icon:'',
        body:'Are you sure you want to go offline and stop accepting duties?',
        actions:[
          { label:'Yes, Go Offline', variant:'danger', fn: async () => {
            setOnline(false)
            setIncomingRequest(null)
            closePopup()
            try { await AssistantAPI.setAvailability(false) } catch {}
            showPopup({ type:'info', title:'You are Offline', icon:'', body:"You won't receive any requests while offline.", actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
          }},
          { label:'Stay Online', variant:'primary', fn:closePopup },
        ],
      })
    } else {
      setOnline(true)
      setIncomingRequest(null)
      try { AssistantAPI.setAvailability(true) } catch {}
      showPopup({ type:'success', title:'You are Online', icon:'', body:'You are now visible to customers.\nRequests will appear here.', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (adScreen && adData) {
    return (
      <MobileFrame>
        <AdDetailScreen
          ad={adData}
          onBack={() => setAdScreen(false)}
          onConfirm={() => {
            setAdScreen(false)
            showPopup({ type:'success', title:'Request Sent!', icon:'', body:`We have received your request for ${adData.title.replace('\n',' ')}.`, actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
          }}
        />
        <PopupLayer />
      </MobileFrame>
    )
  }

  return (
    <MobileFrame>
      <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#F8FAFC', position:'relative' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#0F172A,#134E4A)', padding:'48px 20px 24px', flexShrink:0 }}>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>{greeting},</div>
          <div style={{ fontSize:'18px', fontWeight:700, color:'#fff', marginTop:'2px' }}>{userName}</div>
          <div style={{ fontSize:'12px', color: isOnline ? '#4ade80' : 'rgba(255,255,255,0.5)', marginTop:'4px' }}>
            {isOnline ? 'Online - Ready for duty' : 'Offline - Go online to earn'}
          </div>
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} onScroll={handleScroll}
          style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch' as any }}>

          <div style={{ padding:'16px 16px 100px' }}>

            {/* Online toggle card */}
            <div style={{ background:'#fff', borderRadius:'18px', padding:'16px', marginBottom:'12px', border:'1px solid #E2E8F0' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:'15px', fontWeight:700, color:'#0F172A' }}>
                    {isOnline ? 'You are Online' : 'You are Offline'}
                  </div>
                  <div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>
                    {isOnline ? 'Accepting new requests' : 'Tap to start accepting requests'}
                  </div>
                </div>
                <div onClick={handleToggle}
                  style={{ width:'52px', height:'28px', borderRadius:'14px', background: isOnline ? '#0D9488' : '#E2E8F0', cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
                  <div style={{ position:'absolute', top:'3px', left: isOnline ? '27px' : '3px', width:'22px', height:'22px', borderRadius:'11px', background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }} />
                </div>
              </div>
            </div>

            {/* Active booking card */}
            {activeBooking && (
              <div style={{ background:'#E0F7F5', borderRadius:'18px', padding:'16px', marginBottom:'12px', border:'2px solid #0D9488' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#065F46', marginBottom:'4px' }}>Active Booking</div>
                <div style={{ fontSize:'14px', fontWeight:600, color:'#0F172A', marginBottom:'2px' }}>
                  {SERVICE_LABELS[(activeBooking as any).serviceType] || 'Service'}
                </div>
                <div style={{ fontSize:'12px', color:'#475569', marginBottom:'4px' }}>
                  {(activeBooking as any).pickupLocation || (activeBooking as any).hospital || 'Location shared'}
                </div>
                <div style={{ fontSize:'16px', fontWeight:800, color:'#0D9488', marginBottom:'12px' }}>
                  Rs. {(activeBooking as any).fare || 0}
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={handleEscalate}
                    style={{ flex:1, background:'#FEF3C7', color:'#92400E', border:'none', borderRadius:'10px', padding:'10px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                    Escalate
                  </button>
                  <button onClick={handleComplete}
                    style={{ flex:2, background:'#0D9488', color:'#fff', border:'none', borderRadius:'10px', padding:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                    Mark Complete
                  </button>
                </div>
              </div>
            )}

            {/* Incoming request card */}
            {isOnline && incomingRequest && (
              <div style={{ background:'#fff', borderRadius:'18px', padding:'16px', marginBottom:'12px', border:'2px solid #0D9488', boxShadow:'0 4px 20px rgba(13,148,136,0.15)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A' }}>New Request</div>
                    <div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>
                      {SERVICE_LABELS[(incomingRequest as any).serviceType] || 'Service'}
                    </div>
                  </div>
                  <div style={{ background:'#E0F7F5', color:'#0D9488', fontSize:'15px', fontWeight:800, borderRadius:'8px', padding:'4px 10px' }}>
                    Rs. {(incomingRequest as any).fare || 0}
                  </div>
                </div>
                <div style={{ fontSize:'12px', color:'#475569', marginBottom:'12px' }}>
                  Location: {(incomingRequest as any).pickupLocation || (incomingRequest as any).hospital || 'Shared on accept'}
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={handleReject}
                    style={{ flex:1, background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:'10px', padding:'12px', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>
                    Reject
                  </button>
                  <button onClick={handleAccept} disabled={accepting}
                    style={{ flex:2, background:'#0D9488', color:'#fff', border:'none', borderRadius:'10px', padding:'12px', fontSize:'14px', fontWeight:700, cursor:'pointer', opacity: accepting ? 0.7 : 1 }}>
                    {accepting ? 'Accepting...' : 'Accept'}
                  </button>
                </div>
              </div>
            )}

            {/* Earnings summary */}
            <div style={{ background:'#fff', borderRadius:'18px', padding:'16px', marginBottom:'12px', border:'1px solid #E2E8F0' }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A', marginBottom:'12px' }}>Today&apos;s Summary</div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'22px', fontWeight:800, color:'#0D9488' }}>Rs. {earnings.daily}</div>
                  <div style={{ fontSize:'11px', color:'#64748B', marginTop:'2px' }}>Today&apos;s earnings</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'22px', fontWeight:800, color:'#0D9488' }}>{earnings.totalTrips}</div>
                  <div style={{ fontSize:'11px', color:'#64748B', marginTop:'2px' }}>Total trips</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'16px', fontWeight:800, color: isOnline ? '#16A34A' : '#94A3B8' }}>
                    {isOnline ? 'Online' : 'Offline'}
                  </div>
                  <div style={{ fontSize:'11px', color:'#64748B', marginTop:'2px' }}>Status</div>
                </div>
              </div>
            </div>

            {/* Quick cards */}
            <div style={{ display:'flex', gap:'10px', marginBottom:'12px' }}>
              <QuickCard emoji="📋" bg="#EFF6FF" label="My Bookings"  sub="View all"    onClick={() => router.push('/bookings')} />
              <QuickCard emoji="💰" bg="#EDFAF7" label="Earnings"     sub="View all"    onClick={() => router.push('/earnings')} />
            </div>

            {/* Sponsored */}
            <SponsoredSection onAdClick={(ad) => { setAdData(ad); setAdScreen(true) }} />

            {/* Coming soon */}
            <ComingSoonSection onItemClick={() => router.push('/coming-soon')} />

            {/* Testimonials */}
            <div style={{ marginTop:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:600, color:'#94A3B8', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'12px' }}>
                What Partners Say
              </div>
              <div style={{ display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'8px' }}>
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} style={{ flexShrink:0, background:'#fff', borderRadius:'18px', border:'1px solid #E2E8F0', padding:'14px', width:'220px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                      <div style={{ width:'34px', height:'34px', borderRadius:'17px', background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:t.color }}>
                        {t.initials}
                      </div>
                      <div>
                        <div style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>{t.name}</div>
                        <div style={{ display:'flex', gap:'2px' }}>
                          {Array.from({ length: t.stars }).map((_,j) => (
                            <span key={j} style={{ fontSize:'10px', color:'#F59E0B' }}>*</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize:'11px', color:'#475569', lineHeight:1.5 }}>&quot;{t.quote}&quot;</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        <BottomNav active="Home" />
        <PopupLayer />
      </div>
    </MobileFrame>
  )
}