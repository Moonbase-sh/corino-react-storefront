const features = [
  { title: 'Zero-latency DSP', description: 'Hand-tuned algorithms run at 32-bit float, 96kHz internal. Trackable from input to bus.' },
  { title: 'Universal formats', description: 'VST3 · AU · AAX. macOS 12+, Apple Silicon native. Windows 10/11, 64-bit only.' },
  { title: 'Lifetime updates', description: 'Buy once. Every release on the roadmap is yours, including the v3.x rewrite landing this fall.' },
  { title: 'Studio licensing', description: 'Three machines per seat. Transfer between rigs as your studio grows. No cloud check-ins.' },
]

export function FeaturesSection() {
  return (
    <>
      <div className="section-head">
        <div className="section-num">[03 / DETAILS]</div>
        <div className="section-title">The fine print: what&apos;s in every Corino plugin.</div>
        <div className="section-aside">PAGE 04 OF 04</div>
      </div>
      <section className="features">
        <div className="features-grid">
          {features.map((feature, i) => (
            <div key={feature.title} className="feature">
              <div className="feature-num">{String(i + 1).padStart(2, '0')}</div>
              <div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
