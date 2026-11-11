const N = 32
const bars = Array.from({ length: N }, (_, i) => {
  const t = i / N
  const h = Math.sin(t * Math.PI) ** 0.6 * (0.4 + 0.6 * Math.abs(Math.sin(i * 1.3)))
  // Rounded so the server and the browser, whose Math.sin can differ in the last digit, agree
  return {
    height: `${(h * 100).toFixed(3)}%`,
    background: `oklch(${(0.6 + h * 0.25).toFixed(4)} 0.18 ${50 + i * 1.5} / 0.85)`,
  }
})

export function HaloArt() {
  return (
    <div>
      <div className="halo-grid" />
      <div className="halo-ring" style={{ width: '2916.67%', opacity: 0.5, borderColor: 'oklch(0.78 0.16 60 / 0.55)' }} />
      <div className="halo-ring" style={{ width: '3541.67%', opacity: 0.4, borderColor: 'oklch(0.78 0.16 56 / 0.45)' }} />
      <div className="halo-ring" style={{ width: '4166.67%', opacity: 0.3, borderColor: 'oklch(0.78 0.16 52 / 0.35)' }} />
      <div className="halo-ring" style={{ width: '4895.83%', opacity: 0.2, borderColor: 'oklch(0.78 0.16 48 / 0.25)' }} />
      <div className="halo-sun" />
      <div className="halo-horizon" />
      <div className="halo-bars">
        {bars.map((bar, i) => <div key={i} style={bar} />)}
      </div>
    </div>
  )
}
