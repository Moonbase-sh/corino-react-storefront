'use client'

import { useId, useState } from 'react'
import { RATING_WORDS, ratingWord, STAR_PATH } from '@/lib/reviews'

interface StarInputProps {
  value: number | null
  onChange: (rating: number) => void
  invalid?: boolean
}

export function ReviewsStarInput({ value, onChange, invalid }: StarInputProps) {
  // The stars light up to the one under the pointer, as a preview of picking it
  const [hovered, setHovered] = useState<number | null>(null)
  const lit = hovered ?? value ?? 0
  const name = useId()

  return (
    <div
      className="star-input"
      role="radiogroup"
      aria-label="Your rating"
      aria-invalid={invalid || undefined}
      onMouseLeave={() => setHovered(null)}
    >
      {RATING_WORDS.map((word, i) => (
        <label key={word} className={i < lit ? 'lit' : undefined} onMouseEnter={() => setHovered(i + 1)}>
          <input
            type="radio"
            className="visually-hidden"
            name={name}
            value={i + 1}
            checked={value === i + 1}
            onChange={() => onChange(i + 1)}
          />
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d={STAR_PATH} /></svg>
          <span className="visually-hidden">{`${i + 1} ${i === 0 ? 'star' : 'stars'}, ${word}`}</span>
        </label>
      ))}
      <span className="star-input-word mono" aria-hidden="true">{ratingWord(hovered ?? value) || 'Choose a rating'}</span>
    </div>
  )
}
