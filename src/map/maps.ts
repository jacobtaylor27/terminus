import {
  type GeoPath,
  type GeoPermissibleObjects,
  type GeoProjection,
  geoAlbersUsa,
  geoGraticule10,
  geoNaturalEarth1,
  geoPath,
} from 'd3-geo'
import type { MapId } from '../quiz/quiz.ts'
import type { MapShape } from './mapShapes.ts'
import usStatesUrl from './us-states-50m.json?url'
import worldUrl from './world-50m.json?url'

// Every map is this wide in its own units, and as tall as its frame needs.
const WIDTH = 960

// How a map's shapes are drawn: the frame they're drawn in, and where they go in it.
export interface MapFrame {
  width: number
  height: number
  path: GeoPath
  // The world's oval, which is filled with sea and outlined over the land that meets it, and its 10°
  // grid. The US map has neither, as grid lines would break across the Alaska and Hawaii insets.
  oval: { outline: string; grid: string } | null
}

export interface MapDefinition {
  // What a screen reader calls the map.
  name: string
  // The map's data, as scripts/build-map-data.ts writes it.
  dataUrl: string
  // The frame for the map's shapes, once they've loaded.
  frame(shapes: MapShape[]): MapFrame
}

// Room left around a map's content, in the map's units.
interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

const SPHERE: GeoPermissibleObjects = { type: 'Sphere' }

// Room around the world oval, so its outline isn't cut off where the oval meets the map's edge.
const OVAL_MARGIN: Margin = { top: 1, right: 1, bottom: 1, left: 1 }

// Room above and below the States, so the Attempt screen's floating panels sit over empty paper at
// common laptop window sizes: the Score and the controls above Washington and Maine, and the answer box
// under Texas. None at the sides, which would only shrink the States in tall windows and on phones.
const US_MARGIN: Margin = { top: 100, right: 0, bottom: 120, left: 0 }

export const maps: Record<MapId, MapDefinition> = {
  world: {
    name: 'World map',
    dataUrl: worldUrl,
    frame() {
      const { path, height } = fit(geoNaturalEarth1(), SPHERE, OVAL_MARGIN)
      const oval = { outline: path(SPHERE) ?? '', grid: path(geoGraticule10()) ?? '' }
      return { width: WIDTH, height, path, oval }
    },
  },
  'us-states': {
    name: 'Map of the United States',
    dataUrl: usStatesUrl,
    // Albers USA draws Alaska and Hawaii as insets below the other States, so all 50 are in view at once.
    frame(shapes) {
      const { path, height } = fit(geoAlbersUsa(), { type: 'FeatureCollection', features: shapes }, US_MARGIN)
      return { width: WIDTH, height, path, oval: null }
    },
  },
}

// Fits the projection to the map's width with the margin around the content, and gives the path that
// draws with it and the frame's height.
function fit(projection: GeoProjection, content: GeoPermissibleObjects, margin: Margin) {
  projection.fitWidth(WIDTH - margin.left - margin.right, content)
  const [translateX, translateY] = projection.translate()
  projection.translate([translateX + margin.left, translateY + margin.top])
  const path = geoPath(projection)
  return { path, height: Math.ceil(path.bounds(content)[1][1] + margin.bottom) }
}
