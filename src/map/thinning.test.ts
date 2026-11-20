import { geoArea } from 'd3-geo'
import { describe, expect, it } from 'vitest'
import canadaProvinces from './canada-provinces-50m.json'
import { mapShapesFrom } from './mapShapes.ts'
import { THINNING_DEGREES, thinned } from './thinning.ts'
import usStates from './us-states-50m.json'
import world from './world-50m.json'

const maps = {
  'the world map': mapShapesFrom(world),
  'the US map': mapShapesFrom(usStates),
  'the Canada map': mapShapesFrom(canadaProvinces),
}

// The number of points in the shape's outlines.
function pointCount(shape: ReturnType<typeof thinned>): number {
  const polygons = shape.geometry.type === 'Polygon' ? [shape.geometry.coordinates] : shape.geometry.coordinates
  return polygons.flat().reduce((count, ring) => count + ring.length, 0)
}

describe.each(Object.entries(maps))('thinning the shapes of %s', (_, shapes) => {
  // A ring turned inside out covers the rest of the globe, so its area dwarfs the shape's.
  it('keeps every shape about its size, never turning a ring inside out', () => {
    const grown = shapes
      .map((shape) => ({ id: shape.id, before: geoArea(shape), after: geoArea(thinned(shape)) }))
      .filter(({ before, after }) => after > before * 1.1 + 1e-6)

    expect(grown).toEqual([])
  })

  it(`leaves out points within ${THINNING_DEGREES}° of each other, so the map has far fewer`, () => {
    const before = shapes.reduce((count, shape) => count + pointCount(shape), 0)
    const after = shapes.reduce((count, shape) => count + pointCount(thinned(shape)), 0)

    expect(after).toBeLessThan(before / 3)
  })
})
