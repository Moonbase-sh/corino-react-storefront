'use client'

import { ActivationRequestStatus, useActivationRequest, useAuth, useCartActions, usePrice, useProduct } from '@moonbase.sh/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useUi } from '@/lib/ui'
import { ActivationProductCard } from './ProductCard'

/**
 * The page an app opens with `?token=…` when its customer chooses to activate online: buy the
 * product, use a license they own, or start a trial on that computer.
 */
export function AutoActivation({ token }: { token: string }) {
  const router = useRouter()
  const { user, loaded: userLoaded, signOut } = useAuth()
  const { showLogin, showCart } = useUi()
  const { addToCart, setQuantity } = useCartActions()

  // `autoFulfill` activates straight away once the customer has a license with a free seat, as the
  // embedded storefront does: once per request, leaving a failure in `error`.
  const {
    activationRequest,
    loading,
    fulfilling,
    completing,
    error,
    fulfillTrial,
  } = useActivationRequest(token, { autoFulfill: true })

  const [newsletterOptIn, setNewsletterOptIn] = useState(false)

  const storefrontProduct = useProduct(activationRequest?.product.id)
  const variation = storefrontProduct?.defaultVariation
  const { price } = usePrice(variation)
  const trial = activationRequest?.trialEligibility
  const needsNewsletterOptIn = !!trial?.requiresNewsletterOptIn
    && !user?.communicationPreferences?.newsletterOptIn

  const ownsProduct = !!activationRequest && !!user && (
    !!user.ownedProducts?.includes(activationRequest.product.id)
    || !!user.subscribedProducts?.includes(activationRequest.product.id)
  )

  function buy() {
    if (!storefrontProduct)
      return
    const item = addToCart(storefrontProduct)
    setQuantity(item, 1)
    showCart()
  }

  if (loading || !userLoaded) {
    return (
      <div className="auto-activation">
        <div className="activation-loader"><p>Loading activation request…</p></div>
      </div>
    )
  }

  if (error || !activationRequest) {
    return (
      <div className="auto-activation">
        <div className="activation-loader">
          <h2>Uh oh</h2>
          <p>{error ?? 'Could not find activation request'}</p>
        </div>
      </div>
    )
  }

  const optionNumber = (n: number) => (variation ? n + 1 : n)

  return (
    <div className="auto-activation">
      <ActivationProductCard product={activationRequest.product} />

      {activationRequest.status === ActivationRequestStatus.Cancelled
        ? (
            <div className="activation-loader">
              <h2>Cancelled</h2>
              <p>This activation request was cancelled. Open your app and try again.</p>
            </div>
          )
        : fulfilling || completing
          ? (
              <div className="activation-loader">
                <p>{`Activating ${activationRequest.product.name}…`}</p>
              </div>
            )
          : activationRequest.status === ActivationRequestStatus.Completed
            ? (
                <div className="activation-loader">
                  <h2>Done!</h2>
                  <p>Your product is activated. You may close this window and return to the app.</p>
                </div>
              )
            : (
                <div className="activation-options">
                  {storefrontProduct && variation && price && (
                    <section className="activation-option">
                      <h3>Option 1 · Purchase product</h3>
                      <p>
                        {`Buy a copy of ${storefrontProduct.name} for `}
                        <strong>{price}</strong>
                        .
                      </p>
                      <button type="button" className="submit" onClick={buy}>Purchase</button>
                    </section>
                  )}

                  <section className="activation-option">
                    <h3>{`Option ${optionNumber(1)} · Use license`}</h3>
                    {!user
                      ? (
                          <>
                            <p>Sign in to use a license you already own.</p>
                            <button type="button" className="submit secondary" onClick={showLogin}>Sign in</button>
                          </>
                        )
                      : !ownsProduct
                          ? (
                              <>
                                <p>You don&apos;t own any licenses for this product.</p>
                                <p className="hint">
                                  {`Signed in as ${user.email}. Not you? `}
                                  <button type="button" className="link" onClick={() => void signOut()}>Sign out</button>
                                </p>
                              </>
                            )
                          : (
                              <>
                                <p>You don&apos;t have free seats for this product. Free up a seat in your account or buy another license.</p>
                                <button type="button" className="submit secondary" onClick={() => router.push('/account/products')}>
                                  View licenses
                                </button>
                              </>
                            )}
                  </section>

                  {trial && (
                    <section className="activation-option">
                      <h3>{`Option ${optionNumber(2)} · Start trial`}</h3>

                      {trial.eligible && trial.requiresAccount && !user
                        ? (
                            <>
                              <p>You need to be signed in to start a trial.</p>
                              <button type="button" className="submit secondary" onClick={showLogin}>Sign in</button>
                            </>
                          )
                        : trial.eligible
                          ? (
                              <>
                                <p>
                                  {`You're eligible for a ${trial.numberOfDaysPerProduct}-day trial.`}
                                  {trial.existing && ` ${trial.numberOfDaysRemaining} days remaining.`}
                                </p>
                                {needsNewsletterOptIn && (
                                  <label className="checkbox-row">
                                    <input type="checkbox" checked={newsletterOptIn} onChange={e => setNewsletterOptIn(e.target.checked)} />
                                    <span>Receive updates and offers by email (required to start a trial)</span>
                                  </label>
                                )}
                                <button
                                  type="button"
                                  className="submit secondary"
                                  disabled={needsNewsletterOptIn && !newsletterOptIn}
                                  onClick={() => void fulfillTrial(newsletterOptIn)}
                                >
                                  Start trial
                                </button>
                              </>
                            )
                          : <p>This device or product is not eligible for a trial.</p>}
                    </section>
                  )}

                  <p className="redeem-row">
                    Have a voucher code?
                    {' '}
                    <button type="button" className="link" onClick={() => router.push('/account/redeem')}>Redeem it</button>
                  </p>
                </div>
              )}
    </div>
  )
}
