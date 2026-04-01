'use client'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

const COLORS = ['#0D9488', '#2563EB', '#D97706', '#DC2626', '#7C3AED']

export default function EmergencyContacts() {
  const { emergencyContacts } = useStore()
  const router = useRouter()

  if (emergencyContacts.length === 0) {
    return (
      <div style={{
        background: '#FEF3C7', borderRadius: '14px', padding: '13px 16px',
        border: '1px solid #FDE68A', fontSize: '13px', color: '#92400E', lineHeight: 1.55,
      }}>
        ⚠️ No emergency contacts added.{' '}
        <span
          onClick={() => router.push('/emergency')}
          style={{ color: '#D97706', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
        >
          Add now →
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {emergencyContacts.map((c, i) => {
        const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        return (
          <div key={c.id} style={{
            background: '#fff', borderRadius: '14px', padding: '11px 14px',
            display: 'flex', alignItems: 'center', gap: '12px',
            border: `1px solid ${c.isPrimary ? '#CCFBF1' : '#E2E8F0'}`,
          }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: COLORS[i % COLORS.length],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 800, color: '#fff', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{c.name}</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '1px' }}>{c.relation} · {c.phone}</div>
            </div>
            {c.isPrimary && (
              <span style={{
                background: '#EDFAF7', color: '#0D9488',
                fontSize: '10px', fontWeight: 700,
                padding: '3px 8px', borderRadius: '100px',
              }}>
                Primary
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}