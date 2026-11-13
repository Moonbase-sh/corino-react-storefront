import type { MyProductReview, SubmitReviewRequest } from '@moonbase.sh/react'
import { MyReviewStatus, ProductReviewSort, REVIEW_LIMITS, ReviewIneligibilityReason } from '@moonbase.sh/react'
import { formatDate } from './format'

// How reviews read on this site. The wording follows Moonbase's own review screens (the storefront
// widget and the customer portal), so a customer reads the same thing wherever they review.

/** A five-pointed star in a 24 × 24 box, for the ratings and the rating input. */
export const STAR_PATH = 'M12 2.6l2.9 6.2 6.7.7-5 4.6 1.4 6.6L12 17.3l-5.9 3.4 1.4-6.6-5-4.6 6.7-.7z'

/** An average to one decimal, the same in every locale: "4.6". */
export function formatRating(average: number) {
  return average.toFixed(1)
}

/** "1 review", "1,204 reviews". */
export function formatReviewCount(count: number) {
  return `${count.toLocaleString('en-US')} ${count === 1 ? 'review' : 'reviews'}`
}

/** What each rating means, from one star to five. */
export const RATING_WORDS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'] as const

/** "Very good" for 4. Empty for anything that isn't a whole rating. */
export function ratingWord(rating: number | null | undefined): string {
  return rating ? RATING_WORDS[rating - 1] ?? '' : ''
}

export const REVIEW_SORTS = [
  { value: ProductReviewSort.Helpful, label: 'Most helpful' },
  { value: ProductReviewSort.Newest, label: 'Newest' },
  { value: ProductReviewSort.Highest, label: 'Highest rated' },
  { value: ProductReviewSort.Lowest, label: 'Lowest rated' },
] as const

/** "12 people found this helpful". Null with no up votes. */
export function helpfulSentence(upVotes: number): string | null {
  if (upVotes <= 0)
    return null
  return upVotes === 1
    ? '1 person found this helpful'
    : `${upVotes.toLocaleString('en-US')} people found this helpful`
}

/**
 * The store's terms, whose "Reviews" section says how the store may use a review. Posting one sends
 * `allowUse: true`, so the form says so next to its button and links here.
 */
export function reviewTermsUrl(endpoint: string) {
  return `${endpoint.replace(/\/+$/, '')}/terms-of-use#reviews`
}

/**
 * The bar under the review box: it fills toward the minimum length, then says how much of the
 * maximum is used.
 */
export function describeReviewLength(length: number) {
  const met = length >= REVIEW_LIMITS.bodyMin
  return {
    fill: met ? 1 : length / REVIEW_LIMITS.bodyMin,
    met,
    text: met
      ? `${length.toLocaleString('en-US')} of ${REVIEW_LIMITS.bodyMax.toLocaleString('en-US')}`
      : `At least ${REVIEW_LIMITS.bodyMin} characters`,
  }
}

/** "German" for "de". Null when the browser doesn't know the code. */
export function languageName(code: string | null | undefined): string | null {
  if (!code)
    return null
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? null
  }
  catch {
    return null
  }
}

/**
 * Whether a translated review opens in English. It does unless the reader's browser asks for the
 * language it was written in, in which case the original comes first.
 */
export function opensTranslated(language: string | null | undefined): boolean {
  const primary = language?.split('-')[0]?.toLowerCase()
  if (!primary || typeof navigator === 'undefined')
    return true
  const readers = (navigator.languages ?? [navigator.language]).map(l => l.split('-')[0]?.toLowerCase())
  return !readers.includes(primary)
}

export interface ReviewDraft {
  rating: number | null
  title: string
  body: string
  displayName: string
  anonymous: boolean
}

export type ReviewErrors = Partial<Record<'rating' | 'title' | 'body' | 'displayName', string>>

/**
 * The backend's rules, checked before sending so an obvious mistake doesn't cost a round trip. The
 * request is null when a field needs fixing, and `errors` says which.
 */
