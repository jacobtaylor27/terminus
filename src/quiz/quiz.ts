export type Mode = 'free-recall'

// How each Mode is presented to the player when choosing one.
export const modeDetails: Record<Mode, { name: string; description: string }> = {
  'free-recall': { name: 'Free Recall', description: 'Type every answer you can think of, in any order.' },
}

export interface Place {
  id: string
  name: string
  aliases?: string[]
  // A clue to the Place that isn't its name. For a capital, it's the State it is the capital of.
  prompt?: string
}

// Every text accepted as a correct answer for the Place: its name and its Aliases.
export function acceptedNames(place: Place): string[] {
  return [place.name, ...(place.aliases ?? [])]
}

// The maps a Quiz can be played on.
export type MapId = 'world' | 'us-states'

export interface Quiz {
  id: string
  title: string
  places: Place[]
  modes: Mode[]
  // The map the Quiz is played on.
  map: MapId
}
