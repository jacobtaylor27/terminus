# 03 — Countries of Oceania, across the 180th meridian

**Parent spec:** `.scratch/countries-of-the-continents/spec.md` (sections "Continents", "A continent's frame"; stories 1, 10–12)

**What to build:** *Countries of Oceania* (14), on a plate centred in the western Pacific. It runs from Australia and New Zealand to the Marshall Islands, and from Palau to Samoa and Kiribati's Line Islands. It must be one piece across the 180th meridian: Fiji, Tonga, Samoa, Tuvalu and Kiribati aren't split across the map's edges. The small island Countries get markers, as on the world map.

**Blocked by:** 01 — Countries of Africa, on a map of Africa

**Status:** ready-for-agent

- [ ] `countriesOfOceania` is built from the table and listed between North America and South America
- [ ] `maps.ts` has Oceania's frame, "Map of Oceania". Its box crosses the 180th meridian, with its eastern edge given past 180°
- [ ] The floating panels don't cover any of Oceania's Countries or their markers at the full-map view, from 1280 to 1920 px wide, and become strips at 720 px and below
- [ ] Data tests:
  - its Places are *Countries of the World*'s own, 14 in all;
  - it is Free Recall only, on its own map;
  - each Country's largest piece of land lies wholly inside the plate, including Kiribati's, which is in the Line Islands
- [ ] Typecheck, the palette check and the full test suite stay green
