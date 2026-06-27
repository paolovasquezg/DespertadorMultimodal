import { C } from '../consts/tokens'

export function Card({ children, style }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 14,
      padding: '1.25rem 1.4rem',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase',
      color: C.muted, marginBottom: '0.9rem',
    }}>
      {children}
    </div>
  )
}

export function SampleBadge() {
  return (
    <span style={{
      fontSize: '0.62rem', letterSpacing: '0.03em', textTransform: 'none',
      background: 'rgba(94,97,117,0.25)', color: C.muted,
      padding: '2px 8px', borderRadius: 20, border: `1px solid ${C.line}`,
    }}>
      datos de muestra
    </span>
  )
}

export function CardTitle({ children }) {
  return <h2 style={{ fontSize: '0.92rem', fontWeight: 500, margin: '0 0 0.2rem' }}>{children}</h2>
}

export function CardSub({ children }) {
  return <p style={{ fontSize: '0.74rem', color: C.muted, margin: '0 0 1rem' }}>{children}</p>
}

export function StatusDot({ state }) {
  const bg = state === 'ok' ? C.good : state === 'err' ? C.bad : C.muted2
  return (
    <span style={{
      width: 6, height: 6, borderRadius: '50%', background: bg,
      display: 'inline-block', flexShrink: 0,
      animation: state === 'pending' ? 'pulse 1.4s ease-in-out infinite' : 'none',
    }} />
  )
}

export function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #DDE0EA', borderRadius: 8,
      padding: '6px 10px', fontSize: '0.76rem', color: '#1A1C26',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      {label && <div style={{ color: '#6B6E82', marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#1A1C26' }}>
          {formatter ? formatter(p.value, p.name) : p.value}
        </div>
      ))}
    </div>
  )
}
