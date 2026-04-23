import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Landing() {
  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('eventos').select('*').eq('activo', true).maybeSingle()
      .then(({ data }) => { setEvento(data); setLoading(false) })
  }, [])

  if (loading) return <Loader />

  if (!evento) {
    return (
      <div className="min-h-screen glitter-bg flex flex-col items-center justify-center gap-6">
        <ZingBrand size="lg" />
        <p className="text-white/30 text-xs tracking-[0.5em] uppercase">Próximamente</p>
      </div>
    )
  }

  const fechaFormateada = evento.fecha
    ? new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen glitter-bg overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed w-full z-50 px-6 py-4 flex justify-between items-center"
        style={{ background: 'rgba(26,26,34,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(58,8,120,0.4)' }}>
        <ZingBrand size="sm" />
        <a
          href="/galeria"
          className="text-[10px] uppercase tracking-widest font-bold px-5 py-2 rounded-full transition-all"
          style={{ border: '1px solid rgba(232,36,90,0.3)', color: 'rgba(255,255,255,0.7)' }}
          onMouseOver={e => { e.target.style.borderColor = 'rgba(232,36,90,0.8)'; e.target.style.color = '#E8245A' }}
          onMouseOut={e => { e.target.style.borderColor = 'rgba(232,36,90,0.3)'; e.target.style.color = 'rgba(255,255,255,0.7)' }}
        >
          Galería
        </a>
      </nav>

      {/* HERO */}
      <section className="relative h-screen w-full overflow-hidden flex items-end">
        {evento.foto_portada_url
          ? <img src={evento.foto_portada_url} alt={evento.nombre} className="absolute inset-0 w-full h-full object-cover object-center" />
          : <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1A1A22 0%, #2D0A50 100%)' }} />
        }

        {/* Overlay en capas */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(26,26,34,0.15) 0%, rgba(26,26,34,0.05) 40%, rgba(26,26,34,0.75) 75%, #1A1A22 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at bottom, rgba(58,8,120,0.25) 0%, transparent 70%)' }} />

        {/* Barra top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] zing-gradient-bg" />

        {/* Contenido */}
        <div className="relative z-10 w-full px-6 pb-16 text-center fade-up">
          <p className="text-[10px] uppercase tracking-[0.5em] font-bold mb-4" style={{ color: 'rgba(255,170,0,0.8)' }}>
            Zing Live · Experiencia Única
          </p>
          <h1 className="font-cursive zing-gradient-text mb-3"
            style={{ fontSize: 'clamp(3.5rem, 12vw, 7rem)', lineHeight: 1.1, filter: 'drop-shadow(0 4px 20px rgba(232,36,90,0.4))' }}>
            {evento.nombre}
          </h1>
          {fechaFormateada && (
            <p className="font-serif italic text-white/50 text-lg mb-10">{fechaFormateada}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {evento.link_subir_foto && (
              <a href={evento.link_subir_foto} target="_blank" rel="noopener noreferrer"
                className="btn-zing pulse-zing px-10 py-4 rounded-full w-full sm:w-auto">
                ✦ Subí tu foto
              </a>
            )}
            {evento.link_descargar_foto && (
              <a href={evento.link_descargar_foto} target="_blank" rel="noopener noreferrer"
                className="btn-zing-outline px-10 py-4 rounded-full w-full sm:w-auto">
                ↓ Descarga tu foto en vivo
              </a>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <div className="w-[1px] h-8 zing-gradient-bg" />
        </div>
      </section>

      {/* LA EXPERIENCIA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass-card p-12 md:p-16 text-center relative overflow-hidden"
          style={{ boxShadow: '0 24px 60px rgba(58,8,120,0.3)' }}>
          <p className="text-[10px] uppercase tracking-[0.5em] font-bold mb-8" style={{ color: 'var(--zing-yellow)' }}>
            Zing Producciones
          </p>
          <h2 className="font-serif text-3xl md:text-5xl mb-8 leading-snug fade-up-delay" style={{ fontStyle: 'italic' }}>
            "Transformamos momentos en{' '}
            <span style={{ color: 'var(--zing-rose)', fontStyle: 'normal', fontWeight: 700 }}>magia digital</span>
            {' '}instantánea."
          </h2>
          <div className="h-[1px] w-20 mx-auto mb-8" style={{ background: 'linear-gradient(90deg, transparent, #FF6600, transparent)' }} />
          <p className="text-white/60 font-light leading-relaxed max-w-2xl mx-auto fade-up-delay-2">
            Con <span className="text-white font-semibold">Zing Live</span>, llevamos la calidez de tu noche a un nivel tecnológico único.
            Una experiencia donde los <span className="font-semibold" style={{ color: 'var(--zing-yellow)', fontStyle: 'italic' }}>Zingers</span> son parte del show.
          </p>
        </div>
      </section>

      {/* ZING HUB */}
      <section className="py-10 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-6xl mb-3 text-white">Zing Hub</h2>
          <p className="font-cursive text-2xl" style={{ color: 'var(--zing-rose)' }}>Donde la magia sucede</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Uploader */}
          <HubCard
            accent="orange"
            icon={<CameraIcon />}
            title="Zing Uploader"
            subtitle="Streaming Live a Pantalla"
            description={<>Enviá tus fotos al instante.<br /><span style={{ color: 'var(--zing-yellow)' }}>Míralas brillar en la pantalla principal.</span></>}
            btnLabel="✦ Subir mi Magia"
            btnClass="btn-zing"
            href={evento.link_subir_foto}
          />

          {/* Vault */}
          <HubCard
            accent="rose"
            icon={<VaultIcon />}
            title="Zing Vault"
            subtitle="Cofre de Recuerdos VIP"
            description={<>Tu baúl de recuerdos HD.<br /><span style={{ color: 'var(--zing-rose)' }}>Descargá las fotos oficiales del evento.</span></>}
            btnLabel="↓ Abrir el Baúl"
            btnClass="btn-zing-outline"
            href={evento.link_descargar_foto}
            outlineRose
          />
        </div>

        {/* Ver galería */}
        <div className="text-center mt-12">
          <button onClick={() => navigate('/galeria')} className="text-xs uppercase tracking-widest font-bold transition-colors" style={{ color: 'rgba(255,170,0,0.5)' }}
            onMouseOver={e => e.target.style.color = 'var(--zing-yellow)'}
            onMouseOut={e => e.target.style.color = 'rgba(255,170,0,0.5)'}>
            Ver galería de fotos →
          </button>
        </div>
      </section>

      {/* BOOK */}
      {evento.fotos_book?.length > 0 && (
        <section className="py-20 px-4 max-w-5xl mx-auto">
          <Divider label="Book" />
          <div className="columns-2 sm:columns-3 gap-3 space-y-3 mt-10">
            {evento.fotos_book.map((url, i) => (
              <div key={i} className="break-inside-avoid overflow-hidden rounded-2xl cursor-pointer group relative"
                onClick={() => setLightbox(url)}>
                <img src={url} alt="" className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, rgba(255,102,0,0.2), rgba(232,36,90,0.2))' }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="py-16 text-center" style={{ background: 'var(--zing-darker)' }}>
        <div className="max-w-xs mx-auto mb-10 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,170,0,0.3), transparent)' }} />
        <p className="font-cursive text-4xl zing-gradient-text mb-2">Zing Live</p>
        <p className="text-[10px] uppercase tracking-[0.6em] font-bold mb-8" style={{ color: 'var(--zing-orange)' }}>
          By Zing Producciones
        </p>
        <div className="flex justify-center">
          <div className="p-3 rounded-full cursor-pointer transition-all" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            <svg className="w-5 h-5 text-white/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
        </div>
      </footer>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,10,15,0.97)' }} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-h-full max-w-full object-contain rounded-2xl" />
          <button className="absolute top-4 right-4 text-4xl font-light text-white/40 hover:text-white transition-colors" onClick={() => setLightbox(null)}>×</button>
        </div>
      )}
    </div>
  )
}

function HubCard({ accent, icon, title, subtitle, description, btnLabel, btnClass, href, outlineRose }) {
  const isOrange = accent === 'orange'
  const color = isOrange ? 'var(--zing-yellow)' : 'var(--zing-rose)'
  const glowFrom = isOrange ? '#FF6600' : '#3A0878'
  const glowTo = isOrange ? '#FFAA00' : '#E8245A'

  return (
    <div className="group relative">
      <div className="absolute -inset-[1px] rounded-[2.5rem] opacity-20 group-hover:opacity-50 transition-opacity duration-700 blur-sm"
        style={{ background: `linear-gradient(135deg, ${glowFrom}, ${glowTo})` }} />
      <div className="relative rounded-[2.5rem] p-12 flex flex-col items-center text-center h-full"
        style={{ background: 'var(--zing-dark)', border: `1px solid ${isOrange ? 'rgba(255,170,0,0.1)' : 'rgba(232,36,90,0.1)'}` }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8 transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        <h3 className="font-serif text-3xl text-white mb-2">{title}</h3>
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6" style={{ color }}>
          {subtitle}
        </p>
        <p className="text-white/40 font-light mb-10 leading-relaxed text-sm">{description}</p>
        {href
          ? <a href={href} target="_blank" rel="noopener noreferrer"
              className={`mt-auto w-full ${btnClass} py-5 rounded-2xl inline-block`}
              style={outlineRose ? { borderColor: 'var(--zing-rose)', color: 'var(--zing-rose)' } : {}}>
              {btnLabel}
            </a>
          : <button className={`mt-auto w-full ${btnClass} py-5 rounded-2xl`}
              style={outlineRose ? { borderColor: 'var(--zing-rose)', color: 'var(--zing-rose)' } : {}}>
              {btnLabel}
            </button>
        }
      </div>
    </div>
  )
}

function Divider({ label }) {
  return (
    <div className="flex items-center gap-4 justify-center">
      <div className="h-px flex-1 max-w-28" style={{ background: 'linear-gradient(90deg, transparent, var(--zing-orange))' }} />
      <span className="text-[10px] tracking-[0.5em] uppercase font-bold" style={{ color: 'var(--zing-orange)' }}>{label}</span>
      <div className="h-px flex-1 max-w-28" style={{ background: 'linear-gradient(90deg, var(--zing-rose), transparent)' }} />
    </div>
  )
}

function ZingBrand({ size = 'md' }) {
  const sizes = { sm: { logo: 36, text: '1.1rem', sub: '0.55rem' }, md: { logo: 48, text: '1.4rem', sub: '0.6rem' }, lg: { logo: 72, text: '2.2rem', sub: '0.7rem' } }
  const s = sizes[size]
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-xl flex items-center justify-center font-black text-white zing-gradient-bg"
        style={{ width: s.logo, height: s.logo, fontSize: s.logo * 0.5, boxShadow: '0 4px 16px rgba(232,36,90,0.3)' }}>
        Z
      </div>
      <div>
        <p className="font-serif font-bold text-white" style={{ fontSize: s.text, lineHeight: 1 }}>Zing Live</p>
        <p className="font-bold uppercase text-[var(--zing-yellow)]" style={{ fontSize: s.sub, letterSpacing: '0.35em' }}>Experience Studio</p>
      </div>
    </div>
  )
}

function Loader() {
  return (
    <div className="min-h-screen glitter-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: 'var(--zing-orange)', borderRightColor: 'var(--zing-yellow)' }} />
        <p className="text-white/20 text-xs uppercase tracking-widest">Cargando</p>
      </div>
    </div>
  )
}

function CameraIcon() {
  return (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function VaultIcon() {
  return (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}
