'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

const STORAGE_KEY = 'cb_assistant_accessibility'

interface AccessibilitySettings {
  fontSize:        'small' | 'medium' | 'large' | 'xlarge'
  highContrast:    boolean
  boldText:        boolean
  reduceMotion:    boolean
  largeButtons:    boolean
  screenReader:    boolean
  hapticFeedback:  boolean
}

const DEFAULTS: AccessibilitySettings = {
  fontSize:       'medium',
  highContrast:   false,
  boldText:       false,
  reduceMotion:   false,
  largeButtons:   false,
  screenReader:   false,
  hapticFeedback: true,
}

const FONT_OPTIONS: { key: AccessibilitySettings['fontSize']; label: string; size: string }[] = [
  { key: 'small',   label: 'Small',   size: '13px' },
  { key: 'medium',  label: 'Medium',  size: '15px' },
  { key: 'large',   label: 'Large',   size: '17px' },
  { key: 'xlarge',  label: 'X-Large', size: '20px' },
]

// ── Popup ─────────────────────────────────────────────────────────────────────
function PopupLayer() {
  const { popup, closePopup } = useStore()
  if (!popup) return null
  const iconBg: Record<string,string> = { success:'#DCFCE7', warning:'#FEF3C7', error:'#FEE2E2', confirm:'#EDE9FE', info:'#EDFAF7' }
  const btnBg:  Record<string,string> = { primary:'#0D9488', secondary:'#F1F5F9', danger:'#DC2626', warning:'#D97706' }
  const btnClr: Record<string,string> = { primary:'#fff', secondary:'#475569', danger:'#fff', warning:'#fff' }
  return (
    <div onClick={e => { if (e.target === e.currentTarget) closePopup() }}
      style={{ position:'absolute', inset:0, zIndex:100, background:'rgba(15,23,42,0.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'22px', width:'100%', overflow:'hidden' }}>
        <div style={{ padding:'28px 20px 0', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:'68px', height:'68px', borderRadius:'50%', background:iconBg[popup.type], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', marginBottom:'12px' }}>
            {popup.icon || 'ℹ️'}
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

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{ width:'44px', height:'26px', borderRadius:'100px', background: on ? '#0D9488' : '#CBD5E1', position:'relative', cursor:'pointer', flexShrink:0, transition:'background 0.25s' }}>
      <div style={{ position:'absolute', top:'3px', left: on ? '21px' : '3px', width:'20px', height:'20px', borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'left 0.25s cubic-bezier(0.34,1.3,0.64,1)' }} />
    </div>
  )
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', padding:'16px 0 8px' }}>
      {label}
    </div>
  )
}

// ── Row ───────────────────────────────────────────────────────────────────────
function Row({ icon, label, sublabel, toggled, onToggle, last }: {
  icon: string; label: string; sublabel?: string
  toggled: boolean; onToggle: () => void; last?: boolean
}) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'13px', padding:'13px 16px', borderBottom: last ? 'none' : '1px solid #F1F5F9', background:'#fff' }}>
      <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px', flexShrink:0 }}>
        {icon}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'14px', fontWeight:600, color:'#0F172A' }}>{label}</div>
        {sublabel && <div style={{ fontSize:'12px', color:'#94A3B8', marginTop:'2px' }}>{sublabel}</div>}
      </div>
      <Toggle on={toggled} onChange={onToggle} />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AccessibilityPage() {
  const router = useRouter()
  const { showPopup, closePopup } = useStore()

  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULTS)
  const [saved,    setSaved]    = useState<AccessibilitySettings>(DEFAULTS)
  const [hasChanges, setHasChanges] = useState(false)

  // Load persisted settings
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AccessibilitySettings
        setSettings(parsed)
        setSaved(parsed)
      }
    } catch {}
  }, [])

  // Track changes
  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(saved))
  }, [settings, saved])

  const update = <K extends keyof AccessibilitySettings>(key: K, val: AccessibilitySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: val }))
  }

  const toggle = (key: keyof AccessibilitySettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const save = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    }
    setSaved(settings)
    setHasChanges(false)
    showPopup({
      type:'success', title:'Settings Saved ✅',
      body:'Your accessibility preferences have been applied.',
      icon:'♿',
      actions:[{ label:'Done', variant:'primary', fn: closePopup }],
    })
  }

  const reset = () => {
    showPopup({
      type:'confirm', title:'Reset to Default?',
      body:'All accessibility settings will be reset to their default values.',
      icon:'🔄',
      actions:[
        { label:'Reset', variant:'danger', fn: () => {
          setSettings(DEFAULTS)
          if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
          setSaved(DEFAULTS)
          closePopup()
          showPopup({ type:'success', title:'Reset Done ✅', body:'Accessibility settings have been reset.', icon:'✅', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
        }},
        { label:'Cancel', variant:'secondary', fn: closePopup },
      ],
    })
  }

  // Preview font size
  const previewSize = FONT_OPTIONS.find(f => f.key === settings.fontSize)?.size || '15px'

  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1e', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{
        width:'390px', height:'844px', borderRadius:'48px', overflow:'hidden',
        position:'relative', flexShrink:0,
        boxShadow:'0 0 0 10px #1e293b, 0 0 0 12px #334155, 0 40px 80px rgba(0,0,0,0.8)',
        background: settings.highContrast ? '#000' : '#F8FAFC',
      }}>

        {/* Notch */}
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'126px', height:'34px', background:'#111827', borderRadius:'0 0 20px 20px', zIndex:50 }} />

        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>

          {/* Status bar */}
          <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background: settings.highContrast ? '#111' : '#fff', flexShrink:0 }}>
            <span style={{ fontSize:'12px', fontWeight:700, color: settings.highContrast ? '#fff' : '#0F172A' }}>9:41</span>
            <span style={{ fontSize:'11px', fontWeight:700, color: settings.highContrast ? '#fff' : '#0F172A' }}>5G</span>
          </div>

          {/* Header */}
          <div style={{ height:'56px', background: settings.highContrast ? '#111' : '#fff', display:'flex', alignItems:'center', padding:'0 16px', gap:'10px', borderBottom:`1px solid ${settings.highContrast?'#333':'#E2E8F0'}`, flexShrink:0 }}>
            <button onClick={() => router.back()} style={{ width:'38px', height:'38px', borderRadius:'50%', background: settings.highContrast?'#222':'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <polyline points="15 18 9 12 15 6" stroke={settings.highContrast?'#fff':'#334155'} strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
            <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color: settings.highContrast?'#fff':'#0F172A' }}>Accessibility</span>
            {hasChanges ? (
              <button onClick={save} style={{ background:'#0D9488', border:'none', borderRadius:'10px', padding:'0 14px', height:'34px', fontSize:'13px', fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
                Save
              </button>
            ) : (
              <div style={{ width:'38px' }} />
            )}
          </div>

          {/* Scrollable */}
          <div style={{ flex:1, overflowY:'auto', padding:'0 14px 32px' }}>

            {/* Preview card */}
            <div style={{ margin:'14px 0', background: settings.highContrast ? '#111' : '#fff', borderRadius:'18px', padding:'16px', border:`1px solid ${settings.highContrast?'#333':'#E2E8F0'}` }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'10px' }}>Live Preview</div>
              <div style={{ background: settings.highContrast ? '#000' : '#F8FAFC', borderRadius:'14px', padding:'14px 16px', border:`1px solid ${settings.highContrast?'#555':'#E2E8F0'}` }}>
                <div style={{ fontSize: previewSize, fontWeight: settings.boldText ? 800 : 500, color: settings.highContrast ? '#fff' : '#0F172A', marginBottom:'4px' }}>
                  CareBridge Partner
                </div>
                <div style={{ fontSize:`calc(${previewSize} - 2px)`, fontWeight: settings.boldText ? 700 : 400, color: settings.highContrast ? '#ccc' : '#64748B', lineHeight:1.5 }}>
                  Adjust settings to see how the app will look for you.
                </div>
                <div style={{ marginTop:'10px', display:'flex', gap:'8px' }}>
                  <div style={{ flex:1, background: settings.highContrast?'#0D9488':'#EDFAF7', borderRadius: settings.largeButtons?'12px':'8px', padding: settings.largeButtons?'10px':'7px', textAlign:'center' }}>
                    <span style={{ fontSize: settings.largeButtons?'13px':'11px', fontWeight:700, color: settings.highContrast?'#fff':'#0D9488' }}>Accept</span>
                  </div>
                  <div style={{ flex:1, background: settings.highContrast?'#333':'#F1F5F9', borderRadius: settings.largeButtons?'12px':'8px', padding: settings.largeButtons?'10px':'7px', textAlign:'center' }}>
                    <span style={{ fontSize: settings.largeButtons?'13px':'11px', fontWeight:700, color: settings.highContrast?'#fff':'#475569' }}>Decline</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Font size */}
            <SectionHeader label="Text Size" />
            <div style={{ background:'#fff', borderRadius:'18px', padding:'16px', border:'1px solid #E2E8F0', marginBottom:'4px' }}>
              <div style={{ fontSize:'13px', fontWeight:600, color:'#475569', marginBottom:'12px' }}>Choose a comfortable reading size</div>
              <div style={{ display:'flex', gap:'8px' }}>
                {FONT_OPTIONS.map(f => (
                  <button key={f.key} onClick={() => update('fontSize', f.key)} style={{
                    flex:1, padding:'10px 4px', borderRadius:'12px', border:'none', cursor:'pointer',
                    background: settings.fontSize === f.key ? '#0D9488' : '#F1F5F9',
                    fontFamily:'DM Sans, sans-serif', transition:'all 0.15s',
                    display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
                  }}>
                    <span style={{ fontSize: f.size, fontWeight:700, color: settings.fontSize === f.key ? '#fff' : '#475569', lineHeight:1 }}>A</span>
                    <span style={{ fontSize:'9px', fontWeight:700, color: settings.fontSize === f.key ? 'rgba(255,255,255,0.8)' : '#94A3B8' }}>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual */}
            <SectionHeader label="Visual" />
            <div style={{ background:'#fff', borderRadius:'18px', overflow:'hidden', border:'1px solid #E2E8F0' }}>
              <Row icon="🌑" label="High Contrast"   sublabel="Dark background with white text"   toggled={settings.highContrast}  onToggle={() => toggle('highContrast')} />
              <Row icon="𝗕"  label="Bold Text"       sublabel="Makes all text heavier and clearer" toggled={settings.boldText}      onToggle={() => toggle('boldText')} />
              <Row icon="🔲" label="Large Buttons"   sublabel="Increases tap target sizes"         toggled={settings.largeButtons}  onToggle={() => toggle('largeButtons')} last />
            </div>

            {/* Motion */}
            <SectionHeader label="Motion & Feedback" />
            <div style={{ background:'#fff', borderRadius:'18px', overflow:'hidden', border:'1px solid #E2E8F0' }}>
              <Row icon="🎞️" label="Reduce Motion"   sublabel="Minimises animations and transitions" toggled={settings.reduceMotion}  onToggle={() => toggle('reduceMotion')} />
              <Row icon="📳" label="Haptic Feedback" sublabel="Vibrate on button taps"               toggled={settings.hapticFeedback} onToggle={() => toggle('hapticFeedback')} last />
            </div>

            {/* Assistance */}
            <SectionHeader label="Assistance" />
            <div style={{ background:'#fff', borderRadius:'18px', overflow:'hidden', border:'1px solid #E2E8F0' }}>
              <Row icon="🔊" label="Screen Reader Support" sublabel="Optimised labels for screen readers" toggled={settings.screenReader} onToggle={() => toggle('screenReader')} last />
            </div>

            {/* Save + reset */}
            <div style={{ marginTop:'20px', display:'flex', flexDirection:'column', gap:'10px' }}>
              {hasChanges && (
                <button onClick={save}
                  style={{ width:'100%', padding:'16px', background:'#0D9488', border:'none', borderRadius:'14px', color:'#fff', fontSize:'16px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
                  Save Preferences →
                </button>
              )}
              <button onClick={reset}
                style={{ width:'100%', padding:'15px', background:'transparent', border:'1.5px solid #E2E8F0', borderRadius:'14px', color:'#64748B', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
                Reset to Default
              </button>
            </div>
          </div>
        </div>

        <PopupLayer />
      </div>
    </div>
  )
}