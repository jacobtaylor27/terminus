import { type GeoProjection, geoArea } from 'd3-geo'
import type { Polygon, Position } from 'geojson'
import { describe, expect, it } from 'vitest'
import { startAttempt } from '../attempt/attempt.ts'
import { maps } from '../map/maps.ts'
import { type MapShape, mapShapesFrom } from '../map/mapShapes.ts'
import world from '../map/world-50m.json'
import {
  type Continent,
  countriesOfAfrica,
  countriesOfAsia,
  countriesOfEurope,
  countriesOfNorthAmerica,
  countriesOfOceania,
  countriesOfSouthAmerica,
  countryIdsByContinent,
} from './countriesOfTheContinents.ts'
import { countriesOfTheWorld } from './countriesOfTheWorld.ts'
import type { Quiz } from './quiz.ts'

const mapShapes = mapShapesFrom(world)
const shapesById = new Map(mapShapes.map((shape) => [shape.id, shape]))

// Each continent Quiz, with the Continent it is for and how many Countries it has.
const continentQuizzes: [Continent, Quiz, number][] = [
  ['africa', countriesOfAfrica, 54],
  ['asia', countriesOfAsia, 48],
  ['europe', countriesOfEurope, 46],
  ['north-america', countriesOfNorthAmerica, 23],
  ['oceania', countriesOfOceania, 14],
  ['south-america', countriesOfSouthAmerica, 12],
]

// Countries whose largest piece of land reaches past their Continent's plate: Russia runs on past Europe
// to the Pacific, and Denmark's largest piece is Greenland.
const reachingPastThePlate: Partial<Record<Continent, string[]>> = { europe: ['RUS', 'DNK'] }

// The shape's largest piece of land, by its area on the globe.
function largestPiece(shape: MapShape): Polygon {
  const pieces: Polygon[] =
    shape.geometry.type === 'Polygon'
      ? [shape.geometry]
      : shape.geometry.coordinates.map((coordinates) => ({ type: 'Polygon', coordinates }))
  return pieces.reduce((a, b) => (geoArea(b) > geoArea(a) ? b : a))
}

describe('the Continents', () => {
  it.each([
    ['africa', 54],
    ['asia', 48],
    ['europe', 46],
    ['north-america', 23],
    ['oceania', 14],
    ['south-america', 12],
  ] as const)('give %s %i Countries', (continent, count) => {
    expect(countryIdsByContinent[continent]).toHaveLength(count)
  })

  it('put every Country of the World in exactly one Continent', () => {
    const listedIds = Object.values(countryIdsByContinent).flat()
    const worldIds = countriesOfTheWorld.places.map((place) => place.id)

    expect(listedIds).toHaveLength(worldIds.length)
    expect([...listedIds].sort()).toEqual([...worldIds].sort())
  })

  it.each([
    ['RUS', 'Russia', 'europe'],
    ['CYP', 'Cyprus', 'europe'],
    ['TUR', 'Turkey', 'asia'],
    ['KAZ', 'Kazakhstan', 'asia'],
    ['GEO', 'Georgia', 'asia'],
    ['ARM', 'Armenia', 'asia'],
    ['AZE', 'Azerbaijan', 'asia'],
    ['EGY', 'Egypt', 'africa'],
    ['PAN', 'Panama', 'north-america'],
    ['IDN', 'Indonesia', 'asia'],
    ['TLS', 'Timor-Leste', 'asia'],
    ['PNG', 'Papua New Guinea', 'oceania'],
  ] as const)('put %s (%s) in %s', (id, _name, continent) => {
    expect(countryIdsByContinent[continent]).toContain(id)
  })
})

describe.each(continentQuizzes)('the Quiz of %s', (continent, quiz, count) => {
  it(`has ${count} Countries with no duplicated id`, () => {
    const ids = quiz.places.map((place) => place.id)

    expect(ids).toHaveLength(count)
    expect(new Set(ids).size).toBe(count)
  })

  it("asks for Countries of the World's own Places, with their names and Aliases", () => {
    const notTheWorldsOwn = quiz.places.filter((place) => !countriesOfTheWorld.places.includes(place))

    expect(notTheWorldsOwn).toEqual([])
  })

  it("is played in Free Recall only, on its Continent's map", () => {
    expect(quiz.modes).toEqual(['free-recall'])
    expect(quiz.map).toBe(continent)
  })

  it("draws each Country's largest piece of land wholly inside the plate", () => {
    const frame = maps[quiz.map].frame(mapShapes)
    // The plate is the whole sphere, clipped to the plate's rectangle.
    const [[left, top], [right, bottom]] = frame.path.bounds({ type: 'Sphere' })
    // Projected without the plate's clip, so a piece cut off at its edge shows as reaching past it.
    const project = frame.path.projection<GeoProjection>()
    const isInside = ([longitude, latitude]: Position) => {
      const [x, y] = project([longitude, latitude]) ?? [Number.NaN, Number.NaN]
      return x > left && x < right && y > top && y < bottom
    }

    const cutOff = quiz.places
      .filter((place) => !reachingPastThePlate[continent]?.includes(place.id))
      .filter((place) => !largestPiece(shapesById.get(place.id)!).coordinates[0].every(isInside))
      .map((place) => place.name)

    expect(cutOff).toEqual([])
  })
})

describe('Countries of Africa', () => {
  it('is no-match for a Country of another Continent, and a Wrong Guess on Enter', () => {
    const attempt = startAttempt(countriesOfAfrica, 'free-recall', () => 0)

    expect(attempt.inputChanged('France').kind).toBe('no-match')
    expect(attempt.commit('France').kind).toBe('wrong-guess')
  })

  it("accepts a Country's Aliases, as Countries of the World does", () => {
    const result = startAttempt(countriesOfAfrica, 'free-recall', () => 0).inputChanged('Ivory Coast')

    expect(result.kind === 'accepted' && result.place.id).toBe('CIV')
  })
})
