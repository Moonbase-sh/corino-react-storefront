/**
 * The Moonbase store this site sells from. Set `NEXT_PUBLIC_MOONBASE_ENDPOINT` in `.env.local` to
 * point it at your own. It's inlined at build time, so redeploy after changing it.
 */
export const moonbaseEndpoint = process.env.NEXT_PUBLIC_MOONBASE_ENDPOINT || 'https://corino-demo.moonbase.sh'

/** The catalog IDs this site's copy is written around. Change these if you fork it for another store. */
export const productIds = {
  halo: 'halo',
  drift: 'drift',
  bundle: 'duo-bundle',
} as const
