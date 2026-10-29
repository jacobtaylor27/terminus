// Builds src/map/world-50m.json, the world map Terminus draws, from Natural Earth's 1:50m
// admin-0 countries (see docs/adr/0001-own-svg-map-not-tile-library.md).
// Run with `pnpm map-data`. The output is committed, so builds and tests never need the network.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import { mergeArcs } from 'topojson-client'
import { topology } from 'topojson-server'
import type {
  GeometryCollection,
  GeometryObject,
  MultiPolygon as TopoMultiPolygon,
  Polygon as TopoPolygon,
} from 'topojson-specification'

const SOURCE_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_0_countries.geojson'
const OUTPUT_URL = new URL('../src/map/world-50m.json', import.meta.url)

// Natural Earth draws these as features of their own; Terminus treats each as part of the Country it belongs to
// (Natural Earth's sovereign). Only land that belongs to no Country — Antarctica, and the disputed Western Sahara
// and Siachen Glacier — is left as territory.
const PARENT_COUNTRIES: Record<string, string> = {
  // Breakaway regions
  SOL: 'SOM', // Somaliland
  CYN: 'CYP', // Northern Cyprus

  // Dependent territories and autonomous regions
  ATC: 'AUS', // Ashmore and Cartier Islands
  HMD: 'AUS', // Heard Island and McDonald Islands
  IOA: 'AUS', // Indian Ocean Territories
  NFK: 'AUS', // Norfolk Island
  HKG: 'CHN', // Hong Kong
  MAC: 'CHN', // Macau
  FRO: 'DNK', // Faroe Islands
  GRL: 'DNK', // Greenland
  ALD: 'FIN', // Åland
  ATF: 'FRA', // French Southern and Antarctic Lands
  BLM: 'FRA', // Saint Barthélemy
  MAF: 'FRA', // Saint Martin
  NCL: 'FRA', // New Caledonia
  PYF: 'FRA', // French Polynesia
  SPM: 'FRA', // Saint Pierre and Miquelon
  WLF: 'FRA', // Wallis and Futuna
  AIA: 'GBR', // Anguilla
  BMU: 'GBR', // Bermuda
  CYM: 'GBR', // Cayman Islands
  FLK: 'GBR', // Falkland Islands
  GGY: 'GBR', // Guernsey
  IMN: 'GBR', // Isle of Man
  IOT: 'GBR', // British Indian Ocean Territory
  JEY: 'GBR', // Jersey
  MSR: 'GBR', // Montserrat
  PCN: 'GBR', // Pitcairn Islands
  SGS: 'GBR', // South Georgia and the South Sandwich Islands
  SHN: 'GBR', // Saint Helena
  TCA: 'GBR', // Turks and Caicos Islands
  VGB: 'GBR', // British Virgin Islands
  ABW: 'NLD', // Aruba
  CUW: 'NLD', // Curaçao
  SXM: 'NLD', // Sint Maarten
  COK: 'NZL', // Cook Islands
  NIU: 'NZL', // Niue
  ASM: 'USA', // American Samoa
  GUM: 'USA', // Guam
  MNP: 'USA', // Northern Mariana Islands
  PRI: 'USA', // Puerto Rico
  VIR: 'USA', // United States Virgin Islands
}

const response = await fetch(SOURCE_URL)
if (!response.ok) throw new Error(`Downloading ${SOURCE_URL} failed: ${response.status}`)
const source = (await response.json()) as FeatureCollection<Polygon | MultiPolygon, { ADM0_A3: string }>

// Shapes are keyed by ADM0_A3, not ISO_A3, which Natural Earth sets to -99 for some features (e.g. France, Norway, Kosovo).
const features = source.features.map((feature) => {
  const code = feature.properties.ADM0_A3
  return { ...feature, id: PARENT_COUNTRIES[code] ?? code, properties: null }
})

const collection: FeatureCollection = { type: 'FeatureCollection', features }
const world = topology({ shapes: collection }, 1e5)
const shapes = world.objects.shapes as GeometryCollection

// Merge features that now share an id, so each Country is one shape with no border inside it.
const geometriesById = new Map<string, GeometryObject[]>()
for (const geometry of shapes.geometries) {
  const id = String(geometry.id)
  geometriesById.set(id, [...(geometriesById.get(id) ?? []), geometry])
}
shapes.geometries = [...geometriesById].map(([id, geometries]) =>
  geometries.length === 1
    ? geometries[0]
    : { ...mergeArcs(world, geometries as Array<TopoPolygon | TopoMultiPolygon>), id },
)

writeFileSync(OUTPUT_URL, JSON.stringify(world))
console.log(`Wrote ${shapes.geometries.length} shapes to ${fileURLToPath(OUTPUT_URL)}`)
