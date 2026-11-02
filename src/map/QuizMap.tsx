import type { GeoPath } from 'd3-geo'
import { select } from 'd3-selection'
import 'd3-transition' // adds selection.transition(), which animates the reset
import { type D3ZoomEvent, type ZoomBehavior, zoom, zoomIdentity } from 'd3-zoom'
import type { Polygon } from 'geojson'
import { type PointerEvent, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { MapId, Place } from '../quiz/quiz.ts'
import { type MapDefinition, type MapFrame, maps } from './maps.ts'
import { type MapShape, fetchMapShapes } from './mapShapes.ts'

const MAX_ZOOM = 40
// A marker's radius at full-map zoom. Markers keep this size on screen as the map zooms.
const MARKER_RADIUS = 2.5
// A Place is too small to see at full-map zoom, so it gets a marker, when its largest piece of land
// covers less than this area of the map (about a 3 × 3 pixel square on a laptop screen).
const MIN_VISIBLE_AREA = 5

interface Marker {
  id: string
  x: number
  y: number
}

// The map's frame, and every shape's outline and marker. The projection never changes, so they are
// computed once, when the map data arrives.
interface MapGeometry {
  frame: MapFrame
  shapePaths: { id: string; d: string }[]
  shapePathsById: ReadonlyMap<string, string>
  markers: Marker[]
  markersById: ReadonlyMap<string, Marker>
}

function geometryOf(definition: MapDefinition, shapes: MapShape[]): MapGeometry {
  const frame = definition.frame(shapes)
  const shapePaths = shapes.map((shape) => ({ id: shape.id, d: frame.path(shape) ?? '' }))
  const markers = shapes.flatMap((shape) => {
    const position = markerPosition(shape, frame.path)
    return position ? [{ id: shape.id, x: position[0], y: position[1] }] : []
  })
  return {
    frame,
    shapePaths,
    shapePathsById: new Map(shapePaths.map(({ id, d }) => [id, d])),
    markers,
    markersById: new Map(markers.map((marker) => [marker.id, marker])),
  }
}

// Loads one map's data, once, and tells its subscribers when it has.
interface MapLoader {
  // The map's geometry once it has loaded, or null if its data couldn't be fetched; undefined until then.
  geometry(): MapGeometry | null | undefined
  subscribe(listener: () => void): () => void
  // Starts loading the map, unless it already has.
  load(): void
}

function mapLoader(definition: MapDefinition): MapLoader {
  let geometry: MapGeometry | null | undefined
  let loadStarted = false
  const listeners = new Set<() => void>()

  function load() {
    if (loadStarted) return
    loadStarted = true
    fetchMapShapes(definition.dataUrl)
      .then((shapes) => geometryOf(definition, shapes))
      .catch(() => null)
      .then((loaded) => {
        geometry = loaded
        for (const listener of listeners) listener()
      })
  }

  return {
    geometry: () => geometry,
    subscribe(listener) {
      listeners.add(listener)
      load()
      return () => {
        listeners.delete(listener)
      }
    },
    load,
  }
}

const mapLoaders: Record<MapId, MapLoader> = {
  world: mapLoader(maps.world),
  'us-states': mapLoader(maps['us-states']),
}

// Starts loading every map. The app calls this as it starts, so the map is normally ready before the
// player starts an Attempt.
export function loadMaps() {
  for (const loader of Object.values(mapLoaders)) loader.load()
}

// The middle of the shape's largest piece of land, if even that is too small to see.
function markerPosition(shape: MapShape, path: GeoPath): [number, number] | undefined {
  const pieces: Polygon[] =
    shape.geometry.type === 'Polygon'
      ? [shape.geometry]
      : shape.geometry.coordinates.map((coordinates) => ({ type: 'Polygon', coordinates }))
  const largest = pieces.reduce((a, b) => (path.area(b) > path.area(a) ? b : a))
  return path.area(largest) < MIN_VISIBLE_AREA ? path.centroid(largest) : undefined
}

// A Place to draw the eye to briefly. Each new sequence number replays the animation, even for the
// same Place.
export interface ShapeAnimation {
  id: string
  sequence: number
}

interface QuizMapProps {
  // The map the Quiz is played on.
  map: MapId
  places: readonly Place[]
  foundIds: ReadonlySet<string>
  // Places to Reveal as Missed, once an Attempt has ended.
  missedIds: ReadonlySet<string> | null
  // Which Places show their name on hover: only Found ones during an Attempt, or all of them.
  // Territories never do.
  tooltips: 'found' | 'all'
  // A newly Found Place, to pulse.
  pulse: ShapeAnimation | null
  // An already-Found Place, to flash.
  flash: ShapeAnimation | null
  // Whether the Unfound Highlight is on, marking where every Unfound Place is without naming any.
  unfoundHighlight: boolean
}

interface Hover {
  id: string
  x: number
  y: number
}

export function QuizMap(props: QuizMapProps) {
  const loader = mapLoaders[props.map]
  const geometry = useSyncExternalStore(loader.subscribe, loader.geometry)
  if (geometry === undefined) return <MapMessage>Loading the map…</MapMessage>
  if (geometry === null) return <MapMessage>The map couldn't load. Reload the page to try again.</MapMessage>
  return <LoadedQuizMap {...props} geometry={geometry} />
}

// Stands in the map's place while it loads, or if it can't.
function MapMessage({ children }: { children: string }) {
  return (
    <div className="quiz-map">
      <p className="map-message">{children}</p>
    </div>
  )
}

interface LoadedQuizMapProps extends QuizMapProps {
  geometry: MapGeometry
}

function LoadedQuizMap({
  map,
  places,
  foundIds,
  missedIds,
  tooltips,
  pulse,
  flash,
  unfoundHighlight,
  geometry,
}: LoadedQuizMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown>>(null)
  const [transform, setTransform] = useState(zoomIdentity)
  const [hover, setHover] = useState<Hover | null>(null)
  const { width, height, oval } = geometry.frame

  const placeIds = useMemo(() => new Set(places.map((place) => place.id)), [places])
  const hoverTextsById = useMemo(() => new Map(places.map((place) => [place.id, hoverText(place)])), [places])

  useEffect(() => {
    const svg = select(svgRef.current!)
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_ZOOM])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        setTransform(event.transform)
        // A wheel zoom or the reset moves the map out from under a still pointer, so the tooltip
        // hides until the pointer moves again. A drag carries the hovered Place along with it.
        if (event.sourceEvent?.type !== 'mousemove') setHover(null)
      })
    svg.call(behavior)
    zoomRef.current = behavior
    return () => {
      svg.on('.zoom', null)
    }
  }, [width, height])

  const hoverAt = useCallback((id: string, event: PointerEvent) => {
    const bounds = containerRef.current!.getBoundingClientRect()
    setHover({ id, x: event.clientX - bounds.left, y: event.clientY - bounds.top })
  }, [])
  const endHover = useCallback(() => setHover(null), [])

  // Re-rendered only when the Found or Missed Places change, not on every zoom or pointer move.
  const shapeElements = useMemo(
    () =>
      geometry.shapePaths.map(({ id, d }) => (
        <path
          key={id}
          d={d}
          className={shapeClass(id, placeIds, foundIds, missedIds)}
          onPointerMove={(event) => hoverAt(id, event)}
          onPointerLeave={endHover}
        />
      )),
    [geometry, placeIds, foundIds, missedIds, hoverAt, endHover],
  )

  const markerRadius = MARKER_RADIUS / transform.k
  const hoveredText =
    hover && (tooltips === 'all' || foundIds.has(hover.id)) ? hoverTextsById.get(hover.id) : undefined
  // The Unfound Highlight is styled from a class on the whole map, so toggling it doesn't rebuild
  // the Place shapes.
  const mapClassName = unfoundHighlight ? 'quiz-map unfound-highlight' : 'quiz-map'

  function resetView() {
    select(svgRef.current!).transition().duration(600).call(zoomRef.current!.transform, zoomIdentity)
  }

  // Mousedowns on the map are kept from taking focus, so the answer box keeps it while the player
  // zooms, pans and resets the view. They're caught on the way down, as d3-zoom stops them bubbling.
  return (
    <div ref={containerRef} className={mapClassName} onMouseDownCapture={(event) => event.preventDefault()}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={maps[map].name}>
        <g transform={transform.toString()}>
          {oval && (
            <>
              <path className="sphere" d={oval.outline} />
              <path className="grid" d={oval.grid} />
            </>
          )}
          {shapeElements}
          {geometry.markers
            .filter(({ id }) => placeIds.has(id))
            .map(({ id, x, y }) => (
              <circle
                key={id}
                cx={x}
                cy={y}
                r={markerRadius}
                className={`${shapeClass(id, placeIds, foundIds, missedIds)} marker`}
                onPointerMove={(event) => hoverAt(id, event)}
                onPointerLeave={endHover}
              />
            ))}
          {/* The world oval's edge, over the land that meets it, such as Antarctica. */}
          {oval && <path className="oval-outline" d={oval.outline} />}
          {/* Overlays are drawn on top of every shape so their outlines aren't hidden by
              neighbours'; the keys remount them so their animations replay. */}
          {flash && (
            <Overlay
              key={`flash-${flash.sequence}`}
              kind="flash"
              id={flash.id}
              geometry={geometry}
              markerRadius={markerRadius}
            />
          )}
          {pulse && (
            <Overlay
              key={`pulse-${pulse.sequence}`}
              kind="pulse"
              id={pulse.id}
              geometry={geometry}
              markerRadius={markerRadius}
            />
          )}
          {hover && hoveredText && (
            <Overlay kind="hovered" id={hover.id} geometry={geometry} markerRadius={markerRadius} />
          )}
        </g>
      </svg>
      {hover && hoveredText && (
        <div className="map-tooltip" style={{ left: hover.x, top: hover.y }}>
          {hoveredText}
        </div>
      )}
      <button type="button" className="secondary-button frosted-panel reset-view" onClick={resetView}>
        Reset view
      </button>
    </div>
  )
}

// What hovering a Place shows: its name, and its prompt if it has one ("Sacramento, California").
function hoverText(place: Place): string {
  return place.prompt ? `${place.name}, ${place.prompt}` : place.name
}

interface OverlayProps {
  kind: 'flash' | 'pulse' | 'hovered'
  id: string
  geometry: MapGeometry
  markerRadius: number
}

// The whole shape a Place is joined to, overseas parts included, and its marker if it has one.
function Overlay({ kind, id, geometry, markerRadius }: OverlayProps) {
  const marker = geometry.markersById.get(id)
  return (
    <g className={`overlay ${kind}`}>
      <path d={geometry.shapePathsById.get(id)} />
      {marker && <circle cx={marker.x} cy={marker.y} r={markerRadius} />}
    </g>
  )
}

function shapeClass(
  id: string,
  placeIds: ReadonlySet<string>,
  foundIds: ReadonlySet<string>,
  missedIds: ReadonlySet<string> | null,
) {
  if (!placeIds.has(id)) return 'territory'
  if (foundIds.has(id)) return 'place found'
  return missedIds?.has(id) ? 'place missed' : 'place'
}
