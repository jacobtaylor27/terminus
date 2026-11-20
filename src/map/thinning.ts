import type { Position } from 'geojson'
import type { MapShape } from './mapShapes.ts'

// How coarsely a thumbnail's outlines are drawn: along each one, a point within this many degrees of
// the last one kept is left out. A thumbnail is too small to show finer detail, and projecting every
// point of the map data would hold up the home page for most of a second.
export const THINNING_DEGREES = 0.5

// The shape with fewer points, for drawing small. A piece of land too small to keep a ring of its own
// is left out.
export function thinned(shape: MapShape): MapShape {
  const polygons = shape.geometry.type === 'Polygon' ? [shape.geometry.coordinates] : shape.geometry.coordinates
  const coordinates = polygons.flatMap((rings) => {
    const [outer, ...holes] = rings.map(thinnedRing)
    return outer ? [[outer, ...holes.filter((hole) => hole !== null)]] : []
  })
  return { ...shape, geometry: { type: 'MultiPolygon', coordinates } }
}

// The ring with each point dropped that is within THINNING_DEGREES of the last one kept, in both
// longitude and latitude, or null if too few are left to enclose anything. It keeps its first and
// last points, so it stays closed.
//
// Thinning can leave a small island as a sliver that winds the other way round. d3 takes a ring's
// winding to tell its inside from its outside, so it would draw that island as the whole globe but
// the island. Such a ring is kept as it was.
function thinnedRing(ring: Position[]): Position[] | null {
  const kept = [ring[0]]
  for (const point of ring.slice(1, -1)) {
    const [lastLongitude, lastLatitude] = kept[kept.length - 1]
    if (
      Math.abs(point[0] - lastLongitude) >= THINNING_DEGREES ||
      Math.abs(point[1] - lastLatitude) >= THINNING_DEGREES
    ) {
      kept.push(point)
    }
  }
  kept.push(ring[ring.length - 1])
  if (kept.length < 4) return null
  return Math.sign(windingArea(kept)) === Math.sign(windingArea(ring)) ? kept : ring
}

// Twice the ring's area in degrees, as if longitude and latitude were flat: positive one way round,
// and negative the other.
function windingArea(ring: Position[]): number {
  let area = 0
  for (let i = 1; i < ring.length; i++) {
    area += (ring[i - 1][0] - ring[i][0]) * (ring[i - 1][1] + ring[i][1])
  }
  return area
}
