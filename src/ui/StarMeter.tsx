import type { CSSProperties } from 'react'
import { MAX_STARS, nextStarScore, STAR_SHARES, starsFor } from '../records/stars.ts'

// What the player names next to earn a Star, or that they've named every Place.
export function goalText(bestScore: number, total: number): string {
  const next = nextStarScore(bestScore, total)
  if (next === null) return `All ${total} named`
  if (next === total) return `Name all ${total} for a third star`
  return `Name ${next} of ${total} for ${starsFor(bestScore, total) === 0 ? 'a' : 'a second'} star`
}

// The best Score as a bar, with a Star at each share of the Places that earns one: filled in ochre
// once the bar reaches it.
export function StarMeter({ id, score, total }: { id?: string; score: number; total: number }) {
  const stars = starsFor(score, total)
  return (
    <div id={id} className="star-meter" role="img" aria-label={`${stars} of ${MAX_STARS} stars`}>
      <div className="star-meter-track">
        <div className="star-meter-fill" style={{ width: `${(score / total) * 100}%` }} />
      </div>
      {STAR_SHARES.map((share, index) => (
        <StarIcon key={share} earned={index < stars} style={{ left: `${share * 100}%` }} />
      ))}
    </div>
  )
}

// Five points, drawn in a 20 × 20 box.
const STAR_PATH = 'M10 1.2 12.29 7.24 18.75 7.56 13.71 11.61 15.41 17.84 10 14.3 4.59 17.84 6.29 11.61 1.25 7.56 7.71 7.24Z'

export function StarIcon({ earned = false, style }: { earned?: boolean; style?: CSSProperties }) {
  return (
    <svg
      className={earned ? 'star earned' : 'star'}
      style={style}
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <path d={STAR_PATH} />
    </svg>
  )
}
