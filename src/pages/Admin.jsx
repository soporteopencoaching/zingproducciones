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

  useEffect(() => { if (authed) cargarEventos() }, [authed])

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
    setForm({ id: null, slug: '', nombre: '', fecha: '', foto_portada_url: '', fotos_book: [], link_subir_foto: '', link_descargar_foto: '', activo: false })
    setMsg('')
  }

  async function subirImagen(file, carpeta) {
    const ext = file.name.split('.').pop()
    const nombre = `${carpeta}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
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

      if (portadaRef.current?.files[0]) {
        datos.foto_portada_url = await subirImagen(portadaRef.current.files[0], 'portadas')
      }

      if (bookRef.current?.files?.length > 0) {
        const nuevas = await Promise.all(Array.from(bookRef.current.files).map(f => subirImagen(f, 'book')))
        datos.fotos_book = [...(datos.fotos_book || []), ...nuevas]
      }

      if (datos.activo) {
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
    setForm(f => ({ ...f, fotos_book: f.fotos_book.filter((_, i) => i !== idx) }))
  }

  async function eliminarEvento(id) {
    if (!confirm('¿Eliminar este evento?')) return
    await supabase.from('eventos').delete().eq('id', id)
    cargarEventos()
  }

  // LOGIN
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#1A1A22' }}>
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <span className="zing-gradient-text font-black text-5xl" style={{ fontFamily: 'Impact, Arial Black, sans-serif', filter: 'drop-shadow(0 0 12px rgba(255,102,0,0.5))' }}>
              Zing
            </span>
            <p className="text-white/40 text-xs tracking-widest uppercase mt-1">Admin Panel</p>
          </div>

          <form onSubmit={login} className="rounded-xl p-8 space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,102,0,0.2)' }}>
            <input
              type="password"
              placeholder="Contraseña"
              value={pass}
              onChange={e => setPass(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-white text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,102,0,0.3)' }}
            />
            <button type="submit" className="zing-btn-primary w-full py-3 rounded-lg text-sm">
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: '#1A1A22' }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="zing-gradient-text font-black text-3xl" style={{ fontFamily: 'Impact, Arial Black, sans-serif', filter: 'drop-shadow(0 0 8px rgba(255,102,0,0.4))' }}>
              Zing
            </span>
            <p className="text-white/40 text-xs tracking-widest uppercase">Panel de eventos</p>
          </div>
          <button onClick={nuevoEvento} className="zing-btn-primary px-5 py-2.5 rounded-lg text-sm">
            + Nuevo evento
          </button>
        </div>

        {/* Barra de color */}
        <div className="h-px mb-8" style={{ background: 'linear-gradient(90deg, #FFAA00, #FF6600, #E8245A, transparent)' }} />

        {msg && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${msg.startsWith('Error') ? 'bg-red-900/30 text-red-300 border border-red-700/50' : 'border text-green-300'}`}
            style={msg.startsWith('Error') ? {} : { background: 'rgba(255,102,0,0.1)', borderColor: 'rgba(255,102,0,0.4)', color: '#FFAA00' }}>
            {msg}
          </div>
        )}

        {/* Formulario */}
        {form && (
          <div className="rounded-xl p-6 mb-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,102,0,0.2)' }}>
            <h2 className="text-lg font-semibold mb-6" style={{ color: '#FF6600' }}>
              {form.id ? 'Editar evento' : 'Nuevo evento'}
            </h2>

            <form onSubmit={guardar} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre">
                  <input
                    required
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: Sofía"
                    className="input-zing"
                  />
                </Field>
                <Field label="Fecha">
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                    className="input-zing"
                  />
                </Field>
              </div>

              <Field label="Foto de portada">
                {form.foto_portada_url && (
                  <img src={form.foto_portada_url} alt="portada" className="w-32 h-32 object-cover rounded-lg mb-2" />
                )}
                <input type="file" accept="image/*" ref={portadaRef} className="file-zing" />
              </Field>

              <Field label="Link — Subí tu foto">
                <input
                  type="url"
                  value={form.link_subir_foto}
                  onChange={e => setForm(f => ({ ...f, link_subir_foto: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="input-zing"
                />
              </Field>

              <Field label="Link — Descarga tu foto en vivo">
                <input
                  type="url"
                  value={form.link_descargar_foto}
                  onChange={e => setForm(f => ({ ...f, link_descargar_foto: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="input-zing"
                />
              </Field>

              <Field label={`Fotos del book (${form.fotos_book?.length || 0} cargadas)`}>
                {form.fotos_book?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.fotos_book.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => eliminarFotoBook(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: '#E8245A' }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
                <input type="file" accept="image/*" multiple ref={bookRef} className="file-zing" />
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Las fotos se acumulan cada vez que guardás.</p>
              </Field>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm text-white/70">Activar este evento (desactiva los demás)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="zing-btn-primary px-6 py-2.5 rounded-lg text-sm disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setForm(null)} className="text-sm px-4 py-2.5 text-white/40 hover:text-white transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista eventos */}
        <div className="space-y-3">
          {eventos.length === 0 && (
            <p className="text-center py-12 text-white/30 text-sm">No hay eventos. Creá uno.</p>
          )}
          {eventos.map(ev => (
            <div
              key={ev.id}
              className="flex items-center gap-4 rounded-xl p-4"
              style={{
                background: ev.activo ? 'rgba(255,102,0,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${ev.activo ? 'rgba(255,102,0,0.4)' : 'rgba(255,255,255,0.06)'}`
              }}
            >
              {ev.foto_portada_url
                ? <img src={ev.foto_portada_url} alt="" className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                : <div className="w-14 h-14 rounded-lg flex-shrink-0" style={{ background: 'rgba(255,102,0,0.1)' }} />
              }
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{ev.nombre}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {ev.fecha ? new Date(ev.fecha + 'T12:00:00').toLocaleDateString('es-AR') : 'Sin fecha'} · {ev.fotos_book?.length || 0} fotos
                </p>
                {ev.activo && (
                  <span className="inline-block text-xs font-bold rounded px-2 py-0.5 mt-1.5" style={{ background: 'rgba(255,102,0,0.2)', color: '#FFAA00', border: '1px solid rgba(255,170,0,0.3)' }}>
                    ACTIVO
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!ev.activo && (
                  <button onClick={() => activar(ev.id)} className="text-xs px-3 py-1.5 rounded-lg transition-colors" style={{ border: '1px solid rgba(255,102,0,0.3)', color: '#FF6600' }}>
                    Activar
                  </button>
                )}
                <button onClick={() => { setForm({ ...ev }); setMsg('') }} className="text-xs px-3 py-1.5 rounded-lg text-white/60 transition-colors hover:text-white" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  Editar
                </button>
                <button onClick={() => eliminarEvento(ev.id)} className="text-xs px-3 py-1.5 rounded-lg transition-colors" style={{ border: '1px solid rgba(232,36,90,0.2)', color: 'rgba(232,36,90,0.6)' }}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a href="/" target="_blank" className="text-xs tracking-widest uppercase transition-colors" style={{ color: 'rgba(255,102,0,0.5)' }}>
            Ver la landing →
          </a>
        </div>
      </div>

      <style>{`
        .input-zing {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,102,0,0.25);
          border-radius: 8px;
          padding: 10px 16px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-zing:focus { border-color: #FF6600; }
        .input-zing::placeholder { color: rgba(255,255,255,0.3); }
        .input-zing[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        .file-zing {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
        }
        .file-zing::file-selector-button {
          margin-right: 12px;
          padding: 6px 14px;
          border-radius: 6px;
          border: 1px solid rgba(255,102,0,0.4);
          background: rgba(255,102,0,0.1);
          color: #FF6600;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .file-zing::file-selector-button:hover {
          background: rgba(255,102,0,0.2);
        }
      `}</style>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-bold tracking-wider uppercase block mb-1.5" style={{ color: 'rgba(255,170,0,0.7)' }}>{label}</label>
      {children}
    </div>
  )
}
