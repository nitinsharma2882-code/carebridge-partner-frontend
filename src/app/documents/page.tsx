'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import BottomNav from '@/components/BottomNav'
import MobileFrame from '@/components/MobileFrame'

type DocCategory = 'All' | 'Medical' | 'ID Proof' | 'Certificates' | 'Other'
interface Doc { id:string; name:string; category:Exclude<DocCategory,'All'>; size:string; date:string; icon:string }

function PopupLayer() {
  const { popup, closePopup } = useStore()
  if (!popup) return null
  const iconBg: Record<string,string> = { success:'#DCFCE7', warning:'#FEF3C7', error:'#FEE2E2', confirm:'#EDE9FE', info:'#EDFAF7' }
  const iconDefault: Record<string,string> = { success:'✅', warning:'⚠️', error:'❌', confirm:'❓', info:'ℹ️' }
  const btnBg: Record<string,string> = { primary:'#0D9488', secondary:'#F1F5F9', danger:'#DC2626', warning:'#D97706' }
  const btnColor: Record<string,string> = { primary:'#fff', secondary:'#475569', danger:'#fff', warning:'#fff' }
  return (
    <div onClick={e => { if (e.target===e.currentTarget) closePopup() }}
      style={{ position:'absolute', inset:0, zIndex:100, background:'rgba(15,23,42,0.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'22px', width:'100%', overflow:'hidden' }}>
        <div style={{ padding:'28px 20px 0', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:'68px', height:'68px', borderRadius:'50%', background:iconBg[popup.type], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', marginBottom:'12px' }}>{popup.icon||iconDefault[popup.type]}</div>
          <h2 style={{ fontSize:'18px', fontWeight:800, color:'#0F172A', textAlign:'center', margin:0 }}>{popup.title}</h2>
        </div>
        <p style={{ fontSize:'14px', color:'#64748B', textAlign:'center', padding:'8px 22px 18px', lineHeight:1.65 }} dangerouslySetInnerHTML={{ __html:popup.body.replace(/\n/g,'<br/>') }} />
        <div style={{ display:'flex', gap:'10px', padding:'0 18px 22px' }}>
          {popup.actions.map((a,i) => <button key={i} onClick={a.fn} style={{ flex:1, padding:'14px', borderRadius:'14px', fontSize:'14px', fontWeight:700, border:'none', cursor:'pointer', fontFamily:'DM Sans, sans-serif', background:btnBg[a.variant], color:btnColor[a.variant] }}>{a.label}</button>)}
        </div>
      </div>
    </div>
  )
}

const SAMPLE_DOCS: Doc[] = [
  { id:'1', name:'Aadhar Card.pdf',        category:'ID Proof',     size:'1.2 MB', date:'12 Mar 2025', icon:'🪪' },
  { id:'2', name:'Blood Report.pdf',        category:'Medical',      size:'840 KB', date:'02 Jan 2025', icon:'🩸' },
  { id:'3', name:'Nursing Certificate.pdf', category:'Certificates', size:'2.1 MB', date:'18 Nov 2024', icon:'📜' },
  { id:'4', name:'Vaccination Record.pdf',  category:'Medical',      size:'560 KB', date:'05 Feb 2025', icon:'💉' },
  { id:'5', name:'PAN Card.jpg',            category:'ID Proof',     size:'380 KB', date:'22 Oct 2024', icon:'🪪' },
]
const CATEGORIES: DocCategory[] = ['All','Medical','ID Proof','Certificates','Other']

export default function DocumentsPage() {
  const router = useRouter()
  const { showPopup, closePopup } = useStore()
  const [activeTab, setActiveTab] = useState<DocCategory>('All')
  const [docs, setDocs]           = useState<Doc[]>(SAMPLE_DOCS)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const filtered = activeTab==='All' ? docs : docs.filter(d => d.category===activeTab)

  const handleUpload = () => {
    showPopup({ type:'info', title:'Upload Document', body:'Choose a document type to upload.\nSupported: PDF, JPG, PNG (max 10MB)', icon:'📤',
      actions:[
        { label:'Choose File', variant:'primary',   fn:() => { closePopup(); fileRef.current?.click() } },
        { label:'Cancel',      variant:'secondary', fn:closePopup },
      ],
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 10*1024*1024) { showPopup({ type:'error', title:'File Too Large', body:'Please select a file smaller than 10MB.', icon:'❌', actions:[{ label:'OK', variant:'primary', fn:closePopup }] }); return }
    setUploading(true)
    setTimeout(() => {
      const newDoc: Doc = { id:Date.now().toString(), name:file.name, category:'Other', size:`${(file.size/1024).toFixed(0)} KB`, date:new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}), icon:file.type.includes('image')?'🖼️':'📄' }
      setDocs(prev => [newDoc, ...prev]); setUploading(false)
      showPopup({ type:'success', title:'Uploaded!', body:`${file.name} has been uploaded successfully.`, icon:'✅', actions:[{ label:'Done', variant:'primary', fn:closePopup }] })
    }, 1500)
    e.target.value=''
  }

  const handleDelete = (doc: Doc) => {
    showPopup({ type:'confirm', title:'Delete Document?', body:`Are you sure you want to delete\n"${doc.name}"?`, icon:'🗑️',
      actions:[
        { label:'Delete', variant:'danger',    fn:() => { setDocs(prev => prev.filter(d => d.id!==doc.id)); closePopup() } },
        { label:'Cancel', variant:'secondary', fn:closePopup },
      ],
    })
  }

  // ── View / Download / Share handlers ─────────────────────
  const handleView     = (doc: Doc) => showPopup({ type:'info',    title:`Viewing: ${doc.name}`,     icon:'👁️', body:`Opening ${doc.name} for preview.\nFile size: ${doc.size}\nUploaded: ${doc.date}`,      actions:[{ label:'Close',    variant:'secondary', fn:closePopup }] })
  const handleDownload = (doc: Doc) => showPopup({ type:'success', title:'Download Started',          icon:'⬇️', body:`${doc.name} is being downloaded.\nFile size: ${doc.size}`,                             actions:[{ label:'OK',       variant:'primary',   fn:closePopup }] })
  const handleShare    = (doc: Doc) => showPopup({ type:'info',    title:'Share Document',            icon:'📤', body:`Share "${doc.name}" via:\nWhatsApp, Email, or copy link.`,                             actions:[{ label:'Copy Link', variant:'primary',   fn:closePopup }, { label:'Cancel', variant:'secondary', fn:closePopup }] })

  return (
    <MobileFrame>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>

        <div style={{ height:'50px', padding:'14px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#0F172A' }}>9:41</span>
          <span style={{ fontSize:'11px', fontWeight:700, color:'#0F172A' }}>5G</span>
        </div>

        <div style={{ background:'#fff', padding:'10px 16px 14px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
          <button onClick={() => router.back()} style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#F1F5F9', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'19px', fontWeight:900, color:'#0F172A', letterSpacing:'-0.4px' }}>My Documents</div>
            <div style={{ fontSize:'12px', color:'#94A3B8', marginTop:'1px' }}>{docs.length} documents stored</div>
          </div>
          <button onClick={handleUpload} style={{ display:'flex', alignItems:'center', gap:'5px', padding:'8px 14px', background:'#0D9488', border:'none', borderRadius:'20px', cursor:'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span style={{ fontSize:'12px', fontWeight:700, color:'#fff' }}>Upload</span>
          </button>
        </div>

        <div style={{ background:'#fff', padding:'10px 14px', display:'flex', gap:'8px', overflowX:'auto', flexShrink:0, borderBottom:'1px solid #E2E8F0' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)} style={{ padding:'6px 14px', borderRadius:'100px', border:'none', cursor:'pointer', flexShrink:0, background:activeTab===cat?'#0D9488':'#F1F5F9', color:activeTab===cat?'#fff':'#64748B', fontSize:'12px', fontWeight:700, fontFamily:'DM Sans, sans-serif' }}>{cat}</button>
          ))}
        </div>

        {uploading && (
          <div style={{ margin:'12px 14px 0', background:'#EDFAF7', borderRadius:'14px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
            <div style={{ width:'20px', height:'20px', borderRadius:'50%', border:'2.5px solid #0D9488', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} />
            <span style={{ fontSize:'13px', fontWeight:600, color:'#0D9488' }}>Uploading document…</span>
          </div>
        )}

        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', paddingBottom:'90px' }}>
          {filtered.length===0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'200px', gap:'12px' }}>
              <div style={{ fontSize:'48px' }}>📂</div>
              <div style={{ fontSize:'15px', fontWeight:700, color:'#0F172A' }}>No documents yet</div>
              <div style={{ fontSize:'13px', color:'#94A3B8', textAlign:'center' }}>Tap Upload to add your first document</div>
            </div>
          ) : filtered.map(doc => (
            <div key={doc.id} style={{ background:'#fff', borderRadius:'16px', padding:'14px', marginBottom:'10px', border:'1px solid #E2E8F0' }}>
              {/* Doc info row */}
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px' }}>
                <div style={{ width:'46px', height:'46px', borderRadius:'13px', background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>{doc.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{doc.name}</div>
                  <div style={{ display:'flex', gap:'8px', marginTop:'4px', alignItems:'center' }}>
                    <span style={{ fontSize:'10px', fontWeight:700, color:'#0D9488', background:'#EDFAF7', padding:'2px 8px', borderRadius:'100px' }}>{doc.category}</span>
                    <span style={{ fontSize:'11px', color:'#94A3B8' }}>{doc.size} · {doc.date}</span>
                  </div>
                </div>
              </div>

              {/* ── Action buttons: View · Download · Share · Delete ── */}
              <div style={{ display:'flex', gap:'6px' }}>
                <button onClick={() => handleView(doc)} style={{ flex:1, padding:'8px 4px', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:'10px', fontSize:'11px', fontWeight:700, color:'#475569', cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>View
                </button>
                <button onClick={() => handleDownload(doc)} style={{ flex:1, padding:'8px 4px', background:'#EDFAF7', border:'1px solid #CCFBF1', borderRadius:'10px', fontSize:'11px', fontWeight:700, color:'#0D9488', cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download
                </button>
                <button onClick={() => handleShare(doc)} style={{ flex:1, padding:'8px 4px', background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'10px', fontSize:'11px', fontWeight:700, color:'#2563EB', cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share
                </button>
                <button onClick={() => handleDelete(doc)} style={{ width:'36px', padding:'8px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'10px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </button>
              </div>
            </div>
          ))}

          <div onClick={handleUpload} style={{ background:'#fff', borderRadius:'16px', padding:'18px', border:'2px dashed #CBD5E1', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', cursor:'pointer', marginTop:'4px' }}>
            <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:'#EDFAF7', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#0D9488' }}>Upload New Document</div>
            <div style={{ fontSize:'11px', color:'#94A3B8' }}>PDF, JPG, PNG · Max 10MB</div>
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:'none' }} onChange={handleFileChange} />
      <BottomNav active="Docs" />
      <PopupLayer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </MobileFrame>
  )
}