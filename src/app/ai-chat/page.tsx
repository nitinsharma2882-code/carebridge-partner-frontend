'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import BottomNav from '@/components/BottomNav'
import MobileFrame from '@/components/MobileFrame'

interface Message {
  role: 'user' | 'assistant'
  content: string
  time: string
}

const QUICK_CHIPS = [
  'How to handle a patient?',
  'Escalation process',
  'Cancel a booking',
  'Payment issues',
]

const WELCOME: Message = {
  role: 'assistant',
  content: "Hi! I'm your CareBridge Assistant 👋\n\nI can help you with booking queries, patient handling, escalations, and more. How can I assist you today?",
  time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
}

export default function AIChatPage() {
  const router  = useRouter()
  const { showPopup, closePopup } = useStore()
  const [messages,  setMessages]  = useState<Message[]>([WELCOME])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim(); if (!trimmed || loading) return
    setInput('')
    const time = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
    const userMsg: Message = { role:'user', content:trimmed, time }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ messages:[...messages, userMsg] }),
      })
      const data = await response.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || "I'm here to help! Could you please rephrase your question?",
        time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't connect right now. Please try again in a moment.",
        time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
      }])
    }
    setLoading(false)
  }

  return (
    <MobileFrame>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>

        {/* Status bar */}
        <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
          <span style={{ fontSize:'11px', fontWeight:700, color:'#0F172A' }}>5G</span>
        </div>

        {/* Header */}
        <div style={{ background:'#fff', padding:'10px 16px 14px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <button onClick={() => router.back()} style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#0D9488,#14b8a6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'16px', fontWeight:800, color:'#0F172A' }}>CareBridge AI</div>
            <div style={{ fontSize:'11px', color:'#16A34A', fontWeight:600, display:'flex', alignItems:'center', gap:'4px' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#16A34A' }} />Online · Always here to help
            </div>
          </div>
          <button onClick={() => {
            showPopup({ type:'confirm', title:'Clear Chat?', body:'This will clear all messages.\nThis cannot be undone.', icon:'🗑️',
              actions:[
                { label:'Clear', variant:'danger',    fn:() => { setMessages([WELCOME]); closePopup() } },
                { label:'Cancel', variant:'secondary', fn:closePopup },
              ],
            })
          }} style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
          </button>
        </div>

        {/* Quick chips */}
        <div style={{ background:'#F8FAFC', padding:'8px 14px', display:'flex', gap:'8px', overflowX:'auto', flexShrink:0, borderBottom:'1px solid #E2E8F0' }}>
          {QUICK_CHIPS.map(chip => (
            <button key={chip} onClick={() => sendMessage(chip)}
              style={{ padding:'6px 12px', borderRadius:'100px', border:'1px solid #E2E8F0', background:'#fff', fontSize:'11px', fontWeight:600, color:'#475569', cursor:'pointer', flexShrink:0, fontFamily:'DM Sans, sans-serif', whiteSpace:'nowrap' }}>
              {chip}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', paddingBottom:'8px', background:'#F8FAFC' }}>
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user'
            return (
              <div key={i} style={{ display:'flex', justifyContent:isUser?'flex-end':'flex-start', marginBottom:'12px' }}>
                {!isUser && (
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,#0D9488,#14b8a6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginRight:'8px', alignSelf:'flex-end' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  </div>
                )}
                <div style={{ maxWidth:'78%' }}>
                  <div style={{ padding:'11px 14px', borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isUser ? '#0D9488' : '#fff', color: isUser ? '#fff' : '#0F172A', fontSize:'13px', lineHeight:1.6, border: isUser ? 'none' : '1px solid #E2E8F0', whiteSpace:'pre-wrap' }}>
                    {msg.content}
                  </div>
                  <div style={{ fontSize:'10px', color:'#94A3B8', marginTop:'4px', textAlign:isUser?'right':'left', fontWeight:600 }}>{msg.time}</div>
                </div>
              </div>
            )
          })}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,#0D9488,#14b8a6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:'18px 18px 18px 4px', padding:'12px 16px', display:'flex', gap:'4px', alignItems:'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#94A3B8', animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{ background:'#fff', borderTop:'1px solid #E2E8F0', padding:'10px 14px 14px', display:'flex', gap:'8px', alignItems:'flex-end', flexShrink:0 }}>
          <div style={{ flex:1, background:'#F8FAFC', borderRadius:'20px', border:'1.5px solid #E2E8F0', padding:'10px 16px', display:'flex', alignItems:'center' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              placeholder="Ask me anything…"
              rows={1}
              style={{ flex:1, border:'none', background:'transparent', fontSize:'13px', color:'#0F172A', resize:'none', outline:'none', fontFamily:'DM Sans, sans-serif', lineHeight:1.5, maxHeight:'80px' }}
            />
          </div>
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
            style={{ width:'42px', height:'42px', borderRadius:'50%', background: input.trim() && !loading ? '#0D9488' : '#E2E8F0', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', flexShrink:0, transition:'background 0.2s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>

      <BottomNav active="AI Chat" />
      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); }
          40%          { transform: translateY(-6px); }
        }
      `}</style>
    </MobileFrame>
  )
}