# Spec: Countries of the Continents

Status: ready-for-agent

## Problem Statement

Terminus has *Countries of the World*: all 197 Countries at once, on the whole world map. That's a long Attempt. At the full-world view, the small Countries of crowded regions are hard to see. I want to learn the Countries one continent at a time, on a map of that continent that fills the screen.

## Solution

Six new Quizzes join the Quiz list, one per Continent:

| Quiz | Countries |
| --- | --- |
| *Countries of Africa* | 54 |
| *Countries of Asia* | 48 |
| *Countries of Europe* | 46 |
| *Countries of North America* | 23 |
| *Countries of Oceania* | 14 |
| *Countries of South America* | 12 |

- **Every Country is in exactly one Continent**, so the six add up to the 197 of *Countries of the World*.
  - Russia and Cyprus are in Europe.
  - Turkey, Kazakhstan, Georgia, Armenia and Azerbaijan are in Asia.
  - Egypt is in Africa.
  - Central America and the Caribbean are in North America.
- **Each is played in Free Recall** exactly as *Countries of the World* is, with the same names and Aliases.
- **Each has its own map of the Continent.**
  - The map uses the world map's shapes, framed on the Continent so it fills the window.
  - The Countries of other Continents are drawn in flat grey with their borders, like a Territory. They are never an answer.
- **The map is a rectangular plate** in the world oval's style: pale sea, the faint 10° grid and a fine ink outline at its edge. Land that reaches past the plate is cut off at its edge.

Everything else carries over:

- the Timer;
- Pause;
- the Unfound Highlight;
- Give up;
- the Results Reveal;
- Personal Bests per Quiz, Mode and Timer setting.

## User Stories

### Choosing the Quiz

1. As a player, I want the six continent Quizzes in the Quiz list, so that I can choose one. They come after *Countries of the World* and before *US State Capitals*, in this order: Africa, Asia, Europe, North America, Oceania, South America.
2. As a player, I want each continent Quiz's card to show my Personal Best in Free Recall, untimed and with the 15:00 Timer, as *Countries of the World*'s does.
3. As a player, I want the setup screen to offer Free Recall with the Timer as it is today, so that a continent Quiz starts the way *Countries of the World* does.

### The continent maps

4. As a player, I want the map framed on the Continent and filling the window, so that its small Countries are bigger than on the world map.
5. As a player, I want the Countries of other Continents drawn in flat grey with their borders, and never an answer, so that I can see where the Continent ends and what lies around it.
6. As a player, I want hovering a grey Country to show nothing, as with a Territory today, so that the map only ever names the Quiz's Countries.
7. As a player, I want the sea, the 10° grid and a fine ink outline at the map's edge, as on the world map, so that the continent maps feel like plates from the same atlas.
8. As a player, I want land that reaches past the map's edge cut off cleanly at it, such as Russia east of the Urals on the map of Europe, so that the frame stays on the Continent.
9. As a player, I want a Country's overseas parts drawn as part of it, as on the world map, so that the maps agree. On the map of South America, for example, French Guiana is grey as part of France.
10. As a player, I want a marker on each Country too small to see, and the zoom, pan and Reset view of the world map, so that I can find and inspect the smallest Countries.
11. As a player, I want the map of Oceania in one piece across the 180th meridian, so that Fiji, Tonga, Samoa, Tuvalu and Kiribati sit beside Australia and Papua New Guinea and aren't split across the map's edges.
12. As a player on a common laptop window (1280 to 1920 px wide), I want the floating panels never to cover one of the Quiz's Countries at the full-map view, so that they hide no answer. They may sit over sea or grey land. A few overlaps are accepted, as the world map accepts Chukotka. In each, the Country stays plainly visible:
    - Russia runs past the Europe plate's eastern edge, so the top-right panel always sits over it;
    - in windows 900 px wide, the Score sits over the edge of Greenland, which is part of Denmark;
    - remote subantarctic islands may sit under the answer box: South Africa's Prince Edward Islands and Australia's Macquarie Island.
13. As a player on a phone or in a window up to 720 px wide, I want the panels to become strips along the top and bottom edges, as they do today.

### Answering

14. As a player, I want the same names and Aliases as in *Countries of the World* (Ivory Coast, Burma, Czech Republic), so that what I know works in every Quiz.
15. As a player, I want a Country of another Continent ("France" in *Countries of Africa*) not to be accepted, and to be a Wrong Guess on Enter, so that only the Continent's Countries count.
16. As a player, I want the Score shown out of the Continent's total (such as 31/54) and the Results to Reveal its Missed Countries, as in *Countries of the World*.

### Records

17. As a player, I want each continent Quiz to keep its own Personal Bests, apart from the other Continents' and from *Countries of the World*'s, so that one never overwrites another.

## Implementation Decisions

- **Continents.** `src/quiz/countriesOfTheContinents.ts` holds the six continent Quizzes.
  - `Continent` is `'africa' | 'asia' | 'europe' | 'north-america' | 'oceania' | 'south-america'`.
  - One table lists the Countries' ids for each Continent. It is the only place a Country's Continent is decided.
  - Each continent Quiz is built from the table:
    - `id` is `countries-of-<continent>`;
    - `title` is "Countries of Africa", and so on;
    - `modes` is `['free-recall']`;
    - `map` is the Continent;
    - its Places are *Countries of the World*'s own Place objects, filtered, so names and Aliases are kept in one place.
  - The catalog lists *Countries of the World*, then the six Continents in the order of story 1, then *US State Capitals*.
