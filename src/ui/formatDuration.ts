// A duration as a clock shows it, in whole seconds: 0:05, 12:34 or 1:02:03.
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor(totalSeconds / 60) % 60
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`
}

// A time on a Timer, in whole seconds and never in hours, as a Timer runs for at most 60:00:
// 0:05, 12:34 or 60:00.
export function formatTimerTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
}

// The time an Attempt took. Under a Timer it's shown in minutes alone, like the countdown, so a full
// 60:00 isn't 1:00:00.
export function formatTimeTaken(ms: number, timed: boolean): string {
  return timed ? formatTimerTime(ms) : formatDuration(ms)
}
