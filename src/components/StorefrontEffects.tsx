'use client'

import { useStorefront, useStorefrontEvent } from '@moonbase.sh/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useUi } from '@/lib/ui'

/**
 * Site-wide reactions to the storefront, mounted once in the root layout:
 *
 * - After the checkout overlay takes payment, close it and the cart drawer and show the thank-you
 *   page.
 * - Marketing links like `/?add_product=halo` or `/?add_bundle=duo-bundle` land with the item
 *   already in the cart and the drawer open. Delete that effect if you don't need it.
 */
export function StorefrontEffects() {
  const storefront = useStorefront()
  const { showCart, hideCart } = useUi()
  const router = useRouter()

  useStorefrontEvent('checkoutCompleted', () => {
    hideCart()
    storefront.closeCheckout()
    router.push('/order-completed')
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const productId = params.get('add_product')
    const bundleId = params.get('add_bundle')
    if (!productId && !bundleId)
      return

    let cancelled = false
    void storefront.catalogLoadedPromise.then(() => {
      if (cancelled)
        return

      const { catalog } = storefront.getState()
      const bundle = catalog.bundles.find(b => b.id === bundleId)
      const product = catalog.products.find(p => p.id === productId)
      if (bundle)
        storefront.cart.addToCart(bundle)
      if (product)
        storefront.cart.addToCart(product)
      if (bundle || product)
        showCart()

      // Take the parameters off the address, so reloading the page doesn't add another one
      params.delete('add_product')
      params.delete('add_bundle')
      const query = params.toString()
      window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
    })

    return () => {
      cancelled = true
    }
  }, [storefront, showCart])

  return null
}
