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

// ── Sample scatter (LDR vs delay) ─────────────────────────────────────────────
export function SampleScatter() {
  const pts = Array.from({ length: 40 }, () => {
    const ldr = 15 + Math.random() * 45
    return {
      x: Math.round(ldr),
      y: Math.round(Math.max(0, (60 - ldr) * 0.25 + (Math.random() - 0.5) * 6)),
    }
  })
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

// ── Sample heatmap (avg stimulus by weekday) ──────────────────────────────────
export function SampleHeatmap() {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const colorFor = v => {
    const t = (v - 40) / 55
    return `rgba(${Math.round(28 + t * 96)},${Math.round(30 + t * 112)},${Math.round(40 + t * 200)},0.85)`
  }
  const data = days.map(d => ({ label: d, val: Math.round(40 + Math.random() * 55) }))
  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.lineSoft} vertical={false} />
        <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={TICK} axisLine={false} tickLine={false}
          tickFormatter={v => v + '%'} />
        <Tooltip content={<CustomTooltip formatter={v => 'estímulo promedio: ' + v + '%'} />} />
        <Bar dataKey="val" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={colorFor(d.val)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Sample ridge (sleep inertia distribution by time-of-day) ─────────────────
export function SampleRidge() {
  const groups = [
    { key: 'temprano', label: 'Temprano (6-9am)', color: C.sound, mean: 4, spread: 3 },
    { key: 'medio', label: 'Medio (9am-9pm)', color: C.light, mean: 6, spread: 4 },
    { key: 'tarde', label: 'Tarde (9-11pm)', color: C.bad, mean: 11, spread: 5 },
  ]
  const gauss = (x, mean, sd) => Math.exp(-((x - mean) ** 2) / (2 * sd * sd))
  const xs = Array.from({ length: 36 }, (_, i) => i - 5)
  const data = xs.map(x => {
    const pt = { label: x }
    groups.forEach(g => { pt[g.key] = Math.round(gauss(x, g.mean, g.spread) * 100) })
    return pt
  })
  return (
    <ResponsiveContainer width="100%" height={170}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -30, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.lineSoft} vertical={false} />
        <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false}
          label={{ value: 'Retraso al despertar (min)', position: 'insideBottom', offset: -12, fill: C.muted, fontSize: 10 }} />
        <YAxis hide />
        <Tooltip content={<CustomTooltip formatter={(v, n) => `${n}: ${v}%`} />} />
        {groups.map(g => (
          <Line key={g.key} type="monotone" dataKey={g.key} name={g.label}
            stroke={g.color} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
