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
