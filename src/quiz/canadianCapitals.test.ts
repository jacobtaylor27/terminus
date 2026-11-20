import { geoContains } from 'd3-geo'
import { describe, expect, it } from 'vitest'
import { startAttempt } from '../attempt/attempt.ts'
import canadaProvinces from '../map/canada-provinces-50m.json'
import { mapShapesFrom } from '../map/mapShapes.ts'
import { canadianCapitals } from './canadianCapitals.ts'
import { acceptedNames } from './quiz.ts'

const capitalIds = canadianCapitals.places.map((place) => place.id)
const mapShapes = mapShapesFrom(canadaProvinces)

const shapeIdsAt = (longitude: number, latitude: number) =>
  mapShapes.filter((shape) => geoContains(shape, [longitude, latitude])).map((shape) => shape.id)

// What a new Free Recall Attempt makes of the text typed into its answer box.
const typed = (text: string) => startAttempt(canadianCapitals, 'free-recall', () => 0).inputChanged(text)

describe('Canadian Capitals data', () => {
  it('has 13 capitals, one for each of the 10 provinces and 3 territories, with no duplicated id', () => {
    expect(capitalIds).toHaveLength(13)
    expect(new Set(capitalIds).size).toBe(13)
  })

  it('lets every name and Alias Find its own capital, so none is shared with another', () => {
    const namesNotFindingTheirCapital = canadianCapitals.places.flatMap((place) =>
      acceptedNames(place).filter((name) => {
        const result = typed(name)
        return result.kind !== 'accepted' || result.place !== place
      }),
    )

    expect(namesNotFindingTheirCapital).toEqual([])
  })

  it.each(["St. John's", 'St Johns', "Saint John's", 'saint johns'])("accepts %s for St. John's", (text) => {
    const result = typed(text)

    expect(result.kind === 'accepted' && result.place.name).toBe("St. John's")
  })

  it.each(['Quebec City', 'Québec City', 'quebec city'])('accepts %s for Quebec City', (text) => {
    const result = typed(text)

    expect(result.kind === 'accepted' && result.place.name).toBe('Quebec City')
  })

  it("gives every capital its Province's name as its prompt, and no two the same", () => {
    const prompts = canadianCapitals.places.map((place) => place.prompt)

    expect(prompts.filter((prompt) => !prompt)).toEqual([])
    expect(new Set(prompts).size).toBe(13)
  })

  it("accepts no Province's name as an answer", () => {
    const provinceNamesAccepted = canadianCapitals.places
      .map((place) => place.prompt ?? '')
      .filter((provinceName) => typed(provinceName).kind !== 'no-match')

    expect(provinceNamesAccepted).toEqual([])
  })

  it("gives every capital exactly one map shape, its Province's, and the map no other shape", () => {
    const shapeIds = mapShapes.map((shape) => shape.id)

    const capitalsWithoutOneShape = canadianCapitals.places.filter(
      (place) => shapeIds.filter((id) => id === place.id).length !== 1,
    )

    expect(capitalsWithoutOneShape).toEqual([])
    expect(shapeIds.filter((id) => !capitalIds.includes(id))).toEqual([])
  })

  it.each([
    ['Lake Superior', -87.5, 48.4],
    ['Georgian Bay, on Lake Huron', -80.8, 45.2],
    ['Lake Ontario', -78.0, 43.8],
  ])('draws %s as water, in no Province', (_lake, longitude, latitude) => {
    expect(shapeIdsAt(longitude, latitude)).toEqual([])
  })

  it.each([
    ['Edmonton', 'AB', -113.5, 53.55],
    ['Regina', 'SK', -104.6, 50.45],
    ['Winnipeg', 'MB', -97.15, 49.9],
    ['Fredericton', 'NB', -66.65, 45.95],
    ['Yellowknife', 'NT', -114.37, 62.45],
    ['Whitehorse', 'YT', -135.05, 60.72],
  ])('draws %s in its own Province', (_city, provinceId, longitude, latitude) => {
    expect(shapeIdsAt(longitude, latitude)).toEqual([provinceId])
  })

  it.each(['Saint John', 'Montreal', 'Vancouver', 'Ottawa'])(
    'makes %s, a city that is no Provincial or Territorial capital, a Wrong Guess on Enter',
    (city) => {
      const attempt = startAttempt(canadianCapitals, 'free-recall', () => 0)

      expect(attempt.inputChanged(city).kind).toBe('no-match')
      expect(attempt.commit(city).kind).toBe('wrong-guess')
    },
  )
})
