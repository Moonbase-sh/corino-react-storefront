import type { Metadata } from 'next'
import { AuthPage } from '@/components/AuthPage'
import { OrderCompletedActions } from './OrderCompletedActions'

export const metadata: Metadata = { title: 'Order complete' }

/** Where `StorefrontEffects` sends the buyer once the checkout overlay has taken payment. */
export default function OrderCompletedPage() {
  return (
    <AuthPage eyebrow="ORDER COMPLETE" title="Thanks for your order.">
      <div className="order-complete">
        <div className="order-complete-icon" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M13 20.5 L18 25.5 L27.5 15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="hint">
          Your purchase is confirmed. Check your email for a receipt, then sign in to your account to download your products.
        </p>

        <OrderCompletedActions />
      </div>
    </AuthPage>
  )
}
