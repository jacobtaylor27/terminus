import type { Feature, MultiPolygon, Polygon } from 'geojson'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import worldUrl from './world-50m.json?url'

export type MapShape = Feature<Polygon | MultiPolygon> & { id: string }

// The world map as scripts/build-map-data.ts writes it to world-50m.json.
export type WorldTopology = Topology<{ shapes: GeometryCollection }>

// One shape per Country or territory, keyed by its Natural Earth ADM0_A3 code.
export function mapShapesFrom(world: WorldTopology): MapShape[] {
  return feature(world, world.objects.shapes).features as MapShape[]
}

// The map data is fetched as a file of its own rather than bundled into the app's code, so the app
// starts without waiting for it, and a deploy that changes only the code doesn't make returning
// players download the map again.
export async function fetchMapShapes(): Promise<MapShape[]> {
  const response = await fetch(worldUrl)
  if (!response.ok) throw new Error(`Fetching ${worldUrl} failed: ${response.status}`)
  return mapShapesFrom(await response.json())
}
