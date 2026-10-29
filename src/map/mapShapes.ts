import type { Feature, MultiPolygon, Polygon } from 'geojson'
import { feature } from 'topojson-client'
import world from './world-50m.json'

export type MapShape = Feature<Polygon | MultiPolygon> & { id: string }

// One shape per Country or territory, keyed by its Natural Earth ADM0_A3 code
// (built by scripts/build-map-data.ts).
export const mapShapes = feature(world, world.objects.shapes).features as MapShape[]
