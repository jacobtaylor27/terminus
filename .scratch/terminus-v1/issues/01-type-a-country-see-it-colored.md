# 01 — Type a Country, see it colored

**Parent spec:** `.scratch/terminus-v1/spec.md`

**What to build:** The tracer bullet. Opening the app drops the player straight into a Free Recall Attempt of *Countries of the World*: a 2D world map fills the screen with an answer box and a Score above it. Typing a Country's exact name (case-insensitive) auto-accepts it the instant it matches — the Country is colored in on the map, the answer box clears, and the Score goes up (e.g. 1/197). Typing a Country already Found does nothing. Dependent territories and breakaway regions are drawn as part of the Country they belong to; land that belongs to no Country (Antarctica, Western Sahara, Siachen Glacier) is drawn as a flat grey Territory and is never an answer.

This ticket also stands up the project (Vite + TypeScript + React + Vitest, pnpm), the *Countries of the World* Quiz data, the map data pipeline, and the first version of the Attempt module — the plain-TypeScript seam that owns the game rules (see the spec's Implementation Decisions).

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `pnpm dev` serves the app and `pnpm test` runs the Vitest suite
- [ ] The *Countries of the World* Quiz is defined as data: 197 Countries (193 UN members + Vatican City, Palestine, Kosovo, Taiwan), each with a stable id (Natural Earth `ADM0_A3` code) and display name, declaring Free Recall as its only supported Mode
- [ ] The world map renders as SVG via `d3-geo` from Natural Earth 1:50m admin-0 data (per ADR 0001), using a non-Mercator projection
- [ ] Countries are joined to map features by `ADM0_A3`, not `ISO_A3`
- [ ] Breakaway regions and dependent territories render as part of the Country they belong to, colored together with it (e.g. Somaliland with Somalia, Greenland with Denmark, Hong Kong with China)
- [ ] Land that belongs to no Country (Antarctica, Western Sahara, Siachen Glacier) is drawn as a non-interactive grey Territory
- [ ] The Attempt module can be started from a Quiz and Mode, and exposes "input changed" returning accepted (which Country) / already Found / no match, plus state with Score, total, Found and Unfound Countries
- [ ] Typing a Country's exact name, in any letter case, auto-accepts it: it is colored in, the box clears, and the Score increments
- [ ] Unfound Countries are a light neutral color and Found Countries a strong color
- [ ] Attempt-seam tests cover: the 197 total, case-insensitive auto-accept, Score incrementing, already-Found not re-accepting, no-match text leaving state unchanged
- [ ] Data consistency test: every one of the 197 Countries has a matching map feature, no Country id is duplicated, breakaway regions and dependent territories map to the Country they belong to, and only Antarctica, Western Sahara and Siachen Glacier are left as Territories

## Comments

**2026-10-29** — Decided during implementation: every dependent territory and autonomous region (Greenland, Puerto Rico, Hong Kong, Åland, the Falklands…) is merged into its sovereign Country (per Natural Earth), not just Somaliland and Northern Cyprus. Disputed land with no clear sovereign (Western Sahara, Siachen Glacier) and Antarctica stay grey. The spec (story 35, Map data join, data consistency test) and CONTEXT.md (Country, Territory) were updated to match.
