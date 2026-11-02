// Builds the maps Terminus draws from Natural Earth's 1:50m shapes (see
// docs/adr/0001-own-svg-map-not-tile-library.md):
// - src/map/world-50m.json, the world map, from the admin-0 countries;
// - src/map/us-states-50m.json, the US map, from the admin-1 states in the variant with the Great Lakes cut out.
// Run with `pnpm map-data`. The output is committed, so builds and tests never need the network.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import { mergeArcs } from 'topojson-client'
import { topology } from 'topojson-server'
import type {
  GeometryCollection,
  GeometryObject,
  MultiPolygon as TopoMultiPolygon,
  Polygon as TopoPolygon,
} from 'topojson-specification'

const SOURCE_FOLDER_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/'

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

// The Natural Earth GeoJSON file with the given name, whose features have the given properties.
async function download<Properties>(fileName: string) {
  const url = SOURCE_FOLDER_URL + fileName
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Downloading ${url} failed: ${response.status}`)
  return (await response.json()) as FeatureCollection<Polygon | MultiPolygon, Properties>
}

// Writes the features to src/map as a map with one shape per id, which idOf reads from each feature's
// properties. The properties themselves are dropped.
function writeMap<Properties>(
  fileName: string,
  features: Feature<Polygon | MultiPolygon, Properties>[],
  idOf: (properties: Properties) => string,
) {
  const outputUrl = new URL(`../src/map/${fileName}`, import.meta.url)
  const collection: FeatureCollection = {
    type: 'FeatureCollection',
    features: features.map((feature) => ({ ...feature, id: idOf(feature.properties), properties: null })),
  }
  // Coordinates snap to a 50,000-step grid across the map's extent: about 0.007° of longitude on the
  // world map, under a pixel even at its deepest zoom. A finer grid only makes the file bigger.
  const mapTopology = topology({ shapes: collection }, 5e4)
  const shapes = mapTopology.objects.shapes as GeometryCollection

  // Merge features that share an id, so each one is one shape with no border inside it.
  const geometriesById = new Map<string, GeometryObject[]>()
  for (const geometry of shapes.geometries) {
    const id = String(geometry.id)
    geometriesById.set(id, [...(geometriesById.get(id) ?? []), geometry])
  }
  shapes.geometries = [...geometriesById].map(([id, geometries]) =>
    geometries.length === 1
      ? geometries[0]
      : { ...mergeArcs(mapTopology, geometries as Array<TopoPolygon | TopoMultiPolygon>), id },
  )

  writeFileSync(outputUrl, JSON.stringify(mapTopology))
  console.log(`Wrote ${shapes.geometries.length} shapes to ${fileURLToPath(outputUrl)}`)
}

const countries = await download<{ ADM0_A3: string }>('ne_50m_admin_0_countries.geojson')
// Shapes are keyed by ADM0_A3, not ISO_A3, which Natural Earth sets to -99 for some features (e.g. France, Norway, Kosovo).
// A dependent territory or breakaway region takes its Country's id, and so is merged into its shape.
writeMap('world-50m.json', countries.features, ({ ADM0_A3 }) => PARENT_COUNTRIES[ADM0_A3] ?? ADM0_A3)

const states = await download<{ adm0_a3: string; postal: string }>('ne_50m_admin_1_states_provinces_lakes.geojson')
// The 50 States and Washington, D.C., each keyed by its postal code (CA, NY, DC).
writeMap(
  'us-states-50m.json',
  states.features.filter((feature) => feature.properties.adm0_a3 === 'USA'),
  ({ postal }) => postal,
)
