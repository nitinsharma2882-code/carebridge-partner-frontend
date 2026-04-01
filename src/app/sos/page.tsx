'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import MobileFrame from '@/components/MobileFrame'

type Phase = 'countdown' | 'connecting' | 'connected'

interface JourneyStep {
  id:     string
  label:  string
  sub:    string
  status: 'done' | 'active' | 'pending'
}

const AGENT = { name: 'Amit Kumar', role: 'Emergency Response · CareBridge', initials: 'AK' }

export default function SOSPage() {
  const [phase,     setPhase]     = useState<Phase>('countdown')
  const [countdown, setCountdown] = useState(10)
  const [seconds,   setSeconds]   = useState(0)
  const [steps,     setSteps]     = useState<JourneyStep[]>([
    { id:'s1', label:'Emergency team alerted',        sub:'Your SOS was received instantly',          status:'pending' },
    { id:'s2', label:'Location shared with contacts', sub:'Family notified with your live location',  status:'pending' },
    { id:'s3', label:'CareBridge agent connecting…',  sub:'',                                         status:'pending' },
    { id:'s4', label:'Ambulance assistance',          sub:'Request via agent if needed',              status:'pending' },
  ])

  const router = useRouter()
  const { setSOS } = useStore()

  // ── 10-second countdown ──
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) { startConnecting(); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, phase])

  // ── Connecting — reveal steps progressively ──
  const startConnecting = () => {
    setSOS(true)
    setPhase('connecting')
    updateStep('s1', 'done')
    setTimeout(() => updateStep('s2', 'done'), 1500)
    setTimeout(() => {
      updateStep('s3', 'done', 'CareBridge agent connected', 'Amit Kumar is assisting you')
      setPhase('connected')
    }, 3500)
  }

  const updateStep = (id: string, status: JourneyStep['status'], label?: string, sub?: string) => {
    setSteps(prev => prev.map(s =>
      s.id === id
        ? { ...s, status, ...(label ? { label } : {}), ...(sub !== undefined ? { sub } : {}) }
        : s
    ))
  }

  // ── Seconds counter while connected ──
  useEffect(() => {
    if (phase !== 'connected') return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const cancel = () => { setSOS(false); router.back() }

  const requestAmbulance = () =>
    updateStep('s4', 'done', 'Ambulance assistance', 'Nearest ambulance dispatched')

  return (
    <MobileFrame hideSOS>
      {/* Full-screen red gradient — fills the entire frame */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg,#7f1d1d,#DC2626 55%,#ef4444)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>

        {/* Back to Home */}
        <div style={{ paddingTop: '48px', paddingLeft: '20px', paddingBottom: '8px', flexShrink: 0 }}>
          <button onClick={cancel} style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.18)', border:'none', borderRadius:'100px', padding:'8px 16px', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            <span style={{ fontSize:'13px', fontWeight:700, color:'#fff' }}>Back to Home</span>
          </button>
        </div>

        {/* ══ COUNTDOWN ══ */}
        {phase === 'countdown' && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 28px 40px', gap:'22px', textAlign:'center' }}>
            <div style={{ position:'relative', width:'160px', height:'160px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.25)', animation:'sosRing 1.5s ease-in-out infinite' }} />
              <div style={{ position:'absolute', inset:'12px', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.15)' }} />
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <span style={{ fontSize:'64px', fontWeight:900, color:'#fff', lineHeight:1 }}>{countdown}</span>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', fontWeight:600, marginTop:'2px' }}>seconds</span>
              </div>
            </div>

            <div>
              <h1 style={{ fontSize:'26px', fontWeight:900, color:'#fff', margin:0, letterSpacing:'-0.5px' }}>Connecting You Now</h1>
              <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.8)', marginTop:'10px', lineHeight:1.65 }}>
                Our emergency team has been alerted. Hold on<br/>while we connect you to an agent.
              </p>
            </div>

            <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'8px' }}>
              {[
                { label:'Emergency team alerted',                   done:true  },
                { label:'Location shared with contacts',             done:true  },
                { label:'CareBridge agent connecting…',             done:false },
                { label:'Ambulance assistance — after agent call',  done:false },
              ].map((s, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.12)', borderRadius:'14px', padding:'13px 16px', display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', background: s.done?'#22c55e':'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {s.done
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:'rgba(255,255,255,0.3)' }} />
                    }
                  </div>
                  <span style={{ fontSize:'13px', fontWeight: s.done?700:500, color: s.done?'#fff':'rgba(255,255,255,0.55)' }}>{s.label}</span>
                </div>
              ))}
            </div>

            <button onClick={cancel} style={{ width:'100%', padding:'15px', background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,255,255,0.35)', borderRadius:'14px', color:'#fff', fontSize:'15px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
              Cancel SOS
            </button>
          </div>
        )}

        {/* ══ CONNECTING ══ */}
        {phase === 'connecting' && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 28px 40px', gap:'22px', textAlign:'center' }}>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', border:'3px solid rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', animation:'sosRing 1.5s ease-in-out infinite' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.7 2 2 0 014.11 2.5h3a2 2 0 012 1.72"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize:'24px', fontWeight:900, color:'#fff', margin:0 }}>Connecting You Now</h1>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.75)', marginTop:'8px', lineHeight:1.6 }}>
                Our emergency team has been alerted. Hold on<br/>while we connect you to an agent.
              </p>
            </div>
            <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'8px' }}>
              {steps.map(s => (
                <div key={s.id} style={{ background:'rgba(255,255,255,0.12)', borderRadius:'14px', padding:'13px 16px', display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', background: s.status==='done'?'#22c55e':s.status==='active'?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 0.3s' }}>
                    {s.status==='done'
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : s.status==='active'
                        ? <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:'#fff', animation:'blink 1s infinite' }} />
                        : <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:'rgba(255,255,255,0.2)' }} />
                    }
                  </div>
                  <span style={{ fontSize:'13px', fontWeight: s.status==='done'?700:500, color: s.status==='pending'?'rgba(255,255,255,0.45)':'#fff' }}>{s.label}</span>
                </div>
              ))}
            </div>
            <button onClick={cancel} style={{ width:'100%', padding:'15px', background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,255,255,0.35)', borderRadius:'14px', color:'#fff', fontSize:'15px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
              Cancel SOS
            </button>
          </div>
        )}

        {/* ══ CONNECTED ══ */}
        {phase === 'connected' && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'12px 16px 32px', gap:'12px' }}>

            {/* Connected hero */}
            <div style={{ background:'rgba(255,255,255,0.12)', borderRadius:'20px', padding:'20px', textAlign:'center', border:'1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ width:'60px', height:'60px', borderRadius:'50%', background:'rgba(34,197,94,0.25)', border:'2px solid #22c55e', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.7 2 2 0 014.11 2.5h3a2 2 0 012 1.72"/>
                </svg>
              </div>
              <div style={{ fontSize:'20px', fontWeight:900, color:'#fff', letterSpacing:'-0.4px' }}>Connected to Agent</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.75)', marginTop:'5px', lineHeight:1.5 }}>
                You are now connected with our emergency response team.
              </div>
              <div style={{ fontSize:'22px', fontWeight:900, color:'#fff', marginTop:'8px', letterSpacing:'1px' }}>
                {fmtTime(seconds)}
              </div>
            </div>

            {/* Agent card */}
            <div style={{ background:'rgba(255,255,255,0.12)', borderRadius:'18px', padding:'16px', border:'1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'10px' }}>Your Emergency Agent</div>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', fontWeight:800, color:'#fff', flexShrink:0 }}>
                  {AGENT.initials}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'15px', fontWeight:800, color:'#fff' }}>{AGENT.name}</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)', marginTop:'2px' }}>{AGENT.role}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:'5px', marginTop:'4px' }}>
                    <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e', animation:'livePulse 1.5s infinite' }} />
                    <span style={{ fontSize:'11px', fontWeight:700, color:'#22c55e' }}>Active on call</span>
                  </div>
                </div>
                <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#22c55e', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.7 2 2 0 014.11 2.5h3a2 2 0 012 1.72"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* SOS Journey */}
            <div style={{ background:'rgba(255,255,255,0.12)', borderRadius:'18px', padding:'16px', border:'1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'12px' }}>SOS Journey</div>
              <div style={{ display:'flex', flexDirection:'column' }}>
                {steps.map((s, i) => (
                  <div key={s.id} style={{ display:'flex', gap:'12px', paddingBottom: i < steps.length-1 ? '14px' : 0, position:'relative' }}>
                    {i < steps.length-1 && (
                      <div style={{ position:'absolute', left:'13px', top:'28px', width:'2px', height:'calc(100% - 14px)', background: s.status==='done'?'rgba(34,197,94,0.4)':'rgba(255,255,255,0.12)' }} />
                    )}
                    <div style={{ width:'28px', height:'28px', borderRadius:'50%', background: s.status==='done'?'#22c55e':'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:1 }}>
                      {s.status==='done'
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'rgba(255,255,255,0.3)' }} />
                      }
                    </div>
                    <div style={{ flex:1, paddingTop:'3px' }}>
                      <div style={{ fontSize:'13px', fontWeight: s.status==='done'?700:500, color: s.status==='done'?'#fff':'rgba(255,255,255,0.45)' }}>{s.label}</div>
                      {s.sub && <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', marginTop:'2px' }}>{s.sub}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ambulance CTA */}
            {steps.find(s => s.id==='s4')?.status !== 'done' && (
              <div style={{ background:'rgba(255,255,255,0.12)', borderRadius:'18px', padding:'16px', border:'1px solid rgba(255,255,255,0.18)' }}>
                <div style={{ fontSize:'15px', fontWeight:800, color:'#fff', marginBottom:'4px' }}>Need an Ambulance?</div>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', marginBottom:'12px', lineHeight:1.5 }}>Our agent can arrange the nearest ambulance for you.</div>
                <button onClick={requestAmbulance} style={{ width:'100%', padding:'14px', background:'rgba(255,255,255,0.18)', border:'1.5px solid rgba(255,255,255,0.35)', borderRadius:'14px', color:'#fff', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                  🚑 Request Ambulance
                </button>
              </div>
            )}

            {steps.find(s => s.id==='s4')?.status === 'done' && (
              <div style={{ background:'rgba(34,197,94,0.18)', borderRadius:'18px', padding:'14px 16px', border:'1px solid rgba(34,197,94,0.4)', display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'22px' }}>🚑</span>
                <div>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'#fff' }}>Ambulance Dispatched</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', marginTop:'2px' }}>Nearest ambulance is on the way</div>
                </div>
              </div>
            )}

            {/* Cancel */}
            <button onClick={cancel} style={{ width:'100%', padding:'15px', background:'rgba(255,255,255,0.12)', border:'2px solid rgba(255,255,255,0.3)', borderRadius:'14px', color:'#fff', fontSize:'15px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif', marginTop:'4px' }}>
              Cancel SOS
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes sosRing  { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.08);opacity:0.8;} }
        @keyframes livePulse{ 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5);} 60%{box-shadow:0 0 0 6px rgba(34,197,94,0);} }
        @keyframes blink    { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
      `}</style>
    </MobileFrame>
  )
}