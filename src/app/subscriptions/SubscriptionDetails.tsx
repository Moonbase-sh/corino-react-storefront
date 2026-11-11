'use client'

import { useAuth, useSubscription } from '@moonbase.sh/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useUi } from '@/lib/ui'

export function SubscriptionDetails() {
  const searchParams = useSearchParams()
  const { user, loaded } = useAuth()
  const { showLogin } = useUi()

  const subscriptionId = searchParams.get('subscription_id') || null
  const subscription = useSubscription(subscriptionId)

  if (!loaded)
    return <p className="empty">Loading…</p>

  if (!subscriptionId)
    return <p className="error">This link is missing a subscription reference.</p>

  if (!user) {
    return (
      <div className="auth-result">
        <p className="hint">You need to be signed in to manage your subscription.</p>
        <button type="button" className="submit" onClick={showLogin}>Sign in</button>
      </div>
    )
  }

  if (!subscription.data) {
    return subscription.error
      ? <p className="error">{subscription.error.message}</p>
      : <p className="empty">Loading subscription…</p>
  }

  return (
    <div className="auth-result">
      <p className="hint">
        Subscription
        {' '}
        <strong>{subscription.data.id}</strong>
      </p>
      {subscription.data.status && <p className="hint">{`Status: ${subscription.data.status}`}</p>}
      <p className="hint">
        Subscription management isn&apos;t built out in this reference app. Corino doesn&apos;t sell
        subscription products, but your store may.
      </p>
      <Link href="/account" className="submit">Go to my account</Link>
    </div>
  )
}
