import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Galeria() {
  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('book') // 'book' | 'zingers'
  const [slideIdx, setSlideIdx] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [view, setView] = useState('slide') // 'slide' | 'grid'
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()
  const intervalRef = useRef()

  useEffect(() => {
    supabase.from('eventos').select('*').eq('activo', true).maybeSingle()
      .then(({ data }) => { setEvento(data); setLoading(false) })
  }, [])

  const fotos = evento
    ? (tab === 'book' ? (evento.fotos_book || []) : (evento.fotos_zingers || []))
    : []

  // Auto-play slideshow
  useEffect(() => {
    if (!autoPlay || view !== 'slide' || fotos.length <= 1) return
    intervalRef.current = setInterval(() => {
      setSlideIdx(i => (i + 1) % fotos.length)
    }, 4000)
    return () => clearInterval(intervalRef.current)
  }, [autoPlay, view, fotos.length, tab])

  // Reset slide index when tab changes
  useEffect(() => { setSlideIdx(0) }, [tab])

  const prev = () => {
    clearInterval(intervalRef.current)
    setSlideIdx(i => (i - 1 + fotos.length) % fotos.length)
  }
  const next = useCallback(() => {
    clearInterval(intervalRef.current)
    setSlideIdx(i => (i + 1) % fotos.length)
  }, [fotos.length])

  // Swipe support
  const touchStart = useRef(null)
  const handleTouchStart = e => { touchStart.current = e.touches[0].clientX }
  const handleTouchEnd = e => {
    if (!touchStart.current) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    touchStart.current = null
  }

  async function subirFotoZinger(e) {
    e.preventDefault()
    const file = fileRef.current?.files[0]
    if (!file || !evento) return
    setUploading(true)
    setUploadMsg('')
    try {
      const ext = file.name.split('.').pop()
      const nombre = `zingers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('zing-fotos').upload(nombre, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('zing-fotos').getPublicUrl(nombre)
      const nuevas = [...(evento.fotos_zingers || []), data.publicUrl]
      const { error: err2 } = await supabase.from('eventos').update({ fotos_zingers: nuevas }).eq('id', evento.id)
      if (err2) throw err2
      setEvento(ev => ({ ...ev, fotos_zingers: nuevas }))
      setUploadMsg('¡Tu foto ya está en la galería! ✨')
      setTab('zingers')
      setView('slide')
      setSlideIdx(nuevas.length - 1)
      fileRef.current.value = ''
      setShowUpload(false)
    } catch (err) {
      setUploadMsg('Error al subir: ' + err.message)
    }
    setUploading(false)
  }

  if (loading) return (
    <div className="min-h-screen glitter-bg flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-transparent animate-spin"
        style={{ borderTopColor: 'var(--zing-orange)', borderRightColor: 'var(--zing-yellow)' }} />
    </div>
  )

  if (!evento) return (
    <div className="min-h-screen glitter-bg flex flex-col items-center justify-center gap-4">
      <p className="font-cursive text-3xl zing-gradient-text">Zing Live</p>
      <p className="text-white/30 text-xs uppercase tracking-widest">No hay evento activo</p>
      <button onClick={() => navigate('/')} className="text-xs text-white/30 hover:text-white mt-4 transition-colors">← Volver</button>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--zing-darker)' }}>

      {/* NAV */}
      <nav className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ background: 'rgba(26,26,34,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(58,8,120,0.35)' }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm zing-gradient-bg">Z</div>
          <div className="hidden sm:block">
            <p className="font-serif text-sm font-bold text-white">Zing Live</p>
            <p className="text-[8px] uppercase tracking-widest font-bold" style={{ color: 'var(--zing-yellow)' }}>Galería</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex rounded-full p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <TabBtn active={tab === 'book'} onClick={() => setTab('book')}>
              📸 Book
            </TabBtn>
            <TabBtn active={tab === 'zingers'} onClick={() => setTab('zingers')}>
              ✨ Zingers
            </TabBtn>
          </div>

          {/* View toggle */}
          <div className="flex rounded-full p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <TabBtn active={view === 'slide'} onClick={() => setView('slide')}>⊞</TabBtn>
            <TabBtn active={view === 'grid'} onClick={() => setView('grid')}>⊟</TabBtn>
          </div>
        </div>

        {/* Upload btn */}
        <button onClick={() => setShowUpload(true)}
          className="btn-zing px-4 py-2 rounded-full text-[10px]">
          + Subir foto
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-0">

        {fotos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <div className="text-5xl">
              {tab === 'zingers' ? '✨' : '📸'}
            </div>
            <p className="text-white/40 text-sm text-center">
              {tab === 'zingers'
                ? 'Aún no hay fotos de zingers. ¡Sé el primero en subir!'
                : 'No hay fotos en el book todavía.'}
            </p>
            {tab === 'zingers' && (
              <button onClick={() => setShowUpload(true)} className="btn-zing px-8 py-3 rounded-full mt-2">
                Subir mi foto
              </button>
            )}
          </div>
        ) : view === 'slide' ? (
          // SLIDESHOW
          <div className="flex-1 relative overflow-hidden flex flex-col"
            onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {/* Foto */}
            <div className="flex-1 relative">
              <img
                key={slideIdx}
                src={fotos[slideIdx]}
                alt=""
                className="absolute inset-0 w-full h-full object-contain slide-in"
                style={{ background: '#0a0a0f' }}
              />
              {/* Fondo blureado para rellenar */}
              <img
                src={fotos[slideIdx]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'blur(30px) brightness(0.25)', zIndex: -1 }}
              />

              {/* Controles laterales */}
              {fotos.length > 1 && (
                <>
                  <button onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{ background: 'rgba(26,26,34,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="text-white text-lg">‹</span>
                  </button>
                  <button onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{ background: 'rgba(26,26,34,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="text-white text-lg">›</span>
                  </button>
                </>
              )}

              {/* Contador + autoplay */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="text-xs text-white/40 font-bold">
                  {slideIdx + 1} / {fotos.length}
                </span>
                <button onClick={() => setAutoPlay(a => !a)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{ background: autoPlay ? 'rgba(232,36,90,0.3)' : 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  title={autoPlay ? 'Pausar' : 'Reproducir'}>
                  <span className="text-white text-xs">{autoPlay ? '⏸' : '▶'}</span>
                </button>
              </div>
            </div>

            {/* Barra de progreso */}
            {autoPlay && fotos.length > 1 && (
              <div className="h-[2px] w-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div key={slideIdx} className="h-full zing-gradient-bg" style={{ animation: 'progress-bar 4s linear' }} />
              </div>
            )}

            {/* Thumbnails */}
            {fotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none"
                style={{ background: 'rgba(10,10,15,0.8)', scrollbarWidth: 'none' }}>
                {fotos.map((url, i) => (
                  <button key={i} onClick={() => { clearInterval(intervalRef.current); setSlideIdx(i) }}
                    className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all"
                    style={{ opacity: i === slideIdx ? 1 : 0.35, outline: i === slideIdx ? '2px solid var(--zing-orange)' : 'none', outlineOffset: '2px' }}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          // GRID VIEW
          <div className="flex-1 overflow-y-auto p-3">
            <div className="columns-2 sm:columns-3 md:columns-4 gap-2 space-y-2">
              {fotos.map((url, i) => (
                <div key={i} className="break-inside-avoid overflow-hidden rounded-xl cursor-pointer group relative"
                  onClick={() => { setView('slide'); setSlideIdx(i) }}>
                  <img src={url} alt="" className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(10,10,15,0.5)' }}>
                    <span className="text-white text-2xl">⊞</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: SUBIR FOTO */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4"
          style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-md rounded-[2rem] p-8 text-center"
            style={{ background: 'var(--zing-dark)', border: '1px solid rgba(255,170,0,0.2)', boxShadow: '0 0 60px rgba(255,102,0,0.15)' }}>
            <div className="w-16 h-1 rounded-full mx-auto mb-8" style={{ background: 'rgba(255,170,0,0.2)' }} />

            <p className="font-cursive text-3xl zing-gradient-text mb-1">Zinger Upload</p>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-8" style={{ color: 'var(--zing-yellow)' }}>
              Tu momento en la pantalla
            </p>

            <form onSubmit={subirFotoZinger}>
              <label className="block rounded-[1.5rem] p-10 mb-6 cursor-pointer transition-all"
                style={{ border: '2px dashed rgba(255,170,0,0.2)', background: 'rgba(255,255,255,0.02)' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,170,0,0.04)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                <input type="file" accept="image/*" ref={fileRef} className="hidden" />
                <div className="text-4xl mb-3">✨</div>
                <p className="text-white/30 text-xs uppercase tracking-widest font-bold">Elegí tu foto</p>
              </label>

              {uploadMsg && (
                <p className="text-sm mb-4 font-semibold" style={{ color: uploadMsg.startsWith('Error') ? '#E8245A' : 'var(--zing-yellow)' }}>
                  {uploadMsg}
                </p>
              )}

              <button type="submit" disabled={uploading} className="btn-zing w-full py-4 rounded-2xl mb-3 disabled:opacity-50">
                {uploading ? 'Subiendo...' : '✦ Transmitir Ahora'}
              </button>
              <button type="button" onClick={() => { setShowUpload(false); setUploadMsg('') }}
                className="text-[10px] uppercase tracking-[0.3em] font-bold transition-colors"
                style={{ color: 'rgba(255,255,255,0.2)' }}
                onMouseOver={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.2)'}>
                Cerrar
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress-bar { from { width: 0% } to { width: 100% } }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all"
      style={{
        background: active ? 'linear-gradient(135deg, var(--zing-orange), var(--zing-rose))' : 'transparent',
        color: active ? 'white' : 'rgba(255,255,255,0.35)',
      }}>
      {children}
    </button>
  )
}
