export type Mode = 'free-recall'

export interface Place {
  id: string
  name: string
  aliases?: string[]
}

// Every text accepted as a correct answer for the Place: its name and its Aliases.
export function acceptedNames(place: Place): string[] {
  return [place.name, ...(place.aliases ?? [])]
}

export interface Quiz {
  id: string
  title: string
  places: Place[]
  modes: Mode[]
}
