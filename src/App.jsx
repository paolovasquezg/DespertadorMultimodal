import { C } from './consts/tokens'
import { DB_URL, fmtTime, fmtTimeShort, fmtDate, fmtMin } from './consts/utils'
import { Card, SectionLabel, CardTitle, CardSub, StatusDot } from './views/UI'
import {
  RampChart, DonutChart, InertiaChart, StimTrend,
  BucketChart, LdrScatter, WeekdayHeatmap, RidgeChart,
} from './views/Charts'
import Clock from './views/Clock'
import { useDespertadorData } from './consts/data'

const GRID2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: '1rem', marginBottom: '1.25rem' }
const GRID3 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem', marginBottom: '1.25rem' }

export default function App() {
  const url = DB_URL
  const { events, status, error, reload } = useDespertadorData(url)

  const latest = events?.[0]
  const recent = events?.slice(0, 14) ?? []
  const total = recent.reduce((s, e) => s + e.luz + e.vibracion + e.sonido, 0) || 1
  const shareLuz = recent.reduce((s, e) => s + e.luz, 0) / total * 100
  const shareVib = recent.reduce((s, e) => s + e.vibracion, 0) / total * 100
  const shareSon = recent.reduce((s, e) => s + e.sonido, 0) / total * 100

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ padding: '1.75rem 2rem 4rem' }}>

        {/* ── Topbar ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap',
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Source Serif 4',serif", fontWeight: 600,
              fontSize: '1.3rem', margin: '0 0 0.2rem', letterSpacing: '-0.01em',
            }}>
              Sistema despertador multimodal
            </h1>
            <p style={{ color: C.muted, fontSize: '0.82rem', margin: 0 }}>
              Seguimiento de despertares y métricas
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: C.muted, marginTop: '0.5rem' }}>
              <StatusDot state={status.state} />
              <span>{status.text}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
            <Clock />
            <button
              onClick={reload}
              style={{
                border: `1px solid ${C.line}`, background: C.card, color: C.text,
                borderRadius: 8, padding: '0.5rem 0.85rem', fontSize: '0.8rem',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              ↻ Actualizar
            </button>
          </div>
        </div>


        {/* ── Error ── */}
        {error && (
          <div style={{
            background: 'rgba(224,101,79,0.12)', border: '1px solid rgba(224,101,79,0.4)',
            color: C.text, borderRadius: 10, padding: '0.9rem 1.1rem',
            fontSize: '0.85rem', marginBottom: '1.25rem',
          }}>
            ⚠ No se pudo alcanzar la base de datos: {error}.
            Verifica la URL, tu conexión y que el ESP32 haya escrito al menos un registro.
          </div>
        )}

        {/* ── Empty ── */}
        {events !== null && events.length === 0 && (
          <Card>
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: C.muted }}>
              <div style={{ fontSize: 26, marginBottom: '0.6rem' }}>🌙</div>
              Aún no hay eventos registrados.<br />
              Una vez que se detenga una alarma en el dispositivo, aparecerá aquí.
            </div>
          </Card>
        )}

        {/* ── Main content ── */}
        {latest && (
          <>
            {/* Ramp chart */}
            <SectionLabel>Evolución de sensaciones</SectionLabel>
            <Card style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: '0.4rem' }}>
                <CardTitle>Estímulos y despertar</CardTitle>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.76rem', color: C.muted }}>
                  Detenida · {fmtTime(latest.stopped)}{' '}
                  <span style={{ color: Math.abs(latest.lagMin) <= 5 ? C.good : C.bad }}>
                    ({fmtMin(latest.lagMin)})
                  </span>
                </span>
              </div>
              <CardSub>
                Último evento · {fmtTimeShort(latest.programmed)} · {fmtDate(latest.programmed)}
              </CardSub>
              <div style={{ display: 'flex', gap: 16, marginBottom: '0.9rem', flexWrap: 'wrap' }}>
                {[
                  { color: C.light, label: 'Luz', line: true },
                  { color: C.vib, label: 'Vibración', line: true },
                  { color: C.sound, label: 'Sonido', line: false },
                ].map(l => (
                  <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: C.muted }}>
                    <span style={{ width: l.line ? 14 : 9, height: l.line ? 2 : 9, borderRadius: 2, background: l.color, display: 'inline-block' }} />
                    {l.label}
                  </span>
                ))}
              </div>
              <RampChart event={latest} />
            </Card>

            {/* Donut + Inertia */}
            <div style={GRID2}>
              <Card>
                <CardTitle>Perfil sensorial</CardTitle>
                <CardSub>Estímulo total entregado</CardSub>
                <DonutChart luz={shareLuz} vib={shareVib} son={shareSon} />
              </Card>
              <Card>
                <CardTitle>Inercia de despertar</CardTitle>
                <CardSub>Minutos desde la alarma hasta detenerla</CardSub>
                <InertiaChart events={recent} />
              </Card>
            </div>

            {/* Per-stimulus trends */}
            <SectionLabel>Intensidad de estímulos</SectionLabel>
            <div style={GRID3}>
              {[
                { label: 'Luz', color: C.light, field: 'luz' },
                { label: 'Vibración', color: C.vib, field: 'vibracion' },
                { label: 'Sonido', color: C.sound, field: 'sonido' },
              ].map(s => (
                <Card key={s.label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.15rem' }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                    <CardTitle>{s.label}</CardTitle>
                  </div>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '1.4rem', fontWeight: 500, margin: '0.2rem 0 0.85rem' }}>
                    {Math.round(recent.reduce((sum, e) => sum + e[s.field], 0) / recent.length)}
                    <span style={{ fontSize: '0.78rem', color: C.muted, fontWeight: 400, fontFamily: 'Inter,sans-serif' }}> % prom</span>
                  </p>
                  <StimTrend events={recent} field={s.field} color={s.color} />
                </Card>
              ))}
            </div>

            {/* Bucket chart */}
            <SectionLabel>Retraso de despertar</SectionLabel>
            <Card style={{ marginBottom: '1.25rem' }}>
              <CardTitle>Retraso promedio</CardTitle>
              <CardSub>Agrupados por hora de alarma programada</CardSub>
              <BucketChart events={events} />
            </Card>

            {/* Distribution charts */}
            <SectionLabel>Análisis de distribución</SectionLabel>
            <div style={GRID3}>
              <Card>
                <CardTitle>Tiempo de reacción y luminosidad</CardTitle>
                <CardSub>Despertar frente a lectura de luz al detener la alarma</CardSub>
                <LdrScatter events={events} />
              </Card>
              <Card>
                <CardTitle>Eficiencia sensorial</CardTitle>
                <CardSub>Estímulo total promedio necesario</CardSub>
                <WeekdayHeatmap events={events} />
              </Card>
              <Card>
                <CardTitle>Distribución de inercia del sueño</CardTitle>
                <CardSub>Dispersión del retraso de despertar</CardSub>
                <RidgeChart events={events} />
              </Card>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
