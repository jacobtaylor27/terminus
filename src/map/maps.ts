import {
  type GeoPath,
  type GeoPermissibleObjects,
  type GeoProjection,
  geoAlbersUsa,
  geoAzimuthalEqualArea,
  geoGraticule10,
  geoNaturalEarth1,
  geoPath,
} from 'd3-geo'
import type { MultiPoint } from 'geojson'
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
  // The map's edge: an outline that is filled with sea, with the 10° grid inside it, and drawn again in
  // ink over the land that meets it. The world's is its oval, and a Continent's is the rectangle of its
  // plate. The US map has none, as grid lines would break across the Alaska and Hawaii insets.
  edge: { outline: string; grid: string } | null
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

// Where a Continent's plate is: the box of longitudes and latitudes it shows, from its south-west
// corner to its north-east one. A box that crosses the 180th meridian gives its eastern edge past 180°.
type PlateBox = [[west: number, south: number], [east: number, north: number]]

const SPHERE: GeoPermissibleObjects = { type: 'Sphere' }

// Room around the map's edge, so its outline isn't cut off where the edge meets the map's frame.
const EDGE_MARGIN: Margin = { top: 1, right: 1, bottom: 1, left: 1 }

// Room above and below the States, so the Attempt screen's floating panels sit over empty paper at
// common laptop window sizes: the Score and the controls above Washington and Maine, and the answer box,
// with Cued Recall's Prompt over it, under Texas and Hawaii. None at the sides, which would only shrink
// the States in tall windows and on phones.
const US_MARGIN: Margin = { top: 100, right: 0, bottom: 200, left: 0 }

export const maps: Record<MapId, MapDefinition> = {
  world: {
    name: 'World map',
    dataUrl: worldUrl,
    frame() {
      const { path, height } = fit(geoNaturalEarth1(), SPHERE, EDGE_MARGIN)
      return { width: WIDTH, height, path, edge: edgeOf(path) }
    },
  },
  'us-states': {
    name: 'Map of the United States',
    dataUrl: usStatesUrl,
    // Albers USA draws Alaska and Hawaii as insets below the other States, so all 50 are in view at once.
    frame(shapes) {
      const { path, height } = fit(geoAlbersUsa(), { type: 'FeatureCollection', features: shapes }, US_MARGIN)
      return { width: WIDTH, height, path, edge: null }
    },
  },
  // Each Continent's plate reaches well south of its Countries, so the answer box, with Cued Recall's
  // Prompt over it, sits over sea at common laptop window sizes. Only remote subantarctic islands sit
  // under it, while their Countries stay plainly visible: see Africa's and Oceania's.
  //
  // From Cabo Verde to Mauritius, and from Tunisia to well south of the Cape. South Africa's Prince Edward
  // Islands sit under the answer box.
  africa: continent('Map of Africa', [
    [-26, -58],
    [60, 38],
  ]),
  // From Turkey to Japan, and from Kazakhstan to well south of Timor-Leste.
  asia: continent('Map of Asia', [
    [25, -32],
    [150, 56],
  ]),
  // From Iceland to the Urals, and from the North Cape to the Sahara, well south of Malta, Crete and
  // Cyprus. Russia runs on past the plate's eastern edge, so the top-right panel always sits over it, and
  // in windows 900 px wide the Score sits over Greenland, which is Denmark's. Both Countries stay plainly
  // visible.
  europe: continent('Map of Europe', [
    [-25, 23],
    [60, 72],
  ]),
  // From Alaska to Newfoundland, and from the Arctic coast to well south of Panama, Barbados and Trinidad.
  'north-america': continent('Map of North America', [
    [-170, -10],
    [-52, 72],
  ]),
  // From Australia to Kiribati's Line Islands, and from Palau and the Marshall Islands to well south of New
  // Zealand. Australia's Macquarie Island sits under the answer box. Its eastern edge is past 180°, so the
  // islands either side of the 180th meridian (Fiji, Tonga, Samoa, Tuvalu and Kiribati) are drawn in one
  // piece beside Australia.
  oceania: continent('Map of Oceania', [
    [110, -68],
    [205, 16],
  ]),
  // From the Caribbean, so the Score sits over sea north of Colombia, to the Antarctic Peninsula, well
  // south of Cape Horn.
  'south-america': continent('Map of South America', [
    [-82, -77],
    [-33, 18],
  ]),
}

// A Continent's map: a rectangular plate of the world map, framed on the box. Its Countries are drawn
// from the world map's shapes, and every other Country's land in the box is drawn too, as a Territory.
//
// The box is set by hand rather than fitted to the Continent's Countries, as some reach far beyond it:
// France's French Guiana and Réunion, the United States' Hawaii and Guam, Russia's Siberia. Land that
// reaches past the plate is cut off at its edge.
function continent(name: string, box: PlateBox): MapDefinition {
  return {
    name,
    dataUrl: worldUrl,
    frame() {
      const [[west, south], [east, north]] = box
      // Lambert's azimuthal equal-area projection, centred on the box, keeps the Continent's shapes and
      // areas true even far from the equator, and draws a box across the 180th meridian in one piece.
      const projection = geoAzimuthalEqualArea().rotate([-(west + east) / 2, -(south + north) / 2])
      const { path, height } = fit(projection, outlineOf(box), EDGE_MARGIN)
      // Nothing is drawn past the plate, which is the box's outline fitted into the frame.
      projection.clipExtent([
        [EDGE_MARGIN.left, EDGE_MARGIN.top],
        [WIDTH - EDGE_MARGIN.right, height - EDGE_MARGIN.bottom],
      ])
      return { width: WIDTH, height, path, edge: edgeOf(path) }
    },
  }
}

// The box's outline, as a point every degree along each edge. Its corners can't simply be joined, as a
// polygon's are, since d3 joins them by great circles rather than along the meridians and parallels.
function outlineOf([[west, south], [east, north]]: PlateBox): MultiPoint {
  const coordinates: [number, number][] = []
  for (let longitude = west; longitude <= east; longitude++) coordinates.push([longitude, south], [longitude, north])
  for (let latitude = south; latitude <= north; latitude++) coordinates.push([west, latitude], [east, latitude])
  return { type: 'MultiPoint', coordinates }
}

// The map's edge: the outline of the whole sphere, which a plate's clip cuts down to its rectangle, and
// the 10° grid inside it.
function edgeOf(path: GeoPath) {
  return { outline: path(SPHERE) ?? '', grid: path(geoGraticule10()) ?? '' }
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
