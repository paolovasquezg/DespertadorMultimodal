import {
  ResponsiveContainer, ComposedChart, LineChart, Line,
  BarChart, Bar, ScatterChart, Scatter,
  PieChart, Pie, Cell,
  Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { C, TICK } from '../consts/tokens'
import { fmtDate, fmtTimeShort, rampVal } from '../consts/utils'
import { CustomTooltip } from './UI'

// ── Ramp (light + vibration lines + sound bars) ───────────────────────────────
export function RampChart({ event }) {
  const RAMP_LUZ = 30, RAMP_VIB = 25, RAMP_SON = 10
  const totalMin = RAMP_LUZ + 6
  const data = []
  for (let i = totalMin; i >= 0; i--) {
    data.push({
      label: i === 0 ? fmtTimeShort(event.stopped) + ' STOP' : `T-${i}`,
      luz: rampVal(i, RAMP_LUZ),
      vib: rampVal(i, RAMP_VIB),
      son: i <= RAMP_SON ? rampVal(i, RAMP_SON) : null,
    })
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.lineSoft} vertical={false} />
        <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false}
          interval="preserveStartEnd" />
        <YAxis domain={[0, 105]} tick={{ ...TICK, fontSize: 10 }}
          axisLine={false} tickLine={false} tickFormatter={v => v + '%'} />
        <Tooltip content={<CustomTooltip formatter={(v, n) => `${n}: ${v ?? 0}%`} />} />
        <Area type="monotone" dataKey="luz" name="Luz"
          stroke={C.light} fill={C.lightFill} strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="vib" name="Vibración"
          stroke={C.vib} fill={C.vibFill} strokeWidth={2} dot={false} />
        <Bar dataKey="son" name="Sonido"
          fill="rgba(11,143,120,0.45)" radius={[3, 3, 0, 0]} barSize={10} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// ── Donut (sensory profile) ───────────────────────────────────────────────────
export function DonutChart({ luz, vib, son }) {
  const data = [
    { name: 'Luz', value: Math.round(luz), color: C.light },
    { name: 'Vibración', value: Math.round(vib), color: C.vib },
    { name: 'Sonido', value: Math.round(son), color: C.sound },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 120, height: 120, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius="65%" outerRadius="95%"
              strokeWidth={2} stroke={C.card}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip content={<CustomTooltip formatter={(v, n) => `${n}: ${v}%`} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem' }}>
        {data.map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: d.color, display: 'inline-block' }} />
            {d.name}
            <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace", color: C.text }}>
              {d.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Wake inertia line ─────────────────────────────────────────────────────────
export function InertiaChart({ events }) {
  const data = [...events].reverse().map(e => ({
    label: fmtDate(e.stopped),
    val: Math.round(e.lagMin),
  }))
  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.lineSoft} vertical={false} />
        <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis tick={TICK} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip formatter={v => (v >= 0 ? '+' : '') + v + ' min'} />} />
        <Line type="monotone" dataKey="val" stroke={C.bad} strokeWidth={2}
          dot={{ r: 2, fill: C.bad }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Per-stimulus trend line ───────────────────────────────────────────────────
export function StimTrend({ events, field, color }) {
  const data = [...events].reverse().map(e => ({
    label: fmtDate(e.stopped),
    val: Math.round(e[field]),
  }))
  return (
    <ResponsiveContainer width="100%" height={130}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.lineSoft} vertical={false} />
        <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={TICK} axisLine={false} tickLine={false}
          tickFormatter={v => v + '%'} />
        <Tooltip content={<CustomTooltip formatter={v => v + '%'} />} />
        <Line type="monotone" dataKey="val" stroke={color} strokeWidth={2}
          dot={{ r: 2, fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Delay by 2-hour bucket ────────────────────────────────────────────────────
export function BucketChart({ events }) {
  const buckets = ['0-2', '2-4', '4-6', '6-8', '8-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22', '22-24']
  const sums = new Array(12).fill(0)
  const counts = new Array(12).fill(0)
  events.forEach(e => {
    const idx = Math.floor(e.programmed.getHours() / 2)
    sums[idx] += e.lagMin
    counts[idx] += 1
  })
  const data = buckets.map((b, i) => ({
    label: b + 'h',
    val: counts[i] ? Math.round(sums[i] / counts[i]) : null,
    fill: counts[i] === 0
      ? 'rgba(160,163,180,0.20)'
      : Math.abs(sums[i] / counts[i]) <= 5 ? C.good : C.bad,
    count: counts[i],
  }))
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.lineSoft} vertical={false} />
        <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis tick={TICK} axisLine={false} tickLine={false}
          tickFormatter={v => (v >= 0 ? '+' : '') + v} />
        <Tooltip content={
          <CustomTooltip formatter={(v, _, props) => {
            const d = props?.payload
            const cnt = d?.count ?? 0
            return v === null
              ? 'sin eventos'
              : `${v >= 0 ? '+' : ''}${v} min · ${cnt} evento${cnt === 1 ? '' : 's'}`
          }} />
        } />
        <Bar dataKey="val" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── LDR vs delay scatter ──────────────────────────────────────────────────────
export function LdrScatter({ events }) {
  const pts = events
    .filter(e => e.ldr !== null)
    .map(e => ({ x: Math.round(e.ldr), y: Math.round(e.lagMin) }))
  return (
    <ResponsiveContainer width="100%" height={170}>
      <ScatterChart margin={{ top: 4, right: 4, left: -10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.lineSoft} />
        <XAxis dataKey="x" name="Luminosidad" type="number" tick={TICK}
          axisLine={false} tickLine={false}
          tickFormatter={v => v + '%'}
          label={{ value: 'Luminosidad (%)', position: 'insideBottom', offset: -12, fill: C.muted, fontSize: 10 }} />
        <YAxis dataKey="y" name="Retraso (min)" type="number" tick={TICK}
          axisLine={false} tickLine={false}
          label={{ value: 'Retraso (min)', angle: -90, position: 'insideLeft', fill: C.muted, fontSize: 10 }} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }}
          content={<CustomTooltip formatter={(v, n) => `${n}: ${v}`} />} />
        <Scatter data={pts} fill="rgba(75,92,224,0.50)" />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

// ── Avg stimulus by weekday ───────────────────────────────────────────────────
export function WeekdayHeatmap({ events }) {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const colorFor = v => {
    const t = Math.min(1, Math.max(0, (v - 40) / 55))
    return `rgba(${Math.round(28 + t * 96)},${Math.round(30 + t * 112)},${Math.round(40 + t * 200)},0.85)`
  }
  const sums = new Array(7).fill(0)
  const counts = new Array(7).fill(0)
  events.forEach(e => {
    const dow = e.programmed.getDay()
    const idx = dow === 0 ? 6 : dow - 1  // Mon=0 … Sun=6
    sums[idx] += (e.luz + e.vibracion + e.sonido) / 3
    counts[idx] += 1
  })
  const data = days.map((d, i) => ({
    label: d,
    val: counts[i] ? Math.round(sums[i] / counts[i]) : null,
    fill: counts[i] ? colorFor(Math.round(sums[i] / counts[i])) : 'rgba(160,163,180,0.20)',
  }))
  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.lineSoft} vertical={false} />
        <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={TICK} axisLine={false} tickLine={false}
          tickFormatter={v => v + '%'} />
        <Tooltip content={<CustomTooltip formatter={v => v === null ? 'sin eventos' : 'estímulo promedio: ' + v + '%'} />} />
        <Bar dataKey="val" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Sleep inertia distribution by time-of-day ─────────────────────────────────
export function RidgeChart({ events }) {
  const groups = [
    { key: 'temprano', label: 'Temprano (6-9am)', color: C.sound, h0: 6,  h1: 9  },
    { key: 'medio',    label: 'Medio (9am-9pm)',  color: C.light, h0: 9,  h1: 21 },
    { key: 'tarde',    label: 'Tarde (9-11pm)',   color: C.bad,   h0: 21, h1: 23 },
  ]
  const allLags = events.map(e => Math.round(e.lagMin))
  const minX = allLags.length ? Math.min(-5, ...allLags) : -5
  const maxX = allLags.length ? Math.max(30, ...allLags) : 30
  const xs = Array.from({ length: maxX - minX + 1 }, (_, i) => i + minX)

  const rawCounts = Object.fromEntries(groups.map(g => [g.key, {}]))
  events.forEach(e => {
    const h = e.programmed.getHours()
    const g = groups.find(g => h >= g.h0 && h < g.h1)
    if (!g) return
    const x = Math.round(e.lagMin)
    rawCounts[g.key][x] = (rawCounts[g.key][x] || 0) + 1
  })
  const data = xs.map(x => {
    const pt = { label: x }
    groups.forEach(g => { pt[g.key] = rawCounts[g.key][x] || 0 })
    return pt
  })
  return (
    <ResponsiveContainer width="100%" height={170}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.lineSoft} vertical={false} />
        <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false}
          label={{ value: 'Retraso al despertar (min)', position: 'insideBottom', offset: -12, fill: C.muted, fontSize: 10 }} />
        <YAxis allowDecimals={false} tick={{ ...TICK, fontSize: 10 }} axisLine={false} tickLine={false}
          tickFormatter={v => v} />
        <Tooltip content={<CustomTooltip formatter={(v, n) => `${n}: ${v} ocurrencia${v === 1 ? '' : 's'}`} />} />
        {groups.map(g => (
          <Line key={g.key} type="monotone" dataKey={g.key} name={g.label}
            stroke={g.color} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
