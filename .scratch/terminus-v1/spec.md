# Spec: Terminus v1 — Countries of the World (Free Recall)

Status: ready-for-agent

## Problem Statement

I want a geography quiz game I can play in the browser where I test how many countries of the world I can name, and see them fill in on a map as I go. Existing sites do this, but I want my own game — Terminus — that starts with this one Quiz and is built so that more Quizzes (e.g. *Capitals of Africa*) and more Modes (clicking on the map, naming a highlighted place) can be added later without rework.

## Solution

Terminus v1 is a desktop-first static web app with a single Quiz, *Countries of the World*, played in the **Free Recall** Mode. The player picks the Quiz, optionally switches on a **Timer** (default 15:00, adjustable before starting), and starts an **Attempt**. They type country names into an answer box in any order; each correct name or **Alias** is accepted the instant it matches, the **Country** is colored in on a 2D world map with a brief pulse, and the **Score** goes up (e.g. 42/197). The player can zoom and pan the map, toggle an **Unfound Highlight** to see where gaps remain, **Pause** (which hides the map), or give up. When the Attempt ends — Completed, Time's up, or Gave up — a Results screen shows the Score, time, how it ended, and a **Reveal** map of the **Missed** Countries. Attempt history and a **Personal Best** per Quiz, Mode and Timer setting are kept in the browser. The site is hosted on GitHub Pages.

## User Stories

### Choosing a Quiz

1. As a player, I want to see a list of available Quizzes on the home screen, so that I can choose what to be tested on.
2. As a player, I want *Countries of the World* to appear as a card in that list, so that I can start it.
3. As a player, I want each Quiz card to show my Personal Best for it, so that I know what score to beat.
4. As a player, I want the Quiz list to be built as a list even with one Quiz, so that new Quizzes appear naturally when they're added.

### Setting up an Attempt

5. As a player, I want a setup screen after picking a Quiz, so that I can choose how I'll play before the clock starts.
6. As a player, I want to choose a Mode on the setup screen, so that later I can pick between Free Recall, Locate and Name; in v1 only Free Recall is offered.
7. As a player, I want to switch the Timer on or off before starting, so that I can choose between a timed challenge and a relaxed untimed Attempt.
8. As a player, I want the Timer to default to 15:00, so that I get the standard challenge without configuring anything.
9. As a player, I want −/+ controls to change the Timer in 1-minute steps between 1:00 and 60:00, so that I can make the challenge shorter or longer.
10. As a player, I want a Start button, so that the Attempt begins only when I'm ready.

### Answering in Free Recall

