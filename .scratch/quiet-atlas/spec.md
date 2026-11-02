# Spec: Quiet atlas — a calmer look for Terminus

Status: ready-for-agent

## Problem Statement

Terminus works, but it looks busy and generic.

- **Attempt screen.** A white top bar crams the answer box, Score, clock and three buttons into one row above the map.
- **Results screen.** A second bar does the same thing.
- **Colour.** About 25 hard-coded colours don't form a set. Controls use a stock blue, Found and Missed are green and red, the Unfound Highlight is purple, and the already-Found flash is yellow. That yellow looks like a highlight while the Unfound Highlight is on.
- **Type.** The system font everywhere gives the game no character.
- **Give up.** It sits next to Pause and ends the Attempt in one click, with no confirmation.
- **Quiz cards.** On the home page, each card squeezes "Free Recall, Timer off" and "42/197 in 2:22" onto one line of a narrow tile, and the Quiz title wraps.

## Solution

A "quiet atlas" look: paper neutrals, ink text, a pale sea, and one palette where each colour does one job. Muted teal is Found, terracotta is Missed, ochre is the Unfound Highlight and the "New best!" badge, and ink is every control.

- **Attempt screen.** The map fills the window. Small frosted-paper panels float in the empty corners around the world oval:
  - Score and clock at top left;
  - Unfound Highlight and Pause at top right;
  - the answer box at bottom centre, over Antarctica;
  - Reset view at bottom right, where it already is.
- **Give up** moves into the Pause overlay, under Resume. This is the only behaviour change.
- **Results screen.** The map fills the window and shows the Reveal. Everything else sits in one dock at bottom centre, over Antarctica.
- **Type.** A serif bundled with the app, Newsreader, is used for display text. Everything else stays in the system font.
- **Map.** A faint latitude/longitude grid over the sea and a fine ink outline around the oval.
- **Quiz cards** show each Personal Best as a small-caps label above its figure.
- **Setup screen.** New palette and type, same layout.
- **Narrow windows.** Panels become opaque strips along the top and bottom edges, outside the oval.

## User Stories

### Look and palette

1. As a player, I want the app to look like a quiet paper atlas (paper backgrounds, ink text, a pale sea), so that playing feels calm and the map is the centre of attention.
2. As a player, I want every control drawn in ink rather than a stock blue: buttons, selected options, focus rings and the Timer switch. That way the controls feel part of the same atlas.
3. As a player, I want Found Countries in a muted teal, so that my progress reads clearly without shouting.
4. As a player, I want Missed Countries in terracotta, so that the Reveal stands apart from what I Found.
5. As a player, I want the Unfound Highlight in ochre, so that it never looks like Found or Missed.
6. As a player, I want the "New best!" badge in the same ochre family, so that it reads as an award, not a warning.
7. As a red-green colour-blind player, I want Found, Missed and the Unfound Highlight to stay clearly different, so that I can read my map and the Reveal.
8. As a player with low vision, I want all text and controls to meet WCAG AA contrast, including muted text on panels over the map, so that I can read everything.
9. As a player, I want Territories drawn in a warm grey close to the land, so that they sit quietly and never look like answers.

### Type

10. As a player, I want display text set in a serif, so that the game has character. Display text means the "Terminus" title, page headings, Quiz card titles, "Paused", the Results heading and the big Score figures.
11. As a player, I want all other text in my system font, so that labels, buttons and the answer box stay plain and readable.
12. As a player, I want Score and clock figures in fixed-width digits, so that they don't jitter as they change.
13. As a player, I want the "/197" after a Score smaller and muted, so that the number I've Found stands out.
14. As a player, I want the serif served from the site itself, so that playing doesn't call a third-party font service.
15. As a player on a slow connection, I want headings to appear at once in a fallback serif while the font loads, so that I never stare at blank text.

### The map

