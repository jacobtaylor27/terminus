# Spec: US State Capitals — Free Recall and Cued Recall

Status: ready-for-agent

## Problem Statement

Terminus has one Quiz, *Countries of the World*, played in Free Recall on a world map. I want a second Quiz, *US State Capitals*, played on a map of the United States. I want two ways to play it:

- the familiar Free Recall: type every capital I can think of, in any order;
- a new Mode: a random State is named, and I type its capital, skipping any I'm stuck on.

## Solution

*US State Capitals* joins the Quiz list. Its 50 Places are the State capitals. Each one is joined to its State's shape on a new US map, drawn from Natural Earth's 1:50m state shapes in the Albers USA projection, with Alaska and Hawaii as insets. Finding a capital colors its State in, just as Finding a Country does today. Hovering a Found State shows "Sacramento, California". Washington, D.C. is drawn as a Territory.

The Quiz offers two Modes:

- **Free Recall**, unchanged.
- **Cued Recall**, new:
  - The Attempt shows one Prompt at a time, in a random order: "Capital of" over a State's name.
  - Typing the right capital auto-accepts it. The State fills in and pulses, and the next Prompt appears.
  - Enter on anything else is a Wrong Guess, and the Prompt stays.
  - **Skip** sends the Prompt to the back of the queue. It's a button, and Enter on an empty box is its shortcut.
  - The map doesn't point out the prompted State. It only shows progress.
  - The Attempt is Completed once all 50 are Found.

Everything else carries over to both Modes:

- the Timer;
- Pause, which also hides the Prompt;
- the Unfound Highlight;
- Give up;
- the Results Reveal;
- Personal Bests per Quiz, Mode and Timer setting.

## User Stories

### Choosing the Quiz

1. As a player, I want *US State Capitals* in the Quiz list after *Countries of the World*, so that I can choose it.
2. As a player, I want its card to show my Personal Best in each Mode, untimed and with the 15:00 Timer, so that I know what to beat in each.
3. As a player, I want the setup screen to offer Free Recall and Cued Recall, with the Timer as it is today, so that I can choose how to play before starting.

### The US map

4. As a player, I want a map of the 50 States with Alaska and Hawaii as insets, so that every State is in view at once.
5. As a player, I want Washington, D.C. drawn in flat grey and never an answer, so that the map has no hole but only States count.
6. As a player, I want the Great Lakes drawn as water, not as part of Michigan and its neighbors, so that the States look right.
7. As a player, I want to zoom, pan and reset the view as on the world map, so that I can inspect the small New England States.
8. As a player, I want hovering a Found State to show its capital and its name ("Sacramento, California"), so that I learn the pairs.
9. As a player, I want hovering an Unfound State to show nothing during an Attempt, so that the map gives no answers away.
10. As a player, I want the floating panels to sit clear of the States at common laptop window sizes, so that they don't hide the map.

### Answering, in both Modes

11. As a player, I want a capital accepted the moment I type it, ignoring case, accents and punctuation as in *Countries of the World*, so that I can answer as fast as I type.
12. As a player, I want "St. Paul" and "St Paul" to count for Saint Paul, so that the common spelling works.
13. As a player, I want a State's name ("California") not to count as an answer, so that the Quiz tests capitals.
14. As a player, I want a well-known city that isn't a capital (Los Angeles, Portland) to be a Wrong Guess on Enter, so that I get no credit for it.

### Free Recall

15. As a player, I want Free Recall to play exactly as it does in *Countries of the World*, out of 50, so that I already know how to play it. That covers any order, the flash for an answer already Found, and a Wrong Guess on Enter.

### Cued Recall

