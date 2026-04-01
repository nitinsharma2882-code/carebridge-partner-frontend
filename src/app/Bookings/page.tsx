'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

// ── Types ─────────────────────────────────────────────────────────────────────
type BookingStatus = 'upcoming' | 'completed' | 'cancelled'

interface Booking {
  id:           string
  customerName: string
  customerPhone: string
  service:      string
  address:      string
  date:         string
  time:         string
  duration:     string
  fare:         number
  status:       BookingStatus
  rating?:      number
  cancelReason?: string
}

// ── Seed Data ─────────────────────────────────────────────────────────────────
const SEED_BOOKINGS: Booking[] = [
  {
    id: 'b001', customerName: 'Priya Sharma', customerPhone: '+91 98765 11111',
    service: 'Elder Care', address: 'B-42, Rohini Sector 11, Delhi',
    date: 'Today', time: '3:00 PM', duration: '2 hrs', fare: 480,
    status: 'upcoming',
  },
  {
    id: 'b002', customerName: 'Amit Verma', customerPhone: '+91 98765 22222',
    service: 'Post-Surgery Care', address: 'A-12, Vasant Kunj, Delhi',
    date: 'Tomorrow', time: '10:00 AM', duration: '3 hrs', fare: 720,
    status: 'upcoming',
  },
  {
    id: 'b003', customerName: 'Sunita Gupta', customerPhone: '+91 98765 33333',
    service: 'Physiotherapy', address: '22, Lajpat Nagar II, Delhi',
    date: '28 Mar 2026', time: '11:00 AM', duration: '1.5 hrs', fare: 360,
    status: 'completed', rating: 5,
  },
  {
    id: 'b004', customerName: 'Rajesh Mehta', customerPhone: '+91 98765 44444',
    service: 'Medication Assistance', address: 'C-8, Dwarka Sector 6, Delhi',
    date: '25 Mar 2026', time: '9:00 AM', duration: '1 hr', fare: 240,
    status: 'completed', rating: 4,
  },
  {
    id: 'b005', customerName: 'Kavita Nair', customerPhone: '+91 98765 55555',
    service: 'Elder Care', address: '5, Green Park, Delhi',
    date: '20 Mar 2026', time: '2:00 PM', duration: '2 hrs', fare: 480,
    status: 'completed', rating: 5,
  },
  {
    id: 'b006', customerName: 'Deepak Singh', customerPhone: '+91 98765 66666',
    service: 'Nursing', address: 'D-14, Pitampura, Delhi',
    date: '18 Mar 2026', time: '4:00 PM', duration: '2 hrs', fare: 560,
    status: 'cancelled', cancelReason: 'Customer cancelled',
  },
  {
    id: 'b007', customerName: 'Meena Joshi', customerPhone: '+91 98765 77777',
    service: 'First Aid', address: '9, Saket, Delhi',
    date: '15 Mar 2026', time: '8:00 AM', duration: '1 hr', fare: 280,
    status: 'cancelled', cancelReason: 'Partner unavailable',
  },
]

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
    <div onClick={e => { if (e.target === e.currentTarget) closePopup() }}
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

