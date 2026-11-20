// A Quiz earns Stars for its best Score in any Mode and with any Timer setting: one for naming half of
// its Places, two for four-fifths, and three for all of them. Each share is rounded up, so half of 197
// is 99.
export const STAR_SHARES = [1 / 2, 4 / 5, 1] as const

export const MAX_STARS = STAR_SHARES.length

// The Score that earns each Star in a Quiz of the given total, lowest first.
function starScores(total: number): number[] {
  return STAR_SHARES.map((share) => Math.ceil(share * total))
}

// How many Stars a best Score earns, from 0 to MAX_STARS.
export function starsFor(score: number, total: number): number {
  return starScores(total).filter((needed) => score >= needed).length
}

// The Score that earns the next Star after the best one, or null once every Star is earned.
export function nextStarScore(score: number, total: number): number | null {
  return starScores(total).find((needed) => score < needed) ?? null
}
