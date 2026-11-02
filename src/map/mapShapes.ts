import type { Feature, MultiPolygon, Polygon } from 'geojson'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'

export type MapShape = Feature<Polygon | MultiPolygon> & { id: string }

// A map as scripts/build-map-data.ts writes it, such as world-50m.json.
export type MapTopology = Topology<{ shapes: GeometryCollection }>

// One shape per Country, State or Territory, keyed by the id the build gave it: a Country's Natural
// Earth ADM0_A3 code, or a State's postal code.
export function mapShapesFrom(topology: MapTopology): MapShape[] {
  return feature(topology, topology.objects.shapes).features as MapShape[]
}

// The map data is fetched as a file of its own rather than bundled into the app's code, so the app
// starts without waiting for it, and a deploy that changes only the code doesn't make returning
// players download the map again.
export async function fetchMapShapes(url: string): Promise<MapShape[]> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Fetching ${url} failed: ${response.status}`)
  return mapShapesFrom(await response.json())
}
