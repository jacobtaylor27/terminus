import type { GeometryCollection, Topology } from 'topojson-specification'

declare const world: Topology<{ shapes: GeometryCollection }>
export default world
