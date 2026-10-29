# 07 — Timer

**Parent spec:** `.scratch/terminus-v1/spec.md`

**What to build:** The player can play against the clock. The Attempt setup screen gains a Timer on/off toggle and −/+ controls to set its duration: default 15:00, 1-minute steps, between 1:00 and 60:00. With the Timer on, the Attempt screen shows a countdown instead of the stopwatch, and the Attempt ends as **Time's up** at 0:00. The duration is fixed once the Attempt starts. Results show the Timer setting alongside the Score, and "Play again" reuses it.

**Blocked by:** 06 — Ending an Attempt and Results with the Reveal

**Status:** ready-for-agent

- [ ] The setup screen has a Timer toggle (off by default) and −/+ controls, defaulting to 15:00, stepping by 1 minute, clamped to 1:00–60:00
- [ ] Starting with the Timer on shows a countdown from the chosen duration; with it off, the stopwatch from ticket 06
- [ ] The Attempt ends as Time's up when the countdown reaches 0:00
- [ ] There is no way to change the Timer during an Attempt
- [ ] Results show how the Attempt ended (including Time's up) and the Timer setting used, e.g. "162/197 with a 10:00 Timer"
- [ ] "Play again" reuses the same Timer setting
- [ ] Attempt-seam tests cover the countdown and the Time's up ending via the injected clock, and that Finding all 197 before 0:00 still ends as Completed