- **Map ids.** `MapId` gains the six Continents. Each continent map's name, which screen readers announce, is "Map of Africa" and so on.
- **A continent's frame** is set in `maps.ts`.
  - It is drawn from the world map's data, `world-50m.json`. There is no new map data.
  - The projection is Lambert azimuthal equal-area (`geoAzimuthalEqualArea`), centred on the middle of the Continent's box. That keeps shapes and areas right even far from the equator, such as Europe's and Canada's. It also lets Oceania cross the 180th meridian in one piece.
  - Each Continent declares its plate by hand, as a box of longitudes and latitudes that the projection is fitted to. A box that crosses the 180th meridian gives its eastern edge past 180°. The box's edges are sampled as points, since d3 joins a polygon's corners along great circles.
  - The plate can't be fitted to the Continent's Countries, because some reach far beyond it: France's French Guiana and Réunion, the United States' Hawaii and Guam, Russia's Siberia and Denmark's Greenland.
  - The projection is clipped to the plate's rectangle (`clipExtent`), so nothing is drawn past its edge, and land beyond it costs nothing to draw.
  - The plate leaves the same 1-unit margin as the world oval's, so its outline isn't cut off.
  - If a panel covers one of the Quiz's Countries at a checked window size, widen the plate's box on that side (more sea or grey land) rather than moving the panel.
- **The map's edge.** `MapFrame.oval` becomes `edge`: an outline filled with sea, the 10° grid inside it, and the same outline drawn in ink over the land.
  - The world's edge is its oval, which must look exactly as it does now.
  - A continent's edge is its plate's rectangle, which is the Sphere clipped to the plate.
  - The US map still has none.
  - The CSS classes follow: `.sphere` becomes `.sea`, and `.oval-outline` becomes `.map-outline`.
- **Loading.**
  - Each map data file is fetched once and shared by every map drawn from it. The world map and the six continent maps share one fetch of `world-50m.json`.
  - `loadMaps()` still starts fetching every data file at startup.
  - A map's geometry (its frame, shape paths and markers) is computed when the player chooses its Quiz. It's then ready by the time they press Start, and startup computes no map they don't open. Computing one takes 50 to 90 ms, so computing all eight at startup would be noticeable. The map component still loads its map itself if nothing has yet.
- **Neighbours.** The map component needs no change for them. Any shape that isn't one of the Quiz's Places is already drawn as a Territory: flat grey, with no hover and no pointer events.
- **Markers.** The rule is unchanged. It is measured in the continent map's own units, so fewer Countries need a marker than on the world map.
- **Answering.** The Attempt module is unchanged. A continent Quiz's Places are its only answers.
- **Records.** Unchanged. Personal Bests are already kept per Quiz id.
- **Quiz list.** It now shows eight cards. Check that they lay out cleanly.

## Testing Decisions

The conventions are v1's: test behavior through each module's public interface, never its internals.

- **Continent data test**, `countriesOfTheContinents.test.ts`, modelled on `countriesOfTheWorld.test.ts`. Check that:
  - each continent Quiz has its expected number of Countries and no id is duplicated;
  - every Country of the World is in exactly one continent Quiz;
  - a continent Quiz's Places are *Countries of the World*'s own;
  - the Countries on a Continent's edge are where this spec puts them:
    - Russia and Cyprus are in Europe;
    - Turkey, Kazakhstan, Georgia, Armenia and Azerbaijan are in Asia;
    - Egypt is in Africa;
    - Panama is in North America;
    - Indonesia and Timor-Leste are in Asia;
    - Papua New Guinea is in Oceania;
  - each continent Quiz is played in Free Recall only, on its own Continent's map;
  - a Country of another Continent is `no-match` as typed and a Wrong Guess on Enter;
  - on the Quiz's map, each Country's largest piece of land lies wholly inside the plate. The two exceptions are Russia, which reaches past Europe, and Denmark, whose largest piece is Greenland.
- **Not unit-tested:** the plate's look, panel clearance and the Quiz list's layout. Verify them by playing:
  - at the quiet-atlas window sizes: 1280×633, 1366×633, 1440×789, 1536×731, 1920×947, 1024×649, 900×600, 768×1024, 390×844 and 360×740;
  - with the world map checked to look unchanged.

  Panel clearance was checked in the browser by sampling the points under each panel and the Results bars, and asking `document.elementsFromPoint` whether a `.place` shape or marker lies beneath. Every continent is clear at every size, apart from Europe's exceptions in story 12. The world map shows only its accepted Chukotka overlap.

## Out of Scope

- The Name and Locate Modes.
- Cued Recall for the continent Quizzes. Countries have no prompts.
- A Country in two Continents.
- Sub-regions (Central America, the Caribbean, the Middle East) and the capitals of a Continent.
- A default Timer for each Quiz. 15:00 stays the default, even for South America's 12 Countries.
- Changing the look of the world map or the US map.

## Further Notes

- `CONTEXT.md` gains Continent. Territory broadens to cover the Countries of other Continents on a continent's map.
- The continent capitals Quizzes (*Capitals of Africa* and so on) share these maps. Their Cued Recall Prompt makes the answer panel about 53 px taller, so every plate reaches further south than the Countries Quizzes alone need. This is the same trade the US map makes with its bottom margin.
- The user commits and pushes manually. Leave changes uncommitted.
