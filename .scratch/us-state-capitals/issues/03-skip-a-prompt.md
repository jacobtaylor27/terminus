# 03 — Skip a Prompt

**Parent spec:** `.scratch/us-state-capitals/spec.md` (sections "Attempt module", "Skip input", "Records"; stories 22–24, 26 and 29)

**What to build:** In Cued Recall, the player can Skip a Prompt they're stuck on:

- there's a Skip button beside the answer box, and Enter on an empty box is its shortcut;
- the skipped Prompt goes to the back of the queue and comes round again after every other Unfound one;
- a Skip isn't a Wrong Guess;
- each Attempt's Skip count is saved with it, but isn't shown yet.

**Blocked by:** 02 — Cued Recall: one Prompt at a time

**Status:** ready-for-agent

- [ ] The Attempt gains `skip()`:
  - in Cued Recall, it moves the current Prompt to the back of the queue and counts a Skip;
  - with one Prompt left, the same Prompt comes straight back, and the Skip still counts;
  - it does nothing in Free Recall, while paused, or once the Attempt has ended
- [ ] `state()` gains `skipCount`. A Skip never changes the Wrong Guess count
- [ ] The Skip button:
  - sits beside the answer box in the Prompt panel;
  - its mousedown doesn't take focus, like the Unfound Highlight button's;
  - its tooltip names the Enter-on-empty shortcut
- [ ] Enter on an empty answer box calls `skip()` in Cued Recall. In Free Recall it still does nothing
- [ ] Under the Pause overlay, the Skip button is hidden and inert, and the shortcut does nothing
- [ ] `AttemptRecord` gains `skipCount`, which is 0 in Free Recall. The stored schema stays at version 1, and a record saved before this change is read as 0 Skips
- [ ] Attempt-seam tests cover:
  - Skip to the back of the queue;
  - the Skip count, and the Wrong Guess count left unchanged;
  - a Skip with one Prompt left;
  - Skip blocked while paused and after the end;
  - `skip()` doing nothing in Free Recall
- [ ] Records-seam tests cover the Skip count being saved, and a stored record without one still reading
- [ ] Typecheck, the palette check and the full test suite stay green
