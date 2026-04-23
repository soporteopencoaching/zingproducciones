import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [eventos, setEventos] = useState([])
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const portadaRef = useRef()
  const bookRef = useRef()

  useEffect(() => {
    if (authed) cargarEventos()
  }, [authed])

  async function cargarEventos() {
    const { data } = await supabase.from('eventos').select('*').order('created_at', { ascending: false })
    setEventos(data || [])
  }

  function login(e) {
    e.preventDefault()
    if (pass === ADMIN_PASSWORD) setAuthed(true)
    else alert('Contraseña incorrecta')
  }

  function nuevoEvento() {
    setForm({
      id: null,
      slug: '',
      nombre: '',
      fecha: '',
      foto_portada_url: '',
      fotos_book: [],
      link_subir_foto: '',
      link_descargar_foto: '',
      activo: false,
    })
    setMsg('')
  }

  function editarEvento(ev) {
    setForm({ ...ev })
    setMsg('')
  }

  async function subirImagen(file, carpeta) {
    const ext = file.name.split('.').pop()
    const nombre = `${carpeta}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('zing-fotos').upload(nombre, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('zing-fotos').getPublicUrl(nombre)
    return data.publicUrl
  }

  async function guardar(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      let datos = { ...form }

      // Subir foto portada si eligieron archivo
      if (portadaRef.current?.files[0]) {
        datos.foto_portada_url = await subirImagen(portadaRef.current.files[0], 'portadas')
      }

      // Subir fotos del book si eligieron archivos
      if (bookRef.current?.files?.length > 0) {
        const nuevasUrls = await Promise.all(
          Array.from(bookRef.current.files).map(f => subirImagen(f, 'book'))
        )
        datos.fotos_book = [...(datos.fotos_book || []), ...nuevasUrls]
      }

      if (datos.activo) {
        // Desactivar todos los demás
        await supabase.from('eventos').update({ activo: false }).neq('id', datos.id || '00000000-0000-0000-0000-000000000000')
      }

      const { id, ...campos } = datos

      if (id) {
        await supabase.from('eventos').update(campos).eq('id', id)
      } else {
        await supabase.from('eventos').insert(campos)
      }

      setMsg('Guardado correctamente')
      setForm(null)
      cargarEventos()
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
    setSaving(false)
  }

  async function activar(id) {
    await supabase.from('eventos').update({ activo: false }).neq('id', id)
    await supabase.from('eventos').update({ activo: true }).eq('id', id)
    cargarEventos()
  }

  async function eliminarFotoBook(idx) {
    const nuevas = form.fotos_book.filter((_, i) => i !== idx)
    setForm(f => ({ ...f, fotos_book: nuevas }))
  }

  async function eliminarEvento(id) {
    if (!confirm('¿Eliminar este evento?')) return
    await supabase.from('eventos').delete().eq('id', id)
    cargarEventos()
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <form onSubmit={login} className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 w-full max-w-sm space-y-4">
          <p className="text-amber-400 text-center text-sm tracking-widest uppercase">Zing Admin</p>
          <input
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={e => setPass(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white text-sm outline-none focus:border-amber-400"
          />
          <button type="submit" className="w-full bg-amber-400 text-black font-semibold py-3 rounded text-sm tracking-wide hover:bg-amber-300 transition-colors">
            Entrar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-amber-400 text-xs tracking-widest uppercase">Zing Producciones</p>
            <h1 className="text-2xl font-light mt-1">Panel de eventos</h1>
          </div>
          <button
            onClick={nuevoEvento}
            className="bg-amber-400 text-black text-sm font-semibold px-5 py-2.5 rounded hover:bg-amber-300 transition-colors"
          >
            + Nuevo evento
          </button>
        </div>

        {msg && (
          <div className={`mb-6 px-4 py-3 rounded text-sm ${msg.startsWith('Error') ? 'bg-red-900/50 text-red-300 border border-red-700' : 'bg-green-900/50 text-green-300 border border-green-700'}`}>
            {msg}
          </div>
        )}

        {/* Formulario */}
        {form && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-light mb-6 text-zinc-300">
              {form.id ? 'Editar evento' : 'Nuevo evento'}
            </h2>
            <form onSubmit={guardar} className="space-y-5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 tracking-wide uppercase block mb-1.5">Nombre</label>
                  <input
                    required
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: Sofía"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2.5 text-white text-sm outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 tracking-wide uppercase block mb-1.5">Fecha</label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2.5 text-white text-sm outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 tracking-wide uppercase block mb-1.5">Foto de portada</label>
                {form.foto_portada_url && (
                  <img src={form.foto_portada_url} alt="portada" className="w-32 h-32 object-cover rounded mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={portadaRef}
                  className="text-sm text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 tracking-wide uppercase block mb-1.5">Link — Subí tu foto</label>
                <input
                  type="url"
                  value={form.link_subir_foto}
                  onChange={e => setForm(f => ({ ...f, link_subir_foto: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2.5 text-white text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 tracking-wide uppercase block mb-1.5">Link — Descarga tu foto en vivo</label>
                <input
                  type="url"
                  value={form.link_descargar_foto}
                  onChange={e => setForm(f => ({ ...f, link_descargar_foto: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2.5 text-white text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 tracking-wide uppercase block mb-1.5">
                  Fotos del book ({form.fotos_book?.length || 0} cargadas)
                </label>
                {form.fotos_book?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.fotos_book.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-16 h-16 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => eliminarFotoBook(i)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={bookRef}
                  className="text-sm text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600"
                />
                <p className="text-xs text-zinc-600 mt-1">Podés agregar de a lote, las fotos se acumulan.</p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                  className="w-4 h-4 accent-amber-400"
                />
                <span className="text-sm text-zinc-300">Activar este evento (desactiva los demás)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-400 text-black font-semibold text-sm px-6 py-2.5 rounded hover:bg-amber-300 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="text-sm text-zinc-400 px-4 py-2.5 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de eventos */}
        <div className="space-y-3">
          {eventos.length === 0 && (
            <p className="text-zinc-600 text-sm text-center py-8">No hay eventos todavía. Creá uno.</p>
          )}
          {eventos.map(ev => (
            <div
              key={ev.id}
              className={`flex items-center gap-4 bg-zinc-900 border rounded-lg p-4 ${ev.activo ? 'border-amber-400/50' : 'border-zinc-800'}`}
            >
              {ev.foto_portada_url
                ? <img src={ev.foto_portada_url} alt="" className="w-14 h-14 object-cover rounded flex-shrink-0" />
                : <div className="w-14 h-14 bg-zinc-800 rounded flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{ev.nombre}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {ev.fecha ? new Date(ev.fecha + 'T12:00:00').toLocaleDateString('es-AR') : 'Sin fecha'} · {ev.fotos_book?.length || 0} fotos
                </p>
                {ev.activo && (
                  <span className="inline-block text-xs bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded px-2 py-0.5 mt-1">
                    Activo
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!ev.activo && (
                  <button
                    onClick={() => activar(ev.id)}
                    className="text-xs text-zinc-400 border border-zinc-700 px-3 py-1.5 rounded hover:border-amber-400 hover:text-amber-400 transition-colors"
                  >
                    Activar
                  </button>
                )}
                <button
                  onClick={() => editarEvento(ev)}
                  className="text-xs text-zinc-400 border border-zinc-700 px-3 py-1.5 rounded hover:border-white hover:text-white transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarEvento(ev.id)}
                  className="text-xs text-red-400/60 border border-zinc-800 px-3 py-1.5 rounded hover:border-red-500 hover:text-red-400 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Preview link */}
        <div className="mt-8 text-center">
          <a href="/" target="_blank" className="text-xs text-zinc-600 hover:text-amber-400 transition-colors tracking-widest uppercase">
            Ver la landing →
          </a>
        </div>
      </div>
    </div>
  )
}
