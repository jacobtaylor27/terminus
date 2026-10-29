# 08 — Pause

**Parent spec:** `.scratch/terminus-v1/spec.md`

**What to build:** The player can step away mid-Attempt. A Pause button stops the clock — the stopwatch or the Timer countdown — and covers the screen with an overlay that hides the map and the Found answers, showing only the Score and the time. Answering is impossible while paused. Resuming from the overlay continues where the player left off. Switching browser tabs is not a Pause: the clock keeps running.

**Blocked by:** 06 — Ending an Attempt and Results with the Reveal

**Status:** ready-for-agent

- [ ] The Attempt module supports pause and resume; paused time is excluded from elapsed time
- [ ] Attempt state reports paused status
- [ ] The Pause button shows an overlay that hides the map and answer box and shows only the Score and time
- [ ] Input is ignored while paused
- [ ] Resuming hides the overlay and refocuses the answer box
- [ ] With the Timer on, the countdown does not move while paused, and Time's up cannot fire while paused
- [ ] Leaving the tab without pressing Pause does not stop the clock
- [ ] Attempt-seam tests cover pause/resume with both the stopwatch and the Timer, and that answers are rejected while paused
