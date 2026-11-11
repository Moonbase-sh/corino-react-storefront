'use client'

import { getStorefront, type Storefront, StorefrontProvider } from '@moonbase.sh/react'
import type { ReactNode } from 'react'
import { moonbaseEndpoint } from '@/lib/config'
import { UiProvider } from '@/lib/ui'

/**
 * Hands the storefront to every SDK hook below it. `initialCatalog` is the catalog the server
 * fetched (`lib/catalog.ts`), passed down from the root layout, so the server renders real prices
 * and the browser hydrates against the same state before switching to its own.
 *
 * `getStorefront` hands back the same storefront every time in the browser, however often React
 * renders this, and a new one per render on the server, where there's no visitor. Its options only
 * count the first time. Without `attributionConsent`, the storefront starts from the answer the
 * visitor gave the cookie banner on an earlier visit, which it remembers itself.
 */
export function Providers({ initialCatalog, children }: { initialCatalog: Storefront | undefined, children: ReactNode }) {
  const storefront = getStorefront(moonbaseEndpoint, { initialCatalog, persistUtm: true })

  return (
    <StorefrontProvider storefront={storefront}>
      <UiProvider>
        {children}
      </UiProvider>
    </StorefrontProvider>
  )
}
