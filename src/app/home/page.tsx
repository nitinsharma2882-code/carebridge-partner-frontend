'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { BookingAPI, AssistantAPI } from '@/lib/api'
import { io, Socket } from 'socket.io-client'
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

const BULLETIN_ITEMS = [
  'Ambulance: 108', 'Police: 100', 'Fire: 101',
  'Medical Helpline: 104', 'Women Helpline: 1091',
  'Child Helpline: 1098', 'Disaster: 1070',
]

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
  const { isOnline, setOnline, showPopup, closePopup } = useStore()

  const [userName,        setUserName]        = useState('there')
  const [upcomingCount,   setUpcomingCount]   = useState(0)
  const [earnings,        setEarnings]        = useState({ daily: 0, totalTrips: 0, rating: 5.0 })
  const [adScreen,        setAdScreen]        = useState(false)
  const [adData,          setAdData]          = useState<{ title:string; badge:string; sub:string }|null>(null)
  const [incomingRequest, setIncomingRequest] = useState<Record<string,unknown>|null>(null)
  const [activeBooking,   setActiveBooking]   = useState<Record<string,unknown>|null>(null)
  const [accepting,       setAccepting]       = useState(false)
  const [bookingStarted,  setBookingStarted]  = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const pollRef   = useRef<ReturnType<typeof setInterval>|null>(null)
  const timerRef  = useRef<ReturnType<typeof setTimeout>|null>(null)
  const socketRef = useRef<Socket|null>(null)

  // Restore scroll position
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY)
    if (saved && scrollRef.current) scrollRef.current.scrollTop = parseInt(saved, 10)
  }, [])

  const handleScroll = () => {
    if (scrollRef.current) sessionStorage.setItem(SCROLL_KEY, String(scrollRef.current.scrollTop))
  }

  // Load user data and earnings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('carebridge_user')
      if (saved) { const u = JSON.parse(saved); if (u.name) setUserName(u.name) }
    } catch {}

    AssistantAPI.getProfile().then(res => {
      if (res.data?.success && res.data.user?.name) {
        setUserName(res.data.user.name)
        localStorage.setItem('carebridge_user', JSON.stringify(res.data.user))
      }
    }).catch(() => {})

    AssistantAPI.getEarnings().then(res => {
      if (res.data?.success) {
        setEarnings({
          daily:      res.data.daily      || 0,
          totalTrips: res.data.totalTrips || 0,
          rating:     res.data.rating     || 5.0,
        })
        setUpcomingCount(res.data.totalTrips || 0)
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
          if (!incomingRequest || (incomingRequest as any)._id !== first._id) {
            setIncomingRequest(first)
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => setIncomingRequest(null), 30000)
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
  // ── Socket.IO: real-time booking notifications ──────────────
  useEffect(() => {
    if (!isOnline) {
      socketRef.current?.disconnect()
      return
    }

    const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://carebridge-backend-dns0.onrender.com'
    const token = typeof window !== 'undefined' ? localStorage.getItem('cb_assistant_token') : null

    const socket = io(BASE, {
      auth:          { token },
      transports:    ['websocket', 'polling'],
      reconnectionAttempts: 5,
    })
    socketRef.current = socket

    // New booking available for this partner
    socket.on('new_booking', (booking: Record<string, unknown>) => {
      setIncomingRequest(prev => {
        // Don't override an existing request the partner hasn't actioned yet
        if (prev) return prev
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setIncomingRequest(null), 30000)
        return booking
      })
    })

    // Booking was cancelled by consumer while partner was deciding
    socket.on('booking_cancelled', (data: { bookingId: string }) => {
      setIncomingRequest(prev =>
        prev && (prev as any)._id === data.bookingId ? null : prev
      )
    })

    return () => { socket.disconnect() }
  }, [isOnline])


  // ── Accept ──────────────────────────────────────────────────
  const handleAccept = async () => {
    if (!incomingRequest) return
    setAccepting(true)
    try {
      const res = await BookingAPI.accept((incomingRequest as any)._id)
      if (res.data?.success) {
        if (timerRef.current) clearTimeout(timerRef.current)
        setActiveBooking(res.data.booking)
        setIncomingRequest(null)
        showPopup({ type:'success', title:'Booking Accepted!', icon:'', body:'Head to the customer location. Tap Complete when done.', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Could not accept this booking.'
      // Remove stale request from UI
      setIncomingRequest(null)
      showPopup({
        type:'error', title:'Booking Unavailable', icon:'',
        body: msg,
        actions:[{ label:'OK', variant:'primary', fn:closePopup }]
      })
    } finally { setAccepting(false) }
  }

  // ── Reject ──────────────────────────────────────────────────
  const handleReject = async () => {
    if (!incomingRequest) return
    try { await BookingAPI.reject((incomingRequest as any)._id) } catch {}
    if (timerRef.current) clearTimeout(timerRef.current)
    setIncomingRequest(null)
  }

  // ── Escalate ────────────────────────────────────────────────
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
            showPopup({ type:'info', title:'Support Notified', icon:'', body:'Our team is contacting the customer on your behalf.', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
          } catch {
            showPopup({ type:'error', title:'Failed', icon:'', body:'Please try again.', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
          }
        }},
        { label:'Cancel', variant:'secondary', fn:closePopup },
      ],
    })
  }

  // ── Complete ────────────────────────────────────────────────
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
              setBookingStarted(false)
              AssistantAPI.getEarnings().then(r => {
                if (r.data?.success) setEarnings({ daily: r.data.daily || 0, totalTrips: r.data.totalTrips || 0, rating: r.data.rating || 5.0 })
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
            setOnline(false); setIncomingRequest(null); closePopup()
            try { await AssistantAPI.setAvailability(false) } catch {}
            showPopup({ type:'info', title:'You are Offline', icon:'', body:"You won't receive any requests while offline.", actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
          }},
          { label:'Stay Online', variant:'primary', fn:closePopup },
        ],
      })
    } else {
      setOnline(true); setIncomingRequest(null)
      try { AssistantAPI.setAvailability(true) } catch {}
      showPopup({ type:'success', title:'You are Online', icon:'', body:'You are now visible to customers.\nRequests will appear here.', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
    }
  }

  const handleAdClick  = (ad: { title:string; badge:string; sub:string }) => { setAdData(ad); setAdScreen(true) }
  const handleAdConfirm = () => {
    setAdScreen(false)
    showPopup({ type:'success', title:'Request Sent!', icon:'', body:`We have received your request for ${adData?.title.replace('\n',' ')}.`, actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
  }

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const onlineTime = isOnline ? 'Online · Ready for duty' : 'Go online to earn'

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
            <div style={{ fontSize:'11px', color:'#94A3B8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px' }}>{greeting}</div>
            <div style={{ fontSize:'19px', fontWeight:900, color:'#0F172A', letterSpacing:'-0.4px', marginTop:'2px' }}>{userName}</div>
            {upcomingCount > 0 && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:'5px', marginTop:'5px', background:'#EDFAF7', borderRadius:'20px', padding:'3px 10px' }}>
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#0D9488' }} />
                <span style={{ fontSize:'11px', fontWeight:700, color:'#0D9488' }}>{upcomingCount} Trip{upcomingCount > 1 ? 's' : ''} completed</span>
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
        <div ref={scrollRef} onScroll={handleScroll}
          style={{ flex:1, overflowY:'auto', paddingBottom:'90px' }}>

          {/* SOS Banner */}
          <div onClick={() => router.push('/sos')}
            style={{ margin:'12px 14px 0', borderRadius:'16px', background:'linear-gradient(135deg,#FEF2F2,#FEE2E2)', border:'1.5px solid #FECACA', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', animation:'sosPulse 2s infinite' }}>
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

          {/* Quick Actions */}
          <div style={{ padding:'12px 14px 0' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'10px' }}>Quick Actions</div>
            <div style={{ display:'flex', gap:'10px' }}>
              <QuickCard emoji="📋" bg="#EDFAF7" label="Active Bookings"  sub="View requests"  onClick={() => router.push('/bookings')} />
              <QuickCard emoji="💰" bg="#FEF3C7" label="Today's Earnings" sub="Check payouts"  onClick={() => router.push('/earnings')} />
            </div>
          </div>

          {/* Online Toggle */}
          <div style={{ background:'#fff', padding:'12px 14px 10px', borderTop:'1px solid #E2E8F0', borderBottom:'1px solid #E2E8F0', marginTop:'12px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
              <span style={{ fontSize:'11px', fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px' }}>Your Status</span>
              <span style={{ fontSize:'12px', color:isOnline?'#16A34A':'#94A3B8', fontWeight:isOnline?700:400 }}>{onlineTime}</span>
            </div>
            <div onClick={handleToggle}
              style={{ width:'100%', height:'52px', borderRadius:'100px', background:isOnline?'#EDFAF7':'#F1F5F9', border:`1.5px solid ${isOnline?'#CCFBF1':'#E2E8F0'}`, display:'flex', padding:'4px', cursor:'pointer', position:'relative', transition:'all 0.3s ease' }}>
              <div style={{ position:'absolute', top:'4px', bottom:'4px', width:'calc(50% - 4px)', borderRadius:'100px', background:isOnline?'#0D9488':'#fff', boxShadow:isOnline?'0 2px 14px rgba(13,148,136,0.4)':'0 2px 8px rgba(0,0,0,0.12)', left:isOnline?'4px':'calc(50%)', transition:'all 0.3s cubic-bezier(0.34,1.3,0.64,1)' }} />
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, zIndex:1, color:isOnline?'#fff':'#94A3B8' }}>Online</div>
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, zIndex:1, color:isOnline?'#94A3B8':'#475569' }}>Offline</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'9px' }}>
              <div style={{ width:'9px', height:'9px', borderRadius:'50%', background:isOnline?'#16A34A':'#CBD5E1', animation:isOnline?'livePulse 1.5s ease-in-out infinite':'none' }} />
              <span style={{ fontSize:'13px', color:'#64748B' }}>{isOnline ? 'Looking for requests nearby...' : 'Toggle to start accepting bookings'}</span>
            </div>
          </div>

          {/* Active booking card */}
          {activeBooking && (
            <div style={{ margin:'10px 14px 0', borderRadius:'18px', background:'#E0F7F5', border:'2px solid #0D9488', padding:'14px 16px' }}>
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
              {/* Status badge */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:'5px', background: bookingStarted ? '#DCFCE7' : '#FEF3C7', borderRadius:'20px', padding:'3px 10px', marginBottom:'10px' }}>
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background: bookingStarted ? '#16A34A' : '#D97706' }} />
                <span style={{ fontSize:'11px', fontWeight:700, color: bookingStarted ? '#15803D' : '#92400E' }}>
                  {bookingStarted ? 'In Progress' : 'Accepted — Not Started'}
                </span>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={handleEscalate}
                  style={{ flex:1, background:'#FEF3C7', color:'#92400E', border:'none', borderRadius:'10px', padding:'10px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                  Escalate
                </button>
                {!bookingStarted ? (
                  <button onClick={handleStart}
                    style={{ flex:2, background:'#2563EB', color:'#fff', border:'none', borderRadius:'10px', padding:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                    Start Trip →
                  </button>
                ) : (
                  <button onClick={handleComplete}
                    style={{ flex:2, background:'#0D9488', color:'#fff', border:'none', borderRadius:'10px', padding:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          )}

          {/* New Request card */}
          {isOnline && incomingRequest && (
  <div style={{ margin:'10px 14px 0', borderRadius:'18px', background:'#fff', border:`2px solid ${(incomingRequest as any).serviceType === 'ambulance' ? '#DC2626' : '#0D9488'}`, padding:'14px 16px', animation:'fadeIn 0.4s ease' }}>

    {/* Header row */}
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
      <div>
        <div style={{ fontSize:'14px', fontWeight:700, color:'#0F172A' }}>
          {(incomingRequest as any).serviceType === 'ambulance' ? 'Emergency Request!' : 'New Request!'}
        </div>
        <div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>
          {SERVICE_LABELS[(incomingRequest as any).serviceType] || 'Service'}
        </div>
      </div>
      <div style={{ background:(incomingRequest as any).serviceType === 'ambulance' ? '#FEE2E2' : '#E0F7F5', color:(incomingRequest as any).serviceType === 'ambulance' ? '#DC2626' : '#0D9488', fontSize:'15px', fontWeight:800, borderRadius:'8px', padding:'4px 10px' }}>
        Rs. {(incomingRequest as any).fare || 0}
      </div>
    </div>

    {/* Ambulance specific info */}
    {(incomingRequest as any).serviceType === 'ambulance' ? (
      <>
        <div style={{ background:'#FEF2F2', borderRadius:'10px', padding:'10px 12px', marginBottom:'10px' }}>
          <div style={{ fontSize:'11px', fontWeight:700, color:'#991B1B', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Pickup</div>
          <div style={{ fontSize:'13px', color:'#0F172A' }}>{(incomingRequest as any).pickupLocation || 'Location shared on accept'}</div>
        </div>
        <div style={{ background:'#F0FDF4', borderRadius:'10px', padding:'10px 12px', marginBottom:'10px' }}>
          <div style={{ fontSize:'11px', fontWeight:700, color:'#14532D', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Destination</div>
          <div style={{ fontSize:'13px', color:'#0F172A' }}>{(incomingRequest as any).destinationHospital || 'Hospital details on accept'}</div>
        </div>
        {(incomingRequest as any).medicalNotes && (
          <div style={{ background:'#FEF3C7', borderRadius:'10px', padding:'10px 12px', marginBottom:'10px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#92400E', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Medical Notes</div>
            <div style={{ fontSize:'13px', color:'#0F172A' }}>{(incomingRequest as any).medicalNotes}</div>
          </div>
        )}
        {(incomingRequest as any).patientName && (
          <div style={{ fontSize:'12px', color:'#64748B', marginBottom:'10px' }}>
            Patient: {(incomingRequest as any).patientName} · {(incomingRequest as any).patientPhone}
          </div>
        )}
      </>
    ) : (
      /* OPD / Standard info */
      <div style={{ fontSize:'12px', color:'#475569', marginBottom:'10px' }}>
        {(incomingRequest as any).hospital && <div>Hospital: {(incomingRequest as any).hospital}</div>}
        {(incomingRequest as any).date && <div>Date: {(incomingRequest as any).date} at {(incomingRequest as any).time}</div>}
        {!(incomingRequest as any).hospital && <div>Location: {(incomingRequest as any).pickupLocation || 'Shared on accept'}</div>}
      </div>
    )}

    {/* Accept / Reject buttons */}
    <div style={{ display:'flex', gap:'8px' }}>
      <button onClick={handleReject}
        style={{ flex:1, background:'#F1F5F9', color:'#475569', border:'none', borderRadius:'10px', padding:'12px', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>
        Reject
      </button>
      <button onClick={handleAccept} disabled={accepting}
        style={{ flex:2, background:(incomingRequest as any).serviceType === 'ambulance' ? '#DC2626' : '#0D9488', color:'#fff', border:'none', borderRadius:'10px', padding:'12px', fontSize:'14px', fontWeight:700, cursor:'pointer', opacity:accepting?0.7:1 }}>
        {accepting ? 'Accepting...' : (incomingRequest as any).serviceType === 'ambulance' ? 'Accept Emergency' : 'Accept'}
      </button>
    </div>
  </div>
)}

          {/* Nearby map */}
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

          {/* Earnings Card */}
          <div style={{ margin:'0 14px', borderRadius:'22px', padding:'20px', background:'linear-gradient(135deg,#065f52,#0D9488,#14b8a6)', color:'#fff', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'150px', height:'150px', borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
            <div style={{ fontSize:'11px', fontWeight:700, opacity:0.75, letterSpacing:'0.8px', textTransform:'uppercase' }}>Today&apos;s Earnings</div>
            <div style={{ fontSize:'38px', fontWeight:900, letterSpacing:'-2px', margin:'4px 0' }}>Rs. {earnings.daily}</div>
            <div style={{ fontSize:'12px', opacity:0.75, marginBottom:'16px' }}>Keep it up!</div>
            <div style={{ display:'flex', gap:'8px' }}>
              {[
                { v: String(earnings.totalTrips), l:'Trips' },
                { v: earnings.rating.toFixed(1),  l:'Rating' },
                { v: isOnline ? 'Online' : 'Offline', l:'Status' },
              ].map(s => (
                <div key={s.l} style={{ flex:1, background:'rgba(255,255,255,0.15)', borderRadius:'12px', padding:'10px 12px' }}>
                  <div style={{ fontSize:'17px', fontWeight:800 }}>{s.v}</div>
                  <div style={{ fontSize:'10px', opacity:0.7, fontWeight:600, marginTop:'2px' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsored */}
          <SponsoredSection onAdClick={handleAdClick} />

          {/* Coming Soon */}
          <ComingSoonSection onItemClick={() => router.push('/coming-soon')} />

          {/* Testimonials */}
          <div style={{ padding:'16px 0 0' }}>
            <div style={{ padding:'0 14px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:'11px', fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px' }}>What Partners Say</span>
            </div>
            <div style={{ display:'flex', gap:'10px', overflowX:'auto', padding:'0 14px 4px', scrollbarWidth:'none' }}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} style={{ minWidth:'220px', background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0', flexShrink:0 }}>
                  <div style={{ display:'flex', gap:'2px', marginBottom:'10px' }}>
                    {Array.from({ length:5 }).map((_,s) => (
                      <span key={s} style={{ fontSize:'13px', color:s < t.stars?'#F59E0B':'#E2E8F0' }}>*</span>
                    ))}
                  </div>
                  <div style={{ fontSize:'12px', color:'#475569', lineHeight:1.65, marginBottom:'12px' }}>&quot;{t.quote}&quot;</div>
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

      {/* Ad Detail overlay */}
      {adScreen && (
        <div style={{ position:'absolute', inset:0, zIndex:200 }}>
          <AdDetailScreen ad={adData} onBack={() => setAdScreen(false)} onConfirm={handleAdConfirm} />
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