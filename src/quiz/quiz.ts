export type Mode = 'free-recall'

export interface Place {
  id: string
  name: string
}

export interface Quiz {
  id: string
  title: string
  places: Place[]
  modes: Mode[]
}
