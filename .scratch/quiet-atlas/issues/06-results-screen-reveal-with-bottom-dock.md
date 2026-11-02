# 06 — Results screen: the Reveal with a bottom dock

**Parent spec:** `.scratch/quiet-atlas/spec.md` (sections "Results screen", "Further Notes" on the reversal of the top-left summary and the legend counts)

**Prototype reference:** branch `prototype/quiet-atlas`, commit `06b0a57` (`pnpm dev`, then `/terminus/?variant=D`). Use it as a visual reference only.

**What to build:** On Results, the map fills the window and shows the Reveal. Everything else sits in a single row of frosted paper at the bottom centre, over Antarctica, where it covers no land at any laptop window size. The dock reads left to right:

1. the Quiz title over how the Attempt ended;
2. the big Score;
3. Time and Timer;
4. the "New best!" badge, when earned;
5. a legend with counts ("Found 42", "Missed 155");
6. Play again, then a quiet Back to Quizzes link.

In a window narrower than 1024 px, the dock becomes a strip under the map, and the map shrinks to fit above it. Hovering and zooming on the Reveal work as before. There is no separate legend panel.

**Blocked by:**
- 02 — The quiet-atlas palette as one token set, with the palette check
- 03 — Newsreader for display text
- 05 — Attempt screen: full-screen map with floating panels (it reuses the Frosted panel, the strip and the full-screen map layout)

**Status:** ready-for-agent

- [ ] At 1024 px and wider, the map fills the window, and one Frosted dock in a single row sits at the bottom centre. In order, it holds:
  1. the Quiz title as a small label, over the ending heading in the serif;
  2. the serif Score with a muted "/total";
  3. Time and Timer as small labels over values, formatted as today;
  4. the "New best!" badge, only on a new Personal Best;
  5. the legend;
  6. a hairline divider;
  7. Play again (primary), then Back to Quizzes (text link)
- [ ] The legend shows "Found *n*" and "Missed *n*":
  - each is led by a swatch in its colour;
  - the counts are tabular and ink-muted;
  - the counts are the lengths of the final state's Found and Missed lists
- [ ] The badge is an ochre-wash pill with a 1 px ochre border and ochre-ink text (0.8125rem, bold). Its wording is unchanged
- [ ] The separate legend and the old results bar are gone
- [ ] Below 1024 px, the dock becomes an opaque strip under the map. It wraps to two centred rows and the divider is hidden. The map shrinks to fit above it
- [ ] The Reveal behaves as before: Missed Countries are distinct from Found ones, hover names every Country (never Territories), and zoom, pan and Reset view work
- [ ] Nothing is autofocused on Results (unchanged). Play again starts a new Attempt with the same Quiz, Mode and Timer, and Back to Quizzes returns home
- [ ] Checked in the browser at the full-world view for 1280×633, 1366×633, 1440×789, 1536×731, 1920×947, 1024×649, 900×600, 768×1024, 390×844 and 360×740. The dock or strip covers no land; at 1280 and 1366, Chile comes within about 12 px but stays clear
- [ ] Checked with and without the "New best!" badge, and with each ending (Completed, Time's up, Gave up)
- [ ] The palette check and the full test suite stay green

## Comments

**2026-11-02, during implementation.** The floating dock was built and then replaced, at the user's request, by two paper bars at every window size. The user found the bars cleaner.

- **The bar above the map** has Back to Quizzes at the left, the Quiz title over the ending in the centre, and Play again at the right. Below 480 px the two buttons take a row of their own above the heading.
- **The bar under the map** has the legend at the left, the Score centred, and the Time and Timer at the right. The "New best!" badge sits just right of the Score. Below 600 px the Score and badge keep the first row, and the legend and the Time and Timer move to a second.
- **The map** shrinks to fit between the bars, so the bars never cover land. Reset view stays at the map's bottom right. There is no divider, and no frosted panel on this screen.
- **Trade-off:** in short windows the map is smaller than it was under the floating dock. At 1366×633 the oval is about 965 px wide rather than about 1215 px.
