# 02 — Cued Recall: one Prompt at a time

**Parent spec:** `.scratch/us-state-capitals/spec.md` (sections "Mode", "Attempt module", "Prompt panel", "Quiz card"; stories 16–21 and 25–28)

**What to build:** The *US State Capitals* setup screen offers Cued Recall alongside Free Recall. In a Cued Recall Attempt:

- the answer panel shows "Capital of" over a State's name, with the Prompts in a new random order each Attempt;
- typing that State's capital auto-accepts it: the State fills in and pulses, and the next Prompt appears;
- Enter on anything else is a Wrong Guess, even another State's capital. The box clears and the Prompt stays;
- the map never highlights the prompted State;
- the Attempt is Completed once all 50 are Found, and the Results Reveal works as in Free Recall.

There is no Skip yet: the only way past a Prompt is its answer, or Give up from the Pause overlay.

**Blocked by:** 01 — US State Capitals in Free Recall, on a US map

**Status:** ready-for-agent

- [ ] `Mode` gains `'cued-recall'`, with `modeDetails` name "Cued Recall" and the description "Answer one prompt at a time, in a random order. Skip any you're stuck on."
- [ ] *US State Capitals* has `modes: ['free-recall', 'cued-recall']` and `promptLabel: 'Capital of'`
- [ ] `startAttempt` takes injected randomness (`() => number`, default `Math.random`). In Cued Recall it shuffles the Places once, at the start
- [ ] `state()` gains `prompt`: the current Prompt in Cued Recall while the Attempt is in progress or paused, and null in Free Recall and after the end
- [ ] In Cued Recall:
  - `inputChanged` accepts only the current Prompt's name or Aliases, and then the next Prompt becomes current;
  - anything else is `no-match`, never `already-found`;
  - `commit` on non-empty text is `wrong-guess`, and on empty text is `nothing`
- [ ] Free Recall's behavior is unchanged, and its existing tests pass untouched
- [ ] The Prompt panel:
  - in Cued Recall, the answer panel shows the `promptLabel` as a small label over the Prompt in the display serif, directly above the answer box;
  - focus stays in the answer box from one Prompt to the next;
  - the larger panel still clears the States at the window sizes checked in ticket 01
- [ ] The Pause overlay hides the Prompt, and the Prompt panel is inert while paused
- [ ] Results and Records work in Cued Recall, with Personal Bests kept apart from Free Recall's
- [ ] The *US State Capitals* card shows four Personal Bests, each Mode untimed and at 15:00, and lays them out cleanly
- [ ] Attempt-seam tests cover:
  - the injected order;
  - only the current Prompt's capital, or its Alias, being accepted;
  - another capital: `no-match` on input, Wrong Guess on Enter;
  - a Found capital as a Wrong Guess on Enter;
  - empty Enter doing nothing;
  - answers blocked while paused and after the end;
  - Completed after the 50th answer;
  - Time's up;
  - `prompt` null in Free Recall and after the end
- [ ] Typecheck, the palette check and the full test suite stay green
