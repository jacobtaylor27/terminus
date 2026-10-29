# 05 — Quiz list and Attempt setup screens

**Parent spec:** `.scratch/terminus-v1/spec.md`

**What to build:** The player now reaches an Attempt through the real flow. The home screen is a list of Quiz cards built from the Quiz catalog — for now a single *Countries of the World* card. Picking it opens the Attempt setup screen with a Mode picker (only the Modes the Quiz supports — Free Recall in v1) and a Start button. Start begins the Attempt with the answer box focused.

**Blocked by:** 01 — Type a Country, see it colored

**Status:** ready-for-agent

- [ ] Opening the app shows the Quiz list, not the Attempt
- [ ] The Quiz list renders one card per Quiz in the catalog; *Countries of the World* appears as a card
- [ ] Choosing a Quiz opens its Attempt setup screen
- [ ] The setup screen's Mode picker offers only the Modes the Quiz declares (Free Recall only for *Countries of the World*)
- [ ] Start begins an Attempt of the chosen Quiz in the chosen Mode, with the answer box focused
- [ ] The setup screen can be left to return to the Quiz list

## Comments

**2026-10-29** — Decided during implementation: the Quiz catalog is `quizCatalog` in `src/quiz/catalog.ts`, and each Mode's name and one-line description for the picker live beside the `Mode` type (`modeDetails` in `src/quiz/quiz.ts`), so adding Locate or Name won't typecheck until it has both. The Mode picker is a radio group that shows even when the Quiz has only one Mode, with the first Mode chosen. The Start button is focused on arrival, so Enter starts the Attempt straight away. A Quiz card shows only the title for now, at the top of the card so ticket 10's Personal Best can go beneath it. The screens are switched by state in `App`, with no URLs, so the browser's back button doesn't move between them and a reload returns to the Quiz list. An Attempt has no way out except a reload until Give up arrives in ticket 06. The setup screen is a `<form>`, so ticket 07's −/+ Timer buttons must be `type="button"`.
