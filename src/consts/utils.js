export const DB_URL = import.meta.env.VITE_DB_URL;

export function parseLocal(iso) {
  const [d, t] = iso.split('T')
  const [y, m, da] = d.split('-').map(Number)
  const [hh, mm, ss] = (t || '0:0:0').split(':').map(Number)
  return new Date(y, m - 1, da, hh, mm, ss || 0)
}

export const fmtTime = (d) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export const fmtTimeShort = (d) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export const fmtDate = (d) =>
  d.toLocaleDateString('es', { day: '2-digit', month: 'short' })

export const fmtMin = (v) =>
  (v < 0 ? '-' : '+') + Math.abs(Math.round(v)) + ' min'

export const rampVal = (t, ramp) =>
  t <= 0 ? 100 : t >= ramp ? 0 : Math.round((1 - t / ramp) * 100)
