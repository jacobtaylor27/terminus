# 01 — US State Capitals in Free Recall, on a US map

**Parent spec:** `.scratch/us-state-capitals/spec.md` (sections "The Quiz chooses its map", "US map data", "Frame and panels", "Quiz data", "Place and Quiz shape")

**What to build:** *US State Capitals* appears in the Quiz list after *Countries of the World* and plays in Free Recall on a new map of the United States:

- Alaska and Hawaii are shown as insets.
- Typing a capital colors its State in, and the Score counts out of 50.
- Hovering a Found State shows "Sacramento, California".
- Washington, D.C. is a flat grey Territory.

The Timer, Pause, Unfound Highlight, Results Reveal and Personal Bests work as they do for *Countries of the World*.

Behind it:

- a Quiz now declares its map;
- the map component draws either the world or the US;
- `pnpm map-data` also builds the US map data.

**Blocked by:** None. It can start immediately.

**Status:** ready-for-agent

- [ ] `pnpm map-data` also writes `src/map/us-states-50m.json`, which is committed:
  - built from Natural Earth v5.1.2 `ne_50m_admin_1_states_provinces_lakes`;
  - only features with `adm0_a3 === 'USA'`;
  - each shape's id is its `postal` code;
  - 51 shapes, properties dropped, same quantization as the world map.

  Re-running it leaves `world-50m.json` unchanged
- [ ] A Quiz declares its map, `'world'` or `'us-states'`. *Countries of the World* is `'world'`
- [ ] The map component draws the Quiz's map:
  - the world map keeps its Natural Earth projection, oval outline and grid;
  - the US map uses `geoAlbersUsa`, with Alaska and Hawaii insets, and has no oval or grid;
  - the aria-label names the map: "World map" or "Map of the United States";
  - its `countries` prop becomes `places`
- [ ] Every map starts loading at startup and loads only once. The loading and "couldn't load" messages work for each map
- [ ] `Place` gains an optional `prompt`. Hover text is "name, prompt" when a Place has one, and the name alone otherwise, so *Countries of the World* tooltips are unchanged
- [ ] The *US State Capitals* data is in `src/quiz/usStateCapitals.ts`:
  - 50 Places: id = postal code, name = capital, prompt = State name;
  - `St Paul` is an Alias of Saint Paul;
  - no short form begins its own longer name, so no "Carson", "Salt Lake" or "Jefferson";
  - `modes: ['free-recall']` for now;
  - listed in the catalog after *Countries of the World*
- [ ] DC is drawn as a non-interactive Territory, with no tooltip
- [ ] On the US map, everything works as on the world map:
  - Found States fill in and pulse;
  - an already-Found answer flashes its State;
  - the Unfound Highlight, zoom, pan and Reset view work;
  - the hover rules hold: Found States only during an Attempt, every State on the Reveal
- [ ] Checked in the browser at the full-map view, at the window sizes listed in `.scratch/quiet-atlas/issues/05-attempt-screen-floating-panels.md`:
  - no floating panel, and not Reset view, covers a State. Give the US frame more room at its edges if needed;
  - the phone strips still fit
- [ ] The *US State Capitals* card shows its Free Recall Personal Bests, untimed and at 15:00
- [ ] A `usStateCapitals.test.ts` data test checks that:
  - there are 50 Places and no id is duplicated;
  - every id has exactly one US map shape;
  - DC is the only shape that isn't a Place;
  - every name and Alias Finds its own Place;
  - no State's name is an accepted answer
- [ ] Typecheck, the palette check and the full test suite stay green
