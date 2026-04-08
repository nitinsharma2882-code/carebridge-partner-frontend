'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import MobileFrame from '@/components/MobileFrame'

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

export default function DetailsPage() {
  const router  = useRouter()
  const { showPopup, closePopup, setProfile, profile } = useStore()

  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [address,   setAddress]   = useState('')
  const [vehicleNo, setVehicleNo] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [serviceType, setServiceType] = useState('general')

  const isAmbulance = serviceType === 'ambulance'

  useEffect(() => {
    const token = localStorage.getItem('cb_assistant_token')
    if (!token) { router.replace('/login'); return }

    // Read serviceType saved during login
    const st = localStorage.getItem('cb_partner_serviceType') || 'general'
    setServiceType(st)

    // Pre-fill if partial data exists
    if (profile?.name)  setName(profile.name)
    if (profile?.email) setEmail(profile.email)
    if (profile?.city)  setAddress(profile.city)
  }, [])

  const isValid = name.trim().length > 1
    && email.includes('@')
    && address.trim().length > 2
    && (!isAmbulance || vehicleNo.trim().length > 2)

  const handleSubmit = async () => {
    if (!isValid) return
    setLoading(true)
    try {
      const token = localStorage.getItem('cb_assistant_token')
      const body: Record<string,string> = {
        name:    name.trim(),
        email:   email.trim(),
        city:    address.trim(),
      }
      if (isAmbulance) body.vehicleNo = vehicleNo.trim()

      const res = await fetch('https://carebridge-backend-dns0.onrender.com/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.success) {
        setProfile({
          ...(profile as any),
          id:         data.user?._id   || '',
          name:       name.trim(),
          email:      email.trim(),
          city:       address.trim(),
          phone:      data.user?.phone || '',
          rating:     5.0,
          totalTrips: 0,
          experience: '',
          languages:  [],
          isVerified: false,
          isOnline:   true,
        })

        localStorage.setItem('carebridge_user', JSON.stringify({
          ...data.user,
          name:  name.trim(),
          email: email.trim(),
          city:  address.trim(),
        }))

        router.replace('/home')
      } else {
        showPopup({ type:'error', title:'Save Failed', icon:'', body:data.message || 'Could not save. Please try again.', actions:[{ label:'Try Again', variant:'primary', fn:closePopup }] })
      }
    } catch {
      showPopup({ type:'error', title:'Network Error', icon:'', body:'Please check your connection and try again.', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width:'100%', border:'1.5px solid #E2E8F0', borderRadius:'14px',
    padding:'14px 16px', fontSize:'15px', fontFamily:'DM Sans, sans-serif',
    color:'#0F172A', background:'#fff', outline:'none', boxSizing:'border-box',
  }
  const lbl: React.CSSProperties = {
    fontSize:'12px', fontWeight:700, color:'#64748B', textTransform:'uppercase',
    letterSpacing:'0.5px', marginBottom:'8px', display:'block',
  }

  // Theme based on service type
  const themeColor = isAmbulance ? '#DC2626' : '#0D9488'
  const themeBg    = isAmbulance ? '#FEE2E2' : '#E0F7F5'
  const roleLabel  = isAmbulance ? 'Ambulance Provider' : 'Hospital Assistant'

  return (
    <MobileFrame>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', background:'#F8FAFC' }}>

        {/* Status bar */}
        <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
          <span style={{ fontSize:'11px', fontWeight:700, color:'#0F172A' }}>5G</span>
        </div>

        {/* Header */}
        <div style={{ background:'#fff', padding:'12px 20px 16px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          {/* Role badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:themeBg, borderRadius:'20px', padding:'4px 12px', marginBottom:'10px', border:`1px solid ${themeColor}` }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:themeColor }} />
            <span style={{ fontSize:'11px', fontWeight:700, color:themeColor }}>{roleLabel}</span>
          </div>
          <div style={{ fontSize:'22px', fontWeight:900, color:'#0F172A', letterSpacing:'-0.4px' }}>
            Complete your profile
          </div>
          <div style={{ fontSize:'13px', color:'#64748B', marginTop:'4px' }}>
            This helps us personalise your experience
          </div>
        </div>

        {/* Form */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px 20px 40px' }}>

          {/* Name */}
          <div style={{ marginBottom:'18px' }}>
            <label style={lbl}>Full Name *</label>
            <input
              style={{ ...inp, borderColor: name.trim().length > 1 ? themeColor : '#E2E8F0' }}
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom:'18px' }}>
            <label style={lbl}>Email Address *</label>
            <input
              style={{ ...inp, borderColor: email.includes('@') ? themeColor : '#E2E8F0' }}
              placeholder="your@email.com"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Address */}
          <div style={{ marginBottom:'18px' }}>
            <label style={lbl}>City / Area *</label>
            <input
              style={{ ...inp, borderColor: address.trim().length > 2 ? themeColor : '#E2E8F0' }}
              placeholder="e.g. Delhi, Mumbai, Bangalore"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          {/* Vehicle number — only for ambulance */}
          {isAmbulance && (
            <div style={{ marginBottom:'18px' }}>
              <label style={lbl}>Vehicle / Ambulance Number *</label>
              <input
                style={{ ...inp, borderColor: vehicleNo.trim().length > 2 ? themeColor : '#E2E8F0' }}
                placeholder="e.g. DL 01 AB 1234"
                value={vehicleNo}
                onChange={e => setVehicleNo(e.target.value.toUpperCase())}
              />
              <div style={{ fontSize:'11px', color:'#94A3B8', marginTop:'6px' }}>
                This will be shown to patients when you accept a request
              </div>
            </div>
          )}

          {/* Info note */}
          <div style={{ background: themeBg, borderRadius:'14px', padding:'14px 16px', marginBottom:'24px', border:`1px solid ${themeColor}20` }}>
            <div style={{ fontSize:'12px', color: isAmbulance ? '#7F1D1D' : '#065F46', lineHeight:1.6 }}>
              {isAmbulance
                ? 'Your vehicle details are shared with patients only after you accept an emergency request.'
                : 'Your details are stored securely and used only to match you with the right patients.'
              }
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            style={{
              width:'100%', padding:'16px', borderRadius:'16px',
              background: isValid && !loading ? themeColor : '#E2E8F0',
              color: isValid && !loading ? '#fff' : '#94A3B8',
              border:'none', fontSize:'16px', fontWeight:800,
              cursor: isValid && !loading ? 'pointer' : 'not-allowed',
              fontFamily:'DM Sans, sans-serif', transition:'all 0.2s',
            }}
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>

          <button
            onClick={() => router.replace('/home')}
            style={{ width:'100%', background:'none', border:'none', color:'#94A3B8', fontSize:'13px', fontWeight:600, cursor:'pointer', marginTop:'14px', fontFamily:'DM Sans, sans-serif' }}
          >
            Skip for now
          </button>

        </div>

        <PopupLayer />
      </div>
    </MobileFrame>
  )
}