// ── Booking Detail Sheet ──────────────────────────────────────────────────────
function BookingDetailSheet({ booking, onClose, onCancel }: {
  booking: Booking
  onClose: () => void
  onCancel: (id: string) => void
}) {
  const STATUS_CONFIG = {
    upcoming:  { bg: '#EDFAF7', color: '#0D9488', label: 'Upcoming',  icon: '🕐' },
    completed: { bg: '#DCFCE7', color: '#16A34A', label: 'Completed', icon: '✅' },
    cancelled: { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelled', icon: '❌' },
  }
  const sc = STATUS_CONFIG[booking.status]

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.55)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ background: '#fff', borderRadius: '28px 28px 0 0', padding: '0 20px 36px', maxHeight: '88%', overflowY: 'auto' }}>
        {/* Handle */}
        <div style={{ width: '36px', height: '4px', background: '#E2E8F0', borderRadius: '2px', margin: '14px auto 20px' }} />

        {/* Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Booking Details</h3>
          <div style={{ background: sc.bg, color: sc.color, fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '100px' }}>
            {sc.icon} {sc.label}
          </div>
        </div>

        {/* Booking ID */}
        <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Booking ID</span>
          <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: 700 }}>#{booking.id.toUpperCase()}</span>
        </div>

        {/* Customer */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '14px 16px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Customer</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#0D9488,#065f52)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#fff', fontWeight: 800 }}>
              {booking.customerName.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{booking.customerName}</div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{booking.customerPhone}</div>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '14px 16px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Service Info</div>
          {[
            { icon: '🏥', label: 'Service',  val: booking.service },
            { icon: '📅', label: 'Date',     val: booking.date },
            { icon: '🕐', label: 'Time',     val: booking.time },
            { icon: '⏱️', label: 'Duration', val: booking.duration },
            { icon: '📍', label: 'Address',  val: booking.address },
          ].map((r, i, arr) => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingBottom: i < arr.length - 1 ? '10px' : 0, marginBottom: i < arr.length - 1 ? '10px' : 0, borderBottom: i < arr.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
              <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>{r.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>{r.label}</div>
                <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600, marginTop: '2px' }}>{r.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Fare */}
        <div style={{ background: 'linear-gradient(135deg,#065f52,#0D9488)', borderRadius: '16px', padding: '16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Fare</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginTop: '2px' }}>₹{booking.fare}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '8px 14px', fontSize: '13px', fontWeight: 700, color: '#fff' }}>
            {booking.status === 'completed' ? '✅ Paid' : booking.status === 'cancelled' ? '❌ Refunded' : '⏳ Pending'}
          </div>
        </div>

        {/* Rating (completed only) */}
        {booking.status === 'completed' && booking.rating && (
          <div style={{ background: '#FEF3C7', borderRadius: '14px', padding: '12px 16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #FDE68A' }}>
            <span style={{ fontSize: '20px' }}>⭐</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400E' }}>Customer Rating</div>
              <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ fontSize: '16px' }}>{s <= booking.rating! ? '★' : '☆'}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cancel reason */}
        {booking.status === 'cancelled' && booking.cancelReason && (
          <div style={{ background: '#FEE2E2', borderRadius: '14px', padding: '12px 16px', marginBottom: '12px', border: '1px solid #FECACA' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', marginBottom: '3px' }}>Cancellation Reason</div>
            <div style={{ fontSize: '13px', color: '#7F1D1D' }}>{booking.cancelReason}</div>
          </div>
        )}

        {/* Action buttons */}
        {booking.status === 'upcoming' && (
          <button onClick={() => { onCancel(booking.id); onClose() }}
            style={{ width: '100%', padding: '15px', background: '#FEE2E2', border: '1.5px solid #FECACA', borderRadius: '14px', color: '#DC2626', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: '10px' }}>
            Cancel Booking
          </button>
        )}
        <button onClick={onClose}
          style={{ width: '100%', padding: '15px', background: 'transparent', border: '1.5px solid #E2E8F0', borderRadius: '14px', color: '#64748B', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          Close
        </button>
      </div>
    </div>
  )
}

// ── Booking Card ──────────────────────────────────────────────────────────────
function BookingCard({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  const STATUS_CONFIG = {
    upcoming:  { bg: '#EDFAF7', color: '#0D9488', label: 'Upcoming',  dot: '#0D9488' },
    completed: { bg: '#DCFCE7', color: '#16A34A', label: 'Completed', dot: '#16A34A' },
    cancelled: { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelled', dot: '#DC2626' },
  }
  const sc = STATUS_CONFIG[booking.status]

  return (
    <div onClick={onPress}
      style={{ margin: '0 14px 10px', background: '#fff', borderRadius: '18px', padding: '14px 16px', border: '1px solid #E2E8F0', cursor: 'pointer' }}>

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: '10px' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{booking.customerName}</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{booking.service}</div>
        </div>
        <div style={{ background: sc.bg, color: sc.color, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', flexShrink: 0 }}>
          {sc.label}
        </div>
      </div>

      {/* Info row */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {[
          { icon: '📅', val: booking.date },
          { icon: '🕐', val: booking.time },
          { icon: '⏱️', val: booking.duration },
        ].map(item => (
          <div key={item.val} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', borderRadius: '8px', padding: '4px 8px' }}>
            <span style={{ fontSize: '11px' }}>{item.icon}</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>{item.val}</span>
          </div>
        ))}
      </div>

      {/* Address */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span style={{ fontSize: '12px', color: '#64748B', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{booking.address}</span>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '18px', fontWeight: 900, color: '#0D9488', letterSpacing: '-0.5px' }}>₹{booking.fare}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {booking.status === 'completed' && booking.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#FEF3C7', borderRadius: '8px', padding: '3px 8px', marginRight: '6px' }}>
              <span style={{ fontSize: '11px' }}>⭐</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400E' }}>{booking.rating}.0</span>
            </div>
          )}
          <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>View details</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
type Tab = 'upcoming' | 'completed' | 'cancelled'

export default function BookingsPage() {
  const router  = useRouter()
  const { showPopup, closePopup } = useStore()

  const [bookings,       setBookings]       = useState<Booking[]>(SEED_BOOKINGS)
  const [activeTab,      setActiveTab]      = useState<Tab>('upcoming')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const filtered = bookings.filter(b => b.status === activeTab)

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'upcoming',  label: 'Upcoming',  icon: '🕐' },
    { key: 'completed', label: 'Completed', icon: '✅' },
    { key: 'cancelled', label: 'Cancelled', icon: '❌' },
  ]

  const TAB_COUNT = (key: Tab) => bookings.filter(b => b.status === key).length

  const handleCancel = (id: string) => {
    showPopup({
      type: 'confirm', title: 'Cancel Booking?',
      body: 'Are you sure you want to cancel this booking?\nThis action cannot be undone.',
      icon: '⚠️',
      actions: [
        { label: 'Yes, Cancel', variant: 'danger', fn: () => {
          setBookings(prev => prev.map(b =>
            b.id === id ? { ...b, status: 'cancelled' as BookingStatus, cancelReason: 'Cancelled by partner' } : b
          ))
          closePopup()
          showPopup({ type: 'success', title: 'Booking Cancelled', body: 'The booking has been cancelled successfully.', icon: '✅', actions: [{ label: 'OK', variant: 'primary', fn: closePopup }] })
        }},
        { label: 'Keep', variant: 'secondary', fn: closePopup },
      ],
    })
  }

  const EMPTY_MSGS: Record<Tab, { icon: string; title: string; sub: string }> = {
    upcoming:  { icon: '📋', title: 'No Upcoming Bookings', sub: 'New booking requests will appear here once you go online.' },
    completed: { icon: '✅', title: 'No Completed Bookings', sub: 'Your completed bookings will show up here.' },
    cancelled: { icon: '❌', title: 'No Cancelled Bookings', sub: "You haven't cancelled any bookings yet." },
  }

  const empty = EMPTY_MSGS[activeTab]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '390px', height: '844px', borderRadius: '48px', overflow: 'hidden', position: 'relative', flexShrink: 0, boxShadow: '0 0 0 10px #1e293b, 0 0 0 12px #334155, 0 40px 80px rgba(0,0,0,0.8)', background: '#F8FAFC' }}>

        {/* Notch */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '126px', height: '34px', background: '#111827', borderRadius: '0 0 20px 20px', zIndex: 50 }} />

        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Status bar */}
          <div style={{ height: '50px', padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>9:41</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>5G</span>
          </div>

          {/* Header */}
          <div style={{ height: '56px', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '10px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
            <button onClick={() => router.back()} style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#F1F5F9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>My Bookings</span>
            <div style={{ width: '38px' }} />
          </div>

          {/* Summary strip */}
          <div style={{ background: '#fff', padding: '12px 14px', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '8px', flexShrink: 0 }}>
            {[
              { label: 'Total',     val: bookings.length,                          bg: '#F8FAFC',  color: '#0F172A' },
              { label: 'Upcoming',  val: bookings.filter(b=>b.status==='upcoming').length,  bg: '#EDFAF7',  color: '#0D9488' },
              { label: 'Completed', val: bookings.filter(b=>b.status==='completed').length, bg: '#DCFCE7',  color: '#16A34A' },
              { label: 'Cancelled', val: bookings.filter(b=>b.status==='cancelled').length, bg: '#FEE2E2',  color: '#DC2626' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: '12px', padding: '8px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 900, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: '9px', fontWeight: 700, color: s.color, opacity: 0.8, marginTop: '1px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div style={{ background: '#fff', padding: '10px 14px', display: 'flex', gap: '8px', flexShrink: 0, borderBottom: '1px solid #E2E8F0' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                flex: 1, padding: '8px 4px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: activeTab === t.key ? '#0D9488' : '#F1F5F9',
                fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: '14px' }}>{t.icon}</div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: activeTab === t.key ? '#fff' : '#64748B', marginTop: '2px' }}>
                  {t.label}
                </div>
                {TAB_COUNT(t.key) > 0 && (
                  <div style={{ fontSize: '10px', fontWeight: 800, color: activeTab === t.key ? 'rgba(255,255,255,0.8)' : '#94A3B8' }}>
                    ({TAB_COUNT(t.key)})
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Booking list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0', paddingBottom: '24px' }}>
            {filtered.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '52px' }}>{empty.icon}</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>{empty.title}</div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6 }}>{empty.sub}</div>
              </div>
            ) : (
              filtered.map(b => (
                <BookingCard key={b.id} booking={b} onPress={() => setSelectedBooking(b)} />
              ))
            )}
          </div>
        </div>

        <PopupLayer />

        {/* Detail sheet */}
        {selectedBooking && (
          <BookingDetailSheet
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  )
}