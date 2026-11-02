# 02 — The quiet-atlas palette as one token set, with the palette check

**Parent spec:** `.scratch/quiet-atlas/spec.md` (sections "Palette", "Shared control styling", "Map component" fills and cues, "Setup screen", "Testing Decisions" Seam 2)

**Prototype reference:** branch `prototype/quiet-atlas`, commit `06b0a57` (`pnpm dev`, then `/terminus/?variant=D`). Its shade checker module holds the colour maths. Write the implementation fresh, and where the prototype and the spec differ, follow the spec.

**What to build:** All four screens switch to the quiet-atlas palette: paper, ink, a pale sea, teal for Found, terracotta for Missed and ochre for the Unfound Highlight. The layouts don't change.

- **Tokens.** Every colour is declared once as a named token at the stylesheet's root:
  - the "Strong" base set;
  - the derived tokens (hairline, hairline-strong, wash, paper-raised, grid, primary-hover, marker strokes);
  - the Frosted panel's paper share.

  So a dark theme could later redefine one set.
- **Controls.** Every control is drawn in ink: filled-ink primary buttons, outlined secondary buttons, Back to Quizzes as an ink text link, and ink focus rings. The answer box gets its ink focus ring. A selected Mode gets an ink border and ring, and the Timer switch is ink when on.
- **Map colours:**
  - Found is teal and Missed is terracotta;
  - the Unfound Highlight fills in ochre, with dark-ochre marker rings;
  - Territories are warm grey;
  - the hover outline and the tooltip are ink.
- **Badge.** The "New best!" badge is ochre.
- **Cues.** The already-Found flash becomes an ink outline that blinks twice, instead of a yellow fill. The new-find pulse uses the Found tint.
- **Palette check.** A new test guards the contrast and colour-blind margins, and fails if a colour literal appears outside the token set.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Every base and derived token from the spec is declared at the stylesheet's root, including the panel-paper share (72%)
- [ ] No hex colour literal remains outside the root token block. The old blue, purple, green/red and yellow are gone
- [ ] Primary, secondary and text-link buttons, the focus outline and the answer box are styled as in the spec's "Shared control styling", across all four screens
- [ ] Setup screen: Mode options and the Timer box are paper-raised with hairline-strong borders. Hovering a Mode gives an ink border; a selected Mode gets an ink border and ring. The radio accent is ink, the Timer switch is ink when on, the stepper buttons are secondary buttons and Start is a large primary
- [ ] Quiz card: paper-raised with a hairline-strong border; ink border on hover; 2 px ink outline on keyboard focus
- [ ] Map: Found is teal, Missed terracotta, Territories warm grey, the sea and land-edge use their tokens, and each marker's stroke is its fill's derived marker colour
- [ ] Unfound Highlight: ochre fill on Unfound Countries, and a 2.5 px dark-ochre stroke on Unfound markers. The pressed button uses ink, never purple
- [ ] Already-found flash: no fill, a 2.5 px ink stroke, blinking twice over 1.2 s (on 0–22%, off 25–47%, on 50–72%, off 75–100%)
- [ ] Pulse: found-tint fill and stroke, with the existing animation
- [ ] Tooltip: ink background, paper text. Hover outline: ink
- [ ] "New best!" badge: ochre-wash fill, ochre border, ochre-ink text. The Results legend swatches use found and missed
- [ ] Palette check test, reading the stylesheet's root tokens. It asserts:
  - text contrast of at least 4.5:1 for ink on paper, ink-muted on paper, paper on ink and ochre-ink on ochre-wash;
  - at least 4.5:1 for ink-muted on a Frosted panel over Found (paper at the panel share, composited over found);
  - non-text contrast of at least 3:1 for found vs land, missed vs land, found vs sea and ink vs land;
  - a CIEDE2000 difference of at least 20 under normal, deutan, protan and tritan simulation (Machado 2009, full severity) for found vs missed, found vs ochre, ochre vs land and found vs sea;
  - no hex literal outside the root block
- [ ] The palette check asserts thresholds, not exact hex values. The full test suite is green
- [ ] Checked in the browser on every screen: no leftover blue, purple, green or red. The flash reads as an ink blink, not as the Unfound Highlight
