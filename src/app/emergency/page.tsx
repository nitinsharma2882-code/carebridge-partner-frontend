'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import type { EmergencyContact } from '@/lib/types'

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
    <div onClick={(e) => { if (e.target === e.currentTarget) closePopup() }}
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

// ── Add / Edit Bottom Sheet ───────────────────────────────────────────────────
function ContactSheet({
  open, onClose, onSave, initial,
}: {
  open: boolean
  onClose: () => void
  onSave: (c: Omit<EmergencyContact, 'id'>) => void
  initial?: EmergencyContact | null
}) {
  const [name,     setName]     = useState(initial?.name     || '')
  const [phone,    setPhone]    = useState(initial?.phone    || '')
  const [relation, setRelation] = useState(initial?.relation || '')
  const [primary,  setPrimary]  = useState(initial?.isPrimary || false)

  const relations = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Colleague', 'Other']

  const save = () => {
    if (!name.trim() || !phone.trim() || !relation.trim()) return
    onSave({ name: name.trim(), phone: phone.trim(), relation, isPrimary: primary })
    onClose()
  }

  if (!open) return null

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    background: '#F8FAFC', border: '1.5px solid #E2E8F0',
    borderRadius: '12px', fontSize: '14px', color: '#0F172A',
    fontFamily: 'DM Sans, sans-serif', outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.55)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ background: '#fff', borderRadius: '28px 28px 0 0', padding: '0 20px 36px', maxHeight: '88%', overflowY: 'auto' }}>
        <div style={{ width: '36px', height: '4px', background: '#E2E8F0', borderRadius: '2px', margin: '14px auto 20px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.4px', marginBottom: '18px' }}>
          {initial ? 'Edit Contact' : 'Add Emergency Contact'}
        </h3>

        <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Full Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Meena Kumar" style={{ ...inp, marginBottom: '14px' }} />

        <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Phone Number *</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" inputMode="tel" style={{ ...inp, marginBottom: '14px' }} />

        <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>Relationship *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {relations.map(r => (
            <button key={r} onClick={() => setRelation(r)} style={{
              padding: '7px 16px', borderRadius: '100px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700, fontFamily: 'DM Sans, sans-serif',
              background: relation === r ? '#0D9488' : '#F1F5F9',
              color: relation === r ? '#fff' : '#475569',
              transition: 'all 0.15s',
            }}>{r}</button>
          ))}
        </div>

        {/* Primary toggle */}
        <div onClick={() => setPrimary(v => !v)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '13px 16px', marginBottom: '20px', cursor: 'pointer' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Set as Primary Contact</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Called first in an emergency</div>
          </div>
          <div style={{ width: '44px', height: '26px', borderRadius: '100px', background: primary ? '#0D9488' : '#CBD5E1', position: 'relative', flexShrink: 0, transition: 'background 0.25s' }}>
            <div style={{ position: 'absolute', top: '3px', left: primary ? '21px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </div>
        </div>

        <button onClick={save} disabled={!name || !phone || !relation}
          style={{ width: '100%', padding: '16px', background: (!name || !phone || !relation) ? '#CBD5E1' : '#0D9488', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: (!name || !phone || !relation) ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: '10px' }}>
          {initial ? 'Save Changes' : 'Add Contact'} →
        </button>
        <button onClick={onClose} style={{ width: '100%', padding: '15px', background: 'transparent', border: '1.5px solid #E2E8F0', borderRadius: '14px', color: '#64748B', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Contact Card ──────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#0D9488', '#2563EB', '#D97706', '#DC2626', '#7C3AED', '#059669']

function ContactCard({
  contact, index, onEdit, onDelete, onCall,
}: {
  contact: EmergencyContact; index: number
  onEdit: () => void; onDelete: () => void; onCall: () => void
}) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const initials = contact.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{ margin: '0 14px 10px', background: '#fff', borderRadius: '18px', padding: '14px 16px', border: `1.5px solid ${contact.isPrimary ? '#CCFBF1' : '#E2E8F0'}`, position: 'relative' }}>
      {contact.isPrimary && (
        <div style={{ position: 'absolute', top: '10px', right: '14px', background: '#EDFAF7', color: '#0D9488', fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '100px', letterSpacing: '0.3px' }}>
          ★ Primary
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '13px', marginBottom: '12px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>{contact.name}</div>
          <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{contact.relation} · {contact.phone}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onCall} style={{ flex: 1, padding: '10px', background: '#EDFAF7', border: '1px solid #CCFBF1', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: '#0D9488', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 8.7 2 2 0 014.11 6.5h3a2 2 0 012 1.72"/></svg>
          Call
        </button>
        <button onClick={onEdit} style={{ flex: 1, padding: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: '#475569', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button onClick={onDelete} style={{ width: '40px', padding: '10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const SEED: EmergencyContact[] = [
  { id: 'ec1', name: 'Meena Kumar',  phone: '+91 98765 11111', relation: 'Spouse',  isPrimary: true  },
  { id: 'ec2', name: 'Rajesh Kumar', phone: '+91 98765 22222', relation: 'Sibling', isPrimary: false },
]

export default function EmergencyPage() {
  const router = useRouter()
  const { showPopup, closePopup, emergencyContacts, setEmergencyContacts } = useStore()

  // Use store contacts if available, else seed
  const contacts = emergencyContacts.length > 0 ? emergencyContacts : SEED
  const setContacts = (c: EmergencyContact[]) => setEmergencyContacts(c)

  const [sheetOpen,   setSheetOpen]   = useState(false)
  const [editContact, setEditContact] = useState<EmergencyContact | null>(null)

  const openAdd  = () => { setEditContact(null); setSheetOpen(true) }
  const openEdit = (c: EmergencyContact) => { setEditContact(c); setSheetOpen(true) }

  const saveContact = (data: Omit<EmergencyContact, 'id'>) => {
    if (editContact) {
      // update
      const updated = contacts.map(c => c.id === editContact.id ? { ...c, ...data } : c)
      // ensure only one primary
      const final = data.isPrimary ? updated.map(c => ({ ...c, isPrimary: c.id === editContact.id })) : updated
      setContacts(final)
      showPopup({ type: 'success', title: 'Contact Updated ✅', body: `${data.name}'s details have been saved.`, icon: '✅', actions: [{ label: 'OK', variant: 'primary', fn: closePopup }] })
    } else {
      // add
      const newC: EmergencyContact = { ...data, id: `ec${Date.now()}` }
      const updated = data.isPrimary ? [...contacts.map(c => ({ ...c, isPrimary: false })), newC] : [...contacts, newC]
      setContacts(updated)
      showPopup({ type: 'success', title: 'Contact Added ✅', body: `${data.name} has been added as an emergency contact.`, icon: '✅', actions: [{ label: 'OK', variant: 'primary', fn: closePopup }] })
    }
  }

  const deleteContact = (c: EmergencyContact) => {
    showPopup({
      type: 'confirm', title: 'Remove Contact?',
      body: `Remove ${c.name} from your emergency contacts?`,
      icon: '🗑️',
      actions: [
        { label: 'Remove', variant: 'danger', fn: () => { setContacts(contacts.filter(x => x.id !== c.id)); closePopup() } },
        { label: 'Cancel', variant: 'secondary', fn: closePopup },
      ],
    })
  }

  const callContact = (c: EmergencyContact) => {
    showPopup({
      type: 'info', title: `Call ${c.name}?`,
      body: `${c.relation} · ${c.phone}`,
      icon: '📞',
      actions: [
        { label: '📞 Call Now', variant: 'primary',   fn: () => { closePopup(); showPopup({ type: 'success', title: 'Calling…', body: `Dialling ${c.phone}`, icon: '📞', actions: [{ label: 'End Call', variant: 'danger', fn: closePopup }] }) } },
        { label: 'Cancel',     variant: 'secondary', fn: closePopup },
      ],
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Mobile Frame */}
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
            <span style={{ flex: 1, textAlign: 'center', fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Emergency Contacts</span>
            <button onClick={openAdd} style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#EDFAF7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '24px' }}>

            {/* Info banner */}
            <div style={{ margin: '14px 14px 16px', background: '#FEF3C7', borderRadius: '16px', padding: '13px 16px', display: 'flex', gap: '10px', border: '1px solid #FDE68A' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
              <div style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.55 }}>
                These contacts will be <strong>notified immediately</strong> when you trigger an SOS alert, along with your live location.
              </div>
            </div>

            {/* Contact count */}
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 16px 10px' }}>
              {contacts.length} Contact{contacts.length !== 1 ? 's' : ''} · Max 5
            </div>

            {/* Contact cards */}
            {contacts.map((c, i) => (
              <ContactCard
                key={c.id} contact={c} index={i}
                onEdit={() => openEdit(c)}
                onDelete={() => deleteContact(c)}
                onCall={() => callContact(c)}
              />
            ))}

            {/* Add button */}
            {contacts.length < 5 && (
              <div style={{ margin: '4px 14px 0' }}>
                <button onClick={openAdd}
                  style={{ width: '100%', padding: '14px', background: 'transparent', border: '2px dashed #CBD5E1', borderRadius: '18px', fontSize: '14px', fontWeight: 700, color: '#64748B', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Emergency Contact
                </button>
              </div>
            )}

            {/* National emergency numbers */}
            <div style={{ margin: '16px 14px 0', background: '#fff', borderRadius: '18px', padding: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>National Emergency Numbers</div>
              {[
                { icon: '🚨', label: 'Emergency Helpline', num: '112', color: '#DC2626' },
                { icon: '🚑', label: 'Ambulance',          num: '108', color: '#D97706' },
                { icon: '👮', label: 'Police',             num: '100', color: '#2563EB' },
                { icon: '🔥', label: 'Fire Brigade',       num: '101', color: '#EA580C' },
              ].map((e, i, arr) => (
                <div key={e.num} onClick={() => callContact({ id: e.num, name: e.label, phone: e.num, relation: 'Emergency Service' })}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid #F1F5F9' : 'none', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px' }}>{e.icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{e.label}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: e.color, fontVariantNumeric: 'tabular-nums' }}>{e.num}</span>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#EDFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 8.7 2 2 0 014.11 6.5h3a2 2 0 012 1.72"/></svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: '16px' }} />
          </div>
        </div>

        <PopupLayer />
        <ContactSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onSave={saveContact}
          initial={editContact}
        />
      </div>
    </div>
  )
}