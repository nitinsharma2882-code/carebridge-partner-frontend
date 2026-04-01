'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import MobileFrame from '@/components/MobileFrame'
import BottomNav from '@/components/BottomNav'

type Notif = { id:string; icon:string; iconBg:string; title:string; body:string; time:string; unread:boolean; action?:{label:string;href:string} }

const INITIAL: Notif[] = [
  { id:'n1', icon:'💰', iconBg:'#DCFCE7', title:'Payment received!',      body:'₹320 credited for Elder Care with Priya Kapoor',           time:'9:45 AM · Just now', unread:true,  action:{label:'View Earnings',href:'/earnings'} },
  { id:'n2', icon:'📋', iconBg:'#EFF6FF', title:'New booking request',    body:'Elder care · Priya Kapoor · 2.4 km · ₹320',               time:'9:30 AM',            unread:true,  action:{label:'View Request',href:'/booking'} },
  { id:'n3', icon:'✅', iconBg:'#EDFAF7', title:'Trip completed',          body:'Nursing Care trip ended. Priya rated you ★★★★★',          time:'9:10 AM',            unread:false, action:{label:'View Earnings',href:'/earnings'} },
  { id:'n4', icon:'⏳', iconBg:'#FEF3C7', title:'Document under review',  body:'Care Certificate is being verified. Allow 24–48 hrs.',     time:'Yesterday, 5:30 PM', unread:false, action:{label:'View Profile',href:'/profile'} },
  { id:'n5', icon:'🏦', iconBg:'#DCFCE7', title:'Weekly payout processed',body:'₹7,640 transferred to SBI •••• 4521',                    time:'Yesterday, 10:00 AM',unread:false, action:{label:'View Earnings',href:'/earnings'} },
  { id:'n6', icon:'❌', iconBg:'#FEE2E2', title:'Request expired',         body:'Physio Assist request from Neha expired at 8:05 AM',       time:'Yesterday, 8:05 AM', unread:false },
  { id:'n7', icon:'🔄', iconBg:'#EDE9FE', title:'App Update Available',   body:'CareBridge v2.5 — new features & bug fixes',              time:'2 days ago',         unread:false, action:{label:'Update Now',href:'#'} },
]

function PopupLayer() {
  const { popup, closePopup } = useStore()
  if (!popup) return null
  const iconBg: Record<string,string> = { success:'#DCFCE7', warning:'#FEF3C7', error:'#FEE2E2', confirm:'#EDE9FE', info:'#EDFAF7' }
  const btnBg:  Record<string,string> = { primary:'#0D9488', secondary:'#F1F5F9', danger:'#DC2626', warning:'#D97706' }
  const btnClr: Record<string,string> = { primary:'#fff', secondary:'#475569', danger:'#fff', warning:'#fff' }
  return (
    <div onClick={e=>{ if(e.target===e.currentTarget) closePopup() }}
      style={{ position:'absolute', inset:0, zIndex:100, background:'rgba(15,23,42,0.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'22px', width:'100%', overflow:'hidden' }}>
        <div style={{ padding:'28px 20px 0', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:'68px', height:'68px', borderRadius:'50%', background:iconBg[popup.type], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', marginBottom:'12px' }}>{popup.icon||'📢'}</div>
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

function NotifItem({ n, onClick }: { n:Notif; onClick:()=>void }) {
  return (
    <div onClick={onClick} style={{ margin:'0 14px 8px', borderRadius:'16px', padding:'13px 14px', display:'flex', gap:'12px', border:`1px solid ${n.unread?'#CCFBF1':'#E2E8F0'}`, background:n.unread?'#EDFAF7':'#fff', cursor:'pointer' }}>
      <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:n.iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>{n.icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'14px', fontWeight:700, color:'#0F172A', display:'flex', alignItems:'center', gap:'6px' }}>
          {n.title}
          {n.unread&&<div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#0D9488', flexShrink:0 }} />}
        </div>
        <div style={{ fontSize:'13px', color:'#64748B', marginTop:'2px', lineHeight:1.45 }}>{n.body}</div>
        <div style={{ fontSize:'11px', fontWeight:600, marginTop:'6px', color:n.unread?'#0D9488':'#94A3B8' }}>{n.time}</div>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL)
  const { showPopup, closePopup } = useStore()
  const router = useRouter()
  const unreadCount = notifs.filter(n => n.unread).length

  const markAllRead = () => {
    setNotifs(notifs.map(n => ({ ...n, unread:false })))
    showPopup({ type:'success', title:'All Caught Up! ✅', body:'All notifications have been marked as read.', icon:'✅', actions:[{ label:'OK', variant:'primary', fn:closePopup }] })
  }

  const openNotif = (n: Notif) => {
    setNotifs(prev => prev.map(x => x.id===n.id ? {...x,unread:false} : x))
    showPopup({ type:'info', title:n.title, body:n.body+`\n\n🕐 ${n.time}`, icon:n.icon,
      actions:[
        ...(n.action?[{ label:n.action.label, variant:'primary' as const, fn:()=>{ closePopup(); router.push(n.action!.href) } }]:[]),
        { label:'Dismiss', variant:'secondary' as const, fn:closePopup },
      ],
    })
  }

  const today     = notifs.filter(n => n.time.includes('AM')||n.time.includes('PM')&&!n.time.includes('Yesterday'))
  const yesterday = notifs.filter(n => n.time.includes('Yesterday'))
  const older     = notifs.filter(n => n.time.includes('days ago'))

  return (
    <MobileFrame>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>

        <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
        </div>

        <div style={{ height:'56px', background:'#fff', display:'flex', alignItems:'center', padding:'0 16px', gap:'10px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <button onClick={()=>router.back()} style={{ width:'38px', height:'38px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>
            Notifications
            {unreadCount>0&&<span style={{ marginLeft:'8px', background:'#DC2626', color:'#fff', fontSize:'11px', fontWeight:700, padding:'2px 7px', borderRadius:'100px' }}>{unreadCount}</span>}
          </span>
          {unreadCount>0
            ? <button onClick={markAllRead} style={{ background:'#EDFAF7', border:'none', borderRadius:'8px', padding:'0 10px', height:'32px', fontSize:'11px', fontWeight:700, color:'#0D9488', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>All read</button>
            : <div style={{ width:'38px' }} />
          }
        </div>

        <div style={{ flex:1, overflowY:'auto', paddingBottom:'90px' }}>
          {today.length>0&&<><div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', padding:'14px 16px 8px' }}>Today</div>{today.map(n=><NotifItem key={n.id} n={n} onClick={()=>openNotif(n)} />)}</>}
          {yesterday.length>0&&<><div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', padding:'14px 16px 8px' }}>Yesterday</div>{yesterday.map(n=><NotifItem key={n.id} n={n} onClick={()=>openNotif(n)} />)}</>}
          {older.length>0&&<><div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', padding:'14px 16px 8px' }}>Earlier</div>{older.map(n=><NotifItem key={n.id} n={n} onClick={()=>openNotif(n)} />)}</>}
        </div>
      </div>

      <BottomNav active="Alerts" />
      <PopupLayer />
    </MobileFrame>
  )
}