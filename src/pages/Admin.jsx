import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

const emptyForm = {
  id: null, nombre: '', fecha: '',
  foto_portada_url: '', fotos_book: [], fotos_zingers: [],
  link_subir_foto: '', link_descargar_foto: '', activo: false,
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [eventos, setEventos] = useState([])
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', ok: true })
  const portadaRef = useRef()
  const bookRef = useRef()

  useEffect(() => { if (authed) cargarEventos() }, [authed])

  async function cargarEventos() {
    const { data, error } = await supabase.from('eventos').select('*').order('created_at', { ascending: false })
    if (error) setMsg({ text: 'Error cargando eventos: ' + error.message, ok: false })
    else setEventos(data || [])
  }

  function login(e) {
    e.preventDefault()
    if (pass === ADMIN_PASSWORD) setAuthed(true)
    else setMsg({ text: 'Contraseña incorrecta', ok: false })
  }

  async function subirImagen(file, carpeta) {
    const ext = file.name.split('.').pop()
    const nombre = `${carpeta}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('zing-fotos').upload(nombre, file, { upsert: true })
    if (error) throw new Error(`Storage: ${error.message}`)
    const { data } = supabase.storage.from('zing-fotos').getPublicUrl(nombre)
    return data.publicUrl
  }

  async function guardar(e) {
    e.preventDefault()
    setSaving(true)
    setMsg({ text: '', ok: true })
    try {
      let datos = { ...form }
      delete datos.id

      if (portadaRef.current?.files[0]) {
        datos.foto_portada_url = await subirImagen(portadaRef.current.files[0], 'portadas')
      }

      if (bookRef.current?.files?.length > 0) {
        const nuevas = await Promise.all(Array.from(bookRef.current.files).map(f => subirImagen(f, 'book')))
        datos.fotos_book = [...(datos.fotos_book || []), ...nuevas]
      }

      // Auto-slug desde nombre
      if (!datos.slug) {
        datos.slug = datos.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
      }

      if (datos.activo) {
        await supabase.from('eventos').update({ activo: false }).neq('id', form.id || '00000000-0000-0000-0000-000000000000')
      }

      let error
      if (form.id) {
        ;({ error } = await supabase.from('eventos').update(datos).eq('id', form.id))
      } else {
        ;({ error } = await supabase.from('eventos').insert(datos))
      }

      if (error) throw new Error(error.message)
      setMsg({ text: '¡Guardado correctamente!', ok: true })
      setForm(null)
      cargarEventos()
    } catch (err) {
      setMsg({ text: 'Error: ' + err.message, ok: false })
    }
    setSaving(false)
  }

  async function activar(id) {
    await supabase.from('eventos').update({ activo: false }).neq('id', id)
    await supabase.from('eventos').update({ activo: true }).eq('id', id)
    cargarEventos()
  }

  async function eliminarEvento(id) {
    if (!confirm('¿Eliminar este evento?')) return
    await supabase.from('eventos').delete().eq('id', id)
    if (form?.id === id) setForm(null)
    cargarEventos()
  }

  // LOGIN
  if (!authed) {
    return (
      <div className="min-h-screen glitter-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl zing-gradient-bg flex items-center justify-center font-black text-white text-3xl mx-auto mb-4"
              style={{ boxShadow: '0 8px 24px rgba(232,36,90,0.35)' }}>Z</div>
            <p className="font-serif text-xl text-white">Zing Live</p>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mt-1" style={{ color: 'var(--zing-yellow)' }}>Panel de Admin</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              placeholder="Contraseña"
              value={pass}
              onChange={e => setPass(e.target.value)}
              className="input-zing text-center"
            />
            {msg.text && <p className="text-xs text-center font-semibold" style={{ color: '#E8245A' }}>{msg.text}</p>}
            <button type="submit" className="btn-zing w-full py-4 rounded-2xl">Entrar</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: 'var(--zing-darker)' }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl zing-gradient-bg flex items-center justify-center font-black text-white text-lg"
              style={{ boxShadow: '0 4px 12px rgba(232,36,90,0.3)' }}>Z</div>
            <div>
              <p className="font-serif font-bold text-white">Zing Admin</p>
              <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--zing-yellow)' }}>Gestión de eventos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" className="text-[10px] uppercase tracking-wider font-bold px-4 py-2 rounded-full transition-colors"
              style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Ver landing ↗
            </a>
            <button onClick={() => setForm({ ...emptyForm })} className="btn-zing px-5 py-2.5 rounded-full text-[10px]">
              + Nuevo evento
            </button>
          </div>
        </div>

        <div className="h-[1px] mb-6" style={{ background: 'linear-gradient(90deg, var(--zing-yellow), var(--zing-orange), var(--zing-rose), transparent)' }} />

        {/* Mensaje global */}
        {msg.text && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{
              background: msg.ok ? 'rgba(255,170,0,0.08)' : 'rgba(232,36,90,0.08)',
              border: `1px solid ${msg.ok ? 'rgba(255,170,0,0.25)' : 'rgba(232,36,90,0.25)'}`,
              color: msg.ok ? 'var(--zing-yellow)' : '#E8245A',
            }}>
            {msg.text}
          </div>
        )}

        {/* FORMULARIO */}
        {form && (
          <div className="rounded-2xl p-6 mb-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,102,0,0.18)' }}>
            <p className="font-serif text-xl text-white mb-6">{form.id ? 'Editar evento' : 'Nuevo evento'}</p>

            <form onSubmit={guardar} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre *">
                  <input required value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: Sofía" className="input-zing" />
                </Field>
                <Field label="Fecha">
                  <input type="date" value={form.fecha || ''}
                    onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                    className="input-zing" />
                </Field>
              </div>

              <Field label="Foto de portada">
                {form.foto_portada_url && (
                  <div className="flex items-center gap-3 mb-2">
                    <img src={form.foto_portada_url} alt="" className="w-20 h-20 object-cover rounded-xl" />
                    <button type="button" onClick={() => setForm(f => ({ ...f, foto_portada_url: '' }))}
                      className="text-xs font-bold" style={{ color: '#E8245A' }}>Quitar</button>
                  </div>
                )}
                <input type="file" accept="image/*" ref={portadaRef} className="file-input text-xs text-white/30" />
              </Field>

              <Field label="Link — Subí tu foto">
                <input type="url" value={form.link_subir_foto || ''}
                  onChange={e => setForm(f => ({ ...f, link_subir_foto: e.target.value }))}
                  placeholder="https://drive.google.com/..." className="input-zing" />
              </Field>

              <Field label="Link — Descarga tu foto en vivo">
                <input type="url" value={form.link_descargar_foto || ''}
                  onChange={e => setForm(f => ({ ...f, link_descargar_foto: e.target.value }))}
                  placeholder="https://drive.google.com/..." className="input-zing" />
              </Field>

              <Field label={`Fotos del book (${form.fotos_book?.length || 0} cargadas)`}>
                {form.fotos_book?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.fotos_book.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-16 h-16 object-cover rounded-xl" />
                        <button type="button"
                          onClick={() => setForm(f => ({ ...f, fotos_book: f.fotos_book.filter((_, j) => j !== i) }))}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'var(--zing-rose)' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <input type="file" accept="image/*" multiple ref={bookRef} className="file-input text-xs text-white/30" />
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Las fotos se acumulan. Podés subir de a lotes.</p>
              </Field>

              {form.fotos_zingers?.length > 0 && (
                <Field label={`Fotos de zingers (${form.fotos_zingers.length})`}>
                  <div className="flex flex-wrap gap-2">
                    {form.fotos_zingers.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-16 h-16 object-cover rounded-xl" />
                        <button type="button"
                          onClick={() => setForm(f => ({ ...f, fotos_zingers: f.fotos_zingers.filter((_, j) => j !== i) }))}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'var(--zing-rose)' }}>×</button>
                      </div>
                    ))}
                  </div>
                </Field>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.activo}
                  onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                  className="w-4 h-4 rounded" style={{ accentColor: 'var(--zing-orange)' }} />
                <span className="text-sm text-white/60">Activar este evento (desactiva los demás)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="btn-zing px-8 py-3 rounded-full text-[11px] disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar evento'}
                </button>
                <button type="button" onClick={() => { setForm(null); setMsg({ text: '', ok: true }) }}
                  className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LISTA DE EVENTOS */}
        <div className="space-y-3">
          {eventos.length === 0 && !form && (
            <div className="text-center py-16">
              <p className="text-white/20 text-sm mb-4">No hay eventos. Creá el primero.</p>
              <button onClick={() => setForm({ ...emptyForm })} className="btn-zing px-8 py-3 rounded-full">
                + Crear evento
              </button>
            </div>
          )}
          {eventos.map(ev => (
            <div key={ev.id} className="flex items-center gap-4 rounded-2xl p-4 transition-all"
              style={{
                background: ev.activo ? 'rgba(255,102,0,0.07)' : 'rgba(255,255,255,0.025)',
                border: `1px solid ${ev.activo ? 'rgba(255,102,0,0.35)' : 'rgba(255,255,255,0.05)'}`,
              }}>
              {ev.foto_portada_url
                ? <img src={ev.foto_portada_url} alt="" className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                : <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center font-cursive text-2xl zing-gradient-text"
                    style={{ background: 'rgba(255,102,0,0.08)' }}>Z</div>
              }
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{ev.nombre}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {ev.fecha ? new Date(ev.fecha + 'T12:00:00').toLocaleDateString('es-AR') : 'Sin fecha'}
                  {' · '}{ev.fotos_book?.length || 0} book
                  {' · '}{ev.fotos_zingers?.length || 0} zingers
                </p>
                {ev.activo && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1.5"
                    style={{ background: 'rgba(255,102,0,0.15)', color: 'var(--zing-yellow)', border: '1px solid rgba(255,170,0,0.25)' }}>
                    ● Activo
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!ev.activo && (
                  <button onClick={() => activar(ev.id)}
                    className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full transition-all"
                    style={{ border: '1px solid rgba(255,102,0,0.3)', color: 'var(--zing-orange)' }}>
                    Activar
                  </button>
                )}
                <button onClick={() => { setForm({ ...ev }); setMsg({ text: '', ok: true }) }}
                  className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                  Editar
                </button>
                <button onClick={() => eliminarEvento(ev.id)}
                  className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full transition-all"
                  style={{ border: '1px solid rgba(232,36,90,0.2)', color: 'rgba(232,36,90,0.5)' }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] font-bold tracking-widest uppercase block mb-1.5"
        style={{ color: 'rgba(255,170,0,0.6)' }}>{label}</label>
      {children}
    </div>
  )
}