export function checkReview(draft: ReviewDraft): { request: SubmitReviewRequest | null, errors: ReviewErrors } {
  const title = draft.title.trim()
  const body = draft.body.trim()
  const displayName = draft.displayName.trim()
  const errors: ReviewErrors = {}

  if (draft.rating === null)
    errors.rating = 'Choose a rating'
  if (title.length < REVIEW_LIMITS.titleMin || title.length > REVIEW_LIMITS.titleMax)
    errors.title = `${REVIEW_LIMITS.titleMin} to ${REVIEW_LIMITS.titleMax} characters`
  if (body.length < REVIEW_LIMITS.bodyMin || body.length > REVIEW_LIMITS.bodyMax)
    errors.body = `${REVIEW_LIMITS.bodyMin} to ${REVIEW_LIMITS.bodyMax.toLocaleString('en-US')} characters`
  if (!draft.anonymous && (displayName.length < REVIEW_LIMITS.displayNameMin || displayName.length > REVIEW_LIMITS.displayNameMax))
    errors.displayName = `${REVIEW_LIMITS.displayNameMin} to ${REVIEW_LIMITS.displayNameMax} characters, or show it as Verified owner`

  if (draft.rating === null || Object.keys(errors).length > 0)
    return { request: null, errors }

  return {
    request: {
      rating: draft.rating,
      title,
      body,
      displayName: draft.anonymous ? null : displayName,
      anonymous: draft.anonymous,
      // What the line next to the post button tells the reviewer they agree to
      allowUse: true,
    },
    errors,
  }
}

export type MyReviewTone = 'support' | 'published' | 'checking' | 'neutral'

export interface MyReviewSummary {
  /** False when there's nothing to tell them, as for someone who didn't buy the product here. */
  visible: boolean
  headline: string
  /** Null when the headline says it all. A review that asked for help says more, around the support email. */
  note: string | null
  needsSupport: boolean
  /** The color of the status dot. Null before there's a review to have a status. */
  tone: MyReviewTone | null
  /** "Write a review" or "Edit your review", when they may. */
  action: string | null
  canWithdraw: boolean
}

/** What to tell a customer about their own review of a product, and what they may do with it. */
export function describeMyReview(mine: MyProductReview | null): MyReviewSummary {
  const review = mine?.review ?? null
  const eligibility = mine?.eligibility ?? null
  const status = review?.status

  let headline = 'You bought this product'
  let note: string | null = null
  switch (status) {
    case MyReviewStatus.Published:
      headline = 'Your review is published'
      break
    case MyReviewStatus.UnderReview:
      headline = 'We\'re checking your review'
      note = 'It appears once it has been checked. That usually takes a minute or two.'
      break
    case MyReviewStatus.NeedsSupport:
      headline = 'It looks like you need help'
      break
    case MyReviewStatus.NotPublished:
      headline = 'Your review was not published'
      note = 'You can rewrite it and send it again.'
      break
    case MyReviewStatus.Withdrawn:
      headline = 'You took your review down'
      note = 'You can write a new one whenever you like.'
      break
    case MyReviewStatus.OwnershipLost:
      headline = 'Your review is hidden'
      note = 'It comes back if you own this product again.'
      break
  }

  if (note === null && status !== MyReviewStatus.NeedsSupport) {
    if (eligibility?.reason === ReviewIneligibilityReason.RevisionLimit)
      note = 'You have rewritten this review as many times as you can.'
    else if (eligibility?.reason === ReviewIneligibilityReason.Cooldown)
      note = eligibility.nextEditAllowedAt ? `You can change it again ${formatDate(eligibility.nextEditAllowedAt)}.` : 'You can change it again shortly.'
    else if (!review)
      note = 'Tell other customers how it has worked out for you.'
  }

  const down = status === MyReviewStatus.Withdrawn || status === MyReviewStatus.OwnershipLost
  return {
    visible: !!mine && !(eligibility?.reason === ReviewIneligibilityReason.NotOwner && !review),
    headline,
    note,
    needsSupport: status === MyReviewStatus.NeedsSupport,
    tone: status === undefined
      ? null
      : status === MyReviewStatus.NeedsSupport
        ? 'support'
        : status === MyReviewStatus.Published
          ? 'published'
          : status === MyReviewStatus.UnderReview ? 'checking' : 'neutral',
    action: eligibility?.canReview ? (!review || down ? 'Write a review' : 'Edit your review') : null,
    canWithdraw: !!review && !down,
  }
}

/** How often, and how many times, to ask again after posting while the review is being checked. */
export const REVIEW_POLL = { intervalMs: 3000, attempts: 10 } as const

export function isAwaitingCheck(mine: MyProductReview | null): boolean {
  return mine?.review?.status === MyReviewStatus.UnderReview
}
