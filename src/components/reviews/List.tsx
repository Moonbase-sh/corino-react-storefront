'use client'

import { type ProductRating, type ProductReview, ProductReviewSort, type ReviewVoteTotals, useAuth, useReviews, useVendor } from '@moonbase.sh/react'
import { useEffect, useState } from 'react'
import { errorMessage } from '@/lib/format'
import { formatRating, formatReviewCount, REVIEW_SORTS } from '@/lib/reviews'
import { ReviewsCard } from './Card'
import { ReviewsStars } from './Stars'

interface ListProps {
  productId: string
  productName: string
  /** Whether the customer may write the first review, for the empty state. */
  mayReview: boolean
  onWrite: () => void
}

interface Loaded {
  /** What the list was loaded for, so a load for an older sort or filter is told apart. */
  key: string
  summary: ProductRating | null
  items: ProductReview[]
  next: string | null
  error: string | null
}

/** A product's published reviews: its score, how many have each number of stars, and the reviews a page at a time. */
export function ReviewsList({ productId, productName, mayReview, onWrite }: ListProps) {
  const { getReviews, getMoreReviews } = useReviews()
  const { user } = useAuth()
  // The store's name, which signs its replies
  const { vendor } = useVendor()

  const [sort, setSort] = useState<ProductReviewSort>(ProductReviewSort.Helpful)
  const [stars, setStars] = useState<number | null>(null)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  // How the reader voted, and which review is theirs, depend on who is signed in
  const key = [productId, sort, stars ?? '', user?.id ?? ''].join('|')
  const loading = loaded?.key !== key

  useEffect(() => {
    let current = true
    getReviews(productId, { sort, stars }).then(
      (page) => {
        if (current)
          setLoaded({ key, summary: page.summary, items: page.items, next: page.hasMore ? page.next : null, error: null })
      },
      (err: unknown) => {
        if (current)
          setLoaded(prev => ({ key, summary: prev?.summary ?? null, items: prev?.items ?? [], next: null, error: errorMessage(err) }))
      },
    )
    // A slow answer for an old sort or filter is dropped
    return () => {
      current = false
    }
  }, [key, productId, sort, stars, getReviews])

  async function loadMore() {
    if (!loaded?.next)
      return
    const at = loaded.key
    setLoadingMore(true)
    try {
      const page = await getMoreReviews(loaded.next)
      setLoaded(prev => prev?.key === at ? { ...prev, items: [...prev.items, ...page.items], next: page.hasMore ? page.next : null } : prev)
    }
    catch (err) {
      setLoaded(prev => prev?.key === at ? { ...prev, error: errorMessage(err) } : prev)
    }
    finally {
      setLoadingMore(false)
    }
  }

  // A vote comes back with the review's new totals, so the list isn't read again
  function onVoted(id: string, totals: ReviewVoteTotals) {
    setLoaded(prev => prev && { ...prev, items: prev.items.map(review => review.id === id ? { ...review, ...totals } : review) })
  }

  const summary = loaded?.summary ?? null

  if (!summary) {
    return (
      <div className="reviews-list">
        {loaded?.error ? <p className="error">{loaded.error}</p> : <p className="empty">Loading reviews…</p>}
      </div>
    )
  }

  if (summary.count === 0) {
    return (
      <div className="reviews-list">
        <div className="reviews-empty">
          <p>{`No reviews of ${productName} yet.`}</p>
          {mayReview && <button type="button" className="download-btn primary" onClick={onWrite}>Write the first one</button>}
        </div>
      </div>
    )
  }

  // One row per number of stars, which also filters the list to them
  const counts = [summary.distribution.five, summary.distribution.four, summary.distribution.three, summary.distribution.two, summary.distribution.one]
  const distribution = counts.map((count, i) => ({ stars: 5 - i, count, share: summary.count ? count / summary.count : 0 }))
  const items = loaded?.items ?? []

  return (
    <div className="reviews-list">
      <div className="reviews-summary">
        <div className="reviews-score">
          <span className="reviews-average">{formatRating(summary.average ?? 0)}</span>
          <ReviewsStars value={summary.average ?? 0} size={16} />
          <span className="caption mono">{formatReviewCount(summary.count).toUpperCase()}</span>
        </div>
        <ul className="reviews-bars" aria-label="Show only reviews with">
          {distribution.map(row => (
            <li key={row.stars}>
              <button
                type="button"
                className={stars === row.stars ? 'active' : undefined}
                aria-pressed={stars === row.stars}
                aria-label={`${row.stars} stars, ${formatReviewCount(row.count)}`}
                disabled={row.count === 0 && stars !== row.stars}
                onClick={() => setStars(stars === row.stars ? null : row.stars)}
              >
                <span className="mono">{`${row.stars}★`}</span>
                <span className="reviews-bar"><span style={{ width: `${row.share * 100}%` }} /></span>
                <span className="mono">{row.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="reviews-controls">
        <span className="mono">
          {stars
            ? (
                <>
                  {`${stars}-STAR REVIEWS · `}
                  <button type="button" className="reviews-clear" onClick={() => setStars(null)}>SHOW ALL</button>
                </>
              )
            : 'ALL REVIEWS'}
        </span>
        <label className="reviews-sort">
          <span className="visually-hidden">Sort reviews</span>
          <select value={sort} onChange={e => setSort(e.target.value as ProductReviewSort)}>
            {REVIEW_SORTS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>

      {loaded?.error && <p className="error">{loaded.error}</p>}
      {!loading && items.length === 0
        ? <p className="empty">{`No ${stars}-star reviews yet.`}</p>
        : (
            <ul className={loading ? 'reviews-items loading' : 'reviews-items'}>
              {items.map(review => (
                <li key={review.id}>
                  <ReviewsCard
                    productId={productId}
                    review={review}
                    storeName={vendor?.name ?? null}
                    onVoted={totals => onVoted(review.id, totals)}
                  />
                </li>
              ))}
            </ul>
          )}

      {loaded?.next && (
        <button type="button" className="revoke-btn reviews-more" disabled={loadingMore} onClick={loadMore}>
          {loadingMore ? 'Loading…' : 'Show more'}
        </button>
      )}
    </div>
  )
}
