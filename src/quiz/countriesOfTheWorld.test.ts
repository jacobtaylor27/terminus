import { geoContains } from 'd3-geo'
import { describe, expect, it } from 'vitest'
import { startAttempt } from '../attempt/attempt.ts'
import { mapShapes } from '../map/mapShapes.ts'
import { countriesOfTheWorld } from './countriesOfTheWorld.ts'
import { acceptedNames } from './quiz.ts'

const countryIds = countriesOfTheWorld.places.map((place) => place.id)

const shapeIdsAt = (longitude: number, latitude: number) =>
  mapShapes.filter((shape) => geoContains(shape, [longitude, latitude])).map((shape) => shape.id)

describe('Countries of the World data', () => {
  it('has 197 Countries with no duplicated id', () => {
    expect(countryIds).toHaveLength(197)
    expect(new Set(countryIds).size).toBe(197)
  })

  it('lets every name and Alias Find its own Country, so none is shared with another', () => {
    const namesNotFindingTheirCountry = countriesOfTheWorld.places.flatMap((place) =>
      acceptedNames(place).filter((name) => {
        const result = startAttempt(countriesOfTheWorld, 'free-recall').inputChanged(name)
        return result.kind !== 'accepted' || result.place !== place
      }),
    )

    expect(namesNotFindingTheirCountry).toEqual([])
  })

  it('gives every Country exactly one map shape', () => {
    const shapeIds = mapShapes.map((shape) => shape.id)

    const countriesWithoutOneShape = countriesOfTheWorld.places.filter(
      (place) => shapeIds.filter((id) => id === place.id).length !== 1,
    )

    expect(countriesWithoutOneShape).toEqual([])
  })

  it.each([
    ['Somaliland', 'Somalia', 44.06, 9.56],
    ['Northern Cyprus', 'Cyprus', 33.75, 35.28],
    ['Greenland', 'Denmark', -40, 72],
    ['Puerto Rico', 'United States', -66.5, 18.25],
    ['Hong Kong', 'China', 114.1, 22.4],
    ['Åland', 'Finland', 19.95, 60.2],
    ['the Falkland Islands', 'United Kingdom', -59, -51.7],
  ])('draws %s as part of %s', (_region, countryName, longitude, latitude) => {
    const country = countriesOfTheWorld.places.find((place) => place.name === countryName)

    expect(shapeIdsAt(longitude, latitude)).toEqual([country?.id])
  })

  it('leaves only land that belongs to no Country as territory', () => {
    const territoryIds = mapShapes.map((shape) => shape.id).filter((id) => !countryIds.includes(id))

    // Antarctica, Siachen Glacier and Western Sahara
    expect(territoryIds.sort()).toEqual(['ATA', 'KAS', 'SAH'])
  })
})
