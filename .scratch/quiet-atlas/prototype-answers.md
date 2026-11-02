# Hand-back: Terminus "quiet atlas" prototype → answers

## Where this came from

Answers to the open questions in `handoff.md` (next to this file), settled by `/prototype` on 2026-11-02. The user chose by playing the real flow against the real `WorldMap`. The window-size answers come from hit-testing the panels against the map's Country shapes in headless Chrome. These are values, not code: the implementation should be written fresh from them. The next step is `/to-spec` → `/to-tickets` → `/implement`.

The prototype is kept on the local branch `prototype/quiet-atlas` in `C:\jatay\repos\terminus`. The user commits it there; it is not to be merged. See "Prototype source" at the end.

## Reversal of an agreed decision

**Decision 5 (Results layout) changes.** The summary moves from a top-left panel to a **one-row dock at the bottom centre, over Antarctica**. The Found/Missed legend moves inside the dock, so there is no separate legend panel.

- **Why.** The top-left summary panel is about 240×310 px. It covered Alaska, western Canada and the US west coast at every laptop window measured (1280 to 1920 wide), and most of the Americas at 1024. That hides the Reveal where it matters. The dock is about 974×73 px and clears land at every size measured.
- **Below 1024 px wide**, the dock becomes a strip under the map: two centred rows, and the map shrinks to fit above it. A floating two-row dock was tried first. It covered the Falklands (UK) and Kerguelen (France).
- **Dock order:** Quiz title (small caps) over the ending heading | big Score | Time, Timer | "New best" badge | legend "Found *n*  Missed *n*" | a hairline divider | Play again (filled ink), Back to Quizzes (text link).
- **New detail:** the legend shows counts. It was not discussed in the grilling, so confirm it in the spec.

## Scope addition: the Quiz card's Personal Bests

The home layout was out of scope. During the prototype, though, the user found the Quiz card's Personal Best rows cramped. The tile is only 14rem wide, so "Free Recall, Timer off" and "42/197 in 2:22" squeeze onto one line, and the serif title wraps. Four cards were compared on the real home page: the current card, a wide ledger row with dot leaders, a Mode × Timer table, and **label over figure**. The user chose **label over figure**. The rest of the home and setup layout is unchanged.

- **Tiles:** `repeat(auto-fill, minmax(19rem, 1fr))`, gap 1rem, previously 14rem. At 19rem, "Countries of the World" fits on one line.
- **Card:** paper-raised, 1 px hairline-strong border, radius 8 px, padding 1.25rem. Hover is an ink border; focus is a 2 px ink outline. About 199 px tall with two settings.
- **Title:** Newsreader 600, 1.375rem, line-height 1.2.
- **Records:** a block pushed to the card's foot (`margin-top: auto`, 0.75rem padding above). Each setting is its own block: 0.7rem vertical padding, a hairline rule above it, and no bottom padding on the last one.
  - **Label:** small caps, 0.6875rem, weight 600, letter-spacing 0.08em, ink-muted. It reads "FREE RECALL · TIMER OFF" / "FREE RECALL · 15:00 TIMER": a middle dot where the current card has a comma.
  - **Value**, below the label: the Score in Newsreader 600 at 1.375rem, tabular lining figures, then "/197" at 0.6em, weight 500, ink-muted, then " in 2:22" in the system font, ink-muted. An unplayed setting shows "Not played yet" in ink-muted.
- **Open point for the spec:** this card doesn't show the words "Personal Best", which the current card does as a heading. Decide whether to keep the glossary term as a small-caps "PERSONAL BEST" heading above the records, or leave it out.
- **Not chosen:** the ledger. It was compact on desktop but wrapped "15:00 Timer" on phones. Also not chosen: the table.

## Other decisions

No other decision is reversed. The Attempt screen keeps the agreed floating-corners layout. Give up is in the Pause overlay as agreed: Resume is the main button, Give up the secondary one. The calm top bar fallback isn't needed.

## Answers

### 1. Shades: the "Strong" set

| Token | Hex | Job |
|---|---|---|
| ink | `#121820` | All text, filled primary button, selected and focus outlines |
| ink-muted | `#4f5966` | Secondary text, small labels, the "/197" |
| paper | `#fcfbf8` | Page and panels |
| land | `#f4f1ea` | Country fill |
| land-edge | `#8f979f` | Country borders |
| sea | `#cfe0ec` | Sphere |
| territory | `#dedbd3` | Antarctica, Western Sahara, Siachen |
| found | `#1f6a6c` | Found (muted teal) |
| found-tint | `#8ecfcc` | New-find pulse |
| missed | `#d4682f` | Missed (terracotta) |
| ochre | `#e3a92a` | Unfound Highlight fill; "New best" border |
| ochre-ink | `#6a4708` | "New best" text |
| ochre-wash | `#fbe8b8` | "New best" fill |

