'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookingAPI } from '@/lib/api'
import { useStore } from '@/lib/store'
import BottomNav from '@/components/BottomNav'
import MobileFrame from '@/components/MobileFrame'

type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'escalated'

interface Booking {
  _id:                 string
  serviceType:         string
  hospital?:           string
  pickupLocation?:     string
  destinationHospital?: string
  patientName?:        string
  patientPhone?:       string
  date?:               string
  time?:               string
  fare:                number
  status:              BookingStatus
  createdAt:           string
  completedAt?:        string
  userId?:             { name?: string; phone?: string }
}

const SERVICE_LABELS: Record<string,string> = {
  opd_assistant: 'OPD Assistant',
  ambulance:     'Ambulance',
  nursing:       'Nursing Care',
  general:       'General Help',
}

const STATUS_CONFIG: Record<string, { label:string; bg:string; color:string }> = {
  pending:     { label:'Pending',     bg:'#FEF3C7', color:'#D97706' },
  accepted:    { label:'Accepted',    bg:'#DBEAFE', color:'#2563EB' },
  in_progress: { label:'In Progress', bg:'#E0F7F5', color:'#0D9488' },
  completed:   { label:'Completed',   bg:'#DCFCE7', color:'#16A34A' },
  cancelled:   { label:'Cancelled',   bg:'#FEE2E2', color:'#DC2626' },
  escalated:   { label:'Escalated',   bg:'#EDE9FE', color:'#7C3AED' },
}

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
          <div style={{ width:'68px', height:'68px', borderRadius:'50%', background:iconBg[popup.type], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', marginBottom:'12px' }}>{popup.icon||''}</div>
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

export default function BookingsPage() {
  const router = useRouter()
  const { showPopup, closePopup } = useStore()

  const [bookings,    setBookings]    = useState<Booking[]>([])
  const [loading,     setLoading]     = useState(true)
  const [activeTab,   setActiveTab]   = useState<'active'|'completed'|'cancelled'>('active')
  const [selected,    setSelected]    = useState<Booking|null>(null)

  useEffect(() => {
    const token = localStorage.getItem('cb_assistant_token')
    if (!token) { router.replace('/login'); return }

    BookingAPI.getMyBookings()
      .then(res => {
        if (res.data.success) setBookings(res.data.bookings || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const active    = bookings.filter(b => b.status === 'accepted' || b.status === 'in_progress' || b.status === 'pending')
  const completed = bookings.filter(b => b.status === 'completed')
  const cancelled = bookings.filter(b => b.status === 'cancelled' || b.status === 'escalated')

  const displayed = activeTab === 'active' ? active : activeTab === 'completed' ? completed : cancelled

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
    } catch { return iso }
  }

  const getLocation = (b: Booking) => {
    if (b.serviceType === 'ambulance') return b.pickupLocation || 'Pickup location'
    return b.hospital || b.pickupLocation || 'Location not specified'
  }

  const getCustomer = (b: Booking) => {
    if (b.serviceType === 'ambulance') return b.patientName || 'Patient'
    return (b.userId as any)?.name || 'Customer'
  }

  return (
    <MobileFrame>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', background:'#F8FAFC' }}>

        {/* Header */}
        <div style={{ background:'#fff', padding:'52px 16px 0', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
            <button onClick={() => router.back()}
              style={{ width:'38px', height:'38px', borderRadius:'12px', background:'#F8FAFC', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div>
              <h2 style={{ fontSize:'18px', fontWeight:800, color:'#0F172A', margin:0 }}>My Bookings</h2>
              <div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>{bookings.length} total bookings</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:'0' }}>
            {([
              { key:'active',    label:'Active',    count: active.length },
              { key:'completed', label:'Completed', count: completed.length },
              { key:'cancelled', label:'Cancelled', count: cancelled.length },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{
                  flex:1, padding:'10px 4px', border:'none', background:'none', cursor:'pointer',
                  fontSize:'13px', fontWeight: activeTab===tab.key ? 700 : 500,
                  color: activeTab===tab.key ? '#0D9488' : '#94A3B8',
                  borderBottom: activeTab===tab.key ? '2.5px solid #0D9488' : '2.5px solid transparent',
                  fontFamily:'DM Sans, sans-serif',
                }}>
                {tab.label}
                {tab.count > 0 && (
                  <span style={{ marginLeft:'5px', background: activeTab===tab.key?'#E0F7F5':'#F1F5F9', color: activeTab===tab.key?'#0D9488':'#94A3B8', fontSize:'10px', fontWeight:700, borderRadius:'10px', padding:'1px 6px' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px 90px' }}>

          {loading && (
            <div style={{ textAlign:'center', padding:'60px 20px', color:'#94A3B8', fontSize:'14px' }}>
              Loading bookings...
            </div>
          )}

          {!loading && displayed.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:'40px', marginBottom:'12px' }}>
                {activeTab === 'active' ? 'C' : activeTab === 'completed' ? 'D' : 'X'}
              </div>
              <div style={{ fontSize:'15px', fontWeight:700, color:'#0F172A', marginBottom:'6px' }}>
                No {activeTab} bookings
              </div>
              <div style={{ fontSize:'13px', color:'#94A3B8' }}>
                {activeTab === 'active'
                  ? 'Go online to start receiving requests'
                  : activeTab === 'completed'
                  ? 'Completed bookings will appear here'
                  : 'Cancelled bookings will appear here'}
              </div>
            </div>
          )}

          {!loading && displayed.map(b => {
            const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
            const isAmbulance = b.serviceType === 'ambulance'
            return (
              <div key={b._id}
                onClick={() => setSelected(b)}
                style={{ background:'#fff', borderRadius:'18px', padding:'16px', marginBottom:'10px', border:'1px solid #E2E8F0', cursor:'pointer' }}>

                {/* Top row */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:700, color:'#0F172A' }}>
                      {SERVICE_LABELS[b.serviceType] || b.serviceType}
                    </div>
                    <div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>
                      {getCustomer(b)}
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
                    <span style={{ fontSize:'12px', fontWeight:700, color:cfg.color, background:cfg.bg, borderRadius:'20px', padding:'3px 10px' }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize:'14px', fontWeight:800, color:'#0D9488' }}>
                      Rs. {b.fare}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div style={{ display:'flex', alignItems:'flex-start', gap:'8px', marginBottom:'8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" style={{ marginTop:'1px', flexShrink:0 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div style={{ fontSize:'12px', color:'#475569', flex:1 }}>{getLocation(b)}</div>
                </div>

                {/* Ambulance extra */}
                {isAmbulance && b.destinationHospital && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'8px', marginBottom:'8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" style={{ marginTop:'1px', flexShrink:0 }}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <div style={{ fontSize:'12px', color:'#475569', flex:1 }}>{b.destinationHospital}</div>
                  </div>
                )}

                {/* Date */}
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" style={{ flexShrink:0 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <div style={{ fontSize:'12px', color:'#475569' }}>
                    {b.date ? `${b.date} ${b.time ? 'at ' + b.time : ''}` : formatDate(b.createdAt)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Booking detail popup */}
        {selected && (
          <div onClick={() => setSelected(null)}
            style={{ position:'absolute', inset:0, zIndex:50, background:'rgba(15,23,42,0.65)', display:'flex', alignItems:'flex-end' }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background:'#fff', borderRadius:'24px 24px 0 0', width:'100%', padding:'24px 20px 40px', maxHeight:'80%', overflowY:'auto' }}>

              {/* Handle */}
              <div style={{ width:'40px', height:'4px', borderRadius:'2px', background:'#E2E8F0', margin:'0 auto 20px' }} />

              <div style={{ fontSize:'18px', fontWeight:800, color:'#0F172A', marginBottom:'4px' }}>
                {SERVICE_LABELS[selected.serviceType] || selected.serviceType}
              </div>
              <div style={{ fontSize:'12px', color:'#64748B', marginBottom:'20px' }}>
                Booking #{selected._id.slice(-8).toUpperCase()}
              </div>

              {/* Details */}
              {[
                { label:'Status',   value: STATUS_CONFIG[selected.status]?.label || selected.status },
                { label:'Fare',     value: `Rs. ${selected.fare}` },
                { label:'Customer', value: getCustomer(selected) },
                { label:'Location', value: getLocation(selected) },
                ...(selected.serviceType === 'ambulance' && selected.destinationHospital
                  ? [{ label:'Destination', value: selected.destinationHospital }]
                  : []),
                ...(selected.patientPhone
                  ? [{ label:'Patient Phone', value: selected.patientPhone }]
                  : []),
                ...(selected.date
                  ? [{ label:'Date & Time', value: `${selected.date} ${selected.time ? 'at ' + selected.time : ''}` }]
                  : [{ label:'Booked on', value: formatDate(selected.createdAt) }]),
                ...(selected.completedAt
                  ? [{ label:'Completed on', value: formatDate(selected.completedAt) }]
                  : []),
              ].map((row, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', paddingTop:'12px', paddingBottom:'12px', borderBottom:'1px solid #F1F5F9' }}>
                  <span style={{ fontSize:'13px', color:'#64748B' }}>{row.label}</span>
                  <span style={{ fontSize:'13px', fontWeight:600, color:'#0F172A', textAlign:'right', maxWidth:'60%' }}>{row.value}</span>
                </div>
              ))}

              <button onClick={() => setSelected(null)}
                style={{ width:'100%', padding:'14px', background:'#0D9488', color:'#fff', border:'none', borderRadius:'14px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif', marginTop:'20px' }}>
                Close
              </button>
            </div>
          </div>
        )}

        <BottomNav active="Home" />
        <PopupLayer />
      </div>
    </MobileFrame>
  )
}