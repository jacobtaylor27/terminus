import { geoNaturalEarth1, geoPath } from 'd3-geo'
import type { GeoPermissibleObjects } from 'd3-geo'
import { select } from 'd3-selection'
import 'd3-transition' // adds selection.transition(), which animates the reset
import { type D3ZoomEvent, type ZoomBehavior, zoom, zoomIdentity } from 'd3-zoom'
import type { Polygon } from 'geojson'
import { type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Place } from '../quiz/quiz.ts'
import { type MapShape, mapShapes } from './mapShapes.ts'

const WIDTH = 960
const SPHERE: GeoPermissibleObjects = { type: 'Sphere' }
const MAX_ZOOM = 40
// A marker's radius at full-world zoom. Markers keep this size on screen as the map zooms.
const MARKER_RADIUS = 2.5
// A Country is too small to see at full-world zoom, so it gets a marker, when its largest piece
// of land covers less than this area of the map (about a 3 × 3 pixel square on a laptop screen).
const MIN_VISIBLE_AREA = 5

const projection = geoNaturalEarth1().fitWidth(WIDTH, SPHERE)
const path = geoPath(projection)
const HEIGHT = Math.ceil(path.bounds(SPHERE)[1][1])

// The projection never changes, so every shape's outline and marker is computed once.
const spherePath = path(SPHERE) ?? ''
const shapePaths = mapShapes.map((shape) => ({ id: shape.id, d: path(shape) ?? '' }))
const shapePathsById = new Map(shapePaths.map(({ id, d }) => [id, d]))
const markers = mapShapes.flatMap((shape) => {
  const position = markerPosition(shape)
  return position ? [{ id: shape.id, x: position[0], y: position[1] }] : []
})
const markersById = new Map(markers.map((marker) => [marker.id, marker]))

// The middle of the shape's largest piece of land, if even that is too small to see.
function markerPosition(shape: MapShape): [number, number] | undefined {
  const pieces: Polygon[] =
    shape.geometry.type === 'Polygon'
      ? [shape.geometry]
      : shape.geometry.coordinates.map((coordinates) => ({ type: 'Polygon', coordinates }))
  const largest = pieces.reduce((a, b) => (path.area(b) > path.area(a) ? b : a))
  return path.area(largest) < MIN_VISIBLE_AREA ? path.centroid(largest) : undefined
}

// A Country to draw the eye to briefly. Each new sequence number replays the animation, even for
// the same Country.
export interface Cue {
  id: string
  sequence: number
}

interface WorldMapProps {
  countries: readonly Place[]
  foundIds: ReadonlySet<string>
  // Countries to Reveal as Missed, once an Attempt has ended.
  missedIds: ReadonlySet<string> | null
  // Which Countries show their name on hover: only Found ones during an Attempt, or all of them.
  // Territories never do.
  tooltips: 'found' | 'all'
  // A newly Found Country, to pulse.
  pulse: Cue | null
  // An already-Found Country, to flash.
  flash: Cue | null
}

interface Hover {
  id: string
  x: number
  y: number
}

export function WorldMap({ countries, foundIds, missedIds, tooltips, pulse, flash }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown>>(null)
  const [transform, setTransform] = useState(zoomIdentity)
  const [hover, setHover] = useState<Hover | null>(null)

  const countryIds = useMemo(() => new Set(countries.map((place) => place.id)), [countries])
  const namesById = useMemo(() => new Map(countries.map((place) => [place.id, place.name])), [countries])

  useEffect(() => {
    const svg = select(svgRef.current!)
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_ZOOM])
      .translateExtent([
        [0, 0],
        [WIDTH, HEIGHT],
      ])
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        setTransform(event.transform)
        // A wheel zoom or the reset moves the map out from under a still pointer, so the tooltip
        // hides until the pointer moves again. A drag carries the hovered Country along with it.
        if (event.sourceEvent?.type !== 'mousemove') setHover(null)
      })
    svg.call(behavior)
    zoomRef.current = behavior
    return () => {
      svg.on('.zoom', null)
    }
  }, [])

  const hoverAt = useCallback((id: string, event: PointerEvent) => {
    const bounds = containerRef.current!.getBoundingClientRect()
    setHover({ id, x: event.clientX - bounds.left, y: event.clientY - bounds.top })
  }, [])
  const endHover = useCallback(() => setHover(null), [])

  // Re-rendered only when the Found or Missed Countries change, not on every zoom or pointer move.
  const shapeElements = useMemo(
    () =>
      shapePaths.map(({ id, d }) => (
        <path
          key={id}
          d={d}
          className={shapeClass(id, countryIds, foundIds, missedIds)}
          onPointerMove={(event) => hoverAt(id, event)}
          onPointerLeave={endHover}
        />
      )),
    [countryIds, foundIds, missedIds, hoverAt, endHover],
  )

  const markerRadius = MARKER_RADIUS / transform.k
  const hoveredName =
    hover && (tooltips === 'all' || foundIds.has(hover.id)) ? namesById.get(hover.id) : undefined

  function resetView() {
    select(svgRef.current!).transition().duration(600).call(zoomRef.current!.transform, zoomIdentity)
  }

  // Mousedowns on the map are kept from taking focus, so the answer box keeps it while the player
  // zooms, pans and resets the view. They're caught on the way down, as d3-zoom stops them bubbling.
  return (
    <div ref={containerRef} className="world-map" onMouseDownCapture={(event) => event.preventDefault()}>
      <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="World map">
        <g transform={transform.toString()}>
          <path className="sphere" d={spherePath} />
          {shapeElements}
          {markers
            .filter(({ id }) => countryIds.has(id))
            .map(({ id, x, y }) => (
              <circle
                key={id}
                cx={x}
                cy={y}
                r={markerRadius}
                className={`${shapeClass(id, countryIds, foundIds, missedIds)} marker`}
                onPointerMove={(event) => hoverAt(id, event)}
                onPointerLeave={endHover}
              />
            ))}
          {/* Overlays are drawn on top of every shape so their outlines aren't hidden by
              neighbours'; the keys remount them so their animations replay. */}
          {flash && <Overlay key={`flash-${flash.sequence}`} kind="flash" id={flash.id} markerRadius={markerRadius} />}
          {pulse && <Overlay key={`pulse-${pulse.sequence}`} kind="pulse" id={pulse.id} markerRadius={markerRadius} />}
          {hover && hoveredName && <Overlay kind="hovered" id={hover.id} markerRadius={markerRadius} />}
        </g>
      </svg>
      {hover && hoveredName && (
        <div className="map-tooltip" style={{ left: hover.x, top: hover.y }}>
          {hoveredName}
        </div>
      )}
      <button type="button" className="reset-view" onClick={resetView}>
        Reset view
      </button>
    </div>
  )
}

interface OverlayProps {
  kind: 'flash' | 'pulse' | 'hovered'
  id: string
  markerRadius: number
}

// A Country's whole shape, overseas parts included, and its marker if it has one.
function Overlay({ kind, id, markerRadius }: OverlayProps) {
  const marker = markersById.get(id)
  return (
    <g className={`overlay ${kind}`}>
      <path d={shapePathsById.get(id)} />
      {marker && <circle cx={marker.x} cy={marker.y} r={markerRadius} />}
    </g>
  )
}

function shapeClass(
  id: string,
  countryIds: ReadonlySet<string>,
  foundIds: ReadonlySet<string>,
  missedIds: ReadonlySet<string> | null,
) {
  if (!countryIds.has(id)) return 'territory'
  if (foundIds.has(id)) return 'country found'
  return missedIds?.has(id) ? 'country missed' : 'country'
}
