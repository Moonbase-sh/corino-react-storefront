import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthPage } from '@/components/AuthPage'
import { SubscriptionDetails } from './SubscriptionDetails'

export const metadata: Metadata = { title: 'Manage subscription' }

/**
 * The tenant's `ManageSubscription` URL, with `?subscription_id=…`. Corino doesn't sell
 * subscriptions, so this is a stub: extend it for a store that does.
 */
export default function SubscriptionsPage() {
  return (
    <AuthPage eyebrow="SUBSCRIPTION" title="Manage subscription" hint="View your subscription details.">
      <Suspense fallback={<p className="empty">Loading…</p>}>
        <SubscriptionDetails />
      </Suspense>
    </AuthPage>
  )
}
