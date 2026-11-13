'use client'

import { type MyProductReview, useAuth, useReviews, useStorefront } from '@moonbase.sh/react'
import { useEffect, useState } from 'react'
import { errorMessage, formatDate } from '@/lib/format'
import { describeMyReview, isAwaitingCheck, REVIEW_POLL } from '@/lib/reviews'
import { useUi } from '@/lib/ui'
import { ReviewsForm } from './Form'
import { ReviewsStars } from './Stars'

interface YourReviewProps {
  productId: string
  productName: string
}

interface Loaded {
  /** Who and what it was loaded for. */
  key: string
  mine: MyProductReview | null
  error: string | null
}

/**
 * The signed-in customer's own review of a product: where it stands, and writing, editing or
 * withdrawing it. Used in the reviews modal and on the account's product page.
 */
export function ReviewsYourReview({ productId, productName }: YourReviewProps) {
  const storefront = useStorefront()
  const { user } = useAuth()
  const { getMyReview, withdrawReview } = useReviews()
  const { showLogin } = useUi()

  // Bumped to read the review again, after withdrawing it
  const [version, setVersion] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  // How many more times to ask whether a review just posted has been checked
  const [pollsLeft, setPollsLeft] = useState(0)

  const userId = user?.id ?? null
  const key = [productId, userId ?? '', version].join('|')
  const current = loaded?.key === key ? loaded : null
  const mine = current?.mine ?? null

  useEffect(() => {
    if (!userId)
      return
    let active = true
    getMyReview(productId).then(
      (result) => {
        if (active)
          setLoaded({ key, mine: result, error: null })
      },
      (err: unknown) => {
        if (active)
          setLoaded({ key, mine: null, error: errorMessage(err) })
      },
    )
    return () => {
      active = false
    }
  }, [key, productId, userId, getMyReview])

  // A posted review is checked within a minute or two, so ask again until it has been
  useEffect(() => {
    if (!isAwaitingCheck(mine) || pollsLeft <= 0)
      return
    const timer = setTimeout(() => {
      getMyReview(productId).then(
        (result) => {
          setLoaded(prev => prev?.key === key ? { ...prev, mine: result } : prev)
          const checked = !isAwaitingCheck(result)
          setPollsLeft(left => checked ? 0 : left - 1)
          // Published, so the product's score has changed
          if (checked)
            storefront.refreshCatalog().catch(err => console.error('Could not refresh the catalog', err))
        },
        () => setPollsLeft(left => left - 1),
      )
    }, REVIEW_POLL.intervalMs)
    return () => clearTimeout(timer)
  }, [mine, pollsLeft, key, productId, getMyReview, storefront])

  // The catalog carries each product's rating and whether the customer has a review of it
  function refreshCatalog() {
    storefront.refreshCatalog().catch(err => console.error('Could not refresh the catalog', err))
  }

  function onSaved(saved: MyProductReview) {
    setLoaded({ key, mine: saved, error: null })
    setEditing(false)
    setPollsLeft(REVIEW_POLL.attempts)
    refreshCatalog()
  }

  async function withdraw() {
    setWithdrawing(true)
    setActionError(null)
    try {
      await withdrawReview(productId)
      setConfirming(false)
      refreshCatalog()
      setVersion(v => v + 1)
    }
    catch (err) {
      setActionError(errorMessage(err))
    }
    finally {
      setWithdrawing(false)
    }
  }

  if (!user) {
    return (
      <div className="your-review">
        <div className="download-blocked">
          <p>{`Sign in to review ${productName}.`}</p>
          <button type="button" className="download-btn primary" onClick={showLogin}>Sign in</button>
        </div>
      </div>
    )
  }

  if (current?.error)
    return <div className="your-review"><p className="error">{current.error}</p></div>
  if (!mine)
    return <div className="your-review"><p className="empty">Loading your review…</p></div>

  const summary = describeMyReview(mine)
  if (!summary.visible)
    return <div className="your-review"><p className="empty">{`Only customers who bought ${productName} here can review it.`}</p></div>

  // Before they have a review, the form is the whole panel
  if (mine.eligibility.canReview && (editing || !mine.review)) {
    return (
      <div className="your-review">
        <ReviewsForm
          productId={productId}
          existing={mine.review}
          supportEmail={mine.supportEmail ?? null}
          cancellable={!!mine.review}
          onSaved={onSaved}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  const review = mine.review

  return (
    <div className="your-review">
      <div className="your-review-status" data-tone={summary.tone ?? undefined} aria-live="polite">
        {summary.tone && <span className="your-review-dot" aria-hidden="true" />}
        <div>
          <strong>{summary.headline}</strong>
          {summary.note && <p>{summary.note}</p>}
          {summary.needsSupport && (
            <>
              <p>
                {'Reviews aren\'t read by support, so yours hasn\'t been published. '}
                {!mine.supportEmail && 'For help, contact the store directly. '}
                {`You can also edit your review to share how ${productName} has worked for you.`}
              </p>
              {mine.supportEmail && (
                <p><a href={`mailto:${mine.supportEmail}`}>{`Email ${mine.supportEmail}`}</a></p>
              )}
            </>
          )}
        </div>
      </div>

      {review?.title && (
        <article className="review-card review-sent">
          <header className="review-card-head">
            <ReviewsStars value={review.rating} label={`You rated it ${review.rating} out of 5`} />
            <span className="caption mono">{`SENT ${formatDate(review.submittedAt)}`}</span>
          </header>
          <h4>{review.title}</h4>
          <p className="review-body">{review.body}</p>
          <p className="review-author">
            <span className="caption">{`Shown as ${review.anonymous || !review.displayName ? 'Verified owner' : review.displayName}`}</span>
          </p>
        </article>
      )}

      {confirming
        ? (
            <div className="your-review-confirm">
              <p>Your review is taken down and stops counting toward the score. You can write a new one later.</p>
              <div className="your-review-actions">
                <button type="button" className="download-btn primary" disabled={withdrawing} onClick={withdraw}>
                  {withdrawing ? 'Withdrawing…' : 'Withdraw'}
                </button>
                <button type="button" className="revoke-btn" onClick={() => setConfirming(false)}>Keep it</button>
              </div>
            </div>
          )
        : (summary.action || summary.canWithdraw) && (
            <div className="your-review-actions">
              {summary.action && (
                <button type="button" className="download-btn primary" onClick={() => setEditing(true)}>{summary.action}</button>
              )}
              {summary.canWithdraw && (
                <button type="button" className="revoke-btn" onClick={() => setConfirming(true)}>Withdraw</button>
              )}
            </div>
          )}
      {actionError && <p className="error">{actionError}</p>}
    </div>
  )
}
