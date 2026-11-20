import { useMemo, useSyncExternalStore } from 'react'
import { type Continent, countryIdsByContinent } from '../quiz/countriesOfTheContinents.ts'
import type { MapId, Quiz } from '../quiz/quiz.ts'
import { type MapLoader, mapLoader, shapesAt } from './mapLoader.ts'
import { edgeOf, type MapDefinition, type MapFrame, maps } from './maps.ts'
import type { MapShape } from './mapShapes.ts'
import { thinned } from './thinning.ts'

// A map, drawn small: its frame, cut down to the part a thumbnail shows, and every shape's outline.
interface Thumbnail {
  viewBox: string
  edge: MapFrame['edge']
  shapePaths: { id: string; d: string }[]
}

function thumbnailOf(definition: MapDefinition, shapes: MapShape[]): Thumbnail {
  const frame = definition.frame(shapes)
  // Whole units are a fraction of a pixel at a thumbnail's size.
  const path = frame.path.digits(0)
  const edge = frame.edge && edgeOf(path)
  const shapePaths = shapes.flatMap((shape) => {
    const d = path(shape)
    return d ? [{ id: shape.id, d }] : []
  })
  // A map with an edge is shown whole. The US and Canada maps, which have none, are cut down to their
  // shapes, as their frames leave room above and below them for the Attempt screen's panels.
  const [[x0, y0], [x1, y1]] = edge
    ? [
        [0, 0],
        [frame.width, frame.height],
      ]
    : path.bounds({ type: 'FeatureCollection', features: shapes })
  return { viewBox: `${x0} ${y0} ${x1 - x0} ${y1 - y0}`, edge, shapePaths }
}

// Each map data file's shapes, thinned out for thumbnails, once.
const thinnedByUrl = new Map<string, Promise<MapShape[]>>()

function thinnedShapesAt(url: string): Promise<MapShape[]> {
  let shapes = thinnedByUrl.get(url)
  if (!shapes) {
    shapes = shapesAt(url).then((full) => full.map(thinned))
    thinnedByUrl.set(url, shapes)
  }
  return shapes
}

// Yields to the browser, so working out each thumbnail is a task of its own and the home page stays
// responsive while they are.
const nextTask = () => new Promise((resolve) => setTimeout(resolve))

const thumbnailLoaders = Object.fromEntries(
  Object.entries(maps).map(([id, definition]) => [
    id,
    mapLoader(async () => {
      const shapes = await thinnedShapesAt(definition.dataUrl)
      await nextTask()
      return thumbnailOf(definition, shapes)
    }),
  ]),
) as Record<MapId, MapLoader<Thumbnail>>

// Starts drawing the thumbnails of the maps, ahead of showing them.
export function loadThumbnails(mapIds: Iterable<MapId>) {
  for (const id of mapIds) thumbnailLoaders[id].load()
}

const continentByCountryId = new Map(
  Object.entries(countryIdsByContinent).flatMap(([continent, ids]) => ids.map((id) => [id, continent as Continent])),
)

// The Continent whose tint a Place on the map is drawn in: the map's own Continent, North America for
// a State or Province, and on the world map, the Continent the Country is in.
function continentOf(map: MapId, placeId: string): Continent | undefined {
  if (map === 'world') return continentByCountryId.get(placeId)
  return map === 'us-states' || map === 'canada' ? 'north-america' : map
}

// A small picture of the map a Quiz is played on, as an atlas colours it: its Places in their
// Continent's tint, and every other shape as Territory. It only illustrates the Quiz card, so a screen
// reader skips it, and until the map data arrives, or if it can't, its space stays empty.
export function MapThumbnail({ quiz }: { quiz: Quiz }) {
  const loader = thumbnailLoaders[quiz.map]
  const thumbnail = useSyncExternalStore(loader.subscribe, loader.current)
  const classesById = useMemo(
    () =>
      new Map(
        quiz.places.map((place) => {
          const continent = continentOf(quiz.map, place.id)
          return [place.id, continent ? `place tint-${continent}` : 'place']
        }),
      ),
    [quiz.map, quiz.places],
  )
  return (
    <div className="map-thumbnail">
      {thumbnail && (
        <svg viewBox={thumbnail.viewBox} aria-hidden="true" focusable="false">
          {thumbnail.edge && (
            <>
              <path className="sea" d={thumbnail.edge.outline} />
              <path className="grid" d={thumbnail.edge.grid} />
            </>
          )}
          {thumbnail.shapePaths.map(({ id, d }) => (
            <path key={id} d={d} className={classesById.get(id) ?? 'territory'} />
          ))}
          {thumbnail.edge && <path className="map-outline" d={thumbnail.edge.outline} />}
        </svg>
      )}
    </div>
  )
}