16. As a player, I want one Prompt at a time, "Capital of" over the State's name, just above the answer box, so that I can see what I'm asked without looking away from where I type.
17. As a player, I want the Prompts in a new random order each Attempt, so that I can't learn the order.
18. As a player, I want the map not to highlight the prompted State, so that the Prompt tests the capital and not where the State is.
19. As a player, I want the right capital accepted the instant I type it, with its State filled in and pulsing and the next Prompt appearing, so that I keep moving.
20. As a player, I want only the current Prompt's capital to be accepted, so that typing another State's capital doesn't count.
21. As a player, when I press Enter on a wrong answer, I want it to count a Wrong Guess, clear the box and keep the same Prompt, so that I can try again. That includes another State's capital and one I've already Found.
22. As a player, I want a Skip button, with Enter on an empty box as its shortcut, so that I can pass without leaving the keyboard.
23. As a player, I want a skipped Prompt to come round again after every other Unfound one, so that I get another go later.
24. As a player, I want a Skip not to count as a Wrong Guess, so that passing isn't a penalty.
25. As a player, I want the Attempt to end as Completed once I've Found all 50, so that it ends when every Prompt is answered.
26. As a player, I want the Pause overlay to hide the Prompt along with the map, and answering and Skipping blocked while paused, so that pausing gives no advantage.
27. As a player, I want the Score shown out of 50 and the Results to Reveal the Missed States, as in Free Recall, so that the two Modes read the same.

### Records

28. As a player, I want Cued Recall and Free Recall to keep separate Personal Bests, so that one Mode's result never overwrites the other's.
29. As a player, I want my Skip count saved with each Attempt, so that it can be shown later without losing history. It isn't shown yet.

## Implementation Decisions

- **The Quiz chooses its map.**
  - A Quiz declares the map it is played on: the world map or the US map.
  - The map module holds one definition per map: its data file, its projection and frame, and its decorations. The world map has the oval outline and the 10° grid. The US map has neither, because grid lines break across the Alaska and Hawaii insets.
  - `WorldMap` becomes a general map component that takes the Quiz's map. Its `countries` prop becomes `places`, and its aria-label names the map: "World map" or "Map of the United States".
  - Everything else works as before: coloring, pulse, flash, markers, zoom and reset, hover, the Unfound Highlight, and keeping focus in the answer box.
  - Each map's data loads once and is shared. The app starts loading every map at startup, as it does the world map now; the US file is small.
- **US map data** (per ADR 0001: our own SVG, from Natural Earth).
  - `pnpm map-data` also writes `src/map/us-states-50m.json`, which is committed.
  - It is built from Natural Earth v5.1.2 `ne_50m_admin_1_states_provinces_lakes`, the variant with the Great Lakes cut out, filtered to `adm0_a3 === 'USA'`.
  - Each shape's id is its `postal` code (CA, NY…). That gives 51 shapes: the 50 States plus DC.
  - Properties are dropped, with the same quantization as the world map.
  - Projection: `geoAlbersUsa`, which places Alaska and Hawaii as insets.
- **Frame and panels.**
  - The floating panels keep their places: answer panel bottom centre, Score and clock top left, controls top right, Reset view bottom right.
  - At the full-map view, they must sit over empty paper and not over a State. Check at the window sizes from quiet-atlas ticket 05.
  - If they don't clear, give the US map's frame more room at its edges rather than moving the panels.
- **Quiz data.** `usStateCapitals` in `src/quiz/usStateCapitals.ts` has 50 Places, one per State:
  - `id` is the State's postal code, which joins it to its shape;
  - `name` is the capital;
  - `prompt` is the State's name;
  - `aliases` are hand-curated and few, such as `St Paul` for Saint Paul.

  Keep the existing rule: no short form that begins its own longer name ("Carson", "Salt Lake", "Jefferson"), since it would auto-accept part-way through typing the full name. The Quiz has `map: 'us-states'`, `modes: ['free-recall', 'cued-recall']` and `promptLabel: 'Capital of'`. *Countries of the World* gets `map: 'world'` and no prompts. The catalog lists it first.
- **Place and Quiz shape.**
  - `Place` gains optional `prompt?: string`: the clue Cued Recall asks with. For a capital, that's the State it belongs to.
  - `Quiz` gains `map` and an optional `promptLabel`.
  - Hover text is `"<name>, <prompt>"` when a Place has a prompt ("Sacramento, California"), and the name alone otherwise, so *Countries of the World* is unchanged.
