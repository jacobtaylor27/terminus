# 06 — Ending an Attempt and Results with the Reveal

**Parent spec:** `.scratch/terminus-v1/spec.md`

**What to build:** Attempts now have a clock and an end. A stopwatch on the Attempt screen counts up from 0:00. The Attempt ends as **Completed** the moment all 197 Countries are Found, or as **Gave up** when the player presses Give up. The Results screen shows the Score, the time taken, and how the Attempt ended, above a Reveal map where Missed Countries are shown in a contrasting color (e.g. red), distinct from Found ones. The Reveal map can be zoomed and panned, and hovering any Country — Found or Missed — shows its name. "Play again" starts a new Attempt with the same Quiz and Mode; "Back to Quizzes" returns to the Quiz list.

This ticket introduces time into the Attempt module: time is injected (each operation takes the current timestamp, or the module takes a clock) so tests control it and the module never reads the real clock. Elapsed time is computed from timestamps, so throttled background tabs don't drift it.

**Blocked by:** 04 — Map interaction; 05 — Quiz list and Attempt setup screens

**Status:** ready-for-agent

- [ ] The Attempt module takes time as an input rather than reading the real clock, and reports elapsed time in its state
- [ ] The Attempt screen shows a stopwatch counting up, driven by the UI ticking the Attempt module
- [ ] Elapsed time stays correct after the tab has been in the background
- [ ] Finding the 197th Country ends the Attempt as Completed immediately
- [ ] A Give up button ends the Attempt as Gave up
- [ ] Attempt state reports status (in progress, Completed, Gave up) and, once ended, the Missed Countries
- [ ] The Results screen shows Score, time taken and how the Attempt ended
- [ ] The Reveal map shows Found and Missed Countries in distinct colors, including tiny-Country markers
- [ ] The Reveal map supports zoom, pan and reset view, and shows every Country's name on hover (territories still show nothing)
- [ ] "Play again" starts a fresh Attempt with the same Quiz and Mode; "Back to Quizzes" returns to the Quiz list
- [ ] Attempt-seam tests cover elapsed time via the injected clock, both endings, and the Missed list

## Comments

**2026-10-29** — Decided during implementation: the Attempt is given a clock as its third argument, `startAttempt(quiz, mode, clock)`, where a `Clock` is `() => number` in milliseconds, so ticket 07's optional Timer duration can go after it. The app passes `Date.now`, which keeps counting through background tabs and a sleeping computer (`performance.now()` can stop during sleep), at the cost of following any system clock change mid-Attempt. Tests pass a clock they move by hand. Elapsed time is the clock's reading minus the start, frozen at the moment the Attempt ends. Attempt state is a union on `status`: `'in-progress'`, or an `Ending` (`'completed' | 'gave-up'`) that also carries `missed`, so only an ended Attempt has Missed Countries; adding ticket 07's Time's up to `Ending` won't typecheck until the Results screen's `endingTitles` has a title for it. Once ended, an Attempt ignores answers, Enter and Give up. The UI ticks the Attempt every 250 ms for the stopwatch, which is held apart from the rest of the state so a tick doesn't rebuild the map's shapes; it shows m:ss, and h:mm:ss after an hour. Give up ends the Attempt at once, with no confirmation. The Results screen is a bar — the Quiz title, how the Attempt ended, Score, time, a small Found/Missed colour legend, Play again and Back to Quizzes — above the Reveal map, where Missed Countries and markers are red. `WorldMap` takes `missedIds` (`null` during an Attempt). Nothing on Results is focused on arrival, so a stray Enter after the last answer can't start a new Attempt. The ended state reaches Results through `onEnd` in `App`, which is where ticket 10 can save the Attempt to Records.
