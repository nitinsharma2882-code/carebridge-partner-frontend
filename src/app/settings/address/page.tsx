'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import type { Address } from '@/lib/types'

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

// ── Address Sheet ─────────────────────────────────────────────────────────────
function AddressSheet({
  open, onClose, onSave, initial,
}: {
  open: boolean
  onClose: () => void
  onSave: (a: Omit<Address, 'id'>) => void
  initial?: Address | null
}) {
  const [label,   setLabel]   = useState<Address['label']>(initial?.label   || 'Home')
  const [line1,   setLine1]   = useState(initial?.line1   || '')
  const [line2,   setLine2]   = useState(initial?.line2   || '')
  const [city,    setCity]    = useState(initial?.city    || '')
  const [state,   setState]   = useState(initial?.state   || '')
  const [pincode, setPincode] = useState(initial?.pincode || '')
  const [isDefault, setIsDefault] = useState(initial?.isDefault || false)
  const [errors,  setErrors]  = useState<Record<string, string>>({})

  const LABELS: Address['label'][] = ['Home', 'Work', 'Other']

  const LABEL_ICONS: Record<Address['label'], string> = {
    Home: '🏠', Work: '💼', Other: '📍',
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!line1.trim())           e.line1   = 'Address line 1 is required'
    if (!city.trim())            e.city    = 'City is required'
    if (!state.trim())           e.state   = 'State is required'
    if (!pincode.trim())         e.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(pincode.trim())) e.pincode = 'Enter a valid 6-digit pincode'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = () => {
    if (!validate()) return
    onSave({ label, line1: line1.trim(), line2: line2.trim() || undefined, city: city.trim(), state: state.trim(), pincode: pincode.trim(), isDefault })
    onClose()
  }

  if (!open) return null

  const inp = (hasErr: boolean): React.CSSProperties => ({
    width: '100%', padding: '12px 14px',
    background: hasErr ? '#FEF2F2' : '#F8FAFC',
    border: `1.5px solid ${hasErr ? '#DC2626' : '#E2E8F0'}`,
    borderRadius: '12px', fontSize: '14px', color: '#0F172A',
    fontFamily: 'DM Sans, sans-serif', outline: 'none',
    boxSizing: 'border-box',
  })

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.55)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ background: '#fff', borderRadius: '28px 28px 0 0', padding: '0 20px 36px', maxHeight: '90%', overflowY: 'auto' }}>
        {/* Handle */}
        <div style={{ width: '36px', height: '4px', background: '#E2E8F0', borderRadius: '2px', margin: '14px auto 20px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.4px', marginBottom: '18px' }}>
          {initial ? 'Edit Address' : 'Add New Address'}
        </h3>

        {/* Label selector */}
        <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>Address Type</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {LABELS.map(l => (
            <button key={l} onClick={() => setLabel(l)} style={{
              flex: 1, padding: '10px 8px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: label === l ? '#0D9488' : '#F1F5F9',
              color: label === l ? '#fff' : '#475569',
              fontSize: '13px', fontWeight: 700, fontFamily: 'DM Sans, sans-serif',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '18px' }}>{LABEL_ICONS[l]}</span>
              {l}
            </button>
          ))}
        </div>

        {/* Line 1 */}
        <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Address Line 1 *</label>
        <input value={line1} onChange={e => { setLine1(e.target.value); setErrors(v => ({ ...v, line1: '' })) }}
          placeholder="Flat / House No, Building, Street"
          style={{ ...inp(!!errors.line1), marginBottom: errors.line1 ? '4px' : '14px' }} />
        {errors.line1 && <div style={{ fontSize: '11px', color: '#DC2626', marginBottom: '10px' }}>⚠ {errors.line1}</div>}

        {/* Line 2 */}
        <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Address Line 2 <span style={{ color: '#94A3B8', fontWeight: 400 }}>(Optional)</span></label>
        <input value={line2} onChange={e => setLine2(e.target.value)}
          placeholder="Landmark, Area, Colony"
          style={{ ...inp(false), marginBottom: '14px' }} />

        {/* City + State row */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: errors.city || errors.state ? '4px' : '14px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>City *</label>
            <input value={city} onChange={e => { setCity(e.target.value); setErrors(v => ({ ...v, city: '' })) }}
              placeholder="e.g. Delhi"
              style={inp(!!errors.city)} />
            {errors.city && <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>⚠ {errors.city}</div>}
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>State *</label>
            <input value={state} onChange={e => { setState(e.target.value); setErrors(v => ({ ...v, state: '' })) }}
              placeholder="e.g. Delhi"
              style={inp(!!errors.state)} />
            {errors.state && <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>⚠ {errors.state}</div>}
          </div>
        </div>

        {/* Pincode */}
        <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px', marginTop: '10px' }}>Pincode *</label>
        <input value={pincode} onChange={e => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setErrors(v => ({ ...v, pincode: '' })) }}
          placeholder="e.g. 110001" inputMode="numeric" maxLength={6}
          style={{ ...inp(!!errors.pincode), marginBottom: errors.pincode ? '4px' : '16px' }} />
        {errors.pincode && <div style={{ fontSize: '11px', color: '#DC2626', marginBottom: '12px' }}>⚠ {errors.pincode}</div>}

        {/* Set as default toggle */}
        <div onClick={() => setIsDefault(v => !v)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '13px 16px', marginBottom: '20px', cursor: 'pointer' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Set as Default Address</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Used by default for bookings</div>
          </div>
          <div style={{ width: '44px', height: '26px', borderRadius: '100px', background: isDefault ? '#0D9488' : '#CBD5E1', position: 'relative', flexShrink: 0, transition: 'background 0.25s' }}>
            <div style={{ position: 'absolute', top: '3px', left: isDefault ? '21px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </div>
        </div>

        {/* Save */}
        <button onClick={save}
          style={{ width: '100%', padding: '16px', background: '#0D9488', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: '10px' }}>
          {initial ? 'Save Changes' : 'Add Address'} →
        </button>
        <button onClick={onClose}
          style={{ width: '100%', padding: '15px', background: 'transparent', border: '1.5px solid #E2E8F0', borderRadius: '14px', color: '#64748B', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Address Card ──────────────────────────────────────────────────────────────
const LABEL_ICONS: Record<Address['label'], string> = {
  Home: '🏠', Work: '💼', Other: '📍',
}
const LABEL_COLORS: Record<Address['label'], { bg: string; color: string }> = {
  Home:  { bg: '#EDFAF7', color: '#0D9488' },
  Work:  { bg: '#EFF6FF', color: '#2563EB' },
  Other: { bg: '#F5F3FF', color: '#7C3AED' },
}

function AddressCard({ address, onEdit, onDelete, onSetDefault }: {
  address: Address
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
}) {
  const lc = LABEL_COLORS[address.label]
  return (
    <div style={{ margin: '0 14px 10px', background: '#fff', borderRadius: '18px', padding: '14px 16px', border: `1.5px solid ${address.isDefault ? '#CCFBF1' : '#E2E8F0'}`, position: 'relative' }}>
      {address.isDefault && (
        <div style={{ position: 'absolute', top: '10px', right: '14px', background: '#EDFAF7', color: '#0D9488', fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '100px' }}>
          ★ Default
        </div>
      )}

      {/* Label + address */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: lc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
          {LABEL_ICONS[address.label]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{address.label}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
            {address.line1}{address.line2 ? `, ${address.line2}` : ''}
          </div>
          <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
            {address.city}, {address.state} – {address.pincode}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {!address.isDefault && (
          <button onClick={onSetDefault} style={{ flex: 1, padding: '9px', background: '#EDFAF7', border: '1px solid #CCFBF1', borderRadius: '12px', fontSize: '12px', fontWeight: 700, color: '#0D9488', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Set Default
          </button>
        )}
        <button onClick={onEdit} style={{ flex: 1, padding: '9px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '12px', fontWeight: 700, color: '#475569', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button onClick={onDelete} style={{ width: '38px', padding: '9px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Seed Data ─────────────────────────────────────────────────────────────────
const SEED_ADDRESSES: Address[] = [
  { id: 'a1', label: 'Home', line1: 'B-42, Rohini Sector 11', line2: 'Near Metro Station', city: 'Delhi', state: 'Delhi', pincode: '110085', isDefault: true },
  { id: 'a2', label: 'Work', line1: 'Apollo Hospital, Sarita Vihar', city: 'Delhi', state: 'Delhi', pincode: '110076', isDefault: false },
]

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ManageAddressPage() {
  const router = useRouter()
  const { showPopup, closePopup } = useStore()

  const [addresses,    setAddresses]    = useState<Address[]>(SEED_ADDRESSES)
  const [sheetOpen,    setSheetOpen]    = useState(false)
  const [editAddress,  setEditAddress]  = useState<Address | null>(null)

  const openAdd  = () => { setEditAddress(null); setSheetOpen(true) }
  const openEdit = (a: Address) => { setEditAddress(a); setSheetOpen(true) }

  // ── Save (add or update) ──
  const saveAddress = (data: Omit<Address, 'id'>) => {
    if (editAddress) {
      // Update existing
      let updated = addresses.map(a => a.id === editAddress.id ? { ...a, ...data } : a)
      // If new default, unset others
      if (data.isDefault) updated = updated.map(a => ({ ...a, isDefault: a.id === editAddress.id }))
      setAddresses(updated)
      showPopup({ type: 'success', title: 'Address Updated ✅', body: 'Your address has been saved successfully.', icon: '✅', actions: [{ label: 'OK', variant: 'primary', fn: closePopup }] })
    } else {
      // Add new
      const newA: Address = { ...data, id: `a${Date.now()}` }
      let updated = data.isDefault
        ? [...addresses.map(a => ({ ...a, isDefault: false })), newA]
        : [...addresses, newA]
      setAddresses(updated)
      showPopup({ type: 'success', title: 'Address Added ✅', body: 'New address has been added successfully.', icon: '✅', actions: [{ label: 'OK', variant: 'primary', fn: closePopup }] })
    }
  }

  // ── Set default ──
  const setDefault = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
    showPopup({ type: 'success', title: 'Default Updated ✅', body: 'This address is now your default.', icon: '📍', actions: [{ label: 'OK', variant: 'primary', fn: closePopup }] })
  }

  // ── Delete ──
  const deleteAddress = (a: Address) => {
    showPopup({
      type: 'confirm', title: 'Delete Address?',
      body: `Remove your ${a.label} address?\n${a.line1}, ${a.city}`,
      icon: '🗑️',
      actions: [
        { label: 'Delete', variant: 'danger', fn: () => {
          const filtered = addresses.filter(x => x.id !== a.id)
          // If deleted was default, make first remaining one default
          if (a.isDefault && filtered.length > 0) filtered[0].isDefault = true
          setAddresses(filtered)
          closePopup()
        }},
        { label: 'Cancel', variant: 'secondary', fn: closePopup },
      ],
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
            <span style={{ flex: 1, textAlign: 'center', fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Manage Address</span>
            <button onClick={openAdd} style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#EDFAF7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '24px' }}>

            {/* Info banner */}
            <div style={{ margin: '14px 14px 16px', background: '#EFF6FF', borderRadius: '16px', padding: '13px 16px', display: 'flex', gap: '10px', border: '1px solid #BFDBFE' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>📍</span>
              <div style={{ fontSize: '13px', color: '#1E40AF', lineHeight: 1.55 }}>
                Your <strong>default address</strong> is used for bookings and service requests by default.
              </div>
            </div>

            {/* Address count */}
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 16px 10px' }}>
              {addresses.length} Saved Address{addresses.length !== 1 ? 'es' : ''} · Max 5
            </div>

            {/* Empty state */}
            {addresses.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '52px' }}>🏠</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>No Addresses Saved</div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6 }}>Add your home, work, or other addresses for quick access during bookings.</div>
                <button onClick={openAdd} style={{ marginTop: '8px', padding: '12px 28px', background: '#0D9488', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  + Add First Address
                </button>
              </div>
            )}

            {/* Address cards */}
            {addresses.map(a => (
              <AddressCard
                key={a.id}
                address={a}
                onEdit={() => openEdit(a)}
                onDelete={() => deleteAddress(a)}
                onSetDefault={() => setDefault(a.id)}
              />
            ))}

            {/* Add button (when list has items) */}
            {addresses.length > 0 && addresses.length < 5 && (
              <div style={{ margin: '4px 14px 0' }}>
                <button onClick={openAdd}
                  style={{ width: '100%', padding: '14px', background: 'transparent', border: '2px dashed #CBD5E1', borderRadius: '18px', fontSize: '14px', fontWeight: 700, color: '#64748B', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add New Address
                </button>
              </div>
            )}

            {/* Max reached notice */}
            {addresses.length >= 5 && (
              <div style={{ margin: '4px 14px 0', background: '#FEF3C7', borderRadius: '14px', padding: '12px 16px', border: '1px solid #FDE68A', fontSize: '13px', color: '#92400E', fontWeight: 600, textAlign: 'center' }}>
                ⚠️ Maximum 5 addresses reached. Delete one to add more.
              </div>
            )}

            <div style={{ height: '16px' }} />
          </div>
        </div>

        <PopupLayer />
        <AddressSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onSave={saveAddress}
          initial={editAddress}
        />
      </div>
    </div>
  )
}