Derived from the set, as used in the prototype:
- hairline: ink at 14% alpha.
- hairline-strong (borders, rules): ink at 28%.
- hover wash: ink at 6%.
- paper-raised (cards, Mode options, answer box): paper mixed 55% with white.
- grid: ink at 11%.
- marker strokes: their fill mixed 55% with black (ochre 50%).
- primary hover: ink 82% with paper.

Checks, all passing. WCAG contrast ratios:
- ink on paper 17.2:1; ink-muted on paper 6.9:1; paper on the ink button 17.2:1.
- badge text 6.9:1; ink outline on land 15.8:1.
- found vs land 5.6:1; missed vs land 3.2:1; found vs sea 4.7:1.

Colour-blind separation is measured as CIEDE2000 difference on Machado simulations, for normal / deutan / protan / tritan vision. The target is at least 20 under all four:
- Found vs Missed: 46 / 40 / 29 / 57.
- Found vs Ochre: 48 / 50 / 42 / 54.
- Ochre vs land: at least 26. Found vs sea: at least 38.

Margins to protect:
- Muted text on a Frosted panel over solid Found is **4.5:1, exactly AA**. Strong is the only candidate set that passes this. Re-check before lightening ink-muted or lowering the panel opacity.
- Missed vs land is 3.2:1. Don't lighten Missed.
- Protanopia drove the teal and terracotta choice. A greener teal against a redder terracotta fell to 16–18 under protan. Separation comes from a bluer, darker teal against a more orange terracotta, on the blue–yellow axis that red-green colour-blind players keep.

### 2. Serif: Newsreader

- **Bundling.** npm package `@fontsource-variable/newsreader` (5.3.0). Import `@fontsource-variable/newsreader/opsz.css` once at app start. Family `'Newsreader Variable'`, stack `'Newsreader Variable', Georgia, serif`, `font-display: swap`. Vite copies the woff2 into `dist/assets`, so no CDN is involved.
- **Size.** Only the Latin subset downloads for English text: **132 KB** with the weight and optical-size axes. `index.css` (weight only) is 58 KB but loses the optical sizes at display sizes.
- **Tabular digits:** yes, and its default figures are already tabular. Still set `font-variant-numeric: tabular-nums lining-nums` on the figures.
- **Weight 600, used for:**
  - "Terminus" (3rem), page headings, Quiz card titles (1.375rem);
  - "Paused" (3.25rem), the Results heading (1.75rem);
  - Score figures: Attempt 1.75rem, Pause 2.5rem, Results dock 2.25rem. "/197" is 0.6em, weight 500, ink-muted.
- **Not chosen:** Fraunces, Source Serif 4.

### 3. Floating panels vs window sizes

Sizes are browser viewports, meaning the screen minus taskbar and browser chrome, plus a tablet and two phones. The table shows what sits under each panel at the full-world view.

| Viewport | Attempt (floating corners) | Results (dock) |
|---|---|---|
| 1280×633 | Chukotka tip under top-right panel (~45×45 px) | clear (Chile within 12 px) |
| 1366×633 | Chukotka tip under top-right panel (~33×33 px) | clear (Chile within 12 px) |
| 1440×789 | clear | clear |
| 1536×731 | Chukotka tip under top-right panel (~20×20 px) | clear |
| 1920×947 | clear | clear |
| 1024×649 | clear | clear (strip) |
| 900×600 | clear | clear (strip) |
| 768×1024 | clear | clear (strip) |
| 390×844, 360×740 | clear (strips) | clear (strip) |

- **Accepted:** the far tip of Chukotka (Russia) sits under the Unfound Highlight / Pause panel at 1280, 1366 and 1536 wide. Russia stays plainly visible. The Score and clock panel comes within 12 px of Russia or the USA at 1280 and 1440 but never covers land. The answer box and Reset view were clear everywhere.
- **Where the layout broke, all fixed in the prototype:**
  1. The top-left Results summary, at every laptop size: the reversal above.
  2. The full Unfound Highlight label made the phone top strip 7 px too wide at 390: see 6.
  3. The one-row Results dock needs about 1010 px: hence the strip below 1024.
- **Not judged:** how the panels feel when zoomed in, where they necessarily sit over land. Frosted panels let the map show through.

### 4. Grid: on

A 10° latitude/longitude grid (`geoGraticule10`), drawn over the sea and under the land: ink at 11% alpha, 0.75 px, non-scaling stroke. The oval outline is a 1 px ink non-scaling stroke drawn above the land. Neither takes pointer events.

