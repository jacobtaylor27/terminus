import { geoContains } from 'd3-geo'
import { describe, expect, it } from 'vitest'
import { startAttempt } from '../attempt/attempt.ts'
import { mapShapesFrom } from '../map/mapShapes.ts'
import usStates from '../map/us-states-50m.json'
import { acceptedNames } from './quiz.ts'
import { usStateCapitals } from './usStateCapitals.ts'

const capitalIds = usStateCapitals.places.map((place) => place.id)
const mapShapes = mapShapesFrom(usStates)

const shapeIdsAt = (longitude: number, latitude: number) =>
  mapShapes.filter((shape) => geoContains(shape, [longitude, latitude])).map((shape) => shape.id)

// What a new Free Recall Attempt makes of the text typed into its answer box.
const typed = (text: string) => startAttempt(usStateCapitals, 'free-recall', () => 0).inputChanged(text)

describe('US State Capitals data', () => {
  it('has 50 capitals with no duplicated id', () => {
    expect(capitalIds).toHaveLength(50)
    expect(new Set(capitalIds).size).toBe(50)
  })

  it('lets every name and Alias Find its own capital, so none is shared with another', () => {
    const namesNotFindingTheirCapital = usStateCapitals.places.flatMap((place) =>
      acceptedNames(place).filter((name) => {
        const result = typed(name)
        return result.kind !== 'accepted' || result.place !== place
      }),
    )

    expect(namesNotFindingTheirCapital).toEqual([])
  })

  it.each(['St Paul', 'St. Paul', 'saint paul'])('accepts %s for Saint Paul', (text) => {
    const result = typed(text)

    expect(result.kind === 'accepted' && result.place.name).toBe('Saint Paul')
  })

  it("gives every capital its State's name as its prompt, and no two the same", () => {
    const prompts = usStateCapitals.places.map((place) => place.prompt)

    expect(prompts.filter((prompt) => !prompt)).toEqual([])
    expect(new Set(prompts).size).toBe(50)
  })

  it("accepts no State's name as an answer", () => {
    const stateNamesAccepted = usStateCapitals.places
      .map((place) => place.prompt ?? '')
      .filter((stateName) => typed(stateName).kind !== 'no-match')

    expect(stateNamesAccepted).toEqual([])
  })

  it("gives every capital exactly one map shape, its State's", () => {
    const shapeIds = mapShapes.map((shape) => shape.id)

    const capitalsWithoutOneShape = usStateCapitals.places.filter(
      (place) => shapeIds.filter((id) => id === place.id).length !== 1,
    )

    expect(capitalsWithoutOneShape).toEqual([])
  })

  it('leaves only Washington, D.C. as territory', () => {
    const territoryIds = mapShapes.map((shape) => shape.id).filter((id) => !capitalIds.includes(id))

    expect(territoryIds).toEqual(['DC'])
  })

  it.each([
    ['Lake Superior', -87.5, 47.6],
    ['Lake Michigan', -87.0, 43.5],
    ['Lake Erie', -81.5, 42.0],
  ])('draws %s as water, in no State', (_lake, longitude, latitude) => {
    expect(shapeIdsAt(longitude, latitude)).toEqual([])
  })

  it.each(['Los Angeles', 'Portland'])('makes %s, a city that is no capital, a Wrong Guess on Enter', (city) => {
    const attempt = startAttempt(usStateCapitals, 'free-recall', () => 0)

    expect(attempt.inputChanged(city).kind).toBe('no-match')
    expect(attempt.commit(city).kind).toBe('wrong-guess')
  })
})
