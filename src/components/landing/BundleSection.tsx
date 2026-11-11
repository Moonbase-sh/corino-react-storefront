'use client'

import { useBundle, useCartActions, usePrice, useProduct } from '@moonbase.sh/react'
import { productIds } from '@/lib/config'
import { useUi } from '@/lib/ui'
import { ArrowRightIcon, CheckIcon } from '../icons'

export function BundleSection() {
  const bundle = useBundle(productIds.bundle)
  const halo = useProduct(productIds.halo)
  const drift = useProduct(productIds.drift)
  const haloPrice = usePrice(halo?.defaultVariation)
  const driftPrice = usePrice(drift?.defaultVariation)
  const bundlePrice = usePrice(bundle?.defaultVariation)
  const { addToCart } = useCartActions()
  const { showCart } = useUi()

  function addBundleToCart() {
    if (!bundle)
      return
    addToCart(bundle)
    showCart()
  }

  return (
    <>
      <div id="bundle" className="section-head">
        <div className="section-num">[02 / BUNDLE]</div>
        <div className="section-title">Save 38% when you take both.</div>
        <div className="section-aside">PAGE 03 OF 04</div>
      </div>
      <section className="bundle">
        <div className="bundle-inner">
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 16, letterSpacing: '0.08em' }}>
              STUDIO BUNDLE · S/N 002
            </div>
            <h2>
              Own
              {' '}
              <span className="both">both plugins.</span>
              <br />
              Save 38%.
            </h2>
            <p>
              HALO and DRIFT together at a single price. One checkout, separate licenses for each plugin,
              lifetime updates across both. The complete tone &amp; space pairing.
            </p>
            <ul className="bundle-bullets">
              <li>
                <span className="check"><CheckIcon /></span>
                Both plugins, all formats
              </li>
              <li>
                <span className="check"><CheckIcon /></span>
                Lifetime updates · v3.x roadmap included
              </li>
              <li>
                <span className="check"><CheckIcon /></span>
                3 machine license · transferable
              </li>
            </ul>
          </div>
          <div className="bundle-card">
            <div className="bundle-row">
              <span>HALO Saturator</span>
              <span>
                {halo?.defaultVariation?.hasDiscount && <span className="strike">{haloPrice.originalPrice}</span>}
                <span>{haloPrice.price ?? '$129'}</span>
              </span>
            </div>
            <div className="bundle-row">
              <span>DRIFT Granular</span>
              <span>
                {drift?.defaultVariation?.hasDiscount && <span className="strike">{driftPrice.originalPrice}</span>}
                <span>{driftPrice.price ?? '$149'}</span>
              </span>
            </div>
            {bundle?.defaultVariation?.hasDiscount && (
              <div className="bundle-row">
                <span>Bundle discount</span>
                <span className="save">
                  −
                  <span>{bundlePrice.saving}</span>
                </span>
              </div>
            )}
            <div className="bundle-row total">
              <span>Studio Bundle</span>
              <span>{bundlePrice.price ?? '$249'}</span>
            </div>
            <button type="button" className="bundle-add" disabled={!bundle} onClick={addBundleToCart}>
              ADD BUNDLE TO CART
              <ArrowRightIcon />
            </button>
            <div className="bundle-fineprint">14-DAY MONEY BACK · INSTANT DOWNLOAD</div>
          </div>
        </div>
      </section>
    </>
  )
}
