'use client'

import { type MyProductReview, type MyProductReviewDetails, REVIEW_LIMITS, useAuth, useReviews, useVendor } from '@moonbase.sh/react'
import { type FormEvent, useId, useState } from 'react'
import { moonbaseEndpoint } from '@/lib/config'
import { errorMessage } from '@/lib/format'
import { checkReview, describeReviewLength, type ReviewErrors, reviewTermsUrl } from '@/lib/reviews'
import { ReviewsStarInput } from './StarInput'

interface FormProps {
  productId: string
  /** The review they already have, in whatever state, which posting rewrites. */
  existing: MyProductReviewDetails | null
  supportEmail: string | null
  cancellable: boolean
  onSaved: (mine: MyProductReview) => void
  onCancel: () => void
}

const termsUrl = reviewTermsUrl(moonbaseEndpoint)

export function ReviewsForm({ productId, existing, supportEmail, cancellable, onSaved, onCancel }: FormProps) {
  const { user } = useAuth()
  const { saveReview } = useReviews()
  const { vendor } = useVendor()

  const [rating, setRating] = useState<number | null>(existing?.rating ?? null)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [body, setBody] = useState(existing?.body ?? '')
  const [anonymous, setAnonymous] = useState(existing?.anonymous ?? false)
  const [displayName, setDisplayName] = useState(existing?.displayName ?? user?.name ?? '')

  const [attempted, setAttempted] = useState(false)
  const [serverErrors, setServerErrors] = useState<ReviewErrors>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const draft = { rating, title, body, displayName, anonymous }
  // Once they have tried to post, each field says what is wrong with it until it is fixed
  const errors: ReviewErrors = attempted ? { ...checkReview(draft).errors, ...serverErrors } : {}
  const length = describeReviewLength(body.trim().length)
  const ids = { title: useId(), body: useId(), name: useId(), showAs: useId() }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setAttempted(true)
    setServerErrors({})
    const { request } = checkReview(draft)
    if (!request)
      return

    setSaving(true)
    setSaveError(null)
    try {
      // A review that exists is rewritten, whatever state it is in: a second one is refused
      onSaved(await saveReview(productId, request, !!existing))
    }
    catch (err) {
      // The backend's word on a field goes next to that field
      const fields = (err as { errors?: ReviewErrors }).errors
      if (fields)
        setServerErrors(fields)
      setSaveError(errorMessage(err))
    }
    finally {
      setSaving(false)
    }
  }

  return (
    <form className="account-form review-form" noValidate onSubmit={submit}>
      <div className="review-field">
        <span className="review-label">Your rating</span>
        <ReviewsStarInput value={rating} onChange={setRating} invalid={!!errors.rating} />
        {errors.rating && <p className="error">{errors.rating}</p>}
      </div>

      <div className="review-field">
        <label htmlFor={ids.title}>Headline</label>
        <input
          id={ids.title}
          value={title}
          onChange={e => setTitle(e.target.value)}
          type="text"
          maxLength={REVIEW_LIMITS.titleMax}
          placeholder="Sum it up in a few words"
          aria-invalid={!!errors.title || undefined}
        />
        {errors.title && <p className="error">{errors.title}</p>}
      </div>

      <div className="review-field">
        <label htmlFor={ids.body}>Review</label>
        <textarea
          id={ids.body}
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={6}
          maxLength={REVIEW_LIMITS.bodyMax}
          placeholder="What would you tell the next customer?"
          aria-invalid={!!errors.body || undefined}
        />
        <div className={length.met ? 'review-length met' : 'review-length'}>
          <span className="review-length-bar"><span style={{ width: `${length.fill * 100}%` }} /></span>
          <span className="mono">{length.text}</span>
        </div>
        {errors.body && <p className="error">{errors.body}</p>}
      </div>

      <fieldset className="review-field review-show-as">
        <legend className="review-label">Show it as</legend>
        <label className="checkbox-row">
          <input type="radio" name={ids.showAs} checked={!anonymous} onChange={() => setAnonymous(false)} />
          Your name
        </label>
        {!anonymous && (
          <input
            id={ids.name}
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            type="text"
            aria-label="Name to show"
            maxLength={REVIEW_LIMITS.displayNameMax}
            aria-invalid={!!errors.displayName || undefined}
          />
        )}
        <label className="checkbox-row">
          <input type="radio" name={ids.showAs} checked={anonymous} onChange={() => setAnonymous(true)} />
          Verified owner, with no name
        </label>
        {errors.displayName && <p className="error">{errors.displayName}</p>}
      </fieldset>

      <p className="hint review-terms">
        {`Checked before it appears. By posting, you agree ${vendor?.name ?? 'the store'} may use it in marketing (`}
        <a href={termsUrl} target="_blank" rel="noopener">terms</a>
        ).
        {supportEmail && (
          <>
            {' For help with the product, email '}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            .
          </>
        )}
      </p>

      {saveError && <p className="error">{saveError}</p>}

      <div className="your-review-actions">
        <button type="submit" className="submit" disabled={saving}>
          {saving ? 'Posting…' : existing ? 'Post changes' : 'Post review'}
        </button>
        {cancellable && <button type="button" className="revoke-btn" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}
