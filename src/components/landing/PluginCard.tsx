'use client'

import { useCartActions, usePrice, useProduct } from '@moonbase.sh/react'
import type { ReactNode } from 'react'
import { useUi } from '@/lib/ui'
import { ArrowRightIcon, DownloadIcon } from '../icons'

interface PluginCardProps {
  productId: string
  variant: 'halo' | 'drift'
  reverse?: boolean
  /** Shown until the catalog has loaded, as when the server couldn't reach Moonbase. */
  fallbackPrice: string
  fallbackOriginalPrice?: string
  art: ReactNode
  chrome: ReactNode
  meta: ReactNode
  tagline: ReactNode
  description: ReactNode
  specs: ReactNode
  trial: ReactNode
}

/**
 * One plugin's section on the landing page. The copy comes in as props from the page, a server
 * component; the live parts (price, discount, owned → Download) come from `useProduct` and
 * `usePrice`. Neither, nor `useCartActions`, renders again when the cart changes.
 */
export function PluginCard(props: PluginCardProps) {
  const { productId, variant, reverse } = props
  const product = useProduct(productId)
  const { addToCart } = useCartActions()
  const { price, originalPrice } = usePrice(product?.defaultVariation)
  const { showCart, showDownloads } = useUi()

  const variation = product?.defaultVariation
  const hasDiscount = !!variation?.hasDiscount
  const discountName = variation?.discount?.name || 'INTRO'
  const owned = !!product?.owned

  function add() {
    if (!product)
      return
    addToCart(product)
    showCart()
  }

  return (
    <section className={reverse ? 'plugin reverse' : 'plugin'}>
      <div className={`plugin-art ${variant}-art`}>
        <div className="plugin-art-inner">
          {props.art}
        </div>
        <div className={`art-chrome ${variant}`}>
          <div className="corner tl" />
          <div className="corner tr" />
          <div className="corner bl" />
          <div className="corner br" />
          {props.chrome}
        </div>
      </div>
      <div className="plugin-info">
        <div>
          <div className="plugin-meta">{props.meta}</div>
          <h2 className="plugin-name">
            <span className={`${variant}-gradient`}>{variant === 'halo' ? 'HALO' : 'DRIFT'}</span>
          </h2>
          <p className="plugin-tagline">{props.tagline}</p>
          <p className="plugin-desc">{props.description}</p>
          <div className="spec-strip">{props.specs}</div>
        </div>

        <div className="purchase">
          <div className="price-block">
            {hasDiscount && <span className="price-old">{originalPrice ?? props.fallbackOriginalPrice}</span>}
            <span className="price-now"><span>{price ?? props.fallbackPrice}</span></span>
          </div>
          <div className="price-note">
            {hasDiscount && <span className="badge">{discountName}</span>}
          </div>
          {owned
            ? (
                <button type="button" className={`add-btn ${variant}`} onClick={() => showDownloads(productId)}>
                  DOWNLOAD
                  <DownloadIcon />
                </button>
              )
            : (
                <button type="button" className={`add-btn ${variant}`} disabled={!product} onClick={add}>
                  ADD TO CART
                  <ArrowRightIcon />
                </button>
              )}
        </div>
        {!owned && (
          <div className="trial-row">
            {props.trial}
            <span className="trial-note mono">NO CARD · FULL FEATURES</span>
          </div>
        )}
      </div>
    </section>
  )
}
