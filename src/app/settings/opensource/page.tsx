'use client'
import { useRouter } from 'next/navigation'
import MobileFrame from '@/components/MobileFrame'

const LIBRARIES = [
  { name:'Next.js',        version:'14.2.35', license:'MIT',    desc:'React framework for production',          url:'https://nextjs.org' },
  { name:'React',          version:'18.3.1',  license:'MIT',    desc:'JavaScript library for building UIs',     url:'https://react.dev' },
  { name:'TypeScript',     version:'5.4.5',   license:'Apache', desc:'Typed superset of JavaScript',            url:'https://typescriptlang.org' },
  { name:'Zustand',        version:'4.5.2',   license:'MIT',    desc:'Small, fast state management solution',   url:'https://zustand-demo.pmnd.rs' },
  { name:'Tailwind CSS',   version:'3.4.1',   license:'MIT',    desc:'Utility-first CSS framework',             url:'https://tailwindcss.com' },
  { name:'date-fns',       version:'3.6.0',   license:'MIT',    desc:'Modern JavaScript date utility library',  url:'https://date-fns.org' },
  { name:'lucide-react',   version:'0.383.0', license:'ISC',    desc:'Beautiful & consistent icon toolkit',     url:'https://lucide.dev' },
  { name:'clsx',           version:'2.1.1',   license:'MIT',    desc:'Tiny utility for constructing classnames',url:'https://github.com/lukeed/clsx' },
  { name:'SWR',            version:'2.2.5',   license:'MIT',    desc:'React Hooks for Data Fetching',           url:'https://swr.vercel.app' },
  { name:'ESLint',         version:'8.57.0',  license:'MIT',    desc:'JavaScript linting utility',              url:'https://eslint.org' },
  { name:'Autoprefixer',   version:'10.4.19', license:'MIT',    desc:'PostCSS plugin to add vendor prefixes',   url:'https://github.com/postcss/autoprefixer' },
]

const LICENSE_COLORS: Record<string,{bg:string;color:string}> = {
  MIT:    { bg:'#DCFCE7', color:'#16A34A' },
  Apache: { bg:'#EFF6FF', color:'#2563EB' },
  ISC:    { bg:'#F5F3FF', color:'#7C3AED' },
}

export default function OpenSourcePage() {
  const router = useRouter()
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
          <span style={{ flex:1, textAlign:'center', fontSize:'17px', fontWeight:800, color:'#0F172A' }}>Open Source Libraries</span>
          <div style={{ width:'38px' }} />
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'14px', paddingBottom:'32px' }}>

          <div style={{ background:'#EFF6FF', borderRadius:'16px', padding:'13px 16px', display:'flex', gap:'10px', border:'1px solid #BFDBFE', marginBottom:'16px' }}>
            <span style={{ fontSize:'18px', flexShrink:0 }}>📦</span>
            <div style={{ fontSize:'13px', color:'#1E40AF', lineHeight:1.55 }}>
              CareBridge Partner uses these open source libraries. We are grateful to their authors and contributors.
            </div>
          </div>

          <div style={{ background:'#fff', borderRadius:'18px', border:'1px solid #E2E8F0', overflow:'hidden' }}>
            {LIBRARIES.map((lib,i) => {
              const lc = LICENSE_COLORS[lib.license] || { bg:'#F1F5F9', color:'#475569' }
              return (
                <div key={lib.name} style={{ padding:'14px 16px', borderBottom:i<LIBRARIES.length-1?'1px solid #F1F5F9':'none' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'4px' }}>
                    <div style={{ fontSize:'14px', fontWeight:800, color:'#0F172A' }}>{lib.name}</div>
                    <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                      <span style={{ fontSize:'11px', fontWeight:600, color:'#94A3B8' }}>v{lib.version}</span>
                      <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'100px', background:lc.bg, color:lc.color }}>{lib.license}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:'12px', color:'#64748B' }}>{lib.desc}</div>
                </div>
              )
            })}
          </div>

          <div style={{ textAlign:'center', padding:'20px', fontSize:'12px', color:'#94A3B8', lineHeight:1.6 }}>
            All libraries are used in accordance with their respective licenses.<br/>© 2026 CareBridge Technologies
          </div>
        </div>
      </div>
    </MobileFrame>
  )
}