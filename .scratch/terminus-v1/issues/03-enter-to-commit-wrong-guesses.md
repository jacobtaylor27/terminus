# 03 — Enter to commit: Wrong Guesses and already-Found

**Parent spec:** `.scratch/terminus-v1/spec.md`

**What to build:** Pressing Enter lets the player commit to and discard a guess. Enter on text that matches no Country clears the box and counts a Wrong Guess (recorded in Attempt state, not displayed in v1). Typing a Country that's already Found briefly highlights it on the map so the player knows it already counted; pressing Enter on it clears the box with no penalty. Enter on an empty box does nothing. Text deleted with backspace is never counted.

**Blocked by:** 01 — Type a Country, see it colored

**Status:** ready-for-agent

- [ ] The Attempt module exposes "commit" returning Wrong Guess / already Found / nothing
- [ ] Enter on non-matching text clears the answer box and increments the Wrong Guess count in Attempt state
- [ ] Enter on an empty box does nothing and doesn't count
- [ ] Text that is typed and then deleted without pressing Enter is never a Wrong Guess
- [ ] When the answer-box text matches an already-Found Country, that Country is briefly highlighted on the map
- [ ] Enter on an already-Found Country clears the box and is not a Wrong Guess
- [ ] The Wrong Guess count is not shown anywhere in the UI
- [ ] Attempt-seam tests cover each case above

## Comments

**2026-10-29** — Decided during implementation: a box holding only whitespace counts as empty (Enter does nothing), but punctuation-only text such as "???" is text that matches no Country, so Enter clears it and counts a Wrong Guess. The already-Found highlight is a short amber flash drawn over the Country's whole shape (overseas parts included); it replays whenever the answer-box text changes and still matches a Found Country, e.g. on backspace and retype, or a trailing space. On the map it is called a "flash" to keep it distinct from the Unfound Highlight (ticket 09).
