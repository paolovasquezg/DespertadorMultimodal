import { useState, useEffect } from 'react'
import { C } from '../consts/tokens'

export default function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{
      fontFamily: "'JetBrains Mono',monospace",
      fontSize: '0.85rem',
      color: C.muted,
      textAlign: 'right',
    }}>
      <div style={{ fontSize: '1rem', color: C.text }}>
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      {now.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
    </div>
  )
}
