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
