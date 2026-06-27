import { useState, useEffect, useCallback } from 'react'
import { parseLocal } from './utils'

export function useDespertadorData(url) {
  const [events, setEvents]   = useState(null)   // null = not yet loaded
  const [status, setStatus]   = useState({ state: 'pending', text: 'Cargando…' })
  const [error,  setError]    = useState(null)

  const load = useCallback(async () => {
    if (!url.trim()) return
    setStatus({ state: 'pending', text: 'Cargando…' })
    setError(null)
    try {
      const res = await fetch(url.trim(), { cache: 'no-store' })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const raw = await res.json()

      if (!raw) {
        setEvents([])
        setStatus({ state: 'ok', text: 'Conectado · aún sin eventos' })
        return
      }

      const parsed = Object.entries(raw)
        .map(([key, v]) => {
          const programmed = parseLocal(v.hora_programada)
          const stopped    = parseLocal(v.hora_parada)
          return {
            key,
            programmed,
            stopped,
            lagMin:    (stopped - programmed) / 60000,
            luz:       v.estimulos?.luz       ?? 0,
            vibracion: v.estimulos?.vibracion ?? 0,
            sonido:    v.estimulos?.sonido    ?? 0,
            ldr:       v.mediciones?.luz      ?? null,
          }
        })
        .sort((a, b) => b.programmed - a.programmed)

      setEvents(parsed)
      setStatus({
        state: 'ok',
        text:  `${parsed.length} evento${parsed.length === 1 ? '' : 's'} · sincronizado ${new Date().toLocaleTimeString()}`,
      })
    } catch (e) {
      setStatus({ state: 'err', text: 'Error de conexión' })
      setError(e.message)
    }
  }, [url])

  // Load on mount + poll every 60 s
  useEffect(() => {
    load()
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [load])

  return { events, status, error, reload: load }
}