11. As a player, I want the answer box to be focused as soon as the Attempt starts, so that I can type immediately.
12. As a player, I want a correct Country name to be accepted the instant my text matches, without pressing Enter, so that I can answer as fast as I can type.
13. As a player, I want the answer box to clear after a correct answer, so that I can type the next one straight away.
14. As a player, I want matching to ignore capital letters, so that "france" and "France" both count.
15. As a player, I want matching to ignore accents, so that "cote divoire" counts for Côte d'Ivoire.
16. As a player, I want matching to ignore punctuation, so that "Guinea Bissau" and "Guinea-Bissau" both count.
17. As a player, I want a leading "the" to be optional, so that "Gambia" and "The Gambia" both count.
18. As a player, I want common short forms to be accepted as Aliases (USA, UK, DRC, UAE), so that I'm not penalized for using the names people actually say.
19. As a player, I want well-known English and native names to be accepted (Ivory Coast / Côte d'Ivoire, East Timor / Timor-Leste), so that either spelling counts.
20. As a player, I want well-known former names to be accepted (Burma, Swaziland, Czech Republic), so that I'm not punished for older names.
21. As a player, I want "Congo" on its own to count as the Republic of the Congo, and "DR Congo" / "DRC" / "Democratic Republic of the Congo" to count as the other, so that the two Congos are unambiguous.
22. As a player, I want misspellings like "Brazl" not to count, so that the quiz tests real knowledge and similar names (Niger/Nigeria, Iran/Iraq) never collide.
23. As a player, I want ambiguous colloquial names like "America", "Holland" and "England" not to count, so that answers stay precise.
24. As a player, when I'm typing "Nigeria" and "Niger" auto-accepts first, I want to be able to just type "Nigeria" again and have it accepted, so that the auto-accept quirk costs me only a retype.
25. As a player, I want typing the name of a Country I've already Found to briefly highlight it on the map, so that I know it already counted.
26. As a player, I want pressing Enter on an already-Found Country to clear the box without counting as a Wrong Guess, so that I'm not penalized for forgetting I'd got it.
27. As a player, I want pressing Enter on text that matches nothing to clear the box and count a Wrong Guess, so that I can commit to and discard a guess.
28. As a player, I want text I delete with backspace never to count as a Wrong Guess, so that fixing a typo isn't treated as guessing.
29. As a player, I want pressing Enter on an empty box to do nothing, so that stray key presses don't count.
30. As a player, I want my Wrong Guess count to be recorded even though v1 doesn't display it, so that it can be shown later without losing past data.

### The map

31. As a player, I want a 2D world map filling most of the screen, so that I can see my progress geographically.
32. As a player, I want each Country to be colored in when I Find it, so that I can see what I've got.
33. As a player, I want a newly Found Country to pulse briefly, so that I can see where it is, especially if it's small.
34. As a player, I want tiny Countries (Vatican City, Monaco, Nauru, Tuvalu, Caribbean and Pacific island nations…) drawn as circle markers, so that every Country is visible at full-world zoom.
35. As a player, I want dependent territories (Greenland, Puerto Rico, Western Sahara…) drawn in flat grey and never answerable, so that the map has no holes but only Countries count.
36. As a player, I want to zoom with the scroll wheel or a pinch and pan by dragging, so that I can inspect crowded regions.
37. As a player, I want a "reset view" button, so that I can get back to the whole world quickly.
38. As a player, I want the answer box to keep focus while I zoom and pan, so that I never have to click back into it to keep typing.
39. As a player, I want hovering a Found Country to show its name, so that I learn which shape is which.
40. As a player, I want hovering an Unfound Country or a territory to show nothing, so that the map can't be used to read off answers.
41. As a player, I want an Unfound Highlight toggle that marks where every Unfound Country is without naming them, so that I can scan for regions I've neglected.
42. As a player, I want the Unfound Highlight to have no effect on my Score, so that using it is never a penalty.

### Score and time

43. As a player, I want to see my Score as Found out of total (e.g. 42/197), so that I know how far I've got.
44. As a player with the Timer on, I want to see a countdown, so that I know how much time I have left.
45. As a player with the Timer off, I want to see a stopwatch counting up, so that I know how long I've been playing.
46. As a player, I want the clock to keep running if I switch browser tabs, so that leaving the tab can't be used to stop the clock.
47. As a player, I want the Timer duration to be fixed once the Attempt starts, so that timed results stay comparable.

### Pausing

48. As a player, I want a Pause button, so that I can step away mid-Attempt.
49. As a player, I want Pause to stop the clock whether or not the Timer is on, so that a pause never costs me time.
50. As a player, I want Pause to show an overlay that hides the map and my Found answers and shows only my Score and time, so that I can't study the map while the clock is stopped.
51. As a player, I want to be unable to type answers while paused, so that pausing can't be used to gain an advantage.
52. As a player, I want to resume from the overlay, so that I can carry on where I left off.

### Ending an Attempt

53. As a player, I want the Attempt to end as Completed the moment I Find all 197 Countries, so that a perfect run is recognized immediately.
54. As a player with the Timer on, I want the Attempt to end as Time's up when the countdown reaches 0:00, so that the time limit is enforced.
55. As a player, I want a Give up button, so that I can end an untimed (or timed) Attempt whenever I choose.

### Results

56. As a player, I want a Results screen showing my Score, my time (or Timer setting), and how the Attempt ended, so that I know how I did.
57. As a player, I want the Results map to Reveal every Missed Country in a contrasting color, distinct from the Found ones, so that I learn what I didn't get.
58. As a player, I want to zoom and pan the Reveal map, so that I can study small Missed Countries.
59. As a player, I want hovering any Country on the Reveal map to show its name, Found or Missed, so that I can learn the ones I missed.
60. As a player, I want to see "New best!" when an Attempt beats my Personal Best, so that I'm rewarded for improving.
61. As a player, I want a "Play again" button that starts a new Attempt with the same Quiz, Mode and Timer setting, so that I can retry quickly.
62. As a player, I want a "Back to Quizzes" button, so that I can choose something else.

### Records

63. As a player, I want every finished Attempt saved in my browser with its Score, time, Timer setting, ending and Wrong Guess count, so that I have a history.
64. As a player, I want a separate Personal Best for each Quiz, Mode and Timer setting, so that an untimed 197/197 doesn't overwrite a 15:00 timed record.
65. As a player, I want a higher Score to beat a lower one and, on equal Scores, the shorter time to win, so that Personal Best reflects my best performance.
66. As a player, I want my history and Personal Bests to survive closing and reopening the browser, so that my progress isn't lost.

### Hosting and future-proofing

67. As the developer, I want the site deployed to GitHub Pages at `jacobtaylor27.github.io/terminus`, so that I can share it with a link.
68. As the developer, I want the game rules to live in plain TypeScript, independent of React, so that they're fully testable and reusable by the Locate and Name Modes.
69. As the developer, I want Quizzes defined as data (which places, what's asked, which Modes are supported), so that adding *Capitals of Africa* is mostly adding data.

## Implementation Decisions

- **Stack**: Vite + TypeScript + React, Vitest for tests, pnpm. No backend; the build output is a static site. Deployed to GitHub Pages under the `/terminus/` base path via a GitHub Actions workflow. Desktop-first; the layout must not break on tablets and phones, but isn't optimized for them.
- **Map rendering** (per ADR 0001): SVG drawn with `d3-geo` from Natural Earth admin-0 country shapes at 1:50m detail, with `d3-zoom` for zoom and pan. No tile-based map library. The choice of world projection is left to the implementer (avoid Mercator's distortion).
- **Map data join**: Countries are joined to map features by Natural Earth's `ADM0_A3` code, not `ISO_A3` — Natural Earth sets `ISO_A3` to `-99` for some features (e.g. France, Norway, Kosovo). Natural Earth's separate Somaliland and Northern Cyprus features belong to Somalia and Cyprus respectively — they are colored, highlighted and hovered as part of that Country. Every other map feature that is not one of the Quiz's answers is drawn as a non-interactive territory.
- **Modules**:
  - **Quiz catalog** — defines Quizzes as data. *Countries of the World* has 197 Countries (193 UN members + Vatican City, Palestine, Kosovo, Taiwan), each with a stable id (its `ADM0_A3` code), a display name, and its Aliases. A Quiz also declares which Modes it supports (v1: Free Recall only).
  - **Attempt** (the main deep module; plain TypeScript, no React) — owns all game rules. Interface:
    - *start* from a Quiz, a Mode, and an optional Timer duration;
    - *input changed* with the current answer-box text → returns one of: accepted (which Country; the caller clears the box), already Found (which Country, for the brief highlight), or no match;
    - *commit* (Enter) with the current text → returns Wrong Guess (counter incremented; caller clears the box), already Found (caller clears the box, no penalty), or nothing (empty text);
    - *pause*, *resume*, *give up*;
    - *state* → Score and total, Found and Unfound Countries, Wrong Guess count, elapsed and/or remaining time, and status: in progress, paused, Completed, Time's up, or Gave up; once ended, the Missed Countries.
    - **Time is injected**: every operation takes the current timestamp (or the module takes a clock), so tests control time and the module never reads the real clock. The UI ticks it with a periodic timer and reads state. Elapsed time is computed from timestamps (minus paused intervals), so throttled background tabs don't drift the clock and leaving the tab never pauses.
  - **Answer matching** (inside the Attempt module): normalize both the input and every name/Alias by lower-casing, stripping diacritics, removing punctuation and collapsing whitespace, and dropping a leading "the". Accept only an exact normalized match against an Unfound Country's name or Alias. No fuzzy or typo-tolerant matching. Aliases are a hand-curated list and cover short forms, English/native names, well-known former names, and variants such as "St"/"Saint" and "&"/"and". "Congo" is an Alias of the Republic of the Congo only. America, Holland and England are not Aliases of anything.
  - **Records** — stores finished Attempts and derives Personal Best per (Quiz, Mode, Timer setting); a higher Score wins and equal Scores go to the shorter time. Built on a small storage interface: browser localStorage in the app, in-memory in tests. Stored data carries a schema version so future changes can migrate it. Each record holds: Quiz, Mode, Timer duration (or untimed), Score and total, time taken, ending, Wrong Guess count, and when it finished.
  - **UI (React)** — four screens: Quiz list, Attempt setup, Attempt, Results. The Attempt screen is the map plus a top bar with the answer box, Score, clock, and Pause, Unfound Highlight and Give up buttons. The UI holds no game rules; it renders Attempt state and forwards input.
  - **Map view (React + d3)** — renders Countries and territories, colors Found Countries, pulses newly Found ones, briefly highlights already-Found ones, draws circle markers for Countries too small to see at full-world zoom, handles zoom/pan/reset, shows the Unfound Highlight, and applies the hover rules (names for Found Countries only during an Attempt; all Countries on the Reveal; never territories). Colors: Unfound light neutral, Found strong, Missed contrasting (e.g. red), territories flat grey; exact palette is an implementation choice.
- **Pause overlay** hides the map and the answer box, shows only Score and time, and blocks answering until resumed.
- **Attempts are saved to Records when they end.** An Attempt in progress is not persisted.

## Testing Decisions

- **What makes a good test here**: it exercises behavior through a module's public interface — as a player would experience it — and never reaches into internal data structures or private helpers. Tests describe outcomes ("typing 'Ivory Coast' Finds Côte d'Ivoire", "after 15:00 the Attempt ends as Time's up"), so the internals can be refactored freely.
- **Seam 1 — Attempt module** (the primary seam; most tests live here). Covers: the 197 total; normalization (case, accents, punctuation, leading "the"); Aliases including former names and the Congo rule; rejection of misspellings and of America/Holland/England; auto-accept and the Niger/Nigeria retype; already-Found on input and on commit; Wrong Guess counting (Enter on non-matching text only; never on empty text or already-Found); Score; Timer countdown and stopwatch via the injected clock; Pause stopping the clock and blocking answers; each ending (Completed, Time's up, Gave up); Unfound and Missed lists.
- **Seam 2 — Records module**, tested with the in-memory storage. Covers: saving finished Attempts; Personal Best per Quiz, Mode and Timer setting; the shorter-time tie-break; data surviving a fresh Records instance over the same storage.
- **Data consistency test**: every one of the 197 Countries has a matching feature in the map data; Somaliland and Northern Cyprus map to Somalia and Cyprus; no Country id is duplicated; no Alias normalizes to the same text as another Country's name or Alias.
- **Not unit-tested in v1**: React screens and map rendering (colors, pulse, zoom, tooltips, markers). They are thin layers over Seam 1 and are verified by playing the game.
- **Prior art**: none — the repo has no code yet. These tests establish the conventions.

## Out of Scope

- The Locate and Name Modes (the setup screen shows only Free Recall).
- Any Quiz other than *Countries of the World*.
- Displaying the Wrong Guess count (it is recorded, not shown).
- Accounts, a backend, global leaderboards, and syncing history across devices.
- Typo-tolerant matching and answers in languages other than English (beyond native names that are Aliases).
- Changing the Timer once an Attempt has started.
- Hints that reveal names during an Attempt.
- Resuming an in-progress Attempt after a page reload.
- Mobile-optimized layouts (usable only).
- Automated UI tests.

## Further Notes

- Domain terms used throughout are defined in `CONTEXT.md`; the map approach is recorded in `docs/adr/0001-own-svg-map-not-tile-library.md`.
- The user commits and pushes manually — leave changes uncommitted.
