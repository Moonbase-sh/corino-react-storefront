'use client'

import { useAuth, useProduct, useReviews } from '@moonbase.sh/react'
import { useUi } from '@/lib/ui'
import { CloseIcon } from '../icons'
import { useEscape } from '../useEscape'
import { ReviewsList } from './List'
import { ReviewsYourReview } from './YourReview'

/**
 * A product's reviews, opened from its plugin card: everyone's published reviews, and the
 * customer's own when they bought it here.
 */
export function ReviewsModal() {
  const { state, showReviews, hideReviews } = useUi()
  const { user } = useAuth()
  const { enabled } = useReviews()
  const request = state.reviewsModal
  const product = useProduct(request?.productId)

  useEscape(!!request, hideReviews)

  if (!request)
    return null

  const { productId } = request
  const productName = product?.name ?? 'this product'
  // "Your review" is for a signed-in customer who bought the product here, or who has a review of it
  const hasOwnTab = !!user && !!(product?.mayReview || product?.reviewed)
  const tab = request.tab === 'mine' && hasOwnTab ? 'mine' : 'all'

  return (
    <div className="modal-mask" onClick={hideReviews}>
      <div className="modal trial-modal reviews-modal" role="dialog" aria-labelledby="reviews-modal-title" onClick={e => e.stopPropagation()}>
        <header className="trial-modal-head">
          <h2 id="reviews-modal-title">Reviews</h2>
          <button className="close-btn" type="button" aria-label="Close" onClick={hideReviews}>
            <CloseIcon />
          </button>
        </header>

        {product && (
          <div className="trial-product">
            <div className="trial-product-icon">
              {product.iconUrl && <img src={product.iconUrl} alt={product.name} />}
            </div>
            <div>
              <h3>{product.name}</h3>
            </div>
          </div>
        )}

        {hasOwnTab && (
          <div className="account-tabs reviews-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'all'} className={tab === 'all' ? 'active' : undefined} onClick={() => showReviews(productId, 'all')}>
              All reviews
            </button>
            <button type="button" role="tab" aria-selected={tab === 'mine'} className={tab === 'mine' ? 'active' : undefined} onClick={() => showReviews(productId, 'mine')}>
              Your review
            </button>
          </div>
        )}

        {!enabled
          ? <p className="empty">Reviews aren&apos;t available right now.</p>
          : tab === 'all'
            ? (
                <ReviewsList
                  key={productId}
                  productId={productId}
                  productName={productName}
                  mayReview={!!user && !!product?.mayReview && !product.reviewed}
                  onWrite={() => showReviews(productId, 'mine')}
                />
              )
            : <ReviewsYourReview key={productId} productId={productId} productName={productName} />}
      </div>
    </div>
  )
}