16. As a player, I want a faint latitude/longitude grid over the sea, so that the map feels like an atlas.
17. As a player, I want a fine ink outline around the world oval, so that the map has a clear edge against the page.
18. As a player, I want the map to carry no labels, texture or shaded terrain, so that nothing gives answers away or competes with the colours.
19. As a player, I want typing an already-Found Country to blink an ink outline around it twice, so that I see it already counted without it looking like the Unfound Highlight.
20. As a player, I want a newly Found Country to pulse in a light tint of the Found teal, so that the pulse matches its Found colour.
21. As a player, I want the Unfound Highlight to fill Unfound Countries in ochre and ring Unfound markers in dark ochre, so that even tiny Unfound Countries stand out.
22. As a player, I want the hover outline and the name tooltip drawn in ink, so that they match the rest of the controls.
23. As a player, I want the grid and the outline never to catch my pointer, so that hovering, dragging and zooming work as before.

### Attempt screen

24. As a player, I want the map to fill the whole window during an Attempt, so that I see as much of the world as possible.
25. As a player, I want the answer box in a small panel at the bottom centre, over Antarctica, so that it covers no Country I need to see.
26. As a player, I want my Score and clock in a small panel at the top left, so that they're always in view without crowding the map.
27. As a player, I want the Score and the clock each labelled in small capitals (SCORE, and TIME or TIME LEFT), so that I know which number is which.
28. As a player, I want the Unfound Highlight and Pause buttons together in a panel at the top right, so that the controls are grouped away from the answer box.
29. As a player, I want Reset view to stay at the bottom right, so that I find it where it always was.
30. As a player, I want the panels to be translucent frosted paper, so that I can still see the map through them, especially when zoomed in.
31. As a player on a common laptop window (1280 to 1920 px wide), I want the panels to sit over empty sea at the full-world view, so that they cover no land. The one accepted exception is the far tip of Chukotka at some widths.
32. As a player, I want the answer box focused when the Attempt starts, so that I can type straight away (unchanged).
33. As a player, I want toggling the Unfound Highlight to leave focus in the answer box, so that I can keep typing (unchanged).

### The Unfound Highlight button

34. As a player, I want the Unfound Highlight button to show an ochre swatch, hollow when off and filled when on, so that I can tell at a glance whether it's on and what colour it paints.
35. As a player, I want the pressed Unfound Highlight button marked with an ink border and ring, never a fill, so that it looks like the other selected controls.
36. As a player on a desktop, I want the button to read "Unfound Highlight" in full, so that I learn the feature's name.
37. As a player on a phone, I want the button to read "Unfound", so that it fits the top strip.
38. As a screen-reader user, I want the button's accessible name to stay "Unfound Highlight", with its pressed state announced, so that the short label on phones loses nothing.
39. As a player, I want hovering the button to explain it ("Unfound Highlight: marks where every Unfound answer is, without naming any"), so that I know it won't give answers away.

### Pause and Give up

40. As a player, I want Give up removed from the play screen, so that I can't end an Attempt by a slip of the mouse next to Pause.
41. As a player, I want Give up in the Pause overlay, below Resume, so that ending an Attempt takes a deliberate Pause first.
42. As a player, I want Resume as the main, larger button and Give up as a secondary one, so that carrying on is the easy choice.
43. As a player, I want Resume focused when the Pause overlay opens, so that Enter resumes at once (unchanged).
44. As a player, I want focus back in the answer box after Resume, so that I can carry on typing (unchanged).
45. As a player, I want giving up from the Pause overlay to end the Attempt as Gave up, with only the time played before the Pause, so that paused time never counts.
46. As a player, I want the Pause overlay to stay opaque paper, so that the map and my Found answers stay hidden while the clock is stopped.
47. As a player, I want "Paused" in the serif and my Score and time shown large, so that the overlay is calm and easy to read.

### Results screen

48. As a player, I want the Results map to fill the window, so that I can study the Reveal.
49. As a player, I want my results in one dock at the bottom centre, over Antarctica, so that it covers no land at any laptop window size.
50. As a player, I want the dock to read left to right like a sentence: the Quiz title over how the Attempt ended, my big Score, Time and Timer, the "New best!" badge, the legend, then Play again and Back to Quizzes.
51. As a player, I want the legend to show counts ("Found 42, Missed 155"), so that I see how many I Missed without counting.
52. As a player, I want Play again as a filled ink button and Back to Quizzes as a quiet text link, so that the next Attempt is the obvious next step.
53. As a player, I want hovering and zooming on the Reveal to work as before, so that I can learn the Countries I Missed.
54. As a player in a window narrower than 1024 px, I want the dock to become a strip under the map, with the map shrinking to fit above it, so that the dock never covers land.

