# 03 — Newsreader for display text

**Parent spec:** `.scratch/quiet-atlas/spec.md` (section "Type")

**What to build:** The game gains character from one serif, Newsreader, used only for display text:

- the "Terminus" title;
- page headings;
- Quiz card titles;
- "Paused";
- the Results heading;
- every Score figure.

All other text stays in the system font. The font ships with the site, so no third-party font service is called. While it loads, headings show at once in a fallback serif. Score and clock figures use fixed-width digits, so they don't jitter. Every Score shows its "/197" smaller and muted, so the number Found stands out. The existing stat labels (Score, Time, Timer) become small-caps labels.

**Blocked by:** 02 — The quiet-atlas palette as one token set, with the palette check (the muted "/total" and the small labels use its tokens)

**Status:** ready-for-agent

- [ ] Newsreader comes from the npm package `@fontsource-variable/newsreader`. Its optical-size stylesheet is imported once at app start, and only this font package is added
- [ ] The display stack is `'Newsreader Variable', Georgia, serif`, with `font-display: swap`. The build copies the woff2 into the site's assets, and no request goes to a font CDN
- [ ] Display text is set in Newsreader at weight 600:
  - "Terminus" at 3rem;
  - page headings and Quiz card titles at 1.375rem, line-height 1.2;
  - "Paused" at 3.25rem;
  - the Results heading at 1.75rem
- [ ] Score figures are serif 600, at 1.75rem on the Attempt screen, 2.5rem on the Pause overlay and 2.25rem on Results. The "/total" is 0.6em, weight 500, ink-muted
- [ ] One shared way of showing a Score with a muted "/total" is used everywhere a Score figure appears, so later tickets reuse it
- [ ] All Score and clock figures use tabular, lining digits. The Pause overlay's clock is in the system font at 2rem
- [ ] The existing stat labels (Pause and Results) and the Results Quiz title use the small-label style: 0.6875rem, weight 600, letter-spacing 0.08em, uppercase, ink-muted
- [ ] Everything else (buttons, answer box, body text) stays in the system font
- [ ] The palette check and the full test suite stay green
- [ ] Checked in the browser: the serif loads, digits don't shift as the clock ticks, and the network panel shows the font served from the site
