# 04 — Map interaction: zoom, pan, markers, pulse, tooltips

**Parent spec:** `.scratch/terminus-v1/spec.md`

**What to build:** The map becomes explorable and every Country is visible. The player can zoom (scroll wheel / pinch) and pan (drag) with `d3-zoom`, and a "reset view" button returns to the whole world — all without the answer box losing focus. Countries too small to see at full-world zoom (Vatican City, Monaco, Nauru, Tuvalu, Caribbean and Pacific island nations…) are drawn as circle markers that color in like any other Country. A newly Found Country pulses briefly. Hovering a Found Country shows its name; hovering an Unfound Country or a territory shows nothing.

Build the map's zoom and hover behaviour so it can be reused by the Results screen's Reveal map (ticket 06), where every Country will show its name on hover.

**Blocked by:** 01 — Type a Country, see it colored

**Status:** ready-for-agent

- [ ] Scroll-wheel / pinch zoom and drag-to-pan work on the Attempt map
- [ ] A "reset view" button restores the full-world view
- [ ] The answer box keeps focus while zooming, panning and using the reset button, so typing never requires clicking back into it
- [ ] Every Country too small to see at full-world zoom has a circle marker at its location, colored by the same Found/Unfound rule as shapes
- [ ] A newly Found Country (shape or marker) pulses briefly
- [ ] Hovering a Found Country shows a tooltip with its name
- [ ] Hovering an Unfound Country or a territory shows no tooltip and no hover effect that could hint at an answer
- [ ] Tooltip behaviour is configurable per map instance so the Reveal map can show all names

## Comments

**2026-10-29** — Decided during implementation: a Country gets a circle marker when its largest piece of land covers less than 5 square units of the 960-wide map at full-world zoom (about a 3 × 3 pixel square on a laptop). That gives 36 markers, from Vatican City up to Palestine; the next Countries up (Gambia, Cyprus, Fiji, Jamaica, Lebanon) are small but visible shapes. The marker sits in the middle of that largest piece, so Kiribati's is on Kiritimati, and keeps its size on screen as the map zooms. Territories never get one. The pulse is a light-green glow that spreads out from the Country's whole shape and its marker, twice, then fades. Hovering a Country that shows its name outlines it as well as showing the tooltip. The tooltip hides during a wheel zoom or the reset and comes back when the pointer moves. The map is zoomable to 40×, and "Reset view" animates back to the whole world. The ticket 03 flash now also covers markers. `WorldMap` takes `tooltips: 'found' | 'all'` for the Reveal map (ticket 06). Touch pinch relies on d3-zoom's defaults and hasn't been tried on a touch device.