### Narrow screens

55. As a player on a phone or in a window up to 720 px wide, I want the Attempt panels to become opaque strips along the top and bottom edges, outside the oval, so that they never cover the map.
56. As a player on a phone, I want every Attempt control to fit at 360 px wide:
    - the top strip holds the Score and clock on the left, and Unfound and Pause on the right;
    - the answer box sits in the bottom strip.

### Home: the Quiz list

57. As a player, I want "Terminus" set large in the serif, so that the home page has a clear identity.
58. As a player, I want wider Quiz cards, so that "Countries of the World" fits on one line.
59. As a player, I want each Personal Best on a Quiz card shown as a small-caps label ("FREE RECALL · TIMER OFF") above its figure ("42/197 in 2:22"), so that the setting and the result don't squeeze onto one line.
60. As a player, I want the Score in each Personal Best set in the serif, with a muted "/197" and time, so that the figure to beat stands out.
61. As a player, I want a setting I haven't played to say "Not played yet", so that I know there's no record to beat (unchanged).
62. As a player, I want the card's records headed "PERSONAL BEST", so that I know what the figures are.
63. As a player, I want a Quiz card to show an ink border on hover and an ink outline on keyboard focus, so that I can see which card I'm on.

### Setup screen

64. As a player, I want the setup screen in the new palette and type, laid out as before, so that it matches without my having to relearn it. That means a serif Quiz title, an ink-selected Mode, an ink Timer switch and a filled-ink Start.
65. As a player, I want Start focused when setup opens, so that Enter starts straight away (unchanged).
66. As a player, I want Back to Quizzes to look like an ink text link, so that it matches the Results screen.

### Developer

67. As the developer, I want every colour defined once as a named token at the stylesheet's root, so that a dark theme can be added later by redefining one set.
68. As the developer, I want a test that fails if a palette change breaks contrast or colour-blind separation, so that I can tune shades without re-running the prototype's checker by hand.
69. As the developer, I want the font bundled into the site's own assets by the build, so that GitHub Pages serves everything and no CDN is involved.
70. As the developer, I want the map component's interface unchanged, so that the redesign is styling and layout around it, not a rewrite of it.
71. As the developer, I want the prototype branch to stay unmerged, so that its variant switches never reach the app.

## Implementation Decisions

### Scope

- **Light theme only, desktop-first.** Phones stay "usable, not optimised", as in v1.
- **In scope:**
  - re-laying out the Attempt and Results screens;
  - one palette across all four screens;
  - the serif;
  - the map grid and outline;
  - the Quiz card's Personal Best block;
  - moving Give up into the Pause overlay.
- **Out of scope:** the home and setup layouts, beyond the Quiz card.
- **Behaviour.** The only change is that Give up is reached only from the Pause overlay. The Attempt module, Records, the Quiz catalog and answer matching do not change.

### Palette: one named set of tokens

All colours are declared once, as custom properties at the stylesheet's root. Every other rule refers to them, and no colour literal appears anywhere else in the stylesheet. Base tokens (the "Strong" set chosen in the prototype):

| Token | Hex | Job |
|---|---|---|
| ink | `#121820` | All text, filled primary button, selected and focus outlines, hover outline, tooltip background, oval outline |
| ink-muted | `#4f5966` | Secondary text, small labels, the "/197" |
| paper | `#fcfbf8` | Page, panels, strips, Pause overlay |
| land | `#f4f1ea` | Country fill |
| land-edge | `#8f979f` | Country borders |
| sea | `#cfe0ec` | Sphere |
| territory | `#dedbd3` | Territories (Antarctica, Western Sahara, Siachen Glacier) |
| found | `#1f6a6c` | Found (muted teal) |
| found-tint | `#8ecfcc` | New-find pulse |
| missed | `#d4682f` | Missed (terracotta) |
| ochre | `#e3a92a` | Unfound Highlight fill, its swatch, "New best!" border |
| ochre-ink | `#6a4708` | "New best!" text |
| ochre-wash | `#fbe8b8` | "New best!" fill |

