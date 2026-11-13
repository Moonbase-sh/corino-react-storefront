'use client'

import { type ProductReview, type ReviewVoteDirection, type ReviewVoteTotals, useAuth, useReviews } from '@moonbase.sh/react'
import { useState } from 'react'
import { errorMessage, formatDate } from '@/lib/format'
import { helpfulSentence, languageName, opensTranslated } from '@/lib/reviews'
import { useUi } from '@/lib/ui'
import { ReviewsStars } from './Stars'

interface CardProps {
  productId: string
  review: ProductReview
  /** Signs the store's reply. */
  storeName: string | null
  onVoted: (totals: ReviewVoteTotals) => void
}

export function ReviewsCard({ productId, review, storeName, onVoted }: CardProps) {
  const { user } = useAuth()
  const { voteOnReview } = useReviews()
  const { showLogin } = useUi()

  // A review in another language opens in English, unless the reader's browser reads the original
  const [translated, setTranslated] = useState(() => !!review.translation && opensTranslated(review.language))
  const [voting, setVoting] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)

  const shown = (translated && review.translation) || review
  const language = languageName(review.language) ?? 'another language'
  const author = review.author.anonymous || !review.author.name ? null : review.author.name
  const helpful = helpfulSentence(review.upVotes)

  async function vote(direction: 'up' | 'down') {
    // Pressing the vote already cast takes it back
    const next: ReviewVoteDirection = review.viewerVote === direction ? 'none' : direction
    setVoting(true)
    setVoteError(null)
    try {
      onVoted(await voteOnReview(productId, review.id, next))
    }
    catch (err) {
      setVoteError(errorMessage(err))
    }
    finally {
      setVoting(false)
    }
  }

  return (
    <article className="review-card">
      <header className="review-card-head">
        <ReviewsStars value={review.rating} label={`${review.rating} out of 5 stars`} />
        <span className="caption mono">
          {formatDate(review.publishedAt)}
          {review.edited && ' · EDITED'}
        </span>
      </header>

      <h4>{shown.title}</h4>
      <p className="review-body">{shown.body}</p>
      {review.translation && (
        <p className="review-translation mono">
          {translated ? `TRANSLATED FROM ${language.toUpperCase()} · ` : 'ORIGINAL · '}
          <button type="button" onClick={() => setTranslated(!translated)}>
            {translated ? 'SHOW ORIGINAL' : 'SHOW TRANSLATION'}
          </button>
        </p>
      )}

      <p className="review-author">
        <span className="name">{author ?? 'Verified owner'}</span>
        {author && <span className="verified mono">✓ VERIFIED OWNER</span>}
        {review.isOwn && <span className="badge mono">YOUR REVIEW</span>}
      </p>

      {review.reply && (
        <div className="review-reply">
          <span className="caption mono">{`${(storeName ?? 'The store').toUpperCase()} REPLIED · ${formatDate(review.reply.at)}`}</span>
          <p>{review.reply.body}</p>
        </div>
      )}

      <div className="review-votes">
        {user && !review.isOwn
          ? (
              <>
                <span className="caption">Helpful?</span>
                <button type="button" aria-pressed={review.viewerVote === 'up'} disabled={voting} onClick={() => vote('up')}>
                  {`Yes · ${review.upVotes}`}
                </button>
                <button type="button" aria-pressed={review.viewerVote === 'down'} disabled={voting} onClick={() => vote('down')}>
                  {`No · ${review.downVotes}`}
                </button>
              </>
            )
          : (
              <>
                {helpful && <span className="caption">{helpful}</span>}
                {!user && <button type="button" className="review-sign-in" onClick={showLogin}>Sign in to vote</button>}
              </>
            )}
        {voteError && <span className="error">{voteError}</span>}
      </div>
    </article>
  )
}
