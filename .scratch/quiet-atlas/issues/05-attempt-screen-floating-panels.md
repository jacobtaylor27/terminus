# 05 — Attempt screen: full-screen map with floating panels

**Parent spec:** `.scratch/quiet-atlas/spec.md` (sections "Attempt screen", "Shared control styling" Frosted panel and Strip, "Testing Decisions" window sizes and keyboard flow)

**Prototype reference:** branch `prototype/quiet-atlas`, commit `06b0a57` (`pnpm dev`, then `/terminus/?variant=D`). Use it as a visual reference only.

**What to build:** During an Attempt, the map fills the whole window. The top bar is replaced by small panels of frosted paper that float in the empty corners around the world oval:

- **Top left:** the Score and the clock, each under a small-caps label.
- **Top right:** the Unfound Highlight and Pause buttons.
- **Bottom centre:** the answer box, over Antarctica.
- **Bottom right:** Reset view stays where it is, frosted to match.

At common laptop window sizes, the panels sit over empty sea. In a window up to 720 px wide, they become opaque strips along the top and bottom edges, outside the oval.

The Unfound Highlight button changes too:

- it leads with an ochre swatch, hollow when off and filled when on;
- when pressed, it shows an ink border and ring;
- it reads "Unfound Highlight" on desktop and "Unfound" on phones;
- it keeps "Unfound Highlight" as its accessible name, with a tooltip that explains it.

The keyboard flow is unchanged.

**Blocked by:**
- 01 — Give up from the Pause overlay
- 02 — The quiet-atlas palette as one token set, with the palette check
- 03 — Newsreader for display text (the panel sizes, and so the land clearance, depend on the serif)

**Status:** ready-for-agent

- [ ] Above 720 px, the map fills the window, and three Frosted panels sit 1rem from the edges:
  - **Score and clock, top left:** SCORE over the serif Score, and TIME (or TIME LEFT with a Timer) over the 1.25rem tabular clock. Padding 0.55rem 0.9rem.
  - **Unfound Highlight and Pause, top right:** secondary buttons. Padding 0.45rem.
  - **Answer box, bottom centre:** min(26rem, 100% − 2rem) wide, padding 0.5rem.
- [ ] Frosted panel style:
  - background: paper at the panel-paper share;
  - backdrop blur 8 px, saturation 1.2;
  - border: 1 px ink at 12%;
  - radius 8 px, no shadow.

  Reset view gets the same treatment and stays at the bottom right
- [ ] At 720 px and below, the layout becomes a grid:
  - a top strip with Score and clock on the left, Unfound Highlight and Pause on the right;
  - the map in the middle, shrinking to fit;
  - a bottom strip with the answer box.

  Strips are opaque paper, with no radius or blur, and a hairline-strong rule between strip and map
- [ ] Unfound Highlight button:
  - an ochre swatch leads the label: a hollow square with a 1.5 px dark-ochre outline when off, filled ochre when on;
  - the pressed state is an ink border plus a 1 px inset ink ring, never a fill
- [ ] The button's visible label is "Unfound Highlight" above 720 px and "Unfound" at 720 px and below
- [ ] The button's accessible name is always "Unfound Highlight", with `aria-pressed`. Its tooltip reads "Unfound Highlight: marks where every Unfound answer is, without naming any"
- [ ] Unchanged:
  - the answer box has focus at the start and after Resume;
  - toggling the Unfound Highlight leaves focus in the answer box;
  - Enter commits a guess;
  - the play surface is inert while paused;
  - the Pause overlay still covers everything
- [ ] Checked in the browser at the full-world view for 1280×633, 1366×633, 1440×789, 1536×731, 1920×947, 1024×649, 900×600, 768×1024, 390×844 and 360×740:
  - no panel covers land, except the accepted far tip of Chukotka under the top-right panel at 1280, 1366 and 1536 wide;
  - the phone top strip doesn't overflow at 360 and 390
- [ ] The palette check and the full test suite stay green
