# 09 — Unfound Highlight

**Parent spec:** `.scratch/terminus-v1/spec.md`

**What to build:** The player can toggle an Unfound Highlight during an Attempt that marks where every Unfound Country is on the map — including tiny Countries' circle markers — without naming any of them, so they can scan for regions they've neglected. Toggling it again turns it off. It gives away no answers and has no effect on the Score.

**Blocked by:** 04 — Map interaction

**Status:** ready-for-agent

- [ ] An Unfound Highlight button on the Attempt screen toggles the highlight on and off
- [ ] While on, every Unfound Country (shape or marker) is visibly marked; Found Countries and territories are not
- [ ] The highlight shows no names, and hover rules are unchanged (Unfound Countries still show no tooltip)
- [ ] Finding a Country while the highlight is on removes its highlight
- [ ] Using the highlight does not change the Score or any Attempt state
- [ ] Toggling the highlight does not take focus away from the answer box
