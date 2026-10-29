# 10 — Records and Personal Best

**Parent spec:** `.scratch/terminus-v1/spec.md`

**What to build:** Terminus remembers the player's results in this browser. Every finished Attempt is saved with its Quiz, Mode, Timer setting (or untimed), Score and total, time taken, how it ended, Wrong Guess count, and when it finished. From that history, a Personal Best is derived per Quiz, Mode and Timer setting: highest Score wins, and equal Scores go to the shorter time. The Quiz card shows the Personal Best, and Results show "New best!" when an Attempt beats it. History survives closing and reopening the browser.

This is the Records module (the spec's second test seam), built on a small storage interface — browser localStorage in the app, in-memory in tests — with a schema version on the stored data.

**Blocked by:** 07 — Timer

**Status:** ready-for-agent

- [ ] The Records module saves finished Attempts with all fields listed above
- [ ] Records sit behind a storage interface; the app uses localStorage and tests use an in-memory implementation
- [ ] Stored data carries a schema version
- [ ] Personal Best is tracked separately per Quiz, Mode and Timer setting (an untimed result never affects a timed Personal Best, and different Timer durations are separate)
- [ ] Higher Score beats lower; on equal Scores, the shorter time wins
- [ ] An Attempt is saved when it ends (Completed, Time's up or Gave up); an in-progress Attempt is not
- [ ] The Quiz card shows the Personal Best
- [ ] Results show "New best!" when the Attempt set a new Personal Best
- [ ] History and Personal Bests survive a page reload
- [ ] Records-seam tests cover saving, Personal Best per key, the tie-break, and reading back through a fresh Records instance over the same storage
