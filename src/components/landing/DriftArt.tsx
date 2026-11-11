// A seeded generator rather than Math.random(), so the server and the browser scatter the
// particles the same way and the artwork can be prerendered without a hydration mismatch.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const random = mulberry32(2024)
const particles = Array.from({ length: 28 }, () => {
  const size = 2 + random() * 3
  return {
    left: `${(15 + random() * 70).toFixed(2)}%`,
    top: `${(15 + random() * 70).toFixed(2)}%`,
    width: `${size.toFixed(2)}px`,
    height: `${size.toFixed(2)}px`,
    animationDelay: `${(random() * 3).toFixed(2)}s`,
  }
})

let wavePath = 'M 0 15'
for (let x = 1; x <= 200; x += 2) {
  const y = 15 + Math.sin(x * 0.15) * 6 * Math.sin(x * 0.04) + Math.sin(x * 0.5) * 2
  wavePath += ` L ${x} ${y.toFixed(3)}`
}

export function DriftArt() {
  return (
    <div>
      <div className="drift-line" style={{ top: '20%', opacity: 0.3 }} />
      <div className="drift-line" style={{ top: '35%', opacity: 0.5 }} />
      <div className="drift-line" style={{ top: '50%', opacity: 0.3 }} />
      <div className="drift-line" style={{ top: '65%', opacity: 0.5 }} />
      <div className="drift-line" style={{ top: '80%', opacity: 0.3 }} />
      <div className="drift-orb" style={{ left: '18%', top: '22%', width: '38%', opacity: 0.85 }} />
      <div
        className="drift-orb"
        style={{
          right: '15%',
          bottom: '20%',
          width: '28%',
          opacity: 0.7,
          background: 'radial-gradient(circle at 40% 35%, oklch(0.8 0.1 220) 0%, oklch(0.5 0.16 250) 50%, transparent 100%)',
        }}
      />
      <div
        className="drift-orb"
        style={{
          left: '52%',
          top: '52%',
          width: '20%',
          opacity: 0.6,
          background: 'radial-gradient(circle at 40% 35%, oklch(0.9 0.06 200) 0%, oklch(0.55 0.14 230) 60%, transparent 100%)',
        }}
      />
      <div>
        {particles.map((p, i) => <div key={i} className="drift-particle" style={p} />)}
      </div>
      <svg className="drift-wave" viewBox="0 0 200 30" preserveAspectRatio="none" aria-hidden="true">
        <path d={wavePath} stroke="oklch(0.78 0.14 230 / 0.7)" strokeWidth="1" fill="none" />
      </svg>
    </div>
  )
}