Derived tokens, also declared at the root and computed from the base tokens by colour mixing:

- **hairline:** ink at 14% (dividers);
- **hairline-strong:** ink at 28% (borders, rules);
- **wash:** ink at 6% (hover);
- **paper-raised:** paper mixed 55% with white (cards, Mode options, Timer box, answer box);
- **grid:** ink at 11%;
- **primary-hover:** ink 82% with paper;
- **marker strokes:** each marker's fill mixed 55% with black (ochre: 50%), giving dark-ochre for the Unfound Highlight ring and swatch outline;
- **panel-paper share:** the Frosted panel's paper share is 72%, declared as its own root token so the palette check can read it.

These colours go away: the blue (`#2f6fbf`), the purple Unfound Highlight (`#7a4fbf`, `#b597e6`), the green/red Found/Missed, and the yellow flash.

### Type

- **Font.** Newsreader, from the npm package `@fontsource-variable/newsreader`. Its optical-size stylesheet (`opsz.css`) is imported once at app start, so both the weight and optical-size axes are available. Vite bundles the woff2 into the site's assets, with no CDN.
  - Family stack: `'Newsreader Variable', Georgia, serif`, with `font-display: swap`.
  - Only the Latin subset downloads for English text, about 132 KB.
  - Only Newsreader is added as a dependency. Fraunces and Source Serif 4 were tried and not chosen.
- **Weight 600 for display text:**
  - "Terminus" at 3rem;
  - page headings and Quiz card titles at 1.375rem, line-height 1.2;
  - "Paused" at 3.25rem;
  - the Results heading at 1.75rem.
- **Score figures** are serif 600 at three sizes: Attempt panel 1.75rem, Pause overlay 2.5rem, Results dock 2.25rem.
  - The "/total" part is 0.6em, weight 500, ink-muted.
  - All figures (serif Scores and system-font clocks) use tabular, lining digits.
- **Everything else** uses the system font stack as today.
- **Small labels:** 0.6875rem, weight 600, letter-spacing 0.08em, uppercase, ink-muted. This covers SCORE, TIME / TIME LEFT, TIMER, the Quiz title on Results, and the Quiz card's setting labels and heading.

### Shared control styling

- **Secondary button:** transparent, with a 1 px hairline-strong border, radius 5 px, padding 0.4rem 0.8rem and 0.9375rem text. Hover is the wash.
- **Primary button:** ink fill, paper text, weight 600; hover is primary-hover.
  - Large primary (Resume, Start): padding 0.65rem 2.5rem, 1.125rem.
- **Text link** (Back to Quizzes): ink text, underlined in hairline-strong at a 0.2em offset; the underline turns solid on hover. The setup screen keeps its "←".
- **Focus:** a 2 px ink outline at a 2 px offset, on every focusable control.
- **Answer box:** paper-raised, 1 px hairline-strong border, radius 4 px, 1.25rem text. When focused it has an ink border plus a 1 px ink ring. No blue.
- **Frosted panel** (all floating panels and Reset view):
  - background: paper at the panel-paper share (72%);
  - backdrop blur 8 px with saturation 1.2;
  - border: 1 px, ink at 12%;
  - radius 8 px, no shadow.
  - Panels sit 1rem from the window edges.
- **Strip** (≤720 px for the Attempt, <1024 px for the Results dock): opaque paper, no radius or blur, and a hairline-strong rule between strip and map.

### Map component

