# 01 — Give up from the Pause overlay

**Parent spec:** `.scratch/quiet-atlas/spec.md`

**What to build:** Giving up becomes a deliberate step. The Give up button leaves the play screen, so a slip of the mouse next to Pause can no longer end an Attempt. It now appears in the Pause overlay, below Resume. Resume stays the main button and has focus when the overlay opens. Give up is a secondary button. Giving up from the overlay ends the Attempt as Gave up, with only the time played before the Pause, and shows Results as today. This is the redesign's only behaviour change. It replaces v1 story 55, and the rest of the quiet-atlas work assumes it is done.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] The Attempt screen's bar no longer has a Give up button
- [ ] The Pause overlay shows Resume, then Give up below it; Resume is the larger, main button and Give up a secondary one
- [ ] Resume has focus when the overlay opens, and Enter there resumes and puts focus back in the answer box (unchanged)
- [ ] Give up in the overlay ends the Attempt as Gave up and shows Results, with the time played before the Pause (time spent paused is not counted)
- [ ] The Attempt is saved to Records once, as today
- [ ] No change to the Attempt module. The existing test "ends the Attempt as Gave up, with the time played before the Pause, when the player gives up while paused" still passes, and the full test suite is green
- [ ] Checked in the browser: Pause, then Give up, shows Results with the ending "Gave up" and the pre-Pause time
