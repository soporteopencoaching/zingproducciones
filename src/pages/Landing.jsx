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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-amber-400 text-2xl tracking-widest uppercase font-light">Zing Producciones</p>
        <p className="text-zinc-500 text-sm">Próximamente...</p>
      </div>
    )
  }

  const fechaFormateada = evento.fecha
    ? new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div className="min-h-screen bg-black">

      {/* HERO */}
      <div className="relative h-screen w-full overflow-hidden">
        {evento.foto_portada_url ? (
          <img
            src={evento.foto_portada_url}
            alt={evento.nombre}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-900" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

        {/* Logo top */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          <p className="text-amber-400 text-xs tracking-[0.4em] uppercase font-light">
            Zing Producciones
          </p>
        </div>

        {/* Nombre + fecha */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 text-center">
          <h1 className="text-white text-6xl sm:text-8xl font-light tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
            {evento.nombre}
          </h1>
          {fechaFormateada && (
            <p className="text-amber-300/80 text-sm tracking-[0.3em] uppercase mt-3">
              {fechaFormateada}
            </p>
          )}

          {/* Botones CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            {evento.link_subir_foto && (
              <a
                href={evento.link_subir_foto}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-amber-400 text-black font-semibold text-sm tracking-widest uppercase rounded-sm hover:bg-amber-300 transition-colors"
              >
                Subi tu foto
              </a>
            )}
            {evento.link_descargar_foto && (
              <a
                href={evento.link_descargar_foto}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border border-white/60 text-white text-sm tracking-widest uppercase rounded-sm hover:bg-white/10 transition-colors"
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
          <p className="text-center text-amber-400 text-xs tracking-[0.4em] uppercase mb-10">
            Book
          </p>
          <div className="columns-2 sm:columns-3 gap-3 space-y-3">
            {evento.fotos_book.map((url, i) => (
              <div
                key={i}
                className="break-inside-avoid cursor-pointer overflow-hidden rounded-sm group"
                onClick={() => setLightbox(url)}
              >
                <img
                  src={url}
                  alt={`Foto ${i + 1}`}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botones flotantes al final del book */}
      {evento.fotos_book?.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center pb-16 px-4">
          {evento.link_subir_foto && (
            <a
              href={evento.link_subir_foto}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-amber-400 text-black font-semibold text-sm tracking-widest uppercase rounded-sm hover:bg-amber-300 transition-colors text-center"
            >
              Subi tu foto
            </a>
          )}
          {evento.link_descargar_foto && (
            <a
              href={evento.link_descargar_foto}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-white/40 text-white text-sm tracking-widest uppercase rounded-sm hover:bg-white/10 transition-colors text-center"
            >
              Descarga tu foto en vivo
            </a>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-zinc-800 py-6 text-center">
        <p className="text-zinc-600 text-xs tracking-widest uppercase">
          Zing Producciones
        </p>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt=""
            className="max-h-full max-w-full object-contain rounded-sm"
          />
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white text-3xl"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
