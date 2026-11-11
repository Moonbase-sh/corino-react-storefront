import { fetchCatalog, type Storefront } from '@moonbase.sh/react'
import { moonbaseEndpoint } from './config'

/**
 * The catalog, fetched on the server so every page goes out with real names and prices rather
 * than placeholders. `<Providers>` starts the browser's storefront from it, and the browser fetches
 * a fresh one for the visitor right after.
 *
 * Next caches the response for an hour, and regenerates the pages built from it in the background
 * after that, so a price change in Moonbase reaches the server-rendered HTML within the hour
 * without a redeploy. The browser's copy is always fresh.
 *
 * Nobody is signed in on the server, and it isn't where the visitor is, so this catalog only knows
 * what's the same for everyone. If Moonbase can't be reached, the pages render with the
 * hard-coded fallback prices instead of failing.
 */
export async function getCatalog(): Promise<Storefront | undefined> {
  try {
    return await fetchCatalog(moonbaseEndpoint, { fetch: { next: { revalidate: 3600 } } })
  }
  catch (err) {
    console.warn(`Could not fetch the catalog from ${moonbaseEndpoint}, rendering fallback prices`, err)
    return undefined
  }
}
