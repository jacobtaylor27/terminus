# Terminus

A geography quiz game played on a map. The player picks a quiz and answers by typing or clicking places.

## Language

**Quiz**:
A selectable set of geographic content to be tested on, defined by which places it covers and what is asked about them (e.g. *Countries of the World*, *US State Capitals*, *Capitals of Africa*).
_Avoid_: Game, quiz mode, level

**Mode**:
The mechanic by which the player answers a Quiz. One of Free Recall, Cued Recall, Locate, or Name.
_Avoid_: Game type, play style

**Free Recall**:
A Mode with no prompts: the player types any answer in any order, and each correct one is revealed on the map.

**Cued Recall**:
A Mode where the player is given one Prompt at a time, in a random order, and types the answer to it. They may Skip a Prompt they're stuck on.

**Prompt**:
In Cued Recall, what the player is being asked right now: one Unfound Place, shown by a clue that isn't its name. For a capital, the clue is the State or Country it is the capital of. Unlike in Name, the map doesn't show where the Place is.
_Avoid_: Question, cue

**Skip**:
In Cued Recall, passing on the current Prompt. Its Place goes to the back of the queue and is asked again after every other Unfound one. A Skip is not a Wrong Guess.

**Locate**:
A Mode where the player is shown a place's name and must click where it is on the map.

**Name**:
A Mode where a place is highlighted on the map and the player must type its name.

**Timer**:
An optional countdown the player switches on and sets (default 15:00) before an Attempt starts, fixed once it begins; the Attempt ends when it reaches zero. Without a Timer, the Attempt's elapsed time counts up instead.
_Avoid_: Timer mode, timed mode

**Place**:
Anything a Quiz asks about that the player can give as an answer, with a stable id and a display name — a Country in *Countries of the World*, a capital in *US State Capitals* or *Capitals of Africa*.
_Avoid_: Item, question

**Country**:
One of the 197 places Terminus treats as countries: the 193 UN member states plus Vatican City, Palestine, Kosovo and Taiwan. Dependent territories and autonomous regions (e.g. Greenland, Puerto Rico, Hong Kong) and breakaway regions (Somaliland, Northern Cyprus) are not Countries of their own; they are part of the Country they belong to.
_Avoid_: Nation, state (a State is one of the US states)

**State**:
One of the 50 states of the United States. In *US State Capitals*, each State is drawn on the map and named by the Prompt for its capital. Washington, D.C. is not a State.

**Territory**:
Land on a map that is never an answer. On the world map: land that belongs to no Country, which is Antarctica and the disputed Western Sahara and Siachen Glacier. On the US map: Washington, D.C., which is in no State. A Territory is drawn but is never an answer.
_Avoid_: Using it for dependent territories, which are part of their Country

**Alias**:
An alternative name accepted as a correct answer for a place: a short form (USA), another-language name (Ivory Coast / Côte d'Ivoire) or a well-known former name (Burma). Ambiguous colloquial names (America, Holland, England) are not Aliases.

**Pause**:
A player-initiated halt of an Attempt's clock, during which the map and found answers are hidden and only the Score and time are shown. Leaving the browser tab is not a Pause.

**Attempt**:
One play-through of a Quiz in a given Mode, from start until it ends by being completed, by the Timer running out, or by the player giving up.
_Avoid_: Game, session, round, run

**Score**:
The number of correct answers found in an Attempt, shown out of the total (e.g. 162/197).

**Personal Best**:
The best Attempt saved in this browser for a given Quiz, Mode and Timer setting: highest Score, with ties going to the shorter time.
_Avoid_: High score, record

**Wrong Guess**:
A guess the player commits by pressing Enter on text that isn't a correct answer. In Free Recall, that is text that matches no answer in the Quiz. In Cued Recall, it is anything but the answer to the current Prompt, even another Place's answer. Text deleted before committing is never a Wrong Guess, and neither is an answer already Found in Free Recall.

**Found / Unfound**:
During an Attempt, an answer is Found once the player has correctly given it, and Unfound until then.

**Missed**:
An answer still Unfound when the Attempt ends.

**Unfound Highlight**:
A toggle during an Attempt that marks where every Unfound answer is on the map without naming them. It gives away no answers and has no effect on the Score.
_Avoid_: Hint

**Reveal**:
The end-of-Attempt display of every Missed answer, shown distinctly from the Found ones.
