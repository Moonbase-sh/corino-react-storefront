'use client'

import { useAttributionConsent } from '@moonbase.sh/react'
import { useUi } from '@/lib/ui'

/**
 * Asks the visitors the store needs consent from whether the SDK may keep the ad click IDs they
 * arrived with. `required` stays undefined until the browser has loaded the catalog for this
 * visitor, since the server's describes where the server is. "Cookie settings" in the footer opens
 * the banner again for anyone. The SDK remembers the answer, and starts from it on the next visit.
 */
export function CookieBanner() {
  const { required, answer, setAnswer } = useAttributionConsent()
  const { state, hideCookieSettings } = useUi()

  const open = state.cookieSettingsOpen || (required === true && answer === null)

  function respond(granted: boolean) {
    setAnswer(granted)
    hideCookieSettings()
  }

  return (
    <div className={open ? 'cookie-banner open' : 'cookie-banner'} role="dialog" aria-labelledby="cookie-banner-title">
      <h2 id="cookie-banner-title">Cookies</h2>
      <p>
        Can we remember which ad brought you here? It helps us see which campaigns lead to sales.
        Your cart and account work the same either way.
      </p>
      {answer !== null && (
        <p className="current">{`You've ${answer ? 'accepted' : 'declined'}.`}</p>
      )}
      <div className="actions">
        <button type="button" className="decline" onClick={() => respond(false)}>Decline</button>
        <button type="button" className="accept" onClick={() => respond(true)}>Accept</button>
      </div>
    </div>
  )
}