### 5. Panel style: Frosted

- **Panel:**
  - background: paper at 72% (`color-mix(in srgb, var(--paper) 72%, transparent)`);
  - `backdrop-filter: blur(8px) saturate(1.2)`;
  - border: 1 px, ink at 12%;
  - corner radius: 8 px;
  - no shadow.
  - Reset view gets the same treatment.
- **Placement:** panels sit 1rem from the window edges. Padding is 0.55rem 0.9rem for Score and clock, 0.45rem for the controls, 0.5rem around the answer box. The answer panel is min(26rem, 100% − 2rem) wide.
- **Narrow screens (≤720 px), strips:** opaque paper, no radius or blur, and a hairline-strong rule between strip and map.

### 6. "Unfound Highlight" label

- **Desktop:** the full label "Unfound Highlight", led by an ochre swatch. The swatch is a hollow square with a 1.5 px dark-ochre outline when off, and filled ochre when on. Pressed state: ink border plus a 1 px inset ink ring, never a fill. It fits at every desktop size.
- **≤720 px:** the visible label drops " Highlight" and reads "Unfound". The accessible name stays "Unfound Highlight" (`aria-label`). The tooltip reads "Unfound Highlight: marks where every Unfound answer is, without naming any". So the glossary term stays visible on desktop, and stays in the name and tooltip on phones.

## Other values the spec will need

- **Buttons:**
  - Secondary: transparent, 1 px hairline-strong border, radius 5 px, padding 0.4rem 0.8rem, 0.9375rem; hover is the wash.
  - Primary: ink fill, paper text, weight 600. Large primary (Resume): padding 0.65rem 2.5rem, 1.125rem.
  - Text link (Back to Quizzes): ink, underline in hairline-strong at 0.2em offset, solid on hover.
  - Focus: 2 px ink outline at 2 px offset.
- **Answer box:** paper-raised, 1 px hairline-strong border, radius 4 px, 1.25rem. Focused: ink border plus a 1 px ink ring. No blue.
- **Small labels** (SCORE, TIME, TIMER, the Quiz title on Results): 0.6875rem, weight 600, letter-spacing 0.08em, uppercase, ink-muted.
- **Map cues:**
  - Already-found flash: no fill, 2.5 px ink stroke, blinking twice over 1.2 s (on 0–22%, off 25–47%, on 50–72%, off 75–100%).
  - Pulse: found-tint fill and stroke, with the existing animation.
  - Unfound Highlight: ochre fill on Unfound Countries; Unfound markers get a 2.5 px dark-ochre stroke.
  - Hover outline: ink. Tooltip: ink background, paper text.
- **Pause overlay:** opaque paper. "Paused" in the serif, then the stats (small-caps labels, serif Score, system-font tabular clock at 2rem), then Resume (large primary, autofocused), with Give up below it as a secondary button.
- **Home and setup** (palette and type only, apart from the Quiz card above):
  - Quiz cards, Mode options and the Timer box: paper-raised with hairline-strong borders. Hover is an ink border; a selected Mode gets an ink border plus a 1 px ink ring.
  - The Timer switch is ink when on; Start is filled ink.
  - The old blue `#2f6fbf` and the purple Unfound Highlight `#7a4fbf`/`#b597e6` are gone.
- **Keyboard flow,** checked in the browser:
  - Start has focus when setup opens.
  - The answer box has focus when the Attempt starts, and keeps it when the Unfound Highlight is toggled.
  - Resume has focus on Pause, and Enter there puts focus back in the answer box.
  - Enter clears a wrong guess.

## Prototype source

- **Branch:** `prototype/quiet-atlas`, branched from `master` at `28fc1e5`. The prototype is commit **`06b0a57`**, pushed to `origin/prototype/quiet-atlas`. Point each ticket at this commit.
- **Run it:** `pnpm dev`, then open `/terminus/?variant=D`. D is the chosen design, and the defaults are the chosen switches, including the chosen Quiz card (`?card=figures`). A, B and C are the floating corners, the calm top bar and the bottom dock. On the home page the bar cycles the Quiz cards instead (`now`, `ledger`, `table`, `figures`).
- **What's in it:**
  - `src/ui/prototype-quiet-atlas/`;
  - `src/ui/PrototypeSwitcher.tsx`;
  - small additions to `src/map/WorldMap.tsx` (a `graticule` prop, `data-id` on shapes, an outline path);
  - a switch in `src/App.tsx`;
  - three font packages in `package.json`.
- **Worth keeping as a reference:** `src/ui/prototype-quiet-atlas/shades.ts` holds the colour sets and the contrast and colour-blindness checker. Run it with `node src/ui/prototype-quiet-atlas/shades.ts`.
