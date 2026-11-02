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

## Comments

**2026-11-02** — Decided during implementation: the Timer is the Attempt's optional fourth argument, `startAttempt(quiz, mode, clock, timerMs)`, where a `TimerSetting` is the duration in milliseconds or `null` for no Timer, and Attempt state carries `timer: { durationMs, remainingMs } | null`. Each operation reads the clock once. If the Timer has run out by then, the Attempt ends as Time's up (`'times-up'`) with its time stopped at exactly the duration, so an answer, Enter or Give up after 0:00 changes nothing, even before the next tick reads the state. Give up after 0:00 therefore counts as Time's up, not Gave up. The Attempt now stores the time played when it ended instead of an end timestamp, so ticket 08 only has to subtract paused time in `elapsedAt`. The setup screen holds the Timer in whole minutes (default 15, clamped to 1–60; the constants live in `AttemptSetupScreen.tsx`) behind a "Play against the clock" switch that is off by default. The −/+ buttons are disabled while the Timer is off and at the limits. The Attempt screen's 250 ms tick now also notices Time's up and calls `onEnd`. The countdown is rounded up to whole seconds, so it reads 0:00 only once time is up. Times on a Timer are shown in minutes alone (60:00, not 1:00:00) by `formatTimerTime`; the untimed stopwatch is unchanged. Results gain a "Timer" stat (e.g. 10:00, or Off) beside Score and Time. `App` carries the `TimerSetting` on the attempt and results screens, so Play again reuses it. For ticket 10: `onEnd` now has two callers (the tick, and an answer or Give up), so if Records are saved there, make sure one Attempt can't be saved twice. Quiz, Mode and Timer setting now travel together through `App`, so the Records key may be the moment to give them one type.
