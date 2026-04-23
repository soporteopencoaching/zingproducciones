import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Landing() {
  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    async function cargarEvento() {
      const { data } = await supabase
        .from('eventos')
        .select('*')
        .eq('activo', true)
        .single()
      setEvento(data)
      setLoading(false)
    }
    cargarEvento()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1A1A22' }}>
        <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: '#FF6600', borderRightColor: '#FFAA00' }} />
      </div>
    )
  }

  if (!evento) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: '#1A1A22' }}>
        <ZingLogo />
        <p className="text-white/40 text-sm tracking-widest uppercase">Próximamente</p>
      </div>
    )
  }

  const fechaFormateada = evento.fecha
    ? new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <div className="min-h-screen" style={{ background: '#1A1A22' }}>

      {/* HERO */}
      <div className="relative h-screen w-full overflow-hidden">
        {evento.foto_portada_url
          ? <img src={evento.foto_portada_url} alt={evento.nombre} className="absolute inset-0 w-full h-full object-cover object-center" />
          : <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1A1A22 0%, #2D0A50 100%)' }} />
        }

        {/* Overlay gradiente Zing */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(26,26,34,0.2) 0%, rgba(26,26,34,0.1) 40%, rgba(26,26,34,0.85) 85%, #1A1A22 100%)'
        }} />

        {/* Barra superior */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{
          background: 'linear-gradient(90deg, #FFAA00, #FF6600, #E8245A)'
        }} />

        {/* Logo Zing top */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          <ZingLogo size="sm" />
        </div>

        {/* Contenido inferior */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-12 text-center">
          <h1 className="zing-gradient-text font-black text-7xl sm:text-9xl tracking-tight leading-none" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
            {evento.nombre}
          </h1>
          {fechaFormateada && (
            <p className="text-white/60 text-sm tracking-[0.35em] uppercase mt-3">
              {fechaFormateada}
            </p>
          )}

          {/* Botones CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 max-w-sm sm:max-w-none mx-auto">
            {evento.link_subir_foto && (
              <a
                href={evento.link_subir_foto}
                target="_blank"
                rel="noopener noreferrer"
                className="zing-btn-primary zing-glow px-8 py-4 rounded-lg text-sm"
              >
                Subi tu foto
              </a>
            )}
            {evento.link_descargar_foto && (
              <a
                href={evento.link_descargar_foto}
                target="_blank"
                rel="noopener noreferrer"
                className="zing-btn-secondary px-8 py-4 rounded-lg text-sm"
              >
                Descarga tu foto en vivo
              </a>
            )}
          </div>
        </div>
      </div>

      {/* BOOK */}
      {evento.fotos_book?.length > 0 && (
        <div className="px-4 py-16 max-w-5xl mx-auto">

          {/* Título sección */}
          <div className="flex items-center gap-4 justify-center mb-10">
            <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(90deg, transparent, #FF6600)' }} />
            <span className="text-xs tracking-[0.4em] uppercase font-bold" style={{ color: '#FF6600' }}>Book</span>
            <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(90deg, #E8245A, transparent)' }} />
          </div>

          <div className="columns-2 sm:columns-3 gap-3 space-y-3">
            {evento.fotos_book.map((url, i) => (
              <div
                key={i}
                className="break-inside-avoid cursor-pointer overflow-hidden rounded-lg group relative"
                onClick={() => setLightbox(url)}
              >
                <img
                  src={url}
                  alt={`Foto ${i + 1}`}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" style={{
                  background: 'linear-gradient(135deg, rgba(255,102,0,0.2), rgba(232,36,90,0.2))'
                }} />
              </div>
            ))}
          </div>

          {/* Botones al pie del book */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            {evento.link_subir_foto && (
              <a href={evento.link_subir_foto} target="_blank" rel="noopener noreferrer" className="zing-btn-primary zing-glow px-8 py-4 rounded-lg text-sm text-center">
                Subi tu foto
              </a>
            )}
            {evento.link_descargar_foto && (
              <a href={evento.link_descargar_foto} target="_blank" rel="noopener noreferrer" className="zing-btn-secondary px-8 py-4 rounded-lg text-sm text-center">
                Descarga tu foto en vivo
              </a>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="py-8 text-center border-t" style={{ borderColor: 'rgba(255,102,0,0.15)' }}>
        <ZingLogo size="sm" />
        <p className="text-white/20 text-xs tracking-widest uppercase mt-2">Producciones</p>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,26,34,0.97)' }}
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-h-full max-w-full object-contain rounded-lg" />
          <button
            className="absolute top-4 right-4 text-white/50 hover:text-white text-4xl font-light leading-none"
            onClick={() => setLightbox(null)}
          >×</button>
        </div>
      )}
    </div>
  )
}

function ZingLogo({ size = 'md' }) {
  const sizes = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-6xl' }
  return (
    <div className="flex flex-col items-center">
      <span
        className={`zing-gradient-text font-black ${sizes[size]}`}
        style={{
          fontFamily: 'Impact, Arial Black, sans-serif',
          textShadow: 'none',
          filter: 'drop-shadow(0 0 12px rgba(255,102,0,0.5))',
          WebkitTextStroke: size === 'lg' ? '1px rgba(58,8,120,0.5)' : 'none',
          letterSpacing: '-0.02em',
        }}
      >
        Zing
      </span>
    </div>
  )
}
