import { formatRating, STAR_PATH } from '@/lib/reviews'

interface StarsProps {
  /** From 0 to 5. A fraction fills part of a star. */
  value: number
  size?: number
  /** Read out in place of the stars. */
  label?: string
}

export function ReviewsStars({ value, size = 14, label }: StarsProps) {
  const width = `${(Math.max(0, Math.min(5, value)) / 5) * 100}%`
  const row = [1, 2, 3, 4, 5].map(n => (
    <svg key={n} width={size} height={size} viewBox="0 0 24 24"><path d={STAR_PATH} /></svg>
  ))

  return (
    <span className="stars" role="img" aria-label={label ?? `${formatRating(value)} out of 5 stars`}>
      <span className="stars-row" aria-hidden="true">{row}</span>
      <span className="stars-row stars-fill" style={{ width }} aria-hidden="true">{row}</span>
    </span>
  )
}
