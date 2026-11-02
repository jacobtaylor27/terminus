# 07 — Quiz card: Personal Bests as label over figure

**Parent spec:** `.scratch/quiet-atlas/spec.md` (section "Home: the Quiz list", and "Further Notes" on the "PERSONAL BEST" heading)

**Prototype reference:** branch `prototype/quiet-atlas`, commit `06b0a57` (`pnpm dev`, then `/terminus/` home page with `?card=figures`). Use it as a visual reference only.

**What to build:** The Quiz cards on the home page get wider, so "Countries of the World" fits on one line. Their Personal Bests stop squeezing the setting and the result onto one line. Under a small-caps "PERSONAL BEST" heading, each setting gets its own block: a small-caps label such as "FREE RECALL · TIMER OFF" above its figure. The figure is the Score in the serif with a muted "/197", then the time ("42/197 in 2:22"). A setting not yet played says "Not played yet". The rest of the home layout is unchanged.

**Blocked by:**
- 02 — The quiet-atlas palette as one token set, with the palette check
- 03 — Newsreader for display text

**Status:** ready-for-agent

- [ ] The Quiz list tiles auto-fill columns at least 19rem wide (was 14rem), with a 1rem gap. "Countries of the World" fits on one line
- [ ] The card is paper-raised, with a 1 px hairline-strong border, radius 8 px and padding 1.25rem. Hover gives an ink border; keyboard focus gives a 2 px ink outline. The title is serif 600 at 1.375rem
- [ ] The Personal Best block sits at the card's foot, with 0.75rem of padding above it, under a small-caps "PERSONAL BEST" heading
- [ ] Each setting shown (untimed, and the default Timer, as today) is its own block: 0.7rem vertical padding, a hairline rule above it, and no bottom padding on the last one
- [ ] The setting label joins Mode and Timer with a middle dot instead of a comma ("Free Recall · Timer off", "Free Recall · 15:00 Timer"). It is shown uppercase in the small-label style
- [ ] Below the label, the value is the serif Score with a muted "/total" (the shared Score figure from 03), then " in 2:22" in the system font, ink-muted. An unplayed setting shows "Not played yet" in ink-muted
- [ ] The card is still one button that opens setup, and its contents are still valid inside a button
- [ ] The palette check and the full test suite stay green
- [ ] Checked in the browser on desktop and at 390 px wide, with and without played settings
