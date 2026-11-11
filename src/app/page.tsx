import { BundleSection } from '@/components/landing/BundleSection'
import { DriftArt } from '@/components/landing/DriftArt'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HaloArt } from '@/components/landing/HaloArt'
import { HeroSection } from '@/components/landing/HeroSection'
import { PluginCard } from '@/components/landing/PluginCard'
import { TrialButton } from '@/components/landing/TrialButton'
import { TrustSection } from '@/components/landing/TrustSection'
import { productIds } from '@/lib/config'

// A server component: the copy is plain HTML, and only the parts that read the storefront
// (prices, the cart, owned products) are client components.
export default function HomePage() {
  return (
    <div>
      <HeroSection />

      <div id="plugins" className="section-head">
        <div className="section-num">[01 / PLUGINS]</div>
        <div className="section-title">The instruments: two precise tools for tone and space.</div>
        <div className="section-aside">PAGE 01–02 OF 04</div>
      </div>

      <PluginCard
        productId={productIds.halo}
        variant="halo"
        fallbackPrice="$129"
        fallbackOriginalPrice="$199"
        art={<HaloArt />}
        chrome={(
          <>
            <div className="label">
              <span className="pulse" />
              HALO · v2.1 · ACTIVE
            </div>
            <div className="coord tr">+12.4 dB</div>
            <div className="coord bl">2nd · 3rd · 5th</div>
            <div className="coord br">SR 96k / 32f</div>
          </>
        )}
        meta={(
          <>
            <span>CRN-001</span>
            <span className="dot">/</span>
            <span>HARMONIC SATURATOR</span>
            <span className="dot">/</span>
            <span>VST3 · AU · AAX</span>
          </>
        )}
        tagline="Tape, tubes & transformer color in one warm box."
        description="A psychoacoustic saturator built from a year of tape machine measurements. Three stages (preamp, head bump, and bias), each modeled with a per-frequency response so the lows breathe and the highs stay glassy. Push it for ten dB of glow on the mix bus, or sit it on a vocal at 1% for the kind of warmth that just gets out of the way."
        specs={(
          <>
            <Spec label="STAGES" value="3 + Bias" />
            <Spec label="OVERSAMPLING" value="×16" />
            <Spec label="CPU @ 96k" value="0.4%" />
            <Spec label="PRESETS" value="128" />
          </>
        )}
        trial={<TrialButton productId={productIds.halo}>Try HALO free · 14 days</TrialButton>}
      />

      <PluginCard
        productId={productIds.drift}
        variant="drift"
        reverse
        fallbackPrice="$149"
        fallbackOriginalPrice="$229"
        art={<DriftArt />}
        chrome={(
          <>
            <div className="label">
              <span className="pulse" />
              DRIFT · v1.4 · LISTENING
            </div>
            <div className="coord tr">∞ TAILS</div>
            <div className="coord bl">GRAINS 1024</div>
            <div className="coord br">RT60 14.2s</div>
          </>
        )}
        meta={(
          <>
            <span>CRN-002</span>
            <span className="dot">/</span>
            <span>GRANULAR SPACE</span>
            <span className="dot">/</span>
            <span>VST3 · AU · AAX</span>
          </>
        )}
        tagline="A reverb that thinks in particles, not rooms."
        description="DRIFT shreds incoming audio into a cloud of 1,024 grains, then suspends them in a tunable field of pitch, time and space. The result sits somewhere between reverb, delay and synthesis: perfect for ambient pads, dimensional vocals, or pulling a kick drum into a 14-second tail without losing its punch. Modulation runs internally so motion is built in, not bolted on."
        specs={(
          <>
            <Spec label="GRAINS" value="1024" />
            <Spec label="MAX TAIL" value="∞" />
            <Spec label="PITCH RANGE" value="±48 st" />
            <Spec label="PRESETS" value="160" />
          </>
        )}
        trial={<TrialButton productId={productIds.drift}>Try DRIFT free · 14 days</TrialButton>}
      />

      <BundleSection />
      <FeaturesSection />
      <TrustSection />
    </div>
  )
}

function Spec({ label, value }: { label: string, value: string }) {
  return (
    <div className="spec">
      <div className="spec-label">{label}</div>
      <div className="spec-value">{value}</div>
    </div>
  )
}
