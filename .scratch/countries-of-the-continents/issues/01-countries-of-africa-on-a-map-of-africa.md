# 01 — Countries of Africa, on a map of Africa

**Parent spec:** `.scratch/countries-of-the-continents/spec.md` (sections "Continents", "Map ids", "A continent's frame", "The map's edge", "Loading"; stories 1–10, 12–17)

**What to build:** *Countries of Africa* joins the Quiz list, after *Countries of the World*. It is played in Free Recall on a map of Africa, which is a rectangular plate showing:

- pale sea and the 10° grid;
- a fine ink outline at its edge;
- Africa's 54 Countries as answers;
- every other Country, and Western Sahara, in flat grey.

Land past the plate's edge is cut off at it. Everything else plays as in *Countries of the World*.

This ticket also settles every Country's Continent. The table covers all 197 Countries, but only Africa gets a Quiz here.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] `src/quiz/countriesOfTheContinents.ts`:
  - `Continent` type;
  - the table of all 197 Countries' ids by Continent (Africa 54, Asia 48, Europe 46, North America 23, Oceania 14, South America 12);
  - `countriesOfAfrica` built from it, with *Countries of the World*'s own Place objects
- [ ] The catalog lists *Countries of the World*, *Countries of Africa*, *US State Capitals*
- [ ] `MapId` gains the six Continents. `maps.ts` has Africa's frame:
  - Lambert azimuthal equal-area, centred on the middle of Africa's box;
  - fitted to a hand-set box of longitudes and latitudes, sampled as points;
  - clipped to the plate's rectangle;
  - named "Map of Africa"
- [ ] `MapFrame.oval` becomes `edge`. The world's edge is its oval and Africa's is its plate. The CSS classes become `.sea` and `.map-outline`. The world map looks exactly as before
- [ ] Map data loading:
  - `world-50m.json` is fetched once and shared by the world map and the continent maps;
  - a map's geometry is computed when its Quiz is chosen, not at startup;
  - the map component still loads its map itself if nothing has
- [ ] The floating panels don't cover any of Africa's Countries at the full-map view, from 1280 to 1920 px wide, and become strips at 720 px and below
- [ ] `CONTEXT.md` gains Continent, and Territory broadens to cover the Countries of other Continents on a continent's map
- [ ] Data tests in `countriesOfTheContinents.test.ts`:
  - every Country of the World is in exactly one Continent, with the expected counts;
  - the Countries on a Continent's edge (Russia, Cyprus, Turkey, Kazakhstan, the Caucasus, Egypt, Panama, Indonesia, Timor-Leste, Papua New Guinea) are where the spec puts them;
  - Africa's Places are *Countries of the World*'s own, with no duplicated id;
  - Africa is Free Recall only, on the map of Africa;
  - "France" is `no-match` as typed and a Wrong Guess on Enter;
  - each African Country's largest piece of land lies wholly inside the plate
- [ ] Typecheck, the palette check and the full test suite stay green