- **Interface.** The map component's props are unchanged. The grid and the oval outline are always drawn, on both the Attempt and the Results map. No `graticule` prop: the prototype's switch is not carried over.
- **Draw order:**
  1. sphere (sea);
  2. a 10° latitude/longitude grid (d3-geo's 10° graticule): grid colour, 0.75 px, non-scaling stroke;
  3. Countries and Territories;
  4. markers;
  5. the oval outline: 1 px ink, non-scaling stroke;
  6. the flash, pulse and hover overlays.

  Neither the grid nor the outline takes pointer events.
- **Fills and strokes.** Land, land-edge, sea, territory, found and missed as tokenised.
  - Markers stroke in their fill's derived marker colour.
- **Already-found flash:**
  - no fill;
  - a 2.5 px ink stroke;
  - blinks twice over 1.2 s: on 0–22%, off 25–47%, on 50–72%, off 75–100%.

  It replaces the yellow fill-and-fade.
- **Pulse:** found-tint fill and stroke, with the existing expanding animation.
- **Unfound Highlight:** ochre fill on Unfound Countries; Unfound markers get a 2.5 px dark-ochre stroke.
- **Hover:** an ink outline. The tooltip has an ink background and paper text.
- **Reset view** keeps its place at bottom right, styled as a Frosted panel.
- **Map message** ("Loading the map…" and the error) is in ink-muted.

### Attempt screen

- **Layout above 720 px.** The map fills the window and three Frosted panels float over it:
  - **Score and clock, top left.** Two small-label-over-figure stats side by side: SCORE over the serif Score, and TIME (or TIME LEFT with a Timer) over the clock. The clock is in the system font at 1.25rem. Padding 0.55rem 0.9rem.
  - **Unfound Highlight and Pause, top right.** Two secondary buttons. Padding 0.45rem.
  - **Answer box, bottom centre** over Antarctica. Width min(26rem, 100% − 2rem), padding 0.5rem. The answer box fills it.
- **Layout at 720 px and below.** A grid of strips:
  - top strip: Score and clock on the left, Unfound Highlight and Pause on the right;
  - the map in the middle, shrinking to fit;
  - bottom strip: the answer box.
- **Give up** is removed from the play surface.
- **Unchanged:** the play surface (panels and map) stays inert while paused. The Unfound Highlight button still keeps mousedown from taking focus.
- **Unfound Highlight button:**
  - It leads with an ochre swatch: a hollow square with a 1.5 px dark-ochre outline when off, filled ochre when on.
  - Pressed state: an ink border plus a 1 px inset ink ring, never a fill.
  - Visible label: "Unfound Highlight" above 720 px; "Unfound" at 720 px and below, where " Highlight" is hidden.
  - Accessible name: always "Unfound Highlight", with `aria-pressed` as today.
  - Tooltip (title): "Unfound Highlight: marks where every Unfound answer is, without naming any".

### Pause overlay

- **Look.** The overlay is opaque paper covering the whole screen, as today. It holds, top to bottom:
  - "Paused" in the serif at 3.25rem;
  - the stats: small-caps labels over the serif Score at 2.5rem and the system-font clock at 2rem;
  - Resume, as a large primary button with autofocus;
  - Give up below it, as a secondary button.
- **Give up** calls the Attempt's existing give-up operation while it is paused. The Attempt then ends as Gave up, with the elapsed time from before the Pause, and the app moves to Results as today.
- **Resume** works as today. Focus returns to the answer box, including when Resume is triggered with Enter.

### Results screen

- **Layout at 1024 px and wider.** The map fills the window and shows the Reveal (hover shows every Country's name, as today). One Frosted dock sits at bottom centre, over Antarctica, in a single row. It is about 974 × 73 px. Its contents, in order:
  1. the Quiz title as a small label, over the ending heading ("Completed", "Time's up", "Gave up") in the serif;
  2. the big serif Score with a muted "/total";
  3. Time and Timer, as small labels over values (the same formatting as today);
  4. the "New best!" badge, only when the Attempt set a Personal Best:
     - an ochre-wash pill with a 1 px ochre border;
     - ochre-ink text, 0.8125rem, bold;
     - the wording is unchanged;
  5. the legend, "Found *n*" and "Missed *n*":
     - each entry is led by a swatch of its colour;
     - the counts are tabular and ink-muted;
     - the counts are the lengths of the final state's Found and Missed lists;
  6. a hairline divider;
  7. Play again (primary), then Back to Quizzes (text link).
- **There is no separate legend panel.**
- **Below 1024 px.** The dock becomes a strip under the map. It wraps to two centred rows and the divider is hidden. The map shrinks to fit above it.
- **Focus.** Nothing is autofocused on Results (unchanged).

### Home: the Quiz list

- **Layout.** The page layout is unchanged. "Terminus" and "Choose a Quiz" use the serif.
- **Tiles:** auto-fill columns at least 19rem wide (was 14rem), with a 1rem gap.
- **Quiz card:**
  - paper-raised, with a 1 px hairline-strong border, radius 8 px and padding 1.25rem;
  - hover gives an ink border; keyboard focus gives a 2 px ink outline;
  - the title is serif 600 at 1.375rem.
- **Personal Best block.** It is pushed to the card's foot, with 0.75rem of padding above it.
  - **Heading.** It is headed by a small-caps "PERSONAL BEST" label, which keeps the glossary term visible.
  - **One block per setting.** Each Mode and Timer setting shown on the card has its own block: 0.7rem vertical padding, a hairline rule above it, and no bottom padding on the last one. The settings shown are unchanged: untimed, and the default Timer.
  - **Label.** The setting name is a small label. Its text joins Mode and Timer with a middle dot instead of a comma ("Free Recall · Timer off", "Free Recall · 15:00 Timer"), and is shown uppercase.
  - **Value**, below the label: the serif Score with a muted "/total", then " in 2:22" in the system font, ink-muted. An unplayed setting shows "Not played yet" in ink-muted.
- **App version footer:** ink-muted.

### Setup screen

- The layout is unchanged. Only palette and type change:
  - **Quiz title:** serif.
  - **Mode options and the Timer box:** paper-raised, with hairline-strong borders.
    - Hovering a Mode option gives an ink border.
    - A selected Mode gets an ink border plus a 1 px ink ring.
    - The radio accent colour is ink.
  - **Timer switch:** ink when on.
  - **Timer stepper buttons:** secondary buttons.
  - **Start:** large primary.
  - **Back to Quizzes:** text link.

### Prototype reference

- The prototype is on the unmerged local and remote branch `prototype/quiet-atlas`, at commit `06b0a57`.
- To view the chosen design, run `pnpm dev` and open `/terminus/?variant=D`. Its defaults are the chosen switches.
- Use it as a visual reference only: write the implementation fresh from this spec. Where the two differ, this spec wins.
- Its shade checker module holds the colour maths, which the palette check can reuse.

## Testing Decisions

- **What makes a good test here.** It checks behaviour through a module's public interface and never reaches into internals. Test names state outcomes, in the style of the existing Attempt and Records tests. Visual layout is not unit-tested, as in v1.
- **Seam 1: the Attempt module (existing, unchanged).**
  - The one behaviour change, Give up from the Pause overlay, rests on an existing rule. That rule is already covered by "ends the Attempt as Gave up, with the time played before the Pause, when the player gives up while paused".
  - No new Attempt tests are expected. If the work needs any change to Attempt rules, its tests go here.
- **Seam 2: the palette check (new).** One Vitest test file reads the stylesheet's source as text and takes the tokens declared at its root, including the panel-paper share. It asserts thresholds, not exact hex values, so shades can be retuned as long as the margins hold:
  - **Text contrast of at least 4.5:1 (WCAG AA):**
    - ink on paper;
    - ink-muted on paper;
    - paper on ink (the primary button);
    - ochre-ink on ochre-wash (the badge);
    - ink-muted on a Frosted panel over solid Found, meaning paper at the panel-paper share composited over found.
  - **Non-text contrast of at least 3:1:** found vs land, missed vs land, found vs sea, and ink vs land (outlines).
  - **Colour-blind separation:** a CIEDE2000 difference of at least 20 under normal, deutan, protan and tritan simulation, for:
    - found vs missed;
    - found vs ochre;
    - ochre vs land;
    - found vs sea.
  - **One named set:** the stylesheet has no hex colour literal outside the root token block.
  - **Colour maths:**
    - WCAG 2 relative luminance;
    - Machado, Oliveira & Fernandes (2009) full-severity simulation in linear RGB;
    - CIEDE2000 on the simulated colours.

    The prototype's shade checker implements all three and can be lifted into the test.
- **Checked by playing in the browser, not unit-tested:**
  - **Window sizes.** At each of these, compare the panels and dock against the full-world view: 1280×633, 1366×633, 1440×789, 1536×731, 1920×947, 1024×649, 900×600, 768×1024, 390×844 and 360×740. Nothing covers land except the accepted Chukotka tip.
  - **Keyboard flow:**
    - Start has focus when setup opens;
    - the answer box has focus when the Attempt starts, and keeps it when the Unfound Highlight is toggled;
    - Resume has focus on Pause, and Enter there puts focus back in the answer box;
    - Enter clears a wrong guess.
  - **Pause, then Give up:** Results shows "Gave up" with the time from before the Pause.
  - **Cues:** the flash blinks twice in ink, and the pulse is teal.
  - **Font:** it loads from the site's own assets, and no request goes to a font CDN.
- **Prior art:**
  - The data-consistency tests for Countries of the World. They check data rather than behaviour, as the palette check does.
  - The Attempt and Records tests, for naming style.

## Out of Scope

- A dark theme. The token set makes it possible later.
- Re-laying out the home and setup screens, beyond the Quiz card's Personal Best block.
- Mobile-optimised layouts. Phones stay usable only.
- A confirmation dialog for Give up. The Pause step is the deliberate step.
- Map labels, texture or shaded terrain.
- Any change to Attempt rules, Records, the Quiz catalog or answer matching.
- Showing the Wrong Guess count.
- Automated UI, screenshot or layout tests.
- The fonts that weren't chosen (Fraunces, Source Serif 4), and the prototype's variant switches.

## Further Notes

- **Decided in this spec.** The prototype hand-back left two points open; both are easy to reverse.
  - **Legend counts:** shown ("Found *n*, Missed *n*"). They were in the chosen prototype design.
  - **"PERSONAL BEST" heading on the Quiz card:** kept, as a small-caps label above the records. This mirrors how the Unfound Highlight keeps its glossary term visible, and stops the records reading as bare settings.
- **Reversal of an agreed decision.** The grilling placed the Results summary in a top-left panel, with a separate legend panel. The prototype measured the summary panel at about 240 × 310 px. It covered Alaska, western Canada and the US west coast at every laptop size, and most of the Americas at 1024. The bottom dock clears land at every size measured.
- **Accepted overlap.** At 1280, 1366 and 1536 px wide, the far tip of Chukotka (Russia) sits under the top-right panel. Russia stays plainly visible.
- **Not judged.** How the panels feel when zoomed in, where they must sit over land. Frosted panels let the map show through.
- **Margins to protect.** The palette check enforces these, but they are the tightest:
  - ink-muted on a Frosted panel over Found is exactly 4.5:1. Don't lighten ink-muted or lower the panel-paper share.
  - Missed vs land is 3.2:1. Don't lighten Missed.
  - Under protanopia, a greener teal against a redder terracotta fell to a separation of 16–18. Keep the teal bluer and the terracotta more orange.
- **Current figures, for reference.**

  | Check | Value |
  |---|---|
  | ink on paper | 17.2:1 |
  | ink-muted on paper | 6.9:1 |
  | badge text | 6.9:1 |
  | ink on land | 15.8:1 |
  | found vs land | 5.6:1 |
  | missed vs land | 3.2:1 |
  | found vs sea | 4.7:1 |

  CIEDE2000 separation:

  | Pair | Normal | Deutan | Protan | Tritan |
  |---|---|---|---|---|
  | found vs missed | 46 | 40 | 29 | 57 |
  | found vs ochre | 48 | 50 | 42 | 54 |
  | ochre vs land | ≥26 | ≥26 | ≥26 | ≥26 |
  | found vs sea | ≥38 | ≥38 | ≥38 | ≥38 |
- **Supersedes v1 story 55** ("a Give up button"): Give up now lives in the Pause overlay. All other v1 stories hold.
- **Vocabulary.** The domain terms are from the glossary. "Panel", "dock" and "strip" are layout words, not domain terms, so the glossary is unchanged. No ADR is needed: every decision is visual and easy to reverse. The map stays our own SVG, per ADR 0001.
- **Source notes.** These decisions come from the grilling notes and the prototype hand-back in this feature's directory.
- **Commits.** The user commits and pushes manually. Leave changes uncommitted.
