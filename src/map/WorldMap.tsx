import { geoNaturalEarth1, geoPath } from 'd3-geo'
import type { GeoPermissibleObjects } from 'd3-geo'
import { mapShapes } from './mapShapes.ts'

const WIDTH = 960
const SPHERE: GeoPermissibleObjects = { type: 'Sphere' }

const projection = geoNaturalEarth1().fitWidth(WIDTH, SPHERE)
const path = geoPath(projection)
const HEIGHT = Math.ceil(path.bounds(SPHERE)[1][1])

// The projection never changes, so every shape's outline is computed once.
const spherePath = path(SPHERE) ?? ''
const shapePaths = mapShapes.map((shape) => ({ id: shape.id, d: path(shape) ?? '' }))

interface WorldMapProps {
  countryIds: ReadonlySet<string>
  foundIds: ReadonlySet<string>
}

export function WorldMap({ countryIds, foundIds }: WorldMapProps) {
  return (
    <svg className="world-map" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="World map">
      <path className="sphere" d={spherePath} />
      {shapePaths.map(({ id, d }) => (
        <path key={id} d={d} className={shapeClass(id, countryIds, foundIds)} />
      ))}
    </svg>
  )
}

function shapeClass(id: string, countryIds: ReadonlySet<string>, foundIds: ReadonlySet<string>) {
  if (!countryIds.has(id)) return 'territory'
  return foundIds.has(id) ? 'country found' : 'country'
}
