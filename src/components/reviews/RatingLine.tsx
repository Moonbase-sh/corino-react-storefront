'use client'

import { hasRating, useProduct, useReviews } from '@moonbase.sh/react'
import { formatRating, formatReviewCount } from '@/lib/reviews'
import { useUi } from '@/lib/ui'
import { ReviewsStars } from './Stars'

/** A plugin's score under its name, and "Write a review" for a customer who bought it here. */
export function ReviewsRatingLine({ productId }: { productId: string }) {
  const product = useProduct(productId)
  const { enabled } = useReviews()
  const { showReviews } = useUi()

  // The score comes with the catalog, so the prerendered page already has it
  const score = product?.rating
  const rating = hasRating(score) ? score : null
  // Only for a signed-in customer who bought the product here
  const writeLabel = product?.mayReview ? (product.reviewed ? 'YOUR REVIEW' : 'WRITE A REVIEW') : null

  if (!enabled || (!rating && !writeLabel))
    return null

  return (
    <div className="rating-line mono">
      {rating && (
        <button
          type="button"
          className="rating-summary"
          aria-label={`Rated ${formatRating(rating.average)} out of 5 from ${formatReviewCount(rating.count)}. Read the reviews`}
          onClick={() => showReviews(productId)}
        >
          <ReviewsStars value={rating.average} />
          <span>{formatRating(rating.average)}</span>
          <span className="dot">·</span>
          <span>{formatReviewCount(rating.count).toUpperCase()}</span>
        </button>
      )}
      {writeLabel && (
        <button type="button" className="rating-write" onClick={() => showReviews(productId, 'mine')}>
          {writeLabel}
        </button>
      )}
    </div>
  )
}
