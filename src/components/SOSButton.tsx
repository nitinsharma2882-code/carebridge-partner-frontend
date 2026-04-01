'use client'

interface Props {
  pos: { x: number; y: number }
  onMouseDown:  (e: React.MouseEvent) => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove:  (e: React.TouchEvent) => void
  onTouchEnd:   () => void
  onClick:      () => void
  isDragging:   boolean
}

export default function SOSButton({
  pos, onMouseDown, onTouchStart, onTouchMove, onTouchEnd, onClick, isDragging,
}: Props) {
  return (
    <button
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      title="Drag anywhere · Tap to trigger SOS"
      style={{
        position: 'absolute',
        left: `${pos.x - 27}px`,
        top:  `${pos.y - 27}px`,
        zIndex: 40,
        width: '54px', height: '54px', borderRadius: '50%',
        background: '#DC2626', border: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(220,38,38,0.5)',
        animation: 'sosPulse 2s infinite',
        userSelect: 'none', touchAction: 'none',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 8.7 2 2 0 014.11 6.5h3a2 2 0 012 1.72"/>
      </svg>
      <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff', letterSpacing: '0.5px', marginTop: '1px' }}>SOS</span>
    </button>
  )
}