# 02 — Countries of Europe, Asia, North America and South America

**Parent spec:** `.scratch/countries-of-the-continents/spec.md` (sections "Continents", "A continent's frame", "Quiz list"; stories 1, 4–10, 12)

**What to build:** Four more continent Quizzes, each on its own plate as built in ticket 01:

- ***Countries of Europe*** (46): Iceland to the Urals, with Cyprus and Malta. Russia is cut off at the plate's eastern edge. Greenland, as part of Denmark, fills in with it wherever it's in view. Turkey and the Caucasus are grey.
- ***Countries of Asia*** (48): Turkey and the Middle East to Japan, with Indonesia and Timor-Leste. Siberia, as part of Russia, is grey.
- ***Countries of North America*** (23): Canada and the United States to Panama, with the Caribbean as far as Barbados and Trinidad and Tobago. Greenland is grey as part of Denmark.
- ***Countries of South America*** (12): Colombia and Venezuela to Cape Horn. French Guiana is grey as part of France.

**Blocked by:** 01 — Countries of Africa, on a map of Africa

**Status:** ready-for-agent

- [ ] `countriesOfEurope`, `countriesOfAsia`, `countriesOfNorthAmerica` and `countriesOfSouthAmerica` are built from the table, and the catalog lists them in the spec's order
- [ ] `maps.ts` has each one's frame: a hand-set box, named "Map of Europe" and so on
- [ ] The floating panels don't cover any of the Quiz's Countries at the full-map view, from 1280 to 1920 px wide, and become strips at 720 px and below. Europe has two accepted exceptions:
  - Russia is under the top-right panel at every size;
  - Greenland, which is Denmark's, is under the Score at 1024 and 900 px wide
- [ ] The Quiz list's cards still lay out cleanly
- [ ] Data tests, for each of the four:
  - its Places are *Countries of the World*'s own, with the expected count;
  - it is Free Recall only, on its own map;
  - each Country's largest piece of land lies wholly inside the plate, except Russia and Denmark on the map of Europe
- [ ] Typecheck, the palette check and the full test suite stay green