- **Mode.** `Mode` becomes `'free-recall' | 'cued-recall'`. `modeDetails['cued-recall']` gets the name "Cued Recall" and the description "Answer one prompt at a time, in a random order. Skip any you're stuck on."
- **Attempt module.** It stays the one deep module, in plain TypeScript.
  - `startAttempt` also takes a source of randomness (`() => number`, default `Math.random`), injected like the clock so tests fix the order. In Cued Recall, it shuffles the Places once, at the start.
  - `state()` gains `prompt: Place | null`, the current Prompt in Cued Recall while the Attempt is in progress or paused. It is null in Free Recall and once the Attempt has ended.
  - `state()` also gains `skipCount`.
  - New `skip()`: in Cued Recall, it moves the current Prompt to the back of the queue and counts a Skip. With one Prompt left, it comes straight back, and the Skip still counts. `skip()` does nothing in Free Recall, while paused, or once the Attempt has ended.
  - Cued Recall `inputChanged`: only the current Prompt's name or Aliases match, after the same normalization. A match returns `accepted` and makes the next Prompt current. Anything else returns `no-match`. Cued Recall never returns `already-found`.
  - Cued Recall `commit`: empty text returns `nothing`. Any other text returns `wrong-guess`, since a correct answer would already have been accepted on input. That includes another Place's answer, Found or not.
  - Endings are unchanged: Completed when every Place is Found, plus Time's up and Gave up. Free Recall's rules are unchanged.
- **Skip input** belongs to the UI, not the Attempt module.
  - In Cued Recall, Enter on an empty answer box calls `skip()`. In Free Recall, Enter on an empty box still does nothing.
  - The Skip button sits beside the answer box. Its mousedown doesn't take focus, like the Unfound Highlight button's, and its tooltip names the shortcut.
- **Prompt panel.** In Cued Recall, the answer panel grows. Above the box, the Quiz's `promptLabel` sits as a small label over the Prompt, set in the display serif, and the Skip button sits beside the box. The panel is part of the play surface, so the Pause overlay hides it and makes it inert.
- **Records.**
  - `AttemptRecord` gains `skipCount`, which is 0 in Free Recall.
  - The stored schema stays at version 1: the field is optional, and a record saved before it is read as 0 Skips.
  - Personal Best is already kept per Quiz, Mode and Timer setting, so nothing else changes.
- **Quiz card.** With two Modes, the *US State Capitals* card shows four Personal Bests: each Mode untimed and at 15:00. Check that they lay out cleanly.

## Testing Decisions

The conventions are v1's: test behavior through each module's public interface, never its internals.

- **Attempt seam, Cued Recall.** Cover:
  - the injected randomness sets the Prompt order;
  - only the current Prompt's capital, or its Alias, is accepted;
  - another capital is `no-match` on input and a Wrong Guess on Enter;
  - a Found capital is a Wrong Guess on Enter;
  - Enter on empty text does nothing;
  - Skip moves the Prompt to the back and is counted;
  - a Skip with one Prompt left brings it straight back;
  - answers and Skips are blocked while paused and after the end;
  - Completed after the 50th answer;
  - Time's up;
  - `prompt` is null in Free Recall and after the end;
  - `skip()` does nothing in Free Recall.
- **Records seam.** Cover:
  - the Skip count is saved;
  - Cued Recall and Free Recall Personal Bests are kept apart;
  - a stored record without a Skip count still reads.
- **US State Capitals data test**, modelled on `countriesOfTheWorld.test.ts`. Check that:
  - there are 50 Places and no id is duplicated;
  - every id has exactly one shape on the US map;
  - the only shape that isn't a Place is DC;
  - every name and Alias Finds its own Place in Free Recall;
  - every Place has a prompt, and no two prompts match;
  - no State's name is an accepted answer.
- **Not unit-tested:** the map component, the Prompt panel and panel clearance. Verify them by playing at the listed window sizes, as before.

## Out of Scope

- Washington, D.C. as an answer, and the US territories (Puerto Rico, Guam…).
- Dots marking where each capital is.
- Highlighting the prompted State on the map. That is the Name Mode.
- A Quiz for naming the States themselves. It becomes cheap once this map exists.
- Cued Recall for *Countries of the World*, whose Places have no prompts.
- Showing the Skip count or Wrong Guess count.
- The Locate and Name Modes.

## Further Notes

- `CONTEXT.md` gains Cued Recall, Prompt, Skip and State, and broadens Territory and Wrong Guess to fit.
- The `Cue` type in `WorldMap.tsx` is an animation cue for the pulse and flash, unrelated to Cued Recall. Consider renaming it while the map is generalized.
- The user commits and pushes manually. Leave changes uncommitted.
