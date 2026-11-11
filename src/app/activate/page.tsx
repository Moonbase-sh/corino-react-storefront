import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Activation } from './Activation'

export const metadata: Metadata = { title: 'Activate' }

/**
 * The tenant's `AutoActivation` (`?token=…`) and `OfflineActivation` (no token) URL: the online
 * flow when the app sent a token, the machine-file upload otherwise.
 */
export default function ActivatePage() {
  return (
    <Suspense
      fallback={(
        <main className="activation-page">
          <div className="activation-head">
            <div className="section-num">[ ACTIVATION ]</div>
          </div>
          <div className="activation-panel">
            <div className="activation-loader"><p>Loading…</p></div>
          </div>
        </main>
      )}
    >
      <Activation />
    </Suspense>
  )
}
