# Handoff: Terminus "quiet atlas" redesign → prototype session

## Where this came from

A `/grill-with-docs` session in `C:\jatay\repos\terminus` settled what a cleaner look for the app means. The decisions below exist **only in this document**. The grilling produced no `CONTEXT.md` change and no ADR, because every decision was visual and easy to reverse. After the prototype, the work returns to the original thread for `/to-spec` → `/to-tickets` → `/implement`.

**Your job in this session:** run `/prototype` to answer the open questions at the bottom, then `/handoff` the answers back.

## Read first (don't re-derive)

- `CONTEXT.md`: domain glossary. Use its terms: Attempt, Found/Unfound, Missed, Reveal, Pause, Unfound Highlight, Territory, Score.
- `.scratch/terminus-v1/spec.md`: v1 spec. Story 55 (Give up) still holds. Mobile is "usable only".
- `docs/adr/0001-own-svg-map-not-tile-library.md`: the map is our own SVG (d3-geo + d3-zoom).
- `src/index.css`: all styling. Plain CSS, about 25 hard-coded hex colours, no CSS variables, system font.
- `src/ui/AttemptScreen.tsx`, `src/ui/ResultsScreen.tsx`: the two screens being re-laid out. `QuizListScreen.tsx` and `AttemptSetupScreen.tsx` only get the new palette and type.
- `src/map/WorldMap.tsx`: `geoNaturalEarth1().fitWidth(...)`, so the map is an oval. The four corners of the map area are empty, and Antarctica (a Territory, never an answer) fills the bottom middle.

Run the app with `pnpm dev`.

## Agreed decisions

**Scope**
- In: busy play screens, one coherent palette, more character.
- Out: rethinking the home and setup layouts.
- Desktop-first. Phones are usable, not optimised.
- Light theme only.

1. **Look: quiet atlas.** Paper neutrals and ink text. The current land `#f4f1ea` and sea `#d7e6f0` already lean this way.
2. **Palette (by job):**
   - **Ink** (the near-black text colour) for every control: filled-ink primary button, ink outline for selected states and focus. The blue `#2f6fbf` goes.
   - **Muted teal / sea-green** = Found, with a lighter tint of it for the new-find pulse.
   - **Terracotta** = Missed.
   - **Ochre** = Unfound Highlight and the "New best" badge. They never appear on screen together.
   - **Already-found flash** = an ink outline blink, not a coloured fill, so it doesn't read as Unfound while the Unfound Highlight is on.
   - All colours live in one named set, so a dark theme could be added later.
3. **Attempt screen: full-screen map with floating paper panels.**
   - Answer box at the bottom centre, over Antarctica.
   - Score and clock top-left.
   - Unfound Highlight and Pause top-right.
   - Reset view bottom-right, where it already is.

   On narrow screens the panels become strips along the top and bottom edges, outside the oval.
4. **Give up moves into the Pause overlay.** Resume is the main button, Give up is secondary. Today Give up ends the Attempt instantly with no confirmation (`AttemptScreen.tsx` `handleGiveUp`). This is the one behaviour change.
5. **Results screen: full-screen map showing the Reveal.**
   - A summary panel top-left: Quiz title, the ending as heading, a big Score, Time and Timer smaller, an ochre "New best" badge, Play again (filled ink), Back to Quizzes.
   - A legend panel (Found / Missed) bottom-left.
6. **Type:**
   - One serif web font, bundled with the app (no Google Fonts CDN), for display text only: "Terminus" title, page headings, Quiz card titles, "Paused", the Results heading, the big Score figures. It needs fixed-width (tabular) digits.
   - The system font for everything else.
7. **Map details:** a faint latitude/longitude grid over the sea and a fine ink outline around the oval. No texture, no shaded terrain, no labels (labels would give answers away).

**Assumed constraints** (stated to the user, not objected to):
- Text and controls meet WCAG AA contrast.
- Found and Missed stay distinguishable for red-green colour-blind players.
- Keyboard flow is unchanged: the answer box takes focus at the start and after Resume, Enter commits a guess, Start and Resume are autofocused.

## Open questions the prototype must answer

1. **Exact shades** for ink, paper, sea, teal, terracotta and ochre, checked for contrast and colour-blind separation.
2. **Serif face:** put 2–3 candidates on the real screens and let the user pick.
3. **Floating panels vs window shapes:** do they clear land at common laptop sizes (e.g. 1366×768, 1440×900, 1920×1080)? How do they feel when zoomed in? If the floating layout fails, the fallback is a calmer top bar with order and grouping.
4. **Grid:** on or off. Build it with a switch.
5. **Panel styling:** border, shadow, opacity.
6. **"Unfound Highlight" label:** how a long label fits a small panel (shorter label? icon plus label?). Keep the glossary term visible somewhere.

Build against the **real map** (reuse `WorldMap`), so the panel-overlap question gets a real answer. Use switches in the page for the variants (font, grid, maybe shade sets) so the user compares by playing.

## Working with this user

- **Never commit or push.** The user does both manually. Keep the prototype throwaway (scratch branch or a separate entry); don't fold it into the app.
- The local issue tracker is `.scratch/<feature>/`. Don't use GitHub issues.
- The user prefers to try things and see them over deciding on paper.

## What to hand back

Bring back values, not code:
- chosen hex values;
- the font name and how it's bundled;
- panel style values;
- grid yes or no;
- any window sizes where the layout broke;
- the Unfound Highlight label solution;
- any reversal of the decisions above, with the reason.

## Suggested skills

- **`/prototype`**: the main job here. Throwaway code that answers the open questions.
- **`frontend-design:frontend-design`**: aesthetic direction while building the variants (type pairing, spacing, panel treatment).
- **`run`**: launch the app and screenshot variants at different window sizes.
- **`/handoff`**: at the end, carry the answers back to the original thread, which continues with `/to-spec`.
