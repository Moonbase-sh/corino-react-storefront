'use client'

import { type Activation, type License, useInventory, useOwnedProduct, useProductActivations, useProductLicenses, useReviews } from '@moonbase.sh/react'
import Link from 'next/link'
import { useState } from 'react'
import { formatDate } from '@/lib/format'
import { DownloadList } from '../DownloadList'
import { ArrowLeftIcon, DownloadIcon } from '../icons'
import { ReviewsYourReview } from '../reviews/YourReview'

/** Downloads, activated devices and external licenses for one product the customer owns. */
export function AccountProductDetail({ productId }: { productId: string }) {
  const { revokeActivation } = useInventory()
  const { enabled: reviewsEnabled } = useReviews()
  const owned = useOwnedProduct(productId)
  const product = owned.data

  // Only asked for when the product has seats, or licenses fulfilled outside Moonbase
  const activations = useProductActivations(product?.maxActivations ? productId : null)
  const licenses = useProductLicenses(product?.externalLicenses ? productId : null)

  const [revoking, setRevoking] = useState<ReadonlySet<string>>(() => new Set())

  async function revoke(activation: Activation) {
    setRevoking(ids => new Set(ids).add(activation.id))
    try {
      await revokeActivation(activation)
      // The seat count lives on the product, so both reload
      await Promise.all([activations.reload(), owned.reload()])
    }
    catch (err) {
      console.error('Revoke failed', err)
    }
    finally {
      setRevoking((ids) => {
        const next = new Set(ids)
        next.delete(activation.id)
        return next
      })
    }
  }

  const totalLicenses = (product?.numberOfLicenses ?? 0) + (product?.subscriptionLicenses ?? 0)

  return (
    <div className="product-detail">
      <Link href="/account/products" className="back">
        <ArrowLeftIcon />
        Back to products
      </Link>

      {!product && owned.error
        ? <p className="error">{owned.error.message}</p>
        : !product
            ? <p className="empty">Loading…</p>
            : (
                <>
                  <header className="product-detail-head">
                    <div className="product-icon large">
                      {product.iconUrl && <img src={product.iconUrl} alt={product.name} />}
                    </div>
                    <div>
                      <h3>{product.name}</h3>
                      {product.version && <p className="hint">{`Version ${product.version}`}</p>}
                    </div>
                  </header>

                  <section className="detail-section">
                    <h4>Downloads</h4>
                    {product.releaseDescription && <p className="release-notes">{product.releaseDescription}</p>}

                    {(product.downloadsNeedsOwnership || product.downloadsNeedsUser) && totalLicenses === 0
                      ? <p className="empty">This product requires ownership to download.</p>
                      : <DownloadList downloads={product.downloads} empty="No downloadable files for this product." />}
                  </section>

                  <section className="detail-section">
                    <h4>
                      Licenses
                      {!!product.maxActivations && (
                        <span className="hint">{`${product.currentActivations ?? 0} of ${product.maxActivations} seats used`}</span>
                      )}
                    </h4>

                    {totalLicenses === 0
                      ? <p className="empty">You don&apos;t own any licenses for this product yet.</p>
                      : (
                          <>
                            {!!product.numberOfLicenses && (
                              <p className="license-summary">
                                {`You own ${product.numberOfLicenses} license${product.numberOfLicenses === 1 ? '' : 's'}.`}
                              </p>
                            )}
                            {!!product.subscriptionLicenses && (
                              <p className="license-summary">
                                {`You have ${product.subscriptionLicenses} subscription license${product.subscriptionLicenses === 1 ? '' : 's'}.`}
                              </p>
                            )}

                            {!!product.maxActivations && activations.data && (
                              <div className="activation-list">
                                {activations.data.length === 0 && <p className="empty">No active devices yet.</p>}
                                {activations.data.map(activation => (
                                  <div key={activation.id} className="activation-row">
                                    <div>
                                      <span className="caption">Device</span>
                                      <span className="name">{activation.name}</span>
                                    </div>
                                    <div>
                                      <span className="caption">Method</span>
                                      <span className="value">{activation.activationMethod}</span>
                                    </div>
                                    {activation.firstValidatedAt && (
                                      <div>
                                        <span className="caption">First activated</span>
                                        <span className="value">{formatDate(activation.firstValidatedAt)}</span>
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      className="revoke-btn"
                                      disabled={revoking.has(activation.id)}
                                      onClick={() => revoke(activation)}
                                    >
                                      {revoking.has(activation.id) ? 'Revoking…' : 'Revoke'}
                                    </button>
                                  </div>
                                ))}
                                <ShowMore list={activations} />
                              </div>
                            )}

                            {product.externalLicenses && licenses.data && licenses.data.length > 0 && (
                              <div className="license-list">
                                {licenses.data.map(license => (
                                  <ExternalLicense key={license.id} license={license} productName={product.name} />
                                ))}
                                <ShowMore list={licenses} />
                              </div>
                            )}
                          </>
                        )}
                  </section>

                  {/* Reviews, for a product they bought here or have reviewed */}
                  {reviewsEnabled && (product.mayReview || product.reviewed) && (
                    <section className="detail-section">
                      <h4>Your review</h4>
                      <ReviewsYourReview productId={product.id} productName={product.name} />
                    </section>
                  )}
                </>
              )}
    </div>
  )
}

/** The next page of a list, when Moonbase has more. */
function ShowMore({ list }: { list: { hasMore: boolean, loading: boolean, loadMore: () => Promise<void> } }) {
  if (!list.hasMore)
    return null
  return (
    <button type="button" className="show-more" disabled={list.loading} onClick={list.loadMore}>
      {list.loading ? 'Loading…' : 'Show more'}
    </button>
  )
}

/** A license fulfilled outside Moonbase: a key code, a license file, or an iLok deposit. */
function ExternalLicense({ license, productName }: { license: License, productName: string }) {
  const fulfillment = license.externalFulfillment

  return (
    <div className="license-row">
      <div className="license-row-head">
        <span className="caption">{`${productName} license`}</span>
        {!license.externalFulfillment && !license.requiredConnectedAccount && (
          <span className="license-id">{license.id}</span>
        )}
      </div>

      {typeof fulfillment === 'string' && (
        <div className="license-fulfillment">
          <span className="caption">Key code</span>
          <code>{fulfillment}</code>
        </div>
      )}

      {typeof fulfillment === 'object' && fulfillment.type === 'file' && (
        <div className="license-fulfillment">
          <span className="caption">License file</span>
          <a
            className="license-download"
            href={`data:${fulfillment.contentType};base64,${fulfillment.data}`}
            download={fulfillment.fileName}
          >
            <DownloadIcon />
            {`Download ${fulfillment.fileName}`}
          </a>
        </div>
      )}

      {typeof fulfillment === 'object' && fulfillment.type === 'iLok' && (
        <div className="license-fulfillment ilok">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Deposited to your iLok account</span>
        </div>
      )}

      {license.fulfillmentMessage && <p className="license-message">{license.fulfillmentMessage}</p>}
    </div>
  )
}
