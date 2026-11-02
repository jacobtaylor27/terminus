# 04 — Atlas map: grid and oval outline

**Parent spec:** `.scratch/quiet-atlas/spec.md` (section "Map component")

**What to build:** The map looks like an atlas. A faint 10° latitude/longitude grid runs over the sea and under the land, and a fine ink outline gives the world oval a clear edge against the page. Both appear on the Attempt map and the Reveal map. Neither catches the pointer, so hovering, dragging, zooming and Reset view work as before. The map gets no labels, texture or shaded terrain, since labels would give answers away.

**Blocked by:** 02 — The quiet-atlas palette as one token set, with the palette check (the grid and outline use its tokens)

**Status:** ready-for-agent

- [ ] The map component's props are unchanged. The grid and the outline are always drawn; there is no on/off switch
- [ ] Draw order:
  1. sphere;
  2. grid (d3-geo's 10° graticule);
  3. Countries and Territories;
  4. markers;
  5. oval outline;
  6. the flash, pulse and hover overlays
- [ ] The grid uses the grid token: 0.75 px, non-scaling stroke, no fill
- [ ] The oval outline is 1 px ink, non-scaling stroke, no fill
- [ ] Neither the grid nor the outline takes pointer events. Hover tooltips, drag, wheel and pinch zoom, and Reset view behave as before
- [ ] Lines stay hairline-thin at every zoom level
- [ ] The palette check and the full test suite stay green
- [ ] Checked in the browser on both the Attempt map and the Reveal